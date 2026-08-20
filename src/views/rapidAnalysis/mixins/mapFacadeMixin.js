/**
 * MapFacade 桥接方法（失败回退 diitgis / me.earth / earthMap）
 * 作为 Vue mixin 挂到 rapidAnalysis 页面
 */
import { tryGetMapFacade } from "@/map";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";

function getMeEarth() {
  return typeof me !== "undefined" && me ? me.earth : null;
}

export const mapFacadeMixin = {
  methods: {
    /** 经 MapFacade 叠加栅格图（失败回退 diitgis） */
    addImageLayerViaFacade(options) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addImageLayer === "function") {
        const ok = facade.addImageLayer(options);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addImage) {
        diitgis.addImage(options);
        return true;
      }
      return false;
    },
    /**
     * 经 MapFacade 创建并挂载栅格图层（短临 cache / 极值图）
     * 失败回退 me.earth.layerManager
     */
    createImageLayerViaFacade(layerName, url, options) {
      const opts = options || {};
      const facade = tryGetMapFacade();
      if (facade && typeof facade.createImageLayer === "function") {
        const layer = facade.createImageLayer(layerName, 8, url, opts);
        if (layer) {
          facade.addHostLayer(layer);
          return layer;
        }
      }
      const earth = getMeEarth();
      if (earth && earth.layerManager) {
        const layer = earth.layerManager.createLayer(layerName, 8, url, opts);
        earth.addLayer(layer);
        return layer;
      }
      return null;
    },
    addHostLayerViaFacade(layer) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addHostLayer === "function") {
        const ok = facade.addHostLayer(layer);
        if (ok !== false) return true;
      }
      const earth = getMeEarth();
      if (earth && typeof earth.addLayer === "function") {
        try {
          earth.addLayer(layer);
          return true;
        } catch (e) {
          return true;
        }
      }
      return false;
    },
    removeHostLayerViaFacade(layer) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.removeHostLayer === "function") {
        const ok = facade.removeHostLayer(layer);
        if (ok !== false) return true;
      }
      const earth = getMeEarth();
      if (earth && typeof earth.removeLayer === "function") {
        try {
          earth.removeLayer(layer);
          return true;
        } catch (e) {
          /* ignore */
        }
      }
      return false;
    },
    /** 经 MapFacade 按四至 fit */
    fitExtentViaFacade(extent, options) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.fitExtent === "function") {
        const ok = facade.fitExtent(extent, options);
        if (ok !== false) return true;
      }
      try {
        const earth = getMeEarth();
        const map =
          (earth && earth.map) ||
          (this.earthMap && this.earthMap.map);
        if (map && map.getView && extent && extent.length === 4) {
          const opts = options || {};
          map.getView().fit(extent, {
            size: opts.size || (map.getSize && map.getSize()),
            padding: opts.padding || [60, 60, 60, 60],
            maxZoom: opts.maxZoom,
            duration: opts.duration != null ? opts.duration : 300
          });
          return true;
        }
      } catch (e) {
        /* ignore */
      }
      return false;
    },
    /** 经 MapFacade 取当前视图投影 */
    getViewProjectionViaFacade() {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.getViewProjectionCode === "function") {
        const code = facade.getViewProjectionCode();
        if (code) return code;
      }
      try {
        const earth = getMeEarth();
        const view =
          earth && earth.map && earth.map.getView && earth.map.getView();
        const code =
          view && view.getProjection && view.getProjection().getCode();
        if (code) return code;
      } catch (e) {
        /* ignore */
      }
      return "EPSG:4490";
    },
    /** 经 MapFacade 叠加业务点标记（失败回退 diitgis） */
    addMarkerViaFacade(coordinate, imgUrl, data, type) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addMarker === "function") {
        const ok = facade.addMarker(coordinate, imgUrl, data, type);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addMarker) {
        diitgis.addMarker(coordinate, imgUrl, data || {}, type);
        return true;
      }
      return false;
    },
    /** 经 MapFacade 叠加气象台预警点（失败回退 diitgis.addqxjMarker） */
    addQxjMarkerViaFacade(coordinate, imgUrl, data, type) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addQxjMarker === "function") {
        const ok = facade.addQxjMarker(coordinate, imgUrl, data, type);
        if (ok !== false) return true;
      }
      if (typeof diitgis !== "undefined" && diitgis.addqxjMarker) {
        diitgis.addqxjMarker(coordinate, imgUrl, data || {}, type);
        return true;
      }
      return false;
    },
    /** 经 MapFacade 清除业务 marker */
    clearMarkersViaFacade() {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.clearMarkers === "function") {
        const ok = facade.clearMarkers();
        if (ok !== false) return true;
      }
      const markerClass = document.getElementsByClassName("marker_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      return true;
    },
    /** 经 MapFacade 清空业务图层（失败时回退 earthMap） */
    clearBusinessLayersViaFacade() {
      this.olPreviewImageLayer = null;
      const facade = tryGetMapFacade();
      if (facade) {
        facade.clearBusinessLayers();
        return true;
      }
      if (this.earthMap && typeof this.earthMap.removeAllLayer === "function") {
        this.earthMap.removeAllLayer();
        return true;
      }
      return false;
    },
    /** 经 MapFacade 回到全国视野 */
    goNationalViewViaFacade() {
      const facade = tryGetMapFacade();
      if (facade) {
        facade.goNationalView();
        return;
      }
      if (this.earthMap) {
        if (typeof this.earthMap.setZoom === "function") {
          this.earthMap.setZoom(5);
        }
        if (typeof this.earthMap.zoomToExtent === "function") {
          this.earthMap.zoomToExtent([110.55, 29.32]);
        }
      }
    },
    /**
     * 移除操作图层中不在保留列表的层（资源菜单图层除外）
     * 经 removeHostLayerViaFacade，避免页面直接 me.earth
     */
    removeOperationLayersExceptViaFacade(keepIds) {
      const ids = keepIds || [];
      const earth = getMeEarth();
      const lm = earth && earth.layerManager;
      if (!lm || typeof lm.getOperationLayers !== "function") {
        return false;
      }
      const layers = lm.getOperationLayers() || [];
      for (let i = layers.length - 1; i >= 0; i--) {
        const lyr = layers[i];
        if (lyr && ids.indexOf(lyr.id) === -1) {
          this.removeHostLayerViaFacade(lyr);
        }
      }
      return true;
    }
  }
};

export default mapFacadeMixin;
