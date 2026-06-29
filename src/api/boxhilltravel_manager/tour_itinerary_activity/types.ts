export interface Tour_itinerary_activityVO {
  /**
   * 
   */
  id: string | number;
  /**
   * 行程ID
   */
  itineraryId: string | number;
  /**
   * 线路ID
   */
  tourId: string | number;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 活动图标
   */
  activityIcon: string;
  /**
   * 副标签列表, JSON列表
   */
  subtitle: string;
  /**
   * 
   */
  sortOrder: number;
  /**
   * 是否在预览时展示：0不展示，1展示
   */
  showInPreview: number;
}

export interface Tour_itinerary_activityForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;
  /**
   * 行程ID
   */
  itineraryId?: string | number;
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 标题
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 活动图标
   */
  activityIcon?: string;
  /**
   * 副标签列表, JSON列表
   */
  subtitle?: string;
  /**
   * 
   */
  sortOrder?: number;
  /**
   * 是否在预览时展示：0不展示，1展示
   */
  showInPreview?: number;
}

export interface Tour_itinerary_activityQuery extends PageQuery {
  /**
   * 行程ID
   */
  itineraryId?: string | number;
  /**
   * 线路ID
   */
  tourId?: string | number;
  /**
   * 标题
   */
  title?: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 活动图标
   */
  activityIcon?: string;
  /**
   * 副标签列表, JSON列表
   */
  subtitle?: string;
  /**
   * 
   */
  sortOrder?: number;
  /**
   * 是否在预览时展示：0不展示，1展示
   */
  showInPreview?: number;
  /**
   * 日期范围参数
   */
  params?: any;
}
