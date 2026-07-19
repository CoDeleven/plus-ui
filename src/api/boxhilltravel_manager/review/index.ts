import type { ReviewAuditForm, ReviewFeaturedForm, ReviewForm, ReviewQuery, ReviewVO } from '@/api/boxhilltravel_manager/review/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listReview = (query?: ReviewQuery): AxiosPromise<PageResult<ReviewVO>> => {
  return request({
    url: '/boxhilltravel_manager/review/list',
    method: 'get',
    params: query
  });
};

export const getReview = (id: string | number): AxiosPromise<ReviewVO> => {
  return request({
    url: '/boxhilltravel_manager/review/' + id,
    method: 'get'
  });
};

export const addReview = (data: ReviewForm) => {
  return request({
    url: '/boxhilltravel_manager/review',
    method: 'post',
    data
  });
};

export const updateReview = (data: ReviewForm) => {
  return request({
    url: '/boxhilltravel_manager/review',
    method: 'put',
    data
  });
};

export const auditReview = (data: ReviewAuditForm) => {
  return request({
    url: '/boxhilltravel_manager/review/audit',
    method: 'put',
    data
  });
};

export const changeReviewFeatured = (data: ReviewFeaturedForm) => {
  return request({
    url: '/boxhilltravel_manager/review/changeFeatured',
    method: 'put',
    data
  });
};

export const delReview = (id: string | number | Array<string | number>) => {
  return request({
    url: '/boxhilltravel_manager/review/' + id,
    method: 'delete'
  });
};
