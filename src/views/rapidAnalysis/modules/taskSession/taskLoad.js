/**
 * 任务列表请求前后：UI 复位、空列表、后续加载动作展开
 */
import {
  resolvePostTaskLoadPlan,
  shouldHandleEmptyTaskCrossModuleDrill
} from "./taskType";
import { planRefreshFloodModuleData } from "./moduleSwitch";

/** sessionStorage 键：任务时间是否「最新」 */
export const TASK_TIME_SESSION_KEYS = {
  IS_NOW: "rapidAnalysis_isNowTime",
  TASK_TIME: "rapidAnalysis_taskSelectedTime"
};

/** 日期面板补全日小时槽 */
export const TASK_HOUR_SLOTS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00"
];

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

/**
 * 任务列表点击选中「最新」或历史项的状态 + session 操作
 * @returns {{ statePatch: object, session: object }}
 */
export function buildTaskItemSelectPatch(item, taskList) {
  const list = taskList || [];
  const latest = list[0] || null;
  if (item === "new") {
    return {
      statePatch: {
        taskSelectedTime: latest ? latest.tasktime : null,
        isNowTime: true,
        historyTaskTime: null,
        taskStatus: latest ? latest.lostdata : ""
      },
      session: {
        setIsNowTime: "true",
        removeTaskTime: true
      }
    };
  }
  return {
    statePatch: {
      taskSelectedTime: item && item.tasktime,
      isNowTime: false,
      historyTaskTime: item && item.tasktime,
      taskStatus: item && item.lostdata
    },
    session: {
      setIsNowTime: "false",
      setTaskTime: item && item.tasktime
    }
  };
}

/**
 * 应用任务时间 session 操作（可注入 storage，便于测试）
 */
export function applyTaskTimeSessionOps(session, storage) {
  const s =
    storage ||
    (typeof sessionStorage !== "undefined" ? sessionStorage : null);
  if (!s || !session) {
    return;
  }
  if (session.setIsNowTime != null) {
    s.setItem(TASK_TIME_SESSION_KEYS.IS_NOW, session.setIsNowTime);
  }
  if (session.removeTaskTime) {
    s.removeItem(TASK_TIME_SESSION_KEYS.TASK_TIME);
  } else if (session.setTaskTime != null) {
    s.setItem(TASK_TIME_SESSION_KEYS.TASK_TIME, session.setTaskTime);
  }
}

/**
 * 任务时间切换后的刷新编排（保留短临固定 getByyjcsData+getJsData）
 * @returns {{ prep: object, actions: string[] }}
 */
export function planTaskItemClickRefresh(options) {
  const o = options || {};
  const prep = {
    clearThreeMapEffect: !!o.isMapType,
    resetNlthreeCreated: true,
    removeMapMarkers: true
  };
  const actions = ["getNowTime", "fetchCurrentModuleWarning"];
  const idx = o.disasterTypeIndex;

  if (idx === 1) {
    actions.push("getByyjcsData", "getJsData");
  } else if (idx === 3 || idx === 4) {
    const flood = planRefreshFloodModuleData({
      disasterTypeIndex: idx,
      csnlValue: o.csnlValue,
      shValue: o.shValue
    });
    (flood.actions || []).forEach(function(a) {
      actions.push(a);
    });
  }

  return { prep: prep, actions: actions };
}

/**
 * 日期面板：按日过滤任务并补全 24 小时槽、排序
 * @param {string} dayKey YYYY-MM-DD
 */
export function buildFilledTaskTimeDataList(dayKey, taskList, hourSlots) {
  const slots = hourSlots || TASK_HOUR_SLOTS;
  const key = dayKey || "";
  const filtered = (taskList || []).filter(function(item) {
    return item && item.tasktime && item.tasktime.indexOf(key) > -1;
  });
  const list = filtered.slice();
  const timeArr = list.map(function(item) {
    return item.tasktime.split(" ")[1];
  });
  if (timeArr.length < 24) {
    slots
      .filter(function(h) {
        return timeArr.indexOf(h) === -1;
      })
      .forEach(function(h) {
        list.push({ tasktime: key + " " + h });
      });
  }
  return list.sort(function(a, b) {
    return a.tasktime.localeCompare(b.tasktime);
  });
}

export default {
  TASK_TIME_SESSION_KEYS,
  TASK_HOUR_SLOTS,
  buildTaskListUiResetFlags,
  planEmptyTaskListResult,
  expandPostTaskLoadActions,
  buildPostTaskLoadExecution,
  buildTaskItemSelectPatch,
  applyTaskTimeSessionOps,
  planTaskItemClickRefresh,
  buildFilledTaskTimeDataList
};
