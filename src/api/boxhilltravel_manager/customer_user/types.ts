export interface CustomerProfileVO {
  customerUserId?: string | number;
  nickname?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerContactInfoVO {
  customerUserId?: string | number;
  mailingAddress?: string;
  city?: string;
  postalCode?: string;
  region?: string;
  country?: string;
  contactEmail?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerUserVO {
  userId: string | number;
  userName: string;
  nickName?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string | number;
  avatarUrl?: string;
  profileNickname?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
  loginIp?: string;
  loginDate?: string;
  createTime?: string;
  updateTime?: string;
}

export interface CustomerUserDetailVO extends CustomerUserVO {
  gender?: string;
  deptId?: string | number;
  remark?: string;
  profile?: CustomerProfileVO;
  contactInfo?: CustomerContactInfoVO;
}

export interface CustomerUserQuery extends PageQuery {
  userName?: string;
  nickName?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  params?: any;
}
