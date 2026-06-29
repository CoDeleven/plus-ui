import type { Tour_itineraryForm, Tour_itineraryQuery, Tour_itineraryVO } from '@/api/boxhilltravel_manager/tour_itinerary/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询行程列表
 * @param query
 * @returns {*}
 */

export const listTour_itinerary = (query?: Tour_itineraryQuery): AxiosPromise<PageResult<Tour_itineraryVO>> => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询行程详细
 * @param id
 */
export const getTour_itinerary = (id: string | number): AxiosPromise<Tour_itineraryVO> => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary/' + id,
    method: 'get'
  });
};

/**
 * 新增行程
 * @param data
 */
export const addTour_itinerary = (data: Tour_itineraryForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary',
    method: 'post',
    data: data
  });
};

/**
 * 修改行程
 * @param data
 */
export const updateTour_itinerary = (data: Tour_itineraryForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary',
    method: 'put',
    data: data
  });
};



/**
 * 删除行程
 * @param id
 */
export const delTour_itinerary = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary/' + id,
    method: 'delete'
  });
};


