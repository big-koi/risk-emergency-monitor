import Axios from "axios";
import Qs from "qs";
import { setupRequestInterceptor, setupResponseInterceptor } from "./interceptors";

const DEFAULT_TIMEOUT = 120000;

const client = Axios.create({
  timeout: DEFAULT_TIMEOUT,
  baseURL: ""
});

setupRequestInterceptor(client);
setupResponseInterceptor(client);

/** 全局请求版本号，用于忽略过期响应（可选） */
let globalRequestVersion = 0;

export function nextRequestVersion() {
  globalRequestVersion += 1;
  return globalRequestVersion;
}

export function getRequestVersion() {
  return globalRequestVersion;
}

export function isStaleRequest(version) {
  return version !== undefined && version !== globalRequestVersion;
}

export function get(url, params = {}, config = {}) {
  return client
    .get(url, Object.assign({}, config, { params }))
    .then(res => res.data);
}

export function del(url, params = {}, config = {}) {
  return client
    .delete(url, Object.assign({}, config, { params }))
    .then(res => res.data);
}

export function post(url, data = {}, config = {}) {
  return client.post(url, data, config).then(res => res.data);
}

export function put(url, data = {}, config = {}) {
  return client.put(url, data, config).then(res => res.data);
}

export function patch(url, data = {}, config = {}) {
  return client.patch(url, data, config).then(res => res.data);
}

export function getBlob(url, config = {}) {
  return client
    .get(url, Object.assign({}, config, { responseType: "blob" }))
    .then(res => res.data);
}

export function postNotJson(url, data = {}) {
  return client({
    url,
    method: "post",
    ptype: "notJson",
    data: Qs.stringify(data)
  }).then(res => res.data);
}

export function getGISQuery(url, layerId, field, value, returnGeometry) {
  let val = value;
  if (typeof val !== "number") {
    val = `'${val}'`;
  }
  const params = {
    f: "json",
    where: `${field} = ${val}`,
    returnGeometry,
    spatialRel: "esriSpatialRelIntersects",
    outFields: "*"
  };
  return client
    .get(`${url}/${layerId}/query`, { params })
    .then(res => res.data);
}

export { client as axiosInstance };
