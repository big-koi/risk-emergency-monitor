# 重构进度记录

> 对照文档：`FRONTEND_REFACTOR_PLAN.md`  
> 更新日期：2026-07-17（第 29 批）

## 本批交付（第 29 批 · 可见效果）

`getTaskList` 空列表处理、UI 勾选复位、后续加载动作展开抽到 `modules/taskSession/taskLoad`；灾种切换图层清理计划抽到 `moduleSwitch.planModuleSwitchCleanup`。页面 `applyPostTaskLoadPlan` 改为按 `actions` 序列执行。

### 如何验收（刷新 http://localhost:8100）

1. 左下角提示：`任务列表后续加载已抽模块；见第 29 批`
2. 切换短临/实况/内涝/山洪：任务时间、排行、预警、图层清理正常
3. 空任务列表时时间轴清空；跨模块 pending 无数据态仍触发
4. 打开任务列表切换历史时间后，各模块数据按计划刷新
5. 图例勾选在刷新任务后复位为默认勾选

### 进度表

| 计划阶段 | 状态 | 说明 |
|---------|------|------|
| 阶段 8 灾种模块 | **推进** | taskLoad + cleanup |
| 阶段 7 UI | 延续 | — |

### 关键改动

```text
src/views/rapidAnalysis/modules/taskSession/taskLoad.js
src/views/rapidAnalysis/modules/taskSession/moduleSwitch.js
src/views/rapidAnalysis/modules/taskSession/index.js
src/views/rapidAnalysis/index.vue
src/components/rapidAnalysis/RegionStatusPanel.vue
```

### 本批不做

- `planModuleSwitchPanelReset` 已导出但未接线（面板复位仍内联）
- `regionContext` 与 Store 未合并
- 主地图未切 OpenLayers

## 下一批建议

1. 接线 `planModuleSwitchPanelReset`，继续压缩 `tabDisasterType`。
2. 对照 PRECHECK 压缩 `index.vue`。
3. 评估以 Region Store 为唯一读源。

## 回滚

1. 将 `getTaskList` / `applyPostTaskLoadPlan` 改回内联。
2. 删除 `taskLoad.js`，还原 cleanup 内联。
