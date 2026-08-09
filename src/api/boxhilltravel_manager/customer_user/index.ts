import type { CustomerUserDetailVO, CustomerUserQuery, CustomerUserVO } from '@/api/boxhilltravel_manager/customer_user/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listCustomerUser = (query?: CustomerUserQuery): AxiosPromise<PageResult<CustomerUserVO>> => {
  return request({
    url: '/boxhilltravel_manager/customer_user/list',
    method: 'get',
    params: query
  });
};

export const getCustomerUser = (userId: string | number): AxiosPromise<CustomerUserDetailVO> => {
  return request({
    url: '/boxhilltravel_manager/customer_user/' + userId,
    method: 'get'
  });
};

export const changeCustomerUserStatus = (userId: string | number, status: string): AxiosPromise<void> => {
  return request({
    url: '/boxhilltravel_manager/customer_user/changeStatus',
    method: 'put',
    data: {
      userId,
      status
    }
  });
};
