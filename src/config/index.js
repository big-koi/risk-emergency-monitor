export {
  getApiBaseUrl,
  getLoginCheckUrl,
  getLoginUrl,
  getMakerImgUrl,
  getJczdUrl,
  getDefaultProxyPath,
  getServicesConfig,
  getMapConfig,
  getWebConfig,
  normalizeBaseUrl,
  joinApiPath
} from "./runtimeConfig";

/** 从 localStorage 读取当前系统/行政区编码 */
export function getSystemCode() {
  if (typeof window === "undefined") return "";
  const code = window.localStorage.getItem("xzqdm");
  return code ? String(code).trim() : "";
}

/** 为请求参数注入 systemCode（不修改原对象） */
export function withSystemCode(params) {
  const systemCode = getSystemCode();
  if (!systemCode) return params || {};
  return Object.assign({}, params || {}, { systemCode });
}
