/**
 * 预警信息拉取 / 区域文案 / 中心点定位弹窗
 */
import { tryGetMapFacade } from "@/map";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import {
  queryRainfallRange,
  queryFloodRangeCsnl,
  queryFloodRangeSh
} from "@/api/rapidAnalysis/index.js";
import {
  buildRainfallWarningInfo,
  buildCsnlWarningInfo,
  buildShWarningInfo,
  getEmptyRainfallWarningInfo,
  getEmptyCsnlWarningInfo,
  getEmptyShWarningInfo,
  extractCenterGridRainfall,
  formatAddressFromTianditu,
  parseCenterPoint
} from "../warningInfoHelper.js";
import {
  getWarningCodeFromContext,
  REGION_MODE
} from "../regionContext.js";
import { getQueryCode } from "../modules/regionSession";
import {
  shouldFetchRainfallWarning,
  shouldFetchCsnlWarning,
  shouldFetchShWarning,
  isWarningRequestStale,
  buildWarningQueryBundle,
  resolveModuleWarningFetchKind,
  planWarningInfoFetchStart,
  planWarningInfoFetchSuccess,
  planWarningInfoFetchCatch,
  buildTiandituGeocodeUrl,
  parseTiandituAddress,
  parseTiandituGeocodeResult,
  pickWarningSectionsNeedingAddress,
  resolveWarningRegionParts,
  resolveWarningRegionLabel,
  planProcessWarningCityData
} from "../modules/warnings";

