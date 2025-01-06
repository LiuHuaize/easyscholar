'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, ChevronDown, Globe } from 'lucide-react'

export default function NotebooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [papers, setPapers] = useState([])
  const [totalResults, setTotalResults] = useState(0)
  const searchParams = useSearchParams()

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setPapers(data.papers)
      setTotalResults(data.total)
      
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  // 从URL参数获取搜索词并执行搜索
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航栏 */}
      <div className="flex items-center p-4 border-b">
        <div className="flex items-center flex-1 space-x-4">
          <h1 className="text-xl font-semibold">ResearchAI</h1>
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            📓 Notebooks
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-white bg-teal-600 rounded-md">
            Upgrade
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            ?
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            👤
          </button>
        </div>
      </div>

      {/* 搜索区域 */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="llm"
            className="w-full p-2 pl-10 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchQuery)
              }
            }}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>
      </div>

      {/* 过滤和排序工具栏 */}
      <div className="flex items-center px-4 py-2 space-x-4 border-b">
        <div className="flex items-center space-x-2">
          <span>Sort: Most relevant</span>
          <ChevronDown size={16} />
        </div>
        <button className="flex items-center space-x-2 px-3 py-1 border rounded-md">
          <Filter size={16} />
          <span>Filters</span>
        </button>
        <button className="flex items-center space-x-2 px-3 py-1 border rounded-md">
          <span>Columns</span>
          <ChevronDown size={16} />
        </button>
        <button className="flex items-center space-x-2 px-3 py-1 border rounded-md">
          <Globe size={16} />
          <span>Translate</span>
          <ChevronDown size={16} />
        </button>
        <div className="flex-1 text-right text-gray-600">
          Found {totalResults} papers
        </div>
      </div>

      {/* 论文列表表头 */}
      <div className="grid grid-cols-12 px-4 py-2 border-b text-gray-600">
        <div className="col-span-1">
          <input type="checkbox" className="rounded" />
        </div>
        <div className="col-span-5">Paper</div>
        <div className="col-span-3">Summary of Abstract</div>
        <div className="col-span-3">Abstract</div>
      </div>

      {/* 论文列表 */}
      <div className="divide-y">
        {papers.map((paper: any) => (
          <div key={paper.paperId} className="grid grid-cols-12 px-4 py-4 hover:bg-gray-50">
            <div className="col-span-1">
              <input type="checkbox" className="rounded" />
            </div>
            <div className="col-span-5">
              <h3 className="font-medium">{paper.title}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <span>{paper.authors?.[0]?.name}</span>
                {paper.authors?.length > 1 && <span>+{paper.authors.length - 1}</span>}
                <span>•</span>
                <span>{paper.year}</span>
                <span>•</span>
                <span>{paper.citationCount} citations</span>
              </div>
            </div>
            <div className="col-span-3 text-sm text-gray-600">
              {paper.summary || 'No summary available'}
            </div>
            <div className="col-span-3 text-sm text-gray-600">
              {paper.abstract || 'No abstract available'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 