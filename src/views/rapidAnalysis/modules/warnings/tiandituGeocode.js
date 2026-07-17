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

export default {
  TIANDITU_GEOCODE_TK,
  buildTiandituGeocodeUrl,
  parseTiandituAddress,
  parseTiandituGeocodeResult,
  pickWarningSectionsNeedingAddress
};
