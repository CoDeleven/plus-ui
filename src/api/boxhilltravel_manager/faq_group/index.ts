import type { Faq_groupForm, Faq_groupQuery, Faq_groupVO } from '@/api/boxhilltravel_manager/faq_group/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询FAQ分组列表
 * @param query
 * @returns {*}
 */

export const listFaq_group = (query?: Faq_groupQuery): AxiosPromise<PageResult<Faq_groupVO>> => {
  return request({
    url: '/boxhilltravel_manager/faq_group/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询启用FAQ分组列表
 */
export const listEnabledFaq_group = (module?: number): AxiosPromise<Faq_groupVO[]> => {
  return request({
    url: '/boxhilltravel_manager/faq_group/enabledList',
    method: 'get',
    params: { module }
  });
};

/**
 * 查询FAQ分组详细
 * @param id
 */
export const getFaq_group = (id: string | number): AxiosPromise<Faq_groupVO> => {
  return request({
    url: '/boxhilltravel_manager/faq_group/' + id,
    method: 'get'
  });
};

/**
 * 新增FAQ分组
 * @param data
 */
export const addFaq_group = (data: Faq_groupForm) => {
  return request({
    url: '/boxhilltravel_manager/faq_group',
    method: 'post',
    data: data
  });
};

/**
 * 修改FAQ分组
 * @param data
 */
export const updateFaq_group = (data: Faq_groupForm) => {
  return request({
    url: '/boxhilltravel_manager/faq_group',
    method: 'put',
    data: data
  });
};

/**
 * 修改FAQ分组状态
 * @param id
 * @param status
 */
export const changeFaq_groupStatus = (id: string | number, status: string) => {
  return request({
    url: '/boxhilltravel_manager/faq_group/changeStatus',
    method: 'put',
    data: {
      id,
      status: status
    }
  });
};


/**
 * 删除FAQ分组
 * @param id
 */
export const delFaq_group = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/faq_group/' + id,
    method: 'delete'
  });
};


