import { Request } from 'express';

export function generateBaseUrl(request: Request) {
  return `${request.protocol}://${request.get('host')}${request.path}`;
}
