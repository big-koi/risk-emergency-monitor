import {get} from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl

/**
 * 查询行政区划字典
 **/
export function queryXZQH() {
  return get(`${baseUrl}/api/queryDistrictTree?subDistrict=1&districtCode=000000`);
}

/**
 * 查询行政区划字典
 **/
export function queryQY() {
  return get(`${baseUrl}/v1/sysRegion?code=parent`);
}