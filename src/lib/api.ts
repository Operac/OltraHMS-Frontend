import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// ---- Silent access-token refresh on 401 -------------------------------------
// The access token is short-lived (15m). Rather than forcing a re-login on every
// expiry, we exchange the stored refresh token for a new access token and replay
// the original request. Concurrent 401s share a single in-flight refresh.
//
// Most of the app calls the default `axios` instance directly (with manual
// headers), while services/login use this `api` instance — so the interceptor
// is installed on BOTH (see main.tsx).

let refreshPromise: Promise<string | null> | null = null;

const clearSessionAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

const requestNewToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
        // Bare axios + explicit URL so this call is never itself intercepted.
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        if (data?.token) {
            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            return data.token as string;
        }
        return null;
    } catch {
        return null;
    }
};

interface InstallOptions {
    /** Attach the Authorization header automatically from localStorage. */
    injectToken?: boolean;
    /** Surface non-401 error messages as toasts. */
    showToasts?: boolean;
}

export function installAuthInterceptors(instance: AxiosInstance, opts: InstallOptions = {}) {
    if (opts.injectToken) {
        instance.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
            const status = error.response?.status;
            const url: string = originalRequest?.url || '';
            const isAuthFlow = /\/auth\/(login|register|refresh)/.test(url);

            // Attempt a single silent refresh on the first 401 of a non-auth request.
            if (status === 401 && !isAuthFlow && originalRequest && !originalRequest._retry) {
                originalRequest._retry = true;

                if (!refreshPromise) {
                    refreshPromise = requestNewToken().finally(() => {
                        refreshPromise = null;
                    });
                }

                const newToken = await refreshPromise;

                if (newToken) {
                    originalRequest.headers = {
                        ...originalRequest.headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    return instance(originalRequest);
                }

                // Refresh failed — session is genuinely over.
                clearSessionAndRedirect();
                return Promise.reject(error);
            }

            if (opts.showToasts) {
                const message = error.response?.data?.message;
                if (!isAuthFlow && message && status !== 401) {
                    toast.error(message);
                }
            }

            if (status === 401 && !isAuthFlow) {
                // Already retried once and still 401 → give up.
                clearSessionAndRedirect();
            }

            return Promise.reject(error);
        }
    );
}

// The shared `api` instance manages its own auth header + user-facing toasts.
installAuthInterceptors(api, { injectToken: true, showToasts: true });

export default api;
