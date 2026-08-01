import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { DestinationPageContentForm, DestinationPageContentQuery, DestinationPageContentVO } from './types';

export const listDestinationPageContent = (query?: DestinationPageContentQuery): AxiosPromise<PageResult<DestinationPageContentVO>> => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content/list',
    method: 'get',
    params: query
  });
};

export const getDestinationPageContent = (id: string | number): AxiosPromise<DestinationPageContentVO> => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content/' + id,
    method: 'get'
  });
};

export const addDestinationPageContent = (data: DestinationPageContentForm) => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content',
    method: 'post',
    data
  });
};

export const updateDestinationPageContent = (data: DestinationPageContentForm) => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content',
    method: 'put',
    data
  });
};

export const changeDestinationPageContentStatus = (id: string | number, status: number) => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content/changeStatus',
    method: 'put',
    data: { id, status }
  });
};

export const delDestinationPageContent = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/destination_page_content/' + id,
    method: 'delete'
  });
};
