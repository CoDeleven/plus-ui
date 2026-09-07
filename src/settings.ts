import { LanguageEnum } from '@/enums/LanguageEnum';
import { NavTypeEnum } from '@/enums/NavTypeEnum';

const setting: DefaultSettings = {
  
  title: import.meta.env.VITE_APP_TITLE,

  theme: '#409EFF',

  
  sideTheme: 'theme-dark',
  
  showSettings: true,

  
  navType: NavTypeEnum.LEFT,

  
  tagsView: true,

  
  tagsViewPersist: false,

  
  tagsIcon: true,

  
  fixedHeader: true,

  
  sidebarLogo: true,

  
  dynamicTitle: true,

  
  animationEnable: false,

  
  dark: false,

  
  language: LanguageEnum.en_US,

  
  size: 'default',

  
  layout: '',

  
  radiusBase: 14
};
export default setting;
