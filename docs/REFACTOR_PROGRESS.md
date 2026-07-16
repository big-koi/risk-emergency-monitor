# 重构进度记录

> 对照文档：`FRONTEND_REFACTOR_PLAN.md`  
> 更新日期：2026-07-16（第 11 批）

## 本批交付（第 11 批 · 可见效果）

案例收藏相关 UI（列表 / 加入收藏 / 放大表 / 详情）拆为 `CaseCollectionPanels`；地图工具条拆为 `MapToolbarShell`（行政区、任务列表以 slot 注入）。父页经 `getCaseMainRef()` 访问内嵌 `caseMain`。

### 如何验收（刷新 http://localhost:8100）

1. 左下角提示：`案例收藏/工具条已拆；见第 11 批`
2. 地图右上工具条：点位查询、基础图层、收藏夹、任务列表按钮正常
3. 收藏夹：打开列表、搜索、创建案例、查看详情、保存/删除与重构前一致
4. 任务列表面板仍挂在工具条 slot 中，交互不变

### 进度表

| 计划阶段 | 状态 | 说明 |
|---------|------|------|
| 阶段 3/4 MapFacade | 延续 | 第 10 批 addMarker |
| 阶段 7 UI 拆分 | **推进** | + CaseCollectionPanels、MapToolbarShell |
| 阶段 8 灾种模块 | 延续 | 短临逻辑仍在 index |

### 关键改动

```text
src/views/rapidAnalysis/components/CaseCollectionPanels.vue
src/views/rapidAnalysis/components/MapToolbarShell.vue
src/views/rapidAnalysis/index.vue
  - 工具条 → MapToolbarShell（slot: region / task-list）
  - 案例 UI → CaseCollectionPanels
  - getCaseMainRef() / onCaseDelete()
```

### 本批不做

- 未拆 Identify / 基础图层本体
- 未改案例业务 API 与 `caseMain` 内部逻辑
- 主地图未切 OpenLayers

## 下一批建议

1. 拆基础图层 / Identify 查询面板轻量封装。
2. 短临 cacheLayers 收敛到 MapFacade / modules。
3. 继续对照 `VITE_VUE3_PRECHECK.md` 瘦身 `index.vue`。

## 回滚

1. CaseCollectionPanels / MapToolbarShell 模板可贴回 index.vue。
2. `this.getCaseMainRef()` 改回 `this.$refs.caseMain`（需同步恢复 caseMain 直挂父页）。
