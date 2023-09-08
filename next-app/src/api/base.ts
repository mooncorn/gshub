import { env } from '@/env.mjs';
import axios from 'axios';

const NEXT_PUBLIC_API_URL = env.NEXT_PUBLIC_API_URL;

export const base = axios.create({
  baseURL: `${NEXT_PUBLIC_API_URL}/api/`,
  withCredentials: true,
});
