// Single axios instance used across the entire app.
// All interceptors (auth headers, error toasts, 401 redirect) live in lib/api.ts.
export { default } from '../lib/api';
