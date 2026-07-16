import {get, post,del} from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl

/**
 * 查询任务列表信息
 * @param obj
 * @param obj.pageNum 页码
 * @param obj.pageSize 每页数量
 * @param obj.pgStartDate 开始时间
 * @param obj.pgEndDate 结束时间
 * @param obj.code 行政区代码
 **/
export function list(
  {pageNum, pageSize}
) {
  return get(`${baseUrl}/v1/evalateTask/page2`, {
    ...arguments[0]
  });
}

// 通用查询
export function queryByField(
  {table, field, where}
) {
  return post(`${baseUrl}/api/queryByField`, {
    ...arguments[0]
  });
}

/**
 * 创建任务
 **/

export function createTask(
  {taskName, createUser}
) {
  return post(`${baseUrl}/v1/evalateTask/add/one`, {
    ...arguments[0]
  });
}

/**
 * 根据任务ID返回日期
 * @param obj
 * @param obj.taskId 任务ID
 **/
export function getDates({taskId}) {
  return get(`${baseUrl}/v1/evalateStep`, {
    taskId,
  });
}

/**
 * 删除任务
 * @param obj
 * @param obj.taskId 任务ID
 **/
export function deleteTask({id}) {
  return del(`${baseUrl}/v1/evalateTask`, {
    id,
  });
}

// 获取任务信息
export function taskStepInfo({taskId}) {
  return get(`${baseUrl}/api/task/step`, {
    taskId,
  });
}

// 获取定位
export function getBoxCode({xzqdm}){
  return get(`${baseUrl}/v1/sysRegion/getBoxByCode?code=${xzqdm}`)
}

// 获取矢量快显
export function getGeoJson({xzqdm}){
  return get(`${baseUrl}/v1/sysRegion/getGeoJsonByCode?code=${xzqdm}`)
}
