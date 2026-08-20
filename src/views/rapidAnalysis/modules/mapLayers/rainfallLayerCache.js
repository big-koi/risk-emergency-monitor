/**
 * 短临/实况降雨时间轴图层缓存（与 Vue 页面解耦的可复用步骤）
 */
import { buildFileLayerUrl } from "./previewImage";

export const RAINFALL_LAYER_NAME = "降雨数据叠加";

/** 创建栅格图层时的默认 options */
export function buildRainfallImageLayerOptions(imageExtent, overrides) {
  const base = {
    visible: false,
    opacity: 0.5,
    name: RAINFALL_LAYER_NAME,
    projection: 4326,
    imageExtent: imageExtent
  };
  return Object.assign(base, overrides || {});
}

export function resolveRainfallLayerKey(item) {
  return item && item.filename ? item.filename : "";
}

/** 隐藏缓存中指定 key 的图层 */
export function hideCachedRainfallLayer(layerCache, key) {
  if (!layerCache || !key) return;
  const oldLayer = layerCache.get(key);
  if (!oldLayer || typeof oldLayer.getLayer !== "function") return;
  const olLayer = oldLayer.getLayer();
  if (olLayer && typeof olLayer.setVisible === "function") {
    olLayer.setVisible(false);
  }
}

/** 显示图层并设置透明度 */
export function showCachedRainfallLayer(targetLayer, opacity) {
  if (!targetLayer || typeof targetLayer.getLayer !== "function") return;
  const olLayer = targetLayer.getLayer();
  if (!olLayer) return;
  if (typeof olLayer.setVisible === "function") {
    olLayer.setVisible(true);
  }
  if (typeof olLayer.setOpacity === "function" && opacity != null) {
    olLayer.setOpacity(opacity);
  }
}

export const DRILL_DEPTH_LAYER_NAME = "积水深度图";

/**
 * 内涝/山洪钻取预加载图层 key
 */
export function buildDrillRainfallLayerKey(obj, xzqdm) {
  if (!obj) return "";
  const filename =
    obj.filename && obj.filename.length ? obj.filename[0] : obj.filename || "";
  return `${obj.time || ""}_${filename}_${xzqdm || ""}`;
}

/** 钻取积水深度图层 options */
export function buildDrillDepthLayerOptions(imageExtent, overrides) {
  const base = {
    visible: true,
    opacity: 0.5,
    name: DRILL_DEPTH_LAYER_NAME,
    projection: 4326,
    imageExtent: imageExtent
  };
  return Object.assign(base, overrides || {});
}

/** 模块切换 removeAllLayer 后复位可见 key */
export function buildRainfallLayerCacheResetPatch() {
  return {
    currentVisibleLayerKey: null,
    updateDateTimeCurrentVisibleLayerKey: null,
    drillCurrentVisibleLayerKey: null
  };
}

/**
 * 收集 layerCache 中 key 包含 substring 的项
 */
export function collectLayerCacheKeysBySubstring(layerCache, substring) {
  const keys = [];
  if (!layerCache || !substring) return keys;
  layerCache.forEach(function(_value, key) {
    if (key && key.indexOf(substring) !== -1) {
      keys.push(key);
    }
  });
  return keys;
}

/**
 * 按 key 列表移除缓存图层（removeLayer 由页面注入，兼容 me.earth / Facade）
 */
export function purgeLayerCacheEntries(layerCache, keys, removeLayer) {
  if (!layerCache || !keys || !keys.length) return;
  keys.forEach(function(key) {
    const layer = layerCache.get(key);
    if (layer && typeof removeLayer === "function") {
      try {
        removeLayer(layer);
      } catch (e) {
        console.warn("移除图层失败:", e);
      }
    }
    layerCache.delete(key);
  });
}

/**
 * 按行政区代码清理钻取预加载缓存
 */
export function purgeDrillLayerCacheByXzqdm(layerCache, xzqdm, removeLayer) {
  const keys = collectLayerCacheKeysBySubstring(layerCache, xzqdm || "");
  purgeLayerCacheEntries(layerCache, keys, removeLayer);
  return keys;
}

/**
 * 时间轴当前帧分支判定（原 updateDateTime 路由）
 * @returns {{ action: string, filename?: * }}
 */
