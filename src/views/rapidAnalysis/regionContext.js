import { getXzqLevel, XZQ_LEVEL } from "./warningInfoHelper.js";

function regionLevelRank(level) {
  if (level === XZQ_LEVEL.COUNTY) {
    return 3;
  }
  if (level === XZQ_LEVEL.CITY) {
    return 2;
  }
  if (level === XZQ_LEVEL.PROVINCE) {
    return 1;
  }
  return 0;
}

/** 比较两个行政区码，codeA 是否比 codeB 更细（县>市>省） */
export function isMoreSpecificRegionCode(codeA, codeB) {
  const a = codeA ? String(codeA).trim() : "";
  const b = codeB ? String(codeB).trim() : "";
  if (!a || a === "100000") {
    return false;
  }
  if (!b || b === "100000") {
    return true;
  }
  if (a === b) {
    return false;
  }
  return regionLevelRank(getXzqLevel(a)) > regionLevelRank(getXzqLevel(b));
}

/** 从多个候选码中取最细一级（同级时以后出现的为准，通常对应按钮当前选中） */
export function pickMostSpecificRegionCode(codes) {
  let best = "";
  let bestRank = 0;
  (codes || []).forEach(raw => {
    const code = raw ? String(raw).trim() : "";
    if (!code || code === "100000") {
      return;
    }
    const rank = regionLevelRank(getXzqLevel(code));
    if (rank > bestRank || (rank === bestRank && rank > 0 && code !== best)) {
      bestRank = rank;
      best = code;
    }
  });
  return best;
}

export const REGION_MODE = {  BROWSE: "browse",
  DRILL: "drill"
};

/** 创建默认行政区上下文 */
export function createRegionContext() {
  return {
    code: "",
    label: "全国",
    mode: REGION_MODE.BROWSE,
    lockMinCode: null,
    lockMinLevel: null,
    browseSnapshot: null,
    warningCode: ""
  };
}

/** 浅拷贝上下文（用于快照） */
export function cloneRegionContext(ctx) {
  if (!ctx) {
    return createRegionContext();
  }
  return {
    code: ctx.code || "",
    label: ctx.label || "全国",
    mode: ctx.mode || REGION_MODE.BROWSE,
    lockMinCode: ctx.lockMinCode || null,
    lockMinLevel: ctx.lockMinLevel || null,
    browseSnapshot: ctx.browseSnapshot
      ? cloneRegionContext(ctx.browseSnapshot)
      : null,
    warningCode: ctx.warningCode || ""
  };
}

/** 接口查询用行政区代码（空=全国） */
export function getQueryCode(ctx) {
  if (!ctx) {
    return "";
  }
  const code = ctx.code ? String(ctx.code).trim() : "";
  if (!code || code === "100000") {
    return "";
  }
  return code;
}

/** 预警查询用代码：市级下钻时保持市码 */
export function getWarningCodeFromContext(ctx) {
  if (!ctx) {
    return "";
  }
  if (ctx.warningCode) {
    const w = String(ctx.warningCode).trim();
    if (w && w !== "100000") {
      return w;
    }
  }
  return getQueryCode(ctx);
}

/** 短临/实况降水排行：钻取码优先取县码 xiandm */
export function getRainfallDrillCode(item) {
  if (!item || typeof item !== "object") {
    return "";
  }
  const code = item.xiandm || item.xzqdm;
  return code ? String(code).trim() : "";
}

/** 短临钻取展示名：省+市+县 */
export function formatRainfallDrillLabel(item) {
  if (!item || typeof item !== "object") {
    return "";
  }
  const sheng = item.shengname || "";
  let shi = item.shiname || "";
  const xian = item.xianname || "";
  if (shi && sheng && shi.indexOf(sheng) === 0) {
    shi = shi.slice(sheng.length);
  }
  if (xian) {
    return `${sheng}${shi}${xian}`;
  }
  if (shi) {
    return `${sheng}${shi}`;
  }
  return sheng || item.name || "";
}

/** 短临钻取工具栏展示名：县级仅显示县名 */
export function formatRainfallDrillButtonLabel(item) {
  if (!item || typeof item !== "object") {
    return "";
  }
  if (item.xianname) {
    return String(item.xianname).trim();
  }
  if (item.name) {
    const first = String(item.name).split("-")[0];
    if (first) {
      return first.trim();
    }
  }
  return formatRainfallDrillLabel(item);
}

/**
 * 短临/实况降水排行下钻：按 xiandm 定位到县/市/省
 */
