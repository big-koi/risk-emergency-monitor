/**
 * HTTP 错误类型与消息映射
 */

export class HttpError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.response = response;
  }
}

export class BusinessError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
    this.data = data;
  }
}

const STATUS_MESSAGES = {
  400: "错误请求",
  401: "未授权，请重新登录",
  403: "拒绝访问",
  404: "请求错误，未找到该资源",
  405: "请求方法未允许",
  408: "请求超时",
  500: "服务器端出错",
  502: "网络错误",
  503: "服务不可用",
  504: "网络超时"
};

export function getStatusMessage(status) {
  return STATUS_MESSAGES[status] || `连接错误 ${status}`;
}

export function normalizeError(err) {
  if (err instanceof HttpError || err instanceof BusinessError) {
    return err;
  }
  if (err && err.response) {
    const status = err.response.status;
    return new HttpError(getStatusMessage(status), status, err.response);
  }
  if (err && err.request) {
    return new HttpError("连接到服务器失败", 0, null);
  }
  return new HttpError(err && err.message ? err.message : "未知错误", 0, null);
}
