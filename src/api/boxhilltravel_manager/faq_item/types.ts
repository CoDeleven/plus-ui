export interface Faq_itemVO {
  /**
   * Primary key.
   */
  id: string | number;
  /**
   * Group ID.
   */
  groupId: string | number;
  /**
   * Group name.
   */
  groupName: string;
  /**
   * FAQ module dictionary value.
   */
  module: number;
  /**
   * Question.
   */
  question: string;
  /**
   * Answer, HTML supported.
   */
  answer: string;
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

export interface Faq_itemForm extends BaseEntity {
  /**
   * Primary key.
   */
  id?: string | number;
  /**
   * FAQ module dictionary value.
   */
  module?: number;
  /**
   * Group ID.
   */
  groupId?: string | number;
  /**
   * Question.
   */
  question?: string;
  /**
   * Answer, HTML supported.
   */
  answer?: string;
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

export interface Faq_itemQuery extends PageQuery {
  /**
   * FAQ module dictionary value.
   */
  module?: number;
  /**
   * Group ID.
   */
  groupId?: string | number;
  /**
   * Question.
   */
  question?: string;
  /**
   * Status: 1 enabled, 0 disabled.
   */
  status?: string;
  /**
   * Date range params.
   */
  params?: any;
}
