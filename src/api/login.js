import {post} from "../utils/http-service";

/**
 * 登录
 * @param {object} params
 **/

const baseUrl = window.servicesConfig.servicesUrl
export function login(params) {
  return post(servicesConfig.login.url, params);
}