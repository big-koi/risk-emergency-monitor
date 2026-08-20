/**
 * 行政区会话壳：context 同步、钻取进出、浏览快照、内涝查询码
 * 依赖页面：getWarningRegionParts、navigateToNational、searchXzqfw、$store、$refs.buttonPostion
 */
import { DISASTER_INDEX_MAP } from "@/domain/region/constants";
import { promoteToFloodQueryCode } from "../regionContext.js";
import {
  buildBrowseSnapshotForDrill,
  buildEnterDrillPartial,
  buildExitDrillPartial,
  normalizeButtonRegionCode,
  normalizeBrowseStoreCode,
  isInTableDetailView as isInTableDetailViewFlags,
  planReconcileFromButton,
  shouldSaveBrowseSnapshot,
  resolveBrowseSnapshotLabel,
  buildBrowseSnapshotContext,
  buildPromoteDrillToBrowse,
  buildActiveBrowsePartial,
  planRestoreBrowseFromSnapshot,
  buildRestoreBrowsePartial,
  resolveActiveFloodXzqdm,
  planFloodBrowsePromotion,
  planSyncActiveRegionToButton,
  resolveFloodQueryXzqdm,
  resolveFloodMapXzqdm,
  planAdoptCrossModuleRegion,
  mergeRegionContextState,
  shouldShadowSyncBrowseStore,
  resolveRegionButtonLabelFromSources,
  resolveRegionDisplayLabelFromSources,
  buildToolbarRegionPayload,
  getQueryCode
} from "../modules/regionSession";
import {
  buildFloodRankParams as buildFloodRankParamsFromModule,
  buildCrossModuleFloodDrillPayload,
  buildPendingFloodRegionPayload
} from "../modules/urbanFlood";

