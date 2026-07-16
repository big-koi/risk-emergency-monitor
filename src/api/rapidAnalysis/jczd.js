import { get, post, del, getBlob } from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl + '/fzmx18';
// const baseUrl = 'http://172.16.1.97:6521/';

// 获取未来三小时降水

export function searchDeviceTyep(param) {
  return get(`${baseUrl}/mqtt/searchDeviceTyep`, param);
}
export function searchDeviceInfo(param) {
  return get(`${baseUrl}/mqtt/searchDeviceInfo`, param);
}
export function searchDeviceDataInfo(param) {
  return get(`${baseUrl}/mqtt/searchDeviceDataInfo`, param);
}

export function searchDeviceDataToken(param) {
  return get(`${baseUrl}/mqtt/getToken`, param);
}

export function searchDeviceInfoSXT(param) {
  return get(`${baseUrl}/mqtt/searchDeviceInfoSXT`, param);
}

export function searchDeviceYjInfo(param) {
  return get(`${baseUrl}/mqtt/searchDeviceYjInfo`, param);
}


export function indicatorList(param) {
  return get(`${baseUrl}/mqtt/indicatorList`, param);
}

export function obtainRealTimeData(param) {
  return get(`${baseUrl}/mqtt/obtainRealTimeData`, param);
}

// 获取历史气象数据
// param: {
//   devId: '1234567890',
//   endTime: '2026-01-29',
//   startTime: '2026-01-19',
//   type: '1234567890'
// }
export function historyObtainRealTimeData(param) {
  return get(`${baseUrl}/mqtt/historyObtainRealTimeData`, param);
}
