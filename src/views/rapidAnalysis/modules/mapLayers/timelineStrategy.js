/**
 * 时间轴分辨率 / 淹没模式策略（与 API 解耦，页面侧注入 fetch 函数）
 */

/** 短临分辨率：1=六分钟 2=一小时 3=三小时 */
export const SHORT_TERM_RESOLUTION = {
  SIX_MIN: 1,
  ONE_HOUR: 2,
  THREE_HOUR: 3
};

/** 内涝/山洪淹没 Tab：1=历史 2=未来 */
export const FLOOD_TIMELINE_MODE = {
  HISTORY: 1,
  FUTURE: 2
};

const SHORT_TERM_LABELS = {
  [SHORT_TERM_RESOLUTION.SIX_MIN]: "六分钟",
  [SHORT_TERM_RESOLUTION.ONE_HOUR]: "一小时",
  [SHORT_TERM_RESOLUTION.THREE_HOUR]: "三小时"
};

export function getShortTermResolutionOptions() {
  return [
    { value: SHORT_TERM_RESOLUTION.SIX_MIN, label: SHORT_TERM_LABELS[1] },
    { value: SHORT_TERM_RESOLUTION.ONE_HOUR, label: SHORT_TERM_LABELS[2] },
    { value: SHORT_TERM_RESOLUTION.THREE_HOUR, label: SHORT_TERM_LABELS[3] }
  ];
}

export function getFloodTimelineModeOptions() {
  return [
    { value: FLOOD_TIMELINE_MODE.HISTORY, label: "历史淹没" },
    { value: FLOOD_TIMELINE_MODE.FUTURE, label: "未来淹没" }
  ];
}

/**
 * 根据短临分辨率从 fetcherMap 取接口函数
 * fetcherMap: { 1: fn, 2: fn, 3: fn }
 */
export function pickShortTermTimelineFetcher(index, fetcherMap) {
  const map = fetcherMap || {};
  return map[index] || map[SHORT_TERM_RESOLUTION.THREE_HOUR] || null;
}

/** 淹没时间轴数据类型：历史 SK / 未来 DL */
export function resolveFloodTimelineDataType(timeTabActive) {
  return timeTabActive === FLOOD_TIMELINE_MODE.HISTORY ? "SK" : "DL";
}

/** 是否展示短临分辨率 Tab */
export function shouldShowShortTermResolutionTabs(disasterTypeIndex) {
  return disasterTypeIndex === 1;
}

/** 是否展示内涝/山洪淹没模式 Tab */
export function shouldShowFloodTimelineTabs(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  const isJs = !!opts.isJsDetailsChart;
  if (!isJs) return false;
  if (idx === 3 && String(opts.csnlValue) === "1") return true;
  if (idx === 4 && String(opts.shValue) === "1") return true;
  return false;
}

/** 时间轴组件延迟初始化毫秒数（与原 initTimeLine 一致） */
export const TIMELINE_INIT_DELAY_MS = 500;

/**
 * 延迟调用时间轴 init（页面注入 runInit，通常读 $refs.timeAxis）
 * @returns {number} timer id
 */
export function scheduleTimeAxisInit(runInit, delayMs) {
  const delay = delayMs != null ? delayMs : TIMELINE_INIT_DELAY_MS;
  return setTimeout(function() {
    if (typeof runInit === "function") {
      runInit();
    }
  }, delay);
}

/**
 * 将接口响应规整为时间轴数据 patch
 * @param {*} res
 * @param {{ skipOnFail?: boolean }} [options] skipOnFail=true 时失败不改 timeData
 */
export function planTimelineApply(res, options) {
  const opts = options || {};
  const ok = !!(res && (res.code === 200 || res.code === "200"));
  if (!ok) {
    if (opts.skipOnFail) {
      return {
        ok: false,
        skipped: true,
        timeData: null,
        shouldPreloadDrill: false,
        shouldPreloadShortTerm: false
      };
    }
    return {
      ok: false,
      skipped: false,
      timeData: [],
      shouldPreloadDrill: false,
      shouldPreloadShortTerm: false
    };
  }

  const timeData = res.data != null ? res.data : [];
  const hasRows = Array.isArray(timeData) && timeData.length > 0;
  return {
    ok: true,
    skipped: false,
    timeData: timeData,
    shouldPreloadDrill: !!opts.isJsDetailsChart && hasRows,
    shouldPreloadShortTerm: !!opts.preloadShortTerm
  };
}

export default {
  SHORT_TERM_RESOLUTION,
  FLOOD_TIMELINE_MODE,
  getShortTermResolutionOptions,
  getFloodTimelineModeOptions,
  pickShortTermTimelineFetcher,
  resolveFloodTimelineDataType,
  shouldShowShortTermResolutionTabs,
  shouldShowFloodTimelineTabs,
  TIMELINE_INIT_DELAY_MS,
  scheduleTimeAxisInit,
  planTimelineApply
};
