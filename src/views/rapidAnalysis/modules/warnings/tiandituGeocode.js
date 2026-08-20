/**
 * 天地图逆地理编码（预警中心点地址补全）
 */

export const TIANDITU_GEOCODE_TK = "73544acc9abce21e7fd4523c6f077d74";

export function buildTiandituGeocodeUrl(lon, lat, tk) {
  const token = tk || TIANDITU_GEOCODE_TK;
  return (
    'https://api.tianditu.gov.cn/geocoder?postStr={"lon":' +
    lon +
    ',"lat":' +
    lat +
    ',"ver":1}&type=geocode&tk=' +
    token
  );
}

/**
 * @param {object} res - 天地图 geocoder JSON
 * @param {function} formatAddressFromComponent - (addressComponent) => string
 * @returns {string}
 */
export function parseTiandituAddress(res, formatAddressFromComponent) {
  if (!res || res.status !== "0" || !res.result) {
    return "";
  }
  const ac = res.result.addressComponent;
  const fromAc =
    typeof formatAddressFromComponent === "function"
      ? formatAddressFromComponent(ac)
      : "";
  return fromAc || res.result.formatted_address || "";
}

/** @returns {object|null} */
export function parseTiandituGeocodeResult(res) {
  if (!res || res.status !== "0" || !res.result) {
    return null;
  }
  return res.result;
}

/** 预警 sections 中待补全地址的中心点 */
export function pickWarningSectionsNeedingAddress(warningInfo) {
  if (!warningInfo || !warningInfo.sections) {
    return [];
  }
  return warningInfo.sections.filter(function(s) {
    return (
      s.centerPoint &&
      (s.centerInline || s.floodPoint) &&
      !s.centerLineHtml &&
      (s.addressLoading || !s.address)
    );
  });
}

/**
 * 点查回显：直接弹窗 vs 天图逆地理
 * @returns {{ action: 'direct'|'geocode', identifyModel?, position?, lon?, lat?, jyl? }}
 */
export function planSearchBackwardIdentify(type, item) {
  if (["qxyj", "byyj"].indexOf(type) !== -1) {
    return {
      action: "direct",
      identifyModel: item,
      position: [item.lon, item.lat]
    };
  }
  return {
    action: "geocode",
    lon: item.lon,
    lat: item.lat,
    jyl: item.jyl || item.max,
    geocodeUrl: buildTiandituGeocodeUrl(item.lon, item.lat)
  };
}

/**
 * 天图逆地理成功后的 identify 状态
 */
export function planGeocodeIdentifyApply(res, jyl) {
  if (!res || !res.result || !res.result.addressComponent) {
    return { ok: false };
  }
  const ac = Object.assign({}, res.result.addressComponent);
  ac.jyl = jyl;
  return {
    ok: true,
    identifyModel: ac,
    identifyModellat: res.result.location && res.result.location.lat,
    identifyModellon: res.result.location && res.result.location.lon,
    position: [
      res.result.location && res.result.location.lon,
      res.result.location && res.result.location.lat
    ]
  };
}

export default {
  TIANDITU_GEOCODE_TK,
  buildTiandituGeocodeUrl,
  parseTiandituAddress,
  parseTiandituGeocodeResult,
  pickWarningSectionsNeedingAddress,
  planSearchBackwardIdentify,
  planGeocodeIdentifyApply
};
