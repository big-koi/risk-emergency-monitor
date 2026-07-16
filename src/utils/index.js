/**
 * 非空判断
 * @param data 要判断的数据
 * @param returnData 如果为空返回的数据
 **/
export function notEmpty(data, returnData = '-') {
  if (data === null || data === undefined || data === '' || data === 'null') {
    return returnData
  }
  return data;
}

/**
 * 获取数据类型
 * @param {any} data 需要判断的数据
 * @return {string} 返回该数据的标准类型
 **/
export function getDataType(data) {
  return Object.prototype.toString.call(data).slice(8, -1);
}

/**
 * 时间戳 转换
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return ''
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'undefined' || time === null || time === 'null') {
    return ''
  } else if (typeof time === 'object') {
    date = time._d
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    let value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value
    }
    return value || 0
  })
  return time_str
}

/**
 * 深克隆
 * @param {object|array|function|Date} obj 需要克隆的对象或其它
 * @return {object|array|function|Date} 返回克隆后的对象或其它
 **/
export function deepClone(obj) {
  //判断是否为复杂数据类型
  let isComplexDataType = obj => (typeof obj === 'object' || typeof obj === 'function') && (obj !== null);
  // 主要方法
  return deepCloneFn(obj);

  //利用 WeekMap() 的键对自己所引用对象的引用都是弱引用的特性，在没有其他引用和该键引用同一对象的情况下，这个对象将会被垃圾回收
  //为了解决循环引用的问题，设置一个哈希表存储已拷贝过的对象进行循环检测，当检测到当前对象已存在于哈希表中时，取出该值并返回即可
  function deepCloneFn(obj, hash = new WeakMap()) {
    //查哈希表，防止循环拷贝。如果成环了（对象循环引用）,参数obj = obj.loop = 最初的obj，则会在WeakMap中找到第一次放入的obj提前返回第一次放入WeakMap的cloneObj,解决对象循环引用的问题
    if (hash.has(obj)) return hash.get(obj);

    //如果参数为Date, RegExp, Set, Map, WeakMap, WeakSet等引用类型，则直接生成一个新的实例
    let type = [Date, RegExp, Set, Map, WeakMap, WeakSet];
    if (type.includes(obj.constructor)) return new obj.constructor(obj);

    //遍历传入参数所有属性描述符
    let allDesc = Object.getOwnPropertyDescriptors(obj);
    //继承原型
    let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc);

    // 获取所有 Symbol 类型键
    let symKeys = Object.getOwnPropertySymbols(obj);
    // 拷贝 Symbol 类型键对应的属性
    if (symKeys.length > 0) {
      symKeys.forEach(symKey => {
        cloneObj[symKey] = isComplexDataType(obj[symKey]) ? deepCloneFn(obj[symKey], hash) : obj[symKey]
      })
    }

    // 哈希表设值
    hash.set(obj, cloneObj);

    // Object.keys(obj)拷贝可枚举属性和符号类型
    for (let key of Object.keys(obj)) {
      // 如果值是引用类型并且非函数则递归调用deepClone
      cloneObj[key] = (isComplexDataType(obj[key]) && typeof obj[key] !== 'function') ? deepCloneFn(obj[key], hash) : obj[key];
    }
    return cloneObj;
  }
}

/**
 * 处理详情跳转 之前
 **/
export function handlerDetailJumpBefore(path) {
  let returnPathArr = JSON.parse(sessionStorage.getItem('returnPathArr')) || [];
  let navbarCurrentIdArr = JSON.parse(sessionStorage.getItem('navbarCurrentIdArr')) || [];

  returnPathArr.push(path);
  navbarCurrentIdArr.push(sessionStorage.getItem('navbarCurrentId'));

  sessionStorage.setItem('returnPathArr', JSON.stringify(returnPathArr));
  sessionStorage.setItem('navbarCurrentIdArr', JSON.stringify(navbarCurrentIdArr));
}

/**
 * 千位分隔符
 * @param num 需要处理的数字
 **/
export function splitK(num) {
  if (isNaN(Number(num))) return 0;
  // 转成字符串
  num += '';
  // 小数位
  let decimal = '';
  if (num.includes('.')) {
    let decimalIdx = num.indexOf('.');
    decimal = num.substr(decimalIdx);
    num = num.substr(0, decimalIdx);
  }
  // 负数的减号
  let minus = '';
  if (num < 0) {
    num = Math.abs(num).toString();
    minus = '-';
  }
  //
  let arr = [];
  num.split('').reverse().forEach((t, i) => {
    if (i != 0 && i % 3 == 0) arr.push(',');
    arr.push(t);
  });
  return minus + arr.reverse().join('') + decimal;
}

/**
 * 单位换算
 * @param {number} num 要转换的数字
 * @param {string} type 某单位转某单位的缩写 例：平方米转公顷：'sqm-hm2'
 **/
export function unitConversion(num, type) {
  switch (type) {
    case 'sqm-hm2': // 平方米转公顷
      return num * 0.0001;
    case 'sqm-mu': // 平方米转亩
      return num * 0.0015;
    case 'sqm-km2': // 平方米转平方千米
      return num * 0.000001;
    case 'sqm-wmu': // 平方米转万亩
      return num * 0.00000015;
    case 'sqm-whm2': // 平方米转万公顷
      return num * 0.00000001;
    case '%': // 百分比数
      return num * 100;
    case 'hm2-wmu': // 公顷转万亩
      return num * 15 / 10000;
    case 'km2-sqm': // 平方千米转平方米
      return num * 1000;
    case 'w-100m': // 万转亿
      return num * 0.0001
    default :
      return num;
  }
}

/**
 * 根据不同的单位处理小数
 * @param {string} unit 单位
 * @param {string|number} num 需要处理的数字（类型加string是因为会传带有千位分隔符的）
 **/
export function handlerDecimal(unit, num) {
  // 各单位省略几位小数
  let unitObj = {
    two: ['平方米', '亩', '公顷', '公里', '米', '%', '处/万公顷', '毫米', '元', '人/平方千米', '元/平方米'],
    four: ['万亩', '万公顷', '平方千米', '万元', '千米', '万立方米', '亿立方米', '万公斤', '万元/亩', '亿元', '万元/人', '万人'],
    zero: ['个', '人', '户', '件', '宗', '起', '处', '次'],
  };
  // 省略几位 (默认 2)
  let omitNum = 2;
  // 如果是4位，则重新赋值
  if (unitObj.four.indexOf(unit) > -1) omitNum = 4;
  // 如果不用小数
  if (unitObj.zero.indexOf(unit) > -1) omitNum = 0;
  // NaN
  if (isNaN(num) && getDataType(num) !== 'String') return 0;
  // 带有千位分隔符的
  if (isNaN(num) && getDataType(num) === 'String' && num.includes(',')) {
    let decimalPointIdx = num.indexOf('.'); // 小数点的下标
    let decimal = num.substr(decimalPointIdx); // 小数部分
    let integer = num.substr(0, decimalPointIdx); // 整数部分
    //
    return integer + Number(decimal).toFixed(omitNum).replace('0', '');
  }
  return Number(num).toFixed(omitNum);
}

// 冒泡排序
export function bubbleSort(arr){
   let len=arr.length;
   for(let i=0;i<len-1;i++){
     for(let j=0;j<len-1-i;j++){
        if(arr[j] < arr[j+1]){
          var temp = arr[j+1];
          arr[j+1] = arr[j];
          arr[j] = temp;
        }
     }
   }
   return arr;
}