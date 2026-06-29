import type { AxiosPromise } from '@/utils/api-types';
import type { PageResult } from '@/api/types';
import request from '@/utils/request';
import type { DestinationQuery, DestinationTreeOption, DestinationVO, DestinationForm } from './types';

export const listDestinationTree = (query?: DestinationQuery): AxiosPromise<DestinationTreeOption[]> => {
  return request({
    url: '/boxhilltravel_manager/destination/tree',
    method: 'get',
    params: query
  });
};

export const listDestination = (query?: DestinationQuery): AxiosPromise<PageResult<DestinationVO>> => {
  return request({
    url: '/boxhilltravel_manager/destination/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询目的地分类详细
 * @param id
 */
export const getDestination = (id: string | number): AxiosPromise<DestinationVO> => {
  return request({
    url: '/boxhilltravel_manager/destination/' + id,
    method: 'get'
  });
};

/**
 * 新增目的地分类
 * @param data
 */
export const addDestination = (data: DestinationForm) => {
  return request({
    url: '/boxhilltravel_manager/destination',
    method: 'post',
    data: data
  });
};

/**
 * 修改目的地分类
 * @param data
 */
export const updateDestination = (data: DestinationForm) => {
  return request({
    url: '/boxhilltravel_manager/destination',
    method: 'put',
    data: data
  });
};



/**
 * 删除目的地分类
 * @param id
 */
export const delDestination = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/destination/' + id,
    method: 'delete'
  });
};


