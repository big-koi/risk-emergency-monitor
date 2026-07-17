/**
 * 任务列表请求前后：UI 复位、空列表、后续加载动作展开
 */
import {
  resolvePostTaskLoadPlan,
  shouldHandleEmptyTaskCrossModuleDrill
} from "./taskType";

/** getTaskList 发起前的图例勾选复位 */
export function buildTaskListUiResetFlags() {
  return {
    yjcsTlCheckData: true,
    jyfwTlCheckData: true,
    jydjTlCheckData: true,
    jssdTlCheckData: true,
    jylzdgwCheckData: true
  };
}

/**
 * 任务列表为空时的处理计划
 * @returns {{ clearTimeline: boolean, clearFloodRanks: boolean, handleCrossModuleNoData: boolean, pendingDrill: * }}
 */
export function planEmptyTaskListResult(opts) {
  const o = opts || {};
  const pendingDrill = o.pendingDrill || null;
  return {
    clearTimeline: true,
    clearFloodRanks: true,
    clearPending: true,
    pendingDrill: pendingDrill,
    handleCrossModuleNoData: shouldHandleEmptyTaskCrossModuleDrill(
      pendingDrill,
      o.disasterTypeIndex
    )
  };
}

/**
 * 将 resolvePostTaskLoadPlan 结果展开为页面可执行动作序列
 * @returns {{ actions: string[] }}
 */
export function expandPostTaskLoadActions(plan) {
  const p = plan || {};
  const actions = [];
  if (p.syncRegion) {
    actions.push("syncRegion");
  }
  if (p.fetchWarning === "rainfall") {
    actions.push("fetchRainfallWarning");
  } else if (p.fetchWarning === "csnl") {
    actions.push("fetchCsnlWarning");
  } else if (p.fetchWarning === "sh") {
    actions.push("fetchShWarning");
  }
  if (p.loadData === "shortTermSixHour") {
    actions.push("getByyjcsData", "getJsData");
  } else if (p.loadData === "shortTermOther") {
    actions.push("getSixData", "reloadShortTermRainfallLayers");
  } else if (p.loadData === "urbanFloodFuture") {
    actions.push("getNlyjcsData", "getJssdData");
  } else if (p.loadData === "urbanFloodPast") {
    actions.push("getNlyjcsGqThreeData", "getJsGqthreeData");
  } else if (p.loadData === "mountainFloodFuture") {
    actions.push("getshyjcsData", "getshJssdData");
  } else if (p.loadData === "mountainFloodPast") {
    actions.push("getshYjGqData", "getShGqthreeData");
  }
  if (p.restoreBoundary) {
    actions.push("restoreBoundary");
  }
  return { actions: actions };
}

/**
 * 任务列表成功后的完整后续计划（含展开动作）
 */
export function buildPostTaskLoadExecution(options) {
  const plan = resolvePostTaskLoadPlan(options);
  return {
    plan: plan,
    actions: expandPostTaskLoadActions(plan).actions
  };
}

export default {
  buildTaskListUiResetFlags,
  planEmptyTaskListResult,
  expandPostTaskLoadActions,
  buildPostTaskLoadExecution
};
