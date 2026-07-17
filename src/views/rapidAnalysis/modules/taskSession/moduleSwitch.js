/**
 * 行政区变更刷新 / 退出详情恢复 / 灾种切换编排计划（纯函数）
 */
import { REGION_MODE } from "../../regionContext";
import {
  resolveModuleUiMeta,
  resolveTaskTypeForModule
} from "./taskType";

const STAR_COLUMN = {
  title: "",
  key: "star",
  dataIndex: "star",
  align: "center",
  scopedSlots: { customRender: "star" },
  width: 50
};

const YJLEVEL_COLUMN = {
  title: "预警等级",
  key: "yjlevel",
  scopedSlots: { customRender: "yjlevel" },
  align: "center"
};

/** 内涝/山洪当前时段应刷新的接口动作 */
export function planRefreshFloodModuleData(opts) {
  const o = opts || {};
  if (o.disasterTypeIndex === 3) {
    if (o.csnlValue == 1) {
      return { actions: ["getNlyjcsData", "getJssdData"] };
    }
    return { actions: ["getJsGqthreeData", "getNlyjcsGqThreeData"] };
  }
  if (o.disasterTypeIndex === 4) {
    if (o.shValue == 1) {
      return { actions: ["getshyjcsData", "getshJssdData"] };
    }
    return { actions: ["getshYjGqData", "getShGqthreeData"] };
  }
  return { actions: [] };
}

/** 行政区切换后浏览数据刷新计划 */
export function planRefreshBrowseAfterRegionChange(opts) {
  const o = opts || {};
  const idx = o.disasterTypeIndex;
  const actions = [];
  if (idx === 1) {
    actions.push("getJsData");
  } else if (idx === 2) {
    actions.push("getSkJsData");
  } else if ((idx === 3 || idx === 4) && !o.isJsDetailsChart) {
    actions.push("resetFloodCrossDrill", "setPendingFloodRegion", "refreshFloodModule");
  }
  actions.push("fetchWarning");
  return { actions: actions };
}

/** 退出钻取详情后恢复列表计划 */
export function planRefreshListAfterExitDetail(opts) {
  const o = opts || {};
  const code = o.restoredCode || "";
  const idx = o.disasterTypeIndex;
  const actions = [];
  if (!code) {
    actions.push("goNational");
  }
  if (code && (idx === 1 || idx === 2)) {
    actions.push("restoreBoundary");
  }
  if (idx === 1) {
    actions.push(
      "fetchRainfallWarning",
      "getByyjcsData",
      "getJsData",
      "initChartShortTerm"
    );
  } else if (idx === 2) {
    actions.push("showMakerSk", "initChartLive");
  } else if (idx === 3) {
    actions.push("tabDisasterType3");
  } else if (idx === 4) {
    actions.push("tabDisasterType4");
  }
  return { actions: actions };
}

/**
 * 灾种切换前：快照 / 下钻提升
 */
export function planModuleSwitchRegionPrep(opts) {
  const o = opts || {};
  const fromIndex = o.fromIndex;
  const toType = o.toType;
  return {
    saveBrowseSnapshot:
      [1, 2].includes(fromIndex) && toType !== fromIndex,
    promoteDrill: o.mode === REGION_MODE.DRILL,
    syncOnSwitch: [1, 2, 3, 4].includes(toType)
  };
}

/**
 * 切换到内涝/山洪时的 pending / 跨模块采纳
 */
export function planModuleSwitchPending(opts) {
  const toType = (opts || {}).toType;
  if (toType === 3 || toType === 4) {
    return {
      adoptCrossModule: true,
      clearDrillFields: true,
      setPending: true
    };
  }
  return {
    adoptCrossModule: false,
    clearDrillFields: false,
    setPending: false,
    clearPending: true
  };
}

/**
 * 切换后边界同步
 * @returns {{ action: 'noop'|'syncAndRestore'|'resetNational' }}
 */
export function planModuleSwitchBoundary(opts) {
  const o = opts || {};
  if (![1, 2, 3, 4].includes(o.toType)) {
    return { action: "noop" };
  }
  if (o.activeCode) {
    return { action: "syncAndRestore" };
  }
  return { action: "resetNational" };
}

/**
 * 切换后任务/数据加载计划
 */
export function planModuleSwitchLoad(opts) {
  const o = opts || {};
  const type = o.toType;
  const uiMeta = resolveModuleUiMeta(type);
  if (type === 1 && uiMeta) {
    return {
      kind: "shortTerm",
      uiMeta: uiMeta,
      taskType: uiMeta.taskType,
      skipRegionRestore: true
    };
  }
  if (type === 2 && uiMeta) {
    return {
      kind: "live",
      uiMeta: uiMeta,
      taskType: uiMeta.taskType,
      alsoLoadLiveRain: !!uiMeta.alsoLoadLiveRain,
      skipRegionRestore: true,
      clearScrollTop: true
    };
  }
  if (type === 3) {
    return {
      kind: "urbanFlood",
      uiMeta: uiMeta,
      taskType: resolveTaskTypeForModule({
        disasterTypeIndex: 3,
        csnlValue: o.csnlValue,
        shValue: o.shValue
      }),
      skipRegionRestore: true,
      clearScrollTop: true,
      resetThreeMap: !!o.isMapType,
      periodValue: o.csnlValue
    };
  }
  if (type === 4) {
    return {
      kind: "mountainFlood",
      uiMeta: uiMeta,
      taskType: resolveTaskTypeForModule({
        disasterTypeIndex: 4,
        csnlValue: o.csnlValue,
        shValue: o.shValue
      }),
      skipRegionRestore: true,
      clearScrollTop: true,
      resetThreeMap: !!o.isMapType,
      periodValue: o.shValue
    };
  }
  return { kind: "noop" };
}

/**
 * 内涝/山洪排行表列：保证末列为收藏星，未来时段带预警等级
 * @returns {Array} 新 columns
 */
export function resolveFloodRankColumns(currentColumns, periodValue) {
  const cols = Array.isArray(currentColumns) ? currentColumns.slice() : [];
  // 去掉已有的 yjlevel / star 尾列，再按规则重建
  while (cols.length) {
    const last = cols[cols.length - 1];
    if (last && (last.key === "star" || last.key === "yjlevel")) {
      cols.pop();
      continue;
    }
    break;
  }
  if (periodValue == 1) {
    cols.push(Object.assign({}, YJLEVEL_COLUMN));
  }
  cols.push(Object.assign({}, STAR_COLUMN));
  return cols;
}

/** 短临切换前：若列数为 5（含多余列），重置为末列星标 */
export function resolveShortTermRankColumnsOnSwitch(currentColumns) {
  const cols = Array.isArray(currentColumns) ? currentColumns.slice() : [];
  if (cols.length === 5) {
    cols.pop();
    cols.push(Object.assign({}, STAR_COLUMN));
  }
  return cols;
}

/** 切换时是否拉取气象台预警点 */
export function shouldSearchQxtYjOnSwitch(qxyjChecked, toType) {
  return !!(qxyjChecked && toType == 1);
}

/**
 * 灾种切换时的地图/图层清理副作用计划
 */
export function planModuleSwitchCleanup() {
  return {
    clearDetailFlags: true,
    clearFloodSubmergedLayers: true,
    clearFloodSubmergedTimer: true,
    bumpSubmergedRequestId: true,
    clearBusinessLayersIfMap: true,
    clearRainfallCacheIfMap: true,
    clearAdminBoundaries: true,
    clearMarkers: true,
    hideTaskList: true
  };
}

/**
 * 切换开始时的面板复位（不含图层）
 */
export function planModuleSwitchPanelReset() {
  return {
    clearHlTlData: true,
    closeButtonModel: true,
    closeLayerList: true,
    closeIdentify: true,
    enableGqsxstl: true,
    initTableChart: true
  };
}

export default {
  planRefreshFloodModuleData,
  planRefreshBrowseAfterRegionChange,
  planRefreshListAfterExitDetail,
  planModuleSwitchRegionPrep,
  planModuleSwitchPending,
  planModuleSwitchBoundary,
  planModuleSwitchLoad,
  resolveFloodRankColumns,
  resolveShortTermRankColumnsOnSwitch,
  shouldSearchQxtYjOnSwitch,
  planModuleSwitchCleanup,
  planModuleSwitchPanelReset
};
