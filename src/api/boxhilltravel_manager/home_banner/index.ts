import type { Home_bannerForm, Home_bannerQuery, Home_bannerVO } from '@/api/boxhilltravel_manager/home_banner/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询首页横幅列表
 * @param query
 * @returns {*}
 */

export const listHome_banner = (query?: Home_bannerQuery): AxiosPromise<PageResult<Home_bannerVO>> => {
  return request({
    url: '/boxhilltravel_manager/home_banner/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询首页横幅详细
 * @param id
 */
export const getHome_banner = (id: string | number): AxiosPromise<Home_bannerVO> => {
  return request({
    url: '/boxhilltravel_manager/home_banner/' + id,
    method: 'get'
  });
};

/**
 * 新增首页横幅
 * @param data
 */
export const addHome_banner = (data: Home_bannerForm) => {
  return request({
    url: '/boxhilltravel_manager/home_banner',
    method: 'post',
    data: data
  });
};

/**
 * 修改首页横幅
 * @param data
 */
export const updateHome_banner = (data: Home_bannerForm) => {
  return request({
    url: '/boxhilltravel_manager/home_banner',
    method: 'put',
    data: data
  });
};

/**
 * 删除首页横幅
 * @param id
 */
export const delHome_banner = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/home_banner/' + id,
    method: 'delete'
  });
};