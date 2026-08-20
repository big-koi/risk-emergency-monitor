/**
 * 页面壳：UI 开关、任务点击、图表桥、时间/底图等薄方法 + 展示用 computed
 * 工具栏展示码优先 Store.queryCode（第 52 批读源收口起步）
 */
import moment from "moment";
import * as echarts from "echarts";
import { getNowTime as fetchNowTimeApi } from "@/api/rapidAnalysis/index.js";
import {
  pickMostSpecificRegionCode
} from "../regionContext.js";
import { getQueryCode } from "../modules/regionSession";
import { buildOlPreviewImagePayload } from "../modules/mapLayers";
import { adjustForecastTime as formatForecastTimeText } from "../modules/warnings";
import {
  buildTaskItemSelectPatch,
  applyTaskTimeSessionOps,
  planTaskItemClickRefresh,
  buildFilledTaskTimeDataList
} from "../modules/taskSession";
import {
  renderSumChartOnPanel,
  disposeSumChartOnPanel,
  resizeSumChartOnPanel,
  initDetailsChartOnPanel
} from "../modules/charts";

export const pageShellMixin = {
  computed: {
    /** 详情钻取图：统一 mode 供 DetailChartsPanel */
    detailChartMode() {
      if (this.isByDetailsChart) return "by";
      if (this.isSkDetailsChart) return "sk";
      if (this.isJsDetailsChart) return "js";
      return "";
    },
    /** 预警面板标题区：实时跟随当前行政区 */
    warningInfoDisplayRegion() {
      return this.getWarningRegionLabel();
    },
    /**
     * 工具栏展示名：优先 Store.queryCode，再回退 regionContext
     * （Region Store 读源收口起步，仍保留 context 兜底）
     */
    regionToolbarDisplayLabel() {
      const code = pickMostSpecificRegionCode([
        this.getStoreQueryCode(),
        getQueryCode(this.regionContext),
        this.regionContext.warningCode,
        this.regionContext.code,
        this.positionXzqCode
      ]);
      if (!code) {
        return "";
      }
      return this.resolveRegionDisplayLabel(code) || "";
    },
    currentWarningInfo() {
      let info = null;
      if (this.disasterTypeIndex === 1 || this.disasterTypeIndex === 2) {
        info = this.rainfallWarningInfo;
      } else if (this.disasterTypeIndex === 3) {
        info = this.csnlWarningInfo;
      } else if (this.disasterTypeIndex === 4) {
        info = this.shWarningInfo;
      }
      if (!info) {
        return null;
      }
      if (this.newTime) {
        return { ...info, warningTime: this.newTime };
      }
      return info;
    },
    // 是否显示时间轴（内涝/山洪全国浏览默认隐藏，钻取详情保留）
    timeAxisShow() {
      if (this.disasterTypeIndex === 2) {
        return false;
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart
      ) {
        return false;
      }
      return true;
    },
    mapLegendBottom() {
      if (this.disasterTypeIndex === 2) {
        return "0.1rem";
      }
      if (
        (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
        !this.isJsDetailsChart
      ) {
        return "0.1rem";
      }
      return "1.5rem";
    }
  },
  methods: {
    moment,
    onDragResizable(event) {
      if (event.type === "drag") {
        console.log(`拖拽中 - 位置: X=${event.x}, Y=${event.y}`);
      } else if (event.type === "resize") {
        console.log(`调整大小中 - 宽度: ${event.width}, 高度: ${event.height}`);
      }
    },
    setJcsbLegendShow(type) {
      this.isJcsbLegendShow = type;
    },
    adjustForecastTime(forecastString) {
      return formatForecastTimeText(forecastString);
    },
    getNowTime() {
      fetchNowTimeApi({
        taskTime: this.taskSelectedTime
      }).then(res => {
        if (res.code === 200) {
          this.newTime = res.data;
        }
      });
    },
    handleDateChange(date) {
      this.liveDate[0] = moment(date[0]._d).format("YYYY-MM-DD HH:mm:ss");
      this.liveDate[1] = moment(date[1]._d).format("YYYY-MM-DD HH:mm:ss");
    },
    onLiveRainTypeChange(data) {
      this.clearBusinessLayersViaFacade();
      this.removeMapAllMaker();
      this.liveRainType = data.target.value;
      this.getSkJsData();
    },
    changeBaseMap(shows) {
      this.basemapShows = shows;
    },
    showStatistics() {
      if (this.currentStep == 1) {
        this.isShowBar = true;
      }
      if (this.currentStep == 3) {
        this.tableShow = true;
      }
    },
    removeLayersExceptResourceMenu() {
      this.removeOperationLayersExceptViaFacade(this.resourceMenuLayerIds);
    },
    openNlWarningTableList() {
      this.nlVisible = true;
    },
    openSHWarningTableList() {
      this.shVisible = true;
    },
    openByWarningTableList() {
      this.byVisible = true;
    },
    initChart(data) {
      this.$nextTick(() => {
        this.myChart = renderSumChartOnPanel(
          this.$refs.statsChartPanel,
          data
        );
      });
    },
    disposeSumChart() {
      this.myChart = disposeSumChartOnPanel(
        this.$refs.statsChartPanel,
        this.myChart
      );
    },
    resizeSumChart() {
      resizeSumChartOnPanel(this.$refs.statsChartPanel, this.myChart);
    },
    syncOlPreviewImageLayer(url, imageExtent) {
      this.olPreviewImageLayer = buildOlPreviewImagePayload(
        url,
        imageExtent || this.imageExtent,
        0.55
      );
    },
    initDetailsChartInstance(kind) {
      this.myDetailsChart = initDetailsChartOnPanel(
        this.$refs.detailChartsPanel,
        echarts,
        kind,
        this.myDetailsChart
      );
      return this.myDetailsChart;
    },
    taskItemClick(item) {
      const select = buildTaskItemSelectPatch(item, this.taskList);
      Object.assign(this, select.statePatch);
      applyTaskTimeSessionOps(select.session);
      const plan = planTaskItemClickRefresh({
        disasterTypeIndex: this.disasterTypeIndex,
        isMapType: this.isMapType,
        csnlValue: this.csnlValue,
        shValue: this.shValue
      });
      if (plan.prep.clearThreeMapEffect && this.$refs.threeMap) {
        this.$refs.threeMap.clearEffect();
      }
      if (plan.prep.resetNlthreeCreated) {
        this.nlthreeCreated = 1;
      }
      if (plan.prep.removeMapMarkers) {
        this.removeMapAllMaker();
      }
      this.applyPostTaskLoadPlan({ actions: plan.actions });
    },
    taskCalendarSelect(date) {
      this.taskTimeDataList = buildFilledTaskTimeDataList(
        moment(date).format("YYYY-MM-DD"),
        this.taskList
      );
      if (process.env.NODE_ENV === "development") {
        console.log("原始时间数组", this.taskTimeDataList);
      }
    },
    removeMapAllMaker() {
      this.clearMarkersViaFacade();
    }
  }
};
