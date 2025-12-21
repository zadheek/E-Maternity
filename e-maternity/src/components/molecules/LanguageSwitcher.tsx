'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  si: { name: 'සිංහල', flag: '🇱🇰' },
  ta: { name: 'தமிழ்', flag: '🇱🇰' }
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie and refresh to apply new locale
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px]">
        <div className="flex items-center gap-2">
          <Icons.Globe className="w-4 h-4" />
          <SelectValue>
            <span className="flex items-center gap-1">
              <span>{languages[locale as keyof typeof languages].flag}</span>
              <span className="hidden sm:inline">{languages[locale as keyof typeof languages].name}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([code, { name, flag }]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <span>{flag}</span>
              <span>{name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
