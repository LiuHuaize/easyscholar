'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const toggleLanguage = () => {
    // 从当前路径中获取语言代码
    const currentLang = pathname.split('/')[1]
    // 切换语言
    const newLang = currentLang === 'en' ? 'zh' : 'en'
    // 构建新路径
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`)
    
    // 添加调试日志
    console.log('Current pathname:', pathname)
    console.log('Current language:', currentLang)
    console.log('New language:', newLang)
    console.log('New path:', newPath)
    
    // 使用 replace 而不是 push
    router.replace(newPath)
  }

  const isEnglish = pathname.startsWith('/en')

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {isEnglish ? '中文' : 'English'}
      </span>
    </button>
  )
} 