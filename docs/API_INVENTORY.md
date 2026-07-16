# API 接口盘点

> 基础地址：`window.servicesConfig.servicesUrl`（当前试验环境见 `static/config/servicesConfig.js`）

## 短临预报 / 降水

| 函数 | 路径 | 注入 systemCode |
|------|------|-----------------|
| getByyjcsData | /fzmx/getByyjcsData | 是 |
| getJsData | /fzmx/getJsData | 是 |
| getJsDataXz | /fzmx/getJsDataXz | 否 |
| getByyjcsSJZ | /fzmx/getByyjcsSJZ | 否 |
| dljySixMinSjz | /fzmx/getByyjcsSJZ | 否 |
| dljyOnehoursSjz | /fzmx/getByyjcsSJZXSLJ | 否 |
| dljyThreeHoursSjz | /fzmx/getByyjcsSJZXSLJ3 | 否 |
| queryRainfallRange | /warning/queryRainfallRange | 否 |

## 实况监测

| 函数 | 路径 | 注入 systemCode |
|------|------|-----------------|
| getSkJsData | /fzmx18/fzmx/getSkJsData | 是 |
| getSkJsDataXz | /fzmx18/fzmx/getSkJsDataXz | 否 |
| getSkJsMaxGwData | /fzmx18/fzmx/getSkJsMaxGwData | 否 |
| getSkJsPngUrl | /fzmx/getSkJsPngUrl | 否 |
| searchQxtYj | /fzmx/searchQxtYj | 是 |
| geWlSixData | fzmx/getSKDLJsData ⚠️ | 是 |

## 城市内涝

| 函数 | 路径 | 注入 systemCode |
|------|------|-----------------|
| getJssdData | /fzmx/getJssdData | 是 |
| getJssdDataXz | /fzmx/getJssdDataXz | 否 |
| getNlyjcsData | /fzmx/getNlyjcsData | 是 |
| getjsTime | /fzmx/getDljySJZ | 是 |
| getDljySJZJZT | /fzmx/getDljySJZJZT | 是 |
| getDljySJZZB | fzmx/getDljySJZZB ⚠️ | 否 |
| queryFloodRangeCsnl | /warning/queryFloodRangeCsnl | 否 |

## 山洪预警

| 函数 | 路径 | 注入 systemCode |
|------|------|-----------------|
| getShTimeData | /getTifServer/getTifPath | 否 |
| getShYJcsGQ/WL | /fzmx/getSKLSNlyjcsDataSh 等 | 是 |
| getShJsPhGQ/WL | /fzmx/getSKLSJssdDataSh 等 | 是 |
| getShJsGQXZ/WLXZ | 下钻接口 | 否 |
| queryFloodRangeSh | /warning/queryFloodRangeSh | 否 |

## 行政区

| 函数 | 路径 |
|------|------|
| searchXzqfw | /fzmx/searchXzqfw |
| getListByXzqCode | /xzq/getListByXzqCode |
| getFwByXzqCode | /xzq/getFwByXzqCode |

## 公共 / 其他

| 函数 | 路径 | 说明 |
|------|------|------|
| getNowTime | fzmx/getNowTime ⚠️ | URL 缺少 `/` |
| getTaskList | /fzmx/taskList | 任务列表 |
| getToken | loginCheckUrl | 登录校验 |
| getYjcsCount | /fzmx/getYjcsCount | 预警城市统计 |
| resetList | fzmx/resetList ⚠️ | 刷新检测 |

## 案例收藏（case.js）

gerCaseAll, getCaseInfo, singleCollect, deleteCase, saveCase, xzqTree, automaticAssociation, saveCase_other

## 已知 URL 问题

部分接口 `${baseUrl}fzmx/...` 缺少 `/`，重构时在 `services/http/url.js` 统一规范化。
