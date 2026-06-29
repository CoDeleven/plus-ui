export interface Tour_service_itemVO {
  /**
   * ID
   */
  id: string | number;
  /**
   * 线路ID
   */
  tourId: string | number;
  /**
   * 项目类型 1=包含项 2=不包含项
   */
  itemType: number;
  /**
   * 内容
   */
  content: string;
  /**
   * 排序
   */
  sortOrder: number;
}

export interface Tour_service_itemForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 项目类型 1=包含项 2=不包含项
   */
  itemType?: number;
  /**
   * 内容
   */
  content?: string;
  /**
   * 排序
   */
  sortOrder?: number;
}

export interface Tour_service_itemQuery extends PageQuery {
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 项目类型 1=包含项 2=不包含项
   */
  itemType?: number;
  /**
   * 内容
   */
  content?: string;
  /**
   * 排序
   */
  sortOrder?: number;
  /**
   * 日期范围参数
   */
  params?: any;
}
