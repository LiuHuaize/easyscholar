'use client'

import { Search, ChevronDown, Filter, Globe, ChevronRight, Plus, Settings2, Edit2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function NotebooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const searchParams = useSearchParams()

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) throw new Error('Search failed')
      const data = await response.json()
      setPapers(data.papers)
      setTotalResults(data.total)
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
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
            {/* 预留 Summary 空间 */}
          </div>
        </div>

        {/* 搜索区域 */}
        <div className="py-4">
          <div className="relative w-full max-w-3xl">
            <input
              type="text"
              placeholder="Search papers..."
              className="w-full h-10 pl-9 pr-4 
                 bg-white
                 border border-gray-100
                 rounded-full
                 text-[15px] text-gray-900
                 placeholder:text-gray-400
                 shadow-sm
                 transition-all duration-200
                 hover:border-gray-200
                 focus:outline-none focus:ring-1 
                 focus:ring-[#087B7B] focus:border-[#087B7B]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 
                    text-gray-400 pointer-events-none">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Sort 按钮 */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <span>Sort: Most relevant</span>
              <ChevronDown size={14} />
            </button>

            {/* Filters 按钮 */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Filter size={14} />
              <span>Filters</span>
            </button>

            {/* Export as 按钮 */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                <span>Export as</span>
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Translate 按钮 */}
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Globe size={14} />
              <span>Translate</span>
            </button>
          </div>

          {/* 结果计数 */}
          <div className="text-sm text-gray-500">
            Found {totalResults.toLocaleString()} papers
          </div>
        </div>

        {/* 表格区域 */}
        <div className="flex mt-2">
          <div className="flex-1 pr-6">
            {/* 表头 */}
            <div className="grid grid-cols-12 py-2.5 bg-gray-50 border-y border-gray-100">
              <div className="col-span-1 pl-4">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 rounded border-gray-300 text-[#087B7B] 
                             focus:ring-1 focus:ring-[#087B7B] focus:ring-offset-0" 
                />
              </div>
              <div className="col-span-7 text-sm font-medium text-gray-500">Paper</div>
              <div className="col-span-4 text-sm font-medium text-gray-500">Abstract summary</div>
            </div>

            {/* 论文列表 */}
            <div className="divide-y divide-gray-50">
              {papers.map((paper: any) => (
                <div key={paper.paperId} className="grid grid-cols-12 py-4 hover:bg-gray-50/50 transition-colors group">
                  <div className="col-span-1 pl-4">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#087B7B] 
                                 focus:ring-1 focus:ring-[#087B7B] focus:ring-offset-0" 
                    />
                  </div>
                  <div className="col-span-7 pr-8">
                    <h3 className="text-[15px] font-medium text-gray-900 leading-snug mb-2 
                                 hover:text-[#087B7B] cursor-pointer transition-colors">
                      {paper.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700">{paper.authors?.[0]?.name}</span>
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
                    </div>
                  </div>
                  <div className="col-span-4 text-sm text-gray-600 leading-relaxed">
                    {'No summary available'}
                  </div>
                </div>
              ))}
            </div>
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
                  className="w-full h-9 pl-8 pr-3 text-sm 
                           bg-gray-50 border-0
                           rounded-md
                           placeholder:text-gray-400 
                           focus:outline-none focus:ring-1 focus:ring-[#087B7B]
                           transition-all"
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
                      <button className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 
                                     hover:text-gray-600 rounded-md hover:bg-gray-50 transition-all">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    ADD COLUMNS
                  </div>
                  <div className="space-y-2">
                    {['Main findings', 'Methodology', 'Intervention'].map((item) => (
                      <button 
                        key={item}
                        className="w-full flex items-center gap-2 py-1 text-sm text-gray-600 
                                 hover:text-gray-900 transition-colors group"
                      >
                        <Plus size={14} className="text-gray-400 group-hover:text-gray-600" />
                        <span>{item}</span>
                      </button>
                    ))}
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