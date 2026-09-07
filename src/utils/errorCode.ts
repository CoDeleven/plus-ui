import i18n from '@/lang';

export const errorCode: any = {
  get '401'() {
    return i18n.global.t('common.error401');
  },
  get '403'() {
    return i18n.global.t('common.error403');
  },
  get '404'() {
    return i18n.global.t('common.error404');
  },
  get default() {
    return i18n.global.t('common.errorDefault');
  }
};
export default errorCode;
