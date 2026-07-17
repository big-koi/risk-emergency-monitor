/**
 * applyRegionContext：合并态、标签解析、工具栏同步载荷（纯函数）
 */
import { REGION_MODE } from "../../regionContext";

export function mergeRegionContextState(current, partial) {
  return Object.assign({}, current || {}, partial || {});
}

/** 浏览态是否影子写入 Region Store */
export function shouldShadowSyncBrowseStore(next, skipStore) {
  return !skipStore && !!(next && next.mode !== REGION_MODE.DRILL);
}

/** 从钻取对象拼展示名 */
export function resolveDrillTableLabel(tableDirllObj) {
  const obj = tableDirllObj;
  if (!obj || typeof obj !== "object" || !Object.keys(obj).length) {
    return "";
  }
  if (obj.shengname && !obj.shiname) {
    return obj.shengname;
  }
  if (obj.shiname && obj.shengname) {
    return obj.shengname + obj.shiname;
  }
  if (obj.shiname) {
    return obj.shiname;
  }
  if (obj.name) {
    return obj.name;
  }
  return "";
}

/**
 * 工具栏展示名（下钻后 label 可能为空）
 * @param {object} opts
 */
export function resolveRegionButtonLabel(opts) {
  const o = opts || {};
  const ctx = o.ctx;
  if (ctx && ctx.label && ctx.label !== "全国") {
    return ctx.label;
  }
  if (o.isFloodModule && ctx && ctx.code) {
    if (o.locationName && o.locationName !== "全国") {
      return o.locationName;
    }
  }
  const fromTable = resolveDrillTableLabel(o.tableDirllObj);
  if (fromTable) {
    return fromTable;
  }
  if (o.detailsTitleXzqh) {
    return o.detailsTitleXzqh;
  }
  if (o.locationName && o.locationName !== "全国") {
    return o.locationName;
  }
  if (o.partsRegionLabel && o.partsRegionLabel !== "全国") {
    return o.partsRegionLabel;
  }
  return "";
}

/** 省市区部件拼展示名 */
export function composeRegionPartsLabel(parts) {
  const p = parts || {};
  if (p.provinceName && p.cityName && p.countyName) {
    return `${p.provinceName}${p.cityName}${p.countyName}`;
  }
  if (p.provinceName && p.cityName) {
    return `${p.provinceName}${p.cityName}`;
  }
  if (p.provinceName) {
    return p.provinceName;
  }
  if (p.regionLabel && p.regionLabel !== "全国") {
    return p.regionLabel;
  }
  return "";
}

/**
 * 模块切换/同步工具栏时的展示名（多源兜底）
 * @param {object} opts
 * @param {string} opts.code
 * @param {string} opts.ctxLabel
 * @param {string} opts.buttonLabel - 已由 resolveRegionButtonLabel 算出
 * @param {object} opts.parts
 */
export function resolveRegionDisplayLabel(opts) {
  const o = opts || {};
  const codeStr = o.code ? String(o.code).trim() : "";
  if (!codeStr || codeStr === "100000") {
    return "全国";
  }
  if (o.ctxLabel && o.ctxLabel !== "全国") {
    return o.ctxLabel;
  }
  if (o.buttonLabel && o.buttonLabel !== "全国") {
    return o.buttonLabel;
  }
  const fromParts = composeRegionPartsLabel(o.parts);
  if (fromParts) {
    return fromParts;
  }
  if (o.ctxLabel && o.ctxLabel !== "全国") {
    return o.ctxLabel;
  }
  return "";
}

/**
 * 写入 buttonPostion.applyRegionContext 的载荷
 * @param {object} next - 合并后的 regionContext
 * @param {object} options
 * @param {function} [options.resolveButtonLabel] - (next) => string
 * @param {function} [options.resolveDisplayLabel] - (code) => string
 */
export function buildToolbarRegionPayload(next, options) {
  const opts = options || {};
  const silent = !!opts.silent;
  const skipBoundary = !!opts.skipBoundary;
  const ctx = next || {};
  const lock =
    ctx.mode === REGION_MODE.DRILL && ctx.lockMinCode
      ? {
          minCode: ctx.lockMinCode,
          minLevel: ctx.lockMinLevel
        }
      : null;
  const btnCode = ctx.code ? String(ctx.code).trim() : "";
  const btnHasCode = !!(btnCode && btnCode !== "100000");
  let btnLabel = ctx.label || "";
  if (
    btnHasCode &&
    !btnLabel &&
    typeof opts.resolveButtonLabel === "function"
  ) {
    btnLabel = opts.resolveButtonLabel(ctx) || "";
  }
  if (
    btnHasCode &&
    (!btnLabel || btnLabel === "全国") &&
    typeof opts.resolveDisplayLabel === "function"
  ) {
    btnLabel = opts.resolveDisplayLabel(btnCode) || "";
  }
  return {
    code: btnHasCode ? btnCode : "100000",
    label: btnHasCode ? btnLabel || btnCode : "全国",
    lock: lock,
    silent: silent,
    skipBoundary: skipBoundary
  };
}

export default {
  mergeRegionContextState,
  shouldShadowSyncBrowseStore,
  resolveDrillTableLabel,
  resolveRegionButtonLabel,
  composeRegionPartsLabel,
  resolveRegionDisplayLabel,
  buildToolbarRegionPayload
};
