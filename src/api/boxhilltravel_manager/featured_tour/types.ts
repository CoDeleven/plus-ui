export interface Featured_tourVO {
  /**
   * 主键ID
   */
  id: string | number;
  /**
   * 线路ID，引用 holidays_tour.id
   */
  tourId: string | number;
  /**
   * 展示顺序，数值越小越靠前
   */
  sortOrder: number;
  /**
   * 娣诲姞鏃堕棿
   */
  createTime?: string;
}

export interface Featured_tourForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;
  /**
   * 线路ID，引用 holidays_tour.id
   */
  tourId?: string | number;
  /**
   * 展示顺序，数值越小越靠前
   */
  sortOrder?: number;
}

export interface Featured_tourQuery extends PageQuery {
  /**
   * 线路ID，引用 holidays_tour.id
   */
  tourId?: string | number;
  /**
   * 日期范围参数
   */
  params?: any;
}
