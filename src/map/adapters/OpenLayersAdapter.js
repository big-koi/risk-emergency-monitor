/**
 * OpenLayers 自研适配器（最小可用）
 * 当前用于对照预览，不替换主业务地图
 */

function getOl() {
  if (typeof window !== "undefined" && window.ol) {
    return window.ol;
  }
  return null;
}

function getWebBase() {
  if (typeof window !== "undefined" && window.servicesConfig && window.servicesConfig.WebServer) {
    return window.servicesConfig.WebServer;
  }
  if (typeof window !== "undefined") {
    return window.location.origin + window.location.pathname;
  }
  return "";
}

/** 中国大致中心与范围（EPSG:4326） */
const CHINA_CENTER = [104.0, 35.0];
const CHINA_EXTENT = [73, 18, 135, 54];
const BOUNDARY_LAYER_ID = "admin-boundary";

export default class OpenLayersAdapter {
  constructor() {
    this._initialized = false;
    this._map = null;
    this._container = null;
    this._baseLayer = null;
    this._layers = {};
    this._boundaryRequestId = 0;
  }

  getEngineName() {
    return "openlayers";
  }

  getMap() {
    return this._map;
  }

  init(container, options) {
    const ol = getOl();
    if (!ol) {
      return Promise.reject(new Error("OpenLayers 全局 ol 未加载"));
    }
    const el =
      typeof container === "string"
        ? document.getElementById(container)
        : container;
    if (!el) {
      return Promise.reject(new Error("OpenLayers 容器不存在"));
    }

    this.destroy();
    this._container = el;

    const projection = (options && options.projection) || "EPSG:4326";
    this._baseLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url:
          (options && options.tileUrl) ||
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        crossOrigin: "anonymous"
      }),
      zIndex: 0
    });

    this._map = new ol.Map({
      target: el,
      layers: [this._baseLayer],
      view: new ol.View({
        projection,
        center: (options && options.center) || CHINA_CENTER,
        zoom: (options && options.zoom) || 4
      })
    });

    this._initialized = true;
    this.goNationalView();
    return Promise.resolve(true);
  }

  destroy() {
    this._boundaryRequestId += 1;
    if (this._map) {
      this._map.setTarget(null);
      this._map = null;
    }
    this._baseLayer = null;
    this._layers = {};
    this._container = null;
    this._initialized = false;
  }

  resize() {
    if (this._map) {
      this._map.updateSize();
    }
  }

  setZoom(zoom) {
    if (!this._map) return;
    this._map.getView().setZoom(zoom);
  }

  zoomToExtent(extent) {
    if (!this._map || !extent) return;
    const view = this._map.getView();
    if (extent.length === 2) {
      view.setCenter(extent);
      return;
    }
    if (extent.length === 4) {
      view.fit(extent, {
        padding: [20, 20, 20, 20],
        duration: 400,
        maxZoom: 10
      });
    }
  }

  goNationalView() {
    if (!this._map) return;
    this.removeLayer(BOUNDARY_LAYER_ID);
    this.zoomToExtent(CHINA_EXTENT);
  }

  /** 候选行政区码：市/县可回退到省界 geojson */
  _boundaryCodeCandidates(code) {
    const c = code ? String(code).trim() : "";
    if (!c || c === "100000") return [];
    const list = [c];
    if (c.length >= 6 && !c.endsWith("0000")) {
      list.push(c.slice(0, 2) + "0000");
    }
    return list;
  }

  _fetchAdminGeoJson(code) {
    const base = getWebBase();
    const url = `${base}static/adArea/${code}.json`;
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .catch(() => null);
  }

  addGeoJsonLayer(geojson, layerId, styleOptions) {
    const ol = getOl();
    if (!this._map || !ol || !geojson) return null;
    const id = layerId || `geojson_${Date.now()}`;
    this.removeLayer(id);

    const strokeColor =
      (styleOptions && styleOptions.lineColor) || "#FFD666";
    const strokeWidth =
      (styleOptions && styleOptions.lineWidth) != null
        ? styleOptions.lineWidth
        : 2;
    const fillColor =
      (styleOptions && styleOptions.fillColor) || "rgba(255, 214, 102, 0.08)";

    const layer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: new ol.format.GeoJSON().readFeatures(geojson, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:4326"
        })
      }),
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: strokeColor,
          width: strokeWidth
        }),
        fill: new ol.style.Fill({
          color: fillColor
        })
      }),
      zIndex: 20
    });
    layer.set("bizId", id);
    this._map.addLayer(layer);
    this._layers[id] = layer;

    const extent = layer.getSource().getExtent();
    if (extent && isFinite(extent[0])) {
      this._map.getView().fit(extent, {
        padding: [30, 30, 30, 30],
        duration: 500,
        maxZoom: 9
      });
    }
    return layer;
  }

  fitRegion(code) {
    const candidates = this._boundaryCodeCandidates(code);
    if (!candidates.length) {
      this.goNationalView();
      return Promise.resolve(false);
    }
    const requestId = ++this._boundaryRequestId;
    const tryNext = index => {
      if (requestId !== this._boundaryRequestId) {
        return Promise.resolve(false);
      }
      if (index >= candidates.length) {
        this.goNationalView();
        return Promise.resolve(false);
      }
      return this._fetchAdminGeoJson(candidates[index]).then(geojson => {
        if (requestId !== this._boundaryRequestId) {
          return false;
        }
        if (geojson) {
          this.addGeoJsonLayer(geojson, BOUNDARY_LAYER_ID);
          return true;
        }
        return tryNext(index + 1);
      });
    };
    return tryNext(0);
  }

  highlightBoundary(data, options) {
    if (!data) return false;
    if (data.type === "FeatureCollection" || data.type === "Feature") {
      this.addGeoJsonLayer(
        data.type === "Feature"
          ? { type: "FeatureCollection", features: [data] }
          : data,
        BOUNDARY_LAYER_ID,
        options && options.style
      );
      return true;
    }
    return false;
  }

  zoomToFeatures(features, options) {
    if (!features || !features.length) return false;
    return this.highlightBoundary(
      { type: "FeatureCollection", features },
      options
    );
  }

  addLayer(layerConfig) {
    const ol = getOl();
    if (!this._map || !ol || !layerConfig) return null;
    const id = layerConfig.id || layerConfig.name || `layer_${Date.now()}`;
    if (this._layers[id]) {
      this.removeLayer(id);
    }
    let layer = null;
    if (layerConfig.type === "xyz" && layerConfig.url) {
      layer = new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: layerConfig.url,
          crossOrigin: "anonymous"
        }),
        opacity: layerConfig.opacity != null ? layerConfig.opacity : 1,
        zIndex: layerConfig.zIndex || 1
      });
    } else if (
      layerConfig.type === "image" &&
      layerConfig.url &&
      layerConfig.imageExtent
    ) {
      layer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          url: layerConfig.url,
          imageExtent: layerConfig.imageExtent,
          projection: layerConfig.projection || "EPSG:4326"
        }),
        opacity: layerConfig.opacity != null ? layerConfig.opacity : 0.5,
        zIndex: layerConfig.zIndex || 10
      });
    } else if (layerConfig.type === "geojson" && layerConfig.data) {
      return this.addGeoJsonLayer(
        layerConfig.data,
        id,
        layerConfig.style
      );
    }
    if (!layer) return null;
    layer.set("bizId", id);
    this._map.addLayer(layer);
    this._layers[id] = layer;
    return layer;
  }

  updateLayer() {}

  removeLayer(layerId) {
    if (!this._map || !layerId) return;
    const layer = this._layers[layerId];
    if (layer) {
      this._map.removeLayer(layer);
      delete this._layers[layerId];
    }
  }

  clearBusinessLayers() {
    Object.keys(this._layers).forEach(id => this.removeLayer(id));
  }

  /** OL 预览期：业务 marker 尚未统一实现 */
  addMarker() {
    return false;
  }

  clearMarkers() {
    return false;
  }

  clearHighlight() {
    this.removeLayer(BOUNDARY_LAYER_ID);
  }

  setLayerVisible(layerId, visible) {
    const layer = this._layers[layerId];
    if (layer) {
      layer.setVisible(!!visible);
    }
  }

  identify() {
    return Promise.resolve(null);
  }

  switchMode() {
    return Promise.resolve(false);
  }

  on() {}

  off() {}
}
