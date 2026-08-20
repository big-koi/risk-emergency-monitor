# 重构进度记录

> 对照文档：`FRONTEND_REFACTOR_PLAN.md`  
> 更新日期：2026-07-20（第 52 批）

## 本批交付（第 52 批 · 可见效果）

残留薄方法 / computed 抽入 `pageShellMixin`；工具栏展示码优先 `Store.queryCode`（Region Store 读源收口起步）；`removeLayersExceptResourceMenu` 与钻取图层 purge 经 `removeHostLayerViaFacade`，去掉页面/ mixin 内直接 `me.earth.removeLayer`。`index.vue` 约 **1008** 行。

### 如何验收（刷新 http://localhost:8100）

1. 左下角提示：`页面壳/Facade 清层与 Store 读源起步；见第 52 批`
2. 切换灾种 / 选行政区：工具栏展示名正常
3. 任务列表点击、实况降雨时长切换正常
4. 内涝/山洪钻取详情：时段 Tab 切换清层再加载正常
5. 资源菜单保留图层：清除其它操作层后资源菜单层仍在

### 进度表

| 计划阶段 | 状态 | 说明 |
|---------|------|------|
| PRECHECK index 行数 <3000 | **达成** | 约 1008 行 |
| Region Store 读源 | **起步** | 工具栏 / getStoreQueryCode 优先 Store，context 仍双轨兜底 |
| MapFacade 散点 | **推进** | 操作层清除 / 钻取 purge 经 Facade |

### 关键改动

```text
src/views/rapidAnalysis/mixins/pageShellMixin.js
src/views/rapidAnalysis/mixins/mapFacadeMixin.js
src/views/rapidAnalysis/mixins/timelineOpsMixin.js
src/views/rapidAnalysis/mixins/regionNavigateMixin.js
src/views/rapidAnalysis/index.vue
src/components/rapidAnalysis/RegionStatusPanel.vue
```

### 本批不做

- 未删除 `regionContext`（写路径仍双轨）
- 主地图未切 OpenLayers

## 下一批建议

1. 继续把查询 / 预警 / 边界刷新读码统一走 `getStoreQueryCode`，写路径逐步只写 Store 再投影到 context。
2. 合并过细 mixin；清理 `warningLocateMixin` 等处的 diitgis 回退路径文档化。
3. 对照 `VITE_VUE3_PRECHECK` 剩余项。

## 回滚

1. 还原 `index.vue` 内联 computed/methods。
2. 移除 `pageShellMixin`；恢复 `me.earth.removeLayer` 调用点。
