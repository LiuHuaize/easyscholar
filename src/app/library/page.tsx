'use client';

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function Library() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* 复用导航栏 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* 导航栏代码与 notebooks 相同，但 Library 链接高亮 */}
        {/* ... */}
      </nav>

      <main className="max-w-5xl mx-auto mt-16 px-6">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Library</h1>
          {/* 这里添加library的内容 */}
          <div className="grid grid-cols-1 gap-4">
            {/* 示例文档列表 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BookmarkIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="text-base font-medium text-gray-900">Research Paper Title</h3>
                    <p className="text-sm text-gray-500">Added Jan 10, 2024</p>
                  </div>
                </div>
                <button className="text-sm text-[#087B7B] hover:text-[#076666]">View</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 