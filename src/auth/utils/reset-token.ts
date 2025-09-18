import crypto from 'crypto';

export function generateResetToken(): { tokenPlain: string; tokenHash: string } {
  // 32 octets -> 64 hex
  const tokenPlain = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(tokenPlain).digest('hex');

  return { tokenPlain, tokenHash };
}

export function hashResetToken(tokenPlain: string): string {
  return crypto.createHash('sha256').update(tokenPlain).digest('hex');
}
