import type {
  CustomerContactUsChangeStatusForm,
  CustomerContactUsQuery,
  CustomerContactUsVO
} from '@/api/boxhilltravel_manager/contact_us/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listCustomerContactUs = (query?: CustomerContactUsQuery): AxiosPromise<PageResult<CustomerContactUsVO>> => {
  return request({
    url: '/boxhilltravel_manager/contact_us/list',
    method: 'get',
    params: query
  });
};

export const getCustomerContactUs = (id: string | number): AxiosPromise<CustomerContactUsVO> => {
  return request({
    url: '/boxhilltravel_manager/contact_us/' + id,
    method: 'get'
  });
};

export const changeCustomerContactUsStatus = (data: CustomerContactUsChangeStatusForm): AxiosPromise<void> => {
  return request({
    url: '/boxhilltravel_manager/contact_us/changeStatus',
    method: 'put',
    data
  });
};

export const delCustomerContactUs = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/contact_us/' + id,
    method: 'delete'
  });
};
