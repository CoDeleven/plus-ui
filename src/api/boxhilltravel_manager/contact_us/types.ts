export interface CustomerContactUsVO {
  id: string | number;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  enquiryType: string;
  message: string;
  ipAddress?: string;
  readStatus: number;
  readTime?: string;
  createTime?: string;
  updateTime?: string;
}

export interface CustomerContactUsQuery extends PageQuery {
  fullName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  enquiryType?: string;
  message?: string;
  ipAddress?: string;
  readStatus?: number;
  params?: any;
}

export interface CustomerContactUsChangeStatusForm {
  id: string | number;
  readStatus: number;
}
