import { useI18n } from 'vue-i18n';

export const useBoxhillI18n = () => {
  const { t } = useI18n();

  const bt = (key: string, named?: Record<string, unknown>) => {
    return t(`boxhilltravelManager.text.${key}`, named);
  };

  return {
    bt,
    t
  };
};
