/**
 * 行政区边界执行壳（轮廓/高亮/定位/建成区山洪区）
 * 依赖：MapFacade mixin、clearRainfallCenterLocate、earthMap / threeMap
 */
import { tryGetMapFacade } from "@/map";
import {
  searchXzqfw as fetchSearchXzqfw,
  getFwByXzqCode,
  getjcqAndShLk
} from "@/api/rapidAnalysis/index.js";
import {
  normalizeAdminBoundaryFeatures,
  resolveXzqLevelLabel,
  ADMIN_BOUNDARY_LAYER_IDS,
  resolveSearchXzqfwCode,
  planUpladeLine,
  planApplySearchXzqfwBoundary,
  planSearchXzqfwApiResult,
  planRegionBoundaryFallback,
  buildAdAreaStaticUrl
} from "../modules/mapLayers";
import { planJcqShBoundaryResponse } from "../modules/urbanFlood";

function getEarthMap(vm) {
  return vm.earthMap || null;
}

export const adminBoundaryMixin = {
  methods: {
    normalizeUpladeLineFeatures(res) {
      return normalizeAdminBoundaryFeatures(res);
    },
    clearAdminRegionMapDisplay() {
      this.clearRainfallCenterLocate();
      this.clearAdminRegionBoundaries();
      this.goNationalViewViaFacade();
    },
    /** 仅清除行政区边界图层（不改变视野） */
    clearAdminRegionBoundaries() {
      this.removeBufferLayer(ADMIN_BOUNDARY_LAYER_IDS.slice());
      const facade = tryGetMapFacade();
      if (facade) {
        facade.clearHighlight();
      } else {
        const map = getEarthMap(this);
        if (map && map.layerManager) {
          map.layerManager.clearHightLayer();
        }
      }
    },
    upladeLine(res) {
      const map = getEarthMap(this);
      const plan = planUpladeLine(res, {
        isMapType: this.isMapType,
        hasMap: !!(map && map.map)
      });
      if (plan.action === "clearNational") {
        this.clearAdminRegionMapDisplay();
        return;
      }
      if (plan.action !== "addOutline") {
        return;
      }
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addAdminOutline === "function") {
        const ok = facade.addAdminOutline(plan.features, plan.facadeOptions);
        if (ok) {
          return;
        }
      }
      if (!map || !map.map) {
        return;
      }
      const style = plan.style;
      const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
          features: new ol.format.GeoJSON().readFeatures(
            {
              type: "FeatureCollection",
              features: plan.features
            },
            {
              dataProjection: "EPSG:4490",
              featureProjection: "EPSG:4490"
            }
          )
        }),
        zIndex: 20,
        id: "xzq",
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: style.lineColor,
            width: style.lineWidth
          }),
          fill: new ol.style.Fill({
            color: style.fillColor
          })
        })
      });
      this.removeBufferLayer(["xzq"]);
      map.map.addLayer(vectorLayer);
      const extent = vectorLayer.getSource().getExtent();
      this.fitExtentViaFacade(extent, plan.fitOptions);
    },
    removeBufferLayer(idArray = []) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.removeMapLayersByIds === "function") {
        const ok = facade.removeMapLayersByIds(idArray);
        if (ok !== false) return;
      }
      const map = getEarthMap(this);
      if (!map || !map.map) {
        return;
      }
      idArray.forEach(itemId => {
        const allLayers = map.map.getLayers().getArray();
        const geoJsonBorderLayers = allLayers.filter(
          l => l.get("id") === itemId || l.getProperties().id === itemId
        );
        geoJsonBorderLayers.forEach(lyr => {
          map.map.removeLayer(lyr);
        });
      });
    },
    _resolveXzqLevelLabel(code) {
      return resolveXzqLevelLabel(code);
    },
    _applySearchXzqfwBoundary(data, options = {}) {
      const plan = planApplySearchXzqfwBoundary(data, {
        style: options.style,
        zoom: options.zoom,
        isMapType: this.isMapType,
        disasterTypeIndex: this.disasterTypeIndex,
        hasThreeMap: !!(this.$refs.threeMap)
      });
      if (plan.action === "threePolyline") {
        this.$refs.threeMap.addPolyline(plan.data);
        return true;
      }
      if (plan.action !== "highlight") {
        return false;
      }
      const facade = tryGetMapFacade();
      if (facade && typeof facade.highlightBoundary === "function") {
        const ok = facade.highlightBoundary(plan.data, plan.facadeOptions);
        if (ok) {
          return true;
        }
      }
      const map = getEarthMap(this);
      if (!map || !plan.legacyPayload) {
        return false;
      }
      map.zoomToFeatures(
        plan.legacyPayload.features,
        plan.legacyPayload.options
      );
      return true;
    },
    _loadRegionBoundaryFallback(xzqdm, options = {}) {
      const plan = planRegionBoundaryFallback(xzqdm);
      if (plan.action !== "fetchFw") {
        return Promise.resolve(false);
      }
      return getFwByXzqCode({ xzqdm: plan.xzqdm, xzqlevel: plan.xzqlevel })
        .then(res => {
          if (
            res &&
            res.code === 200 &&
            res.data &&
            this._applySearchXzqfwBoundary(res.data, options)
          ) {
            return true;
          }
          return this._loadRegionBoundaryFromStatic(plan.xzqdm, options);
        })
        .catch(() => this._loadRegionBoundaryFromStatic(plan.xzqdm, options));
    },
    _loadRegionBoundaryFromStatic(code, options = {}) {
      const localUrl = buildAdAreaStaticUrl(
        window.servicesConfig && window.servicesConfig.WebServer,
        code
      );
      return new Promise(resolve => {
        $.get(localUrl)
          .done(res => {
            if (res && this._applySearchXzqfwBoundary(res, options)) {
              resolve(true);
              return;
            }
            resolve(false);
          })
          .fail(() => {
            const remoteUrl = buildAdAreaStaticUrl(
              window.servicesConfig && window.servicesConfig.WebServer,
              code
            );
            $.get(remoteUrl)
              .done(res => {
                resolve(
                  !!(res && this._applySearchXzqfwBoundary(res, options))
                );
              })
              .fail(() => resolve(false));
          });
      });
    },
    // 行政区定位
    searchXzqfw(item) {
      const xzqdm = resolveSearchXzqfwCode(item);
      if (!xzqdm) {
        return;
      }
      fetchSearchXzqfw({
        xzqdm
      })
        .then(res => {
          const plan = planSearchXzqfwApiResult(res);
          if (
            plan.action === "apply" &&
            this._applySearchXzqfwBoundary(plan.data)
          ) {
            return;
          }
          return this._loadRegionBoundaryFallback(xzqdm);
        })
        .catch(() => this._loadRegionBoundaryFallback(xzqdm));
    },
    // 山洪区
    searchSHfw(code) {
      const map = getEarthMap(this);
      getjcqAndShLk({ xzqdm: code, xzqType: 2 }).then(res => {
        const plan = planJcqShBoundaryResponse(res, {
          hasEarthMap: !!map
        });
        if (plan.action === "zoomToFeatures") {
          map.zoomToFeatures(plan.features, plan.zoomOptions);
        }
      });
    },
    // 建成区
    searchJCQfw(code) {
      const map = getEarthMap(this);
      getjcqAndShLk({ xzqdm: code, xzqType: 1 }).then(res => {
        const plan = planJcqShBoundaryResponse(res, {
          hasEarthMap: !!map
        });
        if (plan.action === "zoomToFeatures") {
          map.zoomToFeatures(plan.features, plan.zoomOptions);
        }
      });
    }
  }
};

export default adminBoundaryMixin;
