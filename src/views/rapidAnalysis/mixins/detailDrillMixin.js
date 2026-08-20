/**
 * 排行下钻详情：跨模块恢复、详情图、折线/柱状
 */
import {
  getJsDataXz as fetchJsDataXzApi,
  getSkJsDataXz as fetchSkJsDataXzApi,
  getJssdDataXz as fetchJssdDataXzApi,
  getSKLSJssdDataXz as fetchSklsJssdDataXzApi,
  getShJsWLXZ as fetchShJsWlXzApi,
  getShJsGQXZ as fetchShJsGqXzApi
} from "@/api/rapidAnalysis/index.js";
import { getRainfallDrillCode, resolveDrillRegion, REGION_MODE } from "../regionContext.js";
import {
  planOpenDetailsChart,
  buildCrossModuleFloodNoDataPatch,
  planCrossModuleFloodNoDataRegion,
  getQueryCode
} from "../modules/regionSession";
import { buildLiveDrillParams } from "../modules/liveRainfall";
import { shouldTryResumeCrossModuleFloodDrill, findFloodRankRowForXzqdm as findFloodRankRowForXzqdmFromModule } from "../modules/urbanFlood";
import { resolveFloodTimelineDataType } from "../modules/mapLayers";
import {
  buildByDetailChartOption,
  buildSkDetailChartOption,
  buildJsDetailChartOption,
  buildByDetailQueryParams,
  planByDetailApply,
  planSkDetailApply,
  buildFloodDetailXzParams,
  planFloodFutureDetailApply,
  planCsnlPastDetailApply,
  planShPastMesDetailApply,
  planShPastGqDetailApply,
  pickDetailLineSeries
} from "../modules/charts";

