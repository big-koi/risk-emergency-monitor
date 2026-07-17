/**
 * 预警信息区划展示：括号内地名 / 省市区部件（纯函数）
 */
import {
  getWarningQueryCode,
  getXzqLevel,
  isCityLevelCountyDrill,
  resolveCityLevelDrillRegionLabel,
  XZQ_LEVEL
} from "./warningInfoHelper";

/**
 * 从行政区按钮选中态解析省市区部件
 * @param {object} opts
 * @param {object|null} opts.selected - buttonPostion.selected
 * @param {string} opts.locationCode
 * @param {string} opts.locationName
 * @param {string} opts.ctxCode
 * @param {string} opts.ctxLabel
 */
export function resolveWarningRegionParts(opts) {
  const o = opts || {};
  const ctxLabel = o.ctxLabel || "";
  const selected = o.selected;
  const locationCode = o.locationCode;

  if (!selected) {
    return {
      provinceName: "",
      cityName: "",
      countyName: "",
      regionLabel: ctxLabel || "全国"
    };
  }
  if (!locationCode || String(locationCode) === "100000") {
    return {
      provinceName: "",
      cityName: "",
      countyName: "",
      regionLabel: ctxLabel || "全国"
    };
  }
  if (
    o.ctxCode &&
    ctxLabel &&
    (!o.locationName || o.locationName === "全国")
  ) {
    return {
      provinceName: "",
      cityName: "",
      countyName: "",
      regionLabel: ctxLabel
    };
  }
  const provinceName =
    (selected.province && selected.province.name) || "";
  const cityName = (selected.city && selected.city.xzqmc) || "";
  const countyName = (selected.county && selected.county.xzqmc) || "";
  let regionLabel = o.locationName || "全国";
  if (provinceName && cityName && countyName) {
    regionLabel = `${provinceName}${cityName}${countyName}`;
  } else if (provinceName && cityName) {
    regionLabel = `${provinceName}${cityName}`;
  } else if (provinceName) {
    regionLabel = provinceName;
  }
  return {
    provinceName: provinceName,
    cityName: cityName,
    countyName: countyName,
    regionLabel: regionLabel
  };
}

/**
 * 解析预警面板括号内行政区名称
 * @param {object} opts
 */
export function resolveWarningRegionLabel(opts) {
  const o = opts || {};
  const isDrill = !!o.isDrill;
  const display = o.storeDisplay;

  if (!isDrill && display) {
    if (!display.code) {
      return "全国";
    }
    if (display.name && display.name !== "全国") {
      return display.name;
    }
  }

  const ctx = o.regionContext;
  const warningCode = o.warningCode || "";
  const positionXzqCode = o.positionXzqCode || "";
  const queryCode = getWarningQueryCode({
    positionXzqCode: warningCode || positionXzqCode,
    tableDirllObj: o.tableDirllObj,
    isByDetailsChart: o.isByDetailsChart,
    isSkDetailsChart: o.isSkDetailsChart,
    isJsDetailsChart: o.isJsDetailsChart
  });

  if (!isDrill && !queryCode) {
    return "全国";
  }

  if (ctx && ctx.label && ctx.label !== "全国") {
    if (ctx.mode === o.drillMode) {
      return ctx.label;
    }
    if (o.ctxHasQueryCode) {
      return ctx.label;
    }
  }

  const parts = o.parts || {};
  const posCode =
    warningCode || positionXzqCode
      ? String(warningCode || positionXzqCode).trim()
      : "";

  if (
    isDrill &&
    isCityLevelCountyDrill(posCode, o.tableDirllObj, {
      isByDetailsChart: o.isByDetailsChart,
      isSkDetailsChart: o.isSkDetailsChart
    })
  ) {
    const cityLabel = resolveCityLevelDrillRegionLabel(
      parts,
      o.tableDirllObj
    );
    if (cityLabel) return cityLabel;
  }

  if (parts.provinceName && parts.cityName && parts.countyName) {
    return `${parts.provinceName}${parts.cityName}${parts.countyName}`;
  }
  if (parts.provinceName && parts.cityName) {
    return `${parts.provinceName}${parts.cityName}`;
  }
  if (parts.provinceName && !parts.cityName) {
    return parts.provinceName;
  }

  if (isDrill && o.tableDirllObj && o.tableDirllObj.name) {
    if (getXzqLevel(queryCode) === XZQ_LEVEL.COUNTY) {
      return o.tableDirllObj.name;
    }
  }

  if (!posCode || posCode === "100000") {
    return "全国";
  }
  if (ctx && ctx.label) {
    return ctx.label;
  }
  if (o.buttonLocationName && o.buttonLocationName !== "全国") {
    return o.buttonLocationName;
  }
  return parts.regionLabel || "全国";
}

export default {
  resolveWarningRegionParts,
  resolveWarningRegionLabel
};
