import type { Hot_deal_tourForm, Hot_deal_tourQuery, Hot_deal_tourVO } from '@/api/boxhilltravel_manager/hot_deal_tour/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询热卖线路列表
 * @param query
 * @returns {*}
 */

export const listHot_deal_tour = (query?: Hot_deal_tourQuery): AxiosPromise<PageResult<Hot_deal_tourVO>> => {
  return request({
    url: '/boxhilltravel-manager/hot_deal_tour/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询热卖线路详细
 * @param id
 */
export const getHot_deal_tour = (id: string | number): AxiosPromise<Hot_deal_tourVO> => {
  return request({
    url: '/boxhilltravel-manager/hot_deal_tour/' + id,
    method: 'get'
  });
};

/**
 * 新增热卖线路
 * @param data
 */
export const addHot_deal_tour = (data: Hot_deal_tourForm) => {
  return request({
    url: '/boxhilltravel-manager/hot_deal_tour',
    method: 'post',
    data: data
  });
};

/**
 * 修改热卖线路
 * @param data
 */
export const updateHot_deal_tour = (data: Hot_deal_tourForm) => {
  return request({
    url: '/boxhilltravel-manager/hot_deal_tour',
    method: 'put',
    data: data
  });
};



/**
 * 删除热卖线路
 * @param id
 */
export const delHot_deal_tour = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel-manager/hot_deal_tour/' + id,
    method: 'delete'
  });
};


