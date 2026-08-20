/**
 * 淹没城市极值图 + 内涝/山洪排行结果后续
 */
import { getDljySJZJZT, getSKLSSJZJZT } from "@/api/rapidAnalysis/index.js";
import {
  mapRankResponseList,
  resolveFloodRankLoadStatus,
  planWarningCityStateApply,
  planFinishFloodRankLoad
} from "../modules/rankings";
import {
  adaptFloodRankItem,
  filterSubmergedFilenames as filterSubmergedFilenamesFromModule,
  planFloodSubmergedCitiesLoad,
  planFloodSubmergedFetchStart,
  planFloodSubmergedListResponse,
  planLoadFloodMapForActiveRegion
} from "../modules/urbanFlood";
import { planRefreshFloodModuleData } from "../modules/taskSession";

export const floodRankMapMixin = {
  methods: {
    /** 按行政区码过滤淹没城市 png 列表 */
    filterSubmergedFilenames(list, xzqdm) {
      return filterSubmergedFilenamesFromModule(list, xzqdm);
    },
    /** 内涝/山洪全国浏览：极值图接口加载淹没城市（2D，无时间轴） */
    loadFloodSubmergedCities() {
      const plan = planFloodSubmergedCitiesLoad({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        isMapType: this.isMapType,
        taskSelectedTime: this.taskSelectedTime
      });
      if (plan.action === "markNoData") {
        this.floodMapNoSubmergedData = true;
        return;
      }
      if (plan.action !== "schedule") {
        return;
      }
      if (this._floodSubmergedLoadTimer) {
        clearTimeout(this._floodSubmergedLoadTimer);
      }
      this._floodSubmergedLoadTimer = setTimeout(() => {
        this._floodSubmergedLoadTimer = null;
        this._doLoadFloodSubmergedCities();
      }, plan.debounceMs);
    },
    _doLoadFloodSubmergedCities() {
      const requestId = ++this.floodSubmergedRequestId;
      const start = planFloodSubmergedFetchStart({
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue,
        taskSelectedTime: this.taskSelectedTime
      });
      const apiFn =
        start.apiKind === "future" ? getDljySJZJZT : getSKLSSJZJZT;

      this._clearFloodSubmergedMapLayers();
      this.floodMapNoSubmergedData = false;

      apiFn(start.params)
        .then(res => {
          const result = planFloodSubmergedListResponse(res, {
            requestId: requestId,
            currentRequestId: this.floodSubmergedRequestId,
            xzqdm: this.getFloodQueryXzqdm(),
            taskSelectedTime: this.taskSelectedTime,
            isFuture: start.isFuture
          });
          if (result.action === "stale") {
            return;
          }
          if (result.action === "noData") {
            this.floodMapNoSubmergedData = true;
            return;
          }
          this._loadSubmergedLayersParallel(
            result.filtered,
            result.dateArray,
            result.loadObj
          );
        })
        .catch(() => {
          if (requestId !== this.floodSubmergedRequestId) {
            return;
          }
          this.floodMapNoSubmergedData = true;
        });
    },
    loadFloodMapForActiveRegion() {
      const plan = planLoadFloodMapForActiveRegion({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        isMapType: this.isMapType,
        xzqdm: this.getFloodQueryXzqdm(),
        csnlValue: this.csnlValue,
        shValue: this.shValue,
        tableDirllXzqdm:
          (this.tableDirllObj && this.tableDirllObj.xzqdm) || ""
      });
      if (plan.action === "submergedCities") {
        this.loadFloodSubmergedCities();
      } else if (plan.action === "jsSd") {
        this.getJsSd(plan.dataType);
      } else if (plan.action === "sklssjz") {
        this.getSKLSSJZ(plan.xzqdm);
      } else if (plan.action === "shTimeData") {
        this.getShTimeData.apply(this, plan.args || []);
      }
    },
    pushFloodRankItems(targetList, rawData) {
      const items = mapRankResponseList(
        { code: 200, data: rawData },
        adaptFloodRankItem
      );
      items.forEach(function(item) {
        targetList.push(item);
      });
    },
    applyFloodRankApiResult(targetList, res) {
      const status = resolveFloodRankLoadStatus(
        res,
        !!this.getActiveFloodXzqdm()
      );
      if (status === "ok") {
        this.pushFloodRankItems(targetList, res.data);
        this.finishFloodRankLoad(targetList);
        return;
      }
      if (status === "empty") {
        this.finishFloodRankLoad([]);
      }
    },
    applyWarningCityApiResult(res, processType, processFlag) {
      const plan = planWarningCityStateApply(res, processType, processFlag);
      if (!plan.ok) return false;
      Object.assign(this, plan.patch);
      this.processWarningCityData.apply(this, plan.processArgs);
      return true;
    },
    finishFloodRankLoad(list) {
      if (this.tryResumeCrossModuleFloodDrill()) {
        return;
      }
      const plan = planFinishFloodRankLoad(list, {
        xzqdm: this.getActiveFloodXzqdm()
      });
      if (plan.action === "crossModuleNoData") {
        this.handleCrossModuleFloodDrillNoData(this.buildPendingFloodRegion());
        return;
      }
      if (plan.syncRegion) {
        this.syncActiveRegionToButton();
      }
      if (plan.loadMap) {
        this.loadFloodMapForActiveRegion();
      }
      if (plan.initChart) {
        this.initChart(list);
      }
    },
    refreshCurrentFloodModuleData() {
      const plan = planRefreshFloodModuleData({
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue
      });
      (plan.actions || []).forEach(name => {
        if (typeof this[name] === "function") {
          this[name]();
        }
      });
    },
  }
};

export default floodRankMapMixin;
