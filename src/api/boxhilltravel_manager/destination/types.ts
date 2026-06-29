export interface DestinationQuery {
  name?: string;
  nameEn?: string;
  parentId?: string | number;
  level?: number;
  status?: string | number;
  params?: any;
}

export interface DestinationTreeOption {
  id: string | number;
  label: string;
  parentId?: string | number;
  weight?: number;
  children?: DestinationTreeOption[];
  name?: string;
  nameEn?: string;
  level?: number;
  status?: string | number;
}

export interface DestinationVO {
  /**
   * 目的地ID
   */
  id: string | number;
  /**
   * 目的地名称
   */
  name: string;
  /**
   * 目的地英文名称
   */
  nameEn: string;
  /**
   * 父级ID，0表示顶级（大洲）
   */
  parentId: string | number;
  /**
   * 层级：1大洲 2国家 3城市
   */
  level: number;
  /**
   * 封面图URL
   */
  image: string;
  /**
   * 封面图URLUrl
   */
  imageUrl: string;
  /**
   * 
   */
  description: string;
  /**
   * 排序
   */
  sort: number;
  /**
   * 状态 0禁用 1启用
   */
  status: number;
}

export interface DestinationForm extends BaseEntity {
  /**
   * 目的地ID
   */
  id?: string | number;
  /**
   * 目的地名称
   */
  name?: string;
  /**
   * 目的地英文名称
   */
  nameEn?: string;
  /**
   * 父级ID，0表示顶级（大洲）
   */
  parentId?: string | number;
  /**
   * 层级：1大洲 2国家 3城市
   */
  level?: number;
  /**
   * 封面图URL
   */
  image?: string;
  /**
   * 
   */
  description?: string;
  /**
   * 排序
   */
  sort?: number;
  /**
   * 状态 0禁用 1启用
   */
  status?: string | number;
}

export interface DestinationQuery extends PageQuery {
  /**
   * 目的地英文名称
   */
  nameEn?: string;
  /**
   * 层级：1大洲 2国家 3城市
   */
  level?: number;
  /**
   * 状态 0禁用 1启用
   */
  status?: string | number;
  /**
   * 日期范围参数
   */
  params?: any;
}
