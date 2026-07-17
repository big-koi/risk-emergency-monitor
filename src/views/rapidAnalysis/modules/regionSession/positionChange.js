/**
 * 跨模块采纳区划 / 工具栏行政区码变更计划（纯函数）
 */
import {
  resolveDrillRegion,
  resolveFloodBrowseRegion,
  cloneRegionContext,
  REGION_MODE
} from "../../regionContext";
import { getXzqLevel, XZQ_LEVEL } from "../warnings/warningInfoHelper";

/**
 * 降雨下钻切内涝/山洪时的区划采纳计划
 * @returns {{ action: 'noop'|'applyDrillBrowse'|'promoteAndSync', ... }}
 */
export function planAdoptCrossModuleRegion(opts) {
  const o = opts || {};
  const payload = o.crossModuleFloodDrill;
  if (payload && payload.xzqdm) {
    const drill = resolveDrillRegion(payload);
    const code = drill.code || String(payload.xzqdm);
    const label = drill.label || payload.name || o.ctxLabel || "";
    return {
      action: "applyDrillBrowse",
      partial: {
        mode: REGION_MODE.BROWSE,
        code: code,
        label: label,
        lockMinCode: null,
        lockMinLevel: null,
        warningCode: drill.warningCode || code
      },
      positionCodeFallback: code
    };
  }
  const rawCode = o.activeCode || "";
  if (!rawCode) {
    return { action: "noop" };
  }
  return {
    action: "promoteAndSync",
    promoteCode: rawCode,
    promoteHint: o.ctxLabel || o.displayLabel || ""
  };
}

/** 工具栏传入行政区码规范化 */
export function normalizeIncomingXzqdm(xzqdm) {
  if (xzqdm && String(xzqdm).trim() && String(xzqdm) !== "100000") {
    return String(xzqdm).trim();
  }
  return "";
}

/**
 * 工具栏/定位触发的行政区变更计划
 * @returns {{ action: 'toNational'|'applyDrillPartial'|'applyBrowse', ... }}
 */
export function planPositionXzqCodeChange(opts) {
  const o = opts || {};
  const incoming = normalizeIncomingXzqdm(o.xzqdm);
  if (!incoming) {
    return { action: "toNational" };
  }

  const label = o.locationName || incoming;

  if (o.mode === REGION_MODE.DRILL) {
    const warningCode =
      o.lockMinLevel === "city" && getXzqLevel(incoming) === XZQ_LEVEL.COUNTY
        ? o.lockMinCode
        : incoming;
    return {
      action: "applyDrillPartial",
      partial: {
        code: incoming,
        label: label || o.ctxLabel,
        warningCode: warningCode || o.warningCode
      },
      positionCode: incoming,
      applyOptions: { skipButtonSync: true },
      shouldSyncButton:
        !!o.shouldPromoteFlood && getXzqLevel(incoming) === XZQ_LEVEL.COUNTY,
      shouldSyncStore: false
    };
  }

  let browseCode = incoming;
  let browseLabel = label || "全国";
  if (o.shouldPromoteFlood) {
    const promoted = resolveFloodBrowseRegion(browseCode, browseLabel);
    browseCode = promoted.code || browseCode;
    browseLabel = promoted.label || browseLabel;
  }

  const browseCtx = {
    code: browseCode,
    label: browseLabel,
    mode: REGION_MODE.BROWSE,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: browseCode
  };
  browseCtx.browseSnapshot = cloneRegionContext(
    Object.assign({}, browseCtx, { browseSnapshot: null })
  );

  return {
    action: "applyBrowse",
    partial: browseCtx,
    positionCode: browseCode,
    applyOptions: { skipButtonSync: true },
    shouldSyncButton:
      !!o.shouldPromoteFlood && getXzqLevel(incoming) === XZQ_LEVEL.COUNTY,
    shouldSyncStore: !o.inTableDetail,
    storeLabel: browseLabel
  };
}

export default {
  planAdoptCrossModuleRegion,
  normalizeIncomingXzqdm,
  planPositionXzqCodeChange
};
