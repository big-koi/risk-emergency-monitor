import { getXzqLevel, XZQ_LEVEL } from "../../views/rapidAnalysis/warningInfoHelper";
import {
  resolveDrillRegion,
  resolveRainfallDrillRegion,
  promoteToFloodQueryCode,
  getQueryCode
} from "../../views/rapidAnalysis/regionContext";
import { getRegionPolicy } from "./policies";
import { DISASTER_MODULE, NATIONAL_CODE } from "./constants";

function normalizeCode(code) {
  const c = code ? String(code).trim() : "";
  if (!c || c === NATIONAL_CODE) return "";
  return c;
}

function isFloodModule(module) {
  return (
    module === DISASTER_MODULE.URBAN_FLOOD ||
    module === DISASTER_MODULE.MOUNTAIN_FLOOD
  );
}

/** 工具栏展示用的行政区 */
export function selectDisplayRegion(state) {
  const drill = state.drillStack.length
    ? state.drillStack[state.drillStack.length - 1]
    : null;
  if (drill) {
    return drill;
  }
  return state.browseRegion;
}

/** 接口查询用的行政区编码 */
export function selectQueryCode(state) {
  const policy = getRegionPolicy(state.currentModule);
  const drill = state.drillStack.length
    ? state.drillStack[state.drillStack.length - 1]
    : null;

  if (policy.queryLevel === "city" && drill) {
    if (getXzqLevel(drill.code) === XZQ_LEVEL.COUNTY) {
      return promoteToFloodQueryCode(drill.code);
    }
    return normalizeCode(drill.code);
  }

  if (drill && policy.queryLevel === "selected") {
    return normalizeCode(drill.code);
  }

  let browseCode = normalizeCode(getQueryCode({ code: state.browseRegion.code }));
  // 内涝/山洪浏览态：县码上溯到市，与旧 getFloodQueryXzqdm 一致
  if (policy.queryLevel === "city" && browseCode) {
    return promoteToFloodQueryCode(browseCode) || browseCode;
  }
  return browseCode;
}

/** 地图定位用的行政区 */
export function selectMapRegion(state) {
  const policy = getRegionPolicy(state.currentModule);
  const drill = state.drillStack.length
    ? state.drillStack[state.drillStack.length - 1]
    : null;

  if (policy.mapLevel === "detail" && drill) {
    return drill;
  }
  return state.browseRegion;
}

/** 预警展示用的行政区编码 */
export function selectWarningCode(state) {
  const policy = getRegionPolicy(state.currentModule);
  const queryCode = selectQueryCode(state);

  if (policy.warningLevel === "city" && isFloodModule(state.currentModule)) {
    return queryCode;
  }

  const drill = state.drillStack.length
    ? state.drillStack[state.drillStack.length - 1]
    : null;
  if (drill) {
    return normalizeCode(drill.code);
  }
  return queryCode;
}

/** 是否处于表格钻取态 */
export function selectIsDrilling(state) {
  return state.drillStack.length > 0;
}

/** 解析排行行点击为 drillRegion（保留点击目标码，查询粒度由 policy 派生） */
export function resolveTableDrillRegion(item, module) {
  if (!item || typeof item !== "object") {
    return null;
  }
  const isRainfall =
    module === DISASTER_MODULE.SHORT_TERM_FORECAST ||
    module === DISASTER_MODULE.LIVE_RAINFALL;

  if (isRainfall) {
    const resolved = resolveRainfallDrillRegion(item);
    if (!resolved || !resolved.code) {
      return null;
    }
    return {
      code: resolved.code,
      name: resolved.label || item.name || "",
      level: getXzqLevel(resolved.code),
      parentCode: item.shiid ? String(item.shiid).trim() : "",
      source: "ranking-table",
      raw: item
    };
  }

  // 内涝/山洪：保留县码作为钻取目标，查询时由 selectQueryCode 上溯到市
  const raw = item.xiandm || item.xzqdm;
  if (!raw) {
    return null;
  }
  const codeStr = String(raw).trim();
  const level = getXzqLevel(codeStr);
  let parentCode = item.shiid ? String(item.shiid).trim() : "";
  if (!parentCode && level === XZQ_LEVEL.COUNTY) {
    parentCode = codeStr.slice(0, 4) + "00";
  }
  const floodResolved = resolveDrillRegion(item);
  return {
    code: codeStr,
    name: item.name || floodResolved.label || "",
    level,
    parentCode,
    source: "ranking-table",
    raw: item
  };
}
