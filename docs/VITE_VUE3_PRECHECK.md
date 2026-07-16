# Vite / Vue3 迁移前置清单

> 对照：`FRONTEND_REFACTOR_PLAN.md` 后期目标  
> 状态：评估清单（第 8 批补充，尚未开始迁移）

## 必须先完成（当前重构继续做）

- [x] 配置 / HTTP 基础层（`src/config`、`src/services/http`）
- [x] 行政区 Vuex 模型（浏览 / 钻取分离）
- [x] MapFacade + Legacy 适配（业务逐步离开 `window.me`）
- [x] 右侧排行 / 预警 / 统计 / 详情 UI 拆分起步
- [ ] `index.vue` 显著瘦身（目标：God 组件 < 3000 行或按灾种拆页）
- [ ] 业务读源以 Region Store 为主，弱化 / 删除 `regionContext`
- [ ] 地图创建不依赖全局 `diitgis` / `me.earth` 散落调用（经 Facade）

## Vue3 迁移风险点

| 项 | 现状 | 处理建议 |
|----|------|----------|
| Vue 2.5 Options API | 全面使用 | Vue3 兼容；后续可逐步 Composition |
| Ant Design Vue 1.x | 大量 `a-*` | 需升到 Ant Design Vue 3/4 |
| Webpack 3 | 构建链老旧 | 先 Vite 再 Vue3，或同批 |
| `slot-scope` / `.sync` | 页面仍有 | Vue3 改为 `v-slot` / `v-model:prop` |
| 全局滤镜 / 事件总线 | 若有 | Vue3 无滤镜；bus 用 mitt |
| OpenLayers / Cesium 静态资源 | `static/` + 全局 `ol` | Vite 需 `public` 与 import 策略 |
| `require()` 图片 | Webpack 习惯 | Vite 用 `import` 或 `new URL` |

## 建议顺序

1. 继续压缩 `rapidAnalysis/index.vue`，灾种模块可测可回滚。  
2. 地图全部走 MapFacade，删掉页面内直接 `me.earth` / `diitgis` 散点。  
3. Node 升到 LTS，Webpack→Vite（仍 Vue2 可先用 `vite-plugin-vue2` 验证）。  
4. Vue2 → Vue3 + Ant Design Vue 3。  
5. 主地图切换自研 OpenLayers（当前仅对照预览）。

## 不在本阶段做

- 立刻升级 Vue3 / Vite
- 推倒重写 Cesium / DigitalTwin
