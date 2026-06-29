export interface Faq_groupVO {
  /**
   * 主键ID
   */
  id: string | number;
  /**
   * 分组名称
   */
  groupName: string;
  /**
   * 分组图标(emoji)
   */
  icon: string;
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

export interface Faq_groupForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;
  /**
   * 分组名称
   */
  groupName?: string;
  /**
   * 分组图标(emoji)
   */
  icon?: string;
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

export interface Faq_groupQuery extends PageQuery {
  /**
   * 分组名称
   */
  groupName?: string;
  /**
   * 状态（1启用 0停用）
   */
  status?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
