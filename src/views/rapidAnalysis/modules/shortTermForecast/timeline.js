/**
 * 短临预报时间轴：分辨率切换与重载判定
 */
import { pickShortTermTimelineFetcher } from "../mapLayers/timelineStrategy";

/** 是否应在切回短临时重载降雨时间轴图层 */
export function shouldReloadShortTermRainfallLayers(options) {
  const opts = options || {};
  return (
    opts.disasterTypeIndex === 1 &&
    !opts.isMapType &&
    !!opts.taskSelectedTime
  );
}

/**
 * 拉取短临时间轴数据
 * @returns {Promise<{ code: number, data: Array }>}
 */
export function fetchShortTermTimeline(options) {
  const opts = options || {};
  const api = pickShortTermTimelineFetcher(opts.resolution, opts.fetcherMap);
  if (!api) {
    return Promise.resolve({ code: -1, data: [] });
  }
  return api({ taskTime: opts.taskTime }).then(function(res) {
    return res || { code: -1, data: [] };
  });
}

/** 短临全国默认图名 */
export function getShortTermMapTitle() {
  return "未来三小时短临降雨预报图";
}

export default {
  shouldReloadShortTermRainfallLayers,
  fetchShortTermTimeline,
  getShortTermMapTitle
};
