/** 灾种模块标识 */
export const DISASTER_MODULE = {
  SHORT_TERM_FORECAST: "shortTermForecast",
  LIVE_RAINFALL: "liveRainfall",
  URBAN_FLOOD: "urbanFlood",
  MOUNTAIN_FLOOD: "mountainFlood"
};

/** 与旧版 disasterTypeIndex 的映射 */
export const DISASTER_INDEX_MAP = {
  1: DISASTER_MODULE.SHORT_TERM_FORECAST,
  2: DISASTER_MODULE.LIVE_RAINFALL,
  3: DISASTER_MODULE.URBAN_FLOOD,
  4: DISASTER_MODULE.MOUNTAIN_FLOOD
};

export const DISASTER_MODULE_INDEX = {
  [DISASTER_MODULE.SHORT_TERM_FORECAST]: 1,
  [DISASTER_MODULE.LIVE_RAINFALL]: 2,
  [DISASTER_MODULE.URBAN_FLOOD]: 3,
  [DISASTER_MODULE.MOUNTAIN_FLOOD]: 4
};

/** 行政区层级 */
export const REGION_LEVEL = {
  NATIONAL: "national",
  PROVINCE: "province",
  CITY: "city",
  COUNTY: "county"
};

/** 钻取来源 */
export const DRILL_SOURCE = {
  RANKING_TABLE: "ranking-table",
  MAP_CLICK: "map-click",
  CROSS_MODULE: "cross-module"
};

export const NATIONAL_CODE = "100000";
