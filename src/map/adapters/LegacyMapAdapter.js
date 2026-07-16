/**
 * 旧地图适配器：包装 DiitGIS / MapControl / window.me
 * 迁移期使用，逐步将业务从直接调用 me.earth / earthMap 迁移到此适配器
 */

export default class LegacyMapAdapter {
  constructor() {
    this._initialized = false;
    /** MapControl 或与业务约定的地图宿主（含 removeAllLayer / setZoom 等） */
    this._mapHost = null;
  }

  /** 在 earthLoaded 后注入 MapControl，优先于 me.earth */
  setMapHost(host) {
    this._mapHost = host || null;
    this._initialized = !!(this._mapHost || this._getEarth());
  }

  _getEarth() {
    if (typeof window !== "undefined" && window.me && window.me.earth) {
      return window.me.earth;
    }
    return null;
  }

  _getMapHost() {
    return this._mapHost || this._getEarth();
  }

  _getLayerManager() {
    const host = this._getMapHost();
    if (host && host.layerManager) return host.layerManager;
    const earth = this._getEarth();
    return earth && earth.layerManager ? earth.layerManager : null;
  }

  getEngineName() {
    return "legacy";
  }

  init() {
    this._initialized = !!(this._getMapHost() || this._getEarth());
    return Promise.resolve(this._initialized);
  }

  destroy() {
    this._initialized = false;
    this._mapHost = null;
  }

  resize() {
    const earth = this._getEarth();
    if (earth && typeof earth.updateSize === "function") {
      earth.updateSize();
    }
    const host = this._getMapHost();
    if (host && host.map && typeof host.map.updateSize === "function") {
      host.map.updateSize();
    }
  }

  setZoom(zoom) {
    const host = this._getMapHost();
    if (host && typeof host.setZoom === "function") {
      return host.setZoom(zoom);
    }
    const earth = this._getEarth();
    if (earth && typeof earth.setZoom === "function") {
      return earth.setZoom(zoom);
    }
  }

  zoomToExtent(extent) {
    const host = this._getMapHost();
    if (host && typeof host.zoomToExtent === "function") {
      return host.zoomToExtent(extent);
    }
    const earth = this._getEarth();
    if (earth && typeof earth.zoomToExtent === "function") {
      return earth.zoomToExtent(extent);
    }
  }

  /** 回到全国默认视野（与旧 clearAdminRegionMapDisplay 一致） */
  goNationalView() {
    this.setZoom(5);
    this.zoomToExtent([110.55, 29.32]);
  }

  zoomToFeatures(features, options) {
    const host = this._getMapHost();
    if (host && typeof host.zoomToFeatures === "function") {
      return host.zoomToFeatures(features, options);
    }
    return false;
  }

  /**
   * 高亮行政区边界并定位
   * 兼容 searchXzqfw / static/adArea 返回结构
   */
  highlightBoundary(data, options) {
    if (!data) return false;
    const style = Object.assign(
      {
        lineColor: "#FF0000",
        lineWidth: 2,
        fillColor: "rgba(255,255,255,0)"
      },
      (options && options.style) || {}
    );
    const zoom = !options || options.zoom !== false;

    if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
      return this.zoomToFeatures(data.features, {
        setLayer: "hightLayer",
        style,
        zoom
      });
    }
    if (data.type === "Feature") {
      return this.zoomToFeatures([data], {
        setLayer: "hightLayer",
        style,
        zoom
      });
    }

