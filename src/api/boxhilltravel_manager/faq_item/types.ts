export interface Faq_itemVO {
  /**
   * 主键ID
   */
  id: string | number;
  /**
   * 分组ID
   */
  groupId: string | number;
  /**
   * 分组名称
   */
  groupName: string;
  /**
   * 问题
   */
  question: string;
  /**
   * 答案(支持HTML)
   */
  answer: string;
  /**
   * 排序
   */
  sortOrder: number;
  /**
   * 状态（1启用 0停用）
   */
  status: string;
  /**
   * 备注
   */
  remark: string;
}

export interface Faq_itemForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;
  /**
   * 分组ID
   */
  groupId?: string | number;
  /**
   * 问题
   */
  question?: string;
  /**
   * 答案(支持HTML)
   */
  answer?: string;
  /**
   * 排序
   */
  sortOrder?: number;
  /**
   * 状态（1启用 0停用）
   */
  status?: string;
  /**
   * 备注
   */
  remark?: string;
}

export interface Faq_itemQuery extends PageQuery {
  /**
   * 分组ID
   */
  groupId?: string | number;
  /**
   * 问题
   */
  question?: string;
  /**
   * 状态（1启用 0停用）
   */
  status?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
