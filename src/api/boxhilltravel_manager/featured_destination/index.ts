import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { FeaturedDestinationForm, FeaturedDestinationQuery, FeaturedDestinationVO } from './types';

export const listFeaturedDestination = (query?: FeaturedDestinationQuery): AxiosPromise<PageResult<FeaturedDestinationVO>> => {
  return request({
    url: '/boxhilltravel_manager/featured_destination/list',
    method: 'get',
    params: query
  });
};

export const getFeaturedDestination = (id: string | number): AxiosPromise<FeaturedDestinationVO> => {
  return request({
    url: '/boxhilltravel_manager/featured_destination/' + id,
    method: 'get'
  });
};

export const addFeaturedDestination = (data: FeaturedDestinationForm) => {
  return request({
    url: '/boxhilltravel_manager/featured_destination',
    method: 'post',
    data
  });
};

export const updateFeaturedDestination = (data: FeaturedDestinationForm) => {
  return request({
    url: '/boxhilltravel_manager/featured_destination',
    method: 'put',
    data
  });
};

export const updateFeaturedDestinationSort = (id: string | number, sortOrder: number) => {
  return request({
    url: '/boxhilltravel_manager/featured_destination/updateSort',
    method: 'put',
    data: { id, sortOrder }
  });
};

export const changeFeaturedDestinationStatus = (id: string | number, status: string | number) => {
  return request({
    url: '/boxhilltravel_manager/featured_destination/changeStatus',
    method: 'put',
    data: { id, status }
  });
};

export const delFeaturedDestination = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/featured_destination/' + id,
    method: 'delete'
  });
};
