'use client'

import { Search, ChevronDown, Filter, Globe, ChevronRight, Plus, Settings2, Edit2, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Navbar from '@/components/Navbar'
import CitationButton from '@/components/CitationButton'
import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { Paper, MarkdownComponentProps } from '@/app/types/types'
import { TranslateToggle } from '@/components/TranslateToggle'
import { translationCache } from '@/lib/translationCache'

export default function NotebooksPage() {
  const t = useTranslations('notebooks')
  const commonT = useTranslations('common')
  const navigationT = useTranslations('navigation')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDisabled, setIsSearchDisabled] = useState(false)
  const [papers, setPapers] = useState<Paper[]>([])
  const [summaries, setSummaries] = useState<{[key: string]: string}>({})
  const [loadingSummaries, setLoadingSummaries] = useState<{[key: string]: boolean}>({})
  const [retryingKeywords, setRetryingKeywords] = useState<{[key: string]: number}>({})
  const [totalResults, setTotalResults] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false)
  const [keywords, setKeywords] = useState<string[]>([])
  const [keywordResults, setKeywordResults] = useState<{[key: string]: any[]}>({})
  const [loadingKeywords, setLoadingKeywords] = useState<{[key: string]: boolean}>({})
  const [insightContent, setInsightContent] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [reasoningContent, setReasoningContent] = useState('')
  const [isReasoningPhase, setIsReasoningPhase] = useState(true)
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)
  const [isGlobalTranslated, setIsGlobalTranslated] = useState(false)
  const [isGlobalTranslating, setIsGlobalTranslating] = useState(false)
  const [translations, setTranslations] = useState<{[key: string]: string}>({})
  const searchParams = useSearchParams()
  const isFirstRender = useRef(true)
  const insightContainerRef = useRef<HTMLDivElement>(null)
  const reasoningContainerRef = useRef<HTMLDivElement>(null)

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
      setReasoningContent('');
      setInsightContent('');
      setIsReasoningPhase(true);
      
      const validPapers = papers.filter(paper => 
        paper.abstract && paper.abstract !== "No abstract provided"
      );

      if (validPapers.length === 0) return;

      // 从localStorage获取语言设置
      const language = localStorage.getItem('notebookLanguage') || 'en';

      const response = await fetch('/api/generate-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          papers: validPapers,
          language
        })
      });

      if (!response.ok) throw new Error('Failed to generate insight');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let currentContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'reasoning') {
              setReasoningContent(prev => {
                const newContent = prev + data.content;
                // 添加自动滚动
                setTimeout(() => {
                  if (reasoningContainerRef.current) {
                    reasoningContainerRef.current.scrollTop = reasoningContainerRef.current.scrollHeight;
                  }
                }, 0);
                return newContent;
              });
            } else if (data.type === 'content') {
              currentContent += data.content;
              setInsightContent(currentContent);
              // 添加自动滚动
              setTimeout(() => {
                if (insightContainerRef.current) {
                  insightContainerRef.current.scrollTop = insightContainerRef.current.scrollHeight;
                }
              }, 0);
            } else if (data.type === 'phase_change') {
              setIsReasoningPhase(false);
              // 当思考过程完成后，延迟1秒自动折叠
              setTimeout(() => {
                setIsReasoningExpanded(false);
              }, 1000);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Insight generation error:', error);
      const language = localStorage.getItem('notebookLanguage') || 'en';
      setInsightContent(language === 'zh' ? '无法生成研究洞察' : 'Failed to generate research insights');
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

      if (!response.ok) throw new Error('无法获取摘要');
      const data = await response.json();
      
      if (data.summaries?.[0]?.summary) {
        setSummaries(prev => ({
          ...prev,
          [paper.paperId]: data.summaries[0].summary
        }));
      } else if (data.summaries?.[0]?.error) {
        setSummaries(prev => ({
          ...prev,
          [paper.paperId]: "生成摘要时出错"
        }));
      }
    } catch (error) {
      console.error('Summary error:', error);
      setSummaries(prev => ({
        ...prev,
        [paper.paperId]: "生成摘要时出错"
      }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [paper.paperId]: false }));
    }
  };

  // 添加超时控制函数
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 18000, retryCount = 0, maxRetries = 2) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      // 如果是超时错误且未达到最大重试次数，则返回特殊标记
      if (error instanceof Error && error.name === 'AbortError' && retryCount < maxRetries) {
        return { isTimeout: true, retryCount: retryCount + 1 };
      }
      throw error;
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
      
      if (!keywordsRes.ok) throw new Error(t('search.error'));
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
        let currentRetryCount = 0;
        let maxRetries = 2; // 最多重试2次
        
        while (currentRetryCount <= maxRetries) {
          try {
            const searchType = localStorage.getItem('notebookSearchType') || 'papers';
            const apiEndpoint = searchType === 'papers' ? '/api/semanticsearch' : '/api/websearch';
            
            // 如果是重试，更新UI状态
            if (currentRetryCount > 0) {
              setRetryingKeywords(prev => ({
                ...prev,
                [keyword]: currentRetryCount
              }));
            }
            
            // 使用带超时的fetch
            const responseOrTimeout = await fetchWithTimeout(
              `${apiEndpoint}?query=${encodeURIComponent(keyword)}&limit=4&offset=0`,
              {},
              17000, // 17秒超时
              currentRetryCount
            );
            
            // 检查是否是超时需要重试的特殊返回值
            if (responseOrTimeout && typeof responseOrTimeout === 'object' && 'isTimeout' in responseOrTimeout) {
              currentRetryCount = responseOrTimeout.retryCount;
              continue; // 继续下一次重试
            }
            
            // 现在我们知道它是一个真正的Response对象
            const response = responseOrTimeout as Response;
            
            if (!response.ok) throw new Error(`关键词搜索失败: ${keyword}`);
            const data = await response.json();
            
            // 搜索成功，清除重试状态
            if (currentRetryCount > 0) {
              setRetryingKeywords(prev => {
                const newState = {...prev};
                delete newState[keyword];
                return newState;
              });
            }
            
            const transformedPapers = data.articles
              .map((paper: any) => ({
                paperId: paper.id,
                title: paper.title,
                authors: paper.authors.map((name: string) => ({ name })),
                abstract: paper.abstract,
                year: paper.year,
                venue: paper.journal,
                citationCount: '暂无',
                url: paper.semanticUrl,
                pdfUrl: paper.openAccessPdf,
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

            // 为每篇论文获取摘要
            await Promise.all(transformedPapers.map((paper: Paper) => fetchSummary(paper)));
            
            // 更新加载状态
            setLoadingKeywords(prev => ({
              ...prev,
              [keyword]: false
            }));
            
            // 成功获取结果，跳出循环
            break;
            
          } catch (error) {
            console.error(`关键词 ${keyword} 搜索出错:`, error);
            
            // 如果是超时错误且未达到最大重试次数，则继续重试
            if (error instanceof Error && error.name === 'AbortError' && currentRetryCount < maxRetries) {
              currentRetryCount++;
              continue;
            }
            
            // 清除重试状态
            setRetryingKeywords(prev => {
              const newState = {...prev};
              delete newState[keyword];
              return newState;
            });
            
            // 其他错误或达到最大重试次数，更新UI显示错误
            const errorMessage = error instanceof Error && error.name === 'AbortError' 
              ? t('search.timeout') 
              : t('search.error');
              
            setKeywordResults(prev => ({
              ...prev,
              [keyword]: []
            }));
            
            // 跳出循环
            break;
          } finally {
            // 如果达到最大重试次数，则更新加载状态
            if (currentRetryCount >= maxRetries) {
              setLoadingKeywords(prev => ({
                ...prev,
                [keyword]: false
              }));
            }
          }
        }
      });

      // 等待所有搜索完成
      await Promise.all(searchPromises);
      
      // 在所有论文加载完成后生成Insight,即使某些关键词搜索失败也继续生成
      if (allPapers.length > 0) {
        await generateInsight(query, allPapers);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setIsLoading(false);
      setIsGeneratingKeywords(false);
    } finally {
      setIsSearchDisabled(false);
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

  useEffect(() => {
    const translateAll = async () => {
      if (!isGlobalTranslated || papers.length === 0) return;
      
      setIsGlobalTranslating(true);
      try {
        // 收集所有需要翻译的文本
        const textsToTranslate = papers.map(paper => ({
          id: paper.paperId,
          title: paper.title,
          abstract: summaries[paper.paperId] || ''
        }));

        // 并行处理所有翻译请求
        const translationPromises = textsToTranslate.map(async ({ id, title, abstract }) => {
          // 检查缓存
          const cachedTitle = translationCache.getTranslation(title);
          const cachedAbstract = translationCache.getTranslation(abstract);

          // 如果没有缓存,则调用API
          const [translatedTitle, translatedAbstract] = await Promise.all([
            cachedTitle || fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: title })
            }).then(res => res.json()).then(data => {
              translationCache.setTranslation(title, data.translation);
              return data.translation;
            }),
            cachedAbstract || fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: abstract })
            }).then(res => res.json()).then(data => {
              translationCache.setTranslation(abstract, data.translation);
              return data.translation;
            })
          ]);

          return {
            id,
            title: translatedTitle || title,
            abstract: translatedAbstract || abstract
          };
        });

        const results = await Promise.all(translationPromises);
        
        // 更新翻译状态
        const newTranslations = results.reduce((acc, { id, title, abstract }) => {
          acc[`title-${id}`] = title;
          acc[`abstract-${id}`] = abstract;
          return acc;
        }, {} as {[key: string]: string});

        setTranslations(newTranslations);
      } catch (error) {
        console.error('Global translation error:', error);
      } finally {
        setIsGlobalTranslating(false);
      }
    };

    translateAll();
  }, [isGlobalTranslated, papers, summaries]);

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
                placeholder={isSearchDisabled ? t('search.completed') : t('search.placeholder')}
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
                  按回车键 ↵
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 关键词展示 */}
        {keywords.length > 0 && (
          <div className="flex items-center gap-2 py-3 border-b border-gray-100">
            <span className="text-[15px] text-gray-500">{t('keywords.title')}：</span>
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

        {/* 研究洞察区域 */}
        {(insightContent || insightLoading || reasoningContent || (keywords.length > 0 && !isLoading)) && (
          <div className="my-4 md:my-6 mx-4 md:mx-auto max-w-[900px] p-4 md:p-6 bg-white rounded-lg border border-[#E5F2F2] shadow-sm">
            <div className="flex items-center gap-2 md:gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="md:w-5 md:h-5 text-[#087B7B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v8"/>
                <path d="m16 6-4-4-4 4"/>
                <path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z"/>
                <path d="M7 15h10"/>
                <path d="M7 19h10"/>
              </svg>
              <h3 className="text-base md:text-lg font-medium text-[#111827]">{t('insight.title')}</h3>
            </div>
            
            {/* 思考过程区域 */}
            {reasoningContent && (
              <div className="mb-4">
                <div 
                  className="flex items-center gap-2 mb-2 md:mb-3 cursor-pointer" 
                  onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                >
                  <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-[#F0F9F9] rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" className="md:w-3.5 md:h-3.5 text-[#087B7B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                      <path d="M8.5 8.5v.01"/>
                      <path d="M16 15.5v.01"/>
                      <path d="M12 12v.01"/>
                      <path d="M11 17v.01"/>
                      <path d="M7 14v.01"/>
                    </svg>
                    <span className="text-xs md:text-sm font-medium text-[#087B7B]">{t('insight.thinking_process')}</span>
                    <ChevronDown 
                      size={12} 
                      className={`md:w-3.5 md:h-3.5 text-[#087B7B] transform transition-transform duration-200 ${isReasoningExpanded ? '' : '-rotate-90'}`} 
                    />
                  </div>
                  <div className="h-[1px] flex-1 bg-[#E5F2F2]"></div>
                </div>
                <div 
                  className={`transition-all duration-300 ease-in-out ${isReasoningExpanded ? 'max-h-[250px] md:max-h-[300px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                >
                  <div className="bg-[#F9FAFB] border border-[#E5F2F2] rounded-lg">
                    <div
                      ref={reasoningContainerRef}
                      className="text-xs md:text-sm text-[#4B5563] whitespace-pre-wrap p-3 md:p-4 overflow-y-auto"
                      style={{ 
                        maxHeight: '250px',
                        scrollBehavior: 'smooth'
                      }}
                    >
                      {reasoningContent}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 最终洞察内容区域 */}
            {insightContent ? (
              <div className="text-[#4B5563] leading-relaxed text-sm md:text-base">
                <MarkdownRenderer content={insightContent} papers={papers} />
              </div>
            ) : insightLoading ? (
              <div className="flex items-center gap-2 md:gap-3 text-[#087B7B] bg-[#F9FAFB] border border-[#E5F2F2] rounded-lg p-3 md:p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="md:w-4 md:h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span className="text-sm md:text-base">{t('insight.generating')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3 text-gray-500 bg-[#F9FAFB] border border-[#E5F2F2] rounded-lg p-3 md:p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span className="text-sm md:text-base">{t('insight.waiting')}</span>
              </div>
            )}
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 md:py-3 px-4 md:px-0 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div 
              className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 text-sm md:text-[15px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-1 md:gap-2">
                <span>{t('sort.relevance')}</span>
                <ChevronDown size={12} className="md:w-3.5 md:h-3.5" />
                <span className="px-1 md:px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] md:text-[11px] font-medium rounded">Beta</span>
              </div>
            </div>
            <div 
              className="flex items-center gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 text-sm md:text-[15px] text-gray-600 hover:bg-gray-50 rounded-md transition-colors opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-1 md:gap-2">
                <Filter size={12} className="md:w-3.5 md:h-3.5" />
                <span>{t('filter.title')}</span>
                <span className="px-1 md:px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] md:text-[11px] font-medium rounded">Beta</span>
              </div>
            </div>
            <div 
              onClick={() => setIsGlobalTranslated(!isGlobalTranslated)}
              className={`flex items-center gap-1.5 px-2 md:px-2.5 py-1 md:py-1.5 text-sm md:text-[15px] ${isGlobalTranslated ? 'bg-[#087B7B] text-white' : 'text-gray-600 hover:bg-gray-50'} rounded-md transition-colors cursor-pointer`}
            >
              {isGlobalTranslating ? (
                <>
                  <Loader2 size={12} className="md:w-3.5 md:h-3.5 animate-spin" />
                  <span>{t('filter.translate')}</span>
                </>
              ) : (
                <>
                  <Globe size={12} className="md:w-3.5 md:h-3.5" />
                  <span>{t('filter.translate')}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-sm md:text-[15px] text-gray-500">
            {t('results.total', { count: totalResults.toLocaleString() })}
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
                    {isGeneratingKeywords ? t('search.generating_keywords') : t('search.searching_papers')}
                  </h3>
                  <p className="text-[15px] text-gray-500">
                    {isGeneratingKeywords ? t('search.analyzing_question') : t('search.please_wait')}
                  </p>
                </div>
              </div>
            ) : papers.length === 0 && keywords.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('search.searching')}</h3>
                <p className="text-[15px] text-gray-500">{t('search.papers_loading')}</p>
              </div>
            ) : papers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('search.enter_question')}</h3>
                <p className="text-[15px] text-gray-500">{t('search.ai_help')}</p>
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
                    <span className="text-[15px] font-medium text-[#111827]">{t('paper.title')}</span>
                  </div>
                  <div className="w-[450px] flex-shrink-0">
                    <span className="text-[15px] font-medium text-[#111827]">{t('paper.summary')}</span>
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
                                  {retryingKeywords[keyword] ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                                      <span className="text-amber-500">{t('common.retrying', { count: retryingKeywords[keyword] })}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>{t('search.searching_papers')}</span>
                                    </>
                                  )}
                                </div>
                              ) : (
                                t('results.total', { count: keywordPapers.length })
                              )}
                            </span>
                          </div>
                        </div>
                        
                        {/* 该关键词下的论文列表或加载状态 */}
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2 text-gray-400">
                              {retryingKeywords[keyword] ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                                  <span className="text-amber-500">{t('common.retrying', { count: retryingKeywords[keyword] })}</span>
                                </>
                              ) : (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>{t('search.searching_papers')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        ) : keywordPapers.length === 0 ? (
                          <div className="flex items-center justify-center py-8">
                            <span className="text-gray-400">未找到相关论文</span>
                          </div>
                        ) : (
                          keywordPapers.map((paper: any) => (
                            <div
                              key={paper.paperId}
                              id={`paper-${paper.paperId}`}
                              className="flex items-start p-6 hover:bg-[#F9FAFB] transition-colors group animate-fadeIn"
                            >
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
                                      <div className="hover:text-[#087B7B] transition-colors whitespace-pre-line break-words block">
                                        {isGlobalTranslated ? translations[`title-${paper.paperId}`] || formatTitle(paper.title) : formatTitle(paper.title)}
                                      </div>
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
                                          <span>{t('paper.view_paper')}</span>
                                        </a>
                                      </>
                                    )}
                                    {paper.pdfUrl && (
                                      <>
                                        <span className="text-[#D1D5DB]">•</span>
                                        <a 
                                          href={paper.pdfUrl} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-[#087B7B] hover:text-[#065e5e] transition-colors"
                                        >
                                          <ExternalLink size={12} />
                                          <span>{t('paper.view_pdf')}</span>
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
                                    <span className="text-xs text-[#6B7280]">{t('paper.generating_summary')}</span>
                                  </div>
                                ) : summaries[paper.paperId] ? (
                                  <div className="text-[#4B5563] leading-relaxed text-[15px]">
                                    {isGlobalTranslated ? translations[`abstract-${paper.paperId}`] || summaries[paper.paperId] : summaries[paper.paperId]}
                                  </div>
                                ) : (
                                  <div className="h-5 flex items-center">
                                    <span className="text-sm text-[#9CA3AF]">{t('paper.summary_error')}</span>
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