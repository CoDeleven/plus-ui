export interface TourVO {
  /**
   * 线路ID
   */
  id: string | number;
  /**
   * 线路代码(唯一)
   */
  code: string;
  /**
   * 线路名称
   */
  name: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 行程天数
   */
  durationDays: number;
  /**
   * 旅行风格
   */
  travelStyle: number;
  /**
   * 服务等级
   */
  serviceLevel: number;
  /**
   * 线路强度 1-5
   */
  physicalRating: number;
  /**
   * 线路类型
   */
  tripType: number;
  /**
   * CollectionTag
   */
  collectionTag?: string;
  /**
   * 途径国家
   */
  countryNames?: string[];
  /**
   * 最小年龄
   */
  minAge: number;
  /**
   * 基础价格
   */
  basePrice: number;
  /**
   * 销售价格
   */
  salePrice: number;
  /**
   * Single Supplement
   */
  singleSupplement?: number;
  /**
   * 货币
   */
  currency: string;
  /**
   * 封面图URL
   */
  coverImage: string;
  /**
   * 封面图URLUrl
   */
  coverImageUrl: string;
  /**
   * 地图URL
   */
  mapImage: string;
  /**
   * 地图URLUrl
   */
  mapImageUrl: string;
  /**
   * ????
   */
  notes: string;
  /**
   * 最晚到达时间
   */
  latestArrivalTime?: string;
  /**
   * 最早离开时间
   */
  earliestDepartureTime?: string;
  /**
   * 状态 0草稿 1上架 2下架
   */
  status: number;
  /**
   * SEO标题
   */
  seoTitle: string;
  /**
   * SEO描述
   */
  seoDescription: string;
  /**
   * SEO关键词
   */
  seoKeywords: string;
  /**
   * 删除时间
   */
  deletedAt: string;
}

export interface TourForm extends BaseEntity {
  /**
   * 线路ID
   */
  id?: string | number;
  /**
   * 线路代码(唯一)
   */
  code?: string;
  /**
   * 线路名称
   */
  name?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 行程天数
   */
  durationDays?: number;
  /**
   * 旅行风格
   */
  travelStyle?: number;
  /**
   * 服务等级
   */
  serviceLevel?: number;
  /**
   * 线路强度 1-5
   */
  physicalRating?: number;
  /**
   * 线路类型
   */
  tripType?: number;
  /**
   * CollectionTag
   */
  collectionTag?: string;
  /**
   * 最小年龄
   */
  minAge?: number;
  /**
   * 基础价格
   */
  basePrice?: number;
  /**
   * 销售价格
   */
  salePrice?: number;
  /**
   * Single Supplement
   */
  singleSupplement?: number;
  /**
   * 货币
   */
  currency?: string;
  /**
   * 封面图URL
   */
  coverImage?: string;
  /**
   * 地图URL
   */
  mapImage?: string;
  /**
   * ????
   */
  notes?: string;
  /**
   * 最晚到达时间
   */
  latestArrivalTime?: string;
  /**
   * 最早离开时间
   */
  earliestDepartureTime?: string;
  /**
   * 状态 0草稿 1上架 2下架
   */
  status?: number;
  /**
   * SEO标题
   */
  seoTitle?: string;
  /**
   * SEO描述
   */
  seoDescription?: string;
  /**
   * SEO关键词
   */
  seoKeywords?: string;
  /**
   * 删除时间
   */
  deletedAt?: string;
}

export interface TourQuery extends PageQuery {
  /**
   * 线路代码(唯一)
   */
  code?: string;
  /**
   * 线路名称
   */
  name?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 行程天数
   */
  durationDays?: number;
  /**
   * 旅行风格
   */
  travelStyle?: number;
  /**
   * 服务等级
   */
  serviceLevel?: number;
  /**
   * 线路强度 1-5
   */
  physicalRating?: number;
  /**
   * 线路类型
   */
  tripType?: number;
  /**
   * 国家名称关键字
   */
  countryName?: string;
  /**
   * 最小年龄
   */
  minAge?: number;
  /**
   * 基础价格
   */
  basePrice?: number;
  /**
   * 销售价格
   */
  salePrice?: number;
  /**
   * Single Supplement
   */
  singleSupplement?: number;
  /**
   * 货币
   */
  currency?: string;
  /**
   * 封面图URL
   */
  coverImage?: string;
  /**
   * 地图URL
   */
  mapImage?: string;
  /**
   * ????
   */
  notes?: string;
  /**
   * 状态 0草稿 1上架 2下架
   */
  status?: number;
  /**
   * SEO标题
   */
  seoTitle?: string;
  /**
   * SEO描述
   */
  seoDescription?: string;
  /**
   * SEO关键词
   */
  seoKeywords?: string;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
