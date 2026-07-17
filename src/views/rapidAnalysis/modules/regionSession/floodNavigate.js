/**
 * 内涝/山洪浏览上溯、工具栏同步、全国/返回导航计划（纯函数）
 */
import {
  resolveFloodBrowseRegion,
  getQueryCode,
  REGION_MODE
} from "../../regionContext";
import { getXzqLevel, XZQ_LEVEL } from "../warnings/warningInfoHelper";
import { buildActiveBrowsePartial } from "./browseReconcile";

/**
 * 县码上溯到市的计划
 * @returns {{ action: 'noop'|'result-only'|'apply', result?, partial?, positionCode? }}
 */
export function planFloodBrowsePromotion(opts) {
  const o = opts || {};
  const rawCode = o.code ? String(o.code).trim() : "";
  if (!rawCode || rawCode === "100000") {
    return { action: "noop", result: null };
  }
  const hint = o.hint || "";
  const resolved = resolveFloodBrowseRegion(rawCode, hint);
  const nextCode = resolved.code || rawCode;
  const result = {
    code: nextCode,
    label: resolved.label || hint,
    warningCode: resolved.warningCode || nextCode
  };

  if (
    nextCode === rawCode &&
    getXzqLevel(rawCode) !== XZQ_LEVEL.COUNTY
  ) {
    return { action: "result-only", result: result };
  }

  if (getXzqLevel(rawCode) === XZQ_LEVEL.COUNTY || nextCode !== rawCode) {
    return {
      action: "apply",
      partial: buildActiveBrowsePartial(
        nextCode,
        resolved.label || hint || nextCode,
        o.browseSnapshot
      ),
      positionCode: nextCode,
      result: resolved
    };
  }
  return { action: "result-only", result: result };
}

/** 同步工具栏时的展示名 */
export function resolveSyncActiveRegionLabel(opts) {
  const o = opts || {};
  let label = o.displayLabel || "";
  const code = o.code || "";
  const refCode = o.locationCode ? String(o.locationCode).trim() : "";
  const refName = o.locationName;
  if (
    !label &&
    refCode &&
    String(code) === refCode &&
    refName &&
    refName !== "全国"
  ) {
    label = refName;
  }
  if (!label) {
    label = o.ctxLabel || "";
  }
  return label || code;
}

/**
 * syncActiveRegionToButton 计划
 * @returns {{ action: 'noop'|'buttonLock'|'applyBrowse', ... }}
 */
export function planSyncActiveRegionToButton(opts) {
  const o = opts || {};
  const code = o.code || "";
  if (!code) {
    return { action: "noop" };
  }
  const label = resolveSyncActiveRegionLabel(o);
  if (o.inTableDetail && o.mode === REGION_MODE.DRILL) {
    const lock = o.lockMinCode
      ? { minCode: o.lockMinCode, minLevel: o.lockMinLevel }
      : null;
    return {
      action: "buttonLock",
      buttonPayload: {
        code: String(code),
        label: label || code,
        lock: lock,
        silent: true,
        skipBoundary: true
      },
      positionCode: code
    };
  }
  return {
    action: "applyBrowse",
    partial: buildActiveBrowsePartial(code, label || code, o.browseSnapshot),
    positionCode: code,
    applyOptions: { silent: true, skipBoundary: true }
  };
}

/** 回到全国的 context partial */
export function buildNationalBrowsePartial() {
  return {
    code: "",
    label: "全国",
    mode: REGION_MODE.BROWSE,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: "",
    browseSnapshot: null
  };
}

/** 退出表格钻取详情时的页面状态 patch */
export function buildExitTableDetailStatePatch() {
  return {
    pendingCrossModuleFloodDrill: null,
    floodCrossDrillNoData: false,
    timeTabActive: 2,
    isInitTableChart: true,
    isByDetailsChart: false,
    isSkDetailsChart: false,
    isJsDetailsChart: false,
    tableDirllObj: {},
    detailsTitleXzqh: ""
  };
}

/**
 * 退出详情后对钻取态的后续动作
 * @returns {'exitDrill'|'storeExitOnly'|'none'}
 */
export function resolveExitTableDetailDrillAction(opts) {
  const o = opts || {};
  if (o.skipDrillExit) {
    return "none";
  }
  if (o.disasterTypeIndex === 1 || o.disasterTypeIndex === 2) {
    return "exitDrill";
  }
  if (o.disasterTypeIndex === 3 || o.disasterTypeIndex === 4) {
    return "storeExitOnly";
  }
  return "none";
}

/**
 * 行政区「返回」步骤计划
 * @returns {{ action: 'countyToCity'|'exitLock'|'toNational' }}
 */
export function planRegionNavigateBack(step) {
  const s = step || "toNational";
  if (s === "countyToCity") {
    return { action: "countyToCity" };
  }
  if (s === "exitLock") {
    return { action: "exitLock" };
  }
  return { action: "toNational" };
}

/**
 * 内涝/山洪浏览查询码
 */
export function resolveFloodQueryXzqdm(opts) {
  const o = opts || {};
  if (o.disasterTypeIndex === 3 || o.disasterTypeIndex === 4) {
    if (o.isJsDetailsChart) {
      if (o.storeMapCode) return o.storeMapCode;
      return o.activeCode || "";
    }
    if (o.storeQuery) return o.storeQuery;
  }
  const raw = o.activeCode || "";
  if (!raw) return "";
  if (o.isJsDetailsChart) return raw;
  if (
    (o.disasterTypeIndex === 3 || o.disasterTypeIndex === 4) &&
    typeof o.promote === "function"
  ) {
    return o.promote(raw) || raw;
  }
  return raw;
}

/** 地图定位用行政区码 */
export function resolveFloodMapXzqdm(opts) {
  const o = opts || {};
  if (
    (o.disasterTypeIndex === 3 || o.disasterTypeIndex === 4) &&
    o.isJsDetailsChart
  ) {
    return o.storeMapCode || o.floodQueryCode || "";
  }
  return o.storeQuery || o.floodQueryCode || "";
}

export { getQueryCode, REGION_MODE };

export default {
  planFloodBrowsePromotion,
  resolveSyncActiveRegionLabel,
  planSyncActiveRegionToButton,
  buildNationalBrowsePartial,
  buildExitTableDetailStatePatch,
  resolveExitTableDetailDrillAction,
  planRegionNavigateBack,
  resolveFloodQueryXzqdm,
  resolveFloodMapXzqdm
};
