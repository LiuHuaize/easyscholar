'use client';

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function Notebooks() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* 复用导航栏 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-10">
          <a href="/" className="text-xl font-semibold text-[#087B7B]">
            ResearchAI
          </a>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/notebooks" className="flex items-center space-x-1.5 text-[#087B7B]">
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
          <a href="/help" className="text-sm text-gray-600 hover:text-gray-900">
            Help
          </a>
          {userId && <UserButton afterSignOutUrl="/" />}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto mt-16 px-6">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Notebooks</h1>
          {/* 这里添加notebooks的内容 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 示例笔记本卡片 */}
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Research Notes</h3>
              <p className="text-sm text-gray-600 mb-4">Last edited 2 hours ago</p>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                <span>3 entries</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 