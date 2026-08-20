/**
 * 时间轴初始化 / 历史积水深 / 内涝时段 Tab / 短临分辨率
 */
import moment from "moment";
import {
  getSKLSSJZ as fetchSklssjzApi,
  dljySixMinSjz,
  dljyOnehoursSjz,
  dljyThreeHoursSjz
} from "@/api/rapidAnalysis/index.js";
import { fetchShortTermTimeline } from "../modules/shortTermForecast";
import {
  scheduleTimeAxisInit,
  planTimelineApply,
  purgeDrillLayerCacheByXzqdm
} from "../modules/mapLayers";
import {
  shouldFetchFloodDepthTimeline,
  buildFloodPastTimelineParams,
  planFloodHistoryFutureTabLoad
} from "../modules/urbanFlood";

export const timelineOpsMixin = {
  computed: {
    wlDataTime(val) {
      if (this.liveRainType != "other") {
        // 根据传入的值来获取之前的时间，比如传入12就获取当前taskSelectedTime的值12小时以前的时间
        const time = moment(this.taskSelectedTime)
          .subtract(Number(this.liveRainType), "hours")
          .format("YYYY-MM-DD HH:mm");
        return time;
      }
    }
  },
  methods: {
    // 初始化加载时间轴
    initTimeLine() {
      const that = this;
      scheduleTimeAxisInit(function() {
        if (that.$refs.timeAxis) {
          that.$refs.timeAxis.initTimeLine();
        }
      });
    },
    /** 统一应用时间轴接口结果（可选钻取/短临预加载） */
    applyTimelineResponse(res, options) {
      const plan = planTimelineApply(res, options || {});
      if (plan.skipped) {
        return plan;
      }
      if (plan.shouldPreloadDrill) {
        this.cacheDrillLayers(plan.timeData);
      }
      if (plan.shouldPreloadShortTerm) {
        this.cacheLayers2(plan.timeData);
      }
      this.timeData = plan.timeData;
      this.initTimeLine();
      return plan;
    },
    // 积水深度过去三小时时间轴（仅钻取详情或 3D 使用）
    getSKLSSJZ(id) {
      if (
        !shouldFetchFloodDepthTimeline({
          disasterTypeIndex: this.disasterTypeIndex,
          isJsDetailsChart: this.isJsDetailsChart,
          isMapType: this.isMapType
        })
      ) {
        return;
      }
      fetchSklssjzApi(
        buildFloodPastTimelineParams({
          taskTime: this.taskSelectedTime,
          xzqdm: id || "",
          disasterTypeIndex: this.disasterTypeIndex
        })
      ).then(res => {
        if (
          this.isJsDetailsChart &&
          res &&
          res.code === 200 &&
          res.data &&
          res.data.length > 0
        ) {
          console.log(
            "🔵 开始预加载钻取图层（历史），时间轴数据长度:",
            res.data.length
          );
        }
        this.applyTimelineResponse(res, {
          isJsDetailsChart: this.isJsDetailsChart
        });
      });
    },
    timeTabActiveType(index) {
      this.timeTabActive = index;
      // 清除当前显示的钻取图层key，以便重新加载
      this.drillCurrentVisibleLayerKey = null;

      // 清除旧的图层缓存（历史和未来淹没的图层key不同，需要清除）
      if (this.isJsDetailsChart) {
        purgeDrillLayerCacheByXzqdm(
          this.layerCache,
          (this.tableDirllObj && this.tableDirllObj.xzqdm) || "",
          layer => this.removeHostLayerViaFacade(layer)
        );
      }

      const loadPlan = planFloodHistoryFutureTabLoad({
        disasterTypeIndex: this.disasterTypeIndex,
        timeTabActive: this.timeTabActive,
        isMapType: this.isMapType,
        shValue: this.shValue,
        xzqdm: (this.tableDirllObj && this.tableDirllObj.xzqdm) || ""
      });
      if (loadPlan.action === "shTimeData") {
        this.getShTimeData(
          loadPlan.modelType,
          loadPlan.type,
          loadPlan.xzqdm
        );
      } else if (loadPlan.action === "jsSd") {
        this.getJsSd(loadPlan.dataType);
      } else if (loadPlan.action === "sklssjz") {
        this.getSKLSSJZ(loadPlan.xzqdm);
      }
    },
    duanlinTimeChange(index) {
      this.dltimeTabActive = index;
      fetchShortTermTimeline({
        resolution: index,
        taskTime: this.taskSelectedTime,
        fetcherMap: {
          1: dljySixMinSjz,
          2: dljyOnehoursSjz,
          3: dljyThreeHoursSjz
        }
      }).then(res => {
        this.applyTimelineResponse(res, { preloadShortTerm: true });
      });
    },
  }
};

export default timelineOpsMixin;
