export interface Faq_groupVO {
  /**
   * Primary key.
   */
  id: string | number;
  /**
   * FAQ module dictionary value.
   */
  module: number;
  /**
   * Group name.
   */
  groupName: string;
  /**
   * Group icon or emoji.
   */
  icon: string;
  /**
   * Sort order.
   */
  sortOrder: number;
  /**
   * Status: 1 enabled, 0 disabled.
   */
  status: string;
  /**
   * Remark.
   */
  remark: string;
}

export interface Faq_groupForm extends BaseEntity {
  /**
   * Primary key.
   */
  id?: string | number;
  /**
   * FAQ module dictionary value.
   */
  module?: number;
  /**
   * Group name.
   */
  groupName?: string;
  /**
   * Group icon or emoji.
   */
  icon?: string;
  /**
   * Sort order.
   */
  sortOrder?: number;
  /**
   * Status: 1 enabled, 0 disabled.
   */
  status?: string;
  /**
   * Remark.
   */
  remark?: string;
}

export interface Faq_groupQuery extends PageQuery {
  /**
   * FAQ module dictionary value.
   */
  module?: number;
  /**
   * Group name.
   */
  groupName?: string;
  /**
   * Status: 1 enabled, 0 disabled.
   */
  status?: string;
  /**
   * Date range params.
   */
  params?: any;
}
