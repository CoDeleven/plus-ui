export interface ReviewVO {
  id: string | number;
  tourId: string | number;
  tourName?: string;
  orderId?: string | number;
  customerUserId?: string | number;
  nickname: string;
  avatar?: string;
  userAvatar?: string;
  title: string;
  content: string;
  rating: number;
  source: number;
  status: number;
  featured: number;
  sortOrder?: number;
  publishedAt?: string;
  rejectReason?: string;
  createTime?: string;
  updateTime?: string;
}

export interface ReviewForm extends BaseEntity {
  id?: string | number;
  tourId?: string | number;
  orderId?: string | number;
  customerUserId?: string | number;
  nickname?: string;
  avatar?: string;
  title?: string;
  content?: string;
  rating?: number;
  source?: number;
  status?: number;
  featured?: number;
  sortOrder?: number;
  publishedAt?: string;
  rejectReason?: string;
}

export interface ReviewQuery extends PageQuery {
  tourId?: string | number;
  tourName?: string;
  keyword?: string;
  source?: number;
  status?: number;
  params?: any;
}

export interface ReviewAuditForm {
  id: string | number;
  status: number;
  rejectReason?: string;
}

export interface ReviewFeaturedForm {
  id: string | number;
  featured: number;
}
