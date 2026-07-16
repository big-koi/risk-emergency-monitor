import { get, post, del, getBlob } from "../../utils/http-service";

const baseUrl = window.servicesConfig.servicesUrl

// 获取步骤信息
export function getStepMessage(param) {
  return get(`${baseUrl}/v1/evalateTask/step`, param);
}

// 降雨数据叠加
export function rainDataOverlying(param) {
  return post(`${baseUrl}/v1/evalateTask/step/ready`, param);
}

// 获取降雨数据叠加后的图层
export function getRainDataOverlyingLayer(param) {
  return get(`${baseUrl}/v1/resultSource/assets`, param);
}

// 评估范围提取
export function evaluateScopeCollectData(param) {
  return post(`${baseUrl}/v1/pgPrcp/collect/list`, param);
}

// 评估范围自定义添加
export function evaluateScopeCustom(param) {
  return post(`${baseUrl}/v1/pgPrcp/custom/list`, param);
}

// 模型数据处理
export function evaluateScopeCollect(param) {
  return post(`${baseUrl}/v1/evalateTask/step/pgfwtq`, param);
}

// 获取评估范围结果
export function getEvaluateScopeResult(param) {
  return get(`${baseUrl}/v1/pgPrcp/page`, param);
}

// 第四步开始评估j
export function step4Assess(param) {
  return post(`${baseUrl}/v1/evalateTask/step/djpgjg`, param);
}

// 删除表格数据By code 支持多删
export function deleleTableDataByCodes(param) {
  return post(`${baseUrl}/v1/estimateLevel/deleteRegion`, param)
}

// 删除表格数据
export function deleleTableDataById(param) {
  return del(`${baseUrl}/v1/pgPrcp`, param);
}

// 评估范围提取导出
export function exportEvaluateExcel(param) {
  return getBlob(`${baseUrl}/v1/pgPrcp/export/xlsx?taskId=${param.taskId}&isDel=false`);
}

// 获取行政区树形结构
export function getRegionTreeData(param) {
  return get(`${baseUrl}/v1/sysRegion`, param);
}

// 修改评估区域
export function editPgRegion(param) {
  return post(`${baseUrl}/v1/pgPrcp/update/list`, param);
}

// 新增评估区域
export function addPgRegion(param) {
  return post(`${baseUrl}/v1/pgPrcp/add/list`, param);
}

// 获取降雨量统计图
export function getMaxPrcp(param) {
  return get(`${baseUrl}/v1/resultMaxPrcp`, param);
}

// 第一步降雨量统计图
export function getHourlyMaxPrcp(param){
  return get(`${baseUrl}/v1/resultHourMaxPrcp`, param)
}

// 内涝仿真模型计算
export function modeling(param) {
  return post(`${baseUrl}/v1/evalateTask/step/mxjs`, param);
}

// 获取下渗模型数据
export function getInfiltrationData(param) {
  return get(`${baseUrl}/v1/sysInfi/page`, param);
}

// 排水设计能力查询
export function getSysDrainData(param) {
  return get(`${baseUrl}/v1/sysDrain/page`, param);
}

// 排水设计能力导出
export function exportSysDrainExcel(param) {
  return getBlob(`${baseUrl}/v1/sysDrain/export/xlsx`, param);
}

// 曼宁系数表格查询
export function getSysManniScalarData(param) {
  return get(`${baseUrl}/v1/sysManniScalar/page`, param);
}

// 曼宁系数导出
export function exportSysManniScalareExcel(param) {
  return getBlob(`${baseUrl}/v1/sysManniScalar/export/xlsx`, param);
}

// 雨洪仿真结果计算
export function simulationCalculate(param) {
  return post(`${baseUrl}/v1/evalateTask/step/yhfzjg`, param);
}

// 雨洪仿真结果表格查询
export function getSimulationResultData(param) {
  return get(`${baseUrl}/v1/resultMaxDepth/page`, param);
}

// 雨洪仿真结果折线图
export function getSimulationResultLineData(param) {
  return get(`${baseUrl}/v1/resultMaxDepth/lineChart`, param);
}

// 雨洪仿真结果导出
export function exportResultMaxDepthExcel(param) {
  return getBlob(`${baseUrl}/v1/resultMaxDepth/export/xlsx?taskId=${param.taskId}&isDel=false`);
}

// 获取日志信息
export function getLogMessage(param) {
  return get(`${baseUrl}/v1/logger/subscribe`, param);
}

// 获取每个算子的计算状态
export function getComputeStatus(param) {
  return get(`${baseUrl}/v1/evalateTask/step/status`, param);
}

// 获取第二步资源图片
export function getSecondStepImage(param) {
  return get(`${baseUrl}/v1/resultSource/assets/step2`, param);
}

// 获取第三步资源图片
export function getThirdStepImage(param) {
  return get(`${baseUrl}/v1/resultSource/assets/step3`, param);
}
// 导出第三步资源图片
export function exportThirdStepImage(param) {
  return post(`http://192.9.100.97:7002/waterlogging/api/v1/evalateTask/exportImage`, param);
  // return getBlob(`${baseUrl}/v1/resultSource/assets/step3?taskId=${param.taskId}&isDel=false`);
}



// 获取等级评估结果
export function getEstimateRes(param) {
  return post(`${baseUrl}/v1/estimateLevel/getEstimateRes`, param)
}

// 第四步网格数据
export function getStep4pngs (params) {
  return get(`${baseUrl}/v1/estimateAlert/page`, params)
}


// 导出shp
export function exportShape(param) {
  return get(`${baseUrl}/v1/estimateLevel/exportShape`, param)
}
// 导出excel
export function exportExcel(param) {
  return get(`${baseUrl}/v1/estimateLevel/exportExcel`, param)
}

export function exportShp(param) {
  return getBlob(`${baseUrl}/v1/estimateLevel/exportShape?taskId=${param.taskId}`)
}
// 下载tif
export function getRegionTif(param) {
  return getBlob(`${baseUrl}/v1/estimateLevel/exportTifs?taskId=${param.taskId}`)
}
