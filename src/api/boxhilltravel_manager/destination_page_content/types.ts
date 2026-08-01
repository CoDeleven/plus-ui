import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';

export interface DestinationPageHighlight {
  icon?: string;
  title?: string;
  description?: string;
}

export interface DestinationPageCity {
  label?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  description?: string;
}

export interface DestinationPagePracticalInfo {
  title?: string;
  content?: string;
}

export interface DestinationPageContentVO {
  id: string | number;
  destinationId: string | number;
  currencyDictValue?: string;
  languageDictValue?: string;
  timeZoneDictValue?: string;
  visa?: string;
  visaTitle?: string;
  visaNote?: string;
  introduction?: string[];
  highlights?: DestinationPageHighlight[];
  cities?: DestinationPageCity[];
  practicalInfo?: DestinationPagePracticalInfo[];
  status: number;
  createTime?: string;
  updateTime?: string;
  remark?: string;
  destinationName?: string;
  destinationNameEn?: string;
  destinationImage?: string;
  destinationImageUrl?: string;
  regionId?: string | number;
  regionName?: string;
  regionNameEn?: string;
  completeness?: number;
  missingItems?: string[];
  destination?: DestinationVO;
}

export interface DestinationPageContentForm extends BaseEntity {
  id?: string | number;
  destinationId?: string | number;
  currencyDictValue?: string;
  languageDictValue?: string;
  timeZoneDictValue?: string;
  visa?: string;
  visaTitle?: string;
  visaNote?: string;
  introduction?: string[];
  highlights?: DestinationPageHighlight[];
  cities?: DestinationPageCity[];
  practicalInfo?: DestinationPagePracticalInfo[];
  status?: number;
}

export interface DestinationPageContentQuery extends PageQuery {
  destinationId?: string | number;
  destinationName?: string;
  status?: number;
  params?: any;
}
