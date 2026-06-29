import type { Tour_service_itemForm, Tour_service_itemQuery, Tour_service_itemVO } from '@/api/boxhilltravel_manager/tour_service_item/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询线路服务项列表
 * @param query
 * @returns {*}
 */

export const listTour_service_item = (query?: Tour_service_itemQuery): AxiosPromise<PageResult<Tour_service_itemVO>> => {
  return request({
    url: '/boxhilltravel_manager/tour_service_item/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询线路服务项详细
 * @param id
 */
export const getTour_service_item = (id: string | number): AxiosPromise<Tour_service_itemVO> => {
  return request({
    url: '/boxhilltravel_manager/tour_service_item/' + id,
    method: 'get'
  });
};

/**
 * 新增线路服务项
 * @param data
 */
export const addTour_service_item = (data: Tour_service_itemForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_service_item',
    method: 'post',
    data: data
  });
};

/**
 * 修改线路服务项
 * @param data
 */
export const updateTour_service_item = (data: Tour_service_itemForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_service_item',
    method: 'put',
    data: data
  });
};



/**
 * 删除线路服务项
 * @param id
 */
export const delTour_service_item = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/tour_service_item/' + id,
    method: 'delete'
  });
};


