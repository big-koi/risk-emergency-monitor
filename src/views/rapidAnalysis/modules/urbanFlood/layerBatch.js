/**
 * 城市内涝 / 山洪：图层批处理与极值图并行编排
 */
import { parseLayerImageExtent } from "./layerUrl";

/** 组装单张积水图层描述 */
export function buildFloodLayerItem(options) {
  const opts = options || {};
  const filename = opts.filename || "";
  const url = opts.url || "";
  const imageExtent = opts.imageExtent;
  if (!imageExtent) return null;

  if (opts.submergedExtreme) {
    const xzqdm = String(filename).split("_")[0];
    return {
      layerName: "积水深度图_" + xzqdm,
      url: url,
      imageExtent: imageExtent,
      xzqdm: xzqdm
    };
  }
  return {
    layerName: "积水深度图" + (opts.index != null ? opts.index : 0),
    url: url,
    imageExtent: imageExtent
  };
}

/** 合并多图层四至，供 fit 用 */
export function mergeLayerExtents(layerArray) {
  if (!layerArray || !layerArray.length) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let hit = false;
  layerArray.forEach(function(item) {
    const extent = item && item.imageExtent;
    if (!extent || extent.length !== 4) return;
    hit = true;
    minX = Math.min(minX, extent[0]);
    minY = Math.min(minY, extent[1]);
    maxX = Math.max(maxX, extent[2]);
    maxY = Math.max(maxY, extent[3]);
  });
  if (!hit || !Number.isFinite(minX)) return null;
  return [minX, minY, maxX, maxY];
}

/**
 * 处理单帧四至响应
 * @returns {{ item: object|null, continueBatch: boolean, rawExtent: * }}
 */
export function resolveFloodLayerBatchStep(options) {
  const opts = options || {};
  const res = opts.res;
  const obj = opts.obj;
  const submergedExtreme = !!(obj && obj.submergedExtreme);
  let item = null;
  let rawExtent = null;

  if (res && res.code === 200 && res.data) {
    rawExtent = res.data;
    const imageExtent =
      opts.imageExtent || parseLayerImageExtent(res.data);
    if (imageExtent) {
      item = buildFloodLayerItem({
        filename: opts.filename,
        url: opts.mapImgUrl,
        imageExtent: imageExtent,
        submergedExtreme: submergedExtreme,
        index: opts.index
      });
    }
  }

  return {
    item: item,
    continueBatch: !submergedExtreme,
    rawExtent: rawExtent
  };
}

/**
 * 极值图并行查四至并回调
 * ctx: { filenames, fetchItem(filename,index)->Promise<item|null>, isStale(), onItem(item), onDone(layerArray), onEmpty() }
 */
export function runSubmergedLayersParallel(ctx) {
  const context = ctx || {};
  const filenames = context.filenames || [];
  if (!filenames.length) {
    if (typeof context.onEmpty === "function") {
      context.onEmpty();
    }
    return;
  }

  const layerArray = [];
  let pending = filenames.length;

  filenames.forEach(function(filename, index) {
    Promise.resolve(context.fetchItem(filename, index)).then(function(item) {
      if (typeof context.isStale === "function" && context.isStale()) {
        return;
      }
      if (item) {
        layerArray.push(item);
        if (typeof context.onItem === "function") {
          context.onItem(item, layerArray);
        }
      }
      pending -= 1;
      if (pending === 0 && typeof context.onDone === "function") {
        context.onDone(layerArray);
      }
    });
  });
}

export default {
  buildFloodLayerItem,
  mergeLayerExtents,
  resolveFloodLayerBatchStep,
  runSubmergedLayersParallel
};
