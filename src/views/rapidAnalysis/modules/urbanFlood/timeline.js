/**
 * 内涝 / 山洪时间轴：查询参数、守卫、历史/未来 Tab 路由
 */
import { resolveFloodTimelineDataType } from "../mapLayers/timelineStrategy";

/** 浏览态 2D 非钻取时不拉积水深度时间轴 */
export function shouldFetchFloodDepthTimeline(options) {
  const opts = options || {};
  if (
    (opts.disasterTypeIndex === 3 || opts.disasterTypeIndex === 4) &&
    !opts.isJsDetailsChart &&
    !opts.isMapType
  ) {
    return false;
  }
  return true;
}

export function resolveFloodTimelineModelType(disasterTypeIndex) {
  if (disasterTypeIndex == 3) return "1";
  if (disasterTypeIndex == 4) return "2";
  return "";
}

/** getJsSd 查询参数 */
export function buildJsDepthTimelineParams(options) {
  const opts = options || {};
  return {
    taskTime: opts.taskTime,
    type: opts.type,
    xzqdm: opts.xzqdm || "",
    modelType: resolveFloodTimelineModelType(opts.disasterTypeIndex)
  };
}

/** getSKLSSJZ 历史积水时间轴参数 */
export function buildFloodPastTimelineParams(options) {
  const opts = options || {};
  return {
    taskTime: opts.taskTime,
    xzqdm: opts.xzqdm || "",
    modelType: resolveFloodTimelineModelType(opts.disasterTypeIndex)
  };
}

/**
 * 3D 山洪/内涝模型时间轴参数（getShTimeData）
 * type: 1 → DL，其它 → SK
 */
export function buildShModelTimelineParams(options) {
  const opts = options || {};
  return {
    modelType: opts.modelType,
    taskTime: opts.taskTime,
    type: opts.type == 1 ? "DL" : "SK",
    xzqdm: opts.xzqdm
  };
}

/**
 * 历史/未来淹没 Tab 加载计划（原 timeTabActiveType 分支）
 * 保留原逻辑：2D 用 shValue==1 判定走积水深度轴（含内涝场景）
 * @returns {{ action: string, modelType?: number, type?: number, xzqdm?: string, dataType?: string }}
 */
export function planFloodHistoryFutureTabLoad(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  if (idx !== 3 && idx !== 4) {
    return { action: "noop" };
  }

  const tabIndex = opts.timeTabActive;
  const xzqdm = opts.xzqdm || "";
  const dataType = opts.dataType || resolveFloodTimelineDataType(tabIndex);

  if (opts.isMapType) {
    return {
      action: "shTimeData",
      modelType: 1,
      type: tabIndex === 1 ? 2 : 1,
      xzqdm: xzqdm
    };
  }

  if (opts.shValue == 1) {
    return { action: "jsSd", dataType: dataType };
  }

  return { action: "sklssjz", xzqdm: xzqdm };
}

export default {
  shouldFetchFloodDepthTimeline,
  resolveFloodTimelineModelType,
  buildJsDepthTimelineParams,
  buildFloodPastTimelineParams,
  buildShModelTimelineParams,
  planFloodHistoryFutureTabLoad
};
