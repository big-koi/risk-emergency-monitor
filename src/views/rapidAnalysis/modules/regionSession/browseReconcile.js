/**
 * 浏览态行政区对账 / 快照 / 模块切换提升（纯函数）
 */
import {
  cloneRegionContext,
  getQueryCode,
  pickMostSpecificRegionCode,
  isMoreSpecificRegionCode,
  REGION_MODE
} from "../../regionContext";

function buildBrowsePartial(code, label, browseSnapshot) {
  return {
    mode: REGION_MODE.BROWSE,
    code: code,
    label: label,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: code,
    browseSnapshot: browseSnapshot
  };
}

/**
 * 按钮 ↔ context 对账计划
 * @param {object} input
 * @param {function} input.resolveLabel - (code) => string
 * @returns {{ action: 'noop'|'apply', partial?, positionCode?, applyOptions? }}
 */
export function planReconcileFromButton(input) {
  const i = input || {};
  if (i.mode === REGION_MODE.DRILL) {
    return { action: "noop" };
  }

  const btnCode = i.btnCode || "";
  const ctxCode = i.ctxCode || "";
  const posCode = i.posCode || "";
  const browseSnapshot = i.browseSnapshot;
  const resolveLabel =
    typeof i.resolveLabel === "function" ? i.resolveLabel : function() {
      return "";
    };
  const ctxLabel = i.ctxLabel || "";

  // context 有有效码但按钮仍显示全国：回写按钮
  if (!btnCode) {
    const contextCode = pickMostSpecificRegionCode([ctxCode, posCode]);
    if (!contextCode) {
      return { action: "noop" };
    }
    const label = resolveLabel(contextCode) || ctxLabel;
    return {
      action: "apply",
      partial: buildBrowsePartial(
        contextCode,
        label || contextCode,
        browseSnapshot
      ),
      positionCode: contextCode,
      applyOptions: { silent: true, skipBoundary: true }
    };
  }

  // 按钮 code 有效但 name 仍为「全国」：强制同步展示名
  const locationCode = i.locationCode;
  const locationName = i.locationName;
  const btnShowsNationalMismatch =
    locationCode &&
    String(locationCode) !== "100000" &&
    (!locationName || locationName === "全国");

  if (btnShowsNationalMismatch) {
    const activeCode = pickMostSpecificRegionCode([
      btnCode,
      ctxCode,
      posCode
    ]);
    if (!activeCode) {
      return { action: "noop" };
    }
    const label = resolveLabel(activeCode) || ctxLabel;
    return {
      action: "apply",
      partial: buildBrowsePartial(
        activeCode,
        label || activeCode,
        browseSnapshot
      ),
      positionCode: activeCode,
      applyOptions: { silent: true, skipBoundary: true }
    };
  }

  const activeCode = pickMostSpecificRegionCode([ctxCode, posCode, btnCode]);
  if (!activeCode) {
    return { action: "noop" };
  }

  const btnLabel =
    locationName && locationName !== "全国" ? locationName : "";
  const needUpdate =
    activeCode !== ctxCode ||
    isMoreSpecificRegionCode(btnCode, ctxCode) ||
    (btnLabel && btnLabel !== ctxLabel);

  if (!needUpdate) {
    return { action: "noop" };
  }

  const label =
    activeCode === btnCode && btnLabel
      ? btnLabel
      : resolveLabel(activeCode) || ctxLabel || btnLabel || activeCode;

  return {
    action: "apply",
    partial: buildBrowsePartial(activeCode, label, browseSnapshot),
    positionCode: activeCode,
    applyOptions: { skipButtonSync: true }
  };
}

/** 离开降雨模块前：是否应保存浏览快照 */
export function shouldSaveBrowseSnapshot(mode) {
  return mode === REGION_MODE.BROWSE;
}

/**
 * 解析快照展示名
 */
export function resolveBrowseSnapshotLabel(opts) {
  const o = opts || {};
  const code = o.code || "";
  let label = o.ctxLabel;
  const refCode = o.locationCode ? String(o.locationCode).trim() : "";
  const refName = o.locationName;
  if (
    refCode &&
    String(code) === refCode &&
    refName &&
    refName !== "全国"
  ) {
    return refName;
  }
  if (!label || label === "全国") {
    if (refName && refName !== "全国") {
      return refName;
    }
    return code;
  }
  return label;
}

/** 构造浏览态快照对象 */
export function buildBrowseSnapshotContext(code, label) {
  return cloneRegionContext({
    code: code,
    label: label,
    mode: REGION_MODE.BROWSE,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: code,
    browseSnapshot: null
  });
}

/**
 * 下钻态切模块前：提升为浏览态 partial
 * @returns {{ ok: boolean, partial?: object, positionCode?: string }}
 */
export function buildPromoteDrillToBrowse(opts) {
  const o = opts || {};
  if (o.mode !== REGION_MODE.DRILL) {
    return { ok: false };
  }
  const code = o.activeCode || "";
  if (!code || code === "100000") {
    return { ok: false };
  }
  const label = o.resolvedLabel || o.ctxLabel || "";
  const partial = {
    mode: REGION_MODE.BROWSE,
    code: o.ctxCode || code,
    label: label,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: o.warningCode || code,
    browseSnapshot: null
  };
  partial.browseSnapshot = cloneRegionContext(partial);
  return { ok: true, partial: partial, positionCode: code };
}

/** 应用当前浏览态 partial */
export function buildActiveBrowsePartial(code, label, browseSnapshot) {
  return buildBrowsePartial(code, label, browseSnapshot);
}

/**
 * 恢复快照决策
 * @returns {{ action: 'noop'|'applyActive'|'restoreSnap' }}
 */
export function planRestoreBrowseFromSnapshot(opts) {
  const o = opts || {};
  const activeCode = o.activeCode || "";
  const snap = o.snap;
  const snapCode = snap ? getQueryCode(snap) : "";

  if (activeCode && (!snapCode || activeCode !== snapCode)) {
    return { action: "applyActive" };
  }
  if (!snap || !snapCode) {
    return { action: activeCode ? "applyActive" : "noop" };
  }
  return { action: "restoreSnap", snap: snap };
}

export function buildRestoreBrowsePartial(snap, resolvedLabel) {
  return Object.assign({}, snap, {
    mode: REGION_MODE.BROWSE,
    label: resolvedLabel || snap.label,
    lockMinCode: null,
    lockMinLevel: null,
    browseSnapshot: snap
  });
}

/** 内涝/山洪当前查询码（多源择优） */
export function resolveActiveFloodXzqdm(opts) {
  const o = opts || {};
  return pickMostSpecificRegionCode([
    o.fromCtx,
    o.warningCode,
    o.rawCode,
    o.posCode,
    o.btnCode
  ]);
}

export default {
  planReconcileFromButton,
  shouldSaveBrowseSnapshot,
  resolveBrowseSnapshotLabel,
  buildBrowseSnapshotContext,
  buildPromoteDrillToBrowse,
  buildActiveBrowsePartial,
  planRestoreBrowseFromSnapshot,
  buildRestoreBrowsePartial,
  resolveActiveFloodXzqdm
};
