/**
 * 任务列表开关与加载后续编排
 */
import { getTaskList as fetchTaskListApi } from "@/api/rapidAnalysis/index.js";
import {
  resolveTaskSelectedTime,
  buildTaskListUiResetFlags,
  planEmptyTaskListResult,
  buildPostTaskLoadExecution
} from "../modules/taskSession";

export const taskListMixin = {
  methods: {
    //任务列表
    openTaskList() {
      this.showTaskList = !this.showTaskList;
      this.$refs.buttonPostion.isModel = false;
      this.isOpenLayerList = false;
      this.IdentifyShow = false;
    },
    getTaskList(type, options = {}) {
      const { skipRegionRestore = false } = options;
      if (this.myChart) {
        this.disposeSumChart();
      }
      Object.assign(this, buildTaskListUiResetFlags());
      this.removeMapAllMaker();
      fetchTaskListApi({
        taskType: type
      }).then(res => {
        if (res.code !== 200) {
          return;
        }
        if (res.data.length == 0) {
          const emptyPlan = planEmptyTaskListResult({
            pendingDrill: this.pendingCrossModuleFloodDrill,
            disasterTypeIndex: this.disasterTypeIndex
          });
          if (emptyPlan.clearTimeline) {
            this.timeData = [];
            this.initTimeLine();
          }
          if (emptyPlan.clearFloodRanks) {
            this.sHjssdRainRankList = [];
            this.jssdRainRankList = [];
          }
          const pendingDrill = emptyPlan.pendingDrill;
          if (emptyPlan.clearPending) {
            this.pendingCrossModuleFloodDrill = null;
          }
          if (emptyPlan.handleCrossModuleNoData) {
            this.handleCrossModuleFloodDrillNoData(pendingDrill);
          }
          return;
        }
        this.taskList = res.data;
        this.taskStatus = res.data[0].lostdata || "";
        const timeState = resolveTaskSelectedTime({
          savedIsNowTime: sessionStorage.getItem("rapidAnalysis_isNowTime"),
          savedTaskTime: sessionStorage.getItem(
            "rapidAnalysis_taskSelectedTime"
          ),
          latestTaskTime: res.data[0].tasktime || ""
        });
        this.taskSelectedTime = timeState.taskSelectedTime;
        this.isNowTime = timeState.isNowTime;
        this.historyTaskTime = timeState.historyTaskTime;
        this.getNowTime();
        this.applyPostTaskLoadPlan(
          buildPostTaskLoadExecution({
            disasterTypeIndex: this.disasterTypeIndex,
            skipRegionRestore: skipRegionRestore,
            tjuTabChke: this.tjuTabChke,
            csnlValue: this.csnlValue,
            shValue: this.shValue
          })
        );
      });
    },
    /** 执行任务列表加载后的后续动作 */
    applyPostTaskLoadPlan(execution) {
      if (!execution || !Array.isArray(execution.actions)) {
        return;
      }
      execution.actions.forEach(action => {
        if (action === "syncRegion") {
          this.syncActiveRegionToButton();
        } else if (action === "getNowTime") {
          this.getNowTime();
        } else if (action === "fetchCurrentModuleWarning") {
          this.fetchCurrentModuleWarningInfo();
        } else if (action === "fetchRainfallWarning") {
          this.fetchRainfallWarningInfo();
        } else if (action === "fetchCsnlWarning") {
          this.fetchCsnlWarningInfo();
        } else if (action === "fetchShWarning") {
          this.fetchShWarningInfo();
        } else if (action === "getByyjcsData") {
          this.getByyjcsData();
        } else if (action === "getJsData") {
          this.getJsData();
        } else if (action === "getSixData") {
          this.getSixData();
        } else if (action === "reloadShortTermRainfallLayers") {
          this.reloadShortTermRainfallLayers();
        } else if (action === "getNlyjcsData") {
          this.getNlyjcsData();
        } else if (action === "getJssdData") {
          this.getJssdData();
        } else if (action === "getNlyjcsGqThreeData") {
          this.getNlyjcsGqThreeData();
        } else if (action === "getJsGqthreeData") {
          this.getJsGqthreeData();
        } else if (action === "getshyjcsData") {
          this.getshyjcsData();
        } else if (action === "getshJssdData") {
          this.getshJssdData();
        } else if (action === "getshYjGqData") {
          this.getshYjGqData();
        } else if (action === "getShGqthreeData") {
          this.getShGqthreeData();
        } else if (action === "restoreBoundary") {
          if (this.getActiveFloodXzqdm()) {
            this.$nextTick(() => {
              this.restoreActiveRegionBoundary();
            });
          }
        }
      });
    },
  }
};

export default taskListMixin;
