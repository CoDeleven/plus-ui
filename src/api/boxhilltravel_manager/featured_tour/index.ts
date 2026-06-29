import type { Featured_tourForm, Featured_tourQuery, Featured_tourVO } from '@/api/boxhilltravel_manager/featured_tour/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询精选线路列表
 * @param query
 * @returns {*}
 */

export const listFeatured_tour = (query?: Featured_tourQuery): AxiosPromise<PageResult<Featured_tourVO>> => {
  return request({
    url: '/boxhilltravel_manager/featured_tour/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询精选线路详细
 * @param id
 */
export const getFeatured_tour = (id: string | number): AxiosPromise<Featured_tourVO> => {
  return request({
    url: '/boxhilltravel_manager/featured_tour/' + id,
    method: 'get'
  });
};

/**
 * 新增精选线路
 * @param data
 */
export const addFeatured_tour = (data: Featured_tourForm) => {
  return request({
    url: '/boxhilltravel_manager/featured_tour',
    method: 'post',
    data: data
  });
};

/**
 * 修改精选线路
 * @param data
 */
export const updateFeatured_tour = (data: Featured_tourForm) => {
  return request({
    url: '/boxhilltravel_manager/featured_tour',
    method: 'put',
    data: data
  });
};


/**
 * 调整精选线路排序
 * @param id
 * @param sortValue
 */
export const updateFeatured_tourSort = (id: string | number, sortValue:  number) => {
  return request({
    url: '/boxhilltravel_manager/featured_tour/updateSort',
    method: 'put',
    data: {
      id,
      sortOrder: sortValue
    }
  });
};

/**
 * 删除精选线路
 * @param id
 */
export const delFeatured_tour = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/featured_tour/' + id,
    method: 'delete'
  });
};


