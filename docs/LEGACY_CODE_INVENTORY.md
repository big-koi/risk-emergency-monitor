# 遗留代码盘点

> 状态：已标记，暂不删除。删除前需引用分析和回归验证。

## 疑似重复/备份文件

| 路径 | 说明 | 建议 |
|------|------|------|
| `src/views/rapidAnalysis/indexTwo.vue` | 旧版 rapidAnalysis 页面（3074 行） | 确认无引用后归档 |
| `src/api/rapidAnalysis copy/` | API 副本目录（评估流程相关） | 确认无引用后删除 |
| `src/components/buttonPostion/index copy.vue` | 行政区组件备份 | 删除 |
| `src/components/buttonPostion/index——bak.vue` | 行政区组件备份 | 删除 |
| `src/components/rapidAnalysis/timeAxis copy.vue` | 时间轴备份 | 删除 |

## 未挂路由页面

| 路径 | 说明 |
|------|------|
| `src/views/task/index.vue` | 专题分析任务页，router 未注册 |

## 疑似未接入主业务的组件

| 路径 | 说明 |
|------|------|
| `src/components/Thematic*/` | 专题分析体系 |
| `src/store/modules/thematicAnalysis.js` | 专题分析 Store |
| `src/components/rapidAnalysis/evaluateScope*` 等 | 评估流程组件 |

## 生产代码中的 debugger

| 文件 | 行号 |
|------|------|
| `src/components/rapidAnalysis/caseMain.vue` | 757, 803 |
| `src/components/Layer/LayerManagerForDiitGIS.js` | 400, 1077, 1160 |
| `src/views/rapidAnalysis/indexTwo.vue` | 1582 |
| `src/components/Legend/product/*` | 多处 |
| `src/components/ThematicModal/addModal.vue` | 226, 233 |
| `src/components/Earth/Legend.vue` | 133 |
| `src/components/Earth/pngEarth.vue` | 459, 461 |

**优先清理**：caseMain、LayerManagerForDiitGIS（主业务路径）。

## 全局状态耦合点

| 位置 | 说明 |
|------|------|
| `window.me` | Earth.vue 暴露全局地图实例 |
| `window.servicesConfig` | 运行时服务配置 |
| `window.mapConfig` | 地图配置 |
| sessionStorage `xzqdm` | 行政区持久化 |
