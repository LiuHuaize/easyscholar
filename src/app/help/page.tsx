'use client';

import { useAuth } from "@clerk/nextjs";
import { QuestionMarkCircleIcon, BookOpenIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";

export default function Help() {
  const { userId } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900">How can we help you?</h1>
            <p className="mt-3 text-gray-600">Browse through our help articles or search for specific topics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3">
                <a href="#" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <QuestionMarkCircleIcon className="w-5 h-5 text-[#087B7B]" />
                      <span className="text-gray-700">How to use Research AI</span>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </a>
                {/* 更多帮助项目 */}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">FAQ</h2>
              <div className="space-y-3">
                {/* FAQ 项目 */}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 