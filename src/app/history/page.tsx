'use client';

import { useAuth } from "@clerk/nextjs";
import { PlusIcon, BookOpenIcon, ClockIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";

export default function Notebooks() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Notebooks</h1>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#087B7B] text-white rounded-lg hover:bg-[#076666] transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>New Notebook</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 新笔记本卡片 */}
          <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-[#087B7B] transition-colors">Research Notes</h3>
              <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-2" />
                <span>Last edited 2 hours ago</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <BookOpenIcon className="w-4 h-4 mr-2" />
                <span>3 entries</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 