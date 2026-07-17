# 重构进度记录

> 对照文档：`FRONTEND_REFACTOR_PLAN.md`  
> 更新日期：2026-07-17（第 26 批）

## 本批交付（第 26 批 · 可见效果）

跨模块区划采纳、工具栏行政区码变更计划抽到 `modules/regionSession/positionChange`。页面 `adoptCrossModuleRegionIfNeeded` / `getPositionXzqCode` 改为执行模块计划（回全国 / 钻取局部更新 / 浏览上溯+快照 / Store 同步）。

### 如何验收（刷新 http://localhost:8100）

1. 左下角提示：`跨模块区划/定位变更已抽模块；见第 26 批`
2. 短临/实况排行钻取到县后，切换内涝或山洪：浏览码上溯到市，排行与地图正常
3. 工具栏选省/市/县：列表、预警、地图刷新
4. 选县（内涝/山洪浏览）：自动上溯并同步工具栏名称
5. 清空/回全国：左下角码为空

### 进度表

| 计划阶段 | 状态 | 说明 |
|---------|------|------|
| 行政区双轨 | **推进** | positionChange |
| 阶段 7/8 | 延续 | — |

### 关键改动

```text
src/views/rapidAnalysis/modules/regionSession/positionChange.js
src/views/rapidAnalysis/modules/regionSession/index.js
src/views/rapidAnalysis/index.vue
src/components/rapidAnalysis/RegionStatusPanel.vue
```

### 本批不做

- `applyRegionContext` 主体仍在页面
- `regionContext` 与 Store 未合并
- 主地图未切 OpenLayers

## 下一批建议

1. 继续抽 `applyRegionContext` 按钮同步载荷 / `resolveRegionButtonLabel`。
2. 对照 PRECHECK 压缩 `index.vue`。
3. 评估以 Region Store 为唯一读源。

## 回滚

1. 将上述 methods 改回页面内联。
2. 删除 `positionChange.js`。
