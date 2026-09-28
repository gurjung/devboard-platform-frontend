export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
  };
}
