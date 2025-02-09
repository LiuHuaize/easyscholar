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
      const response = await fetch(`/api/semanticsearch?query=${encodeURIComponent(query)}&limit=10&offset=0`)

      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      
      // 转换数据结构以匹配UI需求
      const transformedPapers = data.articles.map((paper: any) => ({
        paperId: paper.id,
        title: paper.title,
        authors: paper.authors.map((name: string) => ({ name })),
        abstract: paper.abstract,
        year: paper.year,
        venue: paper.journal,
        citationCount: 'N/A',  // Semantic Scholar API 没有返回引用数
        url: paper.openAccessPdf,
        keywords: paper.keywords
      }))
      
      setPapers(transformedPapers)
      setTotalResults(data.articles.length)
      
      // 搜索完成后，为每篇论文异步获取摘要
      transformedPapers.forEach((paper: any) => {
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
    <div className="min-h-screen bg-[#FAFBFC]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
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
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="flex-1 bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
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
                <div className="flex items-center h-14 px-4 md:px-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
                  <div className="w-6">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#0E5E5E]
                               focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                               hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#111827]">Paper</span>
                  </div>
                  <div className="w-[450px] flex-shrink-0 hidden lg:block">
                    <span className="text-sm font-medium text-[#111827]">Abstract summary</span>
                  </div>
                </div>

                {/* 论文列表内容 */}
                <div className="divide-y divide-[#F3F4F6]">
                  {papers.map((paper: any) => (
                    <div key={paper.paperId} className="flex flex-col lg:flex-row items-start p-4 md:p-6 hover:bg-[#F9FAFB] transition-colors group">
                      <div className="w-6 mt-[3px]">
                        <input 
                          type="checkbox" 
                          className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#0E5E5E]
                                   focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                                   hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                        />
                      </div>
                      <div className="flex-1 min-w-0 lg:pr-8 mt-0 lg:mt-0">
                        <div className="flex flex-col gap-3">
                          <h3 className="text-[14px] font-medium text-[#111827] leading-normal 
                                     hover:text-[#087B7B] cursor-pointer transition-colors">
                            {paper.title}
                          </h3>
                          
                          {/* 作者信息行 */}
                          <div className="flex items-center gap-2">
                            <div className="text-[#9CA3AF]">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </div>
                            <div className="flex items-center text-[#4B5563] text-[13px]">
                              <span>{paper.authors?.[0]?.name}</span>
                              {paper.authors?.length > 1 && (
                                <span className="ml-1 text-[#9CA3AF]">+{paper.authors.length - 1}</span>
                              )}
                            </div>
                          </div>

                          {/* 期刊信息行 */}
                          {paper.venue && (
                            <div className="flex items-center gap-2">
                              <div className="text-[#9CA3AF]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                                </svg>
                              </div>
                              <span className="text-[13px] text-[#4B5563] leading-normal break-words">{paper.venue}</span>
                            </div>
                          )}

                          {/* 年份和关键词信息行 */}
                          <div className="flex items-center gap-x-2 text-[13px] flex-wrap">
                            <span className="text-[#6B7280]">{paper.year}</span>
                            {paper.keywords && paper.keywords.length > 0 && (
                              <>
                                <span className="text-[#D1D5DB]">•</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {paper.keywords.map((keyword: string, index: number) => (
                                    <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                            {paper.url && (
                              <>
                                <span className="text-[#D1D5DB]">•</span>
                                <a 
                                  href={paper.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[#087B7B] hover:text-[#065e5e] transition-colors"
                                >
                                  <ExternalLink size={12} />
                                  <span>PDF</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-full lg:w-[450px] flex-shrink-0 text-sm text-[#4B5563] mt-4 lg:mt-0">
                        {loadingSummaries[paper.paperId] ? (
                          <div className="flex items-center gap-2 h-5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087B7B]" />
                            <span className="text-xs text-[#6B7280]">Generating summary...</span>
                          </div>
                        ) : summaries[paper.paperId] ? (
                          <p className="text-[#4B5563] leading-normal">
                            {summaries[paper.paperId]}
                          </p>
                        ) : (
                          <div className="h-5 flex items-center">
                            <span className="text-sm text-[#9CA3AF]">Cannot access the paper, unable to summarize</span>
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
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-4 bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#E5E7EB] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-medium text-[#111827]">Manage Columns</h3>
                <button className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] rounded-md hover:bg-[#F9FAFB] transition-colors">
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