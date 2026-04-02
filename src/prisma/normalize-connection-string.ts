export function normalizePostgresConnectionString(connectionString?: string): string {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  const useLibpqCompat = url.searchParams.get('uselibpqcompat');

  if (sslMode === 'require' && useLibpqCompat !== 'true') {
    url.searchParams.set('sslmode', 'verify-full');
  }

  return url.toString();
}
