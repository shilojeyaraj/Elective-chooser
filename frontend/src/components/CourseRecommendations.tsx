'use client'

import { CourseRecommendation } from '@/lib/types'

interface CourseRecommendationsProps {
  recommendations: CourseRecommendation[]
  sources: string[]
  usedWebSearch: boolean
}

export default function CourseRecommendations({ 
  recommendations, 
  sources, 
  usedWebSearch 
}: CourseRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Course Recommendations
        </h3>
        <div className="text-center text-chat-muted py-8">
          <div className="w-12 h-12 bg-chat-gray rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">📚</span>
          </div>
          <p>Ask me about electives to see personalized recommendations!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Recommended Courses
        </h3>
        {usedWebSearch && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
            Web Search Used
          </span>
        )}
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div key={rec.course.id} className="bg-chat-gray rounded-lg border border-chat-light p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium text-white">
                  {rec.course.id}: {rec.course.title}
                </h4>
                <p className="text-sm text-chat-muted">{rec.course.dept}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">
                  {rec.score}/100
                </div>
                <div className="text-xs text-chat-muted">Score</div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Key Info */}
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  rec.prereqs_met 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {rec.prereqs_met ? 'Prereqs ✓' : 'Prereqs ✗'}
                </span>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30">
                  Workload: {rec.workload_score}/10
                </span>
                {rec.next_offered.length > 0 && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs border border-purple-500/30">
                    {rec.next_offered.join(', ')}
                  </span>
                )}
              </div>

              {/* Description */}
              {rec.course.description && (
                <p className="text-sm text-chat-muted line-clamp-2">
                  {rec.course.description}
                </p>
              )}

              {/* Skills */}
              {rec.course.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {rec.course.skills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-chat-light text-chat-muted rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Explanation */}
              <div className="space-y-1">
                {rec.explanation.map((explanation, expIndex) => (
                  <div key={expIndex} className="text-xs text-chat-muted flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    <span>{explanation}</span>
                  </div>
                ))}
              </div>

              {/* Counts Toward */}
              {rec.counts_toward.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium text-white">Counts toward: </span>
                  <span className="text-blue-400">
                    {rec.counts_toward.join(', ')}
                  </span>
                </div>
              )}

              {/* Source Link */}
              {rec.course.source_url && (
                <a
                  href={rec.course.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  View official page →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="mt-6 pt-4 border-t border-chat-light">
          <h4 className="text-sm font-medium text-white mb-2">Sources</h4>
          <div className="space-y-1">
            {sources.map((source, index) => (
              <a
                key={index}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 block truncate underline"
              >
                {source}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