export function resolveTimelineFrameAction(options) {
  const opts = options || {};
  const idx = opts.disasterTypeIndex;
  const obj = opts.obj;

  if (idx === 1) {
    return { action: "shortTermCache" };
  }
  if (idx === 3 || idx === 4) {
    if (opts.isMapType) {
      return {
        action: "threeMap",
        filename: obj && obj.filename
      };
    }
    if (
      opts.isJsDetailsChart &&
      obj &&
      obj.filename &&
      obj.filename.length > 0
    ) {
      return { action: "drillVisible" };
    }
    return { action: "floodFetch" };
  }
  return { action: "noop" };
}

/**
 * 钻取时间轴「当前帧」切换（原 updateDateTime 2D 钻取命中缓存）
 * @returns {{ status: 'hit'|'miss'|'fallback', layerKey?: string }}
 */
export function applyDrillVisibleFrame(ctx) {
  const obj = ctx.obj;
  if (!obj || !obj.filename || !obj.filename.length) {
    return { status: "fallback" };
  }

  const layerKey = buildDrillRainfallLayerKey(obj, ctx.xzqdm || "");
  const targetLayer =
    ctx.layerCache && typeof ctx.layerCache.get === "function"
      ? ctx.layerCache.get(layerKey)
      : null;

  if (!targetLayer) {
    return { status: "miss", layerKey: layerKey };
  }

  if (typeof ctx.clearBusinessLayers === "function") {
    ctx.clearBusinessLayers();
  }

  if (ctx.currentVisibleKey && ctx.currentVisibleKey !== layerKey) {
    hideCachedRainfallLayer(ctx.layerCache, ctx.currentVisibleKey);
  }

  if (typeof ctx.addHostLayer === "function") {
    ctx.addHostLayer(targetLayer);
  }

  showCachedRainfallLayer(targetLayer, 0.5);
  return { status: "hit", layerKey: layerKey };
}

/**
 * 钻取时间轴预加载一帧（原 cacheDrillLayers 单步）
 * @returns {{ status: 'done'|'skip'|'pending', nextIndex?: number, layerKey?: string }}
 */
export function applyDrillPreloadFrame(ctx) {
  const list = ctx.list;
  const index = ctx.index != null ? ctx.index : 0;

  if (!list || list.length === 0 || index >= list.length) {
    if (index === 0 && typeof ctx.onEmpty === "function") {
      ctx.onEmpty();
    }
    return { status: "done" };
  }

  const obj = list[index];
  const filename =
    obj && obj.filename && Array.isArray(obj.filename) && obj.filename.length > 0
      ? obj.filename[0]
      : null;

  if (!filename) {
    return { status: "skip", nextIndex: index + 1 };
  }

  const layerKey = buildDrillRainfallLayerKey(obj, ctx.xzqdm || "");
  if (ctx.layerCache && ctx.layerCache.get(layerKey)) {
    return { status: "skip", nextIndex: index + 1 };
  }

  const mapImgUrl = ctx.buildImageUrl(obj, filename);
  const layerName = DRILL_DEPTH_LAYER_NAME + mapImgUrl;

  Promise.resolve(ctx.fetchExtent(filename, obj))
    .then(function(imageExtent) {
      if (!imageExtent) {
        if (typeof ctx.onContinue === "function") {
          ctx.onContinue(index + 1);
        }
        return;
      }
      const targetLayer = ctx.createImageLayer(
        layerName,
        mapImgUrl,
        buildDrillDepthLayerOptions(imageExtent)
      );
      if (!targetLayer) {
        if (typeof ctx.onContinue === "function") {
          ctx.onContinue(index + 1);
        }
        return;
      }

      const olLayer =
        typeof targetLayer.getLayer === "function"
          ? targetLayer.getLayer()
          : null;
      const source = olLayer && olLayer.getSource && olLayer.getSource();
      ctx.layerCache.set(layerKey, targetLayer);

      if (source && typeof source.on === "function") {
        source.on("imageloadend", function() {
          if (olLayer && typeof olLayer.setVisible === "function") {
            olLayer.setVisible(false);
          }
          if (typeof ctx.onContinue === "function") {
            ctx.onContinue(index + 1);
          }
        });
      } else if (typeof ctx.onContinue === "function") {
        ctx.onContinue(index + 1);
      }
    })
    .catch(function(err) {
      if (typeof ctx.onError === "function") {
        ctx.onError(err);
      }
      if (typeof ctx.onContinue === "function") {
        ctx.onContinue(index + 1);
      }
    });

  return { status: "pending", layerKey: layerKey, mapImgUrl: mapImgUrl };
}

