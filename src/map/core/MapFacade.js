/**
 * 地图统一门面接口
 * 业务代码只通过 MapFacade 操作地图，不直接访问 window.me / OL / Cesium
 */

export default class MapFacade {
  constructor(adapter) {
    this._adapter = adapter;
    this._sceneVersion = 0;
  }

  get adapter() {
    return this._adapter;
  }

  getEngineName() {
    if (this._adapter && typeof this._adapter.getEngineName === "function") {
      return this._adapter.getEngineName();
    }
    return "unknown";
  }

  /** 切换适配器（迁移期新旧地图切换） */
  setAdapter(adapter) {
    this._adapter = adapter;
  }

  bumpSceneVersion() {
    this._sceneVersion += 1;
    return this._sceneVersion;
  }

  getSceneVersion() {
    return this._sceneVersion;
  }

  init(container, options) {
    return this._ensureAdapter().init(container, options);
  }

  destroy() {
    if (this._adapter) {
      return this._adapter.destroy();
    }
  }

  resize() {
    return this._ensureAdapter().resize();
  }

  setZoom(zoom) {
    return this._ensureAdapter().setZoom(zoom);
  }

  zoomToExtent(extent) {
    return this._ensureAdapter().zoomToExtent(extent);
  }

  goNationalView() {
    const adapter = this._ensureAdapter();
    if (typeof adapter.goNationalView === "function") {
      return adapter.goNationalView();
    }
    this.setZoom(5);
    this.zoomToExtent([110.55, 29.32]);
  }

  /** 高亮并定位到要素 / GeoJSON */
  zoomToFeatures(features, options) {
    const adapter = this._ensureAdapter();
    if (typeof adapter.zoomToFeatures === "function") {
      return adapter.zoomToFeatures(features, options);
    }
    return false;
  }

  highlightBoundary(data, options) {
    const adapter = this._ensureAdapter();
    if (typeof adapter.highlightBoundary === "function") {
      return adapter.highlightBoundary(data, options);
    }
    return false;
  }

  fitRegion(code, options) {
    return this._ensureAdapter().fitRegion(code, options);
  }

  addLayer(layerConfig) {
    return this._ensureAdapter().addLayer(layerConfig);
  }

  updateLayer(layerId, layerConfig) {
    return this._ensureAdapter().updateLayer(layerId, layerConfig);
  }

  removeLayer(layerId) {
    return this._ensureAdapter().removeLayer(layerId);
  }

  clearBusinessLayers() {
    this.bumpSceneVersion();
    return this._ensureAdapter().clearBusinessLayers();
  }

  /** 叠加业务栅格图 */
  addImageLayer(options) {
    const adapter = this._ensureAdapter();
    if (typeof adapter.addImageLayer === "function") {
      return adapter.addImageLayer(options);
    }
    return false;
  }

  /** 工具栏定位 marker */
  addToolbarMarker(coordinate, imgUrl, data) {
    const adapter = this._ensureAdapter();
    if (typeof adapter.addToolbarMarker === "function") {
      return adapter.addToolbarMarker(coordinate, imgUrl, data);
    }
    return false;
  }

  /** 地图定位到点 */
  centerOnPoint(lon, lat, zoom) {
    const adapter = this._ensureAdapter();
    if (typeof adapter.centerOnPoint === "function") {
      return adapter.centerOnPoint(lon, lat, zoom);
    }
    this.setZoom(zoom != null ? zoom : 14);
    this.zoomToExtent([lon, lat]);
  }

  clearHighlight() {
    const adapter = this._ensureAdapter();
    if (typeof adapter.clearHighlight === "function") {
      return adapter.clearHighlight();
    }
  }

  setLayerVisible(layerId, visible) {
    return this._ensureAdapter().setLayerVisible(layerId, visible);
  }

  identify(coordinate) {
    return this._ensureAdapter().identify(coordinate);
  }

  switchMode(mode) {
    return this._ensureAdapter().switchMode(mode);
  }

  on(event, handler) {
    return this._ensureAdapter().on(event, handler);
  }

  off(event, handler) {
    return this._ensureAdapter().off(event, handler);
  }

  _ensureAdapter() {
    if (!this._adapter) {
      throw new Error("MapFacade: no adapter configured");
    }
    return this._adapter;
  }
}

/** 单例，应用内共享 */
let instance = null;

export function createMapFacade(adapter) {
  instance = new MapFacade(adapter);
  return instance;
}

export function getMapFacade() {
  if (!instance) {
    throw new Error("MapFacade not initialized. Call createMapFacade first.");
  }
  return instance;
}

export function tryGetMapFacade() {
  return instance;
}
