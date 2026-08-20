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

/** 是否处于右侧表格钻取详情 */
export function isInTableDetailView(flags) {
  const f = flags || {};
  return !!(f.isByDetailsChart || f.isSkDetailsChart || f.isJsDetailsChart);
}

/**
 * 短临/实况排行项：补齐 xzqdm 为钻取码
 */
export function normalizeOpenDetailsDrillItem(item, disasterTypeIndex) {
  if (disasterTypeIndex === 1 || disasterTypeIndex === 2) {
    return Object.assign({}, item, {
      xzqdm: getRainfallDrillCode(item) || (item && item.xzqdm)
    });
  }
  return item;
}

/**
 * 进入详情时的 UI 状态 patch（图表标志位互斥）
 */
export function buildOpenDetailsChartStatePatch(drillItem, disasterTypeIndex) {
  const patch = {
    floodCrossDrillNoData: false,
    detailsTitleXzqh: (drillItem && drillItem.name) || "",
    tableDirllObj: drillItem,
    isInitTableChart: false,
    isByDetailsChart: false,
    isSkDetailsChart: false,
    isJsDetailsChart: false
  };
  if (disasterTypeIndex === 1) {
    patch.isByDetailsChart = true;
  } else if (disasterTypeIndex === 2) {
    patch.isSkDetailsChart = true;
  } else if (disasterTypeIndex === 3 || disasterTypeIndex === 4) {
    patch.isJsDetailsChart = true;
  }
  return patch;
}

/**
 * 排行点击进入详情的编排计划（原 openDetailsChart）
 * @returns {{
 *   drillItem: object,
 *   statePatch: object,
 *   regionAction: 'enterDrill'|'storeDrill'|'none',
 *   shouldSearchBoundary: boolean,
 *   warningAction: 'rainfall'|'csnl'|'sh'|'none',
 *   detailLoad: { action: string, item?: object, args?: Array }
 * }}
 */
export function planOpenDetailsChart(item, options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  const drillItem = normalizeOpenDetailsDrillItem(item, idx);
  const statePatch = buildOpenDetailsChartStatePatch(drillItem, idx);

  let regionAction = "none";
  if (idx === 1 || idx === 2) {
    regionAction = "enterDrill";
  } else if (idx === 3 || idx === 4) {
    regionAction = "storeDrill";
  }

  let warningAction = "none";
  let detailLoad = { action: "none" };

  if (idx === 1) {
    warningAction = "rainfall";
    detailLoad = { action: "getJsDataXz", item: drillItem };
  } else if (idx === 2) {
    detailLoad = { action: "getSkJsDataXz", item: drillItem };
  } else if (idx === 3) {
    warningAction = "csnl";
    if (opts.csnlValue == 1) {
      if (opts.isMapType) {
        // 保留原两参调用：getShTimeData(csnlValue, item.xzqdm)
        detailLoad = {
          action: "getShTimeData",
          args: [opts.csnlValue, item && item.xzqdm]
        };
      } else {
        detailLoad = { action: "getJssdDataXz", item: item };
      }
    } else {
      detailLoad = { action: "getJSsdXzMes", item: item };
    }
  } else if (idx === 4) {
    warningAction = "sh";
    if (opts.shValue == 1) {
      if (opts.isMapType) {
        detailLoad = {
          action: "getShTimeData",
          args: [opts.shValue, opts.shValue, item && item.xzqdm]
        };
      } else {
        detailLoad = { action: "getShJssdDataXz", item: item };
      }
    } else {
      detailLoad = { action: "getShJsGQXZ", item: item };
    }
  }

  return {
    drillItem: drillItem,
    statePatch: statePatch,
    regionAction: regionAction,
    shouldSearchBoundary: true,
    warningAction: warningAction,
    detailLoad: detailLoad
  };
}

/**
 * 跨模块钻取无排行数据时的页面复位 patch
 */
export function buildCrossModuleFloodNoDataPatch() {
  return {
    floodCrossDrillNoData: true,
    jssdRainRankList: [],
    sHjssdRainRankList: [],
    scrollTopList: [],
    timeData: [],
    isInitTableChart: true,
    isJsDetailsChart: false,
    isByDetailsChart: false,
    isSkDetailsChart: false,
    detailsTitleXzqh: "",
    tableDirllObj: {}
  };
}

/**
 * 无数据时是否写入浏览态行政区
 * @returns {{ action: 'noop'|'applyBrowse', code?: string, label?: string, warningCode?: string }}
 */
export function planCrossModuleFloodNoDataRegion(pending, resolveDrillRegionFn) {
  if (!pending || !pending.xzqdm) {
    return { action: "noop" };
  }
  const resolve =
    typeof resolveDrillRegionFn === "function" ? resolveDrillRegionFn : null;
  const drill = resolve
    ? resolve({
        xzqdm: pending.xzqdm,
        xiandm: pending.xzqdm,
        name: pending.name
      })
    : {
        code: String(pending.xzqdm),
        label: pending.name || "",
        warningCode: ""
      };
  const code = drill.code || String(pending.xzqdm);
  const label = pending.name || drill.label || "";
  return {
    action: "applyBrowse",
    code: code,
    label: label,
    warningCode: drill.warningCode || code
  };
}

export { getQueryCode, REGION_MODE };

export default {
  buildBrowseSnapshotForDrill,
  buildEnterDrillPartial,
  buildExitDrillPartial,
  normalizeButtonRegionCode,
  normalizeBrowseStoreCode,
  isInTableDetailView,
  normalizeOpenDetailsDrillItem,
  buildOpenDetailsChartStatePatch,
  planOpenDetailsChart,
  buildCrossModuleFloodNoDataPatch,
  planCrossModuleFloodNoDataRegion
};