export const regionSessionMixin = {
  methods: {
    /** 同步行政区上下文到工具栏（单一数据源入口） */
    applyRegionContext(partial, options = {}) {
      const {
        silent = false,
        skipButtonSync = false,
        skipBoundary = false,
        skipStore = false
      } = options;
      const next = mergeRegionContextState(this.regionContext, partial);
      this.regionContext = next;
      this.positionXzqCode = getQueryCode(next);

      if (shouldShadowSyncBrowseStore(next, skipStore)) {
        this.syncRegionStoreBrowse(
          normalizeBrowseStoreCode(next.code),
          next.label || "全国"
        );
      }

      if (!skipButtonSync && this.$refs.buttonPostion) {
        this.$refs.buttonPostion.applyRegionContext(
          buildToolbarRegionPayload(next, {
            silent: silent,
            skipBoundary: skipBoundary,
            resolveButtonLabel: ctx => this.resolveRegionButtonLabel(ctx),
            resolveDisplayLabel: code => this.resolveRegionDisplayLabel(code)
          })
        );
      }
    },
    /** 解析工具栏展示名称（下钻后 label 可能为空） */
    resolveRegionButtonLabel(ctx) {
      const ref = this.$refs.buttonPostion;
      const parts = this.getWarningRegionParts();
      return resolveRegionButtonLabelFromSources({
        ctx: ctx,
        isFloodModule:
          this.disasterTypeIndex === 3 || this.disasterTypeIndex === 4,
        locationName: ref && ref.locationName,
        tableDirllObj: this.tableDirllObj,
        detailsTitleXzqh: this.detailsTitleXzqh,
        partsRegionLabel: parts && parts.regionLabel
      });
    },
    /** 模块切换/同步工具栏时解析展示名称（多源兜底） */
    resolveRegionDisplayLabel(code) {
      const codeStr = code ? String(code).trim() : "";
      const ctx = Object.assign({}, this.regionContext, {
        code: codeStr,
        warningCode: codeStr
      });
      return resolveRegionDisplayLabelFromSources({
        code: codeStr,
        ctxLabel: ctx.label,
        buttonLabel: this.resolveRegionButtonLabel(ctx),
        parts: this.getWarningRegionParts()
      });
    },
    resetRegionToNational(options = {}) {
      const { silent = false, skipMapClear = false } = options;
      this.navigateToNational({ skipButtonReset: silent });
      if (skipMapClear) {
        /* navigateToNational 已清地图；保留参数兼容旧调用 */
      }
    },
    /** 同步新 region Store：用户浏览选择 */
    syncRegionStoreBrowse(code, name) {
      this.$store.dispatch("region/selectRegion", {
        code: code || "",
        name: name || (code ? code : "全国")
      });
    },
    /** 同步新 region Store：表格钻取 */
    syncRegionStoreDrill(item) {
      const module =
        DISASTER_INDEX_MAP[this.disasterTypeIndex] ||
        DISASTER_INDEX_MAP[1];
      this.$store.dispatch("region/enterTableDrill", { item, module });
    },
    /** 同步新 region Store：退出钻取 */
    syncRegionStoreExitDrill() {
      this.$store.dispatch("region/exitDrill");
    },
    /** 同步新 region Store：切换灾种 */
    syncRegionStoreModule(type) {
      const module = DISASTER_INDEX_MAP[type] || DISASTER_INDEX_MAP[1];
      this.$store.dispatch("region/switchDisaster", module);
    },
    /**
     * 短临/实况优先使用 Store.queryCode（与面板一致）
     * Store 未就绪时回退到 positionXzqCode / regionContext
     */
    getStoreQueryCode() {
      try {
        const fromStore = this.$store.getters["region/queryCode"];
        if (fromStore !== undefined && fromStore !== null) {
          return fromStore;
        }
      } catch (e) {
        /* ignore */
      }
      return this.positionXzqCode || getQueryCode(this.regionContext) || "";
    },
    /** Store 地图定位码（钻取详情优先县码） */
    getStoreMapCode() {
      try {
        const mapRegion = this.$store.getters["region/mapRegion"];
        if (mapRegion && mapRegion.code) {
          return String(mapRegion.code).trim();
        }
      } catch (e) {
        /* ignore */
      }
      return "";
    },
    /** 进入右侧排行下钻：同步工具栏并锁定到市/省 */
    enterDrillRegion(item) {
      const snap = buildBrowseSnapshotForDrill(this.regionContext);
      if (snap) {
        this.regionContext.browseSnapshot = snap;
      }
      const built = buildEnterDrillPartial(item);
      this.applyRegionContext(built.partial, {
        silent: true,
        skipBoundary: true
      });
      this.positionXzqCode =
        getQueryCode(this.regionContext) || built.positionCode;
      this.syncRegionStoreDrill(item);
    },
    /** 退出下钻：恢复进入下钻前的浏览范围 */
    exitDrillRegion() {
      const snap = this.regionContext.browseSnapshot;
      const label = snap ? this.resolveRegionButtonLabel(snap) : "";
      this.applyRegionContext(buildExitDrillPartial(snap, label), {
        silent: true
      });
      this.positionXzqCode = getQueryCode(this.regionContext);
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.regionLock = null;
      }
      this.syncRegionStoreExitDrill();
      this.syncRegionStoreBrowse(
        this.positionXzqCode,
        (this.regionContext && this.regionContext.label) || "全国"
      );
    },
    /** 工具栏当前选中行政区码 */
    getButtonRegionCode() {
      const ref = this.$refs.buttonPostion;
      return normalizeButtonRegionCode(ref && ref.locationCode);
    },
    /** 浏览态：双向同步行政区（按钮 ↔ context），修复 code/name 不一致 */
    reconcileRegionFromButton() {
      const ref = this.$refs.buttonPostion;
      const plan = planReconcileFromButton({
        mode: this.regionContext.mode,
        btnCode: this.getButtonRegionCode(),
        ctxCode: getQueryCode(this.regionContext),
        posCode: this.positionXzqCode
          ? String(this.positionXzqCode).trim()
          : "",
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxLabel: this.regionContext.label,
        browseSnapshot: this.regionContext.browseSnapshot,
        resolveLabel: code => this.resolveRegionDisplayLabel(code)
      });
      if (plan.action !== "apply") {
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
    },
    /** 离开降雨模块前保存浏览态快照（兼容 regionContext 与 positionXzqCode 双轨） */
    saveBrowseSnapshotIfNeeded() {
      if (!shouldSaveBrowseSnapshot(this.regionContext.mode)) {
        return;
      }
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      if (!code || code === "100000") {
        return;
      }
      const ref = this.$refs.buttonPostion;
      const label = resolveBrowseSnapshotLabel({
        code: code,
        ctxLabel: this.regionContext.label,
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName
      });
      this.regionContext.browseSnapshot = buildBrowseSnapshotContext(
        code,
        label
      );
    },
    /** 下钻态切 1/2 前：提升为浏览态，保留 browseSnapshot 供「返回」恢复 */
    promoteDrillRegionBeforeModuleSwitch() {
      const built = buildPromoteDrillToBrowse({
        mode: this.regionContext.mode,
        activeCode: this.getActiveFloodXzqdm(),
        ctxCode: this.regionContext.code,
        ctxLabel: this.regionContext.label,
        warningCode: this.regionContext.warningCode,
        resolvedLabel: this.resolveRegionButtonLabel(this.regionContext)
      });
      if (!built.ok) {
        return false;
      }
      this.applyRegionContext(built.partial, {
        silent: true,
        skipBoundary: true
      });
      this.positionXzqCode = built.positionCode;
      if (this.$refs.buttonPostion) {
        this.$refs.buttonPostion.regionLock = null;
      }
      return true;
    },
    /** 应用当前浏览态行政区（不下钻快照） */
    applyActiveBrowseRegion() {
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      if (!code) {
        return false;
      }
      const label =
        this.resolveRegionDisplayLabel(code) ||
        this.regionContext.label ||
        code;
      this.applyRegionContext(
        buildActiveBrowsePartial(
          code,
          label,
          this.regionContext.browseSnapshot
        ),
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = code;
      return true;
    },
    /** 恢复浏览态行政区，先同步按钮再异步恢复边界 */
    restoreBrowseRegionFromSnapshot() {
      const activeCode = this.getActiveFloodXzqdm();
      const snap = this.regionContext.browseSnapshot;
      const plan = planRestoreBrowseFromSnapshot({
        activeCode: activeCode,
        snap: snap
      });
      if (plan.action === "applyActive") {
        return this.applyActiveBrowseRegion();
      }
      if (plan.action !== "restoreSnap") {
        return false;
      }
      const label = this.resolveRegionButtonLabel(plan.snap);
      this.applyRegionContext(
        buildRestoreBrowsePartial(plan.snap, label),
        { silent: true, skipBoundary: true }
      );
      this.positionXzqCode = getQueryCode(this.regionContext);
      return true;
    },
    /** 模块切换时同步行政区：四模块共享浏览态 */
    syncRegionOnModuleSwitch(type) {
      if ([1, 2, 3, 4].includes(type)) {
        if (this.applyActiveBrowseRegion()) {
          return true;
        }
        return this.restoreBrowseRegionFromSnapshot();
      }
      return false;
    },
    /** 当前内涝/山洪查询用行政区代码 */
    getActiveFloodXzqdm() {
      return resolveActiveFloodXzqdm({
        btnCode: this.getButtonRegionCode(),
        fromCtx: getQueryCode(this.regionContext),
        warningCode: this.regionContext.warningCode
          ? String(this.regionContext.warningCode).trim()
          : "",
        rawCode: this.regionContext.code
          ? String(this.regionContext.code).trim()
          : "",
        posCode: this.positionXzqCode
          ? String(this.positionXzqCode).trim()
          : ""
      });
    },
    /** 内涝/山洪浏览态接口/地图查询码（县码自动上溯到市） */
    getFloodQueryXzqdm() {
      return resolveFloodQueryXzqdm({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        storeMapCode: this.getStoreMapCode(),
        storeQuery: this.getStoreQueryCode(),
        activeCode: this.getActiveFloodXzqdm(),
        promote: promoteToFloodQueryCode
      });
    },
    /** 地图定位用的行政区码：浏览用查询码，钻取用 mapRegion */
    getFloodMapXzqdm() {
      return resolveFloodMapXzqdm({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        storeMapCode: this.getStoreMapCode(),
        storeQuery: this.getStoreQueryCode(),
        floodQueryCode: this.getFloodQueryXzqdm()
      });
    },
    /** 内涝/山洪浏览态：将县选区上溯到市并写入 context */
    applyFloodBrowseRegionPromotion(code, labelHint) {
      const plan = planFloodBrowsePromotion({
        code: code,
        hint:
          labelHint ||
          this.regionContext.label ||
          this.resolveRegionDisplayLabel(code ? String(code).trim() : ""),
        browseSnapshot: this.regionContext.browseSnapshot
      });
      if (plan.action === "noop") {
        return null;
      }
      if (plan.action === "apply") {
        this.applyRegionContext(plan.partial, {
          silent: true,
          skipBoundary: true
        });
        this.positionXzqCode = plan.positionCode;
        return plan.result;
      }
      return plan.result;
    },
    /** 是否处于右侧表格钻取详情页 */
    isInTableDetailView() {
      return isInTableDetailViewFlags({
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        isJsDetailsChart: this.isJsDetailsChart
      });
    },
    /** 将当前行政区同步到工具栏（模块切换/刷数据时兜底） */
    syncActiveRegionToButton() {
      this.reconcileRegionFromButton();
      const code = this.getActiveFloodXzqdm();
      const ref = this.$refs.buttonPostion;
      const plan = planSyncActiveRegionToButton({
        code: code,
        displayLabel: this.resolveRegionDisplayLabel(code),
        locationCode: ref && ref.locationCode,
        locationName: ref && ref.locationName,
        ctxLabel: this.regionContext.label,
        inTableDetail: this.isInTableDetailView(),
        mode: this.regionContext.mode,
        lockMinCode: this.regionContext.lockMinCode,
        lockMinLevel: this.regionContext.lockMinLevel,
        browseSnapshot: this.regionContext.browseSnapshot
      });
      if (plan.action === "noop") {
        return;
      }
      if (plan.action === "buttonLock") {
        if (ref) {
          ref.applyRegionContext(plan.buttonPayload);
        }
        this.positionXzqCode = plan.positionCode;
        return;
      }
      this.applyRegionContext(plan.partial, plan.applyOptions || {});
      this.positionXzqCode = plan.positionCode;
    },
    /**
     * 短临/实况县钻取后切内涝/山洪：携带市县级字段供上溯到市
     */
    buildCrossModuleFloodDrill(targetType) {
      return buildCrossModuleFloodDrillPayload({
        targetType: targetType,
        isByDetailsChart: this.isByDetailsChart,
        isSkDetailsChart: this.isSkDetailsChart,
        tableDirllObj: this.tableDirllObj,
        detailsTitleXzqh: this.detailsTitleXzqh
      });
    },
    /**
     * 降雨下钻切内涝/山洪：县码上溯到市，同步浏览态行政区
     */
    adoptCrossModuleRegionIfNeeded(crossModuleFloodDrill) {
      const plan = planAdoptCrossModuleRegion({
        crossModuleFloodDrill: crossModuleFloodDrill,
        ctxLabel: this.regionContext.label,
        activeCode: this.getActiveFloodXzqdm(),
        displayLabel: this.resolveRegionDisplayLabel(
          this.getActiveFloodXzqdm()
        )
      });
      if (plan.action === "noop") {
        return;
      }
      if (plan.action === "applyDrillBrowse") {
        this.applyRegionContext(plan.partial, {
          silent: true,
          skipBoundary: true
        });
        this.positionXzqCode =
          getQueryCode(this.regionContext) || plan.positionCodeFallback;
        return;
      }
      this.applyFloodBrowseRegionPromotion(
        plan.promoteCode,
        plan.promoteHint
      );
      this.syncActiveRegionToButton();
    },
    buildPendingFloodRegion(extra = {}) {
      return buildPendingFloodRegionPayload(
        this.getFloodQueryXzqdm(),
        this.regionContext.label || "",
        extra
      );
    },
    buildFloodRankParams(base = {}) {
      return buildFloodRankParamsFromModule({
        taskTime: this.taskSelectedTime,
        xzqdm: this.getFloodQueryXzqdm(),
        base
      });
    },
    restoreActiveRegionBoundary() {
      const code = this.getFloodMapXzqdm();
      if (!code) {
        return;
      }
      this.searchXzqfw({
        xzqdm: code,
        name: this.regionContext.label || ""
      });
    }
  }
};

export default regionSessionMixin;