    let geometry = null;
    if (data.feature) {
      try {
        geometry = JSON.parse(data.feature);
      } catch (e) {
        geometry = null;
      }
    } else if (data.type && data.coordinates) {
      geometry = data;
    }
    if (!geometry) return false;
    return this.zoomToFeatures(
      [
        {
          type: "Feature",
          properties: {},
          geometry
        }
      ],
      {
        setLayer: "hightLayer",
        style,
        zoom
      }
    );
  }

  fitRegion(code, options) {
    const earth = this._getEarth();
    if (!earth || !code) return Promise.resolve(false);
    if (typeof earth.flyToRegion === "function") {
      return Promise.resolve(earth.flyToRegion(code, options));
    }
    return Promise.resolve(false);
  }

  addLayer(layerConfig) {
    const lm = this._getLayerManager();
    if (!lm || !layerConfig) return null;
    if (typeof lm.addLayer === "function") {
      return lm.addLayer(layerConfig);
    }
    return null;
  }

  updateLayer(layerId, layerConfig) {
    const lm = this._getLayerManager();
    if (!lm) return;
    if (typeof lm.updateLayer === "function") {
      return lm.updateLayer(layerId, layerConfig);
    }
  }

  removeLayer(layerId) {
    const earth = this._getEarth();
    if (earth && typeof earth.removeLayer === "function" && layerId) {
      return earth.removeLayer(layerId);
    }
    const lm = this._getLayerManager();
    if (!lm) return;
    if (typeof lm.removeLayer === "function") {
      return lm.removeLayer(layerId);
    }
    if (typeof lm.removeLayerById === "function") {
      return lm.removeLayerById(layerId);
    }
  }

  clearBusinessLayers() {
    const host = this._getMapHost();
    if (host && typeof host.removeAllLayer === "function") {
      return host.removeAllLayer();
    }
    const earth = this._getEarth();
    if (earth && typeof earth.removeAllLayer === "function") {
      return earth.removeAllLayer();
    }
    const lm = this._getLayerManager();
    if (!lm) return;
    if (typeof lm.removeAllLayer === "function") {
      return lm.removeAllLayer();
    }
    if (typeof lm.clearLayers === "function") {
      return lm.clearLayers();
    }
  }

  /**
   * 叠加行政区橙色轮廓（原 upladeLine 逻辑）
   * @param {Array} features GeoJSON Feature 数组
   * @param {Object} options layerId / style / dataProjection / featureProjection / fit
   */
  addAdminOutline(features, options) {
    const ol = typeof window !== "undefined" ? window.ol : null;
    const host = this._getMapHost();
    const map = host && host.map;
    if (!ol || !map || !features || !features.length) {
      return false;
    }
    const opts = options || {};
    const layerId = opts.layerId || "xzq";
    const style = opts.style || {};
    const dataProjection = opts.dataProjection || "EPSG:4490";
    const featureProjection = opts.featureProjection || "EPSG:4490";

    map
      .getLayers()
      .getArray()
      .filter(
        l =>
          l.get("id") === layerId ||
          (l.getProperties && l.getProperties().id === layerId)
      )
      .forEach(lyr => map.removeLayer(lyr));

    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(
          {
            type: "FeatureCollection",
            features
          },
          {
            dataProjection,
            featureProjection
          }
        )
      }),
      zIndex: 20,
      id: layerId,
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: style.lineColor || "#FFA000",
          width: style.lineWidth != null ? style.lineWidth : 5
        }),
        fill: new ol.style.Fill({
          color: style.fillColor || "rgba(255,255,255,0)"
        })
      })
    });
    map.addLayer(vectorLayer);
    if (opts.fit !== false) {
      const extent = vectorLayer.getSource().getExtent();
      if (extent && isFinite(extent[0])) {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000
        });
      }
    }
    return true;
  }

  /**
   * 业务栅格图（封装全局 diitgis.addImage）
   */
  addImageLayer(options) {
    if (
      typeof window !== "undefined" &&
      window.diitgis &&
      typeof window.diitgis.addImage === "function"
    ) {
      return window.diitgis.addImage(options);
    }
    if (typeof diitgis !== "undefined" && typeof diitgis.addImage === "function") {
      return diitgis.addImage(options);
    }
    return false;
  }

  /**
   * 工具栏定位点 marker（封装 diitgis.addToobarrMarker）
   */
  addToolbarMarker(coordinate, imgUrl, data) {
    if (
      typeof window !== "undefined" &&
      window.diitgis &&
      typeof window.diitgis.addToobarrMarker === "function"
    ) {
      return window.diitgis.addToobarrMarker(coordinate, imgUrl, data || {});
    }
    if (
      typeof diitgis !== "undefined" &&
      typeof diitgis.addToobarrMarker === "function"
    ) {
      return diitgis.addToobarrMarker(coordinate, imgUrl, data || {});
    }
    return false;
  }

  /**
   * 业务点标记（预警城市 / 排行下钻等，封装 diitgis.addMarker）
   */
  addMarker(coordinate, imgUrl, data, type) {
    if (
      typeof window !== "undefined" &&
      window.diitgis &&
      typeof window.diitgis.addMarker === "function"
    ) {
      return window.diitgis.addMarker(coordinate, imgUrl, data || {}, type);
    }
    if (typeof diitgis !== "undefined" && typeof diitgis.addMarker === "function") {
      return diitgis.addMarker(coordinate, imgUrl, data || {}, type);
    }
    return false;
  }

  /** 清除业务 marker DOM（与页面 removeMapAllMaker 一致） */
  clearMarkers() {
    if (typeof document === "undefined") return false;
    const markerClass = document.getElementsByClassName("marker_class");
    Array.from(markerClass).forEach(function(marker) {
      marker.remove();
    });
    return true;
  }

  /** 定位到点并设置缩放 */
  centerOnPoint(lon, lat, zoom) {
    const host = this._getMapHost();
    const targetZoom = zoom != null ? zoom : 14;
    if (host && host.map && host.map.getView) {
      const view = host.map.getView();
      view.setCenter([lon, lat]);
      view.setZoom(targetZoom);
      return true;
    }
    this.setZoom(targetZoom);
    this.zoomToExtent([lon, lat]);
    return true;
  }

  clearHighlight() {
    const lm = this._getLayerManager();
    if (lm && typeof lm.clearHightLayer === "function") {
      return lm.clearHightLayer();
    }
  }

  setLayerVisible(layerId, visible) {
    const lm = this._getLayerManager();
    if (!lm) return;
    if (typeof lm.setLayerVisible === "function") {
      return lm.setLayerVisible(layerId, visible);
    }
  }

  identify(coordinate) {
    const earth = this._getEarth();
    if (!earth || typeof earth.identify !== "function") {
      return Promise.resolve(null);
    }
    return Promise.resolve(earth.identify(coordinate));
  }

  switchMode(mode) {
    const earth = this._getEarth();
    if (!earth) return Promise.resolve(false);
    if (mode === "3d" && typeof earth.switchTo3D === "function") {
      return Promise.resolve(earth.switchTo3D());
    }
    if (mode === "2d" && typeof earth.switchTo2D === "function") {
      return Promise.resolve(earth.switchTo2D());
    }
    return Promise.resolve(false);
  }

  on(event, handler) {
    const earth = this._getEarth();
    if (earth && typeof earth.on === "function") {
      earth.on(event, handler);
    }
  }

  off(event, handler) {
    const earth = this._getEarth();
    if (earth && typeof earth.off === "function") {
      earth.off(event, handler);
    }
  }
}
