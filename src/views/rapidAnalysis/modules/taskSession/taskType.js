/**
 * 任务列表类型与灾种切换后的加载计划
 */
import { getShortTermMapTitle } from "../shortTermForecast/timeline";

/** 与 getTaskList({ taskType }) 对齐 */
export const TASK_TYPE = {
  SHORT_TERM: 1,
  URBAN_FLOOD_FUTURE: 2,
  LIVE_RAINFALL: 3,
  URBAN_FLOOD_PAST: 4,
  MOUNTAIN_FLOOD_FUTURE: 5,
  MOUNTAIN_FLOOD_PAST: 6
};

/**
 * 按当前灾种 + 未来/过去时段解析 taskType
 */
export function resolveTaskTypeForModule(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  if (idx === 1) return TASK_TYPE.SHORT_TERM;
  if (idx === 2) return TASK_TYPE.LIVE_RAINFALL;
  if (idx === 3) {
    return Number(opts.csnlValue) === 2
      ? TASK_TYPE.URBAN_FLOOD_PAST
      : TASK_TYPE.URBAN_FLOOD_FUTURE;
  }
  if (idx === 4) {
    return Number(opts.shValue) === 2
      ? TASK_TYPE.MOUNTAIN_FLOOD_PAST
      : TASK_TYPE.MOUNTAIN_FLOOD_FUTURE;
  }
  return TASK_TYPE.SHORT_TERM;
}

/**
 * 灾种切换时的标题 / 按钮态（不含表格列副作用）
 */
export function resolveModuleUiMeta(type) {
  if (type === 1) {
    return {
      mapTitleName: getShortTermMapTitle(),
      rankingListTitle: "降水排行（未来三小时）",
      statisticsChartTitle: "降水统计（未来三小时）",
      isTaskListBtn: true,
      isMapType: false,
      taskType: TASK_TYPE.SHORT_TERM,
      alsoLoadLiveRain: false
    };
  }
  if (type === 2) {
    return {
      mapTitleName: "全国累计降雨实况图",
      rankingListTitle: "降水排行（实况降雨）",
      statisticsChartTitle: "降水统计（实况降雨）",
      isTaskListBtn: false,
      isMapType: false,
      taskType: TASK_TYPE.LIVE_RAINFALL,
      alsoLoadLiveRain: true
    };
  }
  if (type === 3) {
    return {
      mapTitleName: "全国城市内涝积水分布图",
      rankingListTitle: "城市内涝最大积水深度排行（未来三小时）",
      statisticsChartTitle: "城市内涝最大积水深度统计（未来三小时）",
      isTaskListBtn: true,
      tjuTabChke: "六小时累计",
      alsoLoadLiveRain: false
    };
  }
  if (type === 4) {
    return {
      mapTitleName: "全国山洪积水分布图",
      rankingListTitle: "山洪最大积水深度排行（未来三小时）",
      statisticsChartTitle: "山洪最大积水深度统计（未来三小时）",
      isTaskListBtn: true,
      alsoLoadLiveRain: false
    };
  }
  return null;
}

/**
 * 从 session / 最新任务解析选中时间
 */
export function resolveTaskSelectedTime(options) {
  const opts = options || {};
  const latest = opts.latestTaskTime || "";
  if (opts.savedIsNowTime === "true" || !opts.savedTaskTime) {
    return {
      taskSelectedTime: latest,
      isNowTime: true,
      historyTaskTime: null
    };
  }
  return {
    taskSelectedTime: opts.savedTaskTime,
    isNowTime: false,
    historyTaskTime: opts.savedTaskTime
  };
}

/**
 * 任务列表成功后的后续加载计划（由页面按 action 执行）
 */
export function resolvePostTaskLoadPlan(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  const skip = !!opts.skipRegionRestore;
  const plan = {
    syncRegion: false,
    restoreBoundary: false,
    fetchWarning: null,
    loadData: null
  };

  if (idx === 1) {
    plan.syncRegion = !skip;
    plan.restoreBoundary = !skip;
    plan.fetchWarning = "rainfall";
    plan.loadData =
      opts.tjuTabChke === "六小时累计" ? "shortTermSixHour" : "shortTermOther";
    return plan;
  }
  if (idx === 2) {
    plan.syncRegion = !skip;
    plan.restoreBoundary = !skip;
    plan.fetchWarning = "rainfall";
    return plan;
  }
  if (idx === 3) {
    plan.fetchWarning = "csnl";
    plan.loadData =
      Number(opts.csnlValue) === 1 ? "urbanFloodFuture" : "urbanFloodPast";
    return plan;
  }
  if (idx === 4) {
    plan.fetchWarning = "sh";
    plan.loadData =
      Number(opts.shValue) === 1 ? "mountainFloodFuture" : "mountainFloodPast";
    return plan;
  }
  return plan;
}

/** 空任务列表时是否应按 pending 跨模块钻取走无数据态 */
export function shouldHandleEmptyTaskCrossModuleDrill(
  pendingDrill,
  disasterTypeIndex
) {
  return !!(pendingDrill && (disasterTypeIndex === 3 || disasterTypeIndex === 4));
}

export default {
  TASK_TYPE,
  resolveTaskTypeForModule,
  resolveModuleUiMeta,
  resolveTaskSelectedTime,
  resolvePostTaskLoadPlan,
  shouldHandleEmptyTaskCrossModuleDrill
};
