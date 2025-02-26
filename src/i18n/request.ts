import {getRequestConfig} from 'next-intl/server';
import {headers} from 'next/headers';
import {locales} from './config';

export default getRequestConfig(async () => {
  const headersList = await headers();
  const locale = headersList.get('X-NEXT-INTL-LOCALE') || 'en';
  
  return {
    messages: (await import(`./locales/${locale}.json`)).default,
    locale
  };
}); 