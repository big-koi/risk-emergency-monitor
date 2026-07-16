import { get, post } from "../../utils/http-service";
import {
  getApiBaseUrl,
  getLoginCheckUrl,
  joinApiPath,
  withSystemCode
} from "../../config";

function apiUrl(path) {
  return joinApiPath(getApiBaseUrl(), path);
}

function withSys(param) {
  return withSystemCode(param || {});
}

// 获取未来三小时降水
export function getByyjcsData(param) {
  return get(apiUrl("/fzmx/getByyjcsData"), withSys(param));
}
export function getJsData(param) {
  return get(apiUrl("/fzmx/getJsData"), withSys(param));
}
export function getJsDataXz(param) {
  return get(apiUrl("/fzmx/getJsDataXz"), param);
}
export function getByyjcsSJZ(param) {
  return get(apiUrl("/fzmx/getByyjcsSJZ"), param);
}
// 获取积水深度时间轴
export function getjsTime(param) {
  return get(apiUrl("/fzmx/getDljySJZ"), withSys(param));
}
// 实况累计降雨-获取最大格网数据经纬度
export function getSkJsMaxGwData(param) {
  return get(apiUrl("/fzmx18/fzmx/getSkJsMaxGwData"), param);
}
// 实况累计降雨-获取气象局暴雨预警列表
export function searchQxtYj(param) {
  return get(apiUrl("/fzmx/searchQxtYj"), withSys(param));
}
// 获取实况降雨
export function getSkJsData(param) {
  return get(apiUrl("/fzmx18/fzmx/getSkJsData"), withSys(param));
}
export function getSkJsDataXz(param) {
  return get(apiUrl("/fzmx18/fzmx/getSkJsDataXz"), param);
}
export function getSkJsPngUrl(param) {
  return get(apiUrl("/fzmx/getSkJsPngUrl"), param);
}

// 获取积水深度
export function getJssdData(param) {
  return get(apiUrl("/fzmx/getJssdData"), withSys(param));
}
export function getNlyjcsData(param) {
  return get(apiUrl("/fzmx/getNlyjcsData"), withSys(param));
}
export function getJssdDataXz(param) {
  return get(apiUrl("/fzmx/getJssdDataXz"), param);
}

//查询任务列表
export function getTaskList(param) {
  return get(apiUrl("/fzmx/taskList"), param);
}

//查询行政区划
export function searchXzqfw(param) {
  return get(apiUrl("/fzmx/searchXzqfw"), param);
}

//获取最新时间
export function getNowTime(param) {
  return get(apiUrl("/fzmx/getNowTime"), param);
}

//获取积水的四至范围
export function getDljySJZZB(param) {
  return get(apiUrl("/fzmx/getDljySJZZB"), param);
}

// 获取未来六小时
export function geWlSixData(param) {
  return get(apiUrl("/fzmx/getSKDLJsData"), withSys(param));
}

// 积水深度过去三小时
export function getjssdGqSix(param) {
  return get(apiUrl("/fzmx/getSKLSJssdData"), withSys(param));
}
// 积水深度-内涝预警城市-过去3小时
export function getjssdGqSixCsyj(param) {
  return get(apiUrl("/fzmx/getSKLSNlyjcsData"), withSys(param));
}
// 积水深度-积水深度排行下钻-过去3小时
export function getSKLSJssdDataXz(param) {
  return get(apiUrl("/fzmx/getSKLSJssdDataXz"), param);
}
// 积水深度-获取短临降雨时间轴-过去3小时
export function getSKLSSJZ(param) {
  return get(apiUrl("/fzmx/getSKLSSJZ"), withSys(param));
}
// 内涝/山洪-积水深度极值图-未来3小时（淹没城市列表）
export function getDljySJZJZT(param) {
  return get(apiUrl("/fzmx/getDljySJZJZT"), withSys(param));
}
// 内涝/山洪-积水深度极值图-过去3小时（淹没城市列表）
export function getSKLSSJZJZT(param) {
  return get(apiUrl("/fzmx/getSKLSSJZJZT"), withSys(param));
}
// 积水深度-获取短临降雨图片坐标范围-过去3小时
export function getSKLSSJZZB(param) {
  return get(apiUrl("/fzmx/getSKLSSJZZB"), param);
}
//获取是否5分钟刷新接口
export function resetList(param) {
  return get(apiUrl("/fzmx/resetList"), param);
}

//山洪时间轴
export function getShTimeData(param) {
  return get(apiUrl("/getTifServer/getTifPath"), param);
}

export function getToken(param) {
  return post(getLoginCheckUrl(), param);
}

// 山洪预警城市过去三小时
export function getShYJcsGQ(param) {
  return get(apiUrl("/fzmx/getSKLSNlyjcsDataSh"), withSys(param));
}
// 山洪预警城市未来三小时
export function getShYJcsWL(param) {
  return get(apiUrl("/fzmx/getNlyjcsDataSh"), withSys(param));
}

// 山洪积水深度统计过去三小时
export function getShJsPhGQ(param) {
  return get(apiUrl("/fzmx/getSKLSJssdDataSh"), withSys(param));
}

// 山洪积水深度统计未来三小时
export function getShJsPhWL(param) {
  return get(apiUrl("/fzmx/getJssdDataSh"), withSys(param));
}

// 山洪积水深度下钻过去三小时
export function getShJsGQXZ(param) {
  return get(apiUrl("/fzmx/getSKLSJssdDataXzSh"), param);
}

// 山洪积水深度下钻未来三小时
export function getShJsWLXZ(param) {
  return get(apiUrl("/fzmx/getJssdDataXzSh"), param);
}

// 获取建成区和山洪区范围
export function getjcqAndShLk(param) {
  return get(apiUrl("/fzmx/searchJcqAndShq"), param);
}

// 端临降雨时间轴6分钟
export function dljySixMinSjz(param) {
  return get(apiUrl("/fzmx/getByyjcsSJZ"), param);
}
// 端临降雨时间轴一小时
export function dljyOnehoursSjz(param) {
  return get(apiUrl("/fzmx/getByyjcsSJZXSLJ"), param);
}
// 端临降雨时间轴三小时
export function dljyThreeHoursSjz(param) {
  return get(apiUrl("/fzmx/getByyjcsSJZXSLJ3"), param);
}

// 根据行政区代码查询行政区列表
export function getListByXzqCode(param) {
  return get(apiUrl("/xzq/getListByXzqCode"), param);
}

// 根据行政区代码查询行政区范围
export function getFwByXzqCode(param) {
  return get(apiUrl("/xzq/getFwByXzqCode"), param);
}

export function getYjcsCount(param) {
  return get(apiUrl("/fzmx/getYjcsCount"), param);
}

// 短临预报预警信息
export function queryRainfallRange(param) {
  return get(apiUrl("/warning/queryRainfallRange"), param);
}

// 城市内涝预警信息
export function queryFloodRangeCsnl(param) {
  return get(apiUrl("/warning/queryFloodRangeCsnl"), param);
}

// 山洪预警信息
export function queryFloodRangeSh(param) {
  return get(apiUrl("/warning/queryFloodRangeSh"), param);
}
