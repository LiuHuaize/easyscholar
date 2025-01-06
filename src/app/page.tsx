'use client';

import { UserButton, SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpenIcon, BookmarkIcon, ArrowRightIcon, DocumentArrowUpIcon, SparklesIcon, GlobeAltIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useState, useRef } from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

// 定义搜索选项类型
type SearchOptionType = 'papers' | 'web';

// 定义搜索选项配置类型
type SearchOptionsConfig = {
  [K in SearchOptionType]: {
    text: string;
    icon: typeof DocumentArrowUpIcon;
    placeholder: string;
  };
};

export default function Home() {
  const { userId } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SearchOptionType>('papers');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理搜索选项点击
  const handleSearchOptionClick = (type: SearchOptionType) => {
    const notebookId = uuidv4(); // 生成唯一的notebookId
    router.push(`/notebooks/${notebookId}?type=${type}`);
  };

  const searchOptions: SearchOptionsConfig = {
    papers: {
      text: "Search Academic Papers",
      icon: DocumentArrowUpIcon,
      placeholder: "Search in academic papers database..."
    },
    web: {
      text: "Search Web Information",
      icon: GlobeAltIcon,
      placeholder: "Search across web resources..."
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', files);
      // TODO: 实现文件上传到服务器的逻辑
    }
  };

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
              <span className="text-sm">Notebooks</span>
            </a>
            <a href="/library" className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900">
              <BookmarkIcon className="h-4 w-4" />
              <span className="text-sm">Library</span>
            </a>
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Help
          </button>
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-[#087B7B] text-white text-sm rounded-lg hover:bg-[#076666] transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-16 px-6">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
            <div className="flex items-center space-x-2 mb-4 text-[#087B7B] px-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-lg font-medium">Discover Research Insights</h2>
            </div>
            
            <div className="relative mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text"
                    placeholder={searchOptions[selectedOption].placeholder}
                    className="w-full h-[52px] px-4 bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#087B7B] focus:bg-white text-gray-800 placeholder-gray-400 transition-all"
                  />
                  
                  <div className="absolute right-0 top-0 h-full flex items-center">
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="h-full px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors border-l border-gray-200"
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-14 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      {Object.entries(searchOptions).map(([key, option]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedOption(key as SearchOptionType);
                            setIsDropdownOpen(false);
                            handleSearchOptionClick(key as SearchOptionType);
                          }}
                          className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 ${
                            selectedOption === key ? 'text-[#087B7B] bg-gray-50' : 'text-gray-600'
                          }`}
                        >
                          <option.icon className="w-5 h-5" />
                          <span className="text-sm">{option.text}</span>
                        </button>
                      ))}
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
                      <p className="font-medium text-[#087B7B] mb-2">Coming Soon!</p>
                      <p className="text-gray-500 text-xs">Your documents will be analyzed by AI to enhance search results and provide more accurate, contextual responses.</p>
                    </div>
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm group">
                <DocumentArrowUpIcon className="w-5 h-5 text-gray-400 group-hover:text-[#087B7B]" />
                <span>Extract data from PDFs</span>
              </button>
              <button className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm group">
                <SparklesIcon className="w-5 h-5 text-gray-400 group-hover:text-[#087B7B]" />
                <span>List of concepts</span>
              </button>
            </div>
          </div>

          <div className="w-full max-w-3xl">
            <h3 className="text-sm font-medium text-gray-500 mb-2 px-1">Recent</h3>
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
