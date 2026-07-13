export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface AuthUser {
  id: string;
  username: string;
  password: string;
  role: string;
  status: string;
  branch_id?: string;
  branches?: {
    id: string;
    name: string;
  },
  staff?: {
    id: string;
    full_name: string;
    phone: string;
  },
  customers?: {
    id?: string;
    full_name: string;
    phone: string;
  }
}