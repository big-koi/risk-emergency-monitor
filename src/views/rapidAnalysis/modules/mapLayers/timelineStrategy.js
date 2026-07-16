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

export default {
  SHORT_TERM_RESOLUTION,
  FLOOD_TIMELINE_MODE,
  getShortTermResolutionOptions,
  getFloodTimelineModeOptions,
  pickShortTermTimelineFetcher,
  resolveFloodTimelineDataType,
  shouldShowShortTermResolutionTabs,
  shouldShowFloodTimelineTabs
};
