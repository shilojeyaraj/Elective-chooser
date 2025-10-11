#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
UW Academic Calendar Scraper (No API)
=====================================

Scrapes the official Waterloo Undergraduate Calendar pages to fill in:
- title, description, prereqs, terms_offered, source_url

Input JSON format: grouped by department (your current structure).

Example:
    python uw_calendar_scraper.py --in AllDepartments_complete.json --out AllDepartments_SCRAPED.json --sections CS ME ECE

Install:
    pip install -U httpx beautifulsoup4 tenacity

Notes:
- Handles course codes with suffix letters (e.g., ECE405A).
- Uses a forgiving parser; still, calendar markup changes by subject. There is a SUBJECT_PAGE_MAP to override page names if needed.
- If a field cannot be found, it will be left as-is.
"""
import argparse
import asyncio
import json
import os
import re
from typing import Dict, Any, List, Optional, Tuple

import httpx
from bs4 import BeautifulSoup
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

CAL_BASE = "https://ucalendar.uwaterloo.ca/2324/COURSE"

# Override map in case a subject's page slug differs from the subject code
SUBJECT_PAGE_MAP = {
    # "BET": "course-BUS",  # example of how to override if needed
}

def subject_page_url(subject: str) -> str:
    page_slug = SUBJECT_PAGE_MAP.get(subject.upper(), f"course-{subject.upper()}")
    return f"{CAL_BASE}/{page_slug}.html"

def dept_from_id(cid: str) -> str:
    m = re.match(r"^[A-Za-z]+", cid)
    return m.group(0).upper() if m else cid[:3].upper()

def num_from_id(cid: str) -> Optional[str]:
    # capture digits + optional trailing letter (e.g., 405A)
    m = re.search(r"(\d+[A-Za-z]?)$", cid.strip())
    return m.group(1) if m else None

def normalize_terms(text: str) -> List[str]:
    s = set()
    low = text.lower()
    if "fall" in low or re.search(r"\bF\b", text):
        s.add("F")
    if "winter" in low or re.search(r"\bW\b", text):
        s.add("W")
    if "spring" in low or "summer" in low or re.search(r"\bS\b", text):
        s.add("S")
    return sorted(s) or ["F","W","S"]

@retry(wait=wait_exponential(multiplier=0.5, min=1, max=8),
       stop=stop_after_attempt(5),
       retry=retry_if_exception_type(httpx.HTTPError))
async def fetch_text(url: str, timeout: int = 30) -> str:
    async with httpx.AsyncClient(timeout=timeout, headers={"Accept": "text/html"}) as client:
        r = await client.get(url)
        r.raise_for_status()
        return r.text

def extract_block_for_course(text: str, subject: str, catalog: str) -> str:
    """
    Extract a text window starting at "{SUBJECT} {CATALOG}" until the next course header.
    Course headers look like e.g. 'CS 480' at line starts.
    """
    # Normalize whitespace
    lines = [ln.strip() for ln in text.splitlines()]
    txt = "\n".join(lines)
    start_pat = re.compile(rf"(?m)^{re.escape(subject)}\s+{re.escape(catalog)}\b.*$")
    start = start_pat.search(txt)
    if not start:
        return ""
    start_idx = start.start()

    # End at the next course header for the same subject or any subject (heuristic)
    end_pat = re.compile(rf"(?m)^(?:[A-Z]{{2,5}})\s+\d+[A-Za-z]?\b.*$")
    end = end_pat.search(txt, pos=start.end()+1)
    if not end:
        window = txt[start_idx:]
    else:
        window = txt[start_idx:end.start()]
    return window.strip()

def parse_course_block(block: str, subject: str, catalog: str) -> Tuple[Optional[str], Optional[str], Optional[str], List[str]]:
    """
    Parse a course block to title, description, prereqs, terms.
    The first line is assumed to contain "SUBJECT CATALOG - Title".
    """
    if not block:
        return None, None, None, []

    lines = [ln for ln in block.split("\n") if ln.strip()]
    if not lines:
        return None, None, None, []

    header = lines[0]
    # Title is whatever follows 'SUBJECT CATALOG -' or '—' variants
    title = None
    m = re.search(rf"^{re.escape(subject)}\s+{re.escape(catalog)}\s*[-–—]\s*(.+)$", header)
    if m:
        title = m.group(1).strip()
    else:
        # Sometimes title is just after the code without dash
        maybe = header.replace(f"{subject} {catalog}", "").strip(" -–—:")
        title = maybe if maybe else None

    # Description: collect lines until a keyword appears
    desc_lines = []
    prereq_line = None
    terms_line = None
    for ln in lines[1:]:
        low = ln.lower()
        if low.startswith("prereq") or low.startswith("antireq") or low.startswith("coreq"):
            if prereq_line is None:
                prereq_line = ln
            continue
        if low.startswith("offered") or "offered" in low:
            terms_line = ln
            continue
        desc_lines.append(ln)

    description = " ".join(desc_lines).strip() if desc_lines else None
    prereqs = prereq_line
    terms = normalize_terms(terms_line) if terms_line else []

    # Sanity cleanup
    if title:
        title = re.sub(r"\s+", " ", title).strip(" .")
    if description:
        description = re.sub(r"\s+", " ", description).strip()

    return title, description, prereqs, terms

async def update_from_calendar(grouped: Dict[str, List[Dict[str, Any]]], sections: List[str]=None, dry_run: bool=False) -> Dict[str, List[Dict[str, Any]]]:
    sections_set = set(s.upper() for s in (sections or []))
    subjects_to_fetch = sorted(set(
        dept_from_id(c["id"]) 
        for dept, arr in grouped.items()
        for c in arr
        if (not sections_set or dept in sections_set)
    ))

    # Fetch all subject pages
    subject_html: Dict[str, str] = {}
    for subj in subjects_to_fetch:
        if sections_set and subj not in sections_set:
            continue
        url = subject_page_url(subj)
        try:
            html = await fetch_text(url)
            subject_html[subj] = html
        except Exception as e:
            print(f"[WARN] Failed to fetch {url}: {e}")

    # Update entries
    updated = 0
    for dept, arr in grouped.items():
        if sections_set and dept not in sections_set:
            continue
        for entry in arr:
            cid = entry.get("id","")
            subj = dept_from_id(cid)
            catalog = num_from_id(cid)
            if not catalog:
                continue

            # Skip if already has non-placeholder title/description
            t = entry.get("title","")
            d = entry.get("description","")
            needs_title = ("Course Title" in t) or ("Title pending" in t) or (t.strip()=="" or t.strip().endswith(" - Course Title"))
            needs_desc  = ("Official description not yet retrieved" in d) or (d.strip()=="" or d.startswith("Description for "))

            if not (needs_title or needs_desc):
                continue

            html = subject_html.get(subj)
            if not html:
                continue

            text = BeautifulSoup(html, "html.parser").get_text("\n", strip=True)
            block = extract_block_for_course(text, subj, catalog)
            if not block:
                continue

            title, description, prereqs, terms = parse_course_block(block, subj, catalog)

            changed = False
            if title and needs_title:
                entry["title"] = f"{cid} - {title}"
                changed = True
            if description and needs_desc:
                entry["description"] = description
                changed = True
            if prereqs:
                entry["prereqs"] = prereqs
                changed = True
            if terms:
                entry["terms_offered"] = terms
                changed = True
            if changed:
                entry["source_url"] = subject_page_url(subj)
                updated += 1
                print(f"[OK] Updated {cid}")

    print(f"[DONE] Updated {updated} entries from calendar pages.")
    return grouped

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="in_path", required=True, help="Input JSON (grouped by department)")
    ap.add_argument("--out", dest="out_path", required=True, help="Output JSON path")
    ap.add_argument("--sections", nargs="*", default=[], help="Department codes to process (e.g., CS ME ECE). Default: all depts in input")
    ap.add_argument("--dry-run", action="store_true", help="Only print changes, do not write output")
    args = ap.parse_args()

    with open(args.in_path, "r", encoding="utf-8") as f:
        grouped = json.load(f)

    grouped2 = await update_from_calendar(grouped, sections=args.sections, dry_run=args.dry_run)

    if args.dry_run:
        print("[DRY-RUN] Not writing output file.")
        return

    with open(args.out_path, "w", encoding="utf-8") as f:
        json.dump(grouped2, f, indent=2, ensure_ascii=False)

    print(f"[WRITE] Saved: {args.out_path}")

if __name__ == "__main__":
    asyncio.run(main())
