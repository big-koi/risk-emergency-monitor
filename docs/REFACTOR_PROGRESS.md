# 重构进度记录

> 对照文档：`FRONTEND_REFACTOR_PLAN.md`  
> 更新日期：2026-07-15（第 9 批）

## 本批交付（第 9 批 · 可见效果）

图例面板拆为独立组件；`addImage` / 工具栏定位 / 地图定点迁入 MapFacade；右侧统计图 option 抽到 charts 模块。

### 如何验收（刷新 http://localhost:8100）

1. 左下角提示：`图例已拆；addImage/定位经 Facade；统计 option 模块化`
2. 右下图例：短临/实况色带、内涝预警等级与积水深、勾选显隐仍正常
3. 预警定位图标点击后地图定位与标记正常
4. 实况 / 内涝栅格叠图正常（仍走 Facade→diitgis）
5. 右侧降水/积水统计图正常

### 进度表

| 计划阶段 | 状态 | 说明 |
|---------|------|------|
| 阶段 3/4 MapFacade | **加深** | addImageLayer / addToolbarMarker / centerOnPoint |
| 阶段 7 UI 拆分 | **推进** | + MapLegendPanel |
| 阶段 8 灾种模块 | **推进** | + sumChartOptions |

### 关键改动

```text
src/views/rapidAnalysis/components/MapLegendPanel.vue
src/views/rapidAnalysis/modules/charts/sumChartOptions.js
src/map/adapters/LegacyMapAdapter.js
src/map/core/MapFacade.js
src/views/rapidAnalysis/index.vue
  - 图例 → MapLegendPanel
  - addImageLayerViaFacade / addLocateMarker / centerMapOnPoint
src/views/rapidAnalysis/components/StatisticsChartPanel.vue
```

### 本批不做

- 未迁全部 `diitgis.addMarker` / `me.earth.createLayer`
- 主地图未切 OpenLayers
- 未删 regionContext

## 下一批建议

1. 封装 `addMarker` 系列进 Facade，压缩预警城市打点。
2. 拆任务列表 / 地图点位弹窗组件。
3. 短临 cacheLayers 的 `me.earth.layerManager` 收敛到适配器。
4. 继续对照 `VITE_VUE3_PRECHECK.md` 推进瘦身。

## 回滚

1. MapLegendPanel 模板可贴回 index.vue。
2. `addImageLayerViaFacade` 改回直接 `diitgis.addImage`。
3. StatisticsChartPanel 可恢复内联 buildOption。
