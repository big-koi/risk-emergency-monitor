import {deepClone, getDataType} from "../../utils";

/** hezhangsheng created of 2022/01/05
 * echarts图表配置项映射 替换
 * @param {object} data props接收过来的option
 * @param {object} mapData 本身的option
 * @param {string[]} whiteList 白名单 表示哪些属性不用递归，直接替换
 **/
export function mapReplace(data, mapData, whiteList) {
  // 主要方法
  replaceFn(data, mapData, whiteList);

  function replaceFn(data, mapData, whiteList) {
    for (const dataKey in data) {
      let t = data[dataKey];
      let t1 = mapData[dataKey];
      if (!t1 || whiteList.includes(dataKey) || (getDataType(t) != 'Object' && getDataType(t) != 'Array')) {
        mapData[dataKey] = t;
      } else {
        // 只有 t 的数据类型 为 Object 或 Array 时才会走到这里
        if (getDataType(t) == 'Object') {
          getDataType(t1) == 'Object' ? replaceFn(t, t1, whiteList) : replaceFn(t, t1[0], whiteList);
        } else {
          if (getDataType(t1) == 'Array') {
            let temp = t1[0] ? deepClone(t1[0]) : deepClone(t[0]);
            t.forEach((h, n) => {
              if (!t1[0]) {
                t1[0] = deepClone(h);
              } else if (!t1[n]) {
                t1[n] = deepClone(temp);
              }
              replaceFn(h, t1[n], whiteList);
            });
          } else {
            replaceFn(t[0], t1, whiteList);
          }
        }
      }
    }
  }
}
