import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { DestinationTagForm, DestinationTagQuery, DestinationTagVO } from './types';

export const listDestinationTag = (query?: DestinationTagQuery): AxiosPromise<PageResult<DestinationTagVO>> => {
  return request({
    url: '/boxhilltravel_manager/destination_tag/list',
    method: 'get',
    params: query
  });
};

export const getDestinationTag = (id: string | number): AxiosPromise<DestinationTagVO> => {
  return request({
    url: '/boxhilltravel_manager/destination_tag/' + id,
    method: 'get'
  });
};

export const addDestinationTag = (data: DestinationTagForm) => {
  return request({
    url: '/boxhilltravel_manager/destination_tag',
    method: 'post',
    data
  });
};

export const updateDestinationTag = (data: DestinationTagForm) => {
  return request({
    url: '/boxhilltravel_manager/destination_tag',
    method: 'put',
    data
  });
};

export const updateDestinationTagSort = (id: string | number, sortOrder: number) => {
  return request({
    url: '/boxhilltravel_manager/destination_tag/updateSort',
    method: 'put',
    data: { id, sortOrder }
  });
};

export const delDestinationTag = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/destination_tag/' + id,
    method: 'delete'
  });
};
