import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // 移除当前语言前缀
    const currentPathWithoutLocale = pathname.replace(`/${locale}`, '');
    // 添加新的语言前缀
    router.push(`/${newLocale}${currentPathWithoutLocale}`);
  };

  return (
    <select
      value={locale}
      onChange={(e) => handleChange(e.target.value)}
      className="bg-transparent border border-gray-300 rounded px-2 py-1"
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc === 'en' ? 'English' : '中文'}
        </option>
      ))}
    </select>
  );
} 