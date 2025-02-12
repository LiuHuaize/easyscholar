'use client'

import { Search, ChevronDown, Filter, Globe, ChevronRight, Plus, Settings2, Edit2, Loader2, ExternalLink } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import CitationButton from '@/components/CitationButton'

export default function NotebooksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDisabled, setIsSearchDisabled] = useState(false)
  const [papers, setPapers] = useState<any[]>([])
  const [summaries, setSummaries] = useState<{[key: string]: string}>({})
  const [loadingSummaries, setLoadingSummaries] = useState<{[key: string]: boolean}>({})
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordResults, setKeywordResults] = useState<{[key: string]: any[]}>({})
  const [loadingKeywords, setLoadingKeywords] = useState<{[key: string]: boolean}>({})
  const [insightContent, setInsightContent] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)

  const formatTitle = (title: string) => {
    const maxCharsPerLine = 60; // 每行最大字符数
    const words = title.split(/\s+/).filter(word => word.length > 0);
    const lines: string[] = [];
    let currentLine: string[] = [];
    let currentLength = 0;
    
    for (const word of words) {
      // 加1是为了计入空格
      if (currentLength + word.length + 1 > maxCharsPerLine && currentLine.length > 0) {
        lines.push(currentLine.join(' '));
        currentLine = [word];
        currentLength = word.length;
      } else {
        currentLine.push(word);
        currentLength += (currentLine.length === 1 ? word.length : word.length + 1);
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }
    
    return lines.join('\n');
  };

  const generateInsight = async (query: string, papers: any[]) => {
    try {
      setInsightLoading(true);
      const validPapers = papers.filter(paper => 
        paper.abstract && paper.abstract !== "No abstract provided"
      );

      if (validPapers.length === 0) return;

      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          papers: validPapers
        })
      });

      if (!response.ok) throw new Error('Failed to generate insight');
      const { insight } = await response.json();
      
      setInsightContent(insight);
    } catch (error) {
      console.error('Insight generation error:', error);
      setInsightContent('无法生成研究洞察');
    } finally {
      setInsightLoading(false);
    }
  };

  const fetchSummary = async (paper: any) => {
    if (loadingSummaries[paper.paperId]) return;
    
    try {
      setLoadingSummaries(prev => ({ ...prev, [paper.paperId]: true }));
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: [paper] }),
      });

      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      
      if (data.summaries?.[0]?.summary) {
        setSummaries(prev => ({
          ...prev,
          [paper.paperId]: data.summaries[0].summary
        }));
      } else if (data.summaries?.[0]?.error) {
        setSummaries(prev => ({
          ...prev,
          [paper.paperId]: "Error generating summary"
        }));
      }
    } catch (error) {
      console.error('Summary error:', error);
      setSummaries(prev => ({
        ...prev,
        [paper.paperId]: "Error generating summary"
      }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [paper.paperId]: false }));
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || isSearchDisabled) return
    try {
      setIsSearchDisabled(true)
      setIsLoading(true)
      setIsGeneratingKeywords(true)
      setKeywords([])
      setKeywordResults({})
      setPapers([])
      setLoadingKeywords({})
      setInsightContent('')
      setInsightLoading(false)
      
      // 生成关键词
      const keywordsRes = await fetch('/api/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });
      
      if (!keywordsRes.ok) throw new Error('Failed to generate keywords');
      const { keywords: generatedKeywords } = await keywordsRes.json();
      
      // 设置所有关键词的初始加载状态为true
      const initialLoadingState = generatedKeywords.reduce((acc: any, keyword: string) => {
        acc[keyword] = true;
        return acc;
      }, {});
      setLoadingKeywords(initialLoadingState);
      
      setKeywords(generatedKeywords);
      setIsGeneratingKeywords(false)
      setIsLoading(false)

      // 创建一个Map来存储已经显示的论文ID，避免重复
      const displayedPaperIds = new Set();
      let allPapers: any[] = [];
      
      // 并行处理每个关键词的搜索
      const searchPromises = generatedKeywords.map(async (keyword: string) => {
        try {
          const searchType = localStorage.getItem('notebookSearchType') || 'papers';
          const apiEndpoint = searchType === 'papers' ? '/api/semanticsearch' : '/api/websearch';
          const response = await fetch(`${apiEndpoint}?query=${encodeURIComponent(keyword)}&limit=4&offset=0`);
          
          if (!response.ok) throw new Error(`Search failed for keyword: ${keyword}`);
          const data = await response.json();
          
          const transformedPapers = data.articles
            .map((paper: any) => ({
              paperId: paper.id,
              title: paper.title,
              authors: paper.authors.map((name: string) => ({ name })),
              abstract: paper.abstract,
              year: paper.year,
              venue: paper.journal,
              citationCount: 'N/A',
              url: paper.openAccessPdf,
              keywords: paper.keywords,
              searchKeyword: keyword
            }))
            .filter((paper: any) => !displayedPaperIds.has(paper.paperId));

          transformedPapers.forEach((paper: any) => {
            displayedPaperIds.add(paper.paperId);
          });

          setKeywordResults(prev => ({
            ...prev,
            [keyword]: transformedPapers
          }));

          allPapers = [...allPapers, ...transformedPapers];
          setPapers(prev => {
            const newPapers = [...prev, ...transformedPapers];
            setTotalResults(newPapers.length);
            return newPapers;
          });

          // 更新该关键词的加载状态为false
          setLoadingKeywords(prev => ({
            ...prev,
            [keyword]: false
          }));

          // 获取摘要
          await Promise.all(transformedPapers.map(paper => {
            if (!paper.abstract) {
              setSummaries(prev => ({
                ...prev,
                [paper.paperId]: "No abstract provided"
              }));
              return Promise.resolve();
            }
            return fetchSummary(paper);
          }));
        } catch (error) {
          console.error(`Search error for keyword ${keyword}:`, error);
          setKeywordResults(prev => ({
            ...prev,
            [keyword]: []
          }));
          setLoadingKeywords(prev => ({
            ...prev,
            [keyword]: false
          }));
        }
      });

      // 等待所有搜索完成
      await Promise.all(searchPromises);
      
      // 在所有论文加载完成后生成Insight
      if (allPapers.length > 0) {
        await generateInsight(query, allPapers);
      }
      
    } catch (error) {
      console.error('Search error:', error)
      setIsLoading(false)
      setIsGeneratingKeywords(false)
    }
  }

  useEffect(() => {
    // 从localStorage获取搜索文本
    if (typeof window !== 'undefined' && isFirstRender.current) {
      const savedQuery = localStorage.getItem('notebookSearchQuery');
      if (savedQuery) {
        setSearchQuery(savedQuery);
        setIsSearchDisabled(true);
        handleSearch(savedQuery);
        // 清除存储的搜索文本和类型
        localStorage.removeItem('notebookSearchQuery');
        localStorage.removeItem('notebookSearchType');
      } else {
        // 只有在没有savedQuery时才设置isLoading为false
        setIsLoading(false);
      }
      isFirstRender.current = false;
    }
  }, []); // 空依赖数组确保只执行一次

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        {/* 搜索区域 */}
        <div className="py-8">
          <div className="relative w-full max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => !isSearchDisabled && setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder={isSearchDisabled ? "搜索已完成" : "输入研究问题，AI将生成关键词并搜索相关论文..."}
                disabled={isSearchDisabled}
                className={`w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl text-[16px] text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 
                          ${isSearchDisabled 
                            ? 'bg-gray-50 cursor-not-allowed opacity-75' 
                            : 'hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#087B7B]/20 focus:border-[#087B7B]'
                          }`}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className={`w-5 h-5 stroke-[1.5] ${isSearchDisabled ? 'opacity-50' : ''}`} />
              </div>
              {!isSearchDisabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">
                  Press Enter ↵
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 关键词展示 */}
        {keywords.length > 0 && (
          <div className="flex items-center gap-2 py-3 border-b border-gray-100">
            <span className="text-[15px] text-gray-500">搜索关键词：</span>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span 
                  key={index}
                  className="px-2.5 py-1 bg-[#F0F9F9] text-[#087B7B] text-sm rounded-full border border-[#E5F2F2] hover:bg-[#E5F2F2] transition-colors"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Insight 区域 - 移到搜索结果上方 */}
        {(insightContent || insightLoading || (keywords.length > 0 && !isLoading)) && (
          <div className="my-6 p-6 bg-white rounded-lg border border-[#E5F2F2] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#087B7B]">
                <path d="M12 2v8"/>
                <path d="m16 6-4-4-4 4"/>
                <path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z"/>
                <path d="M7 15h10"/>
                <path d="M7 19h10"/>
              </svg>
              <h3 className="text-lg font-medium text-[#111827]">研究洞察</h3>
            </div>
            {insightContent ? (
              <div className="text-[#4B5563] leading-relaxed whitespace-pre-line">
                {insightContent}
              </div>
            ) : insightLoading ? (
              <div className="flex items-center gap-3 text-[#087B7B]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span>正在生成研究洞察...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>等待搜索完成后生成研究洞察...</span>
              </div>
            )}
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[15px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <span>Sort: Most relevant</span>
              <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[15px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[15px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
              <Globe size={14} />
              <span>Translate</span>
            </button>
          </div>
          <div className="text-[15px] text-gray-500">
            Found {totalResults.toLocaleString()} papers
          </div>
        </div>

        {/* 内容区域 */}
        <div className="mt-6">
          <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] border border-[#E5E7EB]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#087B7B] rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {isGeneratingKeywords ? "生成搜索关键词..." : "搜索相关论文..."}
                  </h3>
                  <p className="text-[15px] text-gray-500">
                    {isGeneratingKeywords ? "AI正在分析您的问题" : "这可能需要几秒钟时间"}
                  </p>
                </div>
              </div>
            ) : papers.length === 0 && keywords.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">正在搜索论文...</h3>
                <p className="text-[15px] text-gray-500">请稍候，论文将逐步显示</p>
              </div>
            ) : papers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">输入您的研究问题</h3>
                <p className="text-[15px] text-gray-500">AI将帮您找到相关论文</p>
              </div>
            ) : (
              <>
                {/* 论文列表表头 */}
                <div className="flex items-center h-14 px-6 border-b border-[#E5E7EB] bg-white sticky top-0 z-10">
                  <div className="w-6">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#0E5E5E]
                               focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                               hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[15px] font-medium text-[#111827]">Paper</span>
                  </div>
                  <div className="w-[450px] flex-shrink-0">
                    <span className="text-[15px] font-medium text-[#111827]">Abstract summary</span>
                  </div>
                </div>

                {/* 论文列表内容 */}
                <div className="divide-y divide-[#F3F4F6]">
                  {keywords.map((keyword) => {
                    const keywordPapers = keywordResults[keyword] || [];
                    const isLoading = loadingKeywords[keyword];
                    
                    return (
                      <div key={keyword} className="py-4">
                        {/* 关键词标题 */}
                        <div className="px-6 py-3 bg-[#F9FAFB]">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-[#E5F2F2] text-[#087B7B] text-sm font-medium rounded-full">
                              {keyword}
                            </span>
                            <span className="text-sm text-gray-500">
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087B7B]" />
                                  <span>搜索中...</span>
                                </div>
                              ) : (
                                `找到 ${keywordPapers.length} 篇相关论文`
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* 该关键词下的论文列表或加载状态 */}
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>正在搜索相关论文...</span>
                            </div>
                          </div>
                        ) : keywordPapers.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <span className="text-gray-400">未找到相关论文</span>
                          </div>
                        ) : (
                          keywordPapers.map((paper: any) => (
                            <div key={paper.paperId} className="flex items-start p-6 hover:bg-[#F9FAFB] transition-colors group animate-fadeIn">
                              <div className="w-6 mt-[3px]">
                                <input 
                                  type="checkbox" 
                                  className="w-3.5 h-3.5 rounded border-[#D1D5DB] accent-[#0E5E5E]
                                           focus:ring-1 focus:ring-[#0F766E]/20 focus:ring-offset-0
                                           hover:border-[#0F766E]/30 transition-colors cursor-pointer" 
                                />
                              </div>
                              {/* 左侧论文信息 */}
                              <div className="flex-1 min-w-0 pr-4 border-r border-[#E5E7EB]">
                                <div className="flex flex-col gap-3">
                                  <div className="mb-1.5">
                                    <h3 className="text-[15px] font-medium text-[#111827]">
                                      <a 
                                        href={`https://www.semanticscholar.org/paper/${paper.paperId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-[#087B7B] transition-colors whitespace-pre-line break-words block"
                                        style={{ 
                                          lineHeight: '1.75rem',
                                          display: '-webkit-box',
                                          WebkitLineClamp: '3',
                                          WebkitBoxOrient: 'vertical',
                                          overflow: 'hidden'
                                        }}
                                      >
                                        {formatTitle(paper.title)}
                                      </a>
                                    </h3>
                                  </div>
                                  
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
                                      <span className="text-[13px] text-[#4B5563] leading-normal break-words line-clamp-1">{paper.venue}</span>
                                    </div>
                                  )}

                                  {/* 年份和关键词信息行 */}
                                  <div className="flex items-center gap-x-2 text-[13px] flex-wrap">
                                    <span className="text-[#6B7280]">{paper.year}</span>
                                    {paper.keywords && paper.keywords.length > 0 && (
                                      <>
                                        <span className="text-[#D1D5DB]">•</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {paper.keywords.map((kw: string, index: number) => (
                                            <span key={index} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-xs">
                                              {kw}
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
                                    <span className="text-[#D1D5DB]">•</span>
                                    <CitationButton paperId={paper.paperId} />
                                  </div>
                                </div>
                              </div>
                              {/* 右侧摘要 */}
                              <div className="w-[450px] flex-shrink-0 text-sm text-[#4B5563] pl-4">
                                {loadingSummaries[paper.paperId] ? (
                                  <div className="flex items-center gap-2 h-5">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#087B7B]" />
                                    <span className="text-xs text-[#6B7280]">生成摘要中...</span>
                                  </div>
                                ) : summaries[paper.paperId] ? (
                                  <p className="text-[#4B5563] leading-relaxed text-[15px]">
                                    {summaries[paper.paperId]}
                                  </p>
                                ) : (
                                  <div className="h-5 flex items-center">
                                    <span className="text-sm text-[#9CA3AF]">无法访问论文，无法生成摘要</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 