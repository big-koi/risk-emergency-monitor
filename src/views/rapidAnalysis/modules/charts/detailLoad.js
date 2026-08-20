/**
 * 详情钻取：查询参数与接口成功后的应用计划（纯函数）
 */
import { getRainfallDrillCode } from "../../regionContext";

/** 短临详情柱状图查询参数 */
export function buildByDetailQueryParams(item) {
  return {
    taskTime: item && item.dateTime,
    xzqdm: getRainfallDrillCode(item)
  };
}

/**
 * 短临详情接口成功后的应用计划
 * @returns {{ ok: boolean, barData?: *, chartData?: * }}
 */
export function planByDetailApply(res, byChartType) {
  if (!res || res.code !== 200) {
    return { ok: false };
  }
  const barData = res.data;
  return {
    ok: true,
    barData: barData,
    chartData: barData ? barData[byChartType] : null
  };
}

/**
 * 实况详情成功后的图表 + marker 计划
 * @returns {{ ok: boolean, chartData?: *, marker?: object }}
 */
export function planSkDetailApply(res, item, drillCode) {
  if (!res || res.code !== 200) {
    return { ok: false };
  }
  const code = drillCode || getRainfallDrillCode(item);
  return {
    ok: true,
    chartData: res.data,
    marker: {
      coordinate: [item.x, item.y],
      data: {
        xzqdm: code,
        type: "skjyXz",
        name: item && item.name,
        lon: Number(item && item.x),
        lat: Number(item && item.y),
        max: item && item.maxjsl
      },
      type: "skjyXz"
    }
  };
}

/** 内涝/山洪详情通用 xz 查询参数 */
export function buildFloodDetailXzParams(taskTime, item) {
  return {
    taskTime: taskTime,
    xzqdm: (item && item.xzqdm) || ""
  };
}

/**
 * 内涝/山洪「未来」详情（getJssdDataXz / getShJssdDataXz）
 * @returns {{ ok: boolean, lineData?: *, timelineAction: string, timelineDataType?: string, chartKey?: string }}
 */
export function planFloodFutureDetailApply(res, options) {
  if (!res || res.code !== 200) {
    return { ok: false, timelineAction: "none" };
  }
  const opts = options || {};
  return {
    ok: true,
    lineData: res.data,
    timelineAction: opts.isMapType ? "none" : "jsSd",
    timelineDataType: opts.timelineDataType,
    chartKey: opts.jsChartType
  };
}

/**
 * 内涝「过去」详情（getJSsdXzMes）
 */
export function planCsnlPastDetailApply(res, options) {
  if (!res || res.code !== 200) {
    return { ok: false, timelineAction: "none" };
  }
  const opts = options || {};
  const xzqdm = opts.xzqdm || "";
  if (opts.isMapType) {
    return {
      ok: true,
      lineData: res.data,
      jsChartType: "hour",
      timelineAction: "shTimeData",
      timelineArgs: [opts.csnlValue, opts.csnlValue, xzqdm],
      chartKey: "hour"
    };
  }
  return {
    ok: true,
    lineData: res.data,
    jsChartType: "hour",
    timelineAction: "sklssjz",
    timelineArgs: [xzqdm],
    chartKey: "hour"
  };
}

/**
 * 山洪「过去」详情图表接口（getShJSsdXzMes，仅 3D 时间轴）
 */
export function planShPastMesDetailApply(res, options) {
  if (!res || res.code !== 200) {
    return { ok: false, timelineAction: "none" };
  }
  const opts = options || {};
  return {
    ok: true,
    lineData: res.data,
    jsChartType: "hour",
    timelineAction: "shTimeData",
    timelineArgs: [opts.shValue, opts.shValue, opts.xzqdm || ""],
    chartKey: "hour"
  };
}

/**
 * 山洪「过去」下钻（getShJsGQXZ）
 */
export function planShPastGqDetailApply(res, options) {
  if (!res || res.code !== 200) {
    return { ok: false, timelineAction: "none" };
  }
  const opts = options || {};
  const xzqdm = opts.xzqdm || "";
  if (opts.isMapType) {
    return {
      ok: true,
      lineData: res.data,
      timelineAction: "shTimeData",
      timelineArgs: [opts.shValue, opts.shValue, xzqdm],
      chartKey: opts.jsChartType
    };
  }
  return {
    ok: true,
    lineData: res.data,
    timelineAction: "sklssjz",
    timelineArgs: [xzqdm],
    chartKey: opts.jsChartType
  };
}

/** 从 lineData 取当前系列 */
export function pickDetailLineSeries(lineData, chartKey) {
  if (!lineData || !chartKey) return null;
  return lineData[chartKey];
}

export default {
  buildByDetailQueryParams,
  planByDetailApply,
  planSkDetailApply,
  buildFloodDetailXzParams,
  planFloodFutureDetailApply,
  planCsnlPastDetailApply,
  planShPastMesDetailApply,
  planShPastGqDetailApply,
  pickDetailLineSeries
};
