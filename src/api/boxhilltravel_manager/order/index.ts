import type { OrderQuery, OrderVO } from '@/api/boxhilltravel_manager/order/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listOrder = (query?: OrderQuery): AxiosPromise<PageResult<OrderVO>> => {
  return request({
    url: '/boxhilltravel_manager/order/list',
    method: 'get',
    params: query
  });
};

export const getOrder = (id: string | number): AxiosPromise<OrderVO> => {
  return request({
    url: '/boxhilltravel_manager/order/' + id,
    method: 'get'
  });
};
