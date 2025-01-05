'use client';

import { useAuth } from "@clerk/nextjs";
import { BookmarkIcon, ArrowUpTrayIcon, FolderIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";

export default function Library() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Library</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#087B7B] text-white rounded-lg hover:bg-[#076666] transition-colors">
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Upload Files</span>
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {/* 文档列表项 */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FolderIcon className="w-6 h-6 text-[#087B7B]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900">Research Paper Title</h3>
                  <p className="text-sm text-gray-500 mt-1">Added Jan 10, 2024 • PDF • 2.3 MB</p>
                </div>
              </div>
              <button className="px-3 py-1.5 text-sm text-[#087B7B] hover:text-[#076666] hover:bg-gray-100 rounded-md transition-colors">
                View
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 