import { get, post, del, getBlob } from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl;

export function gerCaseAll(param) {
  return get(`${baseUrl}/case/gerCaseAll`, param);
}

export function getCaseInfo(param) {
  return get(`${baseUrl}/case/getCaseInfo`, param);
}

export function singleCollect(param) {
  return get(`${baseUrl}/case/singleCollect`, param);
}

export function deleteCase(param) {
  return get(`${baseUrl}/case/deleteCase`, param);
}

export function saveCase(param) {
  return post(`${baseUrl}/case/saveCase`, param);
}

export function xzqTree(param) {
  return get(`${baseUrl}/case/xzqTree`, param);
}

export function automaticAssociation(param) {
  return get(`${baseUrl}/case/automaticAssociation`, param);
}

export function saveCase_other(param) {
  return get(`${baseUrl}/case/saveCase_other`, param);
}