export function resolveRainfallDrillRegion(item) {
  if (!item || typeof item !== "object") {
    return {
      code: "",
      label: "全国",
      lockMinCode: null,
      lockMinLevel: null,
      warningCode: ""
    };
  }

  const codeStr = getRainfallDrillCode(item);
  if (!codeStr) {
    return {
      code: "",
      label: item.name || "全国",
      lockMinCode: null,
      lockMinLevel: null,
      warningCode: ""
    };
  }

  const level = getXzqLevel(codeStr);
  const label = formatRainfallDrillLabel(item) || item.name || "";

  if (level === XZQ_LEVEL.COUNTY) {
    const countyLabel = formatRainfallDrillButtonLabel(item) || label;
    return {
      code: codeStr,
      label: countyLabel,
      lockMinCode: codeStr,
      lockMinLevel: "county",
      warningCode: codeStr
    };
  }

  if (level === XZQ_LEVEL.CITY) {
    const cityLabel = item.shiname
      ? `${item.shengname || ""}${item.shiname}`
      : label;
    return {
      code: codeStr,
      label: cityLabel || label,
      lockMinCode: codeStr,
      lockMinLevel: "city",
      warningCode: codeStr
    };
  }

  if (level === XZQ_LEVEL.PROVINCE) {
    return {
      code: codeStr,
      label: item.shengname || label,
      lockMinCode: codeStr,
      lockMinLevel: "province",
      warningCode: codeStr
    };
  }

  return {
    code: codeStr,
    label,
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: codeStr
  };
}

/** 内涝/山洪市级展示名：省+市 */
export function formatFloodCityLabel(item) {
  if (!item || typeof item !== "object") {
    return "";
  }
  if (!item.shiname) {
    return item.name || "";
  }
  const sheng = item.shengname || "";
  let shi = String(item.shiname);
  if (sheng && shi.indexOf(sheng) === 0) {
    shi = shi.slice(sheng.length);
  }
  return `${sheng}${shi}`;
}

/**
 * 解析右侧排行下钻目标（内涝/山洪）
 * - 县级行：锁定到所属市，按钮展示市名
 * - 市级行：锁定到市
 */
export function resolveDrillRegion(item) {
  if (!item || typeof item !== "object") {
    return {
      code: "",
      label: "全国",
      lockMinCode: null,
      lockMinLevel: null,
      warningCode: ""
    };
  }

  const raw = item.xzqdm || item.xiandm;
  if (!raw) {
    return {
      code: "",
      label: item.name || "全国",
      lockMinCode: null,
      lockMinLevel: null,
      warningCode: ""
    };
  }

  const codeStr = String(raw).trim();
  const level = getXzqLevel(codeStr);

  if (level === XZQ_LEVEL.COUNTY) {
    const cityCode = item.shiid
      ? String(item.shiid).trim()
      : codeStr.slice(0, 4) + "00";
    const cityLabel = formatFloodCityLabel(item) || item.name || "";
    return {
      code: cityCode,
      label: cityLabel,
      lockMinCode: cityCode,
      lockMinLevel: "city",
      warningCode: cityCode
    };
  }

  if (level === XZQ_LEVEL.CITY) {
    const label =
      formatFloodCityLabel(item) ||
      item.shiname ||
      item.xzqmc ||
      item.name ||
      "";
    return {
      code: codeStr,
      label,
      lockMinCode: codeStr,
      lockMinLevel: "city",
      warningCode: codeStr
    };
  }

  if (level === XZQ_LEVEL.PROVINCE) {
    const label = item.shengname || item.name || "";
    return {
      code: codeStr,
      label,
      lockMinCode: codeStr,
      lockMinLevel: "province",
      warningCode: codeStr
    };
  }

  return {
    code: codeStr,
    label: item.name || "全国",
    lockMinCode: null,
    lockMinLevel: null,
    warningCode: codeStr
  };
}

/** 内涝/山洪浏览态接口查询：县码上溯到市码 */
export function promoteToFloodQueryCode(code) {
  const codeStr = code ? String(code).trim() : "";
  if (!codeStr || codeStr === "100000") {
    return "";
  }
  if (getXzqLevel(codeStr) === XZQ_LEVEL.COUNTY) {
    return codeStr.slice(0, 4) + "00";
  }
  return codeStr;
}

/**
 * 内涝/山洪浏览态：区划选县或跨模块携带县码时，上溯到市并解析展示名
 */
export function resolveFloodBrowseRegion(code, labelHint) {
  const codeStr = code ? String(code).trim() : "";
  if (!codeStr || codeStr === "100000") {
    return {
      code: "",
      label: labelHint || "全国",
      warningCode: ""
    };
  }
  if (getXzqLevel(codeStr) === XZQ_LEVEL.COUNTY) {
    const drill = resolveDrillRegion({
      xzqdm: codeStr,
      xiandm: codeStr,
      name: labelHint || ""
    });
    const cityCode = drill.code || promoteToFloodQueryCode(codeStr);
    return {
      code: cityCode,
      label: drill.label || labelHint || "",
      warningCode: drill.warningCode || cityCode
    };
  }
  return {
    code: codeStr,
    label: labelHint || "",
    warningCode: codeStr
  };
}
