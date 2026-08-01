import type { DestinationVO } from '@/api/boxhilltravel_manager/destination/types';

export interface FeaturedDestinationVO {
  id: string | number;
  destinationId: string | number;
  label?: string;
  sortOrder: number;
  status: string | number;
  createTime?: string;
  updateTime?: string;
  remark?: string;
  destinationName?: string;
  destinationNameEn?: string;
  destinationLevel?: number;
  destinationImage?: string;
  destinationImageUrl?: string;
  destinationDescription?: string;
  regionId?: string | number;
  regionName?: string;
  regionNameEn?: string;
  destination?: DestinationVO;
}

export interface FeaturedDestinationForm extends BaseEntity {
  id?: string | number;
  destinationId?: string | number;
  label?: string;
  sortOrder?: number;
  status?: string | number;
  remark?: string;
}

export interface FeaturedDestinationQuery extends PageQuery {
  destinationId?: string | number;
  destinationName?: string;
  label?: string;
  status?: string | number;
  params?: any;
}
