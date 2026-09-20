export interface Home_bannerVO {
  /**
   * 主键ID
   */
  id: string | number;
  /**
   * 横幅图片(OSS id)
   */
  image?: string;
  /**
   * 横幅图片URL
   */
  imageUrl?: string;
  /**
   * 替代文本
   */
  altText?: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 副标题
   */
  subtitle?: string;
  /**
   * 跳转链接
   */
  linkUrl?: string;
  /**
   * 展示顺序，数值越小越靠前
   */
  sortOrder?: number;
  /**
   * 状态 0禁用 1启用
   */
  status?: number;
  /**
   * 创建时间
   */
  createTime?: string;
}

export interface Home_bannerForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;
  /**
   * 横幅图片(OSS id)
   */
  image?: string;
  /**
   * 替代文本
   */
  altText?: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 副标题
   */
  subtitle?: string;
  /**
   * 跳转链接
   */
  linkUrl?: string;
  /**
   * 展示顺序，数值越小越靠前
   */
  sortOrder?: number;
  /**
   * 状态 0禁用 1启用
   */
  status?: number;
}

export interface Home_bannerQuery extends PageQuery {
  /**
   * 标题
   */
  title?: string;
  /**
   * 状态 0禁用 1启用
   */
  status?: number;
  /**
   * 日期范围参数
   */
  params?: any;
}