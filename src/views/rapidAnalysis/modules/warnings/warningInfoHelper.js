export const XZQ_LEVEL = {
  NATIONAL: "national",
  PROVINCE: "province",
  CITY: "city",
  COUNTY: "county"
};

/** 100000/空=全国，末四位0000=省，末两位00=市，其余=区县 */
export function getXzqLevel(code) {
  const c = code ? String(code).trim() : "";
  if (!c || c === "100000") return XZQ_LEVEL.NATIONAL;
  if (c.endsWith("0000")) return XZQ_LEVEL.PROVINCE;
  if (c.endsWith("00")) return XZQ_LEVEL.CITY;
  return XZQ_LEVEL.COUNTY;
}

export function getRainfallDrillQueryCode(tableDirllObj) {
  if (!tableDirllObj || typeof tableDirllObj !== "object") {
    return "";
  }
  const drillCode = tableDirllObj.xiandm || tableDirllObj.xzqdm;
  return drillCode ? String(drillCode).trim() : "";
}

export function getWarningQueryCode({
  positionXzqCode,
  tableDirllObj,
  isByDetailsChart,
  isJsDetailsChart,
  isSkDetailsChart
}) {
  const isRainfallDrill = isByDetailsChart || isSkDetailsChart;
  const isDrill = isRainfallDrill || isJsDetailsChart;
  const posCode = positionXzqCode ? String(positionXzqCode).trim() : "";
  const posLevel = getXzqLevel(posCode);

  if (isDrill && tableDirllObj && typeof tableDirllObj === "object") {
    const drillCode = isRainfallDrill
      ? getRainfallDrillQueryCode(tableDirllObj)
      : tableDirllObj.xzqdm || tableDirllObj.xiandm;
    if (drillCode) {
      const drillStr = String(drillCode);
      // 内涝/山洪：市级视图下钻区县排行时，预警仍按市一级查询与展示
      if (
        !isRainfallDrill &&
        posCode &&
        posLevel === XZQ_LEVEL.CITY &&
        getXzqLevel(drillStr) === XZQ_LEVEL.COUNTY
      ) {
        return posCode;
      }
      return drillStr;
    }
  }
  if (!posCode || posCode === "100000") return "";
  return posCode;
}

/** 内涝/山洪：市级视图下钻区县排行时，预警仍按市一级查询与展示 */
export function isCityLevelCountyDrill(
  positionXzqCode,
  tableDirllObj,
  options
) {
  const opts = options || {};
  if (opts.isByDetailsChart || opts.isSkDetailsChart) {
    return false;
  }
  if (!tableDirllObj || typeof tableDirllObj !== "object") return false;
  const posCode = positionXzqCode ? String(positionXzqCode).trim() : "";
  const drillCode = tableDirllObj.xzqdm || tableDirllObj.xiandm;
  if (!posCode || !drillCode) return false;
  return (
    getXzqLevel(posCode) === XZQ_LEVEL.CITY &&
    getXzqLevel(String(drillCode)) === XZQ_LEVEL.COUNTY
  );
}

/** 市级下钻时括号内行政区：省+市，如「广西壮族自治区桂林市」 */
export function resolveCityLevelDrillRegionLabel(parts, tableDirllObj) {
  const regionParts = parts || {};
  if (regionParts.provinceName && regionParts.cityName) {
    return `${regionParts.provinceName}${regionParts.cityName}`;
  }
  if (tableDirllObj) {
    const sheng = tableDirllObj.shengname || "";
    const shi = tableDirllObj.shiname || "";
    if (sheng && shi) {
      const city = /(?:市|州|盟|地区)$/.test(shi) ? shi : `${shi}市`;
      return `${sheng}${city}`;
    }
  }
  return "";
}

var HIGHLIGHT_STYLE = {
  "highlight-yellow": "color:#ffcc00",
  "highlight-red": "color:#ff4d4f",
  "highlight-blue": "color:#64b1ff",
  "highlight-orange": "color:#ff9900"
};

function highlight(text, className) {
  if (text === undefined || text === null || text === "") return "";
  const cls = className || "highlight-yellow";
  const style = HIGHLIGHT_STYLE[cls] || HIGHLIGHT_STYLE["highlight-yellow"];
  // v-html 内容不带 scoped 的 data-v，需内联 style 才能显示颜色
  return '<span class="' + cls + '" style="' + style + '">' + text + "</span>";
}

function joinHighlight(names, className) {
  const list = (names || []).filter(Boolean);
  if (!list.length) return "";
  const cls = className || "highlight-yellow";
  return list.map(n => highlight(n, cls)).join("、");
}

function isRainfallAmount(text) {
  const trimmed = String(text).trim();
  return /^[\d.]+\s*(mm|毫米|m|km)?$/i.test(trimmed) || /mm$/i.test(trimmed);
}

/** 统一表述：无降雨 → 无明显降雨（避免重复替换） */
function normalizeNoRainfallWording(text) {
  if (!text) return "";
  return String(text)
    .replace(/无明显降雨/g, "\x00NR\x00")
    .replace(/无降雨/g, "无明显降雨")
    .replace(/\x00NR\x00/g, "无明显降雨");
}

/** 预警指标中的「六小时」补充说明（不影响「过去六小时」等实况表述） */
function expandSixHourWarningWording(text) {
  if (!text || text.indexOf("六小时") < 0) return text;
  if (/六小时[（(]未来三小时\+过去三小时[）)]/.test(text)) return text;
  return String(text)
    .replace(/过去六小时/g, "\x00P6\x00")
    .replace(/六小时(?!（|\()/g, "六小时（未来三小时+过去三小时）")
    .replace(/\x00P6\x00/g, "过去六小时");
}

/** 【】或 [] 占位符 → 地名黄色 / 雨量红色 */
function formatBracketText(text, placeClass, numClass) {
  if (!text) return "";
  const placeCls = placeClass || "highlight-yellow";
  const numCls = numClass || "highlight-red";
  return String(text).replace(
    /(?:【([^】]+)】|\[([^\]]+)\])/g,
    function(match, innerCn, innerEn) {
      const trimmed = (innerCn || innerEn || "").trim();
      if (isRainfallAmount(trimmed)) {
        const rainText = /mm|毫米/i.test(trimmed)
          ? trimmed
          : String(trimmed).replace(/[^\d.]/g, "") + "mm";
        return highlight(rainText, numCls);
      }
      return highlight(trimmed, placeCls);
    }
  );
}

/** 标红：xxmm、xx毫米 */
function highlightPlainRainfall(text) {
  if (!text) return "";
  return String(text).replace(
    /([\d.]+)\s*(mm|毫米)/gi,
    function(match, num, unit) {
      return highlight(num + unit, "highlight-red");
    }
  );
}

/** 标黄：顿号分隔的地名（在「为暴雨」等关键词前） */
function highlightPlainPlaceNames(text) {
  if (!text) return "";
  const keywords = [
    "为暴雨预警城市",
    "为暴雨预警",
    "将出现降雨",
    "将出现",
    "等为",
    "为最大"
  ];
  let result = String(text);
  for (let i = 0; i < keywords.length; i++) {
    const kw = keywords[i];
    const idx = result.indexOf(kw);
    if (idx <= 0) continue;
    const before = result.substring(0, idx);
    const segMatch = before.match(/[，,]([^，,]+)$/);
    if (!segMatch) continue;
    const citiesPart = segMatch[1];
    const partStart = before.length - citiesPart.length;
    if (/<span\s+class=/i.test(citiesPart)) continue;
    const highlighted = citiesPart
      .split(/[、]/)
      .map(function(part) {
        const p = part.trim();
        if (!p || isRainfallAmount(p) || /^[\d.]+$/.test(p)) return part;
        return highlight(p, "highlight-yellow");
      })
      .join("、");
    result =
      result.substring(0, partStart) +
      highlighted +
      result.substring(partStart + citiesPart.length);
    break;
  }
  return result;
}

/** 降雨范围：地名黄、雨量红 */
function formatRangeHighlight(text) {
  if (!text) return "";
  const raw = expandSixHourWarningWording(normalizeNoRainfallWording(text));
  let result = /(?:【[^】]+】|\[[^\]]+\])/.test(raw)
    ? formatBracketText(raw, "highlight-yellow", "highlight-red")
    : raw;
  result = highlightPlainRainfall(result);
  if (!/(?:【[^】]+】|\[[^\]]+\])/.test(raw)) {
    result = highlightPlainPlaceNames(result);
  }
  return result;
}

/** 实况降雨：雨量标红（【】内地名可标黄） */
function formatLiveRainfallHighlight(text) {
  if (!text) return "";
  const raw = normalizeNoRainfallWording(text);
  let result = /(?:【[^】]+】|\[[^\]]+\])/.test(raw)
    ? formatBracketText(raw, "highlight-yellow", "highlight-red")
    : raw;
  return highlightPlainRainfall(result);
}

function asList(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .split(/[,，、]/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** 取第一个非 null/undefined 的值（兼容旧版 Babel，替代 ??） */
function pickFirst() {
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v !== undefined && v !== null) return v;
  }
}

/**
 * 预警接口返回字段（短临主范围 rainfallrange；内涝/山洪主范围 inundationArea）
 */
var WARNING_API_FIELDS = {
  range: ["rainfallrange", "rainfallRange", "inundationArea", "inundationarea"],
  liveRainfall: ["liveRainfall", "liveRainFall", "skrainfall", "skRainfall"],
  skrainfall: ["skrainfall", "skRainfall"],
  maxdepthrange: ["maxdepthrange", "maxDepthRange"],
  maxfloodpoint: ["maxfloodpoint", "maxFloodPoint"],
  waterstarttime: ["waterstarttime", "waterStartTime"],
  centerPoint: ["centerPoint", "centerpoint", "rainfallcenter", "rainfallCenter"],
  centerGridRainfall: [
    "centerGridRainfall",
    "centerRainfall",
    "jyzxRainfall",
    "jyzxJyl",
    "jyzxGridRainfall",
    "rainfallCenterValue",
    "hourMaxGridRainfall",
    "maxGridRainfall",
    "gridRainfall",
    "maxGridRain",
    "maxgwjy",
    "maxgw"
  ]
};

/** 格网降雨量展示（补 mm 单位） */
export function formatGridRainfallValue(val) {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).trim();
  if (/mm|毫米/i.test(str)) return str;
  const num = Number(String(str).replace(/[^\d.]/g, ""));
  if (isNaN(num)) return str;
  return num + "mm";
}

/** 从预警接口数据提取降雨中心格网降雨量 */
export function extractCenterGridRainfall(apiData) {
  const data = apiData || {};
  const centerRaw = pickFirst.apply(
    null,
    WARNING_API_FIELDS.centerPoint.map(function(k) {
      return data[k];
    })
  );
  if (centerRaw && typeof centerRaw === "object") {
    const centerVal = pickFirst(
      centerRaw.jyl,
      centerRaw.gridRainfall,
      centerRaw.maxGridRainfall,
      centerRaw.hourMaxGridRainfall,
      centerRaw.rainfall,
      centerRaw.value,
      centerRaw.prcp
    );
    if (centerVal !== undefined && centerVal !== null && centerVal !== "") {
      return formatGridRainfallValue(centerVal);
    }
  }
  const apiVal = pickFirst.apply(
    null,
    WARNING_API_FIELDS.centerGridRainfall.map(function(k) {
      return data[k];
    })
  );
  if (apiVal !== undefined && apiVal !== null && apiVal !== "") {
    return formatGridRainfallValue(apiVal);
  }
  return "";
}

/** 解析短临 centerPoint 经纬度 */
export function parseCenterPoint(centerPoint) {
  if (centerPoint === undefined || centerPoint === null || centerPoint === "") {
    return null;
  }
  if (typeof centerPoint === "object") {
    const lon = pickFirst(
      centerPoint.lon,
      centerPoint.lng,
      centerPoint.longitude,
      centerPoint.x
    );
    const lat = pickFirst(
      centerPoint.lat,
      centerPoint.latitude,
      centerPoint.y
    );
    if (lon !== undefined && lon !== null && lat !== undefined && lat !== null) {
      return normalizeLonLat(lon, lat);
    }
    return null;
  }
  const str = String(centerPoint).trim();
  const coordMatch = str.match(
    /([\d.]+)\s*°?\s*E?\s*[,，]\s*([\d.]+)\s*°?\s*N?/i
  );
  if (coordMatch) {
    return normalizeLonLat(Number(coordMatch[1]), Number(coordMatch[2]));
  }
  const parts = str.split(/[,，\s]+/).filter(Boolean);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return normalizeLonLat(Number(parts[0]), Number(parts[1]));
  }
  return null;
}

/** 校正经纬度（兼容 lng/lat 字段及颠倒） */
export function normalizeLonLat(lon, lat) {
  let ln = Number(lon);
  let lt = Number(lat);
  if (isNaN(ln) || isNaN(lt)) return null;
  if (ln >= 15 && ln <= 55 && lt >= 70 && lt <= 140) {
    const tmp = ln;
    ln = lt;
    lt = tmp;
  }
  if (ln < -180 || ln > 180 || lt < -90 || lt > 90) return null;
  return { lon: ln, lat: lt };
}

export function formatCoordDisplay(lon, lat) {
  const ln = Number(lon);
  const lt = Number(lat);
  if (isNaN(ln) || isNaN(lt)) return "";
  return `(${ln.toFixed(4)}°E, ${lt.toFixed(4)}°N)`;
}

/** 天地图 addressComponent 拼详细地址（省市区镇） */
export function formatAddressFromTianditu(ac) {
  if (!ac) return "";
  const p = ac.province || "";
  let c = ac.city || "";
  const d = ac.county || ac.district || "";
  const t = ac.town || "";
  const v = ac.address || ac.poi || "";
  if (c && p && c.indexOf(p) === 0) {
    c = c.slice(p.length);
  }
  return `${p}${c}${d}${t}${v}`;
}

/** 标题区按省 / 市 / 县层级展示，如：广东省、广东省清远市、广东省清远市连州市 */
export function formatRainfallRegionTitle(level, opts) {
  const options = opts || {};
  const data = options.apiData || {};

  // 页面侧 regionLabel 优先（如市级视图下钻排行时仍按市展示）
  if (options.regionLabel && level !== XZQ_LEVEL.NATIONAL) {
    return String(options.regionLabel);
  }

  const fa = data.floodArea || data.floodarea;
  const floodRegionName =
    fa && typeof fa === "object" && !Array.isArray(fa)
      ? pickFirst(fa.xzqmc, fa.name, fa.regionName)
      : "";
  const apiTitle = pickFirst(
    data.regionTitle,
    data.region,
    data.regionName,
    data.xzqmc,
    floodRegionName
  );
  if (apiTitle && level !== XZQ_LEVEL.NATIONAL) {
    return String(apiTitle);
  }

  const p =
    pickFirst(
      data.provinceName,
      data.province,
      options.provinceName
    ) || "";
  const c =
    pickFirst(data.cityName, data.city, options.cityName) || "";
  const x =
    pickFirst(
      data.countyName,
      data.county,
      data.xianName,
      options.countyName
    ) || "";

  if (level === XZQ_LEVEL.NATIONAL) {
    return "全国";
  }
  if (level === XZQ_LEVEL.PROVINCE) {
    return p || options.regionLabel || "全国";
  }
  if (level === XZQ_LEVEL.CITY) {
    if (p && c) return `${p}${c}`;
    return options.regionLabel || p || c || "全国";
  }
  if (level === XZQ_LEVEL.COUNTY) {
    if (p && c && x) return `${p}${c}${x}`;
    if (p && options.regionLabel) return `${p}${options.regionLabel}`;
    return options.regionLabel || `${p}${c}${x}` || "全国";
  }
  return options.regionLabel || "全国";
}

/** 读取接口预置文案字段，formatter 负责标黄/标红 */
function getApiTextField(data, keys, formatter) {
  if (!data || !keys || !keys.length) return "";
  const fmt =
    typeof formatter === "function" ? formatter : formatRangeHighlight;
  for (let i = 0; i < keys.length; i++) {
    const v = data[keys[i]];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return fmt(v);
    }
  }
  return "";
}

function getApiTextByKey(data, fieldKey) {
  return getApiTextField(data, WARNING_API_FIELDS[fieldKey] || [fieldKey]);
}

function pickRegionName(apiData, level, queryCode) {
  return (
    apiData.region ||
    apiData.regionName ||
    apiData.xzqmc ||
    apiData.name ||
    apiData.provinceName ||
    apiData.cityName ||
    apiData.countyName ||
    (level === XZQ_LEVEL.NATIONAL ? "全国" : queryCode ? "" : "全国")
  );
}

function hasRainForecast(apiData, level) {
  if (apiData.hasJy === false || apiData.hasRain === false) return false;
  if (apiData.hasJy === true || apiData.hasRain === true) return true;
  const jyfw =
    apiData.rainfallrange ||
    apiData.rainfallRange ||
    apiData.jyfw ||
    "";
  if (/无(?:明显)?降雨|无暴雨|无预警/.test(jyfw)) return false;
  const list = asList(
    apiData.yjProvinceList ||
      apiData.yjProvinces ||
      apiData.yjCityList ||
      apiData.yjCities ||
      apiData.jyDistrictList ||
      apiData.jyDistricts ||
      apiData.jyAreas
  );
  if (list.length) return true;
  if (apiData.cityHasWarning || apiData.hasWarning) return true;
  if (level === XZQ_LEVEL.COUNTY && (apiData.rainfall || apiData.jyl)) return true;
  return !/无(?:明显)?降雨|无暴雨|无预警/.test(jyfw) && !!jyfw;
}

function hasActualRain(apiData) {
  if (apiData.hasSkjy === false || apiData.hasSkRain === false) return false;
  if (apiData.hasSkjy === true || apiData.hasSkRain === true) return true;
  const skjy = apiData.skjy || "";
  if (/无(?:明显)?降雨/.test(skjy)) return false;
  if (apiData.skjyMaxRainfall || apiData.skMaxRainfall || apiData.skjyl) return true;
  return !!skjy && !/无(?:明显)?降雨/.test(skjy);
}

function hasRainCenter(apiData) {
  if (apiData.hasJyzx === false) return false;
  if (apiData.jyzxText || apiData.jyzx) return true;
  return !!(apiData.jyzxAddress || apiData.maxPointAddress || apiData.address);
}

/** 该省是否存在暴雨预警城市 */
function hasProvinceStormWarningCities(apiData) {
  const cities = asList(
    apiData.yjCityList ||
      apiData.yjCities ||
      apiData.byWarningCityList ||
      apiData.stormWarningCities
  );
  if (cities.length) return true;
  if (
    apiData.hasByyjCity === true ||
    apiData.hasStormWarningCity === true ||
    apiData.hasWarning === true
  ) {
    return true;
  }
  if (
    apiData.hasByyjCity === false ||
    apiData.hasStormWarningCity === false
  ) {
    return false;
  }
  const raw = pickFirst(apiData.rainfallrange, apiData.rainfallRange) || "";
  if (/无暴雨预警城市/.test(raw)) return false;
  return /为暴雨预警城市/.test(raw);
}

/** 该市是否为暴雨预警城市 */
function hasCityStormWarning(apiData) {
  if (
    apiData.cityHasWarning === true ||
    apiData.hasWarning === true ||
    apiData.isByyjCity === true
  ) {
    return true;
  }
  if (apiData.cityHasWarning === false || apiData.hasWarning === false) {
    return false;
  }
  const raw = pickFirst(apiData.rainfallrange, apiData.rainfallRange) || "";
  if (/无明显降雨/.test(raw) && !/为暴雨预警城市/.test(raw)) return false;
  return /为暴雨预警城市/.test(raw);
}

/** 有降雨区县（<10mm 视为无明显降雨，由接口列表或明细过滤） */
function getRainyDistricts(apiData, minRainfall) {
  const min = minRainfall !== undefined ? minRainfall : 10;
  const details = apiData.rainDistrictDetails || apiData.districtRainList;
  if (details && Array.isArray(details)) {
    return details
      .map(function(d) {
        const name = d.name || d.xzqmc || d.districtName || d.countyName;
        const r = pickFirst(d.rainfall, d.jyl, d.sum, d.value, d.rain);
        if (name && r !== undefined && r !== null && Number(r) >= min) {
          return name;
        }
        return "";
      })
      .filter(Boolean);
  }
  return asList(
    apiData.jyDistrictList ||
      apiData.jyDistricts ||
      apiData.jyAreas ||
      apiData.areaList ||
      apiData.rainDistrictList
  );
}

/** 市级暴雨预警指标：六小时格网最大降雨超过阈值 */
function getSixHourGridWarningClause(apiData) {
  const clauseFromApi = pickFirst(
    apiData.sixHourGridDesc,
    apiData.warningIndexDesc,
    apiData.yjzb,
    apiData.gridWarningDesc
  );
  if (clauseFromApi) {
    const text = expandSixHourWarningWording(String(clauseFromApi));
    return "，" + formatRangeHighlight(text);
  }
  const threshold =
    pickFirst(apiData.gridRainThreshold, apiData.maxGridRainThreshold) || 50;
  const maxGrid = pickFirst(
    apiData.hourMaxGridRainfall,
    apiData.sixHourMaxGridRainfall,
    apiData.maxGridRainfall,
    apiData.gridMaxRainfall
  );
  const showClause =
    apiData.sixHourGridOverThreshold === true ||
    apiData.hourMaxGridOver50 === true ||
    (maxGrid !== undefined &&
      maxGrid !== null &&
      Number(maxGrid) > Number(threshold));
  if (!showClause && !hasCityStormWarning(apiData)) {
    return "";
  }
  if (hasCityStormWarning(apiData)) {
    return (
      "，六小时（未来三小时+过去三小时）中小时最大格网降雨量超过" +
      highlight(String(threshold) + "mm", "highlight-red")
    );
  }
  return "";
}

/**
 * 按需求组装「降雨范围」文案（【】占位高亮）
 * 无暴雨预警城市时不展示降雨中心（由 centerInline 控制）
 */
export function buildRainfallRangeDesc(apiData, level, opts) {
  const data = apiData || {};
  const options = opts || {};
  const regionLabel =
    options.regionLabel || pickRegionName(data, level, options.queryCode || "");

  const yjProvinces = asList(
    data.yjProvinceList ||
      data.yjProvinces ||
      data.provinceList ||
      data.stormWarningProvinces
  );
  const yjCities = asList(
    data.yjCityList || data.yjCities || data.cityList || data.stormWarningCities
  );
  const jyDistricts = getRainyDistricts(data, 10);

  const provinceName =
    pickFirst(data.provinceName, data.province, options.provinceName) ||
    regionLabel;
  const cityName =
    pickFirst(data.cityName, data.city, options.cityName) || regionLabel;
  const countyName =
    pickFirst(data.countyName, data.county, data.xianName, options.countyName) ||
    regionLabel;
  const rainfall = pickFirst(
    data.rainfall,
    data.jyl,
    data.maxRainfall,
    data.forecastRainfall
  );

  const rawRange = pickFirst(data.rainfallrange, data.rainfallRange);
  if (rawRange && /【[^】]+】/.test(String(rawRange))) {
    return formatRangeHighlight(rawRange);
  }

  if (level === XZQ_LEVEL.NATIONAL) {
    if (yjProvinces.length) {
      return (
        "预计未来三小时，" +
        joinHighlight(yjProvinces) +
        "将出现暴雨预警城市。"
      );
    }
    return "预计未来三小时，全国无暴雨预警城市。";
  }

  if (level === XZQ_LEVEL.PROVINCE) {
    if (hasProvinceStormWarningCities(data) && yjCities.length) {
      return (
        "预计未来三小时，" +
        joinHighlight(yjCities) +
        "为暴雨预警城市。"
      );
    }
    return "预计未来三小时，" + highlight(provinceName) + "无暴雨预警城市。";
  }

  if (level === XZQ_LEVEL.CITY) {
    if (hasCityStormWarning(data)) {
      let desc = "预计未来三小时，" + highlight(cityName) + "为暴雨预警城市";
      desc += getSixHourGridWarningClause(data);
      if (jyDistricts.length) {
        desc += "；" + joinHighlight(jyDistricts) + "将出现降雨";
      }
      desc += "。";
      return desc;
    }
    if (jyDistricts.length) {
      return (
        "预计未来三小时，" + joinHighlight(jyDistricts) + "将出现降雨。"
      );
    }
    return "预计未来三小时，" + highlight(cityName) + "无明显降雨。";
  }

  if (level === XZQ_LEVEL.COUNTY) {
    const rainStr = String(
      rainfall !== undefined && rainfall !== null ? rainfall : ""
    ).replace(/mm$/i, "");
    const rainNum = rainStr !== "" ? Number(rainStr) : NaN;
    if (!isNaN(rainNum) && rainNum >= 10) {
      return (
        "预计未来三小时，" +
        highlight(countyName) +
        "将出现" +
        highlight(rainStr + "mm", "highlight-red") +
        "降雨。"
      );
    }
    return "预计未来三小时，" + highlight(countyName) + "无明显降雨。";
  }

  return "";
}

/**
 * 是否内嵌降雨中心（合并于降雨范围，仅省/市级且存在暴雨预警时展示）
 */
function shouldShowRainfallCenterInline(level, apiData) {
  if (level === XZQ_LEVEL.COUNTY || level === XZQ_LEVEL.NATIONAL) {
    return false;
  }
  if (apiData && apiData.hasJyzx === false) {
    return false;
  }
  if (level === XZQ_LEVEL.PROVINCE) {
    return hasProvinceStormWarningCities(apiData);
  }
  if (level === XZQ_LEVEL.CITY) {
    return hasCityStormWarning(apiData);
  }
  return false;
}

/** 过去六小时各区县累计降雨明细 */
function getDistrictRainDetails(apiData) {
  const details = pickFirst(
    apiData.districtRainList,
    apiData.skDistrictList,
    apiData.countyRainList,
    apiData.rainDistrictDetails,
    apiData.skRainDistricts,
    apiData.liveRainDistricts
  );
  if (Array.isArray(details)) {
    return details;
  }
  return [];
}

function parseDistrictRainItem(item) {
  if (!item || typeof item !== "object") return null;
  const name = pickFirst(
    item.name,
    item.xzqmc,
    item.districtName,
    item.countyName,
    item.fullName,
    item.regionName
  );
  const rainRaw = pickFirst(
    item.rainfall,
    item.jyl,
    item.sum,
    item.value,
    item.rain,
    item.skRainfall,
    item.amount
  );
  if (!name || rainRaw === undefined || rainRaw === null || rainRaw === "") {
    return null;
  }
  const rain = Number(String(rainRaw).replace(/mm$/i, ""));
  if (isNaN(rain)) return null;
  return { name: String(name), rain: rain };
}

/**
 * 实况降雨分级：>50mm 明显 / (10,50] 平稳 / <10mm 无明显
 */
function analyzeLiveRainfall(apiData, level, opts) {
  const data = apiData || {};
  const options = opts || {};
  const details = getDistrictRainDetails(data);
  const heavy = [];
  let hasMid = false;

  for (let i = 0; i < details.length; i++) {
    const row = parseDistrictRainItem(details[i]);
    if (!row) continue;
    if (row.rain > 50) {
      heavy.push(row);
    } else if (row.rain > 10) {
      hasMid = true;
    }
  }

  if (heavy.length) {
    return { level: "heavy", heavy: heavy, hasMid: hasMid };
  }
  if (hasMid) {
    return { level: "steady", heavy: [], hasMid: true };
  }

  const countyRain = pickFirst(
    data.skjyMaxRainfall,
    data.skMaxRainfall,
    data.skjyl,
    data.skMaxJyl,
    data.liveRainfall,
    data.rainfall,
    data.jyl
  );
  if (level === XZQ_LEVEL.COUNTY && countyRain !== undefined && countyRain !== null) {
    const r = Number(String(countyRain).replace(/mm$/i, ""));
    if (!isNaN(r)) {
      if (r > 50) return { level: "heavy", countyRain: r };
      if (r > 10) return { level: "steady", countyRain: r };
      return { level: "none", countyRain: r };
    }
  }

  if (
    data.skRainLevel === "heavy" ||
    data.liveRainLevel === "heavy" ||
    data.hasHeavyRain === true
  ) {
    return { level: "heavy", heavy: heavy };
  }
  if (
    data.skRainLevel === "steady" ||
    data.liveRainLevel === "steady" ||
    data.hasSteadyRain === true
  ) {
    return { level: "steady" };
  }
  if (hasActualRain(data) && !details.length) {
    return { level: "heavy", heavy: [] };
  }

  return { level: "none" };
}

function formatHeavyRainDistricts(heavyList) {
  return heavyList
    .map(function(row) {
      const rainText = String(row.rain).replace(/mm$/i, "") + "mm";
      return highlight(row.name) + highlight(rainText, "highlight-red");
    })
    .join("，");
}

/**
 * 实况降雨（省/市/县）
 * >50mm 明显降雨并列举区县；10–50mm 降雨平稳；<10mm 无明显降雨
 */
function buildLiveRainfallDesc(apiData, level, opts) {
  const data = apiData || {};
  const options = opts || {};
  const regionLabel =
    options.regionLabel || pickRegionName(data, level, options.queryCode || "");
  const provinceName =
    pickFirst(data.provinceName, data.province, options.provinceName) ||
    regionLabel;
  const cityName =
    pickFirst(data.cityName, data.city, options.cityName) || regionLabel;
  const countyName =
    pickFirst(data.countyName, data.county, data.xianName, options.countyName) ||
    regionLabel;

  const apiText = getApiTextField(
    data,
    WARNING_API_FIELDS.liveRainfall,
    formatLiveRainfallHighlight
  );
  if (apiText) {
    return apiText;
  }

  const skText = getApiTextField(
    data,
    ["skrainfall", "skRainfall", "skjy"],
    formatLiveRainfallHighlight
  );
  if (skText) {
    return skText;
  }

  const stat = analyzeLiveRainfall(data, level, opts);

  if (level === XZQ_LEVEL.PROVINCE) {
    const name = highlight(provinceName);
    if (stat.level === "heavy") {
      if (stat.heavy && stat.heavy.length) {
        return (
          "过去六小时，" +
          name +
          "已出现明显降雨，" +
          formatHeavyRainDistricts(stat.heavy) +
          "。"
        );
      }
      return "过去六小时，" + name + "已出现明显降雨。";
    }
    if (stat.level === "steady") {
      return "过去六小时，" + name + "降雨平稳。";
    }
    return "过去六小时，" + name + "无明显降雨。";
  }

  if (level === XZQ_LEVEL.CITY) {
    const name = highlight(cityName);
    if (stat.level === "heavy") {
      if (stat.heavy && stat.heavy.length) {
        return (
          "过去六小时，" +
          name +
          "已出现明显降雨，" +
          formatHeavyRainDistricts(stat.heavy) +
          "。"
        );
      }
      return "过去六小时，" + name + "已出现明显降雨。";
    }
    if (stat.level === "steady") {
      return "过去六小时，" + name + "降雨平稳。";
    }
    return "过去六小时，" + name + "无明显降雨。";
  }

  if (level === XZQ_LEVEL.COUNTY) {
    const name = highlight(countyName);
    const r =
      stat.countyRain !== undefined
        ? stat.countyRain
        : Number(
            String(
              pickFirst(data.rainfall, data.jyl, data.skjyMaxRainfall) || ""
            ).replace(/mm$/i, "")
          );
    if (stat.level === "heavy" && !isNaN(r)) {
      const rainText = String(r).replace(/mm$/i, "") + "mm";
      return (
        "过去六小时，" +
        name +
        "已出现明显降雨，降雨量为" +
        highlight(rainText, "highlight-red") +
        "；"
      );
    }
    if (stat.level === "steady") {
      return "过去六小时，" + name + "降雨平稳。";
    }
    return "过去六小时，" + name + "无明显降雨。";
  }

  return "";
}

function buildCenterDesc(apiData) {
  const apiText = getApiTextField(apiData, [
    "rainfallcenter",
    "rainfallCenter",
    "jyzxText",
    "jyzx"
  ]);
  if (apiText) return apiText;
  if (apiData.jyzxText) return formatBracketText(apiData.jyzxText);
  if (apiData.jyzx) return formatBracketText(apiData.jyzx);

  const address =
    apiData.jyzxAddress || apiData.maxPointAddress || apiData.address || "";
  const lon = apiData.jyzxLon || apiData.lon || apiData.longitude || "";
  const lat = apiData.jyzxLat || apiData.lat || apiData.latitude || "";
  if (!address) return "";

  const lonText = lon ? (String(lon).includes("°") ? lon : `${lon}°E`) : "";
  const latText = lat ? (String(lat).includes("°") ? lat : `${lat}°N`) : "";
  const coord =
    lonText && latText ? ` (${lonText}, ${latText})` : lonText || latText ? ` (${lonText}${latText})` : "";
  return `${address}${coord}`;
}

function section(icon, title, desc) {
  if (!desc) return null;
  return { icon, title, desc };
}

function normalizeFloodAreaObject(data) {
  const fa = data && (data.floodArea || data.floodarea);
  if (!fa || typeof fa !== "object" || Array.isArray(fa)) return null;
  return fa;
}

/** 接口 floodArea 对象 → 统一指标 */
function getFloodAreaMetrics(data) {
  const fa = normalizeFloodAreaObject(data);
  if (!fa) return null;
  const maxDepth = pickFirst(
    fa.maxdepth_total,
    fa.maxDepthTotal,
    fa.max_depth_total,
    fa.maxDepth
  );
  const floodAreaKm = pickFirst(
    fa.flood_area_km,
    fa.floodAreaKm,
    fa.flood_area,
    fa.floodArea
  );
  const maxLevelAreaPct = pickFirst(
    fa.maxlevel_area_pct,
    fa.maxLevelAreaPct,
    fa.max_level_area_pct
  );
  const maxLevelAreaKm = pickFirst(
    fa.maxlevel_area_km,
    fa.maxLevelAreaKm,
    fa.max_level_area_km
  );
  let depthLevelAreaKm = maxLevelAreaKm;
  if (
    (depthLevelAreaKm === undefined || depthLevelAreaKm === null) &&
    floodAreaKm !== undefined &&
    floodAreaKm !== null &&
    maxLevelAreaPct !== undefined &&
    maxLevelAreaPct !== null
  ) {
    const total = Number(floodAreaKm);
    const pct = Number(maxLevelAreaPct);
    if (!isNaN(total) && !isNaN(pct) && total > 0 && pct > 0) {
      depthLevelAreaKm = total * (pct <= 1 ? pct : pct / 100);
    }
  }
  const pointCoord = normalizeLonLat(
    pickFirst(fa.lon, fa.lng, fa.longitude, fa.x),
    pickFirst(fa.lat, fa.latitude, fa.y)
  );
  return {
    name: pickFirst(fa.xzqmc, fa.name, fa.regionName),
    code: fa.xzqdm,
    startTime: pickFirst(fa.start_time, fa.startTime, fa.waterStartTime),
    maxTime: pickFirst(fa.max_time, fa.maxTime, fa.maxDepthTime),
    lon: pointCoord ? pointCoord.lon : undefined,
    lat: pointCoord ? pointCoord.lat : undefined,
    maxDepth: maxDepth,
    floodAreaKm: floodAreaKm,
    maxLevelThreshold: pickFirst(
      fa.maxlevel,
      fa.maxLevel,
      fa.max_depth_level,
      fa.maxDepthLevel
    ),
    maxLevelAreaPct: maxLevelAreaPct,
    maxLevelAreaKm: depthLevelAreaKm
  };
}

function getDepthLevelLowerBound(depthM) {
  const d = Number(depthM);
  if (isNaN(d) || d <= 0) return null;
  if (d >= 3) return 3;
  if (d >= 2) return 2;
  if (d >= 1) return 1;
  if (d >= 0.5) return 0.5;
  if (d >= 0.3) return 0.3;
  if (d >= 0.1) return 0.1;
  return 0.1;
}

function formatFloodDepthThreshold(threshold) {
  const t = Number(threshold);
  if (isNaN(t)) return String(threshold).replace(/m$/i, "");
  if (t >= 1) return String(t);
  return String(t);
}

function formatFloodAreaKm2(km) {
  const n = Number(km);
  if (isNaN(n)) return String(km);
  if (n >= 10) return n.toFixed(1) + " km²";
  if (n >= 1) return n.toFixed(2) + " km²";
  return parseFloat(n.toFixed(4)) + " km²";
}

function formatFloodPercent(pct) {
  if (pct === undefined || pct === null || pct === "") return "";
  const n = Number(pct);
  if (isNaN(n)) return String(pct);
  const val = n > 0 && n <= 1 ? n * 100 : n;
  const text = val >= 10 ? val.toFixed(1) : val.toFixed(2);
  return parseFloat(text) + "%";
}

function formatFloodDepthM(depth) {
  const n = Number(depth);
  if (isNaN(n)) return String(depth).replace(/m$/i, "") + "m";
  const text = n >= 1 ? n.toFixed(2) : n.toFixed(2);
  return parseFloat(text) + "m";
}

/** 主范围文案是否表示存在淹没/影响区域（无淹没时不展示后续区块） */
function hasInundationOrImpact(rangeText, data) {
  if (data && (data.hasYm === true || data.hasFlood === true || data.hasImpact === true)) {
    return true;
  }
  if (data && (data.hasYm === false || data.hasFlood === false || data.hasImpact === false)) {
    return false;
  }
  const metrics = getFloodAreaMetrics(data);
  if (metrics) {
    const areaKm = Number(metrics.floodAreaKm);
    const maxD = Number(metrics.maxDepth);
    if ((!isNaN(areaKm) && areaKm > 0) || (!isNaN(maxD) && maxD > 0)) {
      return true;
    }
  }
  const area = pickFirst(
    data.inundationAreaKm,
    data.ymArea,
    data.submergedArea,
    data.inundationAreaValue
  );
  if (area !== undefined && area !== null && Number(area) > 0) {
    return true;
  }
  const maxD = pickFirst(data.maxDepth, data.maxYmDepth, data.maxWaterDepth);
  if (maxD !== undefined && maxD !== null && Number(maxD) > 0) {
    return true;
  }
  if (!rangeText) return false;
  const plain = String(rangeText).replace(/<[^>]+>/g, "");
  if (
    /无淹没|无内涝|无预警城市|无影响区域|无山洪|无降雨|全国无|本省无|不出现淹没|没有淹没|无明显降雨|无淹没区域/.test(
      plain
    )
  ) {
    return false;
  }
  return true;
}

var FLOOD_MODULE_LABELS = {
  csnl: {
    moduleType: "csnl",
    disasterName: "城市内涝",
    rangeTitle: "淹没范围",
    maxDepthTitle: "最大淹没深度范围",
    maxPointTitle: "最大淹没点",
    startTimeTitle: "积水开始时间",
    noWarningCity: "无内涝预警城市",
    noSubmerge: "无淹没区域",
    depthReach: "达到最大水深"
  },
  sh: {
    moduleType: "sh",
    disasterName: "山洪",
    rangeTitle: "淹没范围",
    maxDepthTitle: "最大淹没深度范围",
    maxPointTitle: "最大淹没点",
    startTimeTitle: "积水开始时间",
    noWarningCity: "无山洪预警城市",
    noSubmerge: "无淹没区域",
    depthReach: "达到最大水深"
  }
};

function getFloodLabels(moduleType) {
  return FLOOD_MODULE_LABELS[moduleType] || FLOOD_MODULE_LABELS.csnl;
}

/** 山洪接口旧文案统一为与城市内涝一致的淹没表述 */
function normalizeShFloodWording(text) {
  if (!text) return text;
  return String(text)
    .replace(/最大山洪风险/g, "最大淹没深度范围")
    .replace(/最大风险点/g, "最大淹没点")
    .replace(/达到最大风险/g, "达到最大水深")
    .replace(/影响范围/g, "淹没范围")
    .replace(/无影响区域/g, "无淹没区域")
    .replace(/山洪开始时间/g, "积水开始时间");
}

function highlightWarningLevel(levelText) {
  const t = String(levelText || "").trim();
  if (!t) return "";
  const label = t.indexOf("预警") >= 0 ? t : t + "预警";
  if (/蓝/.test(label)) {
    return highlight(label, "highlight-blue");
  }
  if (/黄/.test(label)) {
    return highlight(label, "highlight-yellow");
  }
  if (/橙|红/.test(label)) {
    return highlight(label, "highlight-red");
  }
  return highlight(label, "highlight-yellow");
}

/** 按预警等级分组城市：{ level: '蓝色预警', cities: [] } */
function getCityWarningGroups(data) {
  const groups = [];
  const blue = asList(data.blueWarningCities || data.blueCities || data.blueCityList);
  const yellow = asList(
    data.yellowWarningCities || data.yellowCities || data.yellowCityList
  );
  const orange = asList(
    data.orangeWarningCities || data.orangeCities || data.orangeCityList
  );
  if (blue.length) groups.push({ level: "蓝色预警", cities: blue });
  if (yellow.length) groups.push({ level: "黄色预警", cities: yellow });
  if (orange.length) groups.push({ level: "橙色预警", cities: orange });

  const list = data.cityWarningList || data.warningCityList || data.floodWarningCities;
  if (list && list.length && !groups.length) {
    const map = {};
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const name =
        typeof item === "string"
          ? item
          : item.name || item.cityName || item.xzqmc || item.city;
      const level =
        typeof item === "object"
          ? item.level || item.warningLevel || item.yjLevel || "蓝色预警"
          : "蓝色预警";
      if (!name) continue;
      const key = String(level);
      if (!map[key]) map[key] = [];
      map[key].push(name);
    }
    const keys = Object.keys(map);
    for (let j = 0; j < keys.length; j++) {
      groups.push({ level: keys[j], cities: map[keys[j]] });
    }
  }
  return groups;
}

function hasNationalFloodProvinces(data) {
  const list = asList(
    data.yjProvinceList ||
      data.yjProvinces ||
      data.floodWarningProvinces ||
      data.warningProvinceList
  );
  if (list.length) return true;
  const raw = pickFirst(data.inundationArea, data.inundationarea) || "";
  return /可能出现淹没|将出现淹没|淹没区域/.test(raw) && !/全国无淹没/.test(raw);
}

function hasProvinceFloodWarningCities(data) {
  if (getCityWarningGroups(data).length) return true;
  const cities = asList(data.yjCityList || data.yjCities || data.floodWarningCities);
  if (cities.length) return true;
  const raw = pickFirst(data.inundationArea, data.inundationarea) || "";
  if (/无内涝预警|无山洪预警|无预警城市/.test(raw)) return false;
  return /预警区|淹没|预警城市/.test(raw);
}

function hasCityFloodWarning(data) {
  if (
    data.cityHasWarning === true ||
    data.hasWarning === true ||
    data.hasFloodWarning === true
  ) {
    return true;
  }
  if (data.cityHasWarning === false || data.hasFloodWarning === false) {
    return false;
  }
  const level = pickFirst(data.warningLevel, data.yjLevel, data.cityWarningLevel);
  if (level) return true;
  const raw = pickFirst(data.inundationArea, data.inundationarea) || "";
  return /预警区|为城市内涝|为山洪/.test(raw) && !/无淹没区域/.test(raw);
}

function getSubmergedDistricts(data) {
  return asList(
    data.submergedDistricts ||
      data.mainYmAreas ||
      data.ymDistricts ||
      data.inundationDistricts ||
      data.floodDistrictList
  );
}

function getApiFloodText(data, keys, moduleType) {
  if (!keys || !keys.length) return "";
  for (let i = 0; i < keys.length; i++) {
    const v = data[keys[i]];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      let text = formatRangeHighlight(v);
      if (moduleType === "sh") {
        text = normalizeShFloodWording(text);
      }
      return text;
    }
  }
  return "";
}

function buildFloodInundationRangeDesc(data, level, opts, labels) {
  const options = opts || {};
  const regionLabel =
    options.regionLabel || pickRegionName(data, level, options.queryCode || "");
  const provinceName =
    pickFirst(data.provinceName, data.province, options.provinceName) ||
    regionLabel;
  const cityName =
    pickFirst(data.cityName, data.city, options.cityName) || regionLabel;
  const countyName =
    pickFirst(data.countyName, data.county, data.xianName, options.countyName) ||
    regionLabel;
  const disasterName = labels.disasterName;

  const rawRange = pickFirst(data.inundationArea, data.inundationarea);
  if (rawRange && /【[^】]+】/.test(String(rawRange))) {
    let text = formatRangeHighlight(rawRange);
    if (labels.moduleType === "sh") {
      text = normalizeShFloodWording(text);
    }
    return text;
  }

  const yjProvinces = asList(
    data.yjProvinceList || data.yjProvinces || data.floodWarningProvinces
  );

  if (level === XZQ_LEVEL.NATIONAL) {
    if (hasNationalFloodProvinces(data) && yjProvinces.length) {
      return (
        "预计未来三小时，" +
        joinHighlight(yjProvinces) +
        "可能出现淹没区域。"
      );
    }
    return "预计未来三小时，全国" + labels.noSubmerge + "。";
  }

  if (level === XZQ_LEVEL.PROVINCE) {
    const groups = getCityWarningGroups(data);
    const plainCities = asList(data.yjCityList || data.yjCities);
    if (hasProvinceFloodWarningCities(data) && (groups.length || plainCities.length)) {
      if (groups.length) {
        const parts = [];
        for (let g = 0; g < groups.length; g++) {
          const grp = groups[g];
          parts.push(
            joinHighlight(grp.cities) +
              "为" +
              disasterName +
              highlightWarningLevel(grp.level) +
              "区"
          );
        }
        return "预计未来三小时，" + parts.join("；") + "。";
      }
      return (
        "预计未来三小时，" +
        joinHighlight(plainCities) +
        "为" +
        disasterName +
        highlightWarningLevel("蓝色预警") +
        "区。"
      );
    }
    return (
      "预计未来三小时，" +
      highlight(provinceName) +
      labels.noWarningCity +
      "。"
    );
  }

  if (level === XZQ_LEVEL.CITY) {
    const districts = getSubmergedDistricts(data);
    const warnLevel = pickFirst(
      data.warningLevel,
      data.yjLevel,
      data.cityWarningLevel,
      "蓝色预警"
    );
    if (hasCityFloodWarning(data)) {
      let desc =
        "预计未来三小时，" +
        highlight(cityName) +
        "为" +
        disasterName +
        highlightWarningLevel(warnLevel) +
        "区";
      if (districts.length) {
        desc += "，主要淹没区域包括" + joinHighlight(districts);
      }
      return desc + "。";
    }
    return "预计未来三小时，" + highlight(cityName) + labels.noSubmerge + "。";
  }

  if (level === XZQ_LEVEL.COUNTY) {
    const metrics = getFloodAreaMetrics(data);
    const areaVal = pickFirst(
      metrics && metrics.floodAreaKm,
      data.inundationAreaKm,
      data.ymArea,
      data.submergedArea,
      data.inundationAreaValue
    );
    const areaNum =
      areaVal !== undefined && areaVal !== null ? Number(areaVal) : NaN;
    if (!isNaN(areaNum) && areaNum > 0) {
      const areaText =
        String(areaVal).indexOf("km") >= 0
          ? String(areaVal)
          : formatFloodAreaKm2(areaVal).replace(" km²", "km²");
      return (
        "预计未来三小时，" +
        highlight((metrics && metrics.name) || countyName) +
        "存在" +
        highlight(areaText, "highlight-orange") +
        "的淹没区域。"
      );
    }
    return "预计未来三小时，" + highlight(countyName) + labels.noSubmerge + "。";
  }

  return "";
}

function buildFloodMaxDepthDesc(data, level, opts) {
  const options = opts || {};
  const regionLabel =
    options.regionLabel || pickRegionName(data, level, options.queryCode || "");
  const metrics = getFloodAreaMetrics(data);
  const cityName =
    pickFirst(data.cityName, data.city, options.cityName, metrics && metrics.name) ||
    regionLabel;
  const countyName =
    pickFirst(data.countyName, data.county, data.xianName, options.countyName) ||
    regionLabel;
  const name = level === XZQ_LEVEL.COUNTY ? countyName : cityName;

  const apiText = getApiFloodText(
    data,
    ["maxdepthrange", "maxDepthRange", "maxYmDepthRange"],
    options.floodModuleType
  );
  if (apiText) return apiText;

  let threshold = pickFirst(
    data.maxDepthLevel,
    data.depthLevel,
    data.maxDepthThreshold,
    metrics && metrics.maxLevelThreshold
  );
  if (!threshold && metrics && metrics.maxDepth !== undefined) {
    threshold = getDepthLevelLowerBound(metrics.maxDepth);
  }
  const area = pickFirst(
    data.maxDepthArea,
    data.ymAreaMaxDepth,
    data.maxDepthFloodArea,
    data.depthArea,
    metrics && metrics.maxLevelAreaKm
  );
  const percent = pickFirst(
    data.maxDepthPercent,
    data.ymAreaRate,
    data.depthAreaRate,
    data.floodAreaPercent,
    metrics && metrics.maxLevelAreaPct
  );
  if (
    threshold === undefined &&
    area === undefined &&
    percent === undefined &&
    !(metrics && metrics.maxDepth)
  ) {
    return "";
  }

  const thStr = formatFloodDepthThreshold(threshold || "0.1");
  let desc =
    highlight(name) +
    "最大水深可能超过" +
    highlight(thStr + "m", "highlight-red");
  if (area !== undefined && area !== null && Number(area) > 0) {
    const areaText = formatFloodAreaKm2(area);
    desc += "，淹没面积为" + highlight(areaText, "highlight-orange");
  }
  if (percent !== undefined && percent !== null && percent !== "") {
    desc += "（占淹没区" + formatFloodPercent(percent) + "）";
  }
  return desc + "。";
}

function getMaxFloodPointFromData(data) {
  const metrics = getFloodAreaMetrics(data);
  if (metrics && metrics.lon !== undefined && metrics.lat !== undefined) {
    const coord = normalizeLonLat(metrics.lon, metrics.lat);
    if (coord) return coord;
  }
  const raw = pickFirst(
    data.maxFloodPoint,
    data.maxfloodpoint,
    data.maxRiskPoint,
    data.maxYmPoint
  );
  let coord = parseCenterPoint(raw);
  if (!coord) {
    const text = pickFirst(
      data.maxfloodpoint,
      data.maxFloodPoint,
      data.maxRiskPoint
    );
    if (text && typeof text === "string") {
      coord = parseCenterPoint(text);
    }
  }
  return coord;
}

function buildFloodMaxPointSection(data, labels, hasArea) {
  if (!hasArea) return null;

  const apiText = getApiFloodText(
    data,
    ["maxfloodpoint", "maxFloodPoint", "maxRiskPoint"],
    labels.moduleType
  );
  const metrics = getFloodAreaMetrics(data);
  const coord = getMaxFloodPointFromData(data);
  const maxDepth = pickFirst(
    data.maxFloodDepth,
    data.maxDepth,
    data.maxYmDepth,
    data.maxWaterDepth,
    metrics && metrics.maxDepth
  );
  const maxTime = pickFirst(
    data.maxFloodTime,
    data.maxDepthTime,
    data.maxYmTime,
    data.maxWaterTime,
    metrics && metrics.maxTime
  );

  if (apiText && !coord) {
    return {
      icon: "environment",
      title: labels.maxPointTitle,
      desc: apiText
    };
  }

  if (!coord && !apiText) return null;

  let line2 = "";
  if (maxTime && maxDepth !== undefined && maxDepth !== null && maxDepth !== "") {
    line2 =
      maxTime +
      labels.depthReach +
      highlight(formatFloodDepthM(maxDepth), "highlight-red");
  } else if (apiText) {
    line2 = apiText;
  }

  const gridRainfall = extractCenterGridRainfall(data);
  return {
    icon: "environment",
    title: labels.maxPointTitle,
    floodPoint: true,
    centerPoint: coord,
    coordText: coord ? formatCoordDisplay(coord.lon, coord.lat) : "",
    address: pickFirst(data.maxPointAddress, data.floodPointAddress) || "",
    addressLoading: !!(coord && !data.maxPointAddress),
    floodPointLine2: line2,
    jyl: gridRainfall || "",
    desc: ""
  };
}

function buildFloodStartTimeDesc(data, opts) {
  const options = opts || {};
  const apiText = getApiFloodText(
    data,
    ["waterstarttime", "waterStartTime", "floodStartTime", "jsStartTime"],
    options.floodModuleType
  );
  if (apiText) return apiText;
  const metrics = getFloodAreaMetrics(data);
  const t = pickFirst(
    data.waterStartTime,
    data.waterstarttime,
    data.floodStartTime,
    data.jsStartTime,
    metrics && metrics.startTime
  );
  return t ? String(t) : "";
}

/**
 * 城市内涝 / 山洪预警信息
 * 全国/省：仅淹没(影响)范围；市/县：有淹没时展示四块
 */
function buildFloodWarningInfo(apiData, queryCode, options, moduleType) {
  const data = apiData || {};
  const opts = options || {};
  const level = getXzqLevel(queryCode);
  opts.apiData = data;
  opts.queryCode = queryCode;
  opts.floodModuleType = moduleType;
  const labels = getFloodLabels(moduleType);
  const region = formatRainfallRegionTitle(level, opts);
  const warningTime =
    pickFirst(data.warningTime, data.yjsj, data.time, opts.taskTime) || "--";
  const sections = [];

  const rangeDesc = buildFloodInundationRangeDesc(data, level, opts, labels);
  const hasArea = hasInundationOrImpact(rangeDesc, data);

  if (rangeDesc) {
    sections.push({
      icon: "cluster",
      title: labels.rangeTitle,
      desc: rangeDesc
    });
  }

  if (
    hasArea &&
    (level === XZQ_LEVEL.CITY || level === XZQ_LEVEL.COUNTY)
  ) {
    const depthDesc = buildFloodMaxDepthDesc(data, level, opts);
    if (depthDesc) {
      sections.push({
        icon: "dashboard",
        title: labels.maxDepthTitle,
        desc: depthDesc
      });
    }

    const maxPointSec = buildFloodMaxPointSection(data, labels, hasArea);
    if (maxPointSec) {
      sections.push(maxPointSec);
    }

    const startDesc = buildFloodStartTimeDesc(data, opts);
    if (startDesc) {
      sections.push({
        icon: "clock-circle",
        title: labels.startTimeTitle,
        desc: startDesc
      });
    }
  }

  if (!sections.length) {
    sections.push({
      icon: "cluster",
      title: labels.rangeTitle,
      desc: "暂无预警信息"
    });
  }

  return {
    region,
    warningTime,
    timeLabel: getWarningTimeLabel(level),
    sections
  };
}

/** 头部时间文案：县级为「预报时间」，其余为「预警时间」 */
export function getWarningTimeLabel(level) {
  if (level === XZQ_LEVEL.COUNTY) {
    return "预报时间";
  }
  return "预警时间";
}

function stripHtmlTags(html) {
  return String(html || "").replace(/<[^>]+>/g, "");
}

function hasCenterTextInDesc(desc) {
  return /降雨中心位于/.test(stripHtmlTags(desc));
}

function getCenterPointFromData(data) {
  const centerRaw = pickFirst(
    data.centerPoint,
    data.centerpoint,
    data.rainfallcenter,
    data.rainfallCenter
  );
  let coord = parseCenterPoint(centerRaw);
  if (!coord) {
    const raw = pickFirst(
      data.rainfallrange,
      data.rainfallRange,
      data.inundationArea,
      data.inundationarea
    );
    if (raw) coord = parseCenterPoint(raw);
  }
  return coord;
}

/** 接口整段 rainfallrange 拆成「城市预警句」+「降雨中心位于…」 */
function splitRangeAndCenterRaw(raw) {
  const str = String(raw || "").trim();
  const idx = str.indexOf("降雨中心位于");
  if (idx < 0) {
    return { rangePart: str, centerPart: "" };
  }
  let rangePart = str.substring(0, idx).replace(/[，,]\s*$/, "").trim();
  if (rangePart && !/[。.!?]$/.test(rangePart)) {
    rangePart += "。";
  }
  return {
    rangePart: rangePart,
    centerPart: str.substring(idx).trim()
  };
}

function buildRangeSection(rangeDesc, level, centerCoord, apiData) {
  if (!rangeDesc) return null;
  const data = apiData || {};
  const rawRange = pickFirst(data.rainfallrange, data.rainfallRange);
  let desc = rangeDesc;
  let centerLineHtml = "";
  let coord = centerCoord;

  if (rawRange && typeof rawRange === "string" && /降雨中心位于/.test(rawRange)) {
    const split = splitRangeAndCenterRaw(rawRange);
    if (split.rangePart) {
      const rangePart = expandSixHourWarningWording(split.rangePart);
      desc = /【[^】]+】/.test(rangePart)
        ? formatRangeHighlight(rangePart)
        : rangePart;
    }
    if (split.centerPart) {
      centerLineHtml = formatRangeHighlight(split.centerPart);
    }
    if (!coord) {
      coord = parseCenterPoint(rawRange);
    }
  }

  const section = {
    icon: "cluster",
    title: "降雨范围",
    desc: desc
  };

  const showCenter =
    shouldShowRainfallCenterInline(level, data) && (coord || centerLineHtml);
  if (!showCenter) {
    return section;
  }

  section.centerInline = true;
  const gridRainfall = extractCenterGridRainfall(data);
  if (gridRainfall) {
    section.jyl = gridRainfall;
  }
  if (centerLineHtml) {
    section.centerLineHtml = centerLineHtml;
    section.centerInDesc = true;
    if (coord) {
      section.centerPoint = coord;
    }
    return section;
  }

  if (coord) {
    section.centerInDesc = hasCenterTextInDesc(desc);
    section.centerPoint = coord;
    section.coordText = formatCoordDisplay(coord.lon, coord.lat);
    section.address = "";
    section.addressLoading = !section.centerInDesc;
  }
  return section;
}

/**
 * 短临预警信息
 * - 全国：仅降雨范围
 * - 省级/市级：降雨范围（有暴雨预警城市时内嵌降雨中心+定位）
 * - 县级：降雨范围（无降雨中心）
 */
export function buildRainfallWarningInfo(apiData, queryCode, options) {
  const data = apiData || {};
  const opts = options || {};
  const level = getXzqLevel(queryCode);
  opts.apiData = data;
  opts.queryCode = queryCode;
  const region = formatRainfallRegionTitle(level, opts);
  const warningTime =
    pickFirst(data.warningTime, data.yjsj, data.time, opts.taskTime) || "--";
  const timeLabel = getWarningTimeLabel(level);
  const sections = [];
  const centerCoord = getCenterPointFromData(data);

  const rangeDesc = buildRainfallRangeDesc(data, level, opts);
  const rangeSection = buildRangeSection(rangeDesc, level, centerCoord, data);
  if (rangeSection) {
    sections.push(rangeSection);
  }

  if (level !== XZQ_LEVEL.NATIONAL) {
    const liveDesc = buildLiveRainfallDesc(data, level, opts);
    if (liveDesc) {
      sections.push({ icon: "dashboard", title: "实况降雨", desc: liveDesc });
    }
  }

  if (!sections.length) {
    sections.push({
      icon: "cluster",
      title: "降雨范围",
      desc: "暂无预警信息"
    });
  }

  return {
    region,
    warningTime,
    timeLabel,
    sections
  };
}

export function buildCsnlWarningInfo(apiData, queryCode, options) {
  return buildFloodWarningInfo(apiData, queryCode, options, "csnl");
}

export function buildShWarningInfo(apiData, queryCode, options) {
  return buildFloodWarningInfo(apiData, queryCode, options, "sh");
}

export function getEmptyRainfallWarningInfo(regionLabel, queryCode, options) {
  return buildRainfallWarningInfo({ region: regionLabel || "全国" }, queryCode, options);
}

export function getEmptyCsnlWarningInfo(regionLabel, queryCode, options) {
  return buildCsnlWarningInfo({ region: regionLabel || "全国" }, queryCode, options);
}

export function getEmptyShWarningInfo(regionLabel, queryCode, options) {
  return buildShWarningInfo({ region: regionLabel || "全国" }, queryCode, options);
}
