'use client';

import { useState } from 'react';
import { translationCache } from '@/lib/translationCache';
import { Loader2, Languages } from 'lucide-react';

interface TranslateToggleProps {
  text: string;
  className?: string;
}

export function TranslateToggle({ text, className = '' }: TranslateToggleProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTranslation = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (translation) {
      setIsTranslated(true);
      return;
    }

    // 检查缓存
    const cachedTranslation = translationCache.getTranslation(text);
    if (cachedTranslation) {
      setTranslation(cachedTranslation);
      setIsTranslated(true);
      return;
    }

    // 调用翻译 API
    try {
      setIsLoading(true);
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('翻译请求失败');
      
      const data = await response.json();
      setTranslation(data.translation);
      translationCache.setTranslation(text, data.translation);
      setIsTranslated(true);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${className}`}>
      {/* 文本容器 */}
      <div className="relative min-h-[1.5em] pb-8">
        {/* 原文 */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: isTranslated ? 0 : 1,
            visibility: isTranslated ? 'hidden' : 'visible',
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {text}
        </div>

        {/* 译文 */}
        {translation && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              opacity: isTranslated ? 1 : 0,
              visibility: isTranslated ? 'visible' : 'hidden',
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            {translation}
          </div>
        )}

        {/* 翻译按钮 */}
        <div className="absolute bottom-0 right-0 flex items-center">
          <button
            onClick={handleToggleTranslation}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full text-[#087B7B] hover:text-[#065e5e] hover:bg-gray-50 transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>翻译中...</span>
              </>
            ) : (
              <>
                <Languages className="w-4 h-4" />
                <span>{isTranslated ? '查看原文' : '翻译'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 