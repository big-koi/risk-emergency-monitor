/**
 * 城市内涝 / 山洪：积水深度图与极值图 URL
 */
import { resolveFloodTimelineDataType } from "../mapLayers/timelineStrategy";

/**
 * 极值图（JZT）图片地址
 * 例：.../flood_output/2026070909_DL/post/130900_maxdepth.png
 */
export function buildSubmergedExtremeImageUrl(options) {
  const opts = options || {};
  const dateArray = opts.dateArray || [];
  const obj = opts.obj || {};
  const filename = opts.filename || "";
  const timeSource = obj.time || opts.taskSelectedTime || "";
  const timeArray = String(timeSource).split(/[- :]/);
  const timeFolder = `${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}`;
  const typeSuffix = obj.isFuture ? "DL" : "SK";
  const base = `${opts.baseUrl || ""}file/projectServerTask/`;

  if (opts.disasterTypeIndex === 4 && !obj.isFuture) {
    return (
      `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
      `${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/` +
      `${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/post/${filename}`
    );
  }
  return (
    `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
    `${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/` +
    `${timeFolder}_${typeSuffix}/post/${filename}`
  );
}

/**
 * 积水深度 depth2png 图层 URL（钻取/逐帧）
 */
export function buildFloodDepthImageUrl(options) {
  const opts = options || {};
  const dateArray = opts.dateArray || [];
  const obj = opts.obj || {};
  const filename = opts.filename || "";
  const base = `${opts.baseUrl || ""}file/projectServerTask/`;

  if (obj.submergedExtreme) {
    return buildSubmergedExtremeImageUrl(opts);
  }

  if (opts.isPast) {
    if (opts.disasterTypeIndex === 4 && opts.shValue === 2) {
      return (
        `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
        `${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/` +
        `${dateArray[0]}${dateArray[1]}${dateArray[2]}${dateArray[3]}_skls_yhsk_SK/depth2png/${filename}`
      );
    }
    const timeArray = String(obj.time || "").split(/[- :]/);
    return (
      `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
      `${dateArray[0]}${dateArray[1]}${dateArray[2]}_skls_yhsk/flood_output/` +
      `${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_skls_yhsk_SK/depth2png/${filename}`
    );
  }

  const timeArray = String(obj.time || "").split(/[- :]/);
  const timeType = resolveFloodTimelineDataType(opts.timeTabActive);
  return (
    `${base}${dateArray[0]}/${dateArray[0]}${dateArray[1]}/` +
    `${dateArray[0]}${dateArray[1]}${dateArray[2]}/flood_output/` +
    `${timeArray[0]}${timeArray[1]}${timeArray[2]}${timeArray[3]}_${timeType}/depth2png/${filename}`
  );
}

/** 解析四至字符串 "minX,minY,maxX,maxY" */
export function parseLayerImageExtent(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const parts = String(raw)
    .split(",")
    .map(function(v) {
      return Number(String(v).trim());
    });
  if (parts.length !== 4 || parts.some(function(n) {
    return !Number.isFinite(n);
  })) {
    return null;
  }
  let minX = parts[0];
  let minY = parts[1];
  let maxX = parts[2];
  let maxY = parts[3];
  if (minX > maxX) {
    const t = minX;
    minX = maxX;
    maxX = t;
  }
  if (minY > maxY) {
    const t = minY;
    minY = maxY;
    maxY = t;
  }
  if (maxX - minX <= 0 || maxY - minY <= 0) {
    return null;
  }
  return [minX, minY, maxX, maxY];
}

export default {
  buildSubmergedExtremeImageUrl,
  buildFloodDepthImageUrl,
  parseLayerImageExtent
};