export const detailDrillMixin = {
  methods: {
    findFloodRankRowForXzqdm(drillXzqdm, list) {
      return findFloodRankRowForXzqdmFromModule(drillXzqdm, list);
    },
    handleCrossModuleFloodDrillNoData(pending) {
      Object.assign(this, buildCrossModuleFloodNoDataPatch());
      this.initTimeLine();
      if (this.myChart) {
        this.disposeSumChart();
      }
      const regionPlan = planCrossModuleFloodNoDataRegion(
        pending,
        resolveDrillRegion
      );
      if (regionPlan.action === "applyBrowse") {
        this.applyRegionContext(
          {
            mode: REGION_MODE.BROWSE,
            code: regionPlan.code,
            label: regionPlan.label,
            lockMinCode: null,
            lockMinLevel: null,
            warningCode: regionPlan.warningCode
          },
          { silent: true, skipBoundary: true }
        );
        this.positionXzqCode =
          getQueryCode(this.regionContext) || regionPlan.code;
      }
    },
    tryResumeCrossModuleFloodDrill() {
      const pending = this.pendingCrossModuleFloodDrill;
      if (!shouldTryResumeCrossModuleFloodDrill(pending, this.disasterTypeIndex)) {
        return false;
      }
      const list =
        this.disasterTypeIndex === 3
          ? this.jssdRainRankList
          : this.sHjssdRainRankList;
      this.pendingCrossModuleFloodDrill = null;

      if (!list || !list.length) {
        this.handleCrossModuleFloodDrillNoData(pending);
        return true;
      }

      this.floodCrossDrillNoData = false;
      return false;
    },
    // 钻取详情
    openDetailsChart(item) {
      const plan = planOpenDetailsChart(item, {
        disasterTypeIndex: this.disasterTypeIndex,
        csnlValue: this.csnlValue,
        shValue: this.shValue,
        isMapType: this.isMapType
      });
      Object.assign(this, plan.statePatch);
      if (plan.regionAction === "enterDrill") {
        this.enterDrillRegion(plan.drillItem);
      } else if (plan.regionAction === "storeDrill") {
        this.syncRegionStoreDrill(plan.drillItem);
      }
      if (plan.shouldSearchBoundary) {
        this.searchXzqfw(plan.drillItem);
      }
      if (plan.warningAction === "rainfall") {
        this.fetchRainfallWarningInfo();
      } else if (plan.warningAction === "csnl") {
        this.fetchCsnlWarningInfo();
      } else if (plan.warningAction === "sh") {
        this.fetchShWarningInfo();
      }
      const load = plan.detailLoad || { action: "none" };
      if (load.action === "none") {
        return;
      }
      this.$nextTick(() => {
        if (load.action === "getJsDataXz") {
          this.getJsDataXz(load.item);
        } else if (load.action === "getSkJsDataXz") {
          this.getSkJsDataXz(load.item);
        } else if (load.action === "getShTimeData") {
          this.getShTimeData.apply(this, load.args || []);
        } else if (load.action === "getJssdDataXz") {
          this.getJssdDataXz(load.item);
        } else if (load.action === "getJSsdXzMes") {
          this.getJSsdXzMes(load.item);
        } else if (load.action === "getShJssdDataXz") {
          this.getShJssdDataXz(load.item);
        } else if (load.action === "getShJsGQXZ") {
          this.getShJsGQXZ(load.item);
        }
      });
    },
    // 积水深度过去三小时排行下钻详情
    getJSsdXzMes(item) {
      this.jsDatailsLineData = null;
      fetchSklsJssdDataXzApi(
        buildFloodDetailXzParams(this.taskSelectedTime, item)
      ).then(res => {
        const plan = planCsnlPastDetailApply(res, {
          isMapType: this.isMapType,
          csnlValue: this.csnlValue,
          xzqdm: item && item.xzqdm
        });
        this.applyFloodDetailLinePlan(plan);
      });
    },
    // 山洪积水深度排行下钻详情
    getShJSsdXzMes(item) {
      this.jsDatailsLineData = null;
      fetchSklsJssdDataXzApi(
        buildFloodDetailXzParams(this.taskSelectedTime, item)
      ).then(res => {
        const plan = planShPastMesDetailApply(res, {
          shValue: this.shValue,
          xzqdm: item && item.xzqdm
        });
        this.applyFloodDetailLinePlan(plan);
      });
    },
    /** 内涝/山洪详情折线 + 时间轴后续动作 */
    applyFloodDetailLinePlan(plan) {
      if (!plan || !plan.ok) {
        return;
      }
      this.jsDatailsLineData = plan.lineData;
      if (plan.jsChartType) {
        this.jsChartType = plan.jsChartType;
      }
      if (plan.timelineAction === "jsSd") {
        this.getJsSd(
          plan.timelineDataType ||
            resolveFloodTimelineDataType(this.timeTabActive)
        );
      } else if (plan.timelineAction === "sklssjz") {
        this.getSKLSSJZ.apply(this, plan.timelineArgs || []);
      } else if (plan.timelineAction === "shTimeData") {
        this.getShTimeData.apply(this, plan.timelineArgs || []);
      }
      this.setJsChartLine(
        pickDetailLineSeries(
          plan.lineData,
          plan.chartKey || this.jsChartType
        )
      );
    },
    // 详情返回
    returnToInitTableChart() {
      this.exitTableDetailView();
      this.$nextTick(() => {
        this.refreshListAfterExitDetail();
      });
    },
    // 详情图表
    byChangeChartType(type) {
      this.byChartType = type;
      this.setByChartBar(this.byDatailsBarData[this.byChartType]);
    },
    getJsDataXz(item) {
      fetchJsDataXzApi(buildByDetailQueryParams(item)).then(res => {
        const plan = planByDetailApply(res, this.byChartType);
        if (!plan.ok) {
          return;
        }
        this.byDatailsBarData = plan.barData;
        this.setByChartBar(plan.chartData);
      });
    },
    setByChartBar(data) {
      const chart = this.initDetailsChartInstance("by");
      if (!chart) return;
      chart.setOption(buildByDetailChartOption(data));
    },
    //实况降雨
    getSkJsDataXz(item) {
      const drillCode = getRainfallDrillCode(item);
      fetchSkJsDataXzApi(
        buildLiveDrillParams({
          taskTime: this.taskSelectedTime,
          liveRainType: this.liveRainType,
          xzqdm: drillCode
        })
      ).then(res => {
        const plan = planSkDetailApply(res, item, drillCode);
        if (!plan.ok) {
          return;
        }
        this.setSkChartBar(plan.chartData);
        if (plan.marker) {
          const iconUrl = require("@/assets/images/rapidAnalysis/skjyXzIcon.png");
          this.addMarkerViaFacade(
            plan.marker.coordinate,
            iconUrl,
            plan.marker.data,
            plan.marker.type
          );
        }
      });
    },
    setSkChartBar(data) {
      const chart = this.initDetailsChartInstance("sk");
      if (!chart) return;
      chart.setOption(buildSkDetailChartOption(data));
    },
    // 积水深度
    jsChangeChartType(type) {
      this.jsChartType = type;
      this.setJsChartLine(this.jsDatailsLineData[this.jsChartType]);
    },
    getJssdDataXz(item) {
      this.jsDatailsLineData = null;
      fetchJssdDataXzApi(
        buildFloodDetailXzParams(this.taskSelectedTime, item)
      ).then(res => {
        const plan = planFloodFutureDetailApply(res, {
          isMapType: this.isMapType,
          timelineDataType: resolveFloodTimelineDataType(this.timeTabActive),
          jsChartType: this.jsChartType
        });
        this.applyFloodDetailLinePlan(plan);
      });
    },
    // 山洪未来下钻
    getShJssdDataXz(item) {
      this.jsDatailsLineData = null;
      fetchShJsWlXzApi(
        buildFloodDetailXzParams(this.taskSelectedTime, item)
      ).then(res => {
        const plan = planFloodFutureDetailApply(res, {
          isMapType: this.isMapType,
          timelineDataType: resolveFloodTimelineDataType(this.timeTabActive),
          jsChartType: this.jsChartType
        });
        this.applyFloodDetailLinePlan(plan);
      });
    },
    // 山洪过去下钻
    getShJsGQXZ(item) {
      this.jsDatailsLineData = null;
      fetchShJsGqXzApi(
        buildFloodDetailXzParams(this.taskSelectedTime, item)
      ).then(res => {
        const plan = planShPastGqDetailApply(res, {
          isMapType: this.isMapType,
          shValue: this.shValue,
          xzqdm: item && item.xzqdm,
          jsChartType: this.jsChartType
        });
        this.applyFloodDetailLinePlan(plan);
      });
    },
    setJsChartLine(data) {
      const chart = this.initDetailsChartInstance("js");
      if (!chart) return;
      chart.setOption(
        buildJsDetailChartOption(data, this.jsChartType),
        true
      );
    },
    // 查看积水深度
    seeJssdChart() {
      this.isByDetailsChart = false;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = true;
      this.getJssdDataXz();
    },
    // 切换至降雨量
    tabByChart() {
      this.isByDetailsChart = true;
      this.isSkDetailsChart = false;
      this.isJsDetailsChart = false;
    },
  }
};

export default detailDrillMixin;
