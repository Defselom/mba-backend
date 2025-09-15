export function isPresignedUrl(url?: string): boolean {
  if (!url || !url.includes('?')) return false;
  const qs = url.split('?')[1] ?? '';

  return (
    qs.includes('X-Amz-Signature=') ||
    qs.includes('X-Amz-Algorithm=') ||
    qs.includes('X-Amz-Credential=')
  );
}

export function getRawUrl(url?: string): string | undefined {
  if (!url) return url;

  return url.split('?')[0];
}
