import { Request } from 'express';

export function generateBaseUrl(request: Request): string {
  const url = new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`);

  url.searchParams.delete('page');
  url.searchParams.delete('limit');

  return `${url.origin}${url.pathname}${url.search}`;
}
