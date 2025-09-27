import csv

with open('CSE_s (1).csv', 'r', encoding='utf-8') as file:
    reader = csv.reader(file)
    header = next(reader)
    print('Header:', header)
    
    for i, row in enumerate(reader):
        if i < 3:
            print(f'Row {i}:', row[0][:100])
        else:
            break
