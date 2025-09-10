import { ApiResponse, ResponseMeta } from './api-response.interface';

export interface RawResponseData<T = any> {
  data: T;
  message?: string;
  meta?: ResponseMeta;
}

export type InterceptorData<T> = T | RawResponseData<T> | ApiResponse<T>;
