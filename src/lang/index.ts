
import { createI18n } from 'vue-i18n';
import { LanguageEnum } from '@/enums/LanguageEnum';
import en_US from '@/lang/en_US';
import zh_CN from '@/lang/zh_CN';


export const getLanguage = (): LanguageEnum => {
  const language = useStorage<LanguageEnum>('language', LanguageEnum.en_US);
  if (language.value) {
    return language.value;
  }
  return LanguageEnum.en_US;
};

const i18n = createI18n({
  globalInjection: true,
  allowComposition: true,
  legacy: false,
  locale: getLanguage(),
  messages: {
    zh_CN: zh_CN,
    en_US: en_US
  }
});

export default i18n;

export type LanguageType = typeof zh_CN;
