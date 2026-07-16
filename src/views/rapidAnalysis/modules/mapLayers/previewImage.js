/**
 * 地图业务图层 / OL 预览共用工具
 */

/** 后端 file 服务拼出图片 URL */
export function buildFileLayerUrl(baseUrl, filename) {
  if (!filename) return "";
  const base = baseUrl || "";
  const name = String(filename).replace(/^\//, "");
  return `${base}file/${name}`;
}

/** 构造 OL 预览 imageLayer props */
export function buildOlPreviewImagePayload(url, imageExtent, opacity) {
  if (!url || !imageExtent) return null;
  return {
    url,
    imageExtent,
    opacity: opacity != null ? opacity : 0.55
  };
}

export default {
  buildFileLayerUrl,
  buildOlPreviewImagePayload
};
