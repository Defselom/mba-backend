import type { Response } from 'express';

import { TokenExpiration } from '@/auth/constants';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export function setAuthCookies(res: Response, tokens: AuthTokens, isProduction: boolean) {
  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    sameSite: 'none',
    secure: isProduction,
    maxAge: TokenExpiration.ACCESS_TOKEN,
  });

  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    sameSite: 'none',
    secure: isProduction,
    maxAge: TokenExpiration.REFRESH_TOKEN,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}
