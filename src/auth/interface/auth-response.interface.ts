export interface authResponse {
  user: {
    sub: string;
    username: string;
    email: string;
    role?: string;
  };
  access_token: string;
  refresh_token: string;
}
