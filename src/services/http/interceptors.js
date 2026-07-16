import { getStatusMessage, HttpError } from "./errors";

let onUnauthorized = null;

/** 注册 401 回调（如跳转登录） */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export function setupRequestInterceptor(axiosInstance) {
  axiosInstance.interceptors.request.use(
    config => {
      if (config.ptype === "notJson") {
        config.headers = Object.assign({}, config.headers, {
          "Content-Type": "application/x-www-form-urlencoded"
        });
      }
      const token =
        typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        config.headers = Object.assign({}, config.headers, { token });
      }
      return config;
    },
    error => Promise.reject(error)
  );
}

export function setupResponseInterceptor(axiosInstance) {
  axiosInstance.interceptors.response.use(
    response => response,
    err => {
      if (err && err.response) {
        const status = err.response.status;
        if (status === 401 && typeof onUnauthorized === "function") {
          onUnauthorized(err);
        }
        return Promise.reject(
          new HttpError(getStatusMessage(status), status, err.response)
        );
      }
      return Promise.reject(
        new HttpError("连接到服务器失败", 0, null)
      );
    }
  );
}
