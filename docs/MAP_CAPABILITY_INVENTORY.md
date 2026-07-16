# 地图能力盘点

## 外部依赖（static/ 全局脚本）

| 资源 | 用途 |
|------|------|
| `static/libs/ol.js` | OpenLayers 库 |
| `static/libs/Cesium/Cesium.js` | Cesium 3D |
| `static/threeMap/ac.min.js` | DigitalTwin 数字孪生 |
| `static/config/js/diitMap/diit2DMap.js` | DiitGIS 2D 封装 |
| `static/config/mapConfig.js` | 地图运行时配置 |

## 2D 地图（Earth.vue + LayerManagerForDiitGIS）

- 地图初始化（diit2DMap / Earth 3D 模式切换）
- 底图加载与切换
- WMS/WMTS/XYZ/ArcGIS 图层
- 图片范围叠加（type 8）
- GeoJSON 矢量图层
- 点标记 addMarker
- 要素高亮
- ArcGIS query
- 图层 CRUD（add/remove/clear）
- 加密 URL 处理
- 全局暴露 `window.me`

## 3D 地图（threeMap/index.vue）

- DigitalTwinPlayer 初始化
- hydrodynamic2d 水动力模型
- 时间帧 update/clear
- 2D/3D 切换（isMapType）

## 业务侧地图操作（index.vue）

- 时间轴图层缓存（layerCache: Map）
- 钻取图层预加载（drillCurrentVisibleLayerKey）
- 行政区边界定位（searchXzqfw / getFwByXzqCode）
- 四灾种切换时图层清理
- 内涝/山洪 PNG 列表按 xzqdm 过滤

## 重构目标 MapFacade 能力

| 能力 | 当前实现 | 目标适配器 |
|------|----------|------------|
| init/destroy | Earth.vue | OpenLayersAdapter |
| addLayer/removeLayer | LayerManager | LayerRegistry |
| fitRegion | getFwByXzqCode + earth | RegionDrill |
| identify | identify.vue | Identify |
| 2D/3D switch | isMapType + threeMap | MapFacade.switchMode |
| 时间轴换帧 | layerCache | LayerCache |

## 迁移期策略

1. LegacyMapAdapter 包装现有 DiitGIS 调用
2. OpenLayersAdapter 逐步替换 2D 能力
3. DigitalTwinAdapter 保留 3D，后续 CesiumAdapter 替换
