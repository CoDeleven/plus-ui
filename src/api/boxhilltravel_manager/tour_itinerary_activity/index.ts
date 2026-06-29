import type { Tour_itinerary_activityForm, Tour_itinerary_activityQuery, Tour_itinerary_activityVO } from '@/api/boxhilltravel_manager/tour_itinerary_activity/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询行程活动列表
 * @param query
 * @returns {*}
 */

export const listTour_itinerary_activity = (query?: Tour_itinerary_activityQuery): AxiosPromise<PageResult<Tour_itinerary_activityVO>> => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary_activity/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询行程活动详细
 * @param id
 */
export const getTour_itinerary_activity = (id: string | number): AxiosPromise<Tour_itinerary_activityVO> => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary_activity/' + id,
    method: 'get'
  });
};

/**
 * 新增行程活动
 * @param data
 */
export const addTour_itinerary_activity = (data: Tour_itinerary_activityForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary_activity',
    method: 'post',
    data: data
  });
};

/**
 * 修改行程活动
 * @param data
 */
export const updateTour_itinerary_activity = (data: Tour_itinerary_activityForm) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary_activity',
    method: 'put',
    data: data
  });
};



/**
 * 删除行程活动
 * @param id
 */
export const delTour_itinerary_activity = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/tour_itinerary_activity/' + id,
    method: 'delete'
  });
};


