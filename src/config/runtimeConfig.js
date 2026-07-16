/**
 * 运行时配置适配层
 * 从 static/config 注入的全局变量读取，后续可支持 .env 覆盖
 */

function getServicesConfig() {
  if (typeof window !== "undefined" && window.servicesConfig) {
    return window.servicesConfig;
  }
  return {};
}

function getMapConfig() {
  if (typeof window !== "undefined" && window.mapConfig) {
    return window.mapConfig;
  }
  return {};
}

function getWebConfig() {
  if (typeof window !== "undefined" && window.webConfig) {
    return window.webConfig;
  }
  return {};
}

/** 规范化 API 基础地址，保证末尾无斜杠 */
export function normalizeBaseUrl(url) {
  if (!url) return "";
  return String(url).replace(/\/+$/, "");
}

/** 拼接 API 路径，自动处理 baseUrl 与 path 之间的斜杠 */
export function joinApiPath(baseUrl, path) {
  const base = normalizeBaseUrl(baseUrl);
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function getApiBaseUrl() {
  const cfg = getServicesConfig();
  return normalizeBaseUrl(cfg.servicesUrl || "");
}

export function getLoginCheckUrl() {
  const cfg = getServicesConfig();
  return cfg.loginCheckUrl || "";
}

export function getLoginUrl() {
  const cfg = getServicesConfig();
  return (cfg.login && cfg.login.url) || "";
}

export function getMakerImgUrl() {
  const cfg = getServicesConfig();
  return cfg.makerImgUrl || "";
}

export function getJczdUrl() {
  const cfg = getServicesConfig();
  return cfg.jczdUrl || "";
}

export function getDefaultProxyPath() {
  const cfg = getServicesConfig();
  return cfg.defaultProxyPath || "";
}

export { getServicesConfig, getMapConfig, getWebConfig };
