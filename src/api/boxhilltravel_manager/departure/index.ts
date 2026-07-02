import type { DepartureForm, DepartureQuery, DepartureVO } from '@/api/boxhilltravel_manager/departure/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询团期列表
 * @param query
 * @returns {*}
 */

export const listDeparture = (query?: DepartureQuery): AxiosPromise<PageResult<DepartureVO>> => {
  return request({
    url: '/boxhilltravel_manager/departure/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询团期详细
 * @param id
 */
export const getDeparture = (id: string | number): AxiosPromise<DepartureVO> => {
  return request({
    url: '/boxhilltravel_manager/departure/' + id,
    method: 'get'
  });
};

/**
 * 新增团期
 * @param data
 */
export const addDeparture = (data: DepartureForm) => {
  return request({
    url: '/boxhilltravel_manager/departure',
    method: 'post',
    data: data
  });
};

/**
 * 修改团期
 * @param data
 */
export const updateDeparture = (data: DepartureForm) => {
  return request({
    url: '/boxhilltravel_manager/departure',
    method: 'put',
    data: data
  });
};



/**
 * 删除团期
 * @param id
 */
export const delDeparture = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/departure/' + id,
    method: 'delete'
  });
};


