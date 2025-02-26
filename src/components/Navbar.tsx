'use client';

import { BookOpenIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const isActivePath = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-[#087B7B] font-medium">
              ResearchAI
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <Link 
                href="/notebooks" 
                className={`flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 ${
                  isActivePath('/notebooks') ? 'text-[#087B7B]' : ''
                }`}
              >
                <BookOpenIcon className="h-4 w-4" />
                <span>{t('notebooks')}</span>
              </Link>
              <Link 
                href="/library" 
                className={`flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 ${
                  isActivePath('/library') ? 'text-[#087B7B]' : ''
                }`}
              >
                <BookmarkIcon className="h-4 w-4" />
                <span>{t('library')}</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
            <Link 
              href="/help" 
              className={`text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 ${
                isActivePath('/help') ? 'text-[#087B7B]' : ''
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