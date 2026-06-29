import type { Faq_itemForm, Faq_itemQuery, Faq_itemVO } from '@/api/boxhilltravel_manager/faq_item/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询FAQ条目列表
 * @param query
 * @returns {*}
 */

export const listFaq_item = (query?: Faq_itemQuery): AxiosPromise<PageResult<Faq_itemVO>> => {
  return request({
    url: '/boxhilltravel_manager/faq_item/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询FAQ条目详细
 * @param id
 */
export const getFaq_item = (id: string | number): AxiosPromise<Faq_itemVO> => {
  return request({
    url: '/boxhilltravel_manager/faq_item/' + id,
    method: 'get'
  });
};

/**
 * 新增FAQ条目
 * @param data
 */
export const addFaq_item = (data: Faq_itemForm) => {
  return request({
    url: '/boxhilltravel_manager/faq_item',
    method: 'post',
    data: data
  });
};

/**
 * 修改FAQ条目
 * @param data
 */
export const updateFaq_item = (data: Faq_itemForm) => {
  return request({
    url: '/boxhilltravel_manager/faq_item',
    method: 'put',
    data: data
  });
};

/**
 * 修改FAQ条目状态
 * @param id
 * @param status
 */
export const changeFaq_itemStatus = (id: string | number, status: string) => {
  return request({
    url: '/boxhilltravel_manager/faq_item/changeStatus',
    method: 'put',
    data: {
      id,
      status: status
    }
  });
};


/**
 * 删除FAQ条目
 * @param id
 */
export const delFaq_item = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/faq_item/' + id,
    method: 'delete'
  });
};


