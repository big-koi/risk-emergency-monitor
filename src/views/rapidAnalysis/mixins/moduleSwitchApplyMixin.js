/**
 * 灾种切换 apply* 执行壳（委托 taskSession.plan*）
 */
import {
  planModuleSwitchPanelReset,
  planModuleSwitchCleanup,
  buildModuleUiMetaStatePatch,
  uncheckLayerListOptions,
  resolveFloodRankColumns,
  planModuleSwitchRegionPrep,
  planModuleSwitchPending,
  planModuleSwitchBoundary,
  planModuleSwitchLoad,
  resolveShortTermRankColumnsOnSwitch,
  shouldSearchQxtYjOnSwitch,
  buildModuleActiveIndexPatch
} from "../modules/taskSession";

export const moduleSwitchApplyMixin = {
  methods: {
    /** 灾种切换：面板复位 */
    applyModuleSwitchPanelReset() {
      const panel = planModuleSwitchPanelReset();
      if (panel.clearFloodCrossDrillNoData) {
        this.floodCrossDrillNoData = false;
      }
      if (panel.uncheckLayerLists) {
        uncheckLayerListOptions(this.getOpenLayerListRef());
      }
      if (panel.clearHlTlData) {
        this.hlTlData.splice(0);
      }
      if (panel.closeButtonModel && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.isModel = false;
      }
      Object.assign(this, panel.statePatch || {});
    },
    /** 灾种切换：地图/图层清理 */
    applyModuleSwitchCleanupPlan() {
      const cleanup = planModuleSwitchCleanup();
      if (cleanup.clearDetailFlags) {
        this.isByDetailsChart = false;
        this.isSkDetailsChart = false;
        this.isJsDetailsChart = false;
      }
      if (cleanup.clearFloodSubmergedLayers) {
        this._clearFloodSubmergedMapLayers();
      }
      if (cleanup.clearFloodSubmergedTimer && this._floodSubmergedLoadTimer) {
        clearTimeout(this._floodSubmergedLoadTimer);
        this._floodSubmergedLoadTimer = null;
      }
      if (cleanup.bumpSubmergedRequestId) {
        this.floodSubmergedRequestId += 1;
      }
      if (this.earthMap) {
        if (cleanup.clearBusinessLayersIfMap) {
          this.clearBusinessLayersViaFacade();
        }
        if (cleanup.clearRainfallCacheIfMap) {
          this.clearRainfallLayerCache();
        }
      }
      if (cleanup.clearAdminBoundaries) {
        this.clearAdminRegionBoundaries();
      }
      if (cleanup.clearMarkers) {
        this.removeMapAllMaker();
      }
      if (cleanup.hideTaskList) {
        this.showTaskList = false;
      }
    },
    /** 灾种切换：按 loadPlan 拉任务/刷标题 */
    applyModuleSwitchLoadPlan(loadPlan) {
      if (!loadPlan || loadPlan.kind === "noop") {
        return;
      }
      const uiMeta = loadPlan.uiMeta;
      const metaPatch = buildModuleUiMetaStatePatch(uiMeta, {
        includeMapType:
          loadPlan.kind === "shortTerm" || loadPlan.kind === "live"
      });
      if (metaPatch) {
        Object.assign(this, metaPatch);
      }
      if (loadPlan.clearScrollTop) {
        this.scrollTopList = [];
      }
      if (
        loadPlan.kind === "urbanFlood" ||
        loadPlan.kind === "mountainFlood"
      ) {
        this.nlColumns = resolveFloodRankColumns(
          this.nlColumns,
          loadPlan.periodValue
        );
        if (loadPlan.resetThreeMap && this.$refs.threeMap) {
          this.$refs.threeMap.resetApi();
          this.$refs.threeMap.clearEffect();
        }
      }
      if (loadPlan.taskType != null) {
        this.getTaskList(loadPlan.taskType, {
          skipRegionRestore: loadPlan.skipRegionRestore
        });
      }
      if (loadPlan.alsoLoadLiveRain) {
        this.getSkJsData();
      }
    },
    //切换数据
    tabDisasterType(type) {
      this.syncRegionStoreModule(type);
      const crossModuleFloodDrill = this.buildCrossModuleFloodDrill(type);
      this.applyModuleSwitchPanelReset();
      if (shouldSearchQxtYjOnSwitch(this.qxyjCheckkData, type)) {
        this.searchQxtYj();
      }
      this.nlColumns = resolveShortTermRankColumnsOnSwitch(this.nlColumns);
      this.reconcileRegionFromButton();
      const prep = planModuleSwitchRegionPrep({
        fromIndex: this.disasterTypeIndex,
        toType: type,
        mode: this.regionContext.mode
      });
      if (prep.saveBrowseSnapshot) {
        this.saveBrowseSnapshotIfNeeded();
      }
      if (prep.promoteDrill) {
        this.promoteDrillRegionBeforeModuleSwitch();
      }
      if (prep.syncOnSwitch) {
        this.syncRegionOnModuleSwitch(type);
      }
      this.applyModuleSwitchCleanupPlan();
      Object.assign(this, buildModuleActiveIndexPatch(type));
      const pendingPlan = planModuleSwitchPending({ toType: type });
      if (pendingPlan.adoptCrossModule) {
        this.adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill);
      }
      if (pendingPlan.clearDrillFields) {
        this.detailsTitleXzqh = "";
        this.tableDirllObj = {};
      }
      if (pendingPlan.setPending) {
        this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
      } else if (pendingPlan.clearPending) {
        this.pendingCrossModuleFloodDrill = null;
      }
      const boundaryPlan = planModuleSwitchBoundary({
        toType: type,
        activeCode: this.getActiveFloodXzqdm()
      });
      if (boundaryPlan.action === "syncAndRestore") {
        this.syncActiveRegionToButton();
        this.$nextTick(() => {
          this.restoreActiveRegionBoundary();
        });
      } else if (boundaryPlan.action === "resetNational") {
        if (this.$refs.buttonPostion) {
          this.$refs.buttonPostion.resetToNational({ silent: true });
        }
        this.goNationalViewViaFacade();
      }
      this.applyModuleSwitchLoadPlan(
        planModuleSwitchLoad({
          toType: type,
          csnlValue: this.csnlValue,
          shValue: this.shValue,
          isMapType: this.isMapType
        })
      );
    },
  }
};

export default moduleSwitchApplyMixin;