/**
 * 短临时间轴「当前帧」切换（原 cacheLayers）
 * @returns {{ layerKey: string, mapImgUrl: string } | null}
 */
export function applyShortTermVisibleFrame(ctx) {
  const list = ctx.list;
  const index = ctx.index != null ? ctx.index : 0;
  if (!list || list.length - 1 < index) return null;

  const item = list[index];
  const layerKey = resolveRainfallLayerKey(item);
  if (!layerKey) return null;

  const mapImgUrl = buildFileLayerUrl(ctx.baseUrl, layerKey);
  let targetLayer = ctx.layerCache.get(layerKey);

  if (!targetLayer) {
    targetLayer = ctx.createImageLayer(
      RAINFALL_LAYER_NAME,
      mapImgUrl,
      buildRainfallImageLayerOptions(ctx.imageExtent)
    );
    if (!targetLayer) return null;

    const olLayer = targetLayer.getLayer();
    const source = olLayer && olLayer.getSource && olLayer.getSource();
    if (source && typeof source.on === "function" && ctx.onCreatedLoadEnd) {
      source.on("imageloadend", function() {
        ctx.onCreatedLoadEnd({
          layerKey: layerKey,
          olLayer: olLayer,
          index: index,
          list: list
        });
      });
    }
    ctx.layerCache.set(layerKey, targetLayer);
  } else if (typeof ctx.ensureOnMap === "function") {
    ctx.ensureOnMap(targetLayer);
  }

  if (ctx.currentVisibleKey && ctx.currentVisibleKey !== layerKey) {
    hideCachedRainfallLayer(ctx.layerCache, ctx.currentVisibleKey);
  }

  showCachedRainfallLayer(targetLayer, 0.5);
  return { layerKey: layerKey, mapImgUrl: mapImgUrl };
}

/**
 * 短临分辨率切换时的预加载（原 cacheLayers2，显示透明度 0）
 * @returns {{ layerKey: string, mapImgUrl: string } | null}
 */
export function applyShortTermPreloadFrame(ctx) {
  const list = ctx.list;
  const index = ctx.index != null ? ctx.index : 1;
  if (!list || list.length - 1 < index) return null;

  const item = list[index];
  const layerKey = resolveRainfallLayerKey(item);
  if (!layerKey) return null;

  const mapImgUrl = buildFileLayerUrl(ctx.baseUrl, layerKey);
  let targetLayer = ctx.layerCache.get(layerKey);

  if (!targetLayer) {
    targetLayer = ctx.createImageLayer(
      RAINFALL_LAYER_NAME,
      mapImgUrl,
      buildRainfallImageLayerOptions(ctx.imageExtent)
    );
    if (!targetLayer) return null;

    const olLayer = targetLayer.getLayer();
    const source = olLayer && olLayer.getSource && olLayer.getSource();
    if (source && typeof source.on === "function" && ctx.onCreatedLoadEnd) {
      source.on("imageloadend", function() {
        ctx.onCreatedLoadEnd({
          layerKey: layerKey,
          olLayer: olLayer,
          index: index,
          list: list
        });
      });
    }
    ctx.layerCache.set(layerKey, targetLayer);
  } else if (typeof ctx.ensureOnMap === "function") {
    ctx.ensureOnMap(targetLayer);
  }

  hideCachedRainfallLayer(ctx.layerCache, ctx.currentVisibleKey);
  showCachedRainfallLayer(targetLayer, 0);
  return { layerKey: layerKey, mapImgUrl: mapImgUrl };
}

export default {
  RAINFALL_LAYER_NAME,
  DRILL_DEPTH_LAYER_NAME,
  buildRainfallImageLayerOptions,
  buildDrillDepthLayerOptions,
  resolveRainfallLayerKey,
  hideCachedRainfallLayer,
  showCachedRainfallLayer,
  buildDrillRainfallLayerKey,
  buildRainfallLayerCacheResetPatch,
  collectLayerCacheKeysBySubstring,
  purgeLayerCacheEntries,
  purgeDrillLayerCacheByXzqdm,
  resolveTimelineFrameAction,
  applyDrillVisibleFrame,
  applyShortTermVisibleFrame,
  applyShortTermPreloadFrame,
  applyDrillPreloadFrame
};
