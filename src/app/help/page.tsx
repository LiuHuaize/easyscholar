'use client';

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function Help() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* 复用导航栏 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* 导航栏代码相同 */}
        {/* ... */}
      </nav>

      <main className="max-w-4xl mx-auto mt-16 px-6">
        <div className="flex flex-col space-y-8">
          <h1 className="text-3xl font-semibold text-gray-900">Help Center</h1>
          
          <div className="space-y-6">
            <section className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">Getting Started</h2>
              <div className="bg-white rounded-lg border border-gray-200 divide-y">
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="text-base font-medium text-gray-900 mb-1">How to use Research AI</h3>
                  <p className="text-sm text-gray-600">Learn the basics of using Research AI for your research</p>
                </div>
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <h3 className="text-base font-medium text-gray-900 mb-1">Managing your notebooks</h3>
                  <p className="text-sm text-gray-600">Organize and manage your research notebooks effectively</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-medium text-gray-900">FAQ</h2>
              <div className="bg-white rounded-lg border border-gray-200 divide-y">
                {/* FAQ 项目 */}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 