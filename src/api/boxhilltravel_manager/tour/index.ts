import type { TourForm, TourQuery, TourVO } from '@/api/boxhilltravel_manager/tour/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询线路管理列表
 * @param query
 * @returns {*}
 */

export const listTour = (query?: TourQuery): AxiosPromise<PageResult<TourVO>> => {
  return request({
    url: '/boxhilltravel_manager/tour/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询线路管理详细
 * @param id
 */
export const getTour = (id: string | number): AxiosPromise<TourVO> => {
  return request({
    url: '/boxhilltravel_manager/tour/' + id,
    method: 'get'
  });
};

/**
 * 新增线路管理
 * @param data
 */
export const addTour = (data: TourForm) => {
  return request({
    url: '/boxhilltravel_manager/tour',
    method: 'post',
    data: data
  });
};

/**
 * 修改线路管理
 * @param data
 */
export const updateTour = (data: TourForm) => {
  return request({
    url: '/boxhilltravel_manager/tour',
    method: 'put',
    data: data
  });
};

/**
 * 修改线路管理状态
 * @param id
 * @param status
 */
export const changeTourStatus = (id: string | number, status:  number) => {
  return request({
    url: '/boxhilltravel_manager/tour/changeStatus',
    method: 'put',
    data: {
      id,
      status: status
    }
  });
};


/**
 * 删除线路管理
 * @param id
 */
export const delTour = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/tour/' + id,
    method: 'delete'
  });
};


