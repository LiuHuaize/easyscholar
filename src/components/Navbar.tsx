'use client';

import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const isActivePath = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="text-xl font-semibold text-[#087B7B] hover:text-[#076666] transition-colors">
              ResearchAI
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/notebooks" 
                className={`flex items-center space-x-1.5 transition-colors ${
                  isActivePath('/notebooks') ? 'text-[#087B7B]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span className="text-sm">{t('notebooks')}</span>
              </Link>
              <Link 
                href="/library" 
                className={`flex items-center space-x-1.5 transition-colors ${
                  isActivePath('/library') ? 'text-[#087B7B]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookmarkIcon className="h-4 w-4" />
                <span className="text-sm">{t('library')}</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Link 
              href="/help" 
              className={`text-sm transition-colors ${
                isActivePath('/help') ? 'text-[#087B7B]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('help')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 