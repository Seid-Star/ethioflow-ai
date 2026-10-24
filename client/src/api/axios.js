// import axios from "axios";
// import { useAuthStore } from "../store/authStore";

// export const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().accessToken;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// let isRefreshing = false;
// let pendingRequests = [];

// function resolvePending(newToken) {
//   pendingRequests.forEach((cb) => cb(newToken));
//   pendingRequests = [];
// }

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     const isAuthCall =
//       /\/auth\/(login|register|refresh|verify-email|resend-verification|forgot-password|reset-password)/.test(
//         originalRequest?.url || "",
//       );

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !isAuthCall
//     ) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve) => {
//           pendingRequests.push((newToken) => {
//             originalRequest.headers.Authorization = `Bearer ${newToken}`;
//             resolve(api(originalRequest));
//           });
//         });
//       }

//       isRefreshing = true;
//       try {
//         const { data } = await axios.post(
//           "http://localhost:5000/api/auth/refresh",
//           {},
//           { withCredentials: true },
//         );
//         useAuthStore
//           .getState()
//           .setAuth(useAuthStore.getState().user, data.accessToken);
//         resolvePending(data.accessToken);
//         originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         useAuthStore.getState().logout();
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function resolvePending(newToken) {
  pendingRequests.forEach(({ resolve, originalRequest }) => {
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    resolve(api(originalRequest));
  });

  pendingRequests = [];
}

function rejectPending(error) {
  pendingRequests.forEach(({ reject }) => reject(error));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthCall =
      /\/auth\/(login|register|refresh|verify-email|resend-verification|forgot-password|reset-password)/.test(
        originalRequest.url || "",
      );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthCall
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve,
            reject,
            originalRequest,
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const user = useAuthStore.getState().user;

        useAuthStore.getState().setAuth(user, data.accessToken);

        resolvePending(data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return await api(originalRequest);
      } catch (refreshError) {
        rejectPending(refreshError);
        useAuthStore.getState().logout();
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response) {
      error.friendlyMessage =
        "Cannot reach the server. Check your connection and try again.";
    }

    return Promise.reject(error);
  },
);
