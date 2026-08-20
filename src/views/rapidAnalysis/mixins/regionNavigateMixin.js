/**
 * 行政区导航 / 退出钻取详情 / 回全国
 */
import { REGION_MODE } from "../regionContext.js";
import {
  buildNationalBrowsePartial,
  buildExitTableDetailStatePatch,
  resolveExitTableDetailDrillAction,
  planRegionNavigateBack,
  planPositionXzqCodeChange,
  getQueryCode
} from "../modules/regionSession";
import {
  planRefreshBrowseAfterRegionChange,
  planRefreshListAfterExitDetail
} from "../modules/taskSession";
import { purgeDrillLayerCacheByXzqdm } from "../modules/mapLayers";

export const regionNavigateMixin = {
  methods: {
    getPositionXzqCode(xzqdm) {
      this.clearRainfallCenterLocate();
      const ref = this.$refs.buttonPostion;
      const plan = planPositionXzqCodeChange({
        xzqdm: xzqdm,
        locationName: ref && ref.locationName,
        mode: this.regionContext.mode,
        lockMinLevel: this.regionContext.lockMinLevel,
        lockMinCode: this.regionContext.lockMinCode,
        warningCode: this.regionContext.warningCode,
        ctxLabel: this.regionContext.label,
        shouldPromoteFlood:
          (this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4) &&
          !this.isJsDetailsChart,
        inTableDetail: this.isInTableDetailView()
      });
      if (plan.action === "toNational") {
        this.navigateToNational({ skipButtonReset: true });
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
      if (plan.shouldSyncButton) {
        this.syncActiveRegionToButton();
      }
      if (plan.shouldSyncStore) {
        const browseLabel =
          (this.regionContext && this.regionContext.label) ||
          plan.storeLabel ||
          "全国";
        this.syncRegionStoreBrowse(plan.positionCode, browseLabel);
      }
      this.refreshBrowseDataAfterRegionChange();
    },
    /** 清除钻取详情页的图层与边界（不刷新列表） */
    clearTableDetailViewLayers() {
      this.drillCurrentVisibleLayerKey = null;
      if (this.tableDirllObj && this.tableDirllObj.xzqdm) {
        purgeDrillLayerCacheByXzqdm(
          this.layerCache,
          this.tableDirllObj.xzqdm,
          layer => this.removeHostLayerViaFacade(layer)
        );
      }
      this.clearAdminRegionBoundaries();
      if (this.$refs.threeMap && this.isMapType) {
        this.$refs.threeMap.clearLine();
      }
    },
    /** 退出右侧表格钻取详情 */
    exitTableDetailView(options = {}) {
      const { skipDrillExit = false } = options;
      if (!this.isInTableDetailView()) {
        return false;
      }
      this.clearRainfallCenterLocate();
      Object.assign(this, buildExitTableDetailStatePatch());
      this.clearTableDetailViewLayers();
      const drillAction = resolveExitTableDetailDrillAction({
        skipDrillExit: skipDrillExit,
        disasterTypeIndex: this.disasterTypeIndex
      });
      if (drillAction === "exitDrill") {
        this.exitDrillRegion();
      } else if (drillAction === "storeExitOnly") {
        this.syncRegionStoreExitDrill();
      }
      return true;
    },
    /** 行政区切换后刷新当前模块浏览数据 */
    refreshBrowseDataAfterRegionChange() {
      const plan = planRefreshBrowseAfterRegionChange({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart
      });
      (plan.actions || []).forEach(action => {
        if (action === "getJsData") {
          this.getJsData();
        } else if (action === "getSkJsData") {
          this.getSkJsData();
        } else if (action === "resetFloodCrossDrill") {
          this.floodCrossDrillNoData = false;
        } else if (action === "setPendingFloodRegion") {
          this.pendingCrossModuleFloodDrill = this.buildPendingFloodRegion();
        } else if (action === "refreshFloodModule") {
          this.refreshCurrentFloodModuleData();
        } else if (action === "fetchWarning") {
          this.fetchCurrentModuleWarningInfo();
        }
      });
    },
    /** 退出钻取详情后恢复列表/图表 */
    refreshListAfterExitDetail() {
      const plan = planRefreshListAfterExitDetail({
        restoredCode: getQueryCode(this.regionContext),
        disasterTypeIndex: this.disasterTypeIndex
      });
      (plan.actions || []).forEach(action => {
        if (action === "goNational") {
          this.goNationalViewViaFacade();
        } else if (action === "restoreBoundary") {
          this.restoreActiveRegionBoundary();
        } else if (action === "fetchRainfallWarning") {
          this.fetchRainfallWarningInfo();
        } else if (action === "getByyjcsData") {
          this.getByyjcsData();
        } else if (action === "getJsData") {
          this.getJsData();
        } else if (action === "initChartShortTerm") {
          this.initChart(this.wlsxsjyRainRankList);
        } else if (action === "showMakerSk") {
          this.showMaker(false, "skjyXz");
        } else if (action === "initChartLive") {
          this.initChart(this.skjsRainRankList);
        } else if (action === "tabDisasterType3") {
          this.tabDisasterType(3);
        } else if (action === "tabDisasterType4") {
          this.tabDisasterType(4);
        }
      });
    },
    /** 回到全国并同步地图、预警、右侧列表 */
    navigateToNational(options = {}) {
      const { skipButtonReset = false } = options;
      this.exitTableDetailView();
      if (this.regionContext.mode === REGION_MODE.DRILL) {
        this.exitDrillRegion();
      }
      this.applyRegionContext(buildNationalBrowsePartial(), {
        silent: true,
        skipButtonSync: skipButtonReset
      });
      this.positionXzqCode = "";
      if (!skipButtonReset && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.resetToNational({ silent: true });
      }
      this.$store.dispatch("region/resetRegion");
      this.clearAdminRegionMapDisplay();
      this.refreshBrowseDataAfterRegionChange();
    },
    /** 行政区划面板「返回」统一入口 */
    handleRegionNavigateBack(payload = {}) {
      const plan = planRegionNavigateBack(payload.step);
      if (plan.action === "countyToCity") {
        this.getPositionXzqCode(payload.code);
        return;
      }
      if (plan.action === "exitLock") {
        this.exitTableDetailView();
        if (this.regionContext.mode === REGION_MODE.DRILL) {
          this.exitDrillRegion();
        }
        const restoredCode = getQueryCode(this.regionContext);
        this.positionXzqCode = restoredCode;
        this.syncActiveRegionToButton();
        this.$nextTick(() => {
          if (restoredCode) {
            this.restoreActiveRegionBoundary();
          } else {
            this.clearAdminRegionMapDisplay();
          }
          this.refreshBrowseDataAfterRegionChange();
          if (this.disasterTypeIndex === 1) {
            this.getByyjcsData();
            this.initChart(this.wlsxsjyRainRankList);
          } else if (this.disasterTypeIndex === 2) {
            this.initChart(this.skjsRainRankList);
          }
        });
        return;
      }
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.resetToNational({ silent: true });
      }
      this.navigateToNational({ skipButtonReset: true });
    },
  }
};

export default regionNavigateMixin;
