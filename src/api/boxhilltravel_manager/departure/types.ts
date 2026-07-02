export interface DepartureVO {
  /**
   * 
   */
  id: string | number;
  /**
   * 出发日期
   */
  departureDate: string;
  /**
   * 返程日期
   */
  returnDate: string;
  /**
   * 行程天数
   */
  durationDays: number;
  /**
   * 团期类型 1固定 2不固定
   */
  departureType: number;
  /**
   * 核载人数
   */
  maxCapacity: number;
  /**
   * 最小成团人数
   */
  minCapacity: number;
  /**
   * 已预订人数
   */
  bookedCount: number;
  /**
   * 剩余名额
   */
  availableCount: number;
  /**
   * 原价
   */
  basePrice: number;
  /**
   * 售价
   */
  salePrice: number;
  /**
   * 折扣率
   */
  discountRate: number;
  /**
   * 状态 1可预订 2已满 3已结束 4已取消
   */
  status: number;
  /**
   * 备注
   */
  remark: string;
}

export interface DepartureForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 出发日期
   */
  departureDate?: string;
  /**
   * 返程日期
   */
  returnDate?: string;
  /**
   * 行程天数
   */
  durationDays?: number;
  /**
   * 团期类型 1固定 2不固定
   */
  departureType?: number;
  /**
   * 核载人数
   */
  maxCapacity?: number;
  /**
   * 最小成团人数
   */
  minCapacity?: number;
  /**
   * 已预订人数
   */
  bookedCount?: number;
  /**
   * 剩余名额
   */
  availableCount?: number;
  /**
   * 原价
   */
  basePrice?: number;
  /**
   * 售价
   */
  salePrice?: number;
  /**
   * 折扣率
   */
  discountRate?: number;
  /**
   * 状态 1可预订 2已满 3已结束 4已取消
   */
  status?: number;
  /**
   * 备注
   */
  remark?: string;
}

export interface DepartureQuery extends PageQuery {
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 状态 1可预订 2已满 3已结束 4已取消
   */
  status?: number;
  /**
   * 日期范围参数
   */
  params?: any;
}