export const warningLocateMixin = {
  methods: {
    /** 按当前模块刷新左上角预警信息 */
    fetchCurrentModuleWarningInfo() {
      const kind = resolveModuleWarningFetchKind(this.disasterTypeIndex);
      if (kind === "rainfall") {
        this.fetchRainfallWarningInfo();
      } else if (kind === "csnl") {
        this.fetchCsnlWarningInfo();
      } else if (kind === "sh") {
        this.fetchShWarningInfo();
      }
    },
    getWarningRegionLabel() {
      const isDrill =
        this.isByDetailsChart ||
        this.isSkDetailsChart ||
        this.isJsDetailsChart;
      let storeDisplay = null;
      if (!isDrill) {
        try {
          storeDisplay = this.$store.getters["region/displayRegion"];
        } catch (e) {
          /* ignore */
        }
      }
      const ctx = this.regionContext;
      const warningCode = getWarningCodeFromContext(ctx);
      const ref = this.$refs.buttonPostion;
      return resolveWarningRegionLabel({
        isDrill: isDrill,
        storeDisplay: storeDisplay,
        regionContext: ctx,
        warningCode: warningCode,
        positionXzqCode: this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart,
        drillMode: REGION_MODE.DRILL,
        ctxHasQueryCode: !!getQueryCode(ctx),
        parts: this.getWarningRegionParts(),
        buttonLocationName: ref && ref.locationName
      });
    },
    getWarningRegionParts() {
      const ref = this.$refs.buttonPostion;
      const ctx = this.regionContext;
      const ctxLabel =
        ctx && ctx.label && ctx.label !== "全国" ? ctx.label : "";
      return resolveWarningRegionParts({
        selected: ref && ref.selected,
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxCode: getQueryCode(ctx),
        ctxLabel: ctxLabel
      });
    },
    enrichWarningPointAddress(warningInfo) {
      const that = this;
      pickWarningSectionsNeedingAddress(warningInfo).forEach(function(sec) {
        const lon = sec.centerPoint.lon;
        const lat = sec.centerPoint.lat;
        that
          .fetchTiandituAddress(lon, lat)
          .then(function(address) {
            that.$set(sec, "address", address || "");
            that.$set(sec, "addressLoading", false);
          })
          .catch(function() {
            that.$set(sec, "address", "");
            that.$set(sec, "addressLoading", false);
          });
      });
    },
    fetchTiandituAddress(lon, lat) {
      return fetch(buildTiandituGeocodeUrl(lon, lat))
        .then(res => res.json())
        .then(res => parseTiandituAddress(res, formatAddressFromTianditu));
    },
    fetchTiandituGeocodeResult(lon, lat) {
      return fetch(buildTiandituGeocodeUrl(lon, lat))
        .then(res => res.json())
        .then(res => parseTiandituGeocodeResult(res))
        .catch(function() {
          return null;
        });
    },
    addLocateMarker(lon, lat) {
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      const imgUrl = require("@/assets/images/rapidAnalysis/locat.png");
      const facade = tryGetMapFacade();
      if (facade && typeof facade.addToolbarMarker === "function") {
        facade.addToolbarMarker([lon, lat], imgUrl, {});
        return;
      }
      if (typeof diitgis !== "undefined" && diitgis.addToobarrMarker) {
        diitgis.addToobarrMarker([lon, lat], imgUrl, {});
      }
    },
    centerMapOnPoint(lon, lat, zoom) {
      const facade = tryGetMapFacade();
      if (facade && typeof facade.centerOnPoint === "function") {
        facade.centerOnPoint(lon, lat, zoom);
        return;
      }
      const map = this.earthMap;
      if (!map) return;
      const targetZoom = zoom != null ? zoom : 14;
      if (map.map && map.map.getView) {
        const view = map.map.getView();
        view.setCenter([lon, lat]);
        view.setZoom(targetZoom);
        return;
      }
      if (typeof map.setZoom === "function") {
        map.setZoom(targetZoom);
      }
      if (typeof map.zoomToExtent === "function") {
        map.zoomToExtent([lon, lat]);
      }
    },
    closeIdentify() {
      this.popupShow = false;
      if (this.identifyOverlay) {
        this.identifyOverlay.set("autoPan", true);
      }
    },
    clearRainfallCenterLocate() {
      this.locateRequestId++;
      this.closeIdentify();
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      if (this.identifyOverlay) {
        this.identifyOverlay.setPosition(undefined);
      }
    },
    showLocatePointPopup(lon, lat, section) {
      const that = this;
      const requestId = ++this.locateRequestId;
      const gridRainfall =
        (section && (section.jyl || section.gridRainfall)) ||
        extractCenterGridRainfall(this.getCurrentWarningRawData()) ||
        "";
      const applyPopup = function(extraFields) {
        if (requestId !== that.locateRequestId) return;
        that.identifyModel = Object.assign(
          {
            address: (section && section.address) || "",
            province: "",
            city: "",
            county: "",
            town: "",
            poi: "",
            jyl: gridRainfall
          },
          extraFields || {}
        );
        delete that.identifyModel.type;
        that.identifyModellon = lon;
        that.identifyModellat = lat;
        that.popupShow = true;
        that.$nextTick(function() {
          if (that.identifyOverlay && requestId === that.locateRequestId) {
            that.identifyOverlay.set("autoPan", true);
            that.identifyOverlay.setPosition([lon, lat]);
          }
        });
      };

      this.fetchTiandituGeocodeResult(lon, lat).then(function(result) {
        if (requestId !== that.locateRequestId) return;
        if (result && result.addressComponent) {
          const ac = result.addressComponent;
          applyPopup(
            Object.assign({}, ac, {
              county: ac.county || ac.district || "",
              poi: ac.poi || ac.address || "",
              address:
                (section && section.address) ||
                formatAddressFromTianditu(ac) ||
                result.formatted_address ||
                "",
              jyl: gridRainfall
            })
          );
        } else {
          applyPopup({
            address: (section && section.address) || "",
            jyl: gridRainfall
          });
        }
      });
    },
    getCurrentWarningRawData() {
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        return this.rainfallWarningRawData;
      }
      if (this.disasterTypeIndex === 3) {
        return this.csnlWarningRawData;
      }
      if (this.disasterTypeIndex === 4) {
        return this.shWarningRawData;
      }
      return null;
    },
    locateRainfallCenter(section) {
      if (!section || !section.centerPoint) return;
      const coord = parseCenterPoint(section.centerPoint);
      if (!coord) return;
      const lon = coord.lon;
      const lat = coord.lat;
      const markerClass = document.getElementsByClassName("markerToobar_class");
      Array.from(markerClass).forEach(function(marker) {
        marker.remove();
      });
      this.addLocateMarker(lon, lat);
      this.centerMapOnPoint(lon, lat, 14);
      const enrichedSection = Object.assign({}, section);
      if (!enrichedSection.jyl && !enrichedSection.gridRainfall) {
        const gridRainfall = extractCenterGridRainfall(
          this.getCurrentWarningRawData()
        );
        if (gridRainfall) {
          enrichedSection.jyl = gridRainfall;
        }
      }
      this.showLocatePointPopup(lon, lat, enrichedSection);
    },
    getWarningQueryParams() {
      const storeWarning = this.$store.getters["region/warningCode"];
      const warningCode =
        storeWarning || getWarningCodeFromContext(this.regionContext);
      return buildWarningQueryBundle({
        warningCode: warningCode || this.positionXzqCode,
        positionXzqCode: warningCode || this.positionXzqCode,
        tableDirllObj: this.tableDirllObj,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart,
        disasterTypeIndex: this.disasterTypeIndex,
        storeQuery: this.getStoreQueryCode(),
        storeWarning: storeWarning,
        regionLabel: this.getWarningRegionLabel(),
        taskTime: this.taskSelectedTime
      });
    },
    beginWarningInfoRequest() {
      const requestId = ++this.warningInfoRequestId;
      this.warningInfoLoading = true;
      return requestId;
    },
    isWarningInfoRequestStale(requestId) {
      return isWarningRequestStale(requestId, this.warningInfoRequestId);
    },
    finishWarningInfoRequest(requestId) {
      if (!this.isWarningInfoRequestStale(requestId)) {
        this.warningInfoLoading = false;
      }
    },
    /**
     * 统一执行模块预警拉取（短临/内涝/山洪）
     * config: { shouldFetch, apiFn, getEmpty, buildInfo, infoKey, rawKey, emptyOptsMode? }
     */
    runModuleWarningFetch(config) {
      const cfg = config || {};
      if (typeof cfg.shouldFetch === "function" && !cfg.shouldFetch()) {
        return;
      }
      const requestId = this.beginWarningInfoRequest();
      const start = planWarningInfoFetchStart({
        bundle: this.getWarningQueryParams(),
        taskTime: this.taskSelectedTime,
        regionParts: this.getWarningRegionParts(),
        getEmpty: cfg.getEmpty,
        emptyOptsMode: cfg.emptyOptsMode || "simple"
      });
      this[cfg.infoKey] = start.initialInfo;
      if (start.skipFetch) {
        this.finishWarningInfoRequest(requestId);
        return;
      }
      const that = this;
      cfg
        .apiFn(start.params)
        .then(function(res) {
          if (that.isWarningInfoRequestStale(requestId)) {
            return;
          }
          const payload = planWarningInfoFetchSuccess(res, start, {
            buildInfo: cfg.buildInfo,
            getEmpty: cfg.getEmpty
          });
          that[cfg.rawKey] = payload.rawData;
          that[cfg.infoKey] = payload.info;
          if (payload.ok) {
            that.enrichWarningPointAddress(that[cfg.infoKey]);
          }
        })
        .catch(function() {
          if (that.isWarningInfoRequestStale(requestId)) {
            return;
          }
          const fail = planWarningInfoFetchCatch(start, cfg.getEmpty);
          that[cfg.rawKey] = fail.rawData;
          that[cfg.infoKey] = fail.info;
        })
        .finally(function() {
          that.finishWarningInfoRequest(requestId);
        });
    },
    fetchRainfallWarningInfo() {
      const that = this;
      this.runModuleWarningFetch({
        shouldFetch: function() {
          return shouldFetchRainfallWarning(that.disasterTypeIndex);
        },
        apiFn: queryRainfallRange,
        getEmpty: getEmptyRainfallWarningInfo,
        buildInfo: buildRainfallWarningInfo,
        infoKey: "rainfallWarningInfo",
        rawKey: "rainfallWarningRawData"
      });
    },
    fetchCsnlWarningInfo() {
      const that = this;
      this.runModuleWarningFetch({
        shouldFetch: function() {
          return shouldFetchCsnlWarning(that.disasterTypeIndex);
        },
        apiFn: queryFloodRangeCsnl,
        getEmpty: getEmptyCsnlWarningInfo,
        buildInfo: buildCsnlWarningInfo,
        infoKey: "csnlWarningInfo",
        rawKey: "csnlWarningRawData"
      });
    },
    fetchShWarningInfo() {
      const that = this;
      this.runModuleWarningFetch({
        shouldFetch: function() {
          return shouldFetchShWarning(that.disasterTypeIndex);
        },
        apiFn: queryFloodRangeSh,
        getEmpty: getEmptyShWarningInfo,
        buildInfo: buildShWarningInfo,
        infoKey: "shWarningInfo",
        rawKey: "shWarningRawData",
        emptyOptsMode: "buildOpts"
      });
    },
    /**
     * 处理预警城市数据并添加到地图
     * @param {Array} list - 预警城市列表
     * @param {string} prefix - 类名前缀（如 'SH' 表示山洪）
     * @param {boolean} shouldAddMarker - 是否添加标记（用于过去三小时数据）
     */
    processWarningCityData(list, prefix = "", shouldAddMarker = true) {
      const plan = planProcessWarningCityData(list, {
        isMapType: this.isMapType,
        prefix: prefix,
        shouldAddMarker: shouldAddMarker,
        hasThreeMap: !!(this.$refs.threeMap)
      });
      if (plan.clearThreeMaker && this.$refs.threeMap) {
        this.$refs.threeMap.clearMaker();
      }
      this.scrollTopList = plan.scrollTopList;
      if (plan.mapAction === "threeMaker" && this.$refs.threeMap) {
        this.$refs.threeMap.addMaker(plan.sourceList);
      } else if (plan.mapAction === "facadeMarkers") {
        plan.markerJobs.forEach(job => {
          this.addMarkerViaFacade(
            job.coordinate,
            job.imgUrl,
            job.data,
            job.type
          );
        });
      }
    },
  }
};

export default warningLocateMixin;
