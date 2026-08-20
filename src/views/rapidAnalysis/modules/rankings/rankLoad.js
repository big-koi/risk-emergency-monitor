/**
 * 排行列表加载：排序态、接口成功应用与后续计划（纯函数）
 */
import { mapRankResponseList, resolveWarningCityStats } from "./apiResult";

/** 短临排行排序字段 */
export function resolveShortTermOrderType(type, current) {
  return type || current || "sumjyDesc";
}

/** 实况排行排序字段 */
export function resolveLiveOrderType(type, current) {
  return type || current || "sumjslDesc";
}

/**
 * 短临「未来三小时 / 六小时」Tab 排序点击
 * @returns {'getSixData'|'getJsData'}
 */
export function planJyPxAction(tjuTabChke) {
  return tjuTabChke == "未来三小时" ? "getSixData" : "getJsData";
}

/**
 * 短临预警城市排行（getByyjcsData）成功应用计划
 */
export function planByyjcsDataApply(res, type) {
  if (!res || res.code !== 200 || !res.data) {
    return { ok: false };
  }
  return {
    ok: true,
    byCount: res.data.count,
    byChange: res.data.change,
    byData: res.data.list,
    list: res.data.list,
    addMarkers: type != "colorImg",
    reloadTimeline: type != "check"
  };
}

/**
 * 短临降水排行成功应用
 * @param {Function} adaptListFn adaptShortTermRankList
 */
export function planShortTermRankApply(res, adaptListFn) {
  if (!res || res.code !== 200) {
    return { ok: false, list: [] };
  }
  const list =
    typeof adaptListFn === "function"
      ? adaptListFn(res.data)
      : Array.isArray(res.data)
        ? res.data
        : [];
  return { ok: true, list: list, initChart: true };
}

/**
 * 实况降水排行成功应用
 */
export function planLiveRankApply(res, adaptItem) {
  if (!res || res.code !== 200) {
    return { ok: false, list: [], loadPng: false, initChart: false };
  }
  return {
    ok: true,
    list: mapRankResponseList(res, adaptItem),
    loadPng: true,
    initChart: true
  };
}

/**
 * 预警城市统计写入页面 + processWarningCityData 参数
 */
export function planWarningCityStateApply(res, processType, processFlag) {
  const stats = resolveWarningCityStats(res);
  if (!stats) {
    return { ok: false };
  }
  const patch = {
    nlCount: stats.count,
    nlChange: stats.change,
    nlData: stats.list
  };
  if (processType === "SH") {
    patch.shCount = stats.count;
  }
  let processArgs = [];
  if (processType === "SH") {
    processArgs = [stats.list, "SH"];
  } else if (processFlag !== undefined) {
    processArgs = [stats.list, "", processFlag];
  } else {
    processArgs = [stats.list];
  }
  return {
    ok: true,
    patch: patch,
    processArgs: processArgs
  };
}

/**
 * 积水排行加载完成后的后续（不含 tryResume，由页面先执行）
 * @returns {{ action: 'crossModuleNoData'|'continue', syncRegion?: boolean, loadMap?: boolean, initChart?: boolean }}
 */
export function planFinishFloodRankLoad(list, options) {
  const opts = options || {};
  if (opts.xzqdm && (!list || !list.length)) {
    return { action: "crossModuleNoData" };
  }
  return {
    action: "continue",
    syncRegion: true,
    loadMap: true,
    initChart: !!(list && list.length)
  };
}

/** 六小时累计排行：无论 code 是否 200 都用 data（与原 getSixData 一致） */
export function planSixHourRankApply(res, adaptListFn) {
  const raw = res && res.data ? res.data : [];
  const list =
    typeof adaptListFn === "function"
      ? adaptListFn(raw)
      : Array.isArray(raw)
        ? raw
        : [];
  return { ok: true, list: list, initChart: true };
}

export default {
  resolveShortTermOrderType,
  resolveLiveOrderType,
  planJyPxAction,
  planByyjcsDataApply,
  planShortTermRankApply,
  planLiveRankApply,
  planWarningCityStateApply,
  planFinishFloodRankLoad,
  planSixHourRankApply
};
