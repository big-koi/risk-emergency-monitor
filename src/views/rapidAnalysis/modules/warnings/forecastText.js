/**
 * 预报文案时间微调（纯函数）
 */

/**
 * 将预报字符串中的日期时间部分加一小时，仅保留 HH:mm 前缀
 * 与原 adjustForecastTime 行为一致
 */
export function adjustForecastTime(forecastString) {
  const text = forecastString == null ? "" : String(forecastString);
  const datetimeMatch = text.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/);
  if (!datetimeMatch) {
    console.warn("未找到有效的时间格式");
    return text;
  }
  const originalDatetime = datetimeMatch[1];
  const forecastContent = text.slice(originalDatetime.length);
  const date = new Date(originalDatetime.replace(/-/g, "/"));
  date.setHours(date.getHours() + 1);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return hours + ":" + minutes + forecastContent;
}

export default {
  adjustForecastTime
};
