import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';

export interface DestinationTagVO {
  id: string | number;
  destinationId: string | number;
  dictValue: string;
  sortOrder: number;
  createTime?: string;
  updateTime?: string;
  destinationName?: string;
  destinationNameEn?: string;
  destinationLevel?: number;
  destinationImage?: string;
  destinationImageUrl?: string;
  destinationDescription?: string;
  regionId?: string | number;
  regionName?: string;
  regionNameEn?: string;
  dictLabel?: string;
  dictSort?: number;
  destination?: DestinationVO;
}

export interface DestinationTagForm extends BaseEntity {
  id?: string | number;
  destinationId?: string | number;
  dictValue?: string;
  sortOrder?: number;
}

export interface DestinationTagQuery extends PageQuery {
  destinationId?: string | number;
  destinationName?: string;
  dictValue?: string;
  params?: any;
}
