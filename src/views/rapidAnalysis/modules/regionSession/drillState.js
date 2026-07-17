/**
 * 排行下钻：进入/退出时的 regionContext partial（纯函数）
 */
import {
  cloneRegionContext,
  resolveRainfallDrillRegion,
  getRainfallDrillCode,
  getQueryCode,
  REGION_MODE
} from "../../regionContext";

/**
 * 进入下钻前：若当前非钻取态，生成 browseSnapshot
 * @returns {object|null} 需写入的 snapshot；已在钻取态则 null
 */
export function buildBrowseSnapshotForDrill(regionContext) {
  const ctx = regionContext || {};
  if (ctx.mode === REGION_MODE.DRILL) {
    return null;
  }
  return cloneRegionContext(
    Object.assign({}, ctx, {
      mode: REGION_MODE.BROWSE,
      lockMinCode: null,
      lockMinLevel: null,
      browseSnapshot: null
    })
  );
}

/**
 * 进入下钻的 context partial
 * @returns {{ partial: object, positionCode: string }}
 */
export function buildEnterDrillPartial(item) {
  const drill = resolveRainfallDrillRegion(item);
  const drillCode = drill.code || getRainfallDrillCode(item);
  const drillLabel =
    drill.label ||
    (item &&
      (item.shengname ||
        item.shiname ||
        item.xzqmc ||
        item.name)) ||
    "";
  const partial = {
    mode: REGION_MODE.DRILL,
    code: drillCode,
    label: drillLabel,
    lockMinCode: drill.lockMinCode,
    lockMinLevel: drill.lockMinLevel,
    warningCode: drill.warningCode || drillCode
  };
  return {
    partial: partial,
    positionCode: drillCode || ""
  };
}

/**
 * 退出下钻的 context partial
 * @param {object|null} snap - browseSnapshot
 * @param {string} resolvedLabel - resolveRegionButtonLabel(snap) 结果
 */
export function buildExitDrillPartial(snap, resolvedLabel) {
  if (snap) {
    return Object.assign({}, snap, {
      mode: REGION_MODE.BROWSE,
      label: resolvedLabel || snap.label,
      lockMinCode: null,
      lockMinLevel: null,
      browseSnapshot: snap
    });
  }
  return {
    mode: REGION_MODE.BROWSE,
    lockMinCode: null,
    lockMinLevel: null
  };
}

/** 工具栏行政区码规范化（100000/空 → ""） */
export function normalizeButtonRegionCode(locationCode) {
  if (!locationCode) return "";
  const code = String(locationCode).trim();
  if (!code || code === "100000") return "";
  return code;
}

/**
 * 浏览态写入 Store 的 code（全国空串）
 */
export function normalizeBrowseStoreCode(code) {
  if (!code) return "";
  const s = String(code).trim();
  if (!s || s === "100000") return "";
  return s;
}

export { getQueryCode, REGION_MODE };

export default {
  buildBrowseSnapshotForDrill,
  buildEnterDrillPartial,
  buildExitDrillPartial,
  normalizeButtonRegionCode,
  normalizeBrowseStoreCode
};
