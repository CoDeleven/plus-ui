export interface Tour_itineraryVO {
  /**
   * 
   */
  id: string | number;
  /**
   * 线路ID
   */
  tourId: string | number;
  /**
   * 第几天
   */
  dayNumber: number;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 起始destinationId
   */
  fromDestinationId: string | number;
  /**
   * 结束destinationId
   */
  toDestinationId: string | number;
  /**
   * 餐食 B/L/D
   */
  meals: string;
}

export interface Tour_itineraryForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 第几天
   */
  dayNumber?: number;
  /**
   * 标题
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 起始destinationId
   */
  fromDestinationId?: string | number;
  /**
   * 结束destinationId
   */
  toDestinationId?: string | number;
  /**
   * 餐食 B/L/D
   */
  meals?: string;
}

export interface Tour_itineraryQuery extends PageQuery {
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 日期范围参数
   */
  params?: any;
}
