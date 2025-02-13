'use client';

import { BookOpenIcon, BookmarkIcon, ArrowRightIcon, DocumentArrowUpIcon, SparklesIcon, GlobeAltIcon, PlusIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// 定义搜索选项类型
type SearchOptionType = 'papers' | 'openalex' | 'arxiv' | 'web';
type LanguageType = 'en' | 'zh';

export default function Home() {
  const router = useRouter();
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<LanguageType>('en');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const searchOptionsRef = useRef<HTMLDivElement>(null);
  const languageOptionsRef = useRef<HTMLDivElement>(null);

  // 处理搜索选项点击
  const handleSearchOptionClick = (type: SearchOptionType) => {
    setIsLoading(true);
    const notebookId = uuidv4();
    // 保存搜索文本、类型和语言到localStorage
    localStorage.setItem('notebookSearchQuery', searchText);
    localStorage.setItem('notebookSearchType', type);
    localStorage.setItem('notebookLanguage', language);
    router.push(`/notebooks/${notebookId}`);
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchText.trim()) {  // 只有当输入不为空时才响应回车键
      e.preventDefault();
      setShowSearchOptions(true);
    }
  };

  // 点击外部关闭搜索选项和语言选项
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageOptionsRef.current && !languageOptionsRef.current.contains(event.target as Node)) {
        setShowLanguageOptions(false);
      }
      if (searchOptionsRef.current && !searchOptionsRef.current.contains(event.target as Node)) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-10">
          <a href="/" className="text-xl font-semibold text-[#087B7B]">
            ResearchAI
          </a>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/history" className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900">
              <BookOpenIcon className="h-4 w-4" />
              <span className="text-sm">笔记本</span>
            </a>
            <a href="/library" className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900">
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-sm">文献库</span>
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            帮助
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-16 px-6">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-center space-x-2 mb-4 text-[#087B7B] px-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-lg font-medium">发现研究洞察</h2>
            </div>
            
            <div className="relative mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="搜索论文..."
                      className="w-full h-[52px] pl-4 pr-12 bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#087B7B] focus:bg-white text-gray-800 placeholder-gray-400 transition-all"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      onClick={() => searchText.trim() && setShowSearchOptions(true)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md transition-colors group ${!searchText.trim() ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={isLoading || !searchText.trim()}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 relative">
                          <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-full"></div>
                          <div className="absolute top-0 left-0 w-full h-full border-2 border-[#087B7B] rounded-full animate-spin border-t-transparent"></div>
                        </div>
                      ) : (
                        <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-[#087B7B]" />
                      )}
                    </button>
                  </div>
                  
                  {/* 搜索选项弹出框 */}
                  {showSearchOptions && !isLoading && (
                    <div 
                      ref={searchOptionsRef}
                      className="absolute top-full right-0 mt-2 w-[280px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">研究洞察语言</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setLanguage('zh')}
                              className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
                                language === 'zh' 
                                  ? 'bg-[#087B7B] text-white' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              中文
                            </button>
                            <button
                              onClick={() => setLanguage('en')}
                              className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
                                language === 'en' 
                                  ? 'bg-[#087B7B] text-white' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              English
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSearchOptionClick('papers')}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/80 transition-colors group"
                        disabled={isLoading}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <BookOpenIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex-1 flex items-center justify-between">
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-gray-700">Semantic Scholar</span>
                            <span className="text-xs text-gray-500">查找研究论文和文章</span>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSearchOptionClick('openalex')}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/80 transition-colors group cursor-not-allowed opacity-60"
                        disabled={true}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <BookOpenIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">OpenAlex</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">Beta</span>
                          </div>
                          <span className="text-xs text-gray-500">功能开发中</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSearchOptionClick('arxiv')}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/80 transition-colors group cursor-not-allowed opacity-60"
                        disabled={true}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <BookOpenIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">arXiv</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">Beta</span>
                          </div>
                          <span className="text-xs text-gray-500">功能开发中</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleSearchOptionClick('web')}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/80 transition-colors group cursor-not-allowed opacity-60"
                        disabled={true}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">搜索网络信息</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">Beta</span>
                          </div>
                          <span className="text-xs text-gray-500">功能开发中</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <button 
                    className="h-[52px] w-[52px] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center text-gray-600 cursor-not-allowed relative"
                    aria-label="Upload files"
                  >
                    <PlusIcon className="w-6 h-6 group-hover:text-[#087B7B] transition-colors" />
                  </button>
                  
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <p className="font-medium text-[#087B7B] mb-2">即将推出！</p>
                      <p className="text-gray-500 text-xs">您的文档将由 AI 分析，以提供更准确的搜索结果和上下文响应。</p>
                    </div>
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button 
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm group cursor-not-allowed opacity-60"
                disabled
              >
                <DocumentArrowUpIcon className="w-5 h-5 text-gray-400 group-hover:text-[#087B7B]" />
                <div className="flex items-center space-x-2">
                  <span>从 PDF 提取数据</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">Beta</span>
                </div>
              </button>
              <button 
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm group cursor-not-allowed opacity-60"
                disabled
              >
                <SparklesIcon className="w-5 h-5 text-gray-400 group-hover:text-[#087B7B]" />
                <div className="flex items-center space-x-2">
                  <span>概念列表</span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">Beta</span>
                </div>
              </button>
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">最近</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">Long Context LLM vs RAG Analysis</span>
                </div>
                <span className="text-xs text-gray-400">10:24pm yesterday</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg group cursor-pointer">
                <div className="flex items-center space-x-3">
                  <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900">Cultural Revolution: Impact and Legacy</span>
                </div>
                <span className="text-xs text-gray-400">4:35pm Jan 4</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
