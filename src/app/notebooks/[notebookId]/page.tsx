'use client'

import { Search, ChevronDown, Filter, Globe, ChevronRight, Plus, Settings2, Edit2, Loader2, ExternalLink } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function NotebooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [summaries, setSummaries] = useState<{[key: string]: string}>({})
  const [loadingSummaries, setLoadingSummaries] = useState<{[key: string]: boolean}>({})
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  const fetchSummary = async (paper: any) => {
    if (!paper.abstract || loadingSummaries[paper.paperId]) return
    
    try {
      setLoadingSummaries(prev => ({ ...prev, [paper.paperId]: true }))
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: [paper] }),
      })

      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      
      if (data.summaries?.[0]?.summary) {
        setSummaries(prev => ({
          ...prev,
          [paper.paperId]: data.summaries[0].summary
        }))
      }
    } catch (error) {
      console.error('Summary error:', error)
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [paper.paperId]: false }))
    }
  }

  const handleSearch = async (query: string) => {
    if (!query) return
    try {
      setIsLoading(true)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setPapers(data.papers)
      setTotalResults(data.total)
      
      // 搜索完成后，为每篇论文异步获取摘要
      data.papers.forEach((paper: any) => {
        fetchSummary(paper)
      })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      if (isFirstRender.current) {
        handleSearch(query)
        isFirstRender.current = false
      }
    } else {
      setIsLoading(false)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-screen-xl mx-auto px-6">
        {/* Summary of top papers */}
        <div className="py-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-900">Summary of top</h2>
              <button className="flex items-center gap-1 text-sm text-gray-600">
                4 papers
                <ChevronDown size={14} />
              </button>
            </div>
            <button className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md border border-gray-200">
              Copy
            </button>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed min-h-[60px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Generating summary...</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* 搜索区域 */}
        <div className="py-4">
          <div className="relative w-full max-w-3xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="w-full h-10 pl-9 pr-4 bg-white border border-gray-100 rounded-full text-[15px] text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 hover:border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#087B7B] focus:border-[#087B7B]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <span>Sort: Most relevant</span>
              <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Globe size={14} />
              <span>Translate</span>
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Found {totalResults.toLocaleString()} papers
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex mt-2">
          <div className="flex-1 pr-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#087B7B] rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Searching papers...</h3>
                  <p className="text-sm text-gray-500">This might take a few seconds</p>
                </div>
              </div>
            ) : papers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No papers found</h3>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                {/* 论文列表表头 */}
                <div className="flex items-center h-12 mb-2 border-b border-gray-100">
                  <div className="w-6 ml-4">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-200 accent-[#0E5E5E]
                               focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                               hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 pr-6">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Paper</span>
                  </div>
                  <div className="w-[400px]">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Summary</span>
                  </div>
                </div>

                {/* 论文列表内容 */}
                <div className="divide-y divide-gray-50">
                  {papers.map((paper: any) => (
                    <div key={paper.paperId} className="flex items-start py-4 hover:bg-gray-50/50 transition-colors group">
                      <div className="w-6 ml-4 mt-[3px]">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-gray-200 accent-[#0E5E5E]
                                   focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                                   hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex flex-col gap-2">
                          <h3 className="text-[14px] font-medium text-gray-800 leading-normal 
                                     hover:text-[#087B7B] cursor-pointer transition-colors">
                            {paper.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-600">{paper.authors?.[0]?.name}</span>
                              {paper.authors?.length > 1 && (
                                <span className="ml-1 text-sm text-gray-400">+{paper.authors.length - 1}</span>
                              )}
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-500">{paper.year}</span>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-500">{paper.citationCount}</span>
                              <span className="text-sm text-gray-500">citations</span>
                            </div>
                            {paper.doi && (
                              <>
                                <span className="text-gray-300">•</span>
                                <a 
                                  href={`https://doi.org/${paper.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-gray-500 hover:text-[#087B7B] flex items-center gap-1"
                                >
                                  DOI
                                  <ExternalLink size={12} className="inline-block" />
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-[400px] text-sm text-gray-600 pt-[2px]">
                        {loadingSummaries[paper.paperId] ? (
                          <div className="flex items-center gap-2 h-5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087B7B]" />
                            <span className="text-xs text-gray-500">Generating summary...</span>
                          </div>
                        ) : summaries[paper.paperId] ? (
                          <p className="text-gray-600 leading-normal">
                            {summaries[paper.paperId]}
                          </p>
                        ) : (
                          <div className="h-5 flex items-center">
                            <span className="text-sm text-gray-400">No summary available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 右侧列管理区域 */}
          <div className="w-72 flex-shrink-0 border-l pl-6">
            <div className="sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-medium text-gray-900">Manage Columns</h3>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors">
                  <Settings2 size={14} />
                </button>
              </div>

              <div className="mb-6 relative">
                <input
                  type="text"
                  placeholder="Search or create a column"
                  className="w-full h-9 pl-8 pr-3 text-sm bg-gray-50 border-0 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#087B7B] transition-all"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    CURRENT COLUMNS
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between group py-1">
                      <span className="text-sm text-gray-900">Summary</span>
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-all">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 