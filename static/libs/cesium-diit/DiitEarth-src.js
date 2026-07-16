/*! Copyright by 火星科技 http://cesium.marsgis.cn  */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Cesium"), require("jQuery"), require("turf"), require("mapv"));
	else if(typeof define === 'function' && define.amd)
		define(["Cesium", "jQuery", "turf", "mapv"], factory);
	else if(typeof exports === 'object')
		exports["DiitEarth"] = factory(require("Cesium"), require("jQuery"), require("turf"), require("mapv"));
	else
		root["DiitEarth"] = factory(root["Cesium"], root["jQuery"], root["turf"], root["mapv"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_22__, __WEBPACK_EXTERNAL_MODULE_95__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 45);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.aroundPoint = exports.windingPoint = undefined;
exports.formatNum = formatNum;
exports.formatPositon = formatPositon;
exports.formatRectangle = formatRectangle;
exports.getMaxHeight = getMaxHeight;
exports.computePolygonHeightRange = computePolygonHeightRange;
exports.addPositionsHeight = addPositionsHeight;
exports.setPositionsHeight = setPositionsHeight;
exports.updateHeightForClampToGround = updateHeightForClampToGround;
exports.getCurrentMousePosition = getCurrentMousePosition;
exports.getCenter = getCenter;
exports.getExtent = getExtent;
exports.getCameraView = getCameraView;
exports.centerOfMass = centerOfMass;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _turf = __webpack_require__(22);

var turf = _interopRequireWildcard(_turf);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//格式化 数字 小数位数
function formatNum(num, digits) {
    //var pow = Math.pow(10, (digits === undefined ? 6 : digits));
    //return Math.round(num * pow) / pow;
    return Number(num.toFixed(digits || 0));
}

//格式化坐标点为可显示的可理解格式（如：经度x:123.345345、纬度y:31.324324、高度z:123.1）。
function formatPositon(position) {
    var carto = Cesium.Cartographic.fromCartesian(position);
    var result = {};
    result.y = formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
    result.x = formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
    result.z = formatNum(carto.height, 2);
    return result;
}

//格式化Rectangle
function formatRectangle(rectangle) {
    var west = formatNum(Cesium.Math.toDegrees(rectangle.west), 6);
    var east = formatNum(Cesium.Math.toDegrees(rectangle.east), 6);
    var north = formatNum(Cesium.Math.toDegrees(rectangle.north), 6);
    var south = formatNum(Cesium.Math.toDegrees(rectangle.south), 6);

    return { xmin: west, xmax: east, ymin: south, ymax: north };
}

/**
 * 获取坐标数组中最高高程值
 * @param {Array} positions Array<Cartesian3> 笛卡尔坐标数组
 * @param {Number} defaultVal 默认高程值
 */
function getMaxHeight(positions, defaultVal) {
    if (defaultVal == null) defaultVal = 0;

    var maxHeight = defaultVal;
    if (positions == null || positions.length == 0) return maxHeight;

    for (var i = 0; i < positions.length; i++) {
        var tempCarto = Cesium.Cartographic.fromCartesian(positions[i]);
        if (tempCarto.height > maxHeight) {
            maxHeight = tempCarto.height;
        }
    }
    return formatNum(maxHeight, 2);
}

//计算面内最大、最小高度值
function computePolygonHeightRange(pos, scene) {
    var positions = [];
    for (var i = 0; i < pos.length; i++) {
        positions.push(pos[i].clone());
    }

    var maxHeight = 0;
    var minHeight = 9999;

    var granularity = Math.PI / Math.pow(2, 11) / 64;
    var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
        positions: positions,
        vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: granularity
    });
    var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);

    var i0, i1, i2;
    var height1, height2, height3;
    var cartesian;

    for (var i = 0; i < geom.indices.length; i += 3) {
        i0 = geom.indices[i];
        i1 = geom.indices[i + 1];
        i2 = geom.indices[i + 2];

        cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i0 * 3], geom.attributes.position.values[i0 * 3 + 1], geom.attributes.position.values[i0 * 3 + 2]);
        height1 = scene.globe.getHeight(Cesium.Cartographic.fromCartesian(cartesian));

        if (minHeight > height1) minHeight = height1;
        if (maxHeight < height1) maxHeight = height1;

        cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i1 * 3], geom.attributes.position.values[i1 * 3 + 1], geom.attributes.position.values[i1 * 3 + 2]);
        height2 = scene.globe.getHeight(Cesium.Cartographic.fromCartesian(cartesian));

        if (minHeight > height2) minHeight = height2;
        if (maxHeight < height2) maxHeight = height2;

        cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i2 * 3], geom.attributes.position.values[i2 * 3 + 1], geom.attributes.position.values[i2 * 3 + 2]);
        height3 = scene.globe.getHeight(Cesium.Cartographic.fromCartesian(cartesian));

        if (minHeight > height3) minHeight = height3;
        if (maxHeight < height3) maxHeight = height3;
    }

    return {
        maxHeight: maxHeight,
        minHeight: minHeight
    };
}

/**
* 在坐标基础海拔上增加指定的海拔高度值
* @param {Array} positions Cartesian3类型的数组
* @param {Number} height 高度值
* @return {Array} Cartesian3类型的数组
*/
function addPositionsHeight(positions, addHeight) {
    addHeight = Number(addHeight) || 0;

    if (isNaN(addHeight) || addHeight == 0) return positions;

    if (positions instanceof Array) {
        var arr = [];
        for (var i = 0, len = positions.length; i < len; i++) {
            var car = Cesium.Cartographic.fromCartesian(positions[i]);
            var point = Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, car.height + addHeight);
            arr.push(point);
        }
        return arr;
    } else {
        var car = Cesium.Cartographic.fromCartesian(positions);
        return Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, car.height + addHeight);
    }
}

/**
* 设置坐标中海拔高度为指定的高度值
* @param {Array} positions Cartesian3类型的数组
* @param {Number} height 高度值
* @return {Array} Cartesian3类型的数组
*/
function setPositionsHeight(positions, height) {
    height = Number(height) || 0;

    if (positions instanceof Array) {
        var arr = [];
        for (var i = 0, len = positions.length; i < len; i++) {
            var car = Cesium.Cartographic.fromCartesian(positions[i]);
            var point = Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, height);
            arr.push(point);
        }
        return arr;
    } else {
        var car = Cesium.Cartographic.fromCartesian(positions);
        return Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, height);
    }
}

/**
* 设置坐标中海拔高度为贴地或贴模型的高度（sampleHeight需要数据在视域内） 
*/
function updateHeightForClampToGround(viewer, position) {
    var carto = Cesium.Cartographic.fromCartesian(position);
    var heightTerrain = viewer.scene.globe.getHeight(carto) || 0; //地形高度
    var heightTiles = viewer.scene.sampleHeight(carto) || 0; //模型高度
    var _heightNew = heightTiles > heightTerrain ? heightTiles : heightTerrain;
    if (_heightNew != null && _heightNew > 0) {
        var positionNew = Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, _heightNew);
        return positionNew;
    }

    return position;
}

function hasPickedModel(pickedObject, noPickEntity) {
    if (Cesium.defined(pickedObject.id)) {
        //entity 
        var entity = pickedObject.id;
        if (entity._noMousePosition) return false; //排除标识不拾取的对象
        if (noPickEntity && entity == noPickEntity) return false;
    }

    if (Cesium.defined(pickedObject.primitive)) {
        //primitive
        var primitive = pickedObject.primitive;
        if (primitive._noMousePosition) return false; //排除标识不拾取的对象
        if (noPickEntity && primitive == noPickEntity) return false;
    }

    return true;
}

/**
 * 获取鼠标当前的屏幕坐标位置的三维Cesium坐标
 * @param {Cesium.Scene} scene 
 * @param {Cesium.Cartesian2} position 二维屏幕坐标位置
 * @param {Cesium.Entity} noPickEntity 排除的对象（主要用于绘制中，排除对自己本身的拾取）
 */
function getCurrentMousePosition(scene, position, noPickEntity) {
    var cartesian;

    //在模型上提取坐标  
    var pickedObject = scene.pick(position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
        //pickPositionSupported :判断是否支持深度拾取,不支持时无法进行鼠标交互绘制

        if (hasPickedModel(pickedObject, noPickEntity)) {
            var cartesian = scene.pickPosition(position);
            if (Cesium.defined(cartesian)) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                if (cartographic.height >= 0) return cartesian;

                //不是entity时，支持3dtiles地下
                if (!Cesium.defined(pickedObject.id) && cartographic.height >= -500) return cartesian;
            }
        }
    }

    //测试scene.pickPosition和globe.pick的适用场景 https://zhuanlan.zhihu.com/p/44767866
    //1. globe.pick的结果相对稳定准确，不论地形深度检测开启与否，不论加载的是默认地形还是别的地形数据；
    //2. scene.pickPosition只有在开启地形深度检测，且不使用默认地形时是准确的。
    //注意点： 1. globe.pick只能求交地形； 2. scene.pickPosition不仅可以求交地形，还可以求交除地形以外其他所有写深度的物体。

    //提取鼠标点的地理坐标 
    if (scene.mode === Cesium.SceneMode.SCENE3D) {
        //三维模式下
        var pickRay = scene.camera.getPickRay(position);
        cartesian = scene.globe.pick(pickRay, scene);
    } else {
        //二维模式下
        cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
    }

    if (Cesium.defined(cartesian)) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        // console.log(cartographic.height);
        if (cartographic.height < -1000) return null; //屏蔽无效值
    }

    return cartesian;
}

//提取地球中心点坐标
function getCenter(viewer, isToWgs) {
    var scene = viewer.scene;
    var target = pickCenterPoint(scene);
    var bestTarget = target;
    if (!bestTarget) {
        var globe = scene.globe;
        var carto = scene.camera.positionCartographic.clone();
        var height = globe.getHeight(carto);
        carto.height = height || 0;
        bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);
    }

    var result = formatPositon(bestTarget);
    if (isToWgs) result = viewer.mars.point2wgs(result); //坐标转换为wgs

    // 获取地球中心点世界位置  与  摄像机的世界位置  之间的距离
    var distance = Cesium.Cartesian3.distance(bestTarget, viewer.scene.camera.positionWC);
    result.cameraZ = distance;

    return result;
}

function pickCenterPoint(scene) {
    var canvas = scene.canvas;
    var center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);

    var ray = scene.camera.getPickRay(center);
    var target = scene.globe.pick(ray, scene);
    return target || scene.camera.pickEllipsoid(center);
}

//export function getLevel(viewer) {
//    var _layers = viewer.imageryLayers._layers;
//    if (_layers.length == 0) return -1;

//    var _imageryCache = _layers[0]._imageryCache;
//    var maxLevel = 0;
//    for (var i in _imageryCache) {
//        var imagery = _imageryCache[i];
//        if (imagery.level > maxLevel)
//            maxLevel = imagery.level;
//    } 
//    return maxLevel;
//}


//提取地球视域边界
function getExtent(viewer, isToWgs) {
    var rectangle = viewer.camera.computeViewRectangle();
    var extent = formatRectangle(rectangle); // 范围对象

    if (isToWgs) {
        //坐标转换为wgs
        var pt1 = viewer.mars.point2wgs({ x: extent.xmin, y: extent.ymin });
        extent.xmin = pt1.x;
        extent.ymin = pt1.y;

        var pt2 = viewer.mars.point2wgs({ x: extent.xmax, y: extent.ymax });
        extent.xmax = pt2.x;
        extent.ymax = pt2.y;
    }
    //交换
    if (extent.xmax < extent.xmin) {
        var temp = extent.xmax;
        extent.xmax = extent.xmin;
        extent.xmin = temp;
    }
    if (extent.ymax < extent.ymin) {
        var temp = extent.ymax;
        extent.ymax = extent.ymin;
        extent.ymin = temp;
    }

    return extent;
}

//提取相机视角范围参数 
function getCameraView(viewer, isToWgs) {
    var camera = viewer.camera;
    var position = camera.positionCartographic;

    var bookmark = {};
    bookmark.y = formatNum(Cesium.Math.toDegrees(position.latitude), 6);
    bookmark.x = formatNum(Cesium.Math.toDegrees(position.longitude), 6);
    bookmark.z = formatNum(position.height, 2);
    bookmark.heading = formatNum(Cesium.Math.toDegrees(camera.heading || -90), 1);
    bookmark.pitch = formatNum(Cesium.Math.toDegrees(camera.pitch || 0), 1);
    bookmark.roll = formatNum(Cesium.Math.toDegrees(camera.roll || 0), 1);

    if (isToWgs) bookmark = viewer.mars.point2wgs(bookmark); //坐标转换为wgs

    return bookmark;
}

//Turf求面的中心点 Cartographic
function centerOfMass(positions, height) {
    if (height == null) {
        height = getMaxHeight(positions);
    }

    var coordinates = Util.cartesians2lonlats(positions);
    coordinates.push(coordinates[0]);

    var center = turf.centerOfMass(turf.polygon([coordinates]));
    var ptcenter = Cesium.Cartesian3.fromDegrees(center.geometry.coordinates[0], center.geometry.coordinates[1], height);

    return ptcenter;
}

//绕点 环绕飞行
var windingPoint = exports.windingPoint = {
    isStart: false,
    viewer: null,
    start: function start(viewer, point) {
        this.viewer = viewer;
        if (point && point instanceof Cesium.Cartesian3) {
            this.position = point;
        } else {
            if (!point) point = getCenter(viewer);
            this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);
        }

        this.distance = point.distance || Cesium.Cartesian3.distance(this.position, viewer.camera.positionWC); // 给定相机距离点多少距离飞行 
        this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

        this.time = viewer.clock.currentTime.clone();
        this.heading = viewer.camera.heading; // 相机的当前heading
        this.pitch = viewer.camera.pitch;

        this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
        this.isStart = true;
    },
    clock_onTickHandler: function clock_onTickHandler(e) {
        var delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.time); // 当前已经过去的时间，单位 秒
        var heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;

        this.viewer.scene.camera.setView({
            destination: this.position, // 点的坐标
            orientation: {
                heading: heading,
                pitch: this.pitch
            }
        });
        this.viewer.scene.camera.moveBackward(this.distance);
    },
    stop: function stop() {
        if (!this.isStart) return;

        if (this.viewer) this.viewer.clock.onTick.removeEventListener(this.clock_onTickHandler, this);
        this.isStart = false;
    }
};

//固定点 向四周旋转
var aroundPoint = exports.aroundPoint = {
    isStart: false,
    viewer: null,
    start: function start(viewer, point) {
        this.viewer = viewer;
        if (point && point instanceof Cesium.Cartesian3) {
            this.position = point;
        } else {
            if (!point) point = getCenter(viewer);
            this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);
        }

        this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

        this.time = viewer.clock.currentTime.clone();
        this.heading = viewer.camera.heading; // 相机的当前heading
        this.pitch = viewer.camera.pitch;

        this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
        this.isStart = true;
    },
    clock_onTickHandler: function clock_onTickHandler(e) {
        // 当前已经过去的时间，单位s
        var delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.time);
        var heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;
        this.viewer.scene.camera.setView({
            orientation: {
                heading: heading,
                pitch: this.pitch
            }
        });
    },
    stop: function stop() {
        if (!this.isStart) return;

        if (this.viewer) this.viewer.clock.onTick.removeEventListener(this.clock_onTickHandler, this);
        this.isStart = false;
    }
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.cancelFn = exports.requestFn = exports.emptyImageUrl = exports.isArray = exports.lastId = exports.create = exports.freeze = undefined;
exports.extend = extend;
exports.bind = bind;
exports.stamp = stamp;
exports.throttle = throttle;
exports.wrapNum = wrapNum;
exports.falseFn = falseFn;
exports.formatNum = formatNum;
exports.trim = trim;
exports.splitWords = splitWords;
exports.setOptions = setOptions;
exports.getParamString = getParamString;
exports.template = template;
exports.indexOf = indexOf;
exports.requestAnimFrame = requestAnimFrame;
exports.cancelAnimFrame = cancelAnimFrame;
exports.removeGeoJsonDefVal = removeGeoJsonDefVal;
exports.addGeoJsonDefVal = addGeoJsonDefVal;
exports.cartesians2lonlats = cartesians2lonlats;
exports.cartesian2lonlat = cartesian2lonlat;
exports.getPositionByGeoJSON = getPositionByGeoJSON;
exports.lonlat2cartesian = lonlat2cartesian;
exports.lonlats2cartesians = lonlats2cartesians;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _util = __webpack_require__(4);

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var freeze = exports.freeze = Object.freeze;
Object.freeze = function (obj) {
    return obj;
};

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
function extend(dest) {
    var i, j, len, src;

    for (j = 1, len = arguments.length; j < len; j++) {
        src = arguments[j];
        for (i in src) {
            dest[i] = src[i];
        }
    }
    return dest;
}

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
var create = exports.create = Object.create || function () {
    function F() {}
    return function (proto) {
        F.prototype = proto;
        return new F();
    };
}();

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
function bind(fn, obj) {
    var slice = Array.prototype.slice;

    if (fn.bind) {
        return fn.bind.apply(fn, slice.call(arguments, 1));
    }

    var args = slice.call(arguments, 2);

    return function () {
        return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
    };
}

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
var lastId = exports.lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
function stamp(obj) {
    /*eslint-disable */
    obj._leaflet_id = obj._leaflet_id || (exports.lastId = lastId += 1);
    return obj._leaflet_id;
    /* eslint-enable */
}

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
function throttle(fn, time, context) {
    var lock, args, wrapperFn, later;

    later = function later() {
        // reset lock and call if queued
        lock = false;
        if (args) {
            wrapperFn.apply(context, args);
            args = false;
        }
    };

    wrapperFn = function wrapperFn() {
        if (lock) {
            // called too soon, queue to call later
            args = arguments;
        } else {
            // call and lock until later
            fn.apply(context, arguments);
            setTimeout(later, time);
            lock = true;
        }
    };

    return wrapperFn;
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
function wrapNum(x, range, includeMax) {
    var max = range[1],
        min = range[0],
        d = max - min;
    return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
}

// @function falseFn(): Function
// Returns a function which always returns `false`.
function falseFn() {
    return false;
}

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
function formatNum(num, digits) {
    //var pow = Math.pow(10, (digits === undefined ? 6 : digits));
    //return Math.round(num * pow) / pow;
    return Number(num.toFixed(digits || 0));
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
function trim(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
function splitWords(str) {
    return trim(str).split(/\s+/);
}

// @function setOptions(obj: Object, options: Object): Object
// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
function setOptions(obj, options) {
    if (!obj.hasOwnProperty('options')) {
        obj.options = obj.options ? create(obj.options) : {};
    }
    for (var i in options) {
        obj.options[i] = options[i];
    }
    return obj.options;
}

// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
// be appended at the end. If `uppercase` is `true`, the parameter names will
// be uppercased (e.g. `'?A=foo&B=bar'`)
function getParamString(obj, existingUrl, uppercase) {
    var params = [];
    for (var i in obj) {
        params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
}

var templateRe = /\{ *([\w_-]+) *\}/g;

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
function template(str, data) {
    return str.replace(templateRe, function (str, key) {
        var value = data[key];

        if (value === undefined) {
            throw new Error('No value provided for variable ' + str);
        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
}

// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
var isArray = exports.isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

// @function indexOf(array: Array, el: Object): Number
// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
function indexOf(array, el) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === el) {
            return i;
        }
    }
    return -1;
}

// @property emptyImageUrl: String
// Data URI string containing a base64-encoded empty GIF image.
// Used as a hack to free memory from unused images on WebKit-powered
// mobile devices (by setting image `src` to this string).
var emptyImageUrl = exports.emptyImageUrl = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

function getPrefixed(name) {
    return window['webkit' + name] || window['moz' + name] || window['ms' + name];
}

var lastTime = 0;

// fallback for IE 7-8
function timeoutDefer(fn) {
    var time = +new Date(),
        timeToCall = Math.max(0, 16 - (time - lastTime));

    lastTime = time + timeToCall;
    return window.setTimeout(fn, timeToCall);
}

var requestFn = exports.requestFn = window.requestAnimationFrame || getPrefixed('RequestAnimationFrame') || timeoutDefer;
var cancelFn = exports.cancelFn = window.cancelAnimationFrame || getPrefixed('CancelAnimationFrame') || getPrefixed('CancelRequestAnimationFrame') || function (id) {
    window.clearTimeout(id);
};

// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
// `context` if given. When `immediate` is set, `fn` is called immediately if
// the browser doesn't have native support for
// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
function requestAnimFrame(fn, context, immediate) {
    if (immediate && requestFn === timeoutDefer) {
        fn.call(context);
    } else {
        return requestFn.call(window, bind(fn, context));
    }
}

// @function cancelAnimFrame(id: Number): undefined
// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
function cancelAnimFrame(id) {
    if (id) {
        cancelFn.call(window, id);
    }
}

//从plot的 标号默认值F12打印 拷贝，方便读取
var configDefval = { "label": { "edittype": "label", "name": "文字", "style": { "text": "文字", "color": "#ffffff", "opacity": 1, "font_family": "楷体", "font_size": 30, "border": true, "border_color": "#000000", "border_width": 3, "background": false, "background_color": "#000000", "background_opacity": 0.5, "font_weight": "normal", "font_style": "normal", "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "point": { "edittype": "point", "name": "点标记", "style": { "pixelSize": 10, "color": "#3388ff", "opacity": 1, "outline": true, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "outlineWidth": 2, "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "imagepoint": { "edittype": "imagepoint", "name": "图标点标记", "style": { "image": "", "opacity": 1, "scale": 1, "rotation": 0, "scaleByDistance": false, "scaleByDistance_far": 1000000, "scaleByDistance_farValue": 0.1, "scaleByDistance_near": 1000, "scaleByDistance_nearValue": 1, "distanceDisplayCondition": false, "distanceDisplayCondition_far": 10000, "distanceDisplayCondition_near": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "model": { "edittype": "model", "name": "模型", "style": { "modelUrl": "", "scale": 1, "heading": 0, "pitch": 0, "roll": 0, "fill": false, "color": "#3388ff", "opacity": 1, "silhouette": false, "silhouetteColor": "#ffffff", "silhouetteSize": 2, "silhouetteAlpha": 0.8 }, "attr": { "id": "", "name": "", "remark": "" } }, "polyline": { "edittype": "polyline", "name": "线", "position": { "minCount": 2 }, "style": { "lineType": "solid", "color": "#3388ff", "width": 4, "clampToGround": false, "outline": false, "outlineColor": "#ffffff", "outlineWidth": 2, "opacity": 1, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "polylineVolume": { "edittype": "polylineVolume", "name": "管道线", "position": { "height": true, "minCount": 2 }, "style": { "color": "#00FF00", "radius": 10, "shape": "pipeline", "outline": false, "outlineColor": "#ffffff", "opacity": 1 }, "attr": { "id": "", "name": "", "remark": "" } }, "polygon": { "edittype": "polygon", "name": "面", "position": { "height": true, "minCount": 3 }, "style": { "fill": true, "color": "#3388ff", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "clampToGround": false, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "polygon_clampToGround": { "edittype": "polygon_clampToGround", "name": "贴地面", "position": { "height": false, "minCount": 3 }, "style": { "color": "#ffff00", "opacity": 0.6, "clampToGround": true, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedPolygon": { "edittype": "extrudedPolygon", "name": "拉伸面", "position": { "height": true, "minCount": 3 }, "style": { "fill": true, "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "extrudedHeight": 100, "perPositionHeight": true, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangle": { "edittype": "rectangle", "name": "矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "height": 0, "fill": true, "color": "#3388ff", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "rotation": 0, "clampToGround": false, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangle_clampToGround": { "edittype": "rectangle_clampToGround", "name": "贴地矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "color": "#ffff00", "opacity": 0.6, "rotation": 0, "clampToGround": true, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "rectangleImg": { "edittype": "rectangleImg", "name": "贴地图片", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "image": "", "opacity": 1, "rotation": 0, "clampToGround": true, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedRectangle": { "edittype": "extrudedRectangle", "name": "拉伸矩形", "position": { "height": false, "minCount": 2, "maxCount": 2 }, "style": { "extrudedHeight": 40, "height": 0, "fill": true, "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "rotation": 0, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipse": { "edittype": "ellipse", "name": "椭圆", "position": { "height": false }, "style": { "semiMinorAxis": 200, "semiMajorAxis": 200, "height": 0, "fill": true, "color": "#3388ff", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "rotation": 0, "clampToGround": false, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipse_clampToGround": { "edittype": "ellipse_clampToGround", "name": "椭圆", "position": { "height": false }, "style": { "semiMinorAxis": 200, "semiMajorAxis": 200, "color": "#ffff00", "opacity": 0.6, "rotation": 0, "clampToGround": true, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "extrudedEllipse": { "edittype": "extrudedEllipse", "name": "圆柱体", "position": { "height": false }, "style": { "semiMinorAxis": 200, "semiMajorAxis": 200, "extrudedHeight": 200, "height": 0, "fill": true, "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6, "rotation": 0, "zIndex": 0 }, "attr": { "id": "", "name": "", "remark": "" } }, "ellipsoid": { "edittype": "ellipsoid", "name": "球体", "style": { "extentRadii": 200, "widthRadii": 200, "heightRadii": 200, "fill": true, "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6 }, "attr": { "id": "", "name": "", "remark": "" } }, "wall": { "edittype": "wall", "name": "墙体", "position": { "height": true, "minCount": 2 }, "style": { "extrudedHeight": 40, "fill": true, "color": "#00FF00", "opacity": 0.6, "outline": true, "outlineWidth": 1, "outlineColor": "#ffffff", "outlineOpacity": 0.6 }, "attr": { "id": "", "name": "", "remark": "" } } };

//剔除与默认值相同的值
function removeGeoJsonDefVal(geojson) {
    if (!geojson.properties || !geojson.properties.type) return geojson;

    var type = geojson.properties.edittype || geojson.properties.type;
    var def = configDefval[type];
    if (!def) return geojson;

    var newgeojson = util.clone(geojson);
    if (geojson.properties.style) {
        var newstyle = {};
        for (var i in geojson.properties.style) {
            var val = geojson.properties.style[i];
            if (val == null) continue;

            var valDef = def.style[i];
            if (valDef === val) continue;
            newstyle[i] = val;
        }
        newgeojson.properties.style = newstyle;
    }

    if (geojson.properties.attr) {
        var newattr = {};
        for (var i in geojson.properties.attr) {
            var val = geojson.properties.attr[i];
            if (val == null) continue;

            var valDef = def.attr[i];
            if (valDef === val) continue;

            newattr[i] = val;
        }
        newgeojson.properties.attr = newattr;
    }

    return newgeojson;
}

function addGeoJsonDefVal(properties) {
    //赋默认值 
    var def = configDefval[properties.edittype || properties.type];
    if (def) {
        properties.style = properties.style || {};
        for (var key in def.style) {
            var val = properties.style[key];
            if (val != null) continue;

            properties.style[key] = def.style[key];
        }

        properties.attr = properties.attr || {};
        for (var key in def.attr) {
            var val = properties.attr[key];
            if (val != null) continue;

            properties.attr[key] = def.attr[key];
        }
    }
    return properties;
}

//数组，cesium坐标 转 经纬度坐标【用于转geojson】
function cartesians2lonlats(positions) {
    var coordinates = [];
    for (var i = 0, len = positions.length; i < len; i++) {
        var point = cartesian2lonlat(positions[i]);
        coordinates.push(point);
    }
    return coordinates;
}

//cesium坐标 转 经纬度坐标【用于转geojson】
function cartesian2lonlat(cartesian) {
    var carto = Cesium.Cartographic.fromCartesian(cartesian);
    if (carto == null) return {};

    var x = formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
    var y = formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
    var z = formatNum(carto.height, 2);

    return [x, y, z];
}

//geojson转entity
function getPositionByGeoJSON(geojson, defHeight) {
    var geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
        coords = geometry ? geometry.coordinates : null;

    if (!coords && !geometry) {
        return null;
    }

    switch (geometry.type) {
        case 'Point':
            return lonlat2cartesian(coords, defHeight);
        case 'MultiPoint':
        case 'LineString':
            return lonlats2cartesians(coords, defHeight);

        case 'MultiLineString':
        case 'Polygon':
            return lonlats2cartesians(coords[0], defHeight);
        case 'MultiPolygon':
            return lonlats2cartesians(coords[0][0], defHeight);
        default:
            throw new Error('Invalid GeoJSON object.');
    }
}

//经纬度坐标转cesium坐标
function lonlat2cartesian(coord, defHeight) {
    return Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2] || defHeight || 0);
}

//数组，经纬度坐标转cesium坐标
function lonlats2cartesians(coords, defHeight) {
    var arr = [];
    for (var i = 0, len = coords.length; i < len; i++) {
        var item = coords[i];
        if (isArray(item[0])) arr.push(lonlats2cartesians(item, defHeight));else arr.push(lonlat2cartesian(item, defHeight));
    }
    return arr;
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.message = undefined;
exports.Tooltip = Tooltip;

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//样式文件在map.css
var message = exports.message = {
    draw: {
        point: {
            start: '单击 完成绘制'
        },
        polyline: { //线面
            start: '单击 开始绘制',
            cont: '单击增加点，右击删除点',
            end: '单击增加点，右击删除点<br/>双击完成绘制',
            end2: '单击完成绘制'
        }
    },
    edit: {
        start: '单击后 激活编辑<br/>右击 单击菜单删除',
        end: '释放后 完成修改'
    },
    dragger: {
        def: '拖动 修改位置', //默认  
        addMidPoint: '拖动 增加点',
        moveHeight: '拖动 修改高度',
        editRadius: '拖动 修改半径',
        editHeading: '拖动 修改方向',
        editScale: '拖动 修改缩放比例'
    },
    del: {
        def: '<br/>右击 删除该点',
        min: '无法删除，点数量不能少于'
    }
};

function Tooltip(frameDiv) {
    var div = document.createElement('DIV');
    div.className = "draw-tooltip right";

    var arrow = document.createElement('DIV');
    arrow.className = "draw-tooltip-arrow";
    div.appendChild(arrow);

    var title = document.createElement('DIV');
    title.className = "draw-tooltip-inner";
    div.appendChild(title);

    this._div = div;
    this._title = title;

    // add to frame div and display coordinates
    frameDiv.appendChild(div);

    //鼠标的移入
    (0, _jquery2.default)(".draw-tooltip").mouseover(function () {
        (0, _jquery2.default)(this).hide();
    });
}

Tooltip.prototype.setVisible = function (visible) {
    this._div.style.display = visible ? 'block' : 'none';
};

Tooltip.prototype.showAt = function (position, message) {
    if (position && message) {
        this.setVisible(true);

        this._title.innerHTML = message;
        this._div.style.top = position.y - this._div.clientHeight / 2 + "px";

        //left css时
        //this._div.style.left = (position.x - this._div.clientWidth - 30) + "px"; 

        //right css时
        this._div.style.left = position.x + 30 + "px";
    } else {
        this.setVisible(false);
    }
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isNumber = isNumber;
exports.isString = isString;
exports.alert = alert;
exports.msg = msg;
exports.getRequest = getRequest;
exports.getRequestByName = getRequestByName;
exports.clone = clone;
exports.template = template;
exports.isPCBroswer = isPCBroswer;
exports.getExplorerInfo = getExplorerInfo;
exports.webglreport = webglreport;
exports.terrainPolyline = terrainPolyline;
exports.getProxyUrl = getProxyUrl;
exports.getEllipsoidTerrain = getEllipsoidTerrain;
exports.getTerrainProvider = getTerrainProvider;
exports.createModel = createModel;
exports.formatDegree = formatDegree;
exports.getLinkedPointList = getLinkedPointList;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isNumber(obj) {
    return typeof obj == 'number' && obj.constructor == Number;
}

function isString(str) {
    return typeof str == 'string' && str.constructor == String;
}

function alert(msg, title) {
    if (window.haoutil && window.haoutil.alert) //此方法需要引用haoutil 
        window.haoutil.alert(msg, title);else if (window.layer) //此方法需要引用layer.js
        layer.alert(msg, {
            title: title || '提示',
            skin: 'layui-layer-lan layer-mars-dialog',
            closeBtn: 0,
            anim: 0
        });else alert(msg);
};

function msg(msg) {
    if (window.haoutil && window.haoutil.msg) //此方法需要引用haoutil 
        window.haoutil.msg(msg);else if (window.toastr) //此方法需要引用toastr 
        toastr.info(msg);else if (window.layer) layer.msg(msg); //此方法需要引用layer.js
    else alert(msg);
};

//url参数获取
function getRequest() {
    var url = location.search; //获取url中"?"符后的字串   
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
function getRequestByName(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]);
    return null;
}

function clone(obj, level) {
    if (level == null) level = 5; //避免死循环，拷贝的层级最大深度

    if (null == obj || "object" != (typeof obj === 'undefined' ? 'undefined' : _typeof(obj))) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array && level >= 0) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i], level - 1);
        }
        return copy;
    }

    // Handle Object
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && level >= 0) {
        var copy = {};
        for (var attr in obj) {
            if (typeof attr === 'function') continue;
            if (attr == "_layer" || attr == "_layers" || attr == "_parent") continue;

            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr], level - 1);
        }
        return copy;
    }
    return obj;
}

function template(str, data) {
    if (str == null) return str;

    for (var col in data) {
        var showval = data[col];
        if (showval == null || showval == 'Null' || showval == 'Unknown') showval = "";

        str = str.replace(new RegExp('{' + col + '}', "gm"), showval);
    }
    return str;
}

function isPCBroswer() {
    var sUserAgent = navigator.userAgent.toLowerCase();

    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone/i) == "iphone";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
        return false;
    } else {
        return true;
    }
}

//获取浏览器类型及版本
function getExplorerInfo() {
    var explorer = window.navigator.userAgent.toLowerCase();
    //ie 
    if (explorer.indexOf("msie") >= 0) {
        var ver = Number(explorer.match(/msie ([\d]+)/)[1]);
        return { type: "IE", version: ver };
    }
    //firefox 
    else if (explorer.indexOf("firefox") >= 0) {
            var ver = Number(explorer.match(/firefox\/([\d]+)/)[1]);
            return { type: "Firefox", version: ver };
        }
        //Chrome
        else if (explorer.indexOf("chrome") >= 0) {
                var ver = Number(explorer.match(/chrome\/([\d]+)/)[1]);
                return { type: "Chrome", version: ver };
            }
            //Opera
            else if (explorer.indexOf("opera") >= 0) {
                    var ver = Number(explorer.match(/opera.([\d]+)/)[1]);
                    return { type: "Opera", version: ver };
                }
                //Safari
                else if (explorer.indexOf("Safari") >= 0) {
                        var ver = Number(explorer.match(/version\/([\d]+)/)[1]);
                        return { type: "Safari", version: ver };
                    }
    return { type: explorer, version: -1 };
}

//检测浏览器webgl支持
function webglreport() {
    var exinfo = getExplorerInfo();
    if (exinfo.type == "IE" && exinfo.version < 11) {
        return false;
    }

    try {
        var glContext;
        var canvas = document.createElement('canvas');
        var requestWebgl2 = typeof WebGL2RenderingContext !== 'undefined';
        if (requestWebgl2) {
            glContext = canvas.getContext('webgl2') || canvas.getContext('experimental-webgl2') || undefined;
        }
        if (glContext == null) {
            glContext = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || undefined;
        }
        if (glContext == null) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
}

//计算贴地路线
function terrainPolyline(params) {
    var viewer = params.viewer;
    var positions = params.positions;
    if (positions == null || positions.length == 0) {
        if (params.calback) params.calback(positions);
        return;
    }

    var flatPositions = Cesium.PolylinePipeline.generateArc({
        positions: positions,
        granularity: params.granularity || 0.00001
    });

    var cartographicArray = [];
    var ellipsoid = viewer.scene.globe.ellipsoid;
    for (var i = 0; i < flatPositions.length; i += 3) {
        var cartesian = Cesium.Cartesian3.unpack(flatPositions, i);
        cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian));
    }

    //用于缺少地形数据时，赋值的高度
    var tempHeight = Cesium.Cartographic.fromCartesian(positions[0]).height;

    Cesium.when(Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, cartographicArray), function (samples) {
        var noHeight = false;
        var offset = params.offset || 2; //增高高度，便于可视

        for (var i = 0; i < samples.length; ++i) {
            if (samples[i].height == null) {
                noHeight = true;
                samples[i].height = tempHeight;
            } else {
                samples[i].height = offset + samples[i].height * viewer.scene._terrainExaggeration;
            }
        }

        var raisedPositions = ellipsoid.cartographicArrayToCartesianArray(samples);
        if (params.calback) params.calback(raisedPositions, noHeight);else if (positions.setValue) positions.setValue(raisedPositions);
    });
}

function getProxyUrl(config) {
    if (!config.proxy || !config.url) return config;
    if (config.url instanceof Cesium.Resource) return config;

    var opts = {};
    for (var key in config) {
        opts[key] = config[key];
    }
    opts.url = new Cesium.Resource({
        url: opts.url,
        proxy: new Cesium.DefaultProxy(opts.proxy)
    });

    return opts;
}

//地形构造
var _ellipsoid = new Cesium.EllipsoidTerrainProvider({
    ellipsoid: Cesium.Ellipsoid.WGS84
});
function getEllipsoidTerrain() {
    return _ellipsoid;
}
function getTerrainProvider(cfg) {
    if (!cfg.hasOwnProperty("requestWaterMask")) cfg.requestWaterMask = true;
    if (!cfg.hasOwnProperty("requestVertexNormals")) cfg.requestVertexNormals = true;

    var terrainProvider;

    if (cfg.type == "ion" || cfg.url == "ion" || cfg.url == "" || cfg.url == null) {
        terrainProvider = new Cesium.CesiumTerrainProvider({
            url: Cesium.IonResource.fromAssetId(1)
        });
    } else if (cfg.type == "ellipsoid" || cfg.url == "ellipsoid") {
        terrainProvider = _ellipsoid;
    } else if (cfg.type == "gee") {
        //谷歌地球地形服务
        terrainProvider = new Cesium.GoogleEarthEnterpriseTerrainProvider({
            metadata: new Cesium.GoogleEarthEnterpriseMetadata(getProxyUrl(cfg))
        });
    } else {
        terrainProvider = new Cesium.CesiumTerrainProvider(getProxyUrl(cfg));
    }
    return terrainProvider;
}

//创建模型
function createModel(cfg, viewer) {
    cfg = viewer.mars.point2map(cfg); //转换坐标系

    var position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0);

    var heading = Cesium.Math.toRadians(cfg.heading || 0);
    var pitch = Cesium.Math.toRadians(cfg.pitch || 0);
    var roll = Cesium.Math.toRadians(cfg.roll || 0);
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

    var converter = cfg.converter || Cesium.Transforms.eastNorthUpToFixedFrame;
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr, viewer.scene.globe.ellipsoid, converter);

    var model = viewer.entities.add({
        name: cfg.name || "",
        position: position,
        orientation: orientation,
        model: cfg,
        tooltip: cfg.tooltip,
        popup: cfg.popup
    });
    return model;
}

function formatDegree(value) {
    value = Math.abs(value);
    var v1 = Math.floor(value); //度  
    var v2 = Math.floor((value - v1) * 60); //分  
    var v3 = Math.round((value - v1) * 3600 % 60); //秒  
    return v1 + '° ' + v2 + '\'  ' + v3 + '"';
};

/**
 * 计算曲线链路的点集（a点到b点的，空中曲线）
 * @param startPoint 开始节点
 * @param endPoint 结束节点
 * @param angularityFactor 曲率
 * @param numOfSingleLine 点集数量
 * @returns {Array}
 */
function getLinkedPointList(startPoint, endPoint, angularityFactor, numOfSingleLine) {
    var result = [];

    var startPosition = Cesium.Cartographic.fromCartesian(startPoint);
    var endPosition = Cesium.Cartographic.fromCartesian(endPoint);

    var startLon = startPosition.longitude * 180 / Math.PI;
    var startLat = startPosition.latitude * 180 / Math.PI;
    var endLon = endPosition.longitude * 180 / Math.PI;
    var endLat = endPosition.latitude * 180 / Math.PI;

    var dist = Math.sqrt((startLon - endLon) * (startLon - endLon) + (startLat - endLat) * (startLat - endLat));

    //var dist = Cesium.Cartesian3.distance(startPoint, endPoint);
    var angularity = dist * angularityFactor;

    var startVec = Cesium.Cartesian3.clone(startPoint);
    var endVec = Cesium.Cartesian3.clone(endPoint);

    var startLength = Cesium.Cartesian3.distance(startVec, Cesium.Cartesian3.ZERO);
    var endLength = Cesium.Cartesian3.distance(endVec, Cesium.Cartesian3.ZERO);

    Cesium.Cartesian3.normalize(startVec, startVec);
    Cesium.Cartesian3.normalize(endVec, endVec);

    if (Cesium.Cartesian3.distance(startVec, endVec) == 0) {
        return result;
    }

    //var cosOmega = Cesium.Cartesian3.dot(startVec, endVec);
    //var omega = Math.acos(cosOmega);

    var omega = Cesium.Cartesian3.angleBetween(startVec, endVec);

    result.push(startPoint);
    for (var i = 1; i < numOfSingleLine - 1; i++) {
        var t = i * 1.0 / (numOfSingleLine - 1);
        var invT = 1 - t;

        var startScalar = Math.sin(invT * omega) / Math.sin(omega);
        var endScalar = Math.sin(t * omega) / Math.sin(omega);

        var startScalarVec = Cesium.Cartesian3.multiplyByScalar(startVec, startScalar, new Cesium.Cartesian3());
        var endScalarVec = Cesium.Cartesian3.multiplyByScalar(endVec, endScalar, new Cesium.Cartesian3());

        var centerVec = Cesium.Cartesian3.add(startScalarVec, endScalarVec, new Cesium.Cartesian3());

        var ht = t * Math.PI;
        var centerLength = startLength * invT + endLength * t + Math.sin(ht) * angularity;
        centerVec = Cesium.Cartesian3.multiplyByScalar(centerVec, centerLength, centerVec);

        result.push(centerVec);
    }

    result.push(endPoint);

    return result;
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PointColor = exports.PointType = exports.PixelSize = undefined;
exports.createDragger = createDragger;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Tooltip = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//拖拽点控制类
var PixelSize = exports.PixelSize = 12; //编辑点的像素大小

//拖拽点分类
var PointType = exports.PointType = {
    Control: 1, //位置控制
    AddMidPoint: 2, //辅助增加新点
    MoveHeight: 3, //上下移动高度
    EditAttr: 4, //辅助修改属性（如半径）
    EditRotation: 5 //旋转角度修改


    //拖拽点分类
};var PointColor = exports.PointColor = {
    Control: new Cesium.Color.fromCssColorString("#1c197d"), //位置控制拖拽点
    MoveHeight: new Cesium.Color.fromCssColorString("#9500eb"), //上下移动高度的拖拽点
    EditAttr: new Cesium.Color.fromCssColorString("#f73163"), //辅助修改属性（如半径）的拖拽点
    AddMidPoint: new Cesium.Color.fromCssColorString("#04c2c9").withAlpha(0.3) //增加新点，辅助拖拽点
};

function getAttrForType(type, attr) {
    switch (type) {
        case PointType.AddMidPoint:
            attr.color = PointColor.AddMidPoint;
            attr.outlineColor = new Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.4);
            break;
        case PointType.MoveHeight:
            attr.color = PointColor.MoveHeight;
            break;
        case PointType.EditAttr:
            attr.color = PointColor.EditAttr;
            break;
        case PointType.Control:
        default:
            attr.color = PointColor.Control;
            break;
    }
    return attr;
}

/** 创建Dragger拖动点的公共方法 */
function createDragger(dataSource, options) {
    var dragger;
    if (options.dragger) {
        dragger = options.dragger;
    } else {
        var attr = {
            scale: 1,
            pixelSize: PixelSize,
            outlineColor: new Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.5),
            outlineWidth: 2,
            scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY //一直显示，不被地形等遮挡
        };
        attr = getAttrForType(options.type, attr);

        dragger = dataSource.entities.add({
            position: Cesium.defaultValue(options.position, Cesium.Cartesian3.ZERO),
            point: attr,
            draw_tooltip: options.tooltip || _Tooltip.message.dragger.def
        });
    }

    dragger._isDragger = true;
    dragger._pointType = options.type || PointType.Control; //默认是位置控制拖拽点

    dragger.onDragStart = Cesium.defaultValue(options.onDragStart, null);
    dragger.onDrag = Cesium.defaultValue(options.onDrag, null);
    dragger.onDragEnd = Cesium.defaultValue(options.onDragEnd, null);

    return dragger;
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
//事件类型

var DrawStart = exports.DrawStart = 'draw-start'; //开始绘制
var DrawAddPoint = exports.DrawAddPoint = 'draw-add-point'; //绘制过程中增加了点
var DrawRemovePoint = exports.DrawRemovePoint = 'draw-remove-lastpoint'; //绘制过程中删除了last点
var DrawMouseMove = exports.DrawMouseMove = 'draw-mouse-move'; //绘制过程中鼠标移动了点
var DrawCreated = exports.DrawCreated = 'draw-created'; //创建完成


var EditStart = exports.EditStart = 'edit-start'; //开始编辑
var EditMovePoint = exports.EditMovePoint = 'edit-move-point'; //编辑修改了点
var EditRemovePoint = exports.EditRemovePoint = 'edit-remove-point'; //编辑删除了点
var EditStop = exports.EditStop = 'edit-stop'; //停止编辑

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawPolyline = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(21);

var _point = __webpack_require__(1);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Tooltip = __webpack_require__(3);

var _Attr = __webpack_require__(10);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(14);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var def_minPointNum = 2;
var def_maxPointNum = 9999;

var DrawPolyline = exports.DrawPolyline = _Draw.DrawBase.extend({
    type: 'polyline',
    //坐标位置相关
    _minPointNum: def_minPointNum, //至少需要点的个数 
    _maxPointNum: def_maxPointNum, //最多允许点的个数
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.config) {
            //允许外部传入
            this._minPointNum = attribute.config.minPointNum || def_minPointNum;
            this._maxPointNum = attribute.config.maxPointNum || def_maxPointNum;
        } else {
            this._minPointNum = def_minPointNum;
            this._maxPointNum = def_maxPointNum;
        }

        var that = this;
        var addattr = {
            polyline: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        addattr.polyline.positions = new Cesium.CallbackProperty(function (time) {
            return that.getDrawPosition();
        }, false);

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        this.entity._positions_draw = this._positions_draw;
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.polyline);
    },
    //绑定鼠标事件
    bindEvent: function bindEvent() {
        var _this = this;

        var lastPointTemporary = false;
        this.getHandler().setInputAction(function (event) {
            //单击添加点
            var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.position, _this.entity);
            if (point) {
                if (lastPointTemporary) {
                    _this._positions_draw.pop();
                }
                lastPointTemporary = false;

                //在绘制点基础自动增加高度
                if (_this.entity.attribute && _this.entity.attribute.config && _this.entity.attribute.config.addHeight) point = (0, _point.addPositionsHeight)(point, _this.entity.attribute.config.addHeight);

                _this._positions_draw.push(point);
                _this.updateAttrForDrawing();

                _this.fire(EventType.DrawAddPoint, { drawtype: _this.type, entity: _this.entity, position: point, positions: _this._positions_draw });

                if (_this._positions_draw.length >= _this._maxPointNum) {
                    //点数满足最大数量，自动结束
                    _this.disable();
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.getHandler().setInputAction(function (event) {
            //右击删除上一个点
            _this._positions_draw.pop(); //删除最后标的一个点

            var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.position, _this.entity);
            if (point) {
                if (lastPointTemporary) {
                    _this._positions_draw.pop();
                }
                lastPointTemporary = true;

                _this.fire(EventType.DrawRemovePoint, { drawtype: _this.type, entity: _this.entity, position: point, positions: _this._positions_draw });

                _this._positions_draw.push(point);
                _this.updateAttrForDrawing();
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        this.getHandler().setInputAction(function (event) {
            //鼠标移动

            if (_this._positions_draw.length <= 1) _this.tooltip.showAt(event.endPosition, _Tooltip.message.draw.polyline.start);else if (_this._positions_draw.length < _this._minPointNum) //点数不满足最少数量
                _this.tooltip.showAt(event.endPosition, _Tooltip.message.draw.polyline.cont);else if (_this._positions_draw.length >= _this._maxPointNum) //点数满足最大数量
                _this.tooltip.showAt(event.endPosition, _Tooltip.message.draw.polyline.end2);else _this.tooltip.showAt(event.endPosition, _Tooltip.message.draw.polyline.end);

            var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.endPosition, _this.entity);
            if (point) {
                if (lastPointTemporary) {
                    _this._positions_draw.pop();
                }
                lastPointTemporary = true;

                _this._positions_draw.push(point);
                _this.updateAttrForDrawing();

                _this.fire(EventType.DrawMouseMove, { drawtype: _this.type, entity: _this.entity, position: point, positions: _this._positions_draw });
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.getHandler().setInputAction(function (event) {
            //双击结束标绘
            //必要代码 消除双击带来的多余经纬度 
            _this._positions_draw.pop();

            if (_this._positions_draw.length < _this._minPointNum) return; //点数不够

            _this.updateAttrForDrawing();
            _this.disable();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditPolyline(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   

        entity._positions_draw = this.getDrawPosition();
        entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
            return entity._positions_draw;
        }, false);
    }

});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BaseLayer = undefined;

var _Class = __webpack_require__(12);

var _util = __webpack_require__(4);

var BaseLayer = _Class.Class.extend({
    config: {}, //配置的config信息 
    viewer: null,
    initialize: function initialize(cfg, viewer) {
        this.viewer = viewer;
        this.config = cfg;

        this.name = cfg.name;
        if (this.config.hasOwnProperty("alpha")) this._opacity = Number(this.config.alpha);else if (this.config.hasOwnProperty("opacity")) //兼容opacity参数来配置
            this._opacity = Number(this.config.opacity);

        if (this.config.hasOwnProperty("hasOpacity")) this.hasOpacity = this.config.hasOpacity;

        this.create();
        if (cfg.visible) this.setVisible(true);else this._visible = false;

        if (cfg.visible && cfg.flyTo) {
            this.centerAt(0);
        }
    },
    create: function create() {},
    showError: function showError(title, error) {
        if (!error) error = '未知错误';

        if (this.viewer) this.viewer.cesiumWidget.showErrorPanel(title, undefined, error);

        console.log('layer错误:' + title + error);
    },
    //显示隐藏控制
    _visible: null,
    getVisible: function getVisible() {
        return this._visible;
    },
    setVisible: function setVisible(val) {
        if (this._visible != null && this._visible == val) return;
        this._visible = val;

        if (val) {
            if (this.config.msg) (0, _util.msg)(this.config.msg);

            this.add();
        } else this.remove();
    },
    //添加 
    add: function add() {
        this._visible = true;

        if (this.config.onAdd) {
            this.config.onAdd();
        }
    },
    //移除
    remove: function remove() {
        this._visible = false;

        if (this.config.onRemove) {
            this.config.onRemove();
        }
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        } else if (this.config.onCenterAt) {
            this.config.onCenterAt(duration);
        }
    },
    hasOpacity: false,
    _opacity: 1,
    //设置透明度
    setOpacity: function setOpacity(value) {
        if (this.config.onSetOpacity) {
            this.config.onSetOpacity(value);
        }
    },
    hasZIndex: false,
    //设置叠加顺序
    setZIndex: function setZIndex(value) {
        if (this.config.onSetZIndex) {
            this.config.onSetZIndex(value);
        }
    },
    destroy: function destroy() {
        this.setVisible(false);
    }

});

exports.BaseLayer = BaseLayer;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;
exports.line2curve = line2curve;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _turf = __webpack_require__(22);

var turf = _interopRequireWildcard(_turf);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _LineFlowMaterial = __webpack_require__(25);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值
        entityattr = {};
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "lineType": //跳过扩展其他属性的参数
            case "color":
            case "opacity":
            case "outline":
            case "outlineWidth":
            case "outlineColor":
            case "outlineOpacity":
            case "flowDuration":
            case "flowImage":
                break;
        }
    }

    if (style.color || style.lineType) {
        var color = new Cesium.Color.fromCssColorString(style.color || "#FFFF00").withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0)));

        switch (style.lineType) {
            default:
            case "solid":
                //实线 
                if (style.outline) {
                    //存在衬色时
                    entityattr.material = new Cesium.PolylineOutlineMaterialProperty({
                        color: color,
                        outlineWidth: Number(style.outlineWidth || 1.0),
                        outlineColor: new Cesium.Color.fromCssColorString(style.outlineColor || "#FFFF00").withAlpha(Number(style.outlineOpacity || style.opacity || 1.0))
                    });
                } else {
                    entityattr.material = color;
                }
                break;
            case "dash":
                //虚线
                if (style.outline) {
                    //存在衬色时
                    entityattr.material = new Cesium.PolylineDashMaterialProperty({
                        dashLength: style.dashLength || style.outlineWidth || 16.0,
                        color: color,
                        gapColor: new Cesium.Color.fromCssColorString(style.outlineColor || "#FFFF00").withAlpha(Number(style.outlineOpacity || style.opacity || 1.0))
                    });
                } else {
                    entityattr.material = new Cesium.PolylineDashMaterialProperty({
                        dashLength: style.dashLength || 16.0,
                        color: color
                    });
                }

                break;
            case "glow":
                //发光线
                entityattr.material = new Cesium.PolylineGlowMaterialProperty({
                    glowPower: style.glowPower || 0.1,
                    color: color
                });
                break;
            case "arrow":
                //箭头线
                entityattr.material = new Cesium.PolylineArrowMaterialProperty(color);
                break;
            case "animation":
                //流动线 
                entityattr.material = new _LineFlowMaterial.LineFlowMaterial({ //动画线材质
                    color: color,
                    duration: style.animationDuration || 2000, //时长，控制速度
                    url: style.animationImage //图片
                });
                break;
        }
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    if (entity._positions_draw && entity._positions_draw.length > 0) return entity._positions_draw; //曲线等情形时，取绑定的数据

    return entity.polyline.positions.getValue(Cesium.JulianDate.fromDate(new Date()));
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "LineString",
            coordinates: coordinates
        }
    };
}

//折线转曲线
function line2curve(_positions_draw) {
    if (!turf) return _positions_draw;

    var coordinates = _positions_draw.map(function (position) {
        return Util.cartesian2lonlat(position);
    });
    var defHeight = coordinates[coordinates.length - 1][2];

    var line = turf.lineString(coordinates);
    var curved = turf.bezierSpline(line);
    var _positions_show = Util.lonlats2cartesians(curved.geometry.coordinates, defHeight);
    return _positions_show;
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值 
        entityattr = {
            // fill: true,
            // classificationType: Cesium.ClassificationType.BOTH,
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
                break;
            case "color":
                //填充颜色
                entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || style.color || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "extrudedHeight":
                //高度 
                var maxHight = 0;
                if (entityattr.hierarchy) {
                    var positions = getPositions({ polygon: entityattr });
                    maxHight = (0, _point.getMaxHeight)(positions);
                }
                entityattr.extrudedHeight = Number(value) + maxHight;
                break;
            case "clampToGround":
                //贴地
                entityattr.perPositionHeight = !value;
                break;
        }
    }

    //如果未设置任何material，默认设置随机颜色
    if (style.color == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    var arr = entity.polygon.hierarchy.getValue(Cesium.JulianDate.fromDate(new Date()));
    if (arr instanceof Cesium.PolygonHierarchy) return arr.positions;
    // if (arr.positions && Util.isArray(arr.positions))
    //     return arr.positions;
    return arr;
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);

    if (coordinates.length > 0) coordinates.push(coordinates[0]);

    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "Polygon",
            coordinates: [coordinates]
        }
    };
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Class = Class;

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// @class Class 

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

function Class() {}

Class.extend = function (props) {

	// @function extend(props: Object): Function
	// [Extends the current class](#class-inheritance) given the properties to be included.
	// Returns a Javascript function that is a class constructor (to be called with `new`).
	var NewClass = function NewClass() {

		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}

		// call all constructor hooks
		this.callInitHooks();
	};

	var parentProto = NewClass.__super__ = this.prototype;

	var proto = Util.create(parentProto);
	proto.constructor = NewClass;

	NewClass.prototype = proto;

	// inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
			NewClass[i] = this[i];
		}
	}

	// mix static properties into the class
	if (props.statics) {
		Util.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		// checkDeprecatedMixinEvents(props.includes);
		Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (proto.options) {
		props.options = Util.extend(Util.create(proto.options), props.options);
	}

	// mix given properties into the prototype
	Util.extend(proto, props);

	proto._initHooks = [];

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) {
			return;
		}

		if (parentProto.callInitHooks) {
			parentProto.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};

	return NewClass;
};

// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
	Util.extend(this.prototype, props);
	return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
Class.mergeOptions = function (options) {
	Util.extend(this.prototype.options, options);
	return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
Class.addInitHook = function (fn) {
	// (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};

	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
	return this;
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};

    if (entityattr == null) {
        //默认值
        entityattr = {
            scale: 1.0,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "font_style": //跳过扩展其他属性的参数
            case "font_weight":
            case "font_size":
            case "font_family":
            case "scaleByDistance_near":
            case "scaleByDistance_nearValue":
            case "scaleByDistance_far":
            case "scaleByDistance_farValue":
            case "distanceDisplayCondition_far":
            case "distanceDisplayCondition_near":
            case "background_opacity":
            case "pixelOffsetY":
                break;

            case "text":
                //文字内容
                entityattr.text = value.replace(new RegExp("<br />", "gm"), "\n");
                break;
            case "color":
                //颜色
                entityattr.fillColor = new Cesium.Color.fromCssColorString(value || "#ffffff").withAlpha(Number(style.opacity || 1.0));
                break;

            case "border":
                //是否衬色
                entityattr.style = value ? Cesium.LabelStyle.FILL_AND_OUTLINE : Cesium.LabelStyle.FILL;
                break;
            case "border_color":
                //衬色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#000000").withAlpha(Number(style.opacity || 1.0));
                break;
            case "border_width":
                entityattr.outlineWidth = value;
                break;
            case "background":
                //是否背景色
                entityattr.showBackground = value;
                break;
            case "background_color":
                //背景色
                entityattr.backgroundColor = new Cesium.Color.fromCssColorString(value || "#000000").withAlpha(Number(style.background_opacity || style.opacity || 0.5));
                break;
            case "pixelOffset":
                //偏移量
                entityattr.pixelOffset = new Cesium.Cartesian2(style.pixelOffset[0], style.pixelOffset[1]);
                break;
            case "hasPixelOffset":
                //是否存在偏移量
                if (!value) entityattr.pixelOffset = new Cesium.Cartesian2(0, 0);
                break;
            case "pixelOffsetX":
                //偏移量
                entityattr.pixelOffset = new Cesium.Cartesian2(value, style.pixelOffsetY);
                break;
            case "scaleByDistance":
                //是否按视距缩放
                if (value) {
                    entityattr.scaleByDistance = new Cesium.NearFarScalar(Number(style.scaleByDistance_near || 1000), Number(style.scaleByDistance_nearValue || 1.0), Number(style.scaleByDistance_far || 1000000), Number(style.scaleByDistance_farValue || 0.1));
                } else {
                    entityattr.scaleByDistance = null;
                }
                break;
            case "distanceDisplayCondition":
                //是否按视距显示
                if (value) {
                    entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(Number(style.distanceDisplayCondition_near || 0), Number(style.distanceDisplayCondition_far || 100000));
                } else {
                    entityattr.distanceDisplayCondition = null;
                }
                break;

            case "heightReference":
                switch (value) {
                    case "NONE":
                        entityattr.heightReference = Cesium.HeightReference.NONE;
                        break;
                    case "CLAMP_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                        break;
                    case "RELATIVE_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        break;
                    default:
                        entityattr.heightReference = value;
                        break;
                }
                break;

            case "visibleDepth":
                if (value) entityattr.disableDepthTestDistance = 0;else entityattr.disableDepthTestDistance = Number.POSITIVE_INFINITY; //一直显示，不被地形等遮挡

                break;

        }
    }

    //样式（倾斜、加粗等）
    var fontStyle = (style.font_style || "normal") + " small-caps " + (style.font_weight || "normal") + " " + (style.font_size || "25") + "px " + (style.font_family || "楷体");
    entityattr.font = fontStyle;

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return [entity.position.getValue(Cesium.JulianDate.fromDate(new Date()))];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditPolyline = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(18);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditPolyline = exports.EditPolyline = _Edit.EditBase.extend({
    //坐标位置相关
    _positions_draw: [],
    getPosition: function getPosition() {
        return this._positions_draw;
    },
    //外部更新位置
    setPositions: function setPositions(positions) {
        this._positions_draw = positions;
        this.updateAttrForEditing();
    },
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;

        this._positions_draw = this.entity._positions_draw || this.entity.polyline.positions.getValue(this.viewer.clock.currentTime);
        //this.entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
        //    return that.getPosition();
        //}, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        //this.entity.polyline.positions = this.getPosition();
        this.entity._positions_draw = this.getPosition();
    },
    isClampToGround: function isClampToGround() {
        return this.entity.attribute.style.clampToGround;
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var clampToGround = this.isClampToGround();

        var positions = this.getPosition();
        var hasMidPoint = positions.length < this._maxPointNum; //是否有新增点
        for (var i = 0, len = positions.length; i < len; i++) {
            var loc = positions[i];

            if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                loc = (0, _point.updateHeightForClampToGround)(this.viewer, loc);
                positions[i] = loc;
            }

            //各顶点
            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: loc,
                //clampToGround: clampToGround,
                onDrag: function onDrag(dragger, position) {
                    positions[dragger.index] = position;

                    //============新增点拖拽点处理=============
                    if (hasMidPoint) {
                        if (dragger.index > 0) {
                            //与前一个点之间的中点 
                            var midpoint = Cesium.Cartesian3.midpoint(position, positions[dragger.index - 1], new Cesium.Cartesian3());
                            if (clampToGround) {
                                //贴地时求贴模型和贴地的高度 
                                midpoint = (0, _point.updateHeightForClampToGround)(that.viewer, midpoint);
                            }
                            that.draggers[dragger.index * 2 - 1].position = midpoint;
                        }
                        if (dragger.index < positions.length - 1) {
                            //与后一个点之间的中点 
                            var midpoint = Cesium.Cartesian3.midpoint(position, positions[dragger.index + 1], new Cesium.Cartesian3());
                            if (clampToGround) {
                                //贴地时求贴模型和贴地的高度 
                                midpoint = (0, _point.updateHeightForClampToGround)(that.viewer, midpoint);
                            }
                            that.draggers[dragger.index * 2 + 1].position = midpoint;
                        }
                    }
                }
            });
            dragger.index = i;
            this.draggers.push(dragger);

            //中间点，拖动后新增点
            if (hasMidPoint) {
                var nextIndex = i + 1;
                if (nextIndex < len) {
                    var midpoint = Cesium.Cartesian3.midpoint(loc, positions[nextIndex], new Cesium.Cartesian3());
                    if (clampToGround) {
                        //贴地时求贴模型和贴地的高度 
                        midpoint = (0, _point.updateHeightForClampToGround)(this.viewer, midpoint);
                    }
                    var dragger = draggerCtl.createDragger(this.dataSource, {
                        position: midpoint,
                        type: draggerCtl.PointType.AddMidPoint,
                        tooltip: _Tooltip.message.dragger.addMidPoint,
                        //clampToGround: clampToGround,
                        onDragStart: function onDragStart(dragger, position) {
                            positions.splice(dragger.index, 0, position); //插入点 
                        },
                        onDrag: function onDrag(dragger, position) {
                            positions[dragger.index] = position;
                        },
                        onDragEnd: function onDragEnd(dragger, position) {
                            that.updateDraggers();
                        }
                    });
                    dragger.index = nextIndex;
                    this.draggers.push(dragger);
                }
            }
        }
    }

});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};

    if (entityattr == null) {
        //默认值
        entityattr = {
            scale: 1,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "scaleByDistance_near": //跳过扩展其他属性的参数
            case "scaleByDistance_nearValue":
            case "scaleByDistance_far":
            case "scaleByDistance_farValue":
            case "distanceDisplayCondition_far":
            case "distanceDisplayCondition_near":
                break;
            case "opacity":
                //透明度
                entityattr.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(Number(value || 1.0));
                break;
            case "rotation":
                //旋转角度
                entityattr.rotation = Cesium.Math.toRadians(value);
                break;
            case "scaleByDistance":
                //是否按视距缩放
                if (value) {
                    entityattr.scaleByDistance = new Cesium.NearFarScalar(Number(style.scaleByDistance_near || 1000), Number(style.scaleByDistance_nearValue || 1.0), Number(style.scaleByDistance_far || 1000000), Number(style.scaleByDistance_farValue || 0.1));
                } else {
                    entityattr.scaleByDistance = null;
                }
                break;
            case "distanceDisplayCondition":
                //是否按视距显示
                if (value) {
                    entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(Number(style.distanceDisplayCondition_near || 0), Number(style.distanceDisplayCondition_far || 100000));
                } else {
                    entityattr.distanceDisplayCondition = null;
                }
                break;

            case "heightReference":
                switch (value) {
                    case "NONE":
                        entityattr.heightReference = Cesium.HeightReference.NONE;
                        break;
                    case "CLAMP_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                        break;
                    case "RELATIVE_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        break;
                    default:
                        entityattr.heightReference = value;
                        break;
                }
                break;
            case "visibleDepth":
                if (value) entityattr.disableDepthTestDistance = 0;else entityattr.disableDepthTestDistance = Number.POSITIVE_INFINITY; //一直显示，不被地形等遮挡

                break;
        }
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return [entity.position.getValue(Cesium.JulianDate.fromDate(new Date()))];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Draw = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Events = __webpack_require__(50);

var _Tooltip = __webpack_require__(3);

var _util = __webpack_require__(4);

var util = _interopRequireWildcard(_util);

var _Util = __webpack_require__(2);

var DrawUtil = _interopRequireWildcard(_Util);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Draw = __webpack_require__(17);

var _Draw2 = __webpack_require__(52);

var _Draw3 = __webpack_require__(53);

var _Draw4 = __webpack_require__(54);

var _Draw5 = __webpack_require__(8);

var _Draw6 = __webpack_require__(55);

var _Draw7 = __webpack_require__(57);

var _Draw8 = __webpack_require__(59);

var _Draw9 = __webpack_require__(62);

var _Draw10 = __webpack_require__(63);

var _Draw11 = __webpack_require__(65);

var _Draw12 = __webpack_require__(67);

var _Draw13 = __webpack_require__(69);

var _DrawP = __webpack_require__(71);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Draw = exports.Draw = _Events.Evented.extend({
    dataSource: null,
    primitives: null,
    drawCtrl: null,
    //初始化
    initialize: function initialize(viewer, options) {
        this.viewer = viewer;
        this.options = options || {};

        this.dataSource = new Cesium.CustomDataSource(); //用于entity
        this.viewer.dataSources.add(this.dataSource);

        this.primitives = new Cesium.PrimitiveCollection(); //用于primitive
        this.viewer.scene.primitives.add(this.primitives);

        if (Cesium.defaultValue(this.options.removeScreenSpaceEvent, true)) {
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        }

        this.tooltip = new _Tooltip.Tooltip(this.viewer.container); //鼠标提示信息

        this.hasEdit(Cesium.defaultValue(this.options.hasEdit, true)); //是否可编辑

        //编辑工具初始化
        var _opts = {
            viewer: this.viewer,
            dataSource: this.dataSource,
            primitives: this.primitives,
            tooltip: this.tooltip
        };

        //entity
        this.drawCtrl = {};
        this.drawCtrl['point'] = new _Draw.DrawPoint(_opts);
        this.drawCtrl['billboard'] = new _Draw2.DrawBillboard(_opts);
        this.drawCtrl['label'] = new _Draw3.DrawLabel(_opts);
        this.drawCtrl['model'] = new _Draw4.DrawModel(_opts);

        this.drawCtrl['polyline'] = new _Draw5.DrawPolyline(_opts);
        this.drawCtrl['curve'] = new _Draw6.DrawCurve(_opts);
        this.drawCtrl['polylineVolume'] = new _Draw7.DrawPolylineVolume(_opts);
        this.drawCtrl['corridor'] = new _Draw8.DrawCorridor(_opts);

        this.drawCtrl['polygon'] = new _Draw9.DrawPolygon(_opts);
        this.drawCtrl['rectangle'] = new _Draw10.DrawRectangle(_opts);
        this.drawCtrl['ellipse'] = new _Draw11.DrawCircle(_opts);
        this.drawCtrl['circle'] = this.drawCtrl['ellipse']; //圆
        this.drawCtrl['ellipsoid'] = new _Draw12.DrawEllipsoid(_opts);
        this.drawCtrl['wall'] = new _Draw13.DrawWall(_opts);

        //primitive
        this.drawCtrl['model-p'] = new _DrawP.DrawPModel(_opts);

        //绑定事件抛出方法
        var that = this;
        for (var type in this.drawCtrl) {
            this.drawCtrl[type]._fire = function (type, data, propagate) {
                that.fire(type, data, propagate);
            };
        }

        //创建完成后激活编辑 
        this.on(EventType.DrawCreated, function (e) {
            this.startEditing(e.entity);
        }, this);
    },

    //==========绘制相关==========
    startDraw: function startDraw(attribute) {
        //参数是字符串id或uri时
        if (typeof attribute === 'string') {
            attribute = { type: attribute };
        } else {
            if (attribute == null || attribute.type == null) {
                console.error('需要传入指定绘制的type类型！');
                return;
            }
        }

        var type = attribute.type;
        if (this.drawCtrl[type] == null) {
            console.error('不能进行type为【' + type + '】的绘制，无该类型！');
            return;
        }

        var drawOkCalback;
        if (attribute.success) {
            drawOkCalback = attribute.success;
            delete attribute.success;
        }

        //赋默认值  
        attribute = DrawUtil.addGeoJsonDefVal(attribute);

        this.stopDraw();
        var entity = this.drawCtrl[type].activate(attribute, drawOkCalback);
        this.bindDeleteContextmenu(entity);
        return entity;
    },
    stopDraw: function stopDraw() {
        this.stopEditing();
        for (var type in this.drawCtrl) {
            this.drawCtrl[type].disable(true);
        }
    },
    clearDraw: function clearDraw() {
        //删除所有
        this.stopDraw();
        this.dataSource.entities.removeAll();
        this.primitives.removeAll();
    },
    //==========编辑相关==========
    currEditFeature: null, //当前编辑的要素  
    getCurrentEntity: function getCurrentEntity() {
        return this.currEditFeature;
    },
    _hasEdit: null,
    hasEdit: function hasEdit(val) {
        if (this._hasEdit !== null && this._hasEdit === val) return;

        this._hasEdit = val;
        if (val) {
            this.bindSelectEvent();
        } else {
            this.stopEditing();
            this.destroySelectEvent();
        }
    },
    //绑定鼠标选中事件
    bindSelectEvent: function bindSelectEvent() {
        var _this = this;

        //选取对象
        var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        handler.setInputAction(function (event) {
            var pickedObject = _this.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = pickedObject.id || pickedObject.primitive.id || pickedObject.primitive;
                if (entity && _this.isMyEntity(entity)) {
                    if (_this.currEditFeature && _this.currEditFeature === entity) return; //重复单击了跳出

                    if (!Cesium.defaultValue(entity.inProgress, false)) {
                        _this.startEditing(entity);
                        return;
                    }
                }
            }
            _this.stopEditing();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //编辑提示事件
        handler.setInputAction(function (event) {
            if (!_this._hasEdit) return;

            _this.tooltip.setVisible(false);

            var pickedObject = _this.viewer.scene.pick(event.endPosition);
            if (Cesium.defined(pickedObject)) {
                var entity = pickedObject.id || pickedObject.primitive.id || pickedObject.primitive;
                if (entity && entity.editing && !Cesium.defaultValue(entity.inProgress, false) && _this.isMyEntity(entity)) {
                    var tooltip = _this.tooltip;
                    setTimeout(function () {
                        //edit中的MOUSE_MOVE会关闭提示，延迟执行。
                        tooltip.showAt(event.endPosition, _Tooltip.message.edit.start);
                    }, 100);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.selectHandler = handler;
    },
    destroySelectEvent: function destroySelectEvent() {
        this.selectHandler && this.selectHandler.destroy();
        this.selectHandler = undefined;
    },
    startEditing: function startEditing(entity) {
        this.stopEditing();
        if (entity == null || !this._hasEdit) return;

        if (entity.editing && entity.editing.activate) {
            entity.editing.activate();
        }
        this.currEditFeature = entity;
    },
    stopEditing: function stopEditing() {
        if (this.currEditFeature && this.currEditFeature.editing && this.currEditFeature.editing.disable) {
            this.currEditFeature.editing.disable();
        }
        this.currEditFeature = null;
    },
    //修改了属性
    updateAttribute: function updateAttribute(attribute, entity) {
        if (entity == null) entity = this.currEditFeature;
        if (entity == null || attribute == null) return;

        attribute.style = attribute.style || {};
        attribute.attr = attribute.attr || {};

        //更新属性
        var type = entity.attribute.type;
        this.drawCtrl[type].style2Entity(attribute.style, entity);
        entity.attribute = attribute;

        //如果在编辑状态，更新绑定的拖拽点
        if (entity.editing) {
            if (entity.editing.updateAttrForEditing) entity.editing.updateAttrForEditing();

            if (entity.editing.updateDraggers) entity.editing.updateDraggers();
        }

        //名称 绑定到tooltip 
        if (this.options.nameTooltip) {
            var that = this;
            if (entity.attribute.attr && entity.attribute.attr.name) {
                entity.tooltip = {
                    html: entity.attribute.attr.name,
                    check: function check() {
                        return !that._hasEdit;
                    }
                };
            } else {
                entity.tooltip = null;
            }
        }
        return entity;
    },
    //修改坐标、高程
    setPositions: function setPositions(positions, entity) {
        if (entity == null) entity = this.currEditFeature;
        if (entity == null || positions == null) return;

        //如果在编辑状态，更新绑定的拖拽点
        if (entity.editing) {
            entity.editing.setPositions(positions);
            entity.editing.updateDraggers();
        }
        return entity;
    },
    //==========删除相关========== 
    //右键菜单
    bindDeleteContextmenu: function bindDeleteContextmenu(entity) {
        var that = this;
        entity.contextmenuItems = [{
            text: '删除对象',
            iconCls: 'fa fa-trash-o',
            visible: function visible() {
                return that._hasEdit;
            },
            calback: function calback(e) {
                var entity = e.target;

                if (entity.editing && entity.editing.disable) {
                    entity.editing.disable();
                }
                that.deleteEntity(entity);
            }
        }];
    },
    //删除单个
    deleteEntity: function deleteEntity(entity) {
        if (entity == null) entity = this.currEditFeature;
        if (entity == null) return;

        if (entity.editing) {
            entity.editing.disable();
        }
        if (this.dataSource.entities.contains(entity)) this.dataSource.entities.remove(entity);

        if (this.primitives.contains(entity)) this.primitives.remove(entity);
    },
    //是否为当前编辑器编辑的标号
    isMyEntity: function isMyEntity(entity) {
        if (this.dataSource.entities.contains(entity)) return true;
        if (this.primitives.contains(entity)) return true;
        return false;
    },
    //删除所有
    deleteAll: function deleteAll() {
        this.clearDraw();
    },
    //==========转换GeoJSON==========
    //转换当前所有为geojson
    toGeoJSON: function toGeoJSON(entity) {
        this.stopDraw();

        if (entity == null) {
            //全部数据 
            var arrEntity = this.getEntitys();
            if (arrEntity.length == 0) return null;

            var features = [];
            for (var i = 0, len = arrEntity.length; i < len; i++) {
                var entity = arrEntity[i];
                if (entity.attribute == null || entity.attribute.type == null) continue;

                var type = entity.attribute.type;
                var geojson = this.drawCtrl[type].toGeoJSON(entity);
                if (geojson == null) continue;
                geojson = DrawUtil.removeGeoJsonDefVal(geojson);

                features.push(geojson);
            }
            if (features.length > 0) return { type: "FeatureCollection", features: features };else return null;
        } else {
            var type = entity.attribute.type;
            var geojson = this.drawCtrl[type].toGeoJSON(entity);
            geojson = DrawUtil.removeGeoJsonDefVal(geojson);
            return geojson;
        }
    },
    //加载goejson数据
    jsonToEntity: function jsonToEntity(json, isClear, isFly) {
        var jsonObjs = json;
        try {
            if (util.isString(json)) jsonObjs = JSON.parse(json);
        } catch (e) {
            util.alert(e.name + ": " + e.message + " \n请确认json文件格式正确!!!");
            return;
        }

        if (isClear) {
            this.clearDraw();
        }
        var arrthis = [];
        var jsonFeatures = jsonObjs.features ? jsonObjs.features : [jsonObjs];

        for (var i = 0, len = jsonFeatures.length; i < len; i++) {
            var feature = jsonFeatures[i];

            if (!feature.properties || !feature.properties.type) {
                //非本身保存的外部其他geojson数据
                feature.properties = feature.properties || {};
                switch (feature.geometry.type) {
                    case "MultiPolygon":
                    case "Polygon":
                        feature.properties.type = "polygon";
                        break;
                    case "MultiLineString":
                    case "LineString":
                        feature.properties.type = "polyline";
                        break;
                    case "MultiPoint":
                    case "Point":
                        feature.properties.type = "point";
                        break;
                }
            }

            var type = feature.properties.type;
            if (this.drawCtrl[type] == null) {
                console.log('数据无法识别或者数据的[' + type + ']类型参数有误');
                continue;
            }
            feature.properties.style = feature.properties.style || {};

            //赋默认值  
            feature.properties = DrawUtil.addGeoJsonDefVal(feature.properties);

            var entity = this.drawCtrl[type].jsonToEntity(feature);
            this.bindDeleteContextmenu(entity);

            //名称 绑定到tooltip
            if (this.options.nameTooltip) {
                if (entity.attribute.attr && entity.attribute.attr.name) {
                    var that = this;
                    entity.tooltip = {
                        html: entity.attribute.attr.name,
                        check: function check() {
                            return !that._hasEdit;
                        }
                    };
                } else {
                    entity.tooltip = null;
                }
            }

            arrthis.push(entity);
        }

        if (isFly) this.viewer.flyTo(arrthis);

        return arrthis;
    },
    //属性转entity
    attributeToEntity: function attributeToEntity(attribute, positions) {
        return this.drawCtrl[attribute.type].attributeToEntity(attribute, positions);
    },
    //绑定外部entity到标绘
    bindExtraEntity: function bindExtraEntity(entity, attribute) {
        var entity = this.drawCtrl[attribute.type].attributeToEntity(entity, attribute);
        this.dataSource.entities.add(entity);
    },
    //==========对外接口==========
    _visible: true,
    setVisible: function setVisible(visible) {
        this._visible = visible;
        if (visible) {
            if (!this.viewer.dataSources.contains(this.dataSource)) this.viewer.dataSources.add(this.dataSource);

            if (!this.viewer.scene.primitives.contains(this.primitives)) this.viewer.scene.primitives.add(this.primitives);
        } else {
            this.stopDraw();
            if (this.viewer.dataSources.contains(this.dataSource)) this.viewer.dataSources.remove(this.dataSource, false);

            if (this.viewer.scene.primitives.contains(this.dataSource)) this.viewer.scene.primitives.remove(this.primitives);
        }
    },
    //是否存在绘制
    hasDraw: function hasDraw() {
        return this.getEntitys().length > 0;
    },
    //获取所有绘制的实体对象列表
    getEntitys: function getEntitys() {
        this.stopDraw();

        var arr = this.dataSource.entities.values;
        arr = arr.concat(this.primitives._primitives);
        return arr;
    },
    getDataSource: function getDataSource() {
        return this.dataSource;
    },
    getEntityById: function getEntityById(id) {
        var arrEntity = this.getEntitys();
        for (var i = 0, len = arrEntity.length; i < len; i++) {
            var entity = arrEntity[i];
            if (id == entity.attribute.attr.id) {
                return entity;
            }
        }
        return null;
    },
    //获取实体的经纬度值 坐标数组
    getCoordinates: function getCoordinates(entity) {
        var type = entity.attribute.type;
        var coor = this.drawCtrl[type].getCoordinates(entity);
        return coor;
    },
    //获取实体的坐标数组
    getPositions: function getPositions(entity) {
        var type = entity.attribute.type;
        var positions = this.drawCtrl[type].getPositions(entity);
        return positions;
    },

    destroy: function destroy() {
        this.stopDraw();
        this.hasEdit(false);
        this.clearDraw();
        if (this.viewer.dataSources.contains(this.dataSource)) this.viewer.dataSources.remove(this.dataSource, true);
    }
});

//绑定到draw，方便外部使用
Draw.Point = _Draw.DrawPoint;
Draw.Billboard = _Draw2.DrawBillboard;
Draw.Label = _Draw3.DrawLabel;
Draw.Model = _Draw4.DrawModel;

Draw.Polyline = _Draw5.DrawPolyline;
Draw.Curve = _Draw6.DrawCurve;
Draw.PolylineVolume = _Draw7.DrawPolylineVolume;
Draw.Polygon = _Draw9.DrawPolygon;
Draw.Rectangle = _Draw10.DrawRectangle;
Draw.Circle = _Draw11.DrawCircle;
Draw.Ellipsoid = _Draw12.DrawEllipsoid;
Draw.Wall = _Draw13.DrawWall;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawPoint = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(21);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(23);

var attr = _interopRequireWildcard(_Attr);

var _Tooltip = __webpack_require__(3);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Edit = __webpack_require__(51);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawPoint = exports.DrawPoint = _Draw.DrawBase.extend({
    type: 'point',
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = null;

        var that = this;
        var addattr = {
            show: false,
            position: new Cesium.CallbackProperty(function (time) {
                return that.getDrawPosition();
            }, false),
            point: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.point);
    },
    //绑定鼠标事件
    bindEvent: function bindEvent() {
        var _this = this;

        this.getHandler().setInputAction(function (event) {
            var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.endPosition, _this.entity);
            if (point) {
                _this._positions_draw = point;
            }
            _this.tooltip.showAt(event.endPosition, _Tooltip.message.draw.point.start);

            _this.fire(EventType.DrawMouseMove, { drawtype: _this.type, entity: _this.entity, position: point });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.getHandler().setInputAction(function (event) {
            var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.position, _this.entity);
            if (point) {
                _this._positions_draw = point;
                _this.disable();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //获取编辑对象类
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditPoint(entity, this.viewer, this.dataSource);
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束,更新属性
    finish: function finish() {
        this.entity.show = true;

        this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象     
        this.entity.position = this.getDrawPosition();
    }

});

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditBase = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Class = __webpack_require__(12);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditBase = exports.EditBase = _Class.Class.extend({
    _dataSource: null,
    _minPointNum: 1, //至少需要点的个数 (值是draw中传入)
    _maxPointNum: 9999, //最多允许点的个数 (值是draw中传入)
    initialize: function initialize(entity, viewer, dataSource) {
        this.entity = entity;
        this.viewer = viewer;
        this.dataSource = dataSource;

        this.draggers = [];
    },
    fire: function fire(type, data, propagate) {
        if (this._fire) this._fire(type, data, propagate);
    },
    formatNum: function formatNum(num, digits) {
        return Util.formatNum(num, digits);
    },
    setCursor: function setCursor(val) {
        this.viewer._container.style.cursor = val ? 'crosshair' : '';
    },
    //激活绘制
    activate: function activate() {
        if (this._enabled) {
            return this;
        }
        this._enabled = true;

        this.entity.inProgress = true;
        this.changePositionsToCallback();
        this.bindDraggers();
        this.bindEvent();

        this.fire(EventType.EditStart, { edittype: this.entity.attribute.type, entity: this.entity });

        return this;
    },
    //释放绘制
    disable: function disable() {
        if (!this._enabled) {
            return this;
        }
        this._enabled = false;

        this.destroyEvent();
        this.destroyDraggers();
        this.finish();

        this.entity.inProgress = false;
        this.fire(EventType.EditStop, { edittype: this.entity.attribute.type, entity: this.entity });
        this.tooltip.setVisible(false);

        return this;
    },
    changePositionsToCallback: function changePositionsToCallback() {},
    //图形编辑结束后调用
    finish: function finish() {},
    //拖拽点 事件
    bindEvent: function bindEvent() {
        var _this = this;

        var scratchBoundingSphere = new Cesium.BoundingSphere();
        var zOffset = new Cesium.Cartesian3();

        var draggerHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        draggerHandler.dragger = null;

        //选中后拖动
        draggerHandler.setInputAction(function (event) {
            var pickedObject = _this.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = pickedObject.id || pickedObject.primitive.id || pickedObject.primitive;
                if (entity && Cesium.defaultValue(entity._isDragger, false)) {
                    _this.viewer.scene.screenSpaceCameraController.enableRotate = false;
                    _this.viewer.scene.screenSpaceCameraController.enableTilt = false;
                    _this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
                    _this.viewer.scene.screenSpaceCameraController.enableInputs = false;

                    if (_this.viewer.mars) _this.viewer.mars.popup.close(entity);

                    draggerHandler.dragger = entity;

                    if (draggerHandler.dragger.point) draggerHandler.dragger.show = false;
                    _this.setCursor(true);

                    if (draggerHandler.dragger.onDragStart) {
                        var position = draggerHandler.dragger.position;
                        if (position && position.getValue) position = position.getValue(_this.viewer.clock.currentTime);
                        draggerHandler.dragger.onDragStart(draggerHandler.dragger, position);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        draggerHandler.setInputAction(function (event) {
            var dragger = draggerHandler.dragger;
            if (dragger) {
                switch (dragger._pointType) {
                    case draggerCtl.PointType.MoveHeight:
                        //改变高度垂直拖动
                        var dy = event.endPosition.y - event.startPosition.y;

                        var position = dragger.position;
                        if (position && position.getValue) position = position.getValue(_this.viewer.clock.currentTime);

                        var tangentPlane = new Cesium.EllipsoidTangentPlane(position);

                        scratchBoundingSphere.center = position;
                        scratchBoundingSphere.radius = 1;

                        var metersPerPixel = _this.viewer.scene.frameState.camera.getPixelSize(scratchBoundingSphere, _this.viewer.scene.frameState.context.drawingBufferWidth, _this.viewer.scene.frameState.context.drawingBufferHeight) * 1.5;

                        Cesium.Cartesian3.multiplyByScalar(tangentPlane.zAxis, -dy * metersPerPixel, zOffset);
                        var newPosition = Cesium.Cartesian3.clone(position);
                        Cesium.Cartesian3.add(position, zOffset, newPosition);

                        dragger.position = newPosition;
                        if (dragger.onDrag) {
                            dragger.onDrag(dragger, newPosition, position);
                        }
                        _this.updateAttrForEditing();
                        break;
                    default:
                        //默认修改位置
                        _this.tooltip.showAt(event.endPosition, _Tooltip.message.edit.end);

                        var point = (0, _point.getCurrentMousePosition)(_this.viewer.scene, event.endPosition, _this.entity);

                        if (point) {
                            dragger.position = point;
                            if (dragger.onDrag) {
                                dragger.onDrag(dragger, point);
                            }
                            _this.updateAttrForEditing();
                        }
                        break;
                }
            } else {
                _this.tooltip.setVisible(false);

                var pickedObject = _this.viewer.scene.pick(event.endPosition);
                if (Cesium.defined(pickedObject)) {
                    var entity = pickedObject.id;
                    if (entity && Cesium.defaultValue(entity._isDragger, false) && entity.draw_tooltip) {
                        var draw_tooltip = entity.draw_tooltip;

                        //可删除时，提示右击删除
                        if (draggerCtl.PointType.Control == entity._pointType && _this._positions_draw && _this._positions_draw.length && _this._positions_draw.length > _this._minPointNum) draw_tooltip += _Tooltip.message.del.def;

                        _this.tooltip.showAt(event.endPosition, draw_tooltip);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        draggerHandler.setInputAction(function (event) {
            var dragger = draggerHandler.dragger;
            if (dragger) {
                _this.setCursor(false);
                dragger.show = true;

                var position = dragger.position;
                if (position && position.getValue) position = position.getValue(_this.viewer.clock.currentTime);

                if (dragger.onDragEnd) {
                    dragger.onDragEnd(dragger, position);
                }
                _this.fire(EventType.EditMovePoint, { edittype: _this.entity.attribute.type, entity: _this.entity, position: position });

                draggerHandler.dragger = null;

                _this.viewer.scene.screenSpaceCameraController.enableRotate = true;
                _this.viewer.scene.screenSpaceCameraController.enableTilt = true;
                _this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
                _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        //右击删除一个点
        draggerHandler.setInputAction(function (event) {
            //右击删除上一个点
            var pickedObject = _this.viewer.scene.pick(event.position);
            if (Cesium.defined(pickedObject)) {
                var entity = pickedObject.id;
                if (entity && Cesium.defaultValue(entity._isDragger, false) && draggerCtl.PointType.Control == entity._pointType) {
                    var isDelOk = _this.deletePointForDragger(entity, event.position);

                    if (isDelOk) _this.fire(EventType.EditRemovePoint, { edittype: _this.entity.attribute.type, entity: _this.entity });
                }
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        this.draggerHandler = draggerHandler;
    },
    destroyEvent: function destroyEvent() {
        this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;

        this.setCursor(false);

        if (this.draggerHandler) {
            if (this.draggerHandler.dragger) this.draggerHandler.dragger.show = true;

            this.draggerHandler.destroy();
            this.draggerHandler = null;
        }
    },
    bindDraggers: function bindDraggers() {},
    updateDraggers: function updateDraggers() {
        if (!this._enabled) {
            return this;
        }

        this.destroyDraggers();
        this.bindDraggers();
    },
    destroyDraggers: function destroyDraggers() {
        for (var i = 0, len = this.draggers.length; i < len; i++) {
            this.dataSource.entities.remove(this.draggers[i]);
        }
        this.draggers = [];
    },
    //删除点
    deletePointForDragger: function deletePointForDragger(dragger, position) {
        if (this._positions_draw.length - 1 < this._minPointNum) {
            this.tooltip.showAt(position, _Tooltip.message.del.min + this._minPointNum);
            return false;
        }

        var index = dragger.index;
        if (index > 0 && index < this._positions_draw.length) {
            this._positions_draw.splice(index, 1);
            this.updateDraggers();
            return true;
        } else {
            return false;
        }
    },
    updateAttrForEditing: function updateAttrForEditing() {}

});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bd2gcj = bd2gcj;
exports.gcj2bd = gcj2bd;
exports.wgs2gcj = wgs2gcj;
exports.gcj2wgs = gcj2wgs;
exports.bd2wgs = bd2wgs;
exports.wgs2bd = wgs2bd;
exports.jwd2mct = jwd2mct;
exports.mct2jwd = mct2jwd;
//提供了百度坐标（BD09）、国测局坐标（GCJ02）、WGS84坐标系、Web墨卡托 4类坐标之间的转换 
//传入参数 和 返回结果 均是数组：[经度,纬度] 


//定义一些常量
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
function out_of_china(lng, lat) {
    return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271 || false;
}

/**
 * 百度坐标系 (BD-09) 与 国测局坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd2gcj(arrdata) {
    var bd_lon = Number(arrdata[0]);
    var bd_lat = Number(arrdata[1]);

    var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);

    gg_lng = Number(gg_lng.toFixed(6));
    gg_lat = Number(gg_lat.toFixed(6));
    return [gg_lng, gg_lat];
};

/**
 * 国测局坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj2bd(arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);

    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;

    bd_lng = Number(bd_lng.toFixed(6));
    bd_lat = Number(bd_lat.toFixed(6));
    return [bd_lng, bd_lat];
};

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function wgs2gcj(arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);

    if (out_of_china(lng, lat)) {
        return [lng, lat];
    } else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
        dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;

        mglng = Number(mglng.toFixed(6));
        mglat = Number(mglat.toFixed(6));
        return [mglng, mglat];
    }
};

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj2wgs(arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);

    if (out_of_china(lng, lat)) {
        return [lng, lat];
    } else {
        var dlat = transformlat(lng - 105.0, lat - 35.0);
        var dlng = transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
        dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);

        var mglat = lat + dlat;
        var mglng = lng + dlng;

        var jd = lng * 2 - mglng;
        var wd = lat * 2 - mglat;

        jd = Number(jd.toFixed(6));
        wd = Number(wd.toFixed(6));
        return [jd, wd];
    }
};

//百度经纬度坐标 转 标准WGS84坐标   
function bd2wgs(arrdata) {
    return gcj2wgs(bd2gcj(arrdata));
};

//标准WGS84坐标  转 百度经纬度坐标   
function wgs2bd(arrdata) {
    return gcj2bd(wgs2gcj(arrdata));
};

//经纬度转Web墨卡托  
function jwd2mct(arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);

    var x = lng * 20037508.34 / 180;
    var y = Math.log(Math.tan((90 + lat) * PI / 360)) / (PI / 180);
    y = y * 20037508.34 / 180;

    x = Number(x.toFixed(2));
    y = Number(y.toFixed(2));
    return [x, y];
};

//Web墨卡托转经纬度  
function mct2jwd(arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);

    var x = lng / 20037508.34 * 180;
    var y = lat / 20037508.34 * 180;
    y = 180 / PI * (2 * Math.atan(Math.exp(y * PI / 180)) - PI / 2);

    x = Number(x.toFixed(6));
    y = Number(y.toFixed(6));
    return [x, y];
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _util = __webpack_require__(4);

var _BaseLayer = __webpack_require__(9);

var _GroupLayer = __webpack_require__(76);

var _TileLayer = __webpack_require__(40);

var _GraticuleLayer = __webpack_require__(77);

var _CustomFeatureGridLayer = __webpack_require__(41);

var _POILayer = __webpack_require__(79);

var _GeoJsonLayer = __webpack_require__(28);

var _GltfLayer = __webpack_require__(80);

var _Tiles3dLayer = __webpack_require__(81);

var _KmlLayer = __webpack_require__(82);

var _CzmlLayer = __webpack_require__(83);

var _TerrainLayer = __webpack_require__(84);

var _DrawLayer = __webpack_require__(85);

var _BaiduImageryProvider = __webpack_require__(86);

var _FeatureGridImageryProvider = __webpack_require__(87);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.BaseLayer = _BaseLayer.BaseLayer;

exports.GroupLayer = _GroupLayer.GroupLayer;

exports.TileLayer = _TileLayer.TileLayer;

exports.GraticuleLayer = _GraticuleLayer.GraticuleLayer;

exports.CustomFeatureGridLayer = _CustomFeatureGridLayer.CustomFeatureGridLayer;

exports.POILayer = _POILayer.POILayer;

exports.GeoJsonLayer = _GeoJsonLayer.GeoJsonLayer;

exports.GltfLayer = _GltfLayer.GltfLayer;

exports.Tiles3dLayer = _Tiles3dLayer.Tiles3dLayer;

exports.KmlLayer = _KmlLayer.KmlLayer;

exports.CzmlLayer = _CzmlLayer.CzmlLayer;

exports.TerrainLayer = _TerrainLayer.TerrainLayer;

exports.DrawLayer = _DrawLayer.DrawLayer;

//类库外部的类
var exLayer = {};
exports.regLayerForConfig = function (type, layerClass) {
    exLayer[type] = layerClass;
};

//创建图层
exports.createLayer = function createLayer(item, viewer, serverURL) {
    var layer;

    if (item.url) {
        if (serverURL) {
            item.url = item.url.replace('$serverURL$', serverURL);
        }
        item.url = item.url.replace('$hostname$', location.hostname).replace('$host$', location.host);
    }

    switch (item.type) {
        //===============地图数组====================
        case "group":
            //示例：{ "name": "电子地图", "type": "group","layers": [    ]}
            if (item.layers && item.layers.length > 0) {
                var arrVec = [];
                for (var index = 0; index < item.layers.length; index++) {
                    var temp = createLayer(item.layers[index], viewer, serverURL);
                    if (temp == null) continue;
                    arrVec.push(temp);
                }
                item._layers = arrVec;
                layer = new _GroupLayer.GroupLayer(item, viewer);
            }
            break;
        case "www_bing": //bing地图 
        case "www_osm": //OSM开源地图 
        case "www_google": //谷歌国内
        case "www_gaode": //高德
        case "www_baidu": //百度 
        case "www_tdt": //天地图
        case "arcgis_cache":
        case "arcgis":
        case "arcgis_tile":
        case "arcgis_dynamic":
        case "wmts":
        case "tms":
        case "wms":
        case "xyz":
        case "tile":
        case "single":
        case "image":
        case "gee":
        case "mapbox":
        case "custom_tilecoord": //瓦片信息
        case "custom_grid":
            //网格线 
            //瓦片图层
            layer = new _TileLayer.TileLayer(item, viewer);
            layer.isTile = true;
            break;
        case "www_poi":
            //在线poi数据
            layer = new _POILayer.POILayer(item, viewer);
            break;
        case "custom_featuregrid":
            //自定义矢量网格图层 
            layer = new _CustomFeatureGridLayer.CustomFeatureGridLayer(item, viewer);
            break;
        case "custom_graticule":
            layer = new _GraticuleLayer.GraticuleLayer(item, viewer);
            break;

        case "3dtiles":
            layer = new _Tiles3dLayer.Tiles3dLayer(item, viewer);
            break;
        case "gltf":
            layer = new _GltfLayer.GltfLayer(item, viewer);
            break;
        case "geojson":
            layer = new _GeoJsonLayer.GeoJsonLayer(item, viewer);
            break;
        case "geojson-draw":
            //基于框架内部draw绘制保存的geojson数据的加载
            layer = new _DrawLayer.DrawLayer(item, viewer);
            break;
        case "kml":
            layer = new _KmlLayer.KmlLayer(item, viewer);
            break;
        case "czml":
            layer = new _CzmlLayer.CzmlLayer(item, viewer);
            break;
        case "terrain":
            layer = new _TerrainLayer.TerrainLayer(item, viewer);
            break;
        default:
            if (exLayer[item.type]) {
                layer = new exLayer[item.type](item, viewer);
            }
            if (layer == null) {
                try {
                    console.log("配置中的图层未处理：" + JSON.stringify(item));
                } catch (e) {}
            }
            break;
    }

    if (layer !== null) {
        //这句话，vue或部分架构中要注释，会造成内存溢出。(不能绑定到data)
        item._layer = layer;
    }

    return layer;
};

//创建地图底图
exports.createImageryProvider = function (item, serverURL) {
    if (item.url) {
        if (serverURL) {
            item.url = item.url.replace('$serverURL$', serverURL);
        }
        item.url = item.url.replace('$hostname$', location.hostname).replace('$host$', location.host);
    }

    var opts = {};
    for (var key in item) {
        var value = item[key];
        if (value == null) continue;

        switch (key) {
            default:
                //直接赋值
                opts[key] = value;
                break;
            case "crs":
                if (value == "4326" || value.toUpperCase() == "EPSG4326" || value.toUpperCase() == "EPSG:4326") opts.tilingScheme = new Cesium.GeographicTilingScheme({
                    numberOfLevelZeroTilesX: item.numberOfLevelZeroTilesX || 2,
                    numberOfLevelZeroTilesY: item.numberOfLevelZeroTilesY || 1
                });else opts.tilingScheme = new Cesium.WebMercatorTilingScheme({
                    numberOfLevelZeroTilesX: item.numberOfLevelZeroTilesX || 1,
                    numberOfLevelZeroTilesY: item.numberOfLevelZeroTilesY || 1
                });
                break;
            case "rectangle":
                opts.rectangle = Cesium.Rectangle.fromDegrees(value.xmin, value.ymin, value.xmax, value.ymax);
                break;
        }
    }

    if (opts.url && opts.proxy) {
        opts = (0, _util.getProxyUrl)(opts);
    }

    var layer;
    switch (opts.type_new || opts.type) {
        //===============地图底图==================== 
        case "single":
        case "image":
            layer = new Cesium.SingleTileImageryProvider(opts);
            break;
        case "xyz":
        case "tile":
            opts.customTags = {
                "z&1": function z1(imageryProvider, x, y, level) {
                    return level + 1;
                }
            };
            layer = new Cesium.UrlTemplateImageryProvider(opts);
            break;
        case "wms":
            layer = new Cesium.WebMapServiceImageryProvider(opts);
            break;
        case "tms":
            if (!opts.url) opts.url = Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII');
            layer = new Cesium.createTileMapServiceImageryProvider(opts);
            break;
        case "wmts":
            layer = new Cesium.WebMapTileServiceImageryProvider(opts);
            break;
        case "gee":
            //谷歌地球
            layer = new Cesium.GoogleEarthEnterpriseImageryProvider({
                metadata: new Cesium.GoogleEarthEnterpriseMetadata(opts)
            });
            break;
        case "mapbox":
            //mapbox
            layer = new Cesium.MapboxImageryProvider(opts);
            break;
        case "arcgis":
        case "arcgis_tile":
        case "arcgis_dynamic":
            layer = new Cesium.ArcGisMapServerImageryProvider(opts);
            break;
        case "arcgis_cache":
            //layer = new _ArcTileImageryProvider(opts);
            if (!Cesium.UrlTemplateImageryProvider.prototype.padLeft0) {
                Cesium.UrlTemplateImageryProvider.prototype.padLeft0 = function (numStr, n) {
                    numStr = String(numStr);
                    var len = numStr.length;
                    while (len < n) {
                        numStr = "0" + numStr;
                        len++;
                    }
                    return numStr;
                };
            }
            opts.customTags = {
                //小写
                arc_x: function arc_x(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(x.toString(16), 8);
                },
                arc_y: function arc_y(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(y.toString(16), 8);
                },
                arc_z: function arc_z(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(level.toString(), 2);
                },
                //大写
                arc_X: function arc_X(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
                },
                arc_Y: function arc_Y(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
                },
                arc_Z: function arc_Z(imageryProvider, x, y, level) {
                    return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
                }
            };
            layer = new Cesium.UrlTemplateImageryProvider(opts);
            break;

        //===============互联网常用地图==================== 

        case "www_tdt":
            //天地图
            var _layer;
            switch (opts.layer) {
                default:
                case "vec_d":
                    _layer = "vec";
                    break;
                case "vec_z":
                    _layer = "cva";
                    break;
                case "img_d":
                    _layer = "img";
                    break;
                case "img_z":
                    _layer = "cia";
                    break;
                case "ter_d":
                    _layer = "ter";
                    break;
                case "ter_z":
                    _layer = "cta";
                    break;
            }

            var _key;
            if (opts.key == null || opts.key.length == 0) _key = '87949882c75775b5069a0076357b7530'; //默认
            else _key = getOneKey(opts.key);

            var maxLevel = 18;
            if (item.crs == '4326') {
                //wgs84   
                var matrixIds = new Array(maxLevel);
                for (var z = 0; z <= maxLevel; z++) {
                    matrixIds[z] = (z + 1).toString();
                }
                var _url = 'http://t{s}.tianditu.gov.cn/' + _layer + '_c/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + _key;

                layer = new Cesium.WebMapTileServiceImageryProvider({
                    url: opts.proxy ? new Cesium.Resource({ url: _url, proxy: opts.proxy }) : _url,
                    layer: _layer,
                    style: 'default',
                    format: 'tiles',
                    tileMatrixSetID: 'c',
                    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                    tileMatrixLabels: matrixIds,
                    tilingScheme: new Cesium.GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
                    maximumLevel: maxLevel
                });
            } else {
                //墨卡托  
                var matrixIds = new Array(maxLevel);
                for (var z = 0; z <= maxLevel; z++) {
                    matrixIds[z] = z.toString();
                }
                var _url = 'http://t{s}.tianditu.gov.cn/' + _layer + '_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + _key;

                layer = new Cesium.WebMapTileServiceImageryProvider({
                    url: opts.proxy ? new Cesium.Resource({ url: _url.replace('{s}', '0'), proxy: opts.proxy }) : _url,
                    layer: _layer,
                    style: 'default',
                    format: 'tiles',
                    tileMatrixSetID: 'w',
                    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                    tileMatrixLabels: matrixIds,
                    tilingScheme: new Cesium.WebMercatorTilingScheme(),
                    maximumLevel: maxLevel
                });
            }
            break;
        case "www_gaode":
            //高德
            var _url;
            switch (opts.layer) {
                case "vec":
                default:
                    //style=7是立体的，style=8是灰色平面的
                    _url = 'http://' + (opts.bigfont ? 'wprd' : 'webrd') + '0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
                    break;
                case "img_d":
                    _url = 'http://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
                    break;
                case "img_z":
                    _url = 'http://webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8';
                    break;
                case "time":
                    var time = new Date().getTime();
                    _url = 'http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + time;
                    break;
            }

            layer = new Cesium.UrlTemplateImageryProvider({
                url: opts.proxy ? new Cesium.Resource({ url: _url, proxy: opts.proxy }) : _url,
                subdomains: ['1', '2', '3', '4'],
                maximumLevel: 18
            });
            break;
        case "www_baidu":
            //百度
            layer = new _BaiduImageryProvider.BaiduImageryProvider(opts);
            break;
        case "www_google":
            //谷歌国内   
            var _url;

            if (item.crs == '4326' || item.crs == 'wgs84') {
                //wgs84   无偏移
                switch (opts.layer) {
                    default:
                    case "img_d":
                        _url = 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}';
                        break;
                }
            } else {
                //有偏移  
                switch (opts.layer) {
                    case "vec":
                    default:
                        _url = 'http://mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile';
                        break;
                    case "img_d":
                        _url = 'http://mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali';
                        break;
                    case "img_z":
                        _url = 'http://mt{s}.google.cn/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil';
                        break;
                    case "ter":
                        _url = 'http://mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile';
                        break;
                }
            }

            layer = new Cesium.UrlTemplateImageryProvider({
                url: opts.proxy ? new Cesium.Resource({ url: _url, proxy: opts.proxy }) : _url,
                subdomains: ['1', '2', '3'],
                maximumLevel: 20
            });
            break;

        case "www_osm":
            //OSM开源地图 
            var _url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            layer = new Cesium.UrlTemplateImageryProvider({
                url: opts.proxy ? new Cesium.Resource({ url: _url, proxy: opts.proxy }) : _url,
                subdomains: "abc",
                maximumLevel: 18
            });
            break;
        case "www_bing":
            //bing地图 

            var _url = 'https://dev.virtualearth.net';
            //无标记影像 Aerial,
            //有英文标记影像   AerialWithLabels,
            //矢量道路  Road 
            //OrdnanceSurvey,
            //CollinsBart
            var style = opts.layer || Cesium.BingMapsStyle.Aerial;
            layer = new Cesium.BingMapsImageryProvider({
                url: opts.proxy ? new Cesium.Resource({ url: _url, proxy: opts.proxy }) : _url,
                key: opts.key || 'AtkX3zhnRe5fyGuLU30uZw8r3sxdBDnpQly7KfFTCB2rGlDgXBG3yr-qEiQEicEc',
                mapStyle: style
            });
            break;

        //===============内部定义的图层====================
        case "custom_grid":
            //网格线  
            opts.cells = opts.cells || 2;
            opts.color = Cesium.Color.fromCssColorString(opts.color || 'rgba(255,255,255,0.5)');
            opts.glowWidth = opts.glowWidth || 3;
            opts.glowColor = Cesium.Color.fromCssColorString(opts.glowColor || 'rgba(255,255,255,0.1)');
            opts.backgroundColor = Cesium.Color.fromCssColorString(opts.backgroundColor || 'rgba(0,0,0,0)');

            layer = new Cesium.GridImageryProvider(opts);
            break;
        case "custom_tilecoord":
            //瓦片信息
            layer = new Cesium.TileCoordinatesImageryProvider(opts);
            break;
        case "custom_featuregrid":
            //自定义矢量网格图层
            layer = new _FeatureGridImageryProvider.FeatureGridImageryProvider(opts);
            break;
        default:
            console.log("config配置图层未处理:" + item);
            break;
    }
    layer.config = opts;

    return layer;
};

function getOneKey(arr) {
    var n = Math.floor(Math.random() * arr.length + 1) - 1;
    return arr[n];
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawBase = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _point = __webpack_require__(1);

var _Class = __webpack_require__(12);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawBase = exports.DrawBase = _Class.Class.extend({
    type: null,
    dataSource: null,
    initialize: function initialize(opts) {
        this.viewer = opts.viewer;
        this.dataSource = opts.dataSource;
        this.primitives = opts.primitives;

        if (!this.dataSource) {
            //没有单独指定Cesium.CustomDataSource时
            this.dataSource = new Cesium.CustomDataSource();
            this.viewer.dataSources.add(this.dataSource);
        }
        this.tooltip = opts.tooltip || new Tooltip(this.viewer.container);
    },
    fire: function fire(type, data, propagate) {
        if (this._fire) this._fire(type, data, propagate);
    },
    formatNum: function formatNum(num, digits) {
        return Util.formatNum(num, digits);
    },
    //激活绘制
    activate: function activate(attribute, drawOkCalback) {
        if (this._enabled) {
            return this;
        }
        this._enabled = true;
        this.drawOkCalback = drawOkCalback;

        this.createFeature(attribute);
        this.entity.inProgress = true;

        this.setCursor(true);
        this.bindEvent();

        this.fire(EventType.DrawStart, { drawtype: this.type, entity: this.entity });

        return this.entity;
    },
    //释放绘制
    disable: function disable(hasWB) {
        if (!this._enabled) {
            return this;
        }
        this._enabled = false;

        this.setCursor(false);

        if (hasWB && this.entity.inProgress) {
            //外部释放时，尚未结束的标绘移除。
            if (this.dataSource && this.dataSource.entities.contains(this.entity)) this.dataSource.entities.remove(this.entity);

            if (this.primitives && this.primitives.contains(this.entity)) this.primitives.remove(this.entity);
        } else {
            this.entity.inProgress = false;
            this.finish();

            if (this.drawOkCalback) {
                this.drawOkCalback(this.entity);
                delete this.drawOkCalback;
            }
            this.fire(EventType.DrawCreated, { drawtype: this.type, entity: this.entity });
        }

        this.destroyHandler();
        this._positions_draw = null;
        this.entity = null;
        this.tooltip.setVisible(false);

        return this;
    },
    createFeature: function createFeature(attribute) {},
    //============= 事件相关 ============= 
    getHandler: function getHandler() {
        if (!this.handler || this.handler.isDestroyed()) {
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        return this.handler;
    },
    destroyHandler: function destroyHandler() {
        this.handler && this.handler.destroy();
        this.handler = undefined;
    },
    setCursor: function setCursor(val) {
        this.viewer._container.style.cursor = val ? 'crosshair' : '';
    },
    //绑定鼠标事件
    bindEvent: function bindEvent() {},
    //坐标位置相关
    _positions_draw: null,
    getDrawPosition: function getDrawPosition() {
        return this._positions_draw;
    },
    //绑定属性到编辑对象  
    _bindEdit: function _bindEdit(_edit) {
        _edit._fire = this._fire;
        _edit.tooltip = this.tooltip;
        return _edit;
    },
    //更新坐标后调用下，更新相关属性，子类使用
    updateAttrForDrawing: function updateAttrForDrawing() {},
    //图形绘制结束后调用
    finish: function finish() {},
    //通用方法
    getCoordinates: function getCoordinates(entity) {
        return this.getAttrClass().getCoordinates(entity);
    },
    getPositions: function getPositions(entity) {
        return this.getAttrClass().getPositions(entity);
    },
    toGeoJSON: function toGeoJSON(entity) {
        return this.getAttrClass().toGeoJSON(entity);
    },
    //属性转entity
    attributeToEntity: function attributeToEntity(attribute, positions) {
        var entity = this.createFeature(attribute);
        this._positions_draw = positions;
        this.updateAttrForDrawing(true);
        this.finish();
        return entity;
    },
    //geojson转entity
    jsonToEntity: function jsonToEntity(geojson) {
        var attribute = geojson.properties;
        var positions = Util.getPositionByGeoJSON(geojson);
        return this.attributeToEntity(attribute, positions);
    },
    //绑定外部entity到标绘
    bindExtraEntity: function bindExtraEntity(entity, attribute) {
        if (attribute && attribute.style) this.style2Entity(attribute.style, entity);

        this._positions_draw = this.getPositions(entity);
        this.updateAttrForDrawing(true);
        this.finish();
        return entity;
    }

});

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_22__;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值
        entityattr = {};
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
            case "scaleByDistance_near":
            case "scaleByDistance_nearValue":
            case "scaleByDistance_far":
            case "scaleByDistance_farValue":
            case "distanceDisplayCondition_far":
            case "distanceDisplayCondition_near":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "color":
                //填充颜色
                entityattr.color = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
            case "scaleByDistance":
                //是否按视距缩放
                if (value) {
                    entityattr.scaleByDistance = new Cesium.NearFarScalar(Number(style.scaleByDistance_near || 1000), Number(style.scaleByDistance_nearValue || 1.0), Number(style.scaleByDistance_far || 1000000), Number(style.scaleByDistance_farValue || 0.1));
                } else {
                    entityattr.scaleByDistance = null;
                }
                break;
            case "distanceDisplayCondition":
                //是否按视距显示
                if (value) {
                    entityattr.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(Number(style.distanceDisplayCondition_near || 0), Number(style.distanceDisplayCondition_far || 100000));
                } else {
                    entityattr.distanceDisplayCondition = null;
                }
                break;

            case "heightReference":
                switch (value) {
                    case "NONE":
                        entityattr.heightReference = Cesium.HeightReference.NONE;
                        break;
                    case "CLAMP_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                        break;
                    case "RELATIVE_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        break;
                    default:
                        entityattr.heightReference = value;
                        break;
                }
                break;

            case "visibleDepth":
                if (value) entityattr.disableDepthTestDistance = 0;else entityattr.disableDepthTestDistance = Number.POSITIVE_INFINITY; //一直显示，不被地形等遮挡

                break;
        }
    }

    //无边框时，需设置宽度为0
    if (!style.outline) entityattr.outlineWidth = 0.0;

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return [entity.position.getValue(Cesium.JulianDate.fromDate(new Date()))];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};

    if (entityattr == null) {
        //默认值
        entityattr = {};
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "silhouette": //跳过扩展其他属性的参数
            case "silhouetteColor":
            case "silhouetteAlpha":
            case "silhouetteSize":
            case "fill":
            case "color":
            case "opacity":
                break;
            case "modelUrl":
                //模型uri
                entityattr.uri = value;
                break;

            case "heightReference":
                switch (value) {
                    case "NONE":
                        entityattr.heightReference = Cesium.HeightReference.NONE;
                        break;
                    case "CLAMP_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                        break;
                    case "RELATIVE_TO_GROUND":
                        entityattr.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        break;
                    default:
                        entityattr.heightReference = value;
                        break;
                }
                break;
        }
    }

    //轮廓
    if (style.silhouette) {
        entityattr.silhouetteColor = new Cesium.Color.fromCssColorString(style.silhouetteColor || "#FFFFFF").withAlpha(Number(style.silhouetteAlpha || 1.0));
        entityattr.silhouetteSize = Number(style.silhouetteSize || 1.0);
    } else entityattr.silhouetteSize = 0.0;

    //透明度、颜色
    var opacity = style.hasOwnProperty('opacity') ? Number(style.opacity) : 1;
    if (style.fill) entityattr.color = new Cesium.Color.fromCssColorString(style.color || "#FFFFFF").withAlpha(opacity);else entityattr.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(opacity);

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    var position = entity.position;
    if (position && position.getValue) position = position.getValue(Cesium.JulianDate.fromDate(new Date()));

    return [position];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LineFlowMaterial = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultColor = new Cesium.Color(0, 0, 0, 0);

//线状 流动效果 材质

var LineFlowMaterial = exports.LineFlowMaterial = function () {
    //========== 构造方法 ========== 
    function LineFlowMaterial(options) {
        _classCallCheck(this, LineFlowMaterial);

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;

        this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
        this._duration = options.duration || 1000; //时长

        var _material = getImageMaterial(options.url, options.repeat, Boolean(options.axisY));
        this._materialType = _material.type; //材质类型
        this._materialImage = _material.image; //材质图片
        this.axisY = Boolean(options.axisY);
        this._time = undefined;
    }

    //========== 对外属性 ==========   


    _createClass(LineFlowMaterial, [{
        key: "getType",


        //========== 方法 ========== 

        /**
         * Gets the {@link Cesium.Material} type at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the type.
         * @returns {String} The type of material.
         */
        value: function getType(time) {
            return this._materialType;
        }

        /**
         * Gets the value of the property at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the value.
         * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
         * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
         */

    }, {
        key: "getValue",
        value: function getValue(time, result) {
            if (!Cesium.defined(result)) {
                result = {};
            }
            result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
            result.image = this._materialImage;
            if (this._time === undefined) {
                this._time = new Date().getTime();
            }
            result.time = (new Date().getTime() - this._time) / this._duration;
            return result;
        }

        /**
         * Compares this property to the provided property and returns
         * <code>true</code> if they are equal, <code>false</code> otherwise.
         *
         * @param {Cesium.Property} [other] The other property.
         * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
         */

    }, {
        key: "equals",
        value: function equals(other) {
            return this === other || //
            other instanceof LineFlowMaterial && Cesium.Property.equals(this._color, other._color);
        }
    }, {
        key: "isConstant",
        get: function get() {
            return false;
        }
    }, {
        key: "definitionChanged",
        get: function get() {
            return this._definitionChanged;
        }
    }]);

    return LineFlowMaterial;
}();

Cesium.defineProperties(LineFlowMaterial.prototype, {
    /**
     * Gets or sets the Cesium.Property specifying the {@link Cesium.Color} of the line.
     * @memberof PolylineGlowMaterialProperty.prototype
     * @type {Cesium.Property}
     */
    color: Cesium.createPropertyDescriptor('color')
});

//静态方法，处理材质
var cacheIdx = 0;
var nameEx = "AnimationLine";
function getImageMaterial(imgurl, repeat, axisY) {
    cacheIdx++;
    var typeName = nameEx + cacheIdx + "Type";
    var imageName = nameEx + cacheIdx + "Image";

    Cesium.Material[typeName] = typeName;
    Cesium.Material[imageName] = imgurl;

    Cesium.Material._materialCache.addMaterial(Cesium.Material[typeName], {
        fabric: {
            type: Cesium.Material.PolylineArrowLinkType,
            uniforms: {
                color: new Cesium.Color(1, 0, 0, 1.0),
                image: Cesium.Material[imageName],
                time: 0,
                repeat: repeat || new Cesium.Cartesian2(1.0, 1.0),
                axisY: axisY
            },
            source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                        {\n\
                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                            vec2 st = repeat * materialInput.st;\n\
                            vec4 colorImage = texture2D(image, vec2(fract((axisY?st.t:st.s) - time), st.t));\n\
                            if(color.a == 0.0)\n\
                            {\n\
                                material.alpha = colorImage.a;\n\
                                material.diffuse = colorImage.rgb; \n\
                            }\n\
                            else\n\
                            {\n\
                                material.alpha = colorImage.a * color.a;\n\
                                material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n\
                            }\n\
                            return material;\n\
                        }"
        },
        translucent: function translucent() {
            return true;
        }
    });

    return {
        type: Cesium.Material[typeName],
        image: Cesium.Material[imageName]
    };
}

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditPolygon = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Attr = __webpack_require__(11);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(14);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditPolygon = exports.EditPolygon = _Edit.EditPolyline.extend({
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;
        this._positions_draw = this.entity._positions_draw || attr.getPositions(this.entity);
        //this.entity.polygon.hierarchy  = new Cesium.CallbackProperty(function (time) {
        //    return that.getPosition();
        //}, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        //this.entity.polygon.hierarchy = this.getPosition();
        this.entity._positions_draw = this.getPosition();
    },
    isClampToGround: function isClampToGround() {
        return this.entity.attribute.style.hasOwnProperty('clampToGround') ? this.entity.attribute.style.clampToGround : !this.entity.attribute.style.perPositionHeight;
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var positions = this.getPosition();
        var hasMidPoint = positions.length < this._maxPointNum; //是否有新增点

        var clampToGround = this.isClampToGround();

        for (var i = 0, len = positions.length; i < len; i++) {
            var loc = positions[i];

            if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                loc = (0, _point.updateHeightForClampToGround)(this.viewer, loc);
                positions[i] = loc;
            }

            //各顶点
            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: loc,
                //clampToGround: clampToGround,
                onDrag: function onDrag(dragger, position) {
                    positions[dragger.index] = position;

                    //============高度调整拖拽点处理=============
                    if (that.heightDraggers && that.heightDraggers.length > 0) {
                        var extrudedHeight = that.entity.polygon.extrudedHeight.getValue(that.viewer.clock.currentTime);
                        that.heightDraggers[dragger.index].position = (0, _point.setPositionsHeight)(position, extrudedHeight);
                    }

                    //============新增点拖拽点处理=============
                    if (hasMidPoint) {
                        var draggersIdx;
                        var nextPositionIdx;
                        //与前一个点之间的中点 
                        if (dragger.index == 0) {
                            draggersIdx = len * 2 - 1;
                            nextPositionIdx = len - 1;
                        } else {
                            draggersIdx = dragger.index * 2 - 1;
                            nextPositionIdx = dragger.index - 1;
                        }
                        var midpoint = Cesium.Cartesian3.midpoint(position, positions[nextPositionIdx], new Cesium.Cartesian3());
                        if (clampToGround) {
                            //贴地时求贴模型和贴地的高度 
                            midpoint = (0, _point.updateHeightForClampToGround)(that.viewer, midpoint);
                        }
                        that.draggers[draggersIdx].position = midpoint;

                        //与后一个点之间的中点 
                        if (dragger.index == len - 1) {
                            draggersIdx = dragger.index * 2 + 1;
                            nextPositionIdx = 0;
                        } else {
                            draggersIdx = dragger.index * 2 + 1;
                            nextPositionIdx = dragger.index + 1;
                        }
                        var midpoint = Cesium.Cartesian3.midpoint(position, positions[nextPositionIdx], new Cesium.Cartesian3());
                        if (clampToGround) {
                            //贴地时求贴模型和贴地的高度 
                            midpoint = (0, _point.updateHeightForClampToGround)(that.viewer, midpoint);
                        }
                        that.draggers[draggersIdx].position = midpoint;
                    }
                }
            });
            dragger.index = i;
            this.draggers.push(dragger);

            //中间点，拖动后新增点
            if (hasMidPoint) {
                var nextIndex = (i + 1) % len;
                var midpoint = Cesium.Cartesian3.midpoint(loc, positions[nextIndex], new Cesium.Cartesian3());

                if (clampToGround) {
                    //贴地时求贴模型和贴地的高度 
                    midpoint = (0, _point.updateHeightForClampToGround)(this.viewer, midpoint);
                }

                var draggerMid = draggerCtl.createDragger(this.dataSource, {
                    position: midpoint,
                    type: draggerCtl.PointType.AddMidPoint,
                    tooltip: _Tooltip.message.dragger.addMidPoint,
                    //clampToGround: clampToGround,
                    onDragStart: function onDragStart(dragger, position) {
                        positions.splice(dragger.index, 0, position); //插入点 
                    },
                    onDrag: function onDrag(dragger, position) {
                        positions[dragger.index] = position;
                    },
                    onDragEnd: function onDragEnd(dragger, position) {
                        that.updateDraggers();
                    }
                });
                draggerMid.index = nextIndex;
                this.draggers.push(draggerMid);
            }
        }

        //创建高程拖拽点
        if (this.entity.polygon.extrudedHeight) this.bindHeightDraggers(this.entity.polygon);
    },
    //高度调整拖拽点
    heightDraggers: null,
    bindHeightDraggers: function bindHeightDraggers(polygon, positions) {
        var that = this;

        this.heightDraggers = [];

        positions = positions || this.getPosition();
        var extrudedHeight = polygon.extrudedHeight.getValue(this.viewer.clock.currentTime);

        for (var i = 0, len = positions.length; i < len; i++) {
            var loc = positions[i];
            loc = (0, _point.setPositionsHeight)(loc, extrudedHeight);

            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: loc,
                type: draggerCtl.PointType.MoveHeight,
                tooltip: _Tooltip.message.dragger.moveHeight,
                onDrag: function onDrag(dragger, position) {
                    var thisHeight = Cesium.Cartographic.fromCartesian(position).height;
                    polygon.extrudedHeight = thisHeight;

                    var maxHeight = (0, _point.getMaxHeight)(that.getPosition());
                    that.entity.attribute.style.extrudedHeight = that.formatNum(thisHeight - maxHeight, 2);

                    that.updateHeightDraggers(thisHeight);
                }
            });

            this.draggers.push(dragger);
            this.heightDraggers.push(dragger);
        }
    },
    updateHeightDraggers: function updateHeightDraggers(extrudedHeight) {
        for (var i = 0; i < this.heightDraggers.length; i++) {
            var heightDragger = this.heightDraggers[i];

            var position = (0, _point.setPositionsHeight)(heightDragger.position.getValue(this.viewer.clock.currentTime), extrudedHeight);
            heightDragger.position.setValue(position);
        }
    }

});

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _CircleWaveMaterial = __webpack_require__(35);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值 
        entityattr = {
            fill: true
        };
    }
    //贴地时，剔除高度相关属性
    if (style.clampToGround) {
        if (style.hasOwnProperty('height')) delete style.height;
        if (style.hasOwnProperty('extrudedHeight')) delete style.extrudedHeight;
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];

        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
            case "color":
            case "animation":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "rotation":
                //旋转角度
                entityattr.rotation = Cesium.Math.toRadians(value);
                break;
            case "height":
                entityattr.height = Number(value);
                if (style.extrudedHeight) entityattr.extrudedHeight = Number(style.extrudedHeight) + Number(value);
                break;
            case "extrudedHeight":
                entityattr.extrudedHeight = Number(entityattr.height || style.height || 0) + Number(value);
                break;
            case "radius":
                //半径（圆）
                entityattr.semiMinorAxis = Number(value);
                entityattr.semiMajorAxis = Number(value);
                break;
        }
    }

    if (style.animation) {
        //动画材质 
        entityattr.material = new _CircleWaveMaterial.CircleWaveMaterial({
            duration: style.animationDuration || 2000, //时长，控制速度
            color: new Cesium.Color.fromCssColorString(style.color || "#FFFF00").withAlpha(Number(style.opacity || 1.0)),
            gradient: style.animationGradient || 0,
            count: style.animationCount || 1
        });
    } else if (style.color) {
        //填充颜色 
        entityattr.material = new Cesium.Color.fromCssColorString(style.color || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
    }

    //如果未设置任何material，设置默认颜色
    if (entityattr.material == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return [entity.position.getValue(Cesium.JulianDate.fromDate(new Date()))];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GeoJsonLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _util = __webpack_require__(4);

var _point = __webpack_require__(1);

var _BaseLayer = __webpack_require__(9);

var _Attr = __webpack_require__(15);

var _Attr2 = __webpack_require__(13);

var _Attr3 = __webpack_require__(10);

var _Attr4 = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GeoJsonLayer = _BaseLayer.BaseLayer.extend({
    dataSource: null,
    //添加 
    add: function add() {
        if (this.dataSource) {
            this.viewer.dataSources.add(this.dataSource);
        } else {
            this.queryData();
        }
    },
    //移除
    remove: function remove() {
        this.viewer.dataSources.remove(this.dataSource);
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        } else {
            if (this.dataSource == null) return;
            //this.viewer.zoomTo(this.dataSource.entities.values); 
            this.viewer.flyTo(this.dataSource.entities.values, { duration: duration });
        }
    },
    //设置透明度
    hasOpacity: true,
    _opacity: 1,
    setOpacity: function setOpacity(value) {
        this._opacity = value;
        if (this.dataSource == null) return;

        var entities = this.dataSource.entities.values;

        for (var i = 0, len = entities.length; i < len; i++) {
            var entity = entities[i];

            if (entity.polygon && entity.polygon.material && entity.polygon.material.color) {
                this._updatEntityAlpha(entity.polygon.material.color, this._opacity);
                if (entity.polygon.outlineColor) {
                    this._updatEntityAlpha(entity.polygon.outlineColor, this._opacity);
                }
            }

            if (entity.polyline && entity.polyline.material && entity.polyline.material.color) {
                this._updatEntityAlpha(entity.polyline.material.color, this._opacity);
            }

            if (entity.billboard) {
                entity.billboard.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(this._opacity);
            }

            if (entity.model) {
                entity.model.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(this._opacity);
            }

            if (entity.label) {
                var _opacity = this._opacity;
                if (entity.attribute && entity.attribute.label && entity.attribute.label.opacity) _opacity = entity.attribute.label.opacity;

                if (entity.label.fillColor) this._updatEntityAlpha(entity.label.fillColor, _opacity);
                if (entity.label.outlineColor) this._updatEntityAlpha(entity.label.outlineColor, _opacity);
                if (entity.label.backgroundColor) this._updatEntityAlpha(entity.label.backgroundColor, _opacity);
            }
        }
    },
    _updatEntityAlpha: function _updatEntityAlpha(color, opacity) {
        var newclr = color.getValue(this.viewer.clock.currentTime);
        if (!newclr || !newclr.withAlpha) return color;

        newclr = newclr.withAlpha(opacity);
        color.setValue(newclr);
    },
    queryData: function queryData() {
        var that = this;

        var config = (0, _util.getProxyUrl)(this.config);

        var dataSource = Cesium.GeoJsonDataSource.load(config.url, config);
        dataSource.then(function (dataSource) {
            that.showResult(dataSource);
        }).otherwise(function (error) {
            that.showError("服务出错", error);
        });
    },
    showResult: function showResult(dataSource) {
        var that = this;

        if (this.dataSource) {
            this.viewer.dataSources.remove(this.dataSource);
        }
        this.dataSource = dataSource;
        this.viewer.dataSources.add(dataSource);

        if (this.config.flyTo) this.centerAt();

        //===========设置样式============= 
        var entities = dataSource.entities.values;
        for (var i = 0, len = entities.length; i < len; i++) {
            var entity = entities[i];

            //样式 
            if (this.config.symbol) {
                if (this.config.symbol == "default") this.setDefSymbol(entity);else this.setConfigSymbol(entity, this.config.symbol);
            }

            //popup弹窗
            if (this.config.columns || this.config.popup) {
                entity.popup = {
                    html: function html(entity) {
                        var attr = that.getEntityAttr(entity);
                        if ((0, _util.isString)(attr)) return attr;else return that.viewer.mars.popup.getPopupForConfig(that.config, attr);
                    },
                    anchor: this.config.popupAnchor || [0, -15]
                };
            }
            if (this.config.tooltip) {
                entity.tooltip = {
                    html: function html(entity) {
                        var attr = that.getEntityAttr(entity);
                        if ((0, _util.isString)(attr)) return attr;else return that.viewer.mars.popup.getPopupForConfig({ popup: that.config.tooltip }, attr);
                    },
                    anchor: this.config.tooltipAnchor || [0, -15]
                };
            }
            if (this.config.click) {
                entity.click = this.config.click;
            }

            if (this.config.mouseover) {
                entity.mouseover = this.config.mouseover;
            }
            if (this.config.mouseout) {
                entity.mouseout = this.config.mouseout;
            }
        }

        if (this._opacity != 1) this.setOpacity(this._opacity);
    },

    getEntityAttr: function getEntityAttr(entity) {
        return entity.properties;
    },
    //默认symbol
    colorHash: {},
    setDefSymbol: function setDefSymbol(entity) {
        var attr = this.getEntityAttr(entity) || {};
        if (entity.polygon) {
            var name = attr.id || attr.OBJECTID || 0;
            var color = this.colorHash[name];
            if (!color) {
                color = Cesium.Color.fromRandom({
                    minimumGreen: 0.75,
                    maximumBlue: 0.75,
                    alpha: this._opacity
                });
                this.colorHash[name] = color;
            }
            entity.polygon.material = color;
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.WHITE;
        } else if (entity.polyline) {
            var name = attr.id || attr.OBJECTID || 0;
            var color = this.colorHash[name];
            if (!color) {
                color = Cesium.Color.fromRandom({
                    minimumGreen: 0.75,
                    maximumBlue: 0.75,
                    alpha: this._opacity
                });
                this.colorHash[name] = color;
            }
            entity.polyline.material = color;
            entity.polyline.width = 2;
        } else if (entity.billboard) {
            entity.billboard.scale = 0.5;
            entity.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
            entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        }
    },
    //外部配置的symbol
    setConfigSymbol: function setConfigSymbol(entity, symbol) {
        var attr = this.getEntityAttr(entity) || {};
        var styleOpt = symbol.styleOptions;

        if (symbol.styleField) {
            //存在多个symbol，按styleField进行分类
            var styleFieldVal = attr[symbol.styleField];
            var styleOptField = symbol.styleFieldOptions[styleFieldVal];
            if (styleOptField != null) {
                styleOpt = (0, _util.clone)(styleOpt);
                styleOpt = _jquery2.default.extend(styleOpt, styleOptField);
            }
        }

        //外部使用代码示例
        // var layerWork = viewer.mars.getLayer(301087, "id")
        // layerWork.config.symbol.calback = function (attr, entity) {
        //     var val = Number(attr["floor"]._value);
        //     if (val < 10)
        //         return { color: "#ff0000" };
        //     else
        //         return { color: "#0000ff" };
        // }
        if (typeof symbol.calback === 'function') {
            //回调方法 
            var styleOptField = symbol.calback(attr, entity, symbol);
            if (!styleOptField) return;

            styleOpt = (0, _util.clone)(styleOpt);
            styleOpt = _jquery2.default.extend(styleOpt, styleOptField);
        }

        styleOpt = styleOpt || {};

        // this._opacity = styleOpt.opacity || 1; //透明度

        if (entity.polyline) {
            (0, _Attr3.style2Entity)(styleOpt, entity.polyline);
        }
        if (entity.polygon) {
            (0, _Attr4.style2Entity)(styleOpt, entity.polygon);

            //加上线宽
            if (styleOpt.outlineWidth && styleOpt.outlineWidth > 1) {
                entity.polygon.outline = false;

                var newopt = {
                    "color": styleOpt.outlineColor,
                    "width": styleOpt.outlineWidth,
                    "opacity": styleOpt.outlineOpacity,
                    "lineType": "solid",
                    "clampToGround": true,
                    "outline": false
                };
                var polyline = (0, _Attr3.style2Entity)(newopt);
                polyline.positions = (0, _Attr4.getPositions)(entity);
                this.dataSource._entityCollection.add({
                    polyline: polyline
                });
            }

            //面时，加上文字标签 
            if (styleOpt.label && styleOpt.label.field) {
                styleOpt.label.heightReference = styleOpt.label.heightReference || Cesium.HeightReference.RELATIVE_TO_GROUND;

                entity.position = (0, _point.centerOfMass)((0, _Attr4.getPositions)(entity));
                entity.label = (0, _Attr2.style2Entity)(styleOpt.label);
                entity.label.text = attr[styleOpt.label.field] || "";
            }

            //是建筑物时
            if (this.config.buildings) {
                var floor = Number(attr[this.config.buildings.cloumn] || 1); //层数
                var height = Number(this.config.buildings.height || 5); //层高

                entity.polygon.extrudedHeight = floor * height;
            }
        }

        if (entity.label) {
            styleOpt.heightReference = styleOpt.heightReference || Cesium.HeightReference.RELATIVE_TO_GROUND;
            (0, _Attr2.style2Entity)(styleOpt, entity.label);
        }
        if (entity.billboard) {
            styleOpt.heightReference = styleOpt.heightReference || Cesium.HeightReference.RELATIVE_TO_GROUND;

            (0, _Attr.style2Entity)(styleOpt, entity.billboard);

            //图标时，加上文字标签 
            if (styleOpt.label && styleOpt.label.field) {
                styleOpt.label.heightReference = styleOpt.label.heightReference || Cesium.HeightReference.RELATIVE_TO_GROUND;

                entity.label = (0, _Attr2.style2Entity)(styleOpt.label);
                entity.label.text = attr[styleOpt.label.field] || "";
            }
        }

        entity.attribute = styleOpt;
    }

});

exports.GeoJsonLayer = GeoJsonLayer;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.init = init;
exports.getDefWindowOptions = getDefWindowOptions;
exports.activate = activate;
exports.getWidget = getWidget;
exports.getClass = getClass;
exports.isActivate = isActivate;
exports.disable = disable;
exports.disableAll = disableAll;
exports.disableGroup = disableGroup;
exports.eachWidget = eachWidget;
exports.bindClass = bindClass;
exports.removeDebugeBar = removeDebugeBar;
exports.getCacheVersion = getCacheVersion;
exports.getBasePath = getBasePath;

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _loader = __webpack_require__(30);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//widget模块公共处理类，勿轻易修改


var basePath = ""; //widgets目录统一前缀，如果widgets目录不在当前页面的同级目录，在其他处时可以传入basePath参数，参数值为：widgets目录相对于当前页面的路径
var defoptions;
var cacheVersion;
var isdebuger;

var thismap;
var widgetsdata = [];

//初始化插件
function init(map, widgetcfg, _basePath) {
    thismap = map;
    widgetcfg = widgetcfg || {};
    basePath = _basePath || "";

    widgetsdata = [];
    defoptions = widgetcfg.defaultOptions || { "windowOptions": { "position": "rt", "maxmin": false, "resize": true }, "autoDisable": true, "disableOhter": true };

    cacheVersion = widgetcfg.version;
    if (cacheVersion == "time") cacheVersion = new Date().getTime();

    //将自启动的加入
    var arrtemp = widgetcfg.widgetsAtStart;
    if (arrtemp && arrtemp.length > 0) {
        for (var i = 0; i < arrtemp.length; i++) {
            var item = arrtemp[i];
            if (!item.hasOwnProperty("uri") || item.uri == "") {
                console.log('widget未配置uri：' + JSON.stringify(item));
                continue;
            }
            if (item.hasOwnProperty("visible") && !item.visible) continue;

            item.autoDisable = false;
            item.openAtStart = true;
            item._nodebug = true;

            bindDefOptions(item);
            widgetsdata.push(item);
        }
    }

    //显示测试栏
    //为了方便测试，所有widget会在页面下侧生成一排按钮，每个按钮对应一个widget，单击后激活对应widget
    isdebuger = widgetcfg["debugger"];
    if (isdebuger) {
        var inhtml = '<div id="widget-testbar" class="widgetbar animation-slide-bottom no-print-view" > ' + '     <div style="height: 30px; line-height:30px;"><b style="color: #4db3ff;">widget测试栏</b>&nbsp;&nbsp;<button  id="widget-testbar-remove"  type="button" class="btn btn-link btn-xs">关闭</button> </div>' + '     <button id="widget-testbar-disableAll" type="button" class="btn btn-info" ><i class="fa fa-globe"></i>漫游</button>' + '</div>';
        (0, _jquery2.default)("body").append(inhtml);

        (0, _jquery2.default)("#widget-testbar-remove").click(function (e) {
            removeDebugeBar();
        });
        (0, _jquery2.default)("#widget-testbar-disableAll").click(function (e) {
            disableAll();
        });
    }

    //将配置的加入
    arrtemp = widgetcfg.widgets;
    if (arrtemp && arrtemp.length > 0) {
        for (var i = 0; i < arrtemp.length; i++) {
            var item = arrtemp[i];
            if (item.type == "group") {
                var inhtml = ' <div class="btn-group dropup">  <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-align-justify"></i>' + item.name + ' <span class="caret"></span></button> <ul class="dropdown-menu">';
                for (var j = 0; j < item.children.length; j++) {
                    var childItem = item.children[j];
                    if (!childItem.hasOwnProperty("uri") || childItem.uri == "") {
                        console.log('widget未配置uri：' + JSON.stringify(childItem));
                        continue;
                    }

                    inhtml += ' <li data-widget="' + childItem.uri + '" class="widget-btn" ><a href="#"><i class="fa fa-star"></i>' + childItem.name + '</a></li>';

                    bindDefOptions(childItem);
                    widgetsdata.push(childItem); //将配置的加入
                }
                inhtml += "</ul></div>";

                if (isdebuger && !item._nodebug) {
                    (0, _jquery2.default)("#widget-testbar").append(inhtml);
                }
            } else {
                if (!item.hasOwnProperty("uri") || item.uri == "") {
                    console.log('widget未配置uri：' + JSON.stringify(item));
                    continue;
                }

                //显示测试栏 
                if (isdebuger && !item._nodebug) {
                    var inhtml = '<button type="button" class="btn btn-primary widget-btn" data-widget="' + item.uri + '"  > <i class="fa fa-globe"></i>' + item.name + ' </button>';
                    (0, _jquery2.default)("#widget-testbar").append(inhtml);
                }

                bindDefOptions(item);
                widgetsdata.push(item); //将配置的加入
            }
        }

        if (isdebuger) {
            (0, _jquery2.default)("#widget-testbar .widget-btn").each(function () {
                (0, _jquery2.default)(this).click(function (e) {
                    var uri = (0, _jquery2.default)(this).attr('data-widget');
                    if (uri == null || uri == "") return;

                    if (isActivate(uri)) {
                        disable(uri);
                    } else {
                        activate(uri);
                    }
                });
            });
        }
    }

    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];

        if (item.openAtStart || item.createAtStart) {
            _arrLoadWidget.push(item);
        }
    }

    (0, _jquery2.default)(window).resize(function () {
        for (var i = 0; i < widgetsdata.length; i++) {
            var item = widgetsdata[i];
            if (item._class) {
                item._class.indexResize(); //BaseWidget: indexResize
            }
        }
    });

    loadWidgetJs();
}

function getDefWindowOptions() {
    return clone(defoptions.windowOptions);
}

function clone(from, to) {
    if (from == null || (typeof from === 'undefined' ? 'undefined' : _typeof(from)) != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function || from.constructor == String || from.constructor == Number || from.constructor == Boolean) return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from) {
        to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
    }

    return to;
}

function bindDefOptions(item) {
    //赋默认值至options（跳过已存在设置值） 
    if (defoptions) {
        for (var aa in defoptions) {
            if (aa == "windowOptions") {
                //for (var jj in defoptions['windowOptions']) {
                //    if (!item['windowOptions'].hasOwnProperty(jj)) {
                //        item['windowOptions'][jj] = defoptions['windowOptions'][jj];
                //    }
                //}
            } else if (!item.hasOwnProperty(aa)) {
                item[aa] = defoptions[aa];
            }
        }
    }

    //赋值内部使用属性 
    item.path = getFilePath(basePath + item.uri);
    item.name = item.name || item.label; //兼容name和label命名
}

//激活指定模块
function activate(item, noDisableOther) {

    if (thismap == null && item.viewer) {
        init(item.viewer);
    }

    //参数是字符串id或uri时
    if (typeof item === 'string') {
        item = { uri: item };

        if (noDisableOther != null) item.disableOhter = !noDisableOther; //是否释放其他已激活的插件 
    } else {
        if (item.uri == null) {
            console.error('activate激活widget时需要uri参数！');
        }
    }

    var thisItem;
    for (var i = 0; i < widgetsdata.length; i++) {
        var othitem = widgetsdata[i];
        if (item.uri == othitem.uri || othitem.id && item.uri == othitem.id) {
            thisItem = othitem;
            if (thisItem.isloading) return thisItem; //激活了正在loading的widget 防止快速双击了菜单

            //赋值
            for (var aa in item) {
                if (aa == "uri") continue;
                thisItem[aa] = item[aa];
            }
            break;
        }
    }
    if (thisItem == null) {
        bindDefOptions(item);
        thisItem = item;
        //非config中配置的，外部传入，首次激活
        widgetsdata.push(item);
    }

    if (isdebuger) console.log('开始激活widget：' + thisItem.uri);

    //释放其他已激活的插件 
    if (thisItem.disableOhter) {
        disableAll(thisItem.uri, thisItem.group);
    } else {
        disableGroup(thisItem.group, thisItem.uri);
    }

    //激活本插件
    if (thisItem._class) {
        if (thisItem._class.isActivate) {
            //已激活时
            if (thisItem._class.update) {
                //刷新
                thisItem._class.update();
            } else {
                //重启
                thisItem._class.disableBase();
                var timetemp = setInterval(function () {
                    if (thisItem._class.isActivate) return;
                    thisItem._class.activateBase();
                    clearInterval(timetemp);
                }, 200);
            }
        } else {
            thisItem._class.activateBase(); // BaseWidget: activateBase
        }
    } else {
        for (var i = 0; i < _arrLoadWidget.length; i++) {
            if (_arrLoadWidget[i].uri == thisItem.uri) //如果已在加载列表中的直接跳出
                return _arrLoadWidget[i];
        }
        _arrLoadWidget.push(thisItem);

        if (_arrLoadWidget.length == 1) {
            loadWidgetJs();
        }
    }
    return thisItem;
}

function getWidget(id) {
    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];

        if (id == item.uri || id == item.id) {
            return item;
        }
    }
}

function getClass(id) {
    var item = getWidget(id);
    if (item) return item._class;else return null;
}

function isActivate(id) {
    var _class = getClass(id);
    if (_class == null) return false;
    return _class.isActivate;
}

function disable(id) {
    if (id == null) return;
    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];

        if (item._class && (id == item.uri || id == item.id)) {
            item._class.disableBase();
            break;
        }
    }
}

//释放所有widget
function disableAll(nodisable, group) {
    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];

        if (group && item.group == group) {
            //同组别的全部释放
        } else {
            if (!item.autoDisable) continue;
        }

        //指定不释放的跳过
        if (nodisable && (nodisable == item.uri || nodisable == item.id)) continue;

        if (item._class) {
            item._class.disableBase(); ////BaseWidget: disableBase
        }
    }
}

//释放同组widget
function disableGroup(group, nodisable) {
    if (group == null) return;

    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];
        if (item.group == group) {
            //指定不释放的跳过
            if (nodisable && (nodisable == item.uri || nodisable == item.id)) continue;
            if (item._class) {
                item._class.disableBase(); ////BaseWidget: disableBase
            }
        }
    }
}

function eachWidget(calback) {
    for (var i = 0; i < widgetsdata.length; i++) {
        var item = widgetsdata[i];
        calback(item);
    }
}

var _arrLoadWidget = [];
var loadItem;
var isloading;
function loadWidgetJs() {
    if (_arrLoadWidget.length == 0) return;

    if (isloading) {
        setTimeout(loadWidgetJs, 500);
        return;
    }
    isloading = true;

    loadItem = _arrLoadWidget[0];
    loadItem.isloading = true;
    var _uri = loadItem.uri;
    if (cacheVersion) {
        if (_uri.indexOf('?') == -1) _uri += "?time=" + cacheVersion;else _uri += "&time=" + cacheVersion;
    }

    if (window.NProgress) {
        NProgress.start();
    }

    if (isdebuger) console.log('开始加载js：' + basePath + _uri);

    _loader.Loader.async([basePath + _uri], function () {
        isloading = false;
        loadItem.isloading = false;
        if (isdebuger) console.log('完成js加载：' + basePath + _uri);

        if (window.NProgress) {
            NProgress.done(true);
        }

        _arrLoadWidget.shift();
        loadWidgetJs();
    });
}

function bindClass(_class) {
    if (loadItem == null) {
        var _jspath = getThisJSPath();
        for (var i = 0; i < widgetsdata.length; i++) {
            var item = widgetsdata[i];
            if (_jspath.endsWith(item.uri)) {
                item.isloading = false;
                item._class = new _class(item, thismap);
                item._class.activateBase(); // BaseWidget: activateBase
                return item._class;
            }
        }
    } else {
        loadItem.isloading = false;
        loadItem._class = new _class(loadItem, thismap);
        loadItem._class.activateBase(); // BaseWidget: activateBase
        return loadItem._class;
    }
}

function getThisJSPath() {
    var jsPath;
    var js = document.scripts;
    for (var i = js.length - 1; i >= 0; i--) {
        jsPath = js[i].src;
        if (jsPath == null || jsPath == "") continue;
        if (jsPath.indexOf("widgets") == -1) continue;
        //jsPath = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
        return jsPath;
    }
    return "";
}

//获取路径
function getFilePath(file) {
    var pos = file.lastIndexOf("/");
    return file.substring(0, pos + 1);
}

function removeDebugeBar() {
    (0, _jquery2.default)("#widget-testbar").remove();
}

function getCacheVersion() {
    return cacheVersion;
}

function getBasePath() {
    return basePath;
}

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

// cssExpr 用于判断资源是否是css
var cssExpr = new RegExp('\\.css');
var nHead = document.head || document.getElementsByTagName('head')[0];
// `onload` 在WebKit < 535.23， Firefox < 9.0 不被支持
var isOldWebKit = +navigator.userAgent.replace(/.*(?:AppleWebKit|AndroidWebKit)\/?(\d+).*/i, '$1') < 536;

// 判断对应的node节点是否已经载入完成
function isReady(node) {
    return node.readyState === 'complete' || node.readyState === 'loaded';
}

// loadCss 用于载入css资源
function loadCss(url, setting, callback) {
    var node = document.createElement('link');

    node.rel = 'stylesheet';
    addOnload(node, callback, 'css');
    node.async = true;
    node.href = url;

    nHead.appendChild(node);
}

// loadJs 用于载入js资源
function loadJs(url, setting, callback) {
    var node = document.createElement('script');

    node.charset = 'utf-8';
    addOnload(node, callback, 'js');
    node.async = !setting.sync;
    node.src = url;

    nHead.appendChild(node);
}

// 在老的webkit中，因不支持load事件，这里用轮询sheet来保证
function pollCss(node, callback) {
    var isLoaded;

    if (node.sheet) {
        isLoaded = true;
    }

    setTimeout(function () {
        if (isLoaded) {
            // 在这里callback 是为了让样式有足够的时间渲染
            callback();
        } else {
            pollCss(node, callback);
        }
    }, 20);
}

// 用于给指定的节点绑定onload回调
// 监听元素载入完成事件
function addOnload(node, callback, type) {
    var supportOnload = 'onload' in node;
    var isCSS = type === 'css';

    // 对老的webkit和老的firefox的兼容
    if (isCSS && (isOldWebKit || !supportOnload)) {
        setTimeout(function () {
            pollCss(node, callback);
        }, 1);
        return;
    }

    if (supportOnload) {
        node.onload = onload;
        node.onerror = function () {
            node.onerror = null;
            //window._cdnFallback(node);
            if (type == "css") console.error("该css文件不存在：" + node.href);else console.error("该js文件不存在：" + node.src);
            onload();
        };
    } else {
        node.onreadystatechange = function () {
            if (isReady(node)) {
                onload();
            }
        };
    }

    function onload() {

        // 执行一次后清除，防止重复执行
        node.onload = node.onreadystatechange = null;

        node = null;

        callback();
    }
}

// 资源下载入口，根绝文件类型的不同，调用loadCss或者loadJs
function loadItem(url, list, setting, callback) {
    // 如果加载的url为空，就直接成功返回
    if (!url) {
        setTimeout(function () {
            onFinishLoading();
        });
        return;
    }

    if (cssExpr.test(url)) {
        loadCss(url, setting, onFinishLoading);
    } else {
        loadJs(url, setting, onFinishLoading);
    }

    // 每次资源下载完成后，检验是否结束整个list下载过程
    // 若已经完成所有下载，执行回调函数
    function onFinishLoading() {
        var urlIndex = list.indexOf(url);
        if (urlIndex > -1) {
            list.splice(urlIndex, 1);
        }

        if (list.length === 0) {
            callback();
        }
    }
}

function doInit(list, setting, callback) {
    var cb = function cb() {
        callback && callback();
    };

    list = Array.prototype.slice.call(list || []);

    if (list.length === 0) {
        cb();
        return;
    }

    for (var i = 0, len = list.length; i < len; i++) {
        loadItem(list[i], list, setting, cb);
    }
}

// 判断当前页面是否加载完
// 加载完，立刻执行下载
// 未加载完，等待页面load事件以后再进行下载
function ready(node, callback) {
    if (isReady(node)) {
        callback();
    } else {
        // 1500ms 以后，直接开始下载资源文件，不再等待load事件
        var timeLeft = 1500;
        var isExecute = false;
        window.addEventListener('load', function () {
            if (!isExecute) {
                callback();
                isExecute = true;
            }
        });

        setTimeout(function () {
            if (!isExecute) {
                callback();
                isExecute = true;
            }
        }, timeLeft);
    }
}

// 暴露出去的Loader
// 提供async, sync两个函数
// async 用作异步下载执行用，不阻塞页面渲染
// sync  用作异步下载，顺序执行，保证下载的js按照数组顺序执行
var Loader = {
    async: function async(list, callback) {

        ready(document, function () {
            doInit(list, {}, callback);
        });
    },

    sync: function sync(list, callback) {

        ready(document, function () {
            doInit(list, {
                sync: true
            }, callback);
        });
    }
};

//window.Loader = Loader;

exports.Loader = Loader;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addImage = addImage;
var image = exports.image = {
    url: null,
    rectangle: null
};

//添加logo 版权图片
function addImage(viewer) {}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ViewerEx = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _Draw = __webpack_require__(16);

var _popup2 = __webpack_require__(73);

var _popup = _interopRequireWildcard(_popup2);

var _tooltip2 = __webpack_require__(74);

var _tooltip = _interopRequireWildcard(_tooltip2);

var _contextmenu2 = __webpack_require__(75);

var _contextmenu = _interopRequireWildcard(_contextmenu2);

var _firstPerson2 = __webpack_require__(39);

var _firstPerson = _interopRequireWildcard(_firstPerson2);

var _util2 = __webpack_require__(4);

var _util = _interopRequireWildcard(_util2);

var _point = __webpack_require__(1);

var point = _interopRequireWildcard(_point);

var _pointconvert = __webpack_require__(19);

var pointconvert = _interopRequireWildcard(_pointconvert);

var _layer = __webpack_require__(20);

var _log = __webpack_require__(88);

var _img = __webpack_require__(31);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//一些默认值的修改【by 木遥】 
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(89.5, 20.4, 110.4, 61.2); //更改默认视域
Cesium.BingMapsApi.defaultKey = 'AtkX3zhnRe5fyGuLU30uZw8r3sxdBDnpQly7KfFTCB2rGlDgXBG3yr-qEiQEicEc'; //，默认 key 
setTimeout(_log.addLog, 600000);

//Viewer扩展

var ViewerEx = exports.ViewerEx = function () {
    //========== 构造方法 ========== 
    function ViewerEx(viewer, config) {
        _classCallCheck(this, ViewerEx);

        this.viewer = viewer;
        this.config = Cesium.defaultValue(config, {});

        this.viewer.mars = this; //要记录下，内部用

        this._isFlyAnimation = false;
        this.crs = Cesium.defaultValue(this.config.crs, '3857'); //坐标系 

        //添加火星图片标识
        (0, _img.addImage)(viewer);

        //优化viewer默认参数相关的
        this._optimization();
        //根据参数进行设置相关的
        this._initForOpts();
        //绑定添加相关控件
        this._addControls();
        //处理图层
        this._initLayers();
    }
    //========== 对外属性 ==========   
    // //裁剪距离 


    _createClass(ViewerEx, [{
        key: '_optimization',


        //========== 方法 ========== 

        //优化viewer默认参数相关的
        value: function _optimization() {
            var that = this;
            var viewer = this.viewer;

            //二三维切换不用动画
            if (this.viewer.sceneModePicker) this.viewer.sceneModePicker.viewModel.duration = 0.0;

            //解决Cesium显示画面模糊的问题 https://zhuanlan.zhihu.com/p/41794242
            this.viewer._cesiumWidget._supportsImageRenderingPixelated = Cesium.FeatureDetection.supportsImageRenderingPixelated();
            this.viewer._cesiumWidget._forceResize = true;
            if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
                var _dpr = window.devicePixelRatio;
                // 适度降低分辨率
                while (_dpr >= 2.0) {
                    _dpr /= 2.0;
                }
                this.viewer.resolutionScale = _dpr;
            }

            //解决限定相机进入地下 https://github.com/AnalyticalGraphicsInc/cesium/issues/5837
            this.viewer.camera.changed.addEventListener(function () {
                if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
                    viewer.camera._suspendTerrainAdjustment = false;
                    viewer.camera._adjustHeightForTerrain();
                }

                if (viewer.scene.camera.positionCartographic.height < -100) {
                    // console.log(viewer.scene.camera.positionCartographic.height);
                    var position = point.setPositionsHeight(viewer.camera.positionWC, 0);
                    viewer.scene.camera.setView({
                        destination: position,
                        orientation: {
                            heading: viewer.camera.heading,
                            pitch: viewer.camera.pitch
                        }
                    });
                }
            });
        }
        //根据参数进行设置相关的

    }, {
        key: '_initForOpts',
        value: function _initForOpts() {
            var that = this;
            this.viewer.cesiumWidget.creditContainer.style.display = "none"; //去cesium logo

            //默认定位地点相关设置，默认home键和初始化镜头视角  
            if (this.viewer.homeButton) {
                this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function (commandInfo) {
                    that.centerAt();
                    commandInfo.cancel = true;
                });
            }
            this.centerAt(null, { duration: 0 });

            //地球一些属性设置
            var scene = this.viewer.scene;
            scene.globe.baseColor = new Cesium.Color.fromCssColorString(this.config.baseColor || "#546a53"); //地表背景色

            if (this.config.backgroundColor) scene.backgroundColor = new Cesium.Color.fromCssColorString(this.config.backgroundColor); //空间背景色


            if (this.config.style) {
                //深度监测
                scene.globe.depthTestAgainstTerrain = this.config.style.testTerrain;

                //光照渲染（阳光照射区域高亮）
                scene.globe.enableLighting = this.config.style.lighting;

                //大气渲染
                scene.skyAtmosphere.show = this.config.style.atmosphere;
                scene.globe.showGroundAtmosphere = this.config.style.atmosphere;

                //雾化效果
                scene.fog.enabled = this.config.style.fog;

                //设置无地球模式 （单模型是可以设置为false）
                scene.globe.show = Cesium.defaultValue(this.config.style.globe, true);
                scene.moon.show = Cesium.defaultValue(this.config.style.moon, scene.globe.show);
                scene.sun.show = Cesium.defaultValue(this.config.style.sun, scene.globe.show);
                scene.skyBox.show = Cesium.defaultValue(this.config.style.skyBox, scene.globe.show);
            }

            //限制缩放级别
            scene.screenSpaceCameraController.maximumZoomDistance = Cesium.defaultValue(this.config.maxzoom, 20000000); //变焦时相机位置的最大值（以米为单位） 
            scene.screenSpaceCameraController.minimumZoomDistance = Cesium.defaultValue(this.config.minzoom, 1); //变焦时相机位置的最小量级（以米为单位）。默认为1.0。


            scene.screenSpaceCameraController._zoomFactor = 2; //鼠标滚轮放大的步长参数 
            scene.screenSpaceCameraController.minimumCollisionTerrainHeight = 15000000; //低于此高度时绕鼠标键绕圈，大于时绕视图中心点绕圈。
        }
        //绑定添加相关控件

    }, {
        key: '_addControls',
        value: function _addControls() {
            //绑定popup
            _popup.init(this.viewer);
            this._popup = _popup;

            //绑定tooltip
            _tooltip.init(this.viewer);
            this._tooltip = _tooltip;

            //绑定右键菜单 
            if (this.config.contextmenu) {
                _contextmenu.init(this.viewer);
                this.contextmenuItems = this.config.contextmenuItems || _contextmenu.defaultContextmenuItems;
                this._contextmenu = _contextmenu;
            }

            //导航工具栏控件
            if (this.config.navigation) {
                this._addNavigationWidget(this.config.navigation);
            }

            //鼠标提示控件
            if (this.config.location) {
                this._addLocationWidget(this.config.location);
            }

            //鼠标滚轮缩放美化样式
            if (this.config.mouseZoom && _util.isPCBroswer()) {
                (0, _jquery2.default)("#" + this.viewer._container.id).append('<div class="cesium-mousezoom"><div class="zoomimg"/></div>');

                var hasUpdateCss = true;
                var timetik = -1;

                var viewer = this.viewer;
                var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
                handler.setInputAction(function (evnet) {
                    if (!hasUpdateCss) return;
                    (0, _jquery2.default)('.cesium-mousezoom').css({
                        top: evnet.endPosition.y + 'px',
                        left: evnet.endPosition.x + 'px'
                    });
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                handler.setInputAction(function (evnet) {
                    (0, _jquery2.default)('.cesium-mousezoom').addClass('cesium-mousezoom-visible');
                    clearTimeout(timetik);
                    timetik = setTimeout(function () {
                        (0, _jquery2.default)('.cesium-mousezoom').removeClass('cesium-mousezoom-visible');
                    }, 200);
                }, Cesium.ScreenSpaceEventType.WHEEL);

                handler.setInputAction(function (evnet) {
                    var position = point.getCurrentMousePosition(viewer.scene, evnet.position);
                    if (!position) return;

                    if (viewer.camera.positionCartographic.height > viewer.scene.screenSpaceCameraController.minimumCollisionTerrainHeight) return;

                    hasUpdateCss = false;
                    clearTimeout(timetik);
                    (0, _jquery2.default)('.cesium-mousezoom').css({
                        top: evnet.position.y + 'px',
                        left: evnet.position.x + 'px'
                    });
                    (0, _jquery2.default)('.cesium-mousezoom').addClass('cesium-mousezoom-visible');
                }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

                handler.setInputAction(function (evnet) {
                    (0, _jquery2.default)('.cesium-mousezoom').removeClass('cesium-mousezoom-visible');
                    hasUpdateCss = true;
                }, Cesium.ScreenSpaceEventType.MIDDLE_UP);
            }
        }
        //处理图层

    }, {
        key: '_initLayers',
        value: function _initLayers() {
            var orderlayers = []; //计算order

            //没baseLayerPicker插件时才按内部规则处理。
            var arrBasemaps = [];
            if (!this.config.baseLayerPicker) {
                var layersCfg = this.config.basemaps;
                if (layersCfg && layersCfg.length > 0) {
                    for (var i = 0; i < layersCfg.length; i++) {
                        var item = layersCfg[i];
                        if (item.visible && item.crs) this.crs = item.crs;

                        var layer = (0, _layer.createLayer)(item, this.viewer, this.config.serverURL);
                        if (layer) arrBasemaps.push(layer);

                        orderlayers.push(item);
                        if (item.type == "group" && item.layers) {
                            for (var idx = 0; idx < item.layers.length; idx++) {
                                var childitem = item.layers[idx];
                                orderlayers.push(childitem);
                            }
                        }
                    }
                }
            }
            this.arrBasemaps = arrBasemaps;

            //可叠加图层  
            var arrOperationallayers = [];
            var layersCfg = this.config.operationallayers;
            if (layersCfg && layersCfg.length > 0) {
                for (var i = 0; i < layersCfg.length; i++) {
                    var item = layersCfg[i];
                    var layer = (0, _layer.createLayer)(item, this.viewer, this.config.serverURL);
                    if (layer) arrOperationallayers.push(layer);

                    orderlayers.push(item);
                    if (item.type == "group" && item.layers) {
                        for (var idx = 0; idx < item.layers.length; idx++) {
                            var childitem = item.layers[idx];
                            orderlayers.push(childitem);
                        }
                    }
                }
            }
            this.arrOperationallayers = arrOperationallayers;

            //计算 顺序字段,
            for (var i = 0; i < orderlayers.length; i++) {
                var item = orderlayers[i];

                //计算层次顺序
                var order = Number(item.order);
                if (isNaN(order)) order = i;
                item.order = order;

                //图层的处理
                if (item._layer != null) {
                    item._layer.setZIndex(order);
                }
            }
        }
    }, {
        key: 'getConfig',
        value: function getConfig() {
            return _util.clone(this.config, 5);
        }
    }, {
        key: 'keyboard',
        value: function keyboard(isbind, speedRatio) {
            if (isbind) _firstPerson.bind(this.viewer, speedRatio);else _firstPerson.unbind(this.viewer);
        }
    }, {
        key: 'keyboardAuto',
        value: function keyboardAuto(speedRatio) {
            return _firstPerson.enable(this.viewer, speedRatio);
        }

        //获取指定图层 keyname默认为名称

    }, {
        key: 'getLayer',
        value: function getLayer(key, keyname) {
            if (keyname == null) keyname = "name";

            var layersCfg = this.arrBasemaps;
            if (layersCfg && layersCfg.length > 0) {
                for (var i = 0; i < layersCfg.length; i++) {
                    var item = layersCfg[i];
                    if (item == null || item.config[keyname] != key) continue;
                    return item;
                }
            }

            layersCfg = this.arrOperationallayers;
            if (layersCfg && layersCfg.length > 0) {
                for (var i = 0; i < layersCfg.length; i++) {
                    var item = layersCfg[i];
                    if (item == null || item.config[keyname] != key) continue;
                    return item;
                }
            }
            return null;
        }
        //根据config配置的id或name属性，更新显示指定的地图底图

    }, {
        key: 'changeBasemap',
        value: function changeBasemap(idorname) {
            var layersCfg = this.arrBasemaps;
            for (var i = 0; i < layersCfg.length; i++) {
                var item = layersCfg[i];
                if (item.config.type == "group" && item._layers == null) continue;

                if (idorname == item.config.name || idorname == item.config.id) item.setVisible(true);else item.setVisible(false);
            }
        }
        //是否有地形数据

    }, {
        key: 'hasTerrain',
        value: function hasTerrain() {
            if (this.terrainProvider == null) return false;
            return this.viewer.terrainProvider != _util.getEllipsoidTerrain();
        }
        //更新地形，参数传入是否显示地形

    }, {
        key: 'updateTerrainProvider',
        value: function updateTerrainProvider(isStkTerrain) {
            if (isStkTerrain) {
                if (this.terrainProvider == null) {
                    var cfg = this.config.terrain;
                    if (cfg.url) {
                        if (this.config.serverURL) {
                            cfg.url = cfg.url.replace('$serverURL$', this.config.serverURL);
                        }
                        cfg.url = cfg.url.replace('$hostname$', location.hostname).replace('$host$', location.host);
                    }
                    this.terrainProvider = _util.getTerrainProvider(cfg);
                }
                this.viewer.terrainProvider = this.terrainProvider;
            } else {
                this.viewer.terrainProvider = _util.getEllipsoidTerrain();
            }
        }

        //获取当前地图坐标系，值为gcj时表示是国测局偏移坐标

    }, {
        key: 'getCrs',
        value: function getCrs() {
            return this.crs;
        }
        //在不同坐标系情况下，转换“目标坐标值”至“地图坐标系”一致的坐标

    }, {
        key: 'point2map',
        value: function point2map(point) {
            if (this.crs == "gcj") {
                var point_clone = _util.clone(point);

                var newpoint = pointconvert.wgs2gcj([point_clone.x, point_clone.y]);
                point_clone.x = newpoint[0];
                point_clone.y = newpoint[1];
                return point_clone;
            } else if (this.crs == "baidu") {
                var point_clone = _util.clone(point);

                var newpoint = pointconvert.wgs2bd([point_clone.x, point_clone.y]);
                point_clone.x = newpoint[0];
                point_clone.y = newpoint[1];
                return point_clone;
            } else {
                return point;
            }
        }
        //在不同坐标系情况下 ，获取地图上的坐标后，转为wgs标准坐标系坐标值

    }, {
        key: 'point2wgs',
        value: function point2wgs(point) {
            if (this.crs == "gcj") {
                var point_clone = _util.clone(point);
                var newpoint = pointconvert.gcj2wgs([point_clone.x, point_clone.y]);
                point_clone.x = newpoint[0];
                point_clone.y = newpoint[1];
                return point_clone;
            } else if (this.crs == "baidu") {
                var point_clone = _util.clone(point);
                var newpoint = pointconvert.bd2gcj([point_clone.x, point_clone.y]);
                point_clone.x = newpoint[0];
                point_clone.y = newpoint[1];
                return point_clone;
            } else {
                return point;
            }
        }

        //定位到 多个区域  顺序播放

    }, {
        key: 'centerAtArr',
        value: function centerAtArr(arr, enfun) {
            this.cancelCenterAt();

            this.arrCenterTemp = arr;
            this._isCenterAtArr = true;
            this._centerAtArrItem(0, enfun);
        }
    }, {
        key: '_centerAtArrItem',
        value: function _centerAtArrItem(i, enfun) {
            var that = this;
            if (!this._isCenterAtArr || i < 0 || i >= this.arrCenterTemp.length) {
                this._isCenterAtArr = false;
                //console.log('centerAtArr视角切换全部结束');
                if (enfun) enfun();
                return;
            }
            var centeropt = this.arrCenterTemp[i];

            //console.log('centerAtArr开始视角切换，第' + i + '点');
            if (centeropt.onStart) centeropt.onStart();

            this.centerAt(centeropt, {
                duration: centeropt.duration,
                complete: function complete() {
                    if (centeropt.onEnd) centeropt.onEnd();

                    var stopTime = Cesium.defaultValue(centeropt.stop, 1);
                    //console.log('centerAtArr第' + i + '点切换结束，将在此停留' + stopTime + '秒');

                    setTimeout(function () {
                        that._centerAtArrItem(++i, enfun);
                    }, stopTime * 1000);
                },
                cancle: function cancle() {
                    this._isCenterAtArr = false;
                    if (enfun) enfun();
                }
            });
        }
    }, {
        key: 'cancelCenterAt',
        value: function cancelCenterAt() {
            this._isCenterAtArr = false;
            this.viewer.camera.flyTo({
                destination: this.viewer.camera.position,
                orientation: {
                    heading: this.viewer.camera.heading,
                    pitch: this.viewer.camera.pitch,
                    roll: this.viewer.camera.roll
                },
                duration: 0
            });
        }

        //地球定位至指定区域 

    }, {
        key: 'centerAt',
        value: function centerAt(centeropt, options) {
            if (options == null) options = {};else if (_util.isNumber(options)) options = { duration: options }; //兼容旧版本


            if (centeropt == null) {
                //让镜头飞行（动画）到配置默认区域 
                options.isWgs84 = true;
                centeropt = this.config.extent || this.config.center || { "y": 17.196575, "x": 114.184276, "z": 9377198, "heading": 0, "pitch": -80, "roll": 0 };
            }

            if (centeropt.xmin && centeropt.xmax && centeropt.ymin && centeropt.ymax) {
                //使用extent配置
                var xmin = centeropt.xmin;
                var xmax = centeropt.xmax;
                var ymin = centeropt.ymin;
                var ymax = centeropt.ymax;

                if (options.isWgs84) {
                    //坐标转换为wgs
                    var pt1 = this.point2map({ x: xmin, y: ymin });
                    xmin = pt1.x;
                    ymin = pt1.y;

                    var pt2 = this.point2map({ x: xmax, y: ymax });
                    xmax = pt2.x;
                    ymax = pt2.y;
                }

                var rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
                this.viewer.camera.flyTo({
                    destination: rectangle,
                    duration: options.duration,
                    complete: options.complete
                });
            } else {
                //使用xyz 
                if (options.isWgs84) centeropt = this.point2map(centeropt);

                var height = Cesium.defaultValue(options.minz, 2500);
                if (this.viewer.camera.positionCartographic.height < height) height = this.viewer.camera.positionCartographic.height;
                if (centeropt.z != null && centeropt.z != 0) height = centeropt.z;

                this.viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(centeropt.x, centeropt.y, height), //经度、纬度、高度 
                    orientation: {
                        heading: Cesium.Math.toRadians(Cesium.defaultValue(centeropt.heading, 0)), //绕垂直于地心的轴旋转
                        pitch: Cesium.Math.toRadians(Cesium.defaultValue(centeropt.pitch, -90)), //绕纬度线旋转
                        roll: Cesium.Math.toRadians(Cesium.defaultValue(centeropt.roll, 0)) //绕经度线旋转
                    },
                    duration: options.duration,
                    complete: options.complete
                });
            }
        }

        //是否在调用了openFlyAnimation正在进行飞行动画

    }, {
        key: 'isFlyAnimation',
        value: function isFlyAnimation() {
            return this._isFlyAnimation;
        }
        //开场动画，动画播放地球飞行定位指指定区域（默认为config.josn中配置的视域）

    }, {
        key: 'openFlyAnimation',
        value: function openFlyAnimation(endfun, centeropt) {
            var that = this;
            var viewer = this.viewer;
            var view = centeropt || point.getCameraView(viewer); //默认为原始视角

            this._isFlyAnimation = true;
            viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(-85.16, 13.71, 23000000.0)
            });
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(view.x, view.y, 23000000.0),
                duration: 2,
                easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                complete: function complete() {
                    var z = Cesium.defaultValue(view.z, 90000);
                    if (z < 200000 && view.pitch != -90) {
                        z = z * 1.2 + 8000;
                        viewer.camera.flyTo({
                            destination: Cesium.Cartesian3.fromDegrees(view.x, view.y, z),
                            complete: function complete() {
                                that.centerAt(view, {
                                    duration: 2,
                                    complete: function complete() {
                                        that._isFlyAnimation = false;
                                        if (endfun) endfun();
                                    }
                                });
                            }
                        });
                    } else {
                        that.centerAt(view, {
                            complete: function complete() {
                                that._isFlyAnimation = false;
                                if (endfun) endfun();
                            }
                        });
                    }
                }
            });
        }
        //旋转地球 

    }, {
        key: 'rotateAnimation',
        value: function rotateAnimation(endfun, duration) {
            var viewer = this.viewer;

            var first = point.getCameraView(viewer); //默认为原始视角
            var duration3 = duration / 3;

            //动画 1/3
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(first.x + 120, first.y, first.z),
                orientation: {
                    heading: Cesium.Math.toRadians(first.heading),
                    pitch: Cesium.Math.toRadians(first.pitch),
                    roll: Cesium.Math.toRadians(first.roll)
                },
                duration: duration3,
                easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                complete: function complete() {

                    //动画 2/3
                    viewer.camera.flyTo({
                        destination: Cesium.Cartesian3.fromDegrees(first.x + 240, first.y, first.z),
                        orientation: {
                            heading: Cesium.Math.toRadians(first.heading),
                            pitch: Cesium.Math.toRadians(first.pitch),
                            roll: Cesium.Math.toRadians(first.roll)
                        },
                        duration: duration3,
                        easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                        complete: function complete() {

                            //动画 3/3
                            viewer.camera.flyTo({
                                destination: Cesium.Cartesian3.fromDegrees(first.x, first.y, first.z),
                                orientation: {
                                    heading: Cesium.Math.toRadians(first.heading),
                                    pitch: Cesium.Math.toRadians(first.pitch),
                                    roll: Cesium.Math.toRadians(first.roll)
                                },
                                duration: duration3,
                                easingFunction: Cesium.EasingFunction.LINEAR_NONE,
                                complete: function complete() {
                                    if (endfun) endfun();
                                }
                            });
                            //动画3/3 end 
                        }
                    });
                    //动画2/3 end
                }
            });
            //动画1/3 end
        }

        //添加“鼠标经纬度提示”控件

    }, {
        key: '_addLocationWidget',
        value: function _addLocationWidget(item) {
            var viewer = this.viewer;

            var inhtml = '<div id="location_mars_jwd"  class="location-bar animation-slide-bottom no-print" ></div>';
            (0, _jquery2.default)("#" + viewer._container.id).prepend(inhtml);

            if (item.style) (0, _jquery2.default)("#location_mars_jwd").css(item.style);else {
                (0, _jquery2.default)("#location_mars_jwd").css({
                    "left": viewer.animation ? "170px" : "0",
                    "right": "0",
                    "bottom": viewer.timeline ? "25px" : "0"
                });
            }

            item.format = item.format || '<div>视高：{height}米</div><div>俯仰角：{pitch}度</div><div>方向：{heading}度</div><div>海拔：{z}米</div><div>纬度:{y}</div><div>经度:{x}</div>';

            var locationData = {};
            locationData.height = viewer.camera.positionCartographic.height.toFixed(1);
            locationData.heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(0);
            locationData.pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(0);

            var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
            handler.setInputAction(function (movement) {
                var cartesian = point.getCurrentMousePosition(viewer.scene, movement.endPosition);
                if (cartesian) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);

                    locationData.z = cartographic.height.toFixed(1);

                    var jd = Cesium.Math.toDegrees(cartographic.longitude);
                    var wd = Cesium.Math.toDegrees(cartographic.latitude);

                    switch (item.crs) {
                        default:
                            //和地图一致的原坐标
                            var fixedLen = item.hasOwnProperty('toFixed') ? item.toFixed : 6;
                            locationData.x = jd.toFixed(fixedLen);
                            locationData.y = wd.toFixed(fixedLen);
                            break;
                        case "degree":
                            //度分秒形式
                            locationData.x = _util.formatDegree(jd);
                            locationData.y = _util.formatDegree(wd);
                            break;
                        case "project":
                            //投影坐标
                            var fixedLen = item.hasOwnProperty('toFixed') ? item.toFixed : 0;
                            locationData.x = cartesian.x.toFixed(fixedLen);
                            locationData.y = cartesian.y.toFixed(fixedLen);
                            break;

                        case "wgs":
                            //标准wgs84格式坐标
                            var fixedLen = item.hasOwnProperty('toFixed') ? item.toFixed : 6;
                            var wgsPoint = point2wgs({ x: jd, y: wd }); //坐标转换为wgs 
                            locationData.x = wgsPoint.x.toFixed(fixedLen);
                            locationData.y = wgsPoint.y.toFixed(fixedLen);
                            break;
                        case "wgs-degree":
                            //标准wgs84格式坐标
                            var wgsPoint = point2wgs({ x: jd, y: wd }); //坐标转换为wgs 
                            locationData.x = _util.formatDegree(wgsPoint.x);
                            locationData.y = _util.formatDegree(wgsPoint.y);
                            break;
                    }

                    var inhtml = _util.template(item.format, locationData);
                    (0, _jquery2.default)("#location_mars_jwd").html(inhtml);
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            //相机移动结束事件
            viewer.scene.camera.changed.addEventListener(function (event) {
                locationData.height = viewer.camera.positionCartographic.height.toFixed(1);
                locationData.heading = Cesium.Math.toDegrees(viewer.camera.heading).toFixed(0);
                locationData.pitch = Cesium.Math.toDegrees(viewer.camera.pitch).toFixed(0);

                if (locationData.x == null) return;

                var inhtml = _util.template(item.format, locationData);
                (0, _jquery2.default)("#location_mars_jwd").html(inhtml);
            });
        }

        //添加“导航”控件

    }, {
        key: '_addNavigationWidget',
        value: function _addNavigationWidget(item) {
            if (!Cesium.viewerCesiumNavigationMixin) return;

            this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {
                defaultResetView: Cesium.Rectangle.fromDegrees(110, 20, 120, 30),
                enableZoomControls: true
            });

            //比例尺
            if (this.viewer.animation) {
                (0, _jquery2.default)(".distance-legend").css({
                    "left": "150px",
                    "bottom": "25px",
                    "border": "none",
                    "background": "rgba(0, 0, 0, 0)",
                    "z-index": "992"
                });
            } else {
                (0, _jquery2.default)(".distance-legend").css({
                    "left": "-10px",
                    "bottom": "-1px",
                    "border": "none",
                    "background": "rgba(0, 0, 0, 0)",
                    "z-index": "992"
                });
            }

            if (item.legend) (0, _jquery2.default)(".distance-legend").css(item.legend);else (0, _jquery2.default)(".distance-legend").remove();

            //导航球
            if (item.compass) (0, _jquery2.default)(".compass").css(item.compass);else (0, _jquery2.default)(".compass").remove();

            //$(".navigation-controls").css({
            //    "right": "5px",
            //    "bottom": "30px",
            //    "top": "auto"
            //});
            (0, _jquery2.default)(".navigation-controls").remove();
        }

        //销毁资源

    }, {
        key: 'destroy',
        value: function destroy() {
            this._tooltip.destroy();
            this._popup.destroy();
            if (this._contextmenu) this._contextmenu.destroy();
            // this.handler.destroy();
        }
    }, {
        key: 'popup',
        get: function get() {
            return this._popup;
        }
    }, {
        key: 'tooltip',
        get: function get() {
            return this._tooltip;
        }
    }, {
        key: 'contextmenu',
        get: function get() {
            return this._contextmenu;
        }
        //右键菜单 

    }, {
        key: 'contextmenuItems',
        get: function get() {
            return this._contextmenuItems;
        },
        set: function set(val) {
            this._contextmenuItems = val;
        }

        //默认绑定的draw控件

    }, {
        key: 'draw',
        get: function get() {
            if (this._drawControl == null) {
                this._drawControl = new _Draw.Draw(this.viewer, {
                    hasEdit: false
                });
            }
            return this._drawControl;
        }
    }]);

    return ViewerEx;
}();

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值
        entityattr = {};
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
            case "radius":
            case "shape":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "color":
                //填充颜色
                entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
        }
    }

    //管道样式 
    style.radius = style.radius || 10;
    switch (style.shape) {
        default:
        case "pipeline":
            entityattr.shape = getCorridorShape1(style.radius); //（厚度固定为半径的1/3）
            break;
        case "circle":
            entityattr.shape = getCorridorShape2(style.radius);
            break;
        case "star":
            entityattr.shape = getCorridorShape3(style.radius);
            break;
    }

    return entityattr;
}

//管道形状1【内空管道】 radius整个管道的外半径 
function getCorridorShape1(radius) {
    var hd = radius / 3;
    var startAngle = 0;
    var endAngle = 360;

    var pss = [];
    for (var i = startAngle; i <= endAngle; i++) {
        var radians = Cesium.Math.toRadians(i);
        pss.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
    }
    for (var i = endAngle; i >= startAngle; i--) {
        var radians = Cesium.Math.toRadians(i);
        pss.push(new Cesium.Cartesian2((radius - hd) * Math.cos(radians), (radius - hd) * Math.sin(radians)));
    }
    return pss;
}

//管道形状2【圆柱体】 radius整个管道的外半径 
function getCorridorShape2(radius) {
    var startAngle = 0;
    var endAngle = 360;

    var pss = [];
    for (var i = startAngle; i <= endAngle; i++) {
        var radians = Cesium.Math.toRadians(i);
        pss.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
    }
    return pss;
}

//管道形状3【星状】 radius整个管道的外半径 ,arms星角的个数（默认6个角）
function getCorridorShape3(radius, arms) {
    var arms = arms || 6;
    var angle = Math.PI / arms;
    var length = 2 * arms;
    var pss = new Array(length);
    for (var i = 0; i < length; i++) {
        var r = i % 2 === 0 ? radius : radius / 3;
        pss[i] = new Cesium.Cartesian2(Math.cos(i * angle) * r, Math.sin(i * angle) * r);
    }
    return pss;
}

//获取entity的坐标
function getPositions(entity) {
    if (entity._positions_draw && entity._positions_draw.length > 0) return entity._positions_draw; //取绑定的数据

    return entity.polylineVolume.positions.getValue(Cesium.JulianDate.fromDate(new Date()));
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "LineString",
            coordinates: coordinates
        }
    };
}

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值 
        entityattr = {
            fill: true
        };
    }

    //贴地时，剔除高度相关属性
    if (style.clampToGround) {
        if (style.hasOwnProperty('height')) delete style.height;
        if (style.hasOwnProperty('extrudedHeight')) delete style.extrudedHeight;
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "height":
                entityattr.height = Number(value);
                if (style.extrudedHeight) entityattr.extrudedHeight = Number(style.extrudedHeight) + Number(value);
                break;
            case "extrudedHeight":
                entityattr.extrudedHeight = Number(entityattr.height || style.height || 0) + Number(value);
                break;
            case "color":
                //填充颜色
                entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
            case "image":
                //填充图片
                entityattr.material = new Cesium.ImageMaterialProperty({
                    image: style.image,
                    color: new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(Number(style.opacity || 1.0))
                });
                break;
            case "rotation":
                //旋转角度 
                entityattr.rotation = Cesium.Math.toRadians(value);
                if (!style.stRotation) entityattr.stRotation = Cesium.Math.toRadians(value);
                break;
            case "stRotation":
                entityattr.stRotation = Cesium.Math.toRadians(value);
                break;
        }
    }

    //如果未设置任何material，设置默认颜色
    if (entityattr.material == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    if (entity._positions_draw && entity._positions_draw.length > 0) return entity._positions_draw;

    var time = Cesium.JulianDate.fromDate(new Date());

    var re = entity.rectangle.coordinates.getValue(time); //Rectangle
    var height = entity.rectangle.height ? entity.rectangle.height.getValue(time) : 0;

    var pt1 = Cesium.Cartesian3.fromRadians(re.west, re.south, height);
    var pt2 = Cesium.Cartesian3.fromRadians(re.east, re.north, height);
    return [pt1, pt2];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);

    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "MultiPoint",
            coordinates: coordinates
        }
    };
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CircleWaveMaterial = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultColor = new Cesium.Color(0, 0, 0, 0);
var count = 2;
var gradient = 0.1;

//圆形 单个扩散效果 材质 

var CircleWaveMaterial = exports.CircleWaveMaterial = function () {
    //========== 构造方法 ========== 
    function CircleWaveMaterial(options) {
        _classCallCheck(this, CircleWaveMaterial);

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;

        this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
        this._duration = Cesium.defaultValue(options.duration, 1000); //时长
        this._count = Cesium.defaultValue(options.count, count); //圆圈个数
        if (this._count <= 0) this._count = 1;

        this._gradient = Cesium.defaultValue(options.gradient, gradient); //透明度的幂方（0-1）,0表示无虚化效果，1表示虚化成均匀渐变
        if (this._gradient < 0) this._gradient = 0;
        if (this._gradient > 1) this._gradient = 1;

        this._time = undefined;
    }

    //========== 对外属性 ==========  


    _createClass(CircleWaveMaterial, [{
        key: 'getType',


        //========== 方法 ========== 
        /**
         * Gets the {@link Cesium.Material} type at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the type.
         * @returns {String} The type of material.
         */
        value: function getType(time) {
            return Cesium.Material.CircleWaveMaterialType;
        }

        /**
         * Gets the value of the property at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the value.
         * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
         * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
         */

    }, {
        key: 'getValue',
        value: function getValue(time, result) {
            if (!Cesium.defined(result)) {
                result = {};
            }
            result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);

            if (this._time === undefined) {
                this._time = new Date().getTime();
            }
            result.time = (new Date().getTime() - this._time) / this._duration;
            result.count = this._count;
            result.gradient = 1 + 10 * (1 - this._gradient);
            return result;
        }

        /**
         * Compares this property to the provided property and returns
         * <code>true</code> if they are equal, <code>false</code> otherwise.
         *
         * @param { Cesium.Property} [other] The other property.
         * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
         */

    }, {
        key: 'equals',
        value: function equals(other) {
            return this === other || //
            other instanceof CircleWaveMaterial && Cesium.Property.equals(this._color, other._color);
        }
    }, {
        key: 'isConstant',
        get: function get() {
            return false;
        }
    }, {
        key: 'definitionChanged',
        get: function get() {
            return this._definitionChanged;
        }
    }]);

    return CircleWaveMaterial;
}();

Cesium.defineProperties(CircleWaveMaterial.prototype, {
    /**
     * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
     * @memberof PolylineGlowMaterialProperty.prototype
     * @type { Cesium.Property}
     */
    color: Cesium.createPropertyDescriptor('color')
});

//静态方法，处理材质
Cesium.Material.CircleWaveMaterialType = 'CircleWaveMaterial'; /**  渐变的气泡 */
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleWaveMaterialType, {
    fabric: {
        type: Cesium.Material.CircleWaveMaterialType,
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            time: 1,
            count: count,
            gradient: gradient
        },
        source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    material.diffuse = 1.5 * color.rgb;\n\
                    vec2 st = materialInput.st;\n\
                    vec3 str = materialInput.str;\n\
                    float dis = distance(st, vec2(0.5, 0.5));\n\
                    float per = fract(time);\n\
                    if(abs(str.z)>0.001){\n\
                        discard;\n\
                    }\n\
                    if(dis >0.5){\n\
                        discard;\n\
                    }else {\n\
                        float perDis = 0.5/count;\n\
                        float disNum;\n\
                        float bl = .0;\n\
                        for(int i=0;i<=999;i++){\n\
                            if(float(i)<=count){\n\
                                disNum = perDis*float(i) - dis + per/count;\n\
                                if(disNum>0.0){\n\
                                    if(disNum<perDis){\n\
                                        bl = 1.0-disNum/perDis;\n\
                                    }\n\
                                    else if(disNum-perDis<perDis){\n\
                                        bl = 1.0 - abs(1.0-disNum/perDis);\n\
                                    }\n\
                                    material.alpha = pow(bl,gradient);\n\
                                }\n\
                            }\n\
                        }\n\
                    }\n\
                    return material;\n\
                }"
    },
    translucent: function translucent() {
        return true;
    }
});

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
//椭球体
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值 
        entityattr = {
            fill: true
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
            case "widthRadii":
            case "heightRadii":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "color":
                //填充颜色
                entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
            case "extentRadii":
                //球体长宽高半径
                var extentRadii = style.extentRadii || 100;
                var widthRadii = style.widthRadii || 100;
                var heightRadii = style.heightRadii || 100;
                entityattr.radii = new Cesium.Cartesian3(extentRadii, widthRadii, heightRadii);
                break;
        }
    }

    //如果未设置任何material，设置默认颜色
    if (entityattr.material == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return [entity.position.getValue(Cesium.JulianDate.fromDate(new Date()))];
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: { type: "Point", coordinates: coordinates[0] }
    };
}

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _LineFlowMaterial = __webpack_require__(25);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};

    if (!entityattr) {
        entityattr = {
            fill: true
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
            case "color": //填充颜色
            case "materialType":
            case "animationDuration":
            case "animationImage":
            case "animationAxisY":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
        }
    }

    if (style.color || style.materialType) {
        var color = new Cesium.Color.fromCssColorString(style.color || "#FFFF00").withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0)));

        switch (style.materialType) {
            default:
            case "color":
                //实线  
                entityattr.material = color;
                break;
            case "animation":
                //流动线 
                entityattr.material = new _LineFlowMaterial.LineFlowMaterial({ //动画线材质
                    color: color,
                    duration: style.animationDuration || 2000, //时长，控制速度
                    url: style.animationImage, //图片
                    repeat: new Cesium.Cartesian2(style.animationRepeatX || 1, style.animationRepeatY || 1),
                    axisY: style.animationAxisY
                });
                break;
        }
    }

    //如果未设置任何material，设置默认颜色
    if (entityattr.material == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return entity.wall.positions.getValue(Cesium.JulianDate.fromDate(new Date()));
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "LineString",
            coordinates: coordinates
        }
    };
}

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ellipsoid = exports.rectangle = exports.circle = exports.polygon = exports.wall = exports.polylineVolume = exports.polyline = exports.model = exports.point = exports.label = exports.billboard = undefined;
exports.getCoordinates = getCoordinates;
exports.getPositions = getPositions;
exports.toGeoJSON = toGeoJSON;
exports.style2Entity = style2Entity;

var _Attr = __webpack_require__(15);

var billboard = _interopRequireWildcard(_Attr);

var _Attr2 = __webpack_require__(13);

var label = _interopRequireWildcard(_Attr2);

var _Attr3 = __webpack_require__(23);

var point = _interopRequireWildcard(_Attr3);

var _Attr4 = __webpack_require__(24);

var model = _interopRequireWildcard(_Attr4);

var _Attr5 = __webpack_require__(10);

var polyline = _interopRequireWildcard(_Attr5);

var _Attr6 = __webpack_require__(33);

var polylineVolume = _interopRequireWildcard(_Attr6);

var _Attr7 = __webpack_require__(37);

var wall = _interopRequireWildcard(_Attr7);

var _Attr8 = __webpack_require__(11);

var polygon = _interopRequireWildcard(_Attr8);

var _Attr9 = __webpack_require__(27);

var circle = _interopRequireWildcard(_Attr9);

var _Attr10 = __webpack_require__(34);

var rectangle = _interopRequireWildcard(_Attr10);

var _Attr11 = __webpack_require__(36);

var ellipsoid = _interopRequireWildcard(_Attr11);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.billboard = billboard;
exports.label = label;
exports.point = point;
exports.model = model;
exports.polyline = polyline;
exports.polylineVolume = polylineVolume;
exports.wall = wall;
exports.polygon = polygon;
exports.circle = circle;
exports.rectangle = rectangle;
exports.ellipsoid = ellipsoid;


function getAttrClass(entity) {
    if (entity.billboard) return billboard;
    if (entity.point) return point;
    if (entity.label) return label;
    if (entity.model) return model;
    if (entity.polyline) return polyline;
    if (entity.polylineVolume) return polylineVolume;
    if (entity.wall) return wall;
    if (entity.circle) return circle;
    if (entity.polygon) return polygon;
    if (entity.rectangle) return rectangle;
    if (entity.ellipsoid) return ellipsoid;
    return entity;
}

function getCoordinates(entity) {
    return getAttrClass(entity).getCoordinates(entity);
}

function getPositions(entity) {
    return getAttrClass(entity).getPositions(entity);
}

function toGeoJSON(entity) {
    return getAttrClass(entity).toGeoJSON(entity);
}

function style2Entity(style, entity) {
    return getAttrClass(entity).style2Entity(style, entity);
}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.bind = bind;
exports.unbind = unbind;
exports.isEnable = isEnable;
exports.enable = enable;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cameraFunc; //键盘漫游  第一人称漫游

var handler;

var isBind; //是否已经绑定

var customControls = {
    options: {
        able: false,
        step: 200
        // center: undefined,
        // radii: 1000
    },
    events: {
        LEFT_DOWN: undefined,
        MOUSE_MOVE: undefined,
        LEFT_UP: undefined,
        keydown: undefined,
        keyup: undefined,
        clock: undefined
    },
    type: {
        ENLARGE: 0,
        NARROW: 1,
        LEFT_ROTATE: 2,
        RIGHT_ROTATE: 3,
        TOP_ROTATE: 4,
        BOTTOM_ROTATE: 5
    }

    //opts: {
    //     speedRatio: 150,    //平移步长，值越大步长越小。
    //     dirStep: 25,        //相机原地旋转步长，值越大步长越小。
    //     rotateStep: 1.0,    //相机围绕目标点旋转速率，0.3 - 2.0
    //     minPitch: 0.1,      //最小仰角  0 - 1
    //     maxPitch: 0.95,     //最大仰角  0 - 1
    // }
};function bind(viewer, opts) {
    if (isBind) return;
    isBind = true;

    if (!opts) opts = {};
    var speedRatio = opts.speedRatio || 150; //步长比例，值越大步长越小
    var dirStep = opts.dirStep || 25;
    var rotateStep = opts.rotateStep || 1.0;
    var minPitch = opts.minPitch || 0.1;
    var maxPitch = opts.maxPitch || 0.95;

    var scene = viewer.scene;
    var canvas = viewer.canvas;
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function () {
        canvas.focus();
    };
    var ellipsoid = scene.globe.ellipsoid;

    // disable the default event handlers
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

    var startMousePosition;
    var mousePosition;
    var flags = {
        looking: false,
        moveForward: false,
        moveBackward: false,
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false
    };

    //绑定的事件
    handler = new Cesium.ScreenSpaceEventHandler(canvas);
    handler.setInputAction(function (movement) {
        flags.looking = true;
        mousePosition = startMousePosition = Cesium.Cartesian3.clone(movement.position);
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(function (movement) {
        mousePosition = movement.endPosition;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    handler.setInputAction(function (position) {
        flags.looking = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction(function (delta) {
        //在漫游中滚轮滚动可以加速减速
        if (delta > 0) {
            speedRatio = speedRatio * 0.9;
            rotateStep = rotateStep * 1.1;
            dirStep = dirStep * 0.9;
        } else {
            speedRatio = speedRatio * 1.1;
            rotateStep = rotateStep * 0.9;
            dirStep = dirStep * 1.1;
        }
    }, Cesium.ScreenSpaceEventType.WHEEL);

    function getFlagForKeyCode(keyCode) {
        switch (keyCode) {
            //平移
            case 'W'.charCodeAt(0):
                //向前平移镜头，不改变相机朝向以及右方向
                return 'moveForward';
            case 'S'.charCodeAt(0):
                //向后平移镜头，不改变相机朝向以及右方向
                return 'moveBackward';
            case 'D'.charCodeAt(0):
                //向右平移镜头，不改变相机朝向以及右方向
                return 'moveRight';
            case 'A'.charCodeAt(0):
                //向左平移镜头，不改变相机朝向以及右方向
                return 'moveLeft';
            case 'Q'.charCodeAt(0):
                //向上平移镜头，不改变相机朝向以及右方向
                return 'moveUp';
            case 'E'.charCodeAt(0):
                //向下平移镜头，不改变相机朝向以及右方向
                return 'moveDown';

            //相对于相机本身
            case 38:
                //方向键上键
                rotateCamera(customControls.type.TOP_ROTATE); //相机原地上旋转
                break;
            case 37:
                //方向键左键
                rotateCamera(customControls.type.LEFT_ROTATE); //相机原地左旋转
                break;
            case 39:
                //方向键右键
                rotateCamera(customControls.type.RIGHT_ROTATE); //相机原地右旋转
                break;
            case 40:
                //方向键下键
                rotateCamera(customControls.type.BOTTOM_ROTATE); //相机原地下旋转
                break;

            //相对于屏幕中心点
            case 'I'.charCodeAt(0):
            case 104:
                //数字键盘8
                moveCamera(customControls.type.ENLARGE); //向屏幕中心靠近
                break;
            case 'K'.charCodeAt(0):
            case 101:
                //数字键盘5
                moveCamera(customControls.type.NARROW); //向屏幕中心远离
                break;
            case 'J'.charCodeAt(0):
            case 100:
                //数字键盘4
                moveCamera(customControls.type.LEFT_ROTATE); //围绕屏幕中心左旋转
                break;
            case 'L'.charCodeAt(0):
            case 102:
                //数字键盘6
                moveCamera(customControls.type.RIGHT_ROTATE); //围绕屏幕中心右旋转
                break;
            case 'U'.charCodeAt(0):
            case 103:
                //数字键盘7
                moveCamera(customControls.type.TOP_ROTATE); //围绕屏幕中心上旋转
                break;
            case 'O'.charCodeAt(0):
            case 105:
                //数字键盘9
                moveCamera(customControls.type.BOTTOM_ROTATE); //围绕屏幕中心下旋转
                break;

            default:
                break;
        }
        return undefined;
    }

    document.addEventListener('keydown', function (e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = true;
        }
    }, false);

    document.addEventListener('keyup', function (e) {
        var flagName = getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
            flags[flagName] = false;
        }
    }, false);

    //=================平移======================
    function moveForward(distance) {
        //和模型的相机移动不太一样  不是沿着相机目标方向，而是默认向上方向 和 向右 方向的插值方向
        var camera = viewer.camera;
        var direction = camera.direction;
        //获得此位置默认的向上方向  
        var up = Cesium.Cartesian3.normalize(camera.position, new Cesium.Cartesian3());

        // right = direction * up  
        var right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());

        direction = Cesium.Cartesian3.cross(up, right, new Cesium.Cartesian3());

        direction = Cesium.Cartesian3.normalize(direction, direction);
        direction = Cesium.Cartesian3.multiplyByScalar(direction, distance, direction);

        camera.position = Cesium.Cartesian3.add(camera.position, direction, camera.position);
    }

    cameraFunc = function cameraFunc(clock) {
        var camera = viewer.camera;

        if (flags.looking) {
            var width = canvas.clientWidth;
            var height = canvas.clientHeight;

            var x = (mousePosition.x - startMousePosition.x) / width;
            var y = -(mousePosition.y - startMousePosition.y) / height;

            //这计算了，分别向右 和 向上移动的
            var lookFactor = 0.05;
            camera.lookRight(x * lookFactor);
            camera.lookUp(y * lookFactor);

            //获得direction 方向
            var direction = camera.direction;
            //获得此位置默认的向上方向  
            var up = Cesium.Cartesian3.normalize(camera.position, new Cesium.Cartesian3());
            var right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
            up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());

            camera.up = up;
            camera.right = right;
        }

        // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
        var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
        var moveRate = cameraHeight / speedRatio;

        if (flags.moveForward) {
            moveForward(moveRate);
        }
        if (flags.moveBackward) {
            moveForward(-moveRate);
        }
        if (flags.moveUp) {
            camera.moveUp(moveRate);
        }
        if (flags.moveDown) {
            camera.moveDown(moveRate);
        }
        if (flags.moveLeft) {
            camera.moveLeft(moveRate);
        }
        if (flags.moveRight) {
            camera.moveRight(moveRate);
        }
    };
    viewer.clock.onTick.addEventListener(cameraFunc);

    //=================相对于屏幕或相机====================== 
    function resetCameraPos(newCamera) {
        if (!newCamera) return;
        viewer.scene.camera.position = newCamera.position;
        viewer.scene.camera.direction = newCamera.direction;
        viewer.scene.camera.right = newCamera.right;
        viewer.scene.camera.up = newCamera.up;
    }

    function limitAngle(up, position, type) {
        var dotNum = Cesium.Cartesian3.dot(up, Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3()));
        if (type == 'up' && dotNum < minPitch) return false;
        if (type == 'down' && dotNum > maxPitch) return false;
        return true;
    }
    function computedNewPos(camera, dir, rotate) {
        // var step = rotateStep;
        var oldpos = camera.position;
        var winCenter = DiitEarth.point.getCenter(viewer);
        if (!winCenter) return;
        var center = Cesium.Cartesian3.fromDegrees(winCenter.x, winCenter.y, winCenter.z);
        if (!center) return;
        var oldDis = Cesium.Cartesian3.distance(center, oldpos);
        var step = oldDis / 100;
        step = rotate ? step * rotateStep : step;
        var newCamera = {};
        var ray = new Cesium.Ray(oldpos, dir);
        newCamera.position = Cesium.Ray.getPoint(ray, step);

        // var cheight = Cesium.Cartographic.fromCartesian(newCamera.position).height;
        // if (cheight < 500)   return;

        newCamera.direction = camera.direction;
        newCamera.right = camera.right;
        newCamera.up = camera.up;
        if (rotate) {
            var newDir = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(newCamera.position, center, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            ray = new Cesium.Ray(center, newDir);
            newCamera.position = Cesium.Ray.getPoint(ray, oldDis);
            newCamera.direction = Cesium.Cartesian3.negate(newDir, new Cesium.Cartesian3());
            // newCamera.up = camera.up;
            newCamera.up = Cesium.Cartesian3.normalize(newCamera.position, new Cesium.Cartesian3());
            newCamera.right = Cesium.Cartesian3.cross(newCamera.direction, newCamera.up, new Cesium.Cartesian3());
        }
        return newCamera;
    }

    function moveCamera(type) {
        var camera = viewer.scene.camera;
        var newCamera;
        switch (type) {
            case customControls.type.ENLARGE:
                newCamera = computedNewPos(camera, camera.direction);
                break;
            case customControls.type.NARROW:
                newCamera = computedNewPos(camera, Cesium.Cartesian3.negate(camera.direction, new Cesium.Cartesian3()));
                break;
            case customControls.type.LEFT_ROTATE:
                newCamera = computedNewPos(camera, Cesium.Cartesian3.negate(camera.right, new Cesium.Cartesian3()), true);
                break;
            case customControls.type.RIGHT_ROTATE:
                newCamera = computedNewPos(camera, camera.right, true);
                break;
            case customControls.type.TOP_ROTATE:
                var able = limitAngle(Cesium.clone(camera.up), Cesium.clone(camera.position), 'up');
                if (!able) return;
                newCamera = computedNewPos(camera, Cesium.clone(camera.up), true);
                break;
            case customControls.type.BOTTOM_ROTATE:
                var able = limitAngle(Cesium.clone(camera.up), Cesium.clone(camera.position), 'down');
                if (!able) return;
                newCamera = computedNewPos(camera, Cesium.Cartesian3.negate(camera.up, new Cesium.Cartesian3()), true);
                break;
        }
        if (!newCamera) return;
        resetCameraPos(newCamera);
    }

    function rotateCamera(type) {
        if (!viewer) return;
        var winPos = [0, 0];
        var width = viewer.scene.canvas.clientWidth;
        var height = viewer.scene.canvas.clientHeight;
        var step = (width + height) / dirStep;
        switch (type) {
            case customControls.type.LEFT_ROTATE:
                winPos = [-step * width / height, 0];
                break;
            case customControls.type.RIGHT_ROTATE:
                winPos = [step * width / height, 0];
                break;
            case customControls.type.TOP_ROTATE:
                winPos = [0, step];
                break;
            case customControls.type.BOTTOM_ROTATE:
                winPos = [0, -step];
                break;
            default:
                return;
        }
        var x = winPos[0] / width;
        var y = winPos[1] / height;
        //这计算了，分别向右 和 向上移动的
        var lookFactor = 0.05;
        var camera = viewer.camera;
        camera.lookRight(x * lookFactor);
        camera.lookUp(y * lookFactor);

        //获得direction 方向
        var direction = camera.direction;
        //获得此位置默认的向上方向  
        var up = Cesium.Cartesian3.normalize(camera.position, new Cesium.Cartesian3());

        // right = direction * up  
        var right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
        // up = right * direction
        up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());

        camera.up = up;
        camera.right = right;
    }
}
function unbind(viewer) {
    if (!isBind) return;
    isBind = false;

    var scene = viewer.scene;
    var canvas = viewer.canvas;
    scene.screenSpaceCameraController.enableRotate = true;
    scene.screenSpaceCameraController.enableTranslate = true;
    scene.screenSpaceCameraController.enableZoom = true;
    scene.screenSpaceCameraController.enableTilt = true;
    scene.screenSpaceCameraController.enableLook = true;

    if (cameraFunc) {
        viewer.clock.onTick.removeEventListener(cameraFunc);
        cameraFunc = undefined;
    }
    if (handler) {
        handler.destroy();
        handler = undefined;
    }
}

function isEnable() {
    return isBind;
}

function enable(viewer, speedRatio) {
    if (isBind) unbind(viewer);else bind(viewer, speedRatio);

    return isBind;
}

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TileLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _BaseLayer = __webpack_require__(9);

var _layer = __webpack_require__(20);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TileLayer = _BaseLayer.BaseLayer.extend({
    layer: null,
    //添加 
    add: function add() {
        if (this.layer != null) {
            this.remove();
        }
        this.addEx();
        var imageryProvider = this.createImageryProvider(this.config);
        if (imageryProvider == null) return;

        var options = this.config;

        var imageryOpt = {
            show: true, alpha: this._opacity
        };
        if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin && options.rectangle.ymax) {
            var xmin = options.rectangle.xmin;
            var xmax = options.rectangle.xmax;
            var ymin = options.rectangle.ymin;
            var ymax = options.rectangle.ymax;
            var rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
            this.rectangle = rectangle;
            imageryOpt.rectangle = rectangle;
        }
        if (options.brightness) imageryOpt.brightness = options.brightness;
        if (options.contrast) imageryOpt.contrast = options.contrast;
        if (options.hue) imageryOpt.hue = options.hue;
        if (options.saturation) imageryOpt.saturation = options.saturation;
        if (options.gamma) imageryOpt.gamma = options.gamma;
        if (options.maximumAnisotropy) imageryOpt.maximumAnisotropy = options.maximumAnisotropy;
        if (options.minimumTerrainLevel) imageryOpt.minimumTerrainLevel = options.minimumTerrainLevel;
        if (options.maximumTerrainLevel) imageryOpt.maximumTerrainLevel = options.maximumTerrainLevel;

        this.layer = new Cesium.ImageryLayer(imageryProvider, imageryOpt);
        this.layer.config = this.config;

        this.viewer.imageryLayers.add(this.layer);

        this.setZIndex(this.config.order);
    },
    //方便外部继承覆盖该方法
    createImageryProvider: function createImageryProvider(config) {
        return (0, _layer.createImageryProvider)(config); //调用layer.js
    },
    addEx: function addEx() {
        //子类使用

    },
    //移除
    remove: function remove() {
        if (this.layer == null) return;

        this.removeEx();
        this.viewer.imageryLayers.remove(this.layer, true);
        this.layer = null;
    },
    removeEx: function removeEx() {
        //子类使用

    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        if (this.layer == null) return;

        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        } else if (this.rectangle) {
            this.viewer.camera.flyTo({
                destination: this.rectangle,
                duration: duration
            });
        } else {
            var rectangle = this.layer.imageryProvider.rectangle; //arcgis图层等，读取配置信息
            if (rectangle && rectangle != Cesium.Rectangle.MAX_VALUE && rectangle.west > 0 && rectangle.south > 0 && rectangle.east > 0 && rectangle.north > 0) {
                this.viewer.camera.flyTo({
                    destination: rectangle,
                    duration: duration
                });
            }
        }
    },
    //设置透明度
    hasOpacity: true,
    _opacity: 1,
    setOpacity: function setOpacity(value) {
        this._opacity = value;
        if (this.layer == null) return;

        this.layer.alpha = value;
    },
    //设置叠加顺序
    hasZIndex: true,
    setZIndex: function setZIndex(order) {
        if (this.layer == null || order == null) return;

        //先移动到最顶层
        this.viewer.imageryLayers.raiseToTop(this.layer);

        var layers = this.viewer.imageryLayers._layers;
        for (var i = layers.length - 1; i >= 0; i--) {
            if (layers[i] == this.layer) continue;
            var _temp = layers[i].config;
            if (_temp && _temp.order) {
                if (order < _temp.order) {
                    this.viewer.imageryLayers.lower(this.layer);
                }
            }
        }
    }

});

exports.TileLayer = TileLayer;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CustomFeatureGridLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _util = __webpack_require__(4);

var _FeatureGridLayer = __webpack_require__(78);

var _Attr = __webpack_require__(15);

var _Attr2 = __webpack_require__(13);

var _Attr3 = __webpack_require__(10);

var _Attr4 = __webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//分块加载矢量数据公共类
var CustomFeatureGridLayer = _FeatureGridLayer.FeatureGridLayer.extend({
    _cacheGrid: {}, //网格缓存,存放矢量对象id集合
    _cacheFeature: {}, //矢量对象缓存,存放矢量对象和其所对应的网格集合

    _addImageryCache: function _addImageryCache(opts) {
        this._cacheGrid[opts.key] = { opts: opts, isLoading: true };

        var that = this;

        this.getDataForGrid(opts, function (arrdata) {
            if (that._visible) that._showData(opts, arrdata);
        });
    },
    getDataForGrid: function getDataForGrid(opts, calback) {
        //子类可继承, calback为回调方法,calback参数传数据数组

        //直接使用本类,传参方式
        if (this.config.getDataForGrid) {
            this.config.getDataForGrid(opts, calback);
        }
    },
    checkHasBreak: function checkHasBreak(cacheKey) {
        if (!this._visible || !this._cacheGrid[cacheKey]) {
            return true;
        }
        return false;
    },
    _showData: function _showData(opts, arrdata) {
        var cacheKey = opts.key;
        if (this.checkHasBreak[cacheKey]) {
            return; //异步请求结束时,如果已经卸载了网格就直接跳出。
        }

        var that = this;

        var arrIds = [];
        for (var i = 0, len = arrdata.length; i < len; i++) {
            var attributes = arrdata[i];
            var id = attributes[this.config.IdName || 'id'];

            var layer = this._cacheFeature[id];
            if (layer) {
                //已存在
                layer.grid.push(cacheKey);
                this.updateEntity(layer.entity, attributes);
            } else {
                var entity = this.createEntity(opts, attributes, function (entity) {
                    if (that.config.debuggerTileInfo) {
                        //测试用
                        entity._temp_id = id;
                        entity.popup = function (entity) {
                            return JSON.stringify(that._cacheFeature[entity._temp_id].grid);
                        };
                    }
                    that._cacheFeature[id] = {
                        grid: [cacheKey],
                        entity: entity
                    };
                });
                if (entity != null) {
                    if (that.config.debuggerTileInfo) {
                        //测试用
                        entity._temp_id = id;
                        entity.popup = function (entity) {
                            return JSON.stringify(that._cacheFeature[entity._temp_id].grid);
                        };
                    }
                    that._cacheFeature[id] = {
                        grid: [cacheKey],
                        entity: entity
                    };
                }
            }
            arrIds.push(id);
        }

        this._cacheGrid[cacheKey] = this._cacheGrid[cacheKey] || {};
        this._cacheGrid[cacheKey].ids = arrIds;
        this._cacheGrid[cacheKey].isLoading = false;
    },

    createEntity: function createEntity(opts, attributes, calback) {
        //子类可以继承,根据数据创造entity

        //直接使用本类,传参方式
        if (this.config.createEntity) {
            return this.config.createEntity(opts, attributes, calback);
        }
        return null;
    },
    updateEntity: function updateEntity(enetity, attributes) {
        //子类可以继承,更新entity（动态数据时有用）

        //直接使用本类,传参方式
        if (this.config.updateEntity) {
            this.config.updateEntity(enetity, attributes);
        }
    },
    removeEntity: function removeEntity(enetity) {
        //子类可以继承,移除entity

        //直接使用本类,传参方式
        if (this.config.removeEntity) {
            this.config.removeEntity(enetity);
        } else {
            this.dataSource.entities.remove(enetity);
        }
    },
    _removeImageryCache: function _removeImageryCache(opts) {
        var cacheKey = opts.key;
        var layers = this._cacheGrid[cacheKey];
        if (layers) {
            if (layers.ids) {
                for (var i = 0; i < layers.ids.length; i++) {
                    var id = layers.ids[i];
                    var layer = this._cacheFeature[id];
                    if (layer) {
                        layer.grid.remove(cacheKey);
                        if (layer.grid.length == 0) {
                            delete this._cacheFeature[id];
                            this.removeEntity(layer.entity);
                        }
                    }
                }
            }
            delete this._cacheGrid[cacheKey];
        }
    },
    _removeAllImageryCache: function _removeAllImageryCache() {

        if (this.config.removeAllEntity) {
            this.config.removeAllEntity();
        } else {
            this.dataSource.entities.removeAll();
            this.primitives.removeAll();
        }

        this._cacheFeature = {};
        this._cacheGrid = {};
    },
    //移除 
    removeEx: function removeEx() {
        if (this.config.removeAllEntity) {
            this.config.removeAllEntity();
        } else {
            this.dataSource.entities.removeAll();
            this.primitives.removeAll();
        }

        this._cacheFeature = {};
        this._cacheGrid = {};

        this.viewer.dataSources.remove(this.dataSource);
        this.viewer.scene.primitives.remove(this.primitives);
    },
    //重新加载数据
    reload: function reload() {
        var that = this;
        for (var i in this._cacheGrid) {
            var item = this._cacheGrid[i];
            if (item == null || item.opts == null || item.isLoading) continue;

            var opts = item.opts;
            this.getDataForGrid(opts, function (arrdata) {
                that._showData(opts, arrdata);
            });
        }
    },

    //设置透明度
    hasOpacity: true,
    _opacity: 1,
    setOpacity: function setOpacity(value) {
        this._opacity = value;

        for (var i in this._cacheFeature) {
            var entity = this._cacheFeature[i].entity;

            if (entity.polygon && entity.polygon.material && entity.polygon.material.color) {
                this._updatEntityAlpha(entity.polygon.material.color, this._opacity);
                if (entity.polygon.outlineColor) {
                    this._updatEntityAlpha(entity.polygon.outlineColor, this._opacity);
                }
            } else if (entity.polyline && entity.polyline.material && entity.polyline.material.color) {
                this._updatEntityAlpha(entity.polyline.material.color, this._opacity);
            } else if (entity.billboard) {
                entity.billboard.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(this._opacity);

                if (entity.label) {
                    if (entity.label.fillColor) this._updatEntityAlpha(entity.label.fillColor, this._opacity);
                    if (entity.label.outlineColor) this._updatEntityAlpha(entity.label.outlineColor, this._opacity);
                    if (entity.label.backgroundColor) this._updatEntityAlpha(entity.label.backgroundColor, this._opacity);
                }
            }
        }
    },
    _updatEntityAlpha: function _updatEntityAlpha(color, opacity) {
        var newclr = color.getValue(this.viewer.clock.currentTime).withAlpha(opacity);
        color.setValue(newclr);
    },

    //默认symbol
    colorHash: {},
    setDefSymbol: function setDefSymbol(entity) {
        if (entity.polygon) {
            var name = entity.properties.OBJECTID;
            var color = this.colorHash[name];
            if (!color) {
                color = Cesium.Color.fromRandom({
                    minimumGreen: 0.75,
                    maximumBlue: 0.75,
                    alpha: this._opacity
                });
                this.colorHash[name] = color;
            }
            entity.polygon.material = color;
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.WHITE;
        } else if (entity.polyline) {

            var name = entity.properties.OBJECTID;
            var color = this.colorHash[name];
            if (!color) {
                color = Cesium.Color.fromRandom({
                    minimumGreen: 0.75,
                    maximumBlue: 0.75,
                    alpha: this._opacity
                });
                this.colorHash[name] = color;
            }
            entity.polyline.material = color;
            entity.polyline.width = 2;
        } else if (entity.billboard) {
            entity.billboard.scale = 0.5;
            entity.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
            entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        }
    },
    //外部配置的symbol
    setConfigSymbol: function setConfigSymbol(entity, symbol) {
        var attr = entity.properties;
        var styleOpt = symbol.styleOptions;

        if (symbol.styleField) {
            //存在多个symbol,按styleField进行分类
            var styleFieldVal = attr[symbol.styleField];
            var styleOptField = symbol.styleFieldOptions[styleFieldVal];
            if (styleOptField != null) {
                styleOpt = (0, _util.clone)(styleOpt);
                styleOpt = _jquery2.default.extend(styleOpt, styleOptField);
            }
        }

        //外部使用代码示例
        // var layerWork = viewer.mars.getLayer(301087, "id")
        // layerWork.config.symbol.calback = function (attr, entity) {
        //     var val = Number(attr["floor"]._value);
        //     if (val < 10)
        //         return { color: "#ff0000" };
        //     else
        //         return { color: "#0000ff" };
        // }
        if (typeof symbol.calback === 'function') {
            //回调方法 
            var styleOptField = symbol.calback(attr, entity, symbol);
            if (!styleOptField) return;

            styleOpt = (0, _util.clone)(styleOpt);
            styleOpt = _jquery2.default.extend(styleOpt, styleOptField);
        }

        styleOpt = styleOpt || {};

        this._opacity = styleOpt.opacity || 1; //透明度

        if (entity.polygon) {
            (0, _Attr4.style2Entity)(styleOpt, entity.polygon);

            //加上线宽
            if (styleOpt.outlineWidth && styleOpt.outlineWidth > 1) {
                entity.polygon.outline = false;

                var newopt = {
                    "color": styleOpt.outlineColor,
                    "width": styleOpt.outlineWidth,
                    "opacity": styleOpt.outlineOpacity,
                    "lineType": "solid",
                    "outline": false
                };
                var polyline = (0, _Attr3.style2Entity)(newopt);
                polyline.positions = (0, _Attr4.getPositions)(entity);
                this.dataSource.entities.add({
                    polyline: polyline
                });
            }

            //是建筑物时
            if (this.config.buildings) {
                var floor = Number(attr[this.config.buildings.cloumn] || 1); //层数
                var height = Number(this.config.buildings.height || 5); //层高

                entity.polygon.extrudedHeight = floor * height;
            }
        } else if (entity.polyline) {
            (0, _Attr3.style2Entity)(styleOpt, entity.polyline);
        } else if (entity.billboard) {
            entity.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

            (0, _Attr.style2Entity)(styleOpt, entity.billboard);

            //加上文字标签 
            if (styleOpt.label && styleOpt.label.field) {
                styleOpt.label.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;

                entity.label = (0, _Attr2.style2Entity)(styleOpt.label);
                entity.label.text = attr[styleOpt.label.field];
            }
        }
    }

});

exports.CustomFeatureGridLayer = CustomFeatureGridLayer;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getCenter = getCenter;
exports.updateMatrix = updateMatrix;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//获取模型的中心点信息
function getCenter(tileset, transform) {
    var result = {};

    //记录模型原始的中心点
    var boundingSphere = tileset.boundingSphere;
    var position = boundingSphere.center;
    var catographic = Cesium.Cartographic.fromCartesian(position);

    var height = Number(catographic.height.toFixed(2));
    var longitude = Number(Cesium.Math.toDegrees(catographic.longitude).toFixed(6));
    var latitude = Number(Cesium.Math.toDegrees(catographic.latitude).toFixed(6));
    result = { x: longitude, y: latitude, z: height };

    console.log("模型内部原始位置:" + JSON.stringify(result));

    //如果tileset自带世界矩阵矩阵，那么计算放置的经纬度和heading
    if (transform) {
        var matrix = Cesium.Matrix4.fromArray(tileset._root.transform);
        var pos = Cesium.Matrix4.getTranslation(matrix, new Cesium.Cartesian3());
        var wpos = Cesium.Cartographic.fromCartesian(pos);
        if (wpos) {
            result.x = Number(Cesium.Math.toDegrees(wpos.longitude).toFixed(6));
            result.y = Number(Cesium.Math.toDegrees(wpos.latitude).toFixed(6));
            result.z = Number(wpos.height.toFixed(2));

            //取旋转矩阵
            var rotmat = Cesium.Matrix4.getRotation(matrix, new Cesium.Matrix3());
            //默认的旋转矩阵
            var defrotmat = Cesium.Matrix4.getRotation(Cesium.Transforms.eastNorthUpToFixedFrame(pos), new Cesium.Matrix3());

            //计算rotmat 的x轴，在defrotmat 上 旋转
            var xaxis = Cesium.Matrix3.getColumn(defrotmat, 0, new Cesium.Cartesian3());
            var yaxis = Cesium.Matrix3.getColumn(defrotmat, 1, new Cesium.Cartesian3());
            var zaxis = Cesium.Matrix3.getColumn(defrotmat, 2, new Cesium.Cartesian3());

            var dir = Cesium.Matrix3.getColumn(rotmat, 0, new Cesium.Cartesian3());

            dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
            dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
            dir = Cesium.Cartesian3.normalize(dir, dir);

            var heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

            var ay = Cesium.Cartesian3.angleBetween(yaxis, dir);

            if (ay > Math.PI * 0.5) {
                heading = 2 * Math.PI - heading;
            }
            result.heading = Number(Cesium.Math.toDegrees(heading).toFixed(1));

            console.log("模型内部世界矩阵:" + JSON.stringify(result));
        }
    }

    return result;
}

//变换轴，兼容旧版本数据z轴方向不对的情况
//如果可以修改模型json源文件，可以在json文件里面加了一行来修正："gltfUpAxis" : "Z", 
//3dtiles相关计算常用方法
function updateAxis(matrix, axis) {
    if (axis == null) return matrix;

    var rightaxis;
    switch (axis.toUpperCase()) {
        case "Y_UP_TO_Z_UP":
            rightaxis = Cesium.Axis.Y_UP_TO_Z_UP;
            break;
        case "Z_UP_TO_Y_UP":
            rightaxis = Cesium.Axis.Z_UP_TO_Y_UP;
            break;
        case "X_UP_TO_Z_UP":
            rightaxis = Cesium.Axis.X_UP_TO_Z_UP;
            break;
        case "Z_UP_TO_X_UP":
            rightaxis = Cesium.Axis.Z_UP_TO_X_UP;
            break;
        case "X_UP_TO_Y_UP":
            rightaxis = Cesium.Axis.X_UP_TO_Y_UP;
            break;
        case "Y_UP_TO_X_UP":
            rightaxis = Cesium.Axis.Y_UP_TO_X_UP;
            break;
    }
    if (rightaxis == null) return matrix;

    return Cesium.Matrix4.multiplyTransformation(matrix, rightaxis, matrix);
}

//变换模型位置等
function updateMatrix(tileset, opts) {
    var matrix;

    //有自带世界矩阵矩阵 
    if (tileset._root && tileset._root.transform && opts.transform) {
        // var mat = Cesium.Matrix4.fromArray(tileset_root.transform);
        // var pos = Cesium.Matrix4.getTranslation(mat, new Cesium.Cartesian3());
        // var wpos = Cesium.Cartographic.fromCartesian(pos);
        // if (wpos) {  
        // } 

        var position = Cesium.Cartesian3.fromDegrees(opts.x, opts.y, opts.z);
        matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(opts.heading || 0)));
        Cesium.Matrix4.multiply(matrix, rotationX, matrix);

        if (opts.scale > 0 && opts.scale != 1) //缩放比例
            Cesium.Matrix4.multiplyByUniformScale(matrix, opts.scale, matrix);

        if (opts.axis) //变换轴
            matrix = updateAxis(matrix, opts.axis);

        tileset._root.transform = matrix;
    } else {
        //普通,此种方式[x，y不能多次更改]
        var boundingSphere = tileset.boundingSphere;
        var catographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
        var surface = Cesium.Cartesian3.fromRadians(catographic.longitude, catographic.latitude, 0.0);
        var offset = Cesium.Cartesian3.fromDegrees(opts.x, opts.y, opts.z);

        var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        matrix = Cesium.Matrix4.fromTranslation(translation);

        tileset.modelMatrix = matrix;
    }
    return matrix;
}

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RectangularSensorPrimitive = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _RectangularSensorVS = __webpack_require__(104);

var _RectangularSensorVS2 = _interopRequireDefault(_RectangularSensorVS);

var _RectangularSensorFS = __webpack_require__(105);

var _RectangularSensorFS2 = _interopRequireDefault(_RectangularSensorFS);

var _RectangularSensor = __webpack_require__(106);

var _RectangularSensor2 = _interopRequireDefault(_RectangularSensor);

var _RectangularSensorScanPlaneFS = __webpack_require__(107);

var _RectangularSensorScanPlaneFS2 = _interopRequireDefault(_RectangularSensorScanPlaneFS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BoundingSphere = Cesium.BoundingSphere;
var Cartesian3 = Cesium.Cartesian3;
var Color = Cesium.Color;
var combine = Cesium.combine;
var ComponentDatatype = Cesium.ComponentDatatype;
var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
// var defineProperties = Cesium.defineProperties;
// var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var Matrix4 = Cesium.Matrix4;
var PrimitiveType = Cesium.PrimitiveType;
var Buffer = Cesium.Buffer;
var BufferUsage = Cesium.BufferUsage;
var DrawCommand = Cesium.DrawCommand;
var Pass = Cesium.Pass;
var RenderState = Cesium.RenderState;
var ShaderProgram = Cesium.ShaderProgram;
var ShaderSource = Cesium.ShaderSource;
var VertexArray = Cesium.VertexArray;
var BlendingState = Cesium.BlendingState;
var CullFace = Cesium.CullFace;
var Material = Cesium.Material;
var SceneMode = Cesium.SceneMode;
var VertexFormat = Cesium.VertexFormat;
var CesiumMath = Cesium.Math;
var Matrix3 = Cesium.Matrix3;
var Matrix4 = Cesium.Matrix4;
var JulianDate = Cesium.JulianDate;

// var BoxGeometry = Cesium.BoxGeometry;
// var EllipsoidGeometry = Cesium.EllipsoidGeometry;

var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var atan = Math.atan;
var asin = Math.asin;

var attributeLocations = {
    position: 0,
    normal: 1
};

function RectangularSensorPrimitive(options) {
    var self = this;

    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    /**
     * 是否显示
     */
    this.show = defaultValue(options.show, true);

    /**
     * 切分程度
     */
    this.slice = defaultValue(options.slice, 32);

    /**
     * 传感器的模型矩阵
     */
    this.modelMatrix = Matrix4.clone(options.modelMatrix, new Matrix4());
    this._modelMatrix = new Matrix4();
    this._computedModelMatrix = new Matrix4();
    this._computedScanPlaneModelMatrix = new Matrix4();

    /**
     * 传感器的半径
     */
    this.radius = defaultValue(options.radius, Number.POSITIVE_INFINITY);
    this._radius = undefined;

    /**
     * 传感器水平半角
     */
    this.xHalfAngle = defaultValue(options.xHalfAngle, 0);
    this._xHalfAngle = undefined;

    /**
     * 传感器垂直半角
     */
    this.yHalfAngle = defaultValue(options.yHalfAngle, 0);
    this._yHalfAngle = undefined;

    /**
     * 线的颜色
     */
    this.lineColor = defaultValue(options.lineColor, Color.WHITE);

    /**
     * 是否显示扇面的线
     */
    this.showSectorLines = defaultValue(options.showSectorLines, true);

    /**
     * 是否显示扇面和圆顶面连接的线
     */
    this.showSectorSegmentLines = defaultValue(options.showSectorSegmentLines, true);

    /**
     * 是否显示侧面
     */
    this.showLateralSurfaces = defaultValue(options.showLateralSurfaces, true);

    /**
     * 目前用的统一材质
     * @type {Material}
     */
    this.material = defined(options.material) ? options.material : Material.fromType(Material.ColorType);
    this._material = undefined;
    this._translucent = undefined;

    /**
     * 侧面材质
     * @type {Material}
     */
    this.lateralSurfaceMaterial = defined(options.lateralSurfaceMaterial) ? options.lateralSurfaceMaterial : Material.fromType(Material.ColorType);
    this._lateralSurfaceMaterial = undefined;
    this._lateralSurfaceTranslucent = undefined;

    /**
     * 是否显示圆顶表面
     */
    this.showDomeSurfaces = defaultValue(options.showDomeSurfaces, true);

    /**
     * 圆顶表面材质
     * @type {Material}
     */
    this.domeSurfaceMaterial = defined(options.domeSurfaceMaterial) ? options.domeSurfaceMaterial : Material.fromType(Material.ColorType);
    this._domeSurfaceMaterial = undefined;

    /**
     * 是否显示圆顶面线
     */
    this.showDomeLines = defaultValue(options.showDomeLines, true);

    /**
     * 是否显示与地球相交的线
     */
    this.showIntersection = defaultValue(options.showIntersection, true);

    /**
     * 与地球相交的线的颜色
     */
    this.intersectionColor = defaultValue(options.intersectionColor, Color.WHITE);

    /**
     * 与地球相交的线的宽度（像素）
     */
    this.intersectionWidth = defaultValue(options.intersectionWidth, 5.0);

    /**
     * 是否穿过地球
     */
    this.showThroughEllipsoid = defaultValue(options.showThroughEllipsoid, false);
    this._showThroughEllipsoid = undefined;

    /**
     * 是否显示扫描面
     */
    this.showScanPlane = defaultValue(options.showScanPlane, true);

    /**
     * 扫描面颜色
     */
    this.scanPlaneColor = defaultValue(options.scanPlaneColor, Color.WHITE);

    /**
     * 扫描面模式 垂直vertical/水平horizontal
     */
    this.scanPlaneMode = defaultValue(options.scanPlaneMode, 'horizontal');

    /**
     * 扫描速率
     */
    this.scanPlaneRate = defaultValue(options.scanPlaneRate, 10);

    this._scanePlaneXHalfAngle = 0;
    this._scanePlaneYHalfAngle = 0;

    //时间计算的起点
    this._time = JulianDate.now();

    this._boundingSphere = new BoundingSphere();
    this._boundingSphereWC = new BoundingSphere();

    //扇面 sector
    this._sectorFrontCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });
    this._sectorBackCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });
    this._sectorVA = undefined;

    //扇面边线 sectorLine
    this._sectorLineCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.LINES,
        boundingVolume: this._boundingSphereWC
    });
    this._sectorLineVA = undefined;

    //扇面分割线 sectorSegmentLine
    this._sectorSegmentLineCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.LINES,
        boundingVolume: this._boundingSphereWC
    });
    this._sectorSegmentLineVA = undefined;

    //弧面 dome
    this._domeFrontCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });
    this._domeBackCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });
    this._domeVA = undefined;

    //弧面线 domeLine
    this._domeLineCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.LINES,
        boundingVolume: this._boundingSphereWC
    });
    this._domeLineVA = undefined;

    //扫描面 scanPlane/scanRadial
    this._scanPlaneFrontCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });
    this._scanPlaneBackCommand = new DrawCommand({
        owner: this,
        primitiveType: PrimitiveType.TRIANGLES,
        boundingVolume: this._boundingSphereWC
    });

    this._scanRadialCommand = undefined;

    this._colorCommands = [];

    this._frontFaceRS = undefined;
    this._backFaceRS = undefined;
    this._sp = undefined;

    this._uniforms = {
        u_type: function u_type() {
            return 0; //面
        },
        u_xHalfAngle: function u_xHalfAngle() {
            return self.xHalfAngle;
        },
        u_yHalfAngle: function u_yHalfAngle() {
            return self.yHalfAngle;
        },
        u_radius: function u_radius() {
            return self.radius;
        },
        u_showThroughEllipsoid: function u_showThroughEllipsoid() {
            return self.showThroughEllipsoid;
        },
        u_showIntersection: function u_showIntersection() {
            return self.showIntersection;
        },
        u_intersectionColor: function u_intersectionColor() {
            return self.intersectionColor;
        },
        u_intersectionWidth: function u_intersectionWidth() {
            return self.intersectionWidth;
        },
        u_normalDirection: function u_normalDirection() {
            return 1.0;
        },
        u_lineColor: function u_lineColor() {
            return self.lineColor;
        }
    };

    this._scanUniforms = {
        u_xHalfAngle: function u_xHalfAngle() {
            return self._scanePlaneXHalfAngle;
        },
        u_yHalfAngle: function u_yHalfAngle() {
            return self._scanePlaneYHalfAngle;
        },
        u_radius: function u_radius() {
            return self.radius;
        },
        u_color: function u_color() {
            return self.scanPlaneColor;
        },
        u_showThroughEllipsoid: function u_showThroughEllipsoid() {
            return self.showThroughEllipsoid;
        },
        u_showIntersection: function u_showIntersection() {
            return self.showIntersection;
        },
        u_intersectionColor: function u_intersectionColor() {
            return self.intersectionColor;
        },
        u_intersectionWidth: function u_intersectionWidth() {
            return self.intersectionWidth;
        },
        u_normalDirection: function u_normalDirection() {
            return 1.0;
        },
        u_lineColor: function u_lineColor() {
            return self.lineColor;
        }
    };
}

RectangularSensorPrimitive.prototype.update = function (frameState) {
    var mode = frameState.mode;
    if (!this.show || mode !== SceneMode.SCENE3D) {
        return;
    }
    var createVS = false;
    var createRS = false;
    var createSP = false;

    var xHalfAngle = this.xHalfAngle;
    var yHalfAngle = this.yHalfAngle;

    if (xHalfAngle < 0.0 || yHalfAngle < 0.0) {
        throw new DeveloperError('halfAngle must be greater than or equal to zero.');
    }
    if (xHalfAngle == 0.0 || yHalfAngle == 0.0) {
        return;
    }
    if (this._xHalfAngle !== xHalfAngle || this._yHalfAngle !== yHalfAngle) {
        this._xHalfAngle = xHalfAngle;
        this._yHalfAngle = yHalfAngle;
        createVS = true;
    }

    var radius = this.radius;
    if (radius < 0.0) {
        throw new DeveloperError('this.radius must be greater than or equal to zero.');
    }
    var radiusChanged = false;
    if (this._radius !== radius) {
        radiusChanged = true;
        this._radius = radius;
        this._boundingSphere = new BoundingSphere(Cartesian3.ZERO, this.radius);
    }

    var modelMatrixChanged = !Matrix4.equals(this.modelMatrix, this._modelMatrix);
    if (modelMatrixChanged || radiusChanged) {
        Matrix4.clone(this.modelMatrix, this._modelMatrix);
        Matrix4.multiplyByUniformScale(this.modelMatrix, this.radius, this._computedModelMatrix);
        BoundingSphere.transform(this._boundingSphere, this.modelMatrix, this._boundingSphereWC);
    }

    var showThroughEllipsoid = this.showThroughEllipsoid;
    if (this._showThroughEllipsoid !== this.showThroughEllipsoid) {
        this._showThroughEllipsoid = showThroughEllipsoid;
        createRS = true;
    }

    var material = this.material;
    if (this._material !== material) {
        this._material = material;
        createRS = true;
        createSP = true;
    }
    var translucent = material.isTranslucent();
    if (this._translucent !== translucent) {
        this._translucent = translucent;
        createRS = true;
    }

    if (this.showScanPlane) {
        var time = frameState.time;
        var timeDiff = JulianDate.secondsDifference(time, this._time);
        if (timeDiff < 0) {
            this._time = JulianDate.clone(time, this._time);
        }
        var percentage = Math.max(timeDiff % this.scanPlaneRate / this.scanPlaneRate, 0);
        var angle;

        if (this.scanPlaneMode == 'horizontal') {
            angle = 2 * yHalfAngle * percentage - yHalfAngle;
            var cosYHalfAngle = cos(angle);
            var tanXHalfAngle = tan(xHalfAngle);

            var maxX = atan(cosYHalfAngle * tanXHalfAngle);
            this._scanePlaneXHalfAngle = maxX;
            this._scanePlaneYHalfAngle = angle;
            Cesium.Matrix3.fromRotationX(this._scanePlaneYHalfAngle, matrix3Scratch);
        } else {
            angle = 2 * xHalfAngle * percentage - xHalfAngle;
            var tanYHalfAngle = tan(yHalfAngle);
            var cosXHalfAngle = cos(angle);

            var maxY = atan(cosXHalfAngle * tanYHalfAngle);
            this._scanePlaneXHalfAngle = angle;
            this._scanePlaneYHalfAngle = maxY;
            Cesium.Matrix3.fromRotationY(this._scanePlaneXHalfAngle, matrix3Scratch);
        }

        Cesium.Matrix4.multiplyByMatrix3(this.modelMatrix, matrix3Scratch, this._computedScanPlaneModelMatrix);
        Matrix4.multiplyByUniformScale(this._computedScanPlaneModelMatrix, this.radius, this._computedScanPlaneModelMatrix);
    }

    if (createVS) {
        createVertexArray(this, frameState);
    }
    if (createRS) {
        createRenderState(this, showThroughEllipsoid, translucent);
    }
    if (createSP) {
        createShaderProgram(this, frameState, material);
    }
    if (createRS || createSP) {
        createCommands(this, translucent);
    }

    var commandList = frameState.commandList;
    var passes = frameState.passes;
    var colorCommands = this._colorCommands;
    if (passes.render) {
        for (var i = 0, len = colorCommands.length; i < len; i++) {
            var colorCommand = colorCommands[i];
            commandList.push(colorCommand);
        }
    }
};

var matrix3Scratch = new Matrix3();
var nScratch = new Cartesian3();

//region -- VertexArray --

/**
 * 计算zoy面和zoy面单位扇形位置
 * @param primitive
 * @returns {{zoy: Array, zox: Array}}
 */
function computeUnitPosiiton(primitive, xHalfAngle, yHalfAngle) {
    var slice = primitive.slice;

    //以中心为角度
    var cosYHalfAngle = cos(yHalfAngle);
    var tanYHalfAngle = tan(yHalfAngle);
    var cosXHalfAngle = cos(xHalfAngle);
    var tanXHalfAngle = tan(xHalfAngle);

    var maxY = atan(cosXHalfAngle * tanYHalfAngle);
    var maxX = atan(cosYHalfAngle * tanXHalfAngle);

    //ZOY面单位圆
    var zoy = [];
    for (var i = 0; i < slice; i++) {
        var phi = 2 * maxY * i / (slice - 1) - maxY;
        zoy.push(new Cartesian3(0, sin(phi), cos(phi)));
    }
    //zox面单位圆
    var zox = [];
    for (var i = 0; i < slice; i++) {
        var phi = 2 * maxX * i / (slice - 1) - maxX;
        zox.push(new Cartesian3(sin(phi), 0, cos(phi)));
    }

    return {
        zoy: zoy,
        zox: zox
    };
}

/**
 * 计算扇面的位置
 * @param unitPosition
 * @returns {Array}
 */
function computeSectorPositions(primitive, unitPosition) {
    var xHalfAngle = primitive.xHalfAngle,
        yHalfAngle = primitive.yHalfAngle,
        zoy = unitPosition.zoy,
        zox = unitPosition.zox;
    var positions = [];

    //zoy面沿y轴逆时针转xHalfAngle
    var matrix3 = Matrix3.fromRotationY(xHalfAngle, matrix3Scratch);
    positions.push(zoy.map(function (p) {
        return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
    }));
    //zox面沿x轴顺时针转yHalfAngle
    var matrix3 = Matrix3.fromRotationX(-yHalfAngle, matrix3Scratch);
    positions.push(zox.map(function (p) {
        return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
    }).reverse());
    //zoy面沿y轴顺时针转xHalfAngle
    var matrix3 = Matrix3.fromRotationY(-xHalfAngle, matrix3Scratch);
    positions.push(zoy.map(function (p) {
        return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
    }).reverse());
    //zox面沿x轴逆时针转yHalfAngle
    var matrix3 = Matrix3.fromRotationX(yHalfAngle, matrix3Scratch);
    positions.push(zox.map(function (p) {
        return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
    }));
    return positions;
}

/**
 * 创建扇面顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorVertexArray(context, positions) {
    var planeLength = Array.prototype.concat.apply([], positions).length - positions.length;
    var vertices = new Float32Array(2 * 3 * 3 * planeLength);

    var k = 0;
    for (var i = 0, len = positions.length; i < len; i++) {
        var planePositions = positions[i];
        var n = Cartesian3.normalize(Cartesian3.cross(planePositions[0], planePositions[planePositions.length - 1], nScratch), nScratch);
        for (var j = 0, planeLength = planePositions.length - 1; j < planeLength; j++) {
            vertices[k++] = 0.0;
            vertices[k++] = 0.0;
            vertices[k++] = 0.0;
            vertices[k++] = -n.x;
            vertices[k++] = -n.y;
            vertices[k++] = -n.z;

            vertices[k++] = planePositions[j].x;
            vertices[k++] = planePositions[j].y;
            vertices[k++] = planePositions[j].z;
            vertices[k++] = -n.x;
            vertices[k++] = -n.y;
            vertices[k++] = -n.z;

            vertices[k++] = planePositions[j + 1].x;
            vertices[k++] = planePositions[j + 1].y;
            vertices[k++] = planePositions[j + 1].z;
            vertices[k++] = -n.x;
            vertices[k++] = -n.y;
            vertices[k++] = -n.z;
        }
    }

    var vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: vertices,
        usage: BufferUsage.STATIC_DRAW
    });

    var stride = 2 * 3 * Float32Array.BYTES_PER_ELEMENT;

    var attributes = [{
        index: attributeLocations.position,
        vertexBuffer: vertexBuffer,
        componentsPerAttribute: 3,
        componentDatatype: ComponentDatatype.FLOAT,
        offsetInBytes: 0,
        strideInBytes: stride
    }, {
        index: attributeLocations.normal,
        vertexBuffer: vertexBuffer,
        componentsPerAttribute: 3,
        componentDatatype: ComponentDatatype.FLOAT,
        offsetInBytes: 3 * Float32Array.BYTES_PER_ELEMENT,
        strideInBytes: stride
    }];

    return new VertexArray({
        context: context,
        attributes: attributes
    });
}

/**
 * 创建扇面边线顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorLineVertexArray(context, positions) {
    var planeLength = positions.length;
    var vertices = new Float32Array(3 * 3 * planeLength);

    var k = 0;
    for (var i = 0, len = positions.length; i < len; i++) {
        var planePositions = positions[i];
        vertices[k++] = 0.0;
        vertices[k++] = 0.0;
        vertices[k++] = 0.0;

        vertices[k++] = planePositions[0].x;
        vertices[k++] = planePositions[0].y;
        vertices[k++] = planePositions[0].z;
    }

    var vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: vertices,
        usage: BufferUsage.STATIC_DRAW
    });

    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

    var attributes = [{
        index: attributeLocations.position,
        vertexBuffer: vertexBuffer,
        componentsPerAttribute: 3,
        componentDatatype: ComponentDatatype.FLOAT,
        offsetInBytes: 0,
        strideInBytes: stride
    }];

    return new VertexArray({
        context: context,
        attributes: attributes
    });
}

/**
 * 创建扇面圆顶面连接线顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorSegmentLineVertexArray(context, positions) {
    var planeLength = Array.prototype.concat.apply([], positions).length - positions.length;
    var vertices = new Float32Array(3 * 3 * planeLength);

    var k = 0;
    for (var i = 0, len = positions.length; i < len; i++) {
        var planePositions = positions[i];

        for (var j = 0, planeLength = planePositions.length - 1; j < planeLength; j++) {
            vertices[k++] = planePositions[j].x;
            vertices[k++] = planePositions[j].y;
            vertices[k++] = planePositions[j].z;

            vertices[k++] = planePositions[j + 1].x;
            vertices[k++] = planePositions[j + 1].y;
            vertices[k++] = planePositions[j + 1].z;
        }
    }

    var vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: vertices,
        usage: BufferUsage.STATIC_DRAW
    });

    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

    var attributes = [{
        index: attributeLocations.position,
        vertexBuffer: vertexBuffer,
        componentsPerAttribute: 3,
        componentDatatype: ComponentDatatype.FLOAT,
        offsetInBytes: 0,
        strideInBytes: stride
    }];

    return new VertexArray({
        context: context,
        attributes: attributes
    });
}

/**
 * 创建圆顶面顶点
 * @param context
 */
function createDomeVertexArray(context) {
    var geometry = Cesium.EllipsoidGeometry.createGeometry(new Cesium.EllipsoidGeometry({
        vertexFormat: VertexFormat.POSITION_ONLY,
        stackPartitions: 32,
        slicePartitions: 32
    }));

    var vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: geometry,
        attributeLocations: attributeLocations,
        bufferUsage: BufferUsage.STATIC_DRAW,
        interleave: false
    });
    return vertexArray;
}

/**
 * 创建圆顶面连线顶点
 * @param context
 */
function createDomeLineVertexArray(context) {
    var geometry = Cesium.EllipsoidOutlineGeometry.createGeometry(new Cesium.EllipsoidOutlineGeometry({
        vertexFormat: VertexFormat.POSITION_ONLY,
        stackPartitions: 32,
        slicePartitions: 32
    }));

    var vertexArray = VertexArray.fromGeometry({
        context: context,
        geometry: geometry,
        attributeLocations: attributeLocations,
        bufferUsage: BufferUsage.STATIC_DRAW,
        interleave: false
    });
    return vertexArray;
}

/**
 * 创建扫描面顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createScanPlaneVertexArray(context, positions) {
    var planeLength = positions.length - 1;
    var vertices = new Float32Array(3 * 3 * planeLength);

    var k = 0;
    for (var i = 0; i < planeLength; i++) {
        vertices[k++] = 0.0;
        vertices[k++] = 0.0;
        vertices[k++] = 0.0;

        vertices[k++] = positions[i].x;
        vertices[k++] = positions[i].y;
        vertices[k++] = positions[i].z;

        vertices[k++] = positions[i + 1].x;
        vertices[k++] = positions[i + 1].y;
        vertices[k++] = positions[i + 1].z;
    }

    var vertexBuffer = Buffer.createVertexBuffer({
        context: context,
        typedArray: vertices,
        usage: BufferUsage.STATIC_DRAW
    });

    var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

    var attributes = [{
        index: attributeLocations.position,
        vertexBuffer: vertexBuffer,
        componentsPerAttribute: 3,
        componentDatatype: ComponentDatatype.FLOAT,
        offsetInBytes: 0,
        strideInBytes: stride
    }];

    return new VertexArray({
        context: context,
        attributes: attributes
    });
}

function createVertexArray(primitive, frameState) {
    var context = frameState.context;

    var unitSectorPositions = computeUnitPosiiton(primitive, primitive.xHalfAngle, primitive.yHalfAngle);
    var positions = computeSectorPositions(primitive, unitSectorPositions);

    //显示扇面
    if (primitive.showLateralSurfaces) {
        primitive._sectorVA = createSectorVertexArray(context, positions);
    }

    //显示扇面线
    if (primitive.showSectorLines) {
        primitive._sectorLineVA = createSectorLineVertexArray(context, positions);
    }

    //显示扇面圆顶面的交线
    if (primitive.showSectorSegmentLines) {
        primitive._sectorSegmentLineVA = createSectorSegmentLineVertexArray(context, positions);
    }

    //显示弧面
    if (primitive.showDomeSurfaces) {
        primitive._domeVA = createDomeVertexArray(context);
    }

    //显示弧面线
    if (primitive.showDomeLines) {
        primitive._domeLineVA = createDomeLineVertexArray(context);
    }

    //显示扫描面
    if (primitive.showScanPlane) {

        if (primitive.scanPlaneMode == 'horizontal') {
            var unitScanPlanePositions = computeUnitPosiiton(primitive, CesiumMath.PI_OVER_TWO, 0);
            primitive._scanPlaneVA = createScanPlaneVertexArray(context, unitScanPlanePositions.zox);
        } else {
            var unitScanPlanePositions = computeUnitPosiiton(primitive, 0, CesiumMath.PI_OVER_TWO);
            primitive._scanPlaneVA = createScanPlaneVertexArray(context, unitScanPlanePositions.zoy);
        }
    }
}

//endregion

//region -- ShaderProgram --

function createCommonShaderProgram(primitive, frameState, material) {
    var context = frameState.context;

    var vs = _RectangularSensorVS2.default;
    var fs = new ShaderSource({
        sources: [_RectangularSensor2.default, material.shaderSource, _RectangularSensorFS2.default]
    });

    primitive._sp = ShaderProgram.replaceCache({
        context: context,
        shaderProgram: primitive._sp,
        vertexShaderSource: vs,
        fragmentShaderSource: fs,
        attributeLocations: attributeLocations
    });

    var pickFS = new ShaderSource({
        sources: [_RectangularSensor2.default, material.shaderSource, _RectangularSensorFS2.default],
        pickColorQualifier: 'uniform'
    });

    primitive._pickSP = ShaderProgram.replaceCache({
        context: context,
        shaderProgram: primitive._pickSP,
        vertexShaderSource: vs,
        fragmentShaderSource: pickFS,
        attributeLocations: attributeLocations
    });
}

function createScanPlaneShaderProgram(primitive, frameState, material) {
    var context = frameState.context;

    var vs = _RectangularSensorVS2.default;
    var fs = new ShaderSource({
        sources: [_RectangularSensor2.default, material.shaderSource, _RectangularSensorScanPlaneFS2.default]
    });

    primitive._scanePlaneSP = ShaderProgram.replaceCache({
        context: context,
        shaderProgram: primitive._scanePlaneSP,
        vertexShaderSource: vs,
        fragmentShaderSource: fs,
        attributeLocations: attributeLocations
    });
}

function createShaderProgram(primitive, frameState, material) {
    createCommonShaderProgram(primitive, frameState, material);

    if (primitive.showScanPlane) {
        createScanPlaneShaderProgram(primitive, frameState, material);
    }
}

//endregion

//region -- RenderState --

function createRenderState(primitive, showThroughEllipsoid, translucent) {
    if (translucent) {
        primitive._frontFaceRS = RenderState.fromCache({
            depthTest: {
                enabled: !showThroughEllipsoid
            },
            depthMask: false,
            blending: BlendingState.ALPHA_BLEND,
            cull: {
                enabled: true,
                face: CullFace.BACK
            }
        });

        primitive._backFaceRS = RenderState.fromCache({
            depthTest: {
                enabled: !showThroughEllipsoid
            },
            depthMask: false,
            blending: BlendingState.ALPHA_BLEND,
            cull: {
                enabled: true,
                face: CullFace.FRONT
            }
        });

        primitive._pickRS = RenderState.fromCache({
            depthTest: {
                enabled: !showThroughEllipsoid
            },
            depthMask: false,
            blending: BlendingState.ALPHA_BLEND
        });
    } else {
        primitive._frontFaceRS = RenderState.fromCache({
            depthTest: {
                enabled: !showThroughEllipsoid
            },
            depthMask: true
        });

        primitive._pickRS = RenderState.fromCache({
            depthTest: {
                enabled: true
            },
            depthMask: true
        });
    }
}

//endregion

//region -- Command --

function createCommand(primitive, frontCommand, backCommand, frontFaceRS, backFaceRS, sp, va, uniforms, modelMatrix, translucent, pass, isLine) {
    if (translucent && backCommand) {
        backCommand.vertexArray = va;
        backCommand.renderState = backFaceRS;
        backCommand.shaderProgram = sp;
        backCommand.uniformMap = combine(uniforms, primitive._material._uniforms);
        backCommand.uniformMap.u_normalDirection = function () {
            return -1.0;
        };
        backCommand.pass = pass;
        backCommand.modelMatrix = modelMatrix;
        primitive._colorCommands.push(backCommand);
    }

    frontCommand.vertexArray = va;
    frontCommand.renderState = frontFaceRS;
    frontCommand.shaderProgram = sp;
    frontCommand.uniformMap = combine(uniforms, primitive._material._uniforms);
    if (isLine) {
        frontCommand.uniformMap.u_type = function () {
            return 1;
        };
    }
    frontCommand.pass = pass;
    frontCommand.modelMatrix = modelMatrix;
    primitive._colorCommands.push(frontCommand);
}

function createCommands(primitive, translucent) {
    primitive._colorCommands.length = 0;

    var pass = translucent ? Pass.TRANSLUCENT : Pass.OPAQUE;

    //显示扇面
    if (primitive.showLateralSurfaces) {
        createCommand(primitive, primitive._sectorFrontCommand, primitive._sectorBackCommand, primitive._frontFaceRS, primitive._backFaceRS, primitive._sp, primitive._sectorVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass);
    }
    //显示扇面线
    if (primitive.showSectorLines) {
        createCommand(primitive, primitive._sectorLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS, primitive._sp, primitive._sectorLineVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass, true);
    }
    //显示扇面交接线
    if (primitive.showSectorSegmentLines) {
        createCommand(primitive, primitive._sectorSegmentLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS, primitive._sp, primitive._sectorSegmentLineVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass, true);
    }
    //显示弧面
    if (primitive.showDomeSurfaces) {
        createCommand(primitive, primitive._domeFrontCommand, primitive._domeBackCommand, primitive._frontFaceRS, primitive._backFaceRS, primitive._sp, primitive._domeVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass);
    }
    //显示弧面线
    if (primitive.showDomeLines) {
        createCommand(primitive, primitive._domeLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS, primitive._sp, primitive._domeLineVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass, true);
    }
    //显示扫描面
    if (primitive.showScanPlane) {
        createCommand(primitive, primitive._scanPlaneFrontCommand, primitive._scanPlaneBackCommand, primitive._frontFaceRS, primitive._backFaceRS, primitive._scanePlaneSP, primitive._scanPlaneVA, primitive._scanUniforms, primitive._computedScanPlaneModelMatrix, translucent, pass);
    }
}

//endregion

exports.RectangularSensorPrimitive = RectangularSensorPrimitive;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RectangularSensorGraphics = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function RectangularSensorGraphics(options) {
    this._show = undefined;
    this._radius = undefined;
    this._xHalfAngle = undefined;
    this._yHalfAngle = undefined;
    this._lineColor = undefined;
    this._showSectorLines = undefined;
    this._showSectorSegmentLines = undefined;
    this._showLateralSurfaces = undefined;
    this._material = undefined;
    this._showDomeSurfaces = undefined;
    this._showDomeLines = undefined;
    this._showIntersection = undefined;
    this._intersectionColor = undefined;
    this._intersectionWidth = undefined;
    this._showThroughEllipsoid = undefined;
    this._gaze = undefined;
    this._showScanPlane = undefined;
    this._scanPlaneColor = undefined;
    this._scanPlaneMode = undefined;
    this._scanPlaneRate = undefined;
    this._definitionChanged = new Cesium.Event();
    this.merge(Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT));
}

Cesium.defineProperties(RectangularSensorGraphics.prototype, {
    definitionChanged: {
        get: function get() {
            return this._definitionChanged;
        }
    },

    show: Cesium.createPropertyDescriptor('show'),
    radius: Cesium.createPropertyDescriptor('radius'),
    xHalfAngle: Cesium.createPropertyDescriptor('xHalfAngle'),
    yHalfAngle: Cesium.createPropertyDescriptor('yHalfAngle'),
    lineColor: Cesium.createPropertyDescriptor('lineColor'),
    showSectorLines: Cesium.createPropertyDescriptor('showSectorLines'),
    showSectorSegmentLines: Cesium.createPropertyDescriptor('showSectorSegmentLines'),
    showLateralSurfaces: Cesium.createPropertyDescriptor('showLateralSurfaces'),
    material: Cesium.createMaterialPropertyDescriptor('material'),
    showDomeSurfaces: Cesium.createPropertyDescriptor('showDomeSurfaces'),
    showDomeLines: Cesium.createPropertyDescriptor('showDomeLines '),
    showIntersection: Cesium.createPropertyDescriptor('showIntersection'),
    intersectionColor: Cesium.createPropertyDescriptor('intersectionColor'),
    intersectionWidth: Cesium.createPropertyDescriptor('intersectionWidth'),
    showThroughEllipsoid: Cesium.createPropertyDescriptor('showThroughEllipsoid'),
    gaze: Cesium.createPropertyDescriptor('gaze'),
    showScanPlane: Cesium.createPropertyDescriptor('showScanPlane'),
    scanPlaneColor: Cesium.createPropertyDescriptor('scanPlaneColor'),
    scanPlaneMode: Cesium.createPropertyDescriptor('scanPlaneMode'),
    scanPlaneRate: Cesium.createPropertyDescriptor('scanPlaneRate')
});

RectangularSensorGraphics.prototype.clone = function (result) {
    if (!Cesium.defined(result)) {
        result = new RectangularSensorGraphics();
    }

    result.show = this.show;
    result.radius = this.radius;
    result.xHalfAngle = this.xHalfAngle;
    result.yHalfAngle = this.yHalfAngle;
    result.lineColor = this.lineColor;
    result.showSectorLines = this.showSectorLines;
    result.showSectorSegmentLines = this.showSectorSegmentLines;
    result.showLateralSurfaces = this.showLateralSurfaces;
    result.material = this.material;
    result.showDomeSurfaces = this.showDomeSurfaces;
    result.showDomeLines = this.showDomeLines;
    result.showIntersection = this.showIntersection;
    result.intersectionColor = this.intersectionColor;
    result.intersectionWidth = this.intersectionWidth;
    result.showThroughEllipsoid = this.showThroughEllipsoid;
    result.gaze = this.gaze;
    result.showScanPlane = this.showScanPlane;
    result.scanPlaneColor = this.scanPlaneColor;
    result.scanPlaneMode = this.scanPlaneMode;
    result.scanPlaneRate = this.scanPlaneRate;

    return result;
};

RectangularSensorGraphics.prototype.merge = function (source) {
    if (!Cesium.defined(source)) {
        throw new Cesium.DeveloperError('source is required.');
    }
    this.slice = Cesium.defaultValue(this.slice, source.slice);
    this.show = Cesium.defaultValue(this.show, source.show);
    this.radius = Cesium.defaultValue(this.radius, source.radius);
    this.xHalfAngle = Cesium.defaultValue(this.xHalfAngle, source.xHalfAngle);
    this.yHalfAngle = Cesium.defaultValue(this.yHalfAngle, source.yHalfAngle);
    this.lineColor = Cesium.defaultValue(this.lineColor, source.lineColor);
    this.showSectorLines = Cesium.defaultValue(this.showSectorLines, source.showSectorLines);
    this.showSectorSegmentLines = Cesium.defaultValue(this.showSectorSegmentLines, source.showSectorSegmentLines);
    this.showLateralSurfaces = Cesium.defaultValue(this.showLateralSurfaces, source.showLateralSurfaces);
    this.material = Cesium.defaultValue(this.material, source.material);
    this.showDomeSurfaces = Cesium.defaultValue(this.showDomeSurfaces, source.showDomeSurfaces);
    this.showDomeLines = Cesium.defaultValue(this.showDomeLines, source.showDomeLines);
    this.showIntersection = Cesium.defaultValue(this.showIntersection, source.showIntersection);
    this.intersectionColor = Cesium.defaultValue(this.intersectionColor, source.intersectionColor);
    this.intersectionWidth = Cesium.defaultValue(this.intersectionWidth, source.intersectionWidth);
    this.showThroughEllipsoid = Cesium.defaultValue(this.showThroughEllipsoid, source.showThroughEllipsoid);
    this.gaze = Cesium.defaultValue(this.gaze, source.gaze);
    this.showScanPlane = Cesium.defaultValue(this.showScanPlane, source.showScanPlane);
    this.scanPlaneColor = Cesium.defaultValue(this.scanPlaneColor, source.scanPlaneColor);
    this.scanPlaneMode = Cesium.defaultValue(this.scanPlaneMode, source.scanPlaneMode);
    this.scanPlaneRate = Cesium.defaultValue(this.scanPlaneRate, source.scanPlaneRate);
};

exports.RectangularSensorGraphics = RectangularSensorGraphics;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(46);

__webpack_require__(47);

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Class = __webpack_require__(12);

var _widgetManager = __webpack_require__(29);

var widget = _interopRequireWildcard(_widgetManager);

var _BaseWidget = __webpack_require__(48);

var _img = __webpack_require__(31);

var marsImg = _interopRequireWildcard(_img);

var _map = __webpack_require__(49);

var _ViewerEx = __webpack_require__(32);

var _layer = __webpack_require__(20);

var _layer2 = _interopRequireDefault(_layer);

var _pointconvert = __webpack_require__(19);

var pointconvert = _interopRequireWildcard(_pointconvert);

var _util = __webpack_require__(4);

var util = _interopRequireWildcard(_util);

var _tileset = __webpack_require__(42);

var tileset = _interopRequireWildcard(_tileset);

var _matrix = __webpack_require__(91);

var matrix = _interopRequireWildcard(_matrix);

var _point = __webpack_require__(1);

var point = _interopRequireWildcard(_point);

var _FlowEcharts = __webpack_require__(92);

var _MapVLayer = __webpack_require__(93);

var _Draw = __webpack_require__(16);

var _index = __webpack_require__(38);

var Attr = _interopRequireWildcard(_index);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Tooltip = __webpack_require__(3);

var _Util = __webpack_require__(2);

var DrawUtil = _interopRequireWildcard(_Util);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Measure = __webpack_require__(96);

var _DivPoint = __webpack_require__(97);

var _FlyLine = __webpack_require__(98);

var _TilesEditor = __webpack_require__(99);

var _RainFS = __webpack_require__(100);

var _RainFS2 = _interopRequireDefault(_RainFS);

var _SnowFS = __webpack_require__(101);

var _SnowFS2 = _interopRequireDefault(_SnowFS);

var _CircleFadeMaterial = __webpack_require__(102);

var _CircleWaveMaterial = __webpack_require__(35);

var _LineFlowMaterial = __webpack_require__(25);

var _TextMaterial = __webpack_require__(103);

var _RectangularSensorPrimitive = __webpack_require__(43);

var _RectangularSensorGraphics = __webpack_require__(44);

var _RectangularSensorVisualizer = __webpack_require__(108);

var _TerrainClipPlan = __webpack_require__(110);

var _TilesetClipPlan = __webpack_require__(111);

var _FloodByEntity = __webpack_require__(112);

var _ViewShed3D = __webpack_require__(113);

var _VideoShed3D = __webpack_require__(115);

var _Underground = __webpack_require__(117);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//===========框架基本信息========= 
exports.name = "MarsGIS for Cesium三维地球框架";
exports.version = "1.8.1";
exports.author = "木遥（QQ 346819890，微信 muyao1987）";
exports.website = "http://cesium.marsgis.cn";

console.log('当前Cesium版本：' + Cesium.VERSION + " ， MarsGIS版本：" + exports.version);

//=============额外类=====================

exports.Class = _Class.Class;

//widget

exports.widget = widget;

exports.widget.BaseWidget = _BaseWidget.BaseWidget;

exports.image = marsImg.image;

//=============三维框架类=====================

exports.createMap = _map.createMap;

exports.ViewerEx = _ViewerEx.ViewerEx;

exports.layer = _layer2.default;

exports.pointconvert = pointconvert;

exports.util = util;

exports.util.tileset = tileset;

exports.matrix = matrix;

exports.point = point;

//可视化支持 mapv 、Echarts

exports.FlowEcharts = _FlowEcharts.FlowEcharts;

exports.MapVLayer = _MapVLayer.MapVLayer;

//标绘

exports.Draw = _Draw.Draw;
exports.draw = {};
exports.draw.util = DrawUtil;
exports.draw.event = EventType;
exports.draw.tooltip = _Tooltip.message;
exports.draw.dragger = draggerCtl;
exports.draw.attr = Attr;

//量算

exports.Measure = _Measure.Measure;

exports.DivPoint = _DivPoint.DivPoint;

exports.FlyLine = _FlyLine.FlyLine;

exports.TilesEditor = _TilesEditor.TilesEditor;

//着色器


exports.shaders = {};
exports.shaders.Rain = _RainFS2.default;
exports.shaders.Snow = _SnowFS2.default;

//=====================扩展的矢量对象=====================
//扩展的材质

exports.CircleFadeMaterial = _CircleFadeMaterial.CircleFadeMaterial;

exports.CircleWaveMaterial = _CircleWaveMaterial.CircleWaveMaterial;

exports.LineFlowMaterial = _LineFlowMaterial.LineFlowMaterial;

//文本材质

exports.TextMaterial = _TextMaterial.TextMaterial;

exports.AnimationLineMaterialProperty = _LineFlowMaterial.LineFlowMaterial; //兼容旧版本命名
exports.ElliposidFadeMaterialProperty = _CircleFadeMaterial.CircleFadeMaterial;

//RectangularSensor 相控阵雷达


exports.RectangularSensorPrimitive = _RectangularSensorPrimitive.RectangularSensorPrimitive;
exports.RectangularSensorGraphics = _RectangularSensorGraphics.RectangularSensorGraphics;
exports.RectangularSensorVisualizer = _RectangularSensorVisualizer.RectangularSensorVisualizer;

var originalDefaultVisualizersCallback = Cesium.DataSourceDisplay.defaultVisualizersCallback;
Cesium.DataSourceDisplay.defaultVisualizersCallback = function (scene, entityCluster, dataSource) {
    var entities = dataSource.entities;
    var array = originalDefaultVisualizersCallback(scene, entityCluster, dataSource);
    return array.concat([new _RectangularSensorVisualizer.RectangularSensorVisualizer(scene, entities)]);
};

//=====================分析相关=====================
exports.analysi = {};

//地形挖掘（平面 Plan原生）

exports.analysi.TerrainClipPlan = _TerrainClipPlan.TerrainClipPlan;

//模型裁剪（平面 Plan原生）

exports.analysi.TilesetClipPlan = _TilesetClipPlan.TilesetClipPlan;

//淹没分析（polygon矢量面抬高）

exports.analysi.FloodByEntity = _FloodByEntity.FloodByEntity;

//可视域分析 

exports.analysi.ViewShed3D = _ViewShed3D.ViewShed3D;

//视频投放 

exports.analysi.VideoShed3D = _VideoShed3D.VideoShed3D;

//地下模式

exports.analysi.Underground = _Underground.Underground;

/***/ }),
/* 46 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 47 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BaseWidget = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _Class = __webpack_require__(12);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _loader = __webpack_require__(30);

var _widgetManager = __webpack_require__(29);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _resources_cache = [];

var BaseWidget = exports.BaseWidget = _Class.Class.extend({
    viewer: null,
    options: {},
    config: {}, //配置的config信息 
    path: "", //当前widget目录相对路径 
    isActivate: false, //是否激活状态
    isCreate: false,
    initialize: function initialize(cfg, map) {
        this.viewer = map;
        this.config = cfg;
        this.path = cfg.path || '';
        this.init();
    },
    addCacheVersion: function addCacheVersion(_resource) {
        if (_resource == null) return _resource;

        var cacheVersion = (0, _widgetManager.getCacheVersion)();
        if (cacheVersion) {
            if (_resource.indexOf('?') == -1) _resource += "?time=" + cacheVersion;else if (_resource.indexOf('time=' + cacheVersion) == -1) _resource += "&time=" + cacheVersion;
        }
        return _resource;
    },
    //激活插件
    activateBase: function activateBase() {
        var that = this;

        if (this.isActivate) {
            //已激活状态时跳出 
            this.changeWidgetView(function (viewopts) {
                if (viewopts._dom) {
                    //将层置顶
                    (0, _jquery2.default)(".layui-layer").each(function () {
                        (0, _jquery2.default)(this).css("z-index", 19891000);
                    });
                    (0, _jquery2.default)(viewopts._dom).css("z-index", 19891014);
                }
            });
            return;
        }

        this.beforeActivate();
        this.isActivate = true;
        //console.log('激活widget:' + this.config.uri);

        if (!this.isCreate) {
            //首次进行创建 
            if (this.options.resources && this.options.resources.length > 0) {
                var resources = [];

                for (var i = 0; i < this.options.resources.length; i++) {
                    var _resource = this.options.resources[i];
                    _resource = this._getUrl(_resource);

                    if (_resources_cache.indexOf(_resource) != -1) continue; //不加重复资源

                    resources.push(_resource);
                }
                _resources_cache = _resources_cache.concat(resources); //不加重复资源

                _loader.Loader.async(resources, function () {
                    var result = that.create(function () {
                        that._createWidgetView();
                        that.isCreate = true;
                    });
                    if (result) return;
                    if (that.config.createAtStart) {
                        that.config.createAtStart = false;
                        that.isActivate = false;
                        that.isCreate = true;
                        return;
                    }
                    that._createWidgetView();
                    that.isCreate = true;
                });
                return;
            } else {
                var result = this.create(function () {
                    that._createWidgetView();
                    this.isCreate = true;
                });
                if (result) return;
                if (that.config.createAtStart) {
                    that.config.createAtStart = false;
                    that.isActivate = false;
                    that.isCreate = true;
                    return;
                }
            }
            this.isCreate = true;
        }
        this._createWidgetView();

        return this;
    },
    //创建插件的view
    _createWidgetView: function _createWidgetView() {
        var viewopts = this.options.view;
        if (viewopts === undefined || viewopts === null) {
            this._startActivate();
        } else if (Util.isArray(viewopts)) {
            this._viewcreate_allcount = viewopts.length;
            this._viewcreate_okcount = 0;

            for (var i = 0; i < viewopts.length; i++) {
                this.createItemView(viewopts[i]);
            }
        } else {
            this._viewcreate_allcount = 1;
            this._viewcreate_okcount = 0;
            this.createItemView(viewopts);
        }
    },
    changeWidgetView: function changeWidgetView(calback) {
        var viewopts = this.options.view;
        if (viewopts === undefined || viewopts === null) {
            return false;
        } else if (Util.isArray(viewopts)) {
            var hascal = false;
            for (var i = 0; i < viewopts.length; i++) {
                hascal = hascal || calback(viewopts[i]);
            }
            return hascal;
        } else {
            return calback(viewopts);
        }
    },
    createItemView: function createItemView(viewopt) {
        switch (viewopt.type) {
            default:
            case "window":
                this._openWindow(viewopt);
                break;
            case "divwindow":
                this._openDivWindow(viewopt);
                break;
            case "append":
                this._appendView(viewopt);
                break;
            case "custom":
                //自定义 
                var view_url = this._getUrl(viewopt.url);

                var that = this;
                viewopt.open(view_url, function (html) {
                    that.winCreateOK(viewopt, html);

                    that._viewcreate_okcount++;
                    if (that._viewcreate_okcount >= that._viewcreate_allcount) {
                        that._startActivate(html);
                    }
                }, this);
                break;
        }
    },
    _viewcreate_allcount: 0,
    _viewcreate_okcount: 0,
    //==============layer弹窗================= 
    _openWindow: function _openWindow(viewopt) {
        var that = this;
        var view_url = this._getUrl(viewopt.url);

        var opts = {
            type: 2,
            content: [view_url, 'no'],
            success: function success(layero) {
                viewopt._layerOpening = false;
                viewopt._dom = layero;

                //得到iframe页的窗口对象，执行iframe页的方法：viewWindow.method();
                var viewWindow = window[layero.find('iframe')[0]['name']];

                //隐藏弹窗
                if (that.config.hasOwnProperty("visible") && !that.config.visible) (0, _jquery2.default)(layero).hide();

                layer.setTop(layero);
                that.winCreateOK(viewopt, viewWindow);

                that._viewcreate_okcount++;
                if (that._viewcreate_okcount >= that._viewcreate_allcount) that._startActivate(layero);

                //通知页面,页面需要定义initWidgetView方法
                if (viewWindow && viewWindow.initWidgetView) viewWindow.initWidgetView(that);else console.error("" + view_url + "页面没有定义function initWidgetView(widget)方法，无法初始化widget页面!");
            }
        };
        if (viewopt._layerIdx > 0) {
            //debugger
        }

        viewopt._layerOpening = true;
        viewopt._layerIdx = layer.open(this._getWinOpt(viewopt, opts));
    },
    _openDivWindow: function _openDivWindow(viewopt) {
        var view_url = this._getUrl(viewopt.url);
        //div弹窗
        var that = this;
        this.getHtml(view_url, function (data) {
            var opts = {
                type: 1,
                content: data,
                success: function success(layero) {
                    viewopt._layerOpening = false;
                    viewopt._dom = layero;

                    //隐藏弹窗
                    if (that.config.hasOwnProperty("visible") && !that.config.visible) (0, _jquery2.default)(layero).hide();

                    layer.setTop(layero);
                    that.winCreateOK(viewopt, layero);

                    that._viewcreate_okcount++;
                    if (that._viewcreate_okcount >= that._viewcreate_allcount) that._startActivate(layero);
                }
            };
            viewopt._layerOpening = true;
            viewopt._layerIdx = layer.open(that._getWinOpt(viewopt, opts));
        });
    },
    _getUrl: function _getUrl(url) {
        url = this.addCacheVersion(url);

        if (url.startsWith("/") || url.startsWith(".") || url.startsWith("http")) return url;else return this.path + url;
    },
    _getWinOpt: function _getWinOpt(viewopt, opts) {
        //优先使用cofig中配置，覆盖js中的定义 
        var def = (0, _widgetManager.getDefWindowOptions)();
        var windowOptions = _jquery2.default.extend(def, viewopt.windowOptions);
        windowOptions = _jquery2.default.extend(windowOptions, this.config.windowOptions);
        viewopt.windowOptions = windowOptions; //赋值 

        var that = this;
        var _size = this._getWinSize(windowOptions);

        //默认值
        var defOpts = {
            title: windowOptions.noTitle ? false : this.config.name || ' ',
            area: _size.area,
            offset: _size.offset,
            shade: 0,
            maxmin: false,
            zIndex: layer.zIndex,
            end: function end() {
                // 销毁后触发的回调
                viewopt._layerIdx = -1;
                viewopt._dom = null;
                that.disableBase();
            },
            full: function full(dom) {
                //最大化后触发的回调
                that.winFull(dom);
            },
            min: function min(dom) {
                //最小化后触发的回调
                that.winMin(dom);
            },
            restore: function restore(dom) {
                //还原 后触发的回调
                that.winRestore(dom);
            }
        };
        var cfgOpts = _jquery2.default.extend(defOpts, windowOptions);
        return _jquery2.default.extend(cfgOpts, opts || {});
    },
    //计算弹窗大小和位置
    _getWinSize: function _getWinSize(windowOptions) {
        //获取高宽 
        var _width = this.bfb2Number(windowOptions.width, document.documentElement.clientWidth, windowOptions);
        var _height = this.bfb2Number(windowOptions.height, document.documentElement.clientHeight, windowOptions);

        //计算位置offset
        var offset = '';
        var position = windowOptions.position;
        if (position) {
            if (typeof position == "string") {
                //t顶部,b底部,r右边缘,l左边缘,lt左上角,lb左下角,rt右上角,rb右下角
                offset = position;
            } else if ((typeof position === 'undefined' ? 'undefined' : _typeof(position)) == "object") {
                var _top;
                var _left;

                if (position.hasOwnProperty("top") && position.top != null) {
                    _top = this.bfb2Number(position.top, document.documentElement.clientHeight, windowOptions);
                }
                if (position.hasOwnProperty("bottom") && position.bottom != null) {
                    windowOptions._hasresize = true;

                    var _bottom = this.bfb2Number(position.bottom, document.documentElement.clientHeight, windowOptions);

                    if (_top != null) {
                        _height = document.documentElement.clientHeight - _top - _bottom;
                    } else {
                        _top = document.documentElement.clientHeight - _height - _bottom;
                    }
                }

                if (position.hasOwnProperty("left") && position.left != null) {
                    _left = this.bfb2Number(position.left, document.documentElement.clientWidth, windowOptions);
                }
                if (position.hasOwnProperty("right") && position.right != null) {
                    windowOptions._hasresize = true;
                    var _right = this.bfb2Number(position.right, document.documentElement.clientWidth, windowOptions);

                    if (_left != null) {
                        _width = document.documentElement.clientWidth - _left - _right;
                    } else {
                        _left = document.documentElement.clientWidth - _width - _right;
                    }
                }

                if (_top == null) _top = (document.documentElement.clientHeight - _height) / 2;
                if (_left == null) _left = (document.documentElement.clientWidth - _width) / 2;

                offset = [_top + 'px', _left + 'px'];
            }
        }

        //最大最小高度判断
        if (windowOptions.hasOwnProperty("minHeight") && _height < windowOptions.minHeight) {
            windowOptions._hasresize = true;
            _height = windowOptions.minHeight;
        }
        if (windowOptions.hasOwnProperty("maxHeight") && _height > windowOptions.maxHeight) {
            windowOptions._hasresize = true;
            _height = windowOptions.maxHeight;
        }

        //最大最小宽度判断
        if (windowOptions.hasOwnProperty("minHeight") && _width < windowOptions.minWidth) {
            windowOptions._hasresize = true;
            _width = windowOptions.minWidth;
        }
        if (windowOptions.hasOwnProperty("maxWidth") && _width > windowOptions.maxWidth) {
            windowOptions._hasresize = true;
            _width = windowOptions.maxWidth;
        }

        var area;
        if (_width && _height) area = [_width + 'px', _height + 'px'];else area = _width + 'px';

        return { area: area, offset: offset };
    },
    bfb2Number: function bfb2Number(str, allnum, windowOptions) {
        if (typeof str == 'string' && str.indexOf("%") != -1) {
            windowOptions._hasresize = true;

            return allnum * Number(str.replace("%", "")) / 100;
        }
        return str;
    },
    //==============直接添加到index上=================  
    _appendView: function _appendView(viewopt) {

        if (this.isCreate && viewopt._dom) {
            (0, _jquery2.default)(viewopt._dom).show({
                duration: 500
            });
            this._startActivate(viewopt._dom);
        } else {
            var view_url = this._getUrl(viewopt.url);
            var that = this;
            that.getHtml(view_url, function (html) {

                viewopt._dom = (0, _jquery2.default)(html).appendTo(viewopt.parent || 'body');

                that.winCreateOK(viewopt, html);

                that._viewcreate_okcount++;
                if (that._viewcreate_okcount >= that._viewcreate_allcount) that._startActivate(html);
            });
        }
    },

    //释放插件
    disableBase: function disableBase() {
        if (!this.isActivate) return;
        this.beforeDisable();

        var has = this.changeWidgetView(function (viewopts) {
            if (viewopts._layerIdx != null && viewopts._layerIdx != -1) {
                if (viewopts._layerOpening) {
                    //窗口还在加载中
                    //console.log('释放widget窗口还在加载中:' + viewopts._layerIdx);

                }
                layer.close(viewopts._layerIdx);
                return true;
            } else {
                if (viewopts.type == "append" && viewopts._dom) (0, _jquery2.default)(viewopts._dom).hide({
                    duration: 1000
                });
                if (viewopts.type == "custom" && viewopts.close) viewopts.close();
                return false;
            }
        });
        if (has) return;

        this.disable();
        this.isActivate = false;
        //console.log('释放widget:' + this.config.uri);
    },
    //设置view弹窗的显示和隐藏
    setViewVisible: function setViewVisible(visible) {
        this.changeWidgetView(function (viewopts) {
            if (viewopts._layerIdx != null && viewopts._layerIdx != -1) {
                if (visible) {
                    (0, _jquery2.default)("#layui-layer" + viewopts._layerIdx).show();
                } else {
                    (0, _jquery2.default)("#layui-layer" + viewopts._layerIdx).hide();
                }
            } else if (viewopts.type == "append" && viewopts._dom) {
                if (visible) (0, _jquery2.default)(viewopts._dom).show();else (0, _jquery2.default)(viewopts._dom).hide();
            }
        });
    },
    //设置view弹窗的css
    setViewCss: function setViewCss(style) {
        this.changeWidgetView(function (viewopts) {
            if (viewopts._layerIdx != null && viewopts._layerIdx != -1) {
                (0, _jquery2.default)("#layui-layer" + viewopts._layerIdx).css(style);
            } else if (viewopts.type == "append" && viewopts._dom) {
                (0, _jquery2.default)(viewopts._dom).css(style);
            }
        });
    },
    //主窗体改变大小后触发
    indexResize: function indexResize() {
        if (!this.isActivate) return;

        var that = this;
        this.changeWidgetView(function (viewopts) {
            if (viewopts._layerIdx == null || viewopts._layerIdx == -1 || viewopts.windowOptions == null || !viewopts.windowOptions._hasresize) return;

            var _size = that._getWinSize(viewopts.windowOptions);
            var _style = {
                width: _size.area[0],
                height: _size.area[1],
                top: _size.offset[0],
                left: _size.offset[1]
            };
            (0, _jquery2.default)(viewopts._dom).attr("myTopLeft", true);

            layer.style(viewopts._layerIdx, _style);

            if (viewopts.type == "divwindow") layer.iframeAuto(viewopts._layerIdx);
        });
    },
    _startActivate: function _startActivate(layero) {
        this.activate(layero);
        if (this.config.success) {
            this.config.success(this);
        }
        if (!this.isActivate) {
            //窗口打开中没加载完成时，被释放
            this.disableBase();
        }
    },
    //子类继承后覆盖 
    init: function init() {},
    //子类继承后覆盖 
    create: function create(endfun) {},
    //子类继承后覆盖
    beforeActivate: function beforeActivate() {},
    activate: function activate(layero) {},

    //子类继承后覆盖
    beforeDisable: function beforeDisable() {},
    disable: function disable() {},

    //子类继承后覆盖 
    winCreateOK: function winCreateOK(opt, result) {},
    //窗口最大化后触发
    winFull: function winFull() {},
    //窗口最小化后触发
    winMin: function winMin() {},
    //窗口还原 后触发
    winRestore: function winRestore() {},

    //公共方法
    getHtml: function getHtml(url, callback) {
        _jquery2.default.ajax({
            url: url,
            type: "GET",
            dataType: 'html',
            timeout: 0, //永不超时
            success: function success(data) {
                callback(data);
            }
        });
    }

});

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createMap = createMap;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _util2 = __webpack_require__(4);

var _util = _interopRequireWildcard(_util2);

var _ViewerEx = __webpack_require__(32);

var _GaodePOIGeocoder = __webpack_require__(89);

var _layer = __webpack_require__(20);

var _alert = __webpack_require__(90);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMap(opt) {
    if (!(0, _alert.testTk)()) return; //校验提示

    if (opt.url) {
        _jquery2.default.ajax({
            type: "get",
            dataType: "json",
            url: opt.url,
            timeout: 0, //永不超时
            success: function success(config) {
                if (config.serverURL) opt.serverURL = config.serverURL;

                //map初始化 
                var viewer = initMap(config.map3d, opt);
                if (opt.success) opt.success(viewer, config, config); //第2个config为了兼容1.7以前版本
            },
            error: function error(XMLHttpRequest, textStatus, errorThrown) {
                console.log(opt.url + "文件加载失败！");
                _util.alert(opt.url + "文件加载失败！");
            }
        });
        return null;
    } else {
        var viewer = initMap(opt.data, opt);
        if (opt.success) opt.success(viewer, opt.data);
        return viewer;
    }
}

function initMap(config, optsWB) {
    var id = optsWB.id;

    //数据优先级：optsWB > config > opts 

    //如果options未设置时的默认参数
    var opts = {
        animation: false, //是否创建动画小器件，左下角仪表   
        timeline: false, //是否显示时间线控件   
        fullscreenButton: true, //右下角全屏按钮
        vrButton: false, //右下角vr虚拟现实按钮

        geocoder: false, //是否显示地名查找控件   
        sceneModePicker: false, //是否显示投影方式控件  
        homeButton: true, //回到默认视域按钮
        navigationHelpButton: true, //是否显示帮助信息控件  
        navigationInstructionsInitiallyVisible: false, //在用户明确单击按钮之前是否自动显示

        infoBox: true, //是否显示点击要素之后显示的信息 
        selectionIndicator: false, //选择模型是是否显示绿色框, 
        shouldAnimate: true,
        showRenderLoopErrors: true, //是否显示错误弹窗信息

        baseLayerPicker: false, //地图底图
        contextmenu: true //右键菜单
    };

    //config中可以配置map所有options
    for (var key in config) {
        opts[key] = config[key];
    }
    //wboptions中可以配置map所有options覆盖
    if (opts) {
        for (var key in optsWB) {
            if (key === "id" || key === "success") continue;
            opts[key] = optsWB[key];
        }
    }

    //一些默认值的修改【by 木遥】
    if (Cesium.Ion) Cesium.Ion.defaultAccessToken = opts.ionToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NjM5MjMxOS1lMWVkLTQyNDQtYTM4Yi0wZjA4ZDMxYTlmNDMiLCJpZCI6MTQ4MiwiaWF0IjoxNTI4Njc3NDQyfQ.vVoSexHMqQhKK5loNCv6gCA5d5_z3wE2M0l_rWnIP_w';
    Cesium.AnimationViewModel.defaultTicks = opts.animationTicks || [0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0, 30.0, 60.0, 120.0, 300.0, 600.0, 900.0, 1800.0, 3600.00];

    //自定义搜索栏Geocoder
    if (opts.geocoder === true) {
        opts.geocoder = new _GaodePOIGeocoder.GaodePOIGeocoder(opts.geocoderConfig);
    }

    //地形
    var terrainProvider;
    if (opts.terrain && opts.terrain.visible) {
        terrainProvider = getTerrainProvider(opts.terrain, opts.serverURL);
        opts.terrainProvider = terrainProvider;
    }

    //地图底图图层预处理   
    var hasremoveimagery = false;
    if (opts.baseLayerPicker) {
        //有baseLayerPicker插件时
        if (!opts.imageryProviderViewModels && opts.basemaps && opts.basemaps.length > 0) {
            var imgOBJ = getImageryProviderArr(opts.basemaps);
            opts.imageryProviderViewModels = imgOBJ.imageryProviderViewModels;
            opts.selectedImageryProviderViewModel = imgOBJ.imageryProviderViewModels[imgOBJ.index];
        }

        if (!opts.terrainProviderViewModels) {
            opts.terrainProviderViewModels = getTerrainProviderViewModelsArr(opts.terrain, opts.serverURL);
            opts.selectedTerrainProviderViewModel = opts.terrainProviderViewModels[1];
        }
    } else {
        //无baseLayerPicker插件时
        if (opts.imageryProvider == null) {
            //未配底图时
            hasremoveimagery = true;
            opts.imageryProvider = Cesium.createTileMapServiceImageryProvider({
                url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
            });
        }
    }

    //地球初始化
    var viewer = new Cesium.Viewer(id, opts);

    //地图底图图层 
    if (hasremoveimagery) {
        var imageryLayerCollection = viewer.imageryLayers;
        var length = imageryLayerCollection.length;
        for (var i = 0; i < length; i++) {
            var layer = imageryLayerCollection.get(0);
            imageryLayerCollection.remove(layer, true);
        }
    }
    if (opts.geocoder) {
        opts.geocoder.viewer = viewer;
    }

    delete opts.geocoder;
    delete opts.imageryProviderViewModels;
    delete opts.selectedImageryProviderViewModel;
    delete opts.terrainProviderViewModels;
    delete opts.selectedTerrainProviderViewModel;
    delete opts.terrainProvider;
    delete opts.imageryProvider;

    viewer.mars = new _ViewerEx.ViewerEx(viewer, opts); //火星扩展的viewer支持
    if (terrainProvider) viewer.mars.terrainProvider = terrainProvider;

    viewer.gisdata = { config: viewer.mars.config //兼容1.7以前的历史版本属性

    };return viewer;
};

//获取配置的地形 
function getTerrainProvider(cfg, serverURL) {
    if (cfg.url) {
        if (serverURL) {
            cfg.url = cfg.url.replace('$serverURL$', serverURL);
        }
        cfg.url = cfg.url.replace('$hostname$', location.hostname).replace('$host$', location.host);
    }

    return _util.getTerrainProvider(cfg);
}

//获取自定义底图切换
function getImageryProviderArr(layersCfg) {
    var providerViewModels = [];
    var selectedIndex = 0;

    window._temp_createImageryProvider = _layer.createImageryProvider;

    for (var i = 0; i < layersCfg.length; i++) {
        var item = layersCfg[i];
        if (item.type == "group" && item.layers == null) continue;

        if (item.visible) selectedIndex = providerViewModels.length;

        var funstr = 'window._temp_basemaps' + i + ' = function () {\
                        var item = ' + JSON.stringify(item) + ';\
                        if (item.type == "group") {\
                            var arrVec = [];\
                            for (var index = 0; index < item.layers.length; index++) {\
                                var temp = window._temp_createImageryProvider(item.layers[index]);\
                                if (temp == null) continue;\
                                arrVec.push(temp);\
                            }\
                            return arrVec;\
                        }\
                        else {\
                            return window._temp_createImageryProvider(item);\
                        } \
                    }';
        eval(funstr);

        var imgModel = new Cesium.ProviderViewModel({
            name: item.name || "未命名",
            tooltip: item.name || "未命名",
            iconUrl: item.icon || "",
            creationFunction: eval('window._temp_basemaps' + i)
        });
        providerViewModels.push(imgModel);
    }

    return {
        imageryProviderViewModels: providerViewModels,
        index: selectedIndex
    };
}

function getTerrainProviderViewModelsArr(cfg, serverURL) {
    return [new Cesium.ProviderViewModel({
        name: '无地形',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/Ellipsoid.png'),
        tooltip: 'WGS84标准椭球，即 EPSG:4326',
        category: '',
        creationFunction: function creationFunction() {
            return new Cesium.EllipsoidTerrainProvider({
                ellipsoid: Cesium.Ellipsoid.WGS84
            });;
        }
    }), new Cesium.ProviderViewModel({
        name: '中国地形',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        tooltip: '火星科技 提供的高分辨率中国地形',
        category: '',
        creationFunction: function creationFunction() {
            return getTerrainProvider(cfg, serverURL);
        }
    }), new Cesium.ProviderViewModel({
        name: '全球地形',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        tooltip: 'Cesium官方 提供的高分辨率全球地形',
        category: '',
        creationFunction: function creationFunction() {
            return _util.getTerrainProvider({ type: 'ion' });;
        }
    })];
}

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Evented = exports.Events = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _Class = __webpack_require__(12);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/*
 * @class Evented
 * @aka Evented
 * @inherits Class
 *
 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
 *
 * @example
 *
 * ```js
 * map.on('click', function(e) {
 * 	alert(e.latlng);
 * } );
 * ```
 *
 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
 *
 * ```js
 * function onClick(e) { ... }
 *
 * map.on('click', onClick);
 * map.off('click', onClick);
 * ```
 */

var Events = exports.Events = {
	/* @method on(type: String, fn: Function, context?: Object): this
  * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
  *
  * @alternative
  * @method on(eventMap: Object): this
  * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
  */
	on: function on(types, fn, context) {

		// types can be a map of types/handlers
		if ((typeof types === 'undefined' ? 'undefined' : _typeof(types)) === 'object') {
			for (var type in types) {
				// we don't process space-separated events here for performance;
				// it's a hot path since Layer uses the on(obj) syntax
				this._on(type, types[type], fn);
			}
		} else {
			// types can be a string of space-separated words
			types = Util.splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._on(types[i], fn, context);
			}
		}

		return this;
	},

	/* @method off(type: String, fn?: Function, context?: Object): this
  * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
  *
  * @alternative
  * @method off(eventMap: Object): this
  * Removes a set of type/listener pairs.
  *
  * @alternative
  * @method off: this
  * Removes all listeners to all events on the object.
  */
	off: function off(types, fn, context) {

		if (!types) {
			// clear all listeners if called without arguments
			delete this._events;
		} else if ((typeof types === 'undefined' ? 'undefined' : _typeof(types)) === 'object') {
			for (var type in types) {
				this._off(type, types[type], fn);
			}
		} else {
			types = Util.splitWords(types);

			for (var i = 0, len = types.length; i < len; i++) {
				this._off(types[i], fn, context);
			}
		}

		return this;
	},

	// attach listener (without syntactic sugar now)
	_on: function _on(type, fn, context) {
		this._events = this._events || {};

		/* get/init listeners for type */
		var typeListeners = this._events[type];
		if (!typeListeners) {
			typeListeners = [];
			this._events[type] = typeListeners;
		}

		if (context === this) {
			// Less memory footprint.
			context = undefined;
		}
		var newListener = { fn: fn, ctx: context },
		    listeners = typeListeners;

		// check if fn already there
		for (var i = 0, len = listeners.length; i < len; i++) {
			if (listeners[i].fn === fn && listeners[i].ctx === context) {
				return;
			}
		}

		listeners.push(newListener);
	},

	_off: function _off(type, fn, context) {
		var listeners, i, len;

		if (!this._events) {
			return;
		}

		listeners = this._events[type];

		if (!listeners) {
			return;
		}

		if (!fn) {
			// Set all removed listeners to noop so they are not called if remove happens in fire
			for (i = 0, len = listeners.length; i < len; i++) {
				listeners[i].fn = Util.falseFn;
			}
			// clear all listeners for a type if function isn't specified
			delete this._events[type];
			return;
		}

		if (context === this) {
			context = undefined;
		}

		if (listeners) {

			// find fn and remove it
			for (i = 0, len = listeners.length; i < len; i++) {
				var l = listeners[i];
				if (l.ctx !== context) {
					continue;
				}
				if (l.fn === fn) {

					// set the removed listener to noop so that's not called if remove happens in fire
					l.fn = Util.falseFn;

					if (this._firingCount) {
						/* copy array in case events are being fired */
						this._events[type] = listeners = listeners.slice();
					}
					listeners.splice(i, 1);

					return;
				}
			}
		}
	},

	// @method fire(type: String, data?: Object, propagate?: Boolean): this
	// Fires an event of the specified type. You can optionally provide an data
	// object — the first argument of the listener function will contain its
	// properties. The event can optionally be propagated to event parents.
	fire: function fire(type, data, propagate) {
		if (!this.listens(type, propagate)) {
			return this;
		}

		var event = Util.extend({}, data, {
			type: type,
			target: this,
			sourceTarget: data && data.sourceTarget || this
		});

		if (this._events) {
			var listeners = this._events[type];

			if (listeners) {
				this._firingCount = this._firingCount + 1 || 1;
				for (var i = 0, len = listeners.length; i < len; i++) {
					var l = listeners[i];
					l.fn.call(l.ctx || this, event);
				}

				this._firingCount--;
			}
		}

		if (propagate) {
			// propagate the event to parents (set with addEventParent)
			this._propagateEvent(event);
		}

		return this;
	},

	// @method listens(type: String): Boolean
	// Returns `true` if a particular event type has any listeners attached to it.
	listens: function listens(type, propagate) {
		var listeners = this._events && this._events[type];
		if (listeners && listeners.length) {
			return true;
		}

		if (propagate) {
			// also check parents for listeners if event propagates
			for (var id in this._eventParents) {
				if (this._eventParents[id].listens(type, propagate)) {
					return true;
				}
			}
		}
		return false;
	},

	// @method once(…): this
	// Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
	once: function once(types, fn, context) {

		if ((typeof types === 'undefined' ? 'undefined' : _typeof(types)) === 'object') {
			for (var type in types) {
				this.once(type, types[type], fn);
			}
			return this;
		}

		var handler = Util.bind(function () {
			this.off(types, fn, context).off(types, handler, context);
		}, this);

		// add a listener that's executed once and removed after that
		return this.on(types, fn, context).on(types, handler, context);
	},

	// @method addEventParent(obj: Evented): this
	// Adds an event parent - an `Evented` that will receive propagated events
	addEventParent: function addEventParent(obj) {
		this._eventParents = this._eventParents || {};
		this._eventParents[Util.stamp(obj)] = obj;
		return this;
	},

	// @method removeEventParent(obj: Evented): this
	// Removes an event parent, so it will stop receiving propagated events
	removeEventParent: function removeEventParent(obj) {
		if (this._eventParents) {
			delete this._eventParents[Util.stamp(obj)];
		}
		return this;
	},

	_propagateEvent: function _propagateEvent(e) {
		for (var id in this._eventParents) {
			this._eventParents[id].fire(e.type, Util.extend({
				layer: e.target,
				propagatedFrom: e.target
			}, e), true);
		}
	}
};

// aliases; we should ditch those eventually

// @method addEventListener(…): this
// Alias to [`on(…)`](#evented-on)
Events.addEventListener = Events.on;

// @method removeEventListener(…): this
// Alias to [`off(…)`](#evented-off)

// @method clearAllEventListeners(…): this
// Alias to [`off()`](#evented-off)
Events.removeEventListener = Events.clearAllEventListeners = Events.off;

// @method addOneTimeEventListener(…): this
// Alias to [`once(…)`](#evented-once)
Events.addOneTimeEventListener = Events.once;

// @method fireEvent(…): this
// Alias to [`fire(…)`](#evented-fire)
Events.fireEvent = Events.fire;

// @method hasEventListeners(…): Boolean
// Alias to [`listens(…)`](#evented-listens)
Events.hasEventListeners = Events.listens;

var Evented = exports.Evented = _Class.Class.extend(Events);

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditPoint = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(18);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditPoint = exports.EditPoint = _Edit.EditBase.extend({
    //外部更新位置
    setPositions: function setPositions(position) {
        this.entity.position.setValue(position);
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        this.entity.draw_tooltip = _Tooltip.message.dragger.def;
        var dragger = draggerCtl.createDragger(this.dataSource, {
            dragger: this.entity,
            onDrag: function onDrag(dragger, newPosition) {
                that.entity.position.setValue(newPosition);
            }
        });
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity.draw_tooltip = null;
    }

});

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawBillboard = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(17);

var _Attr = __webpack_require__(15);

var attr = _interopRequireWildcard(_Attr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawBillboard = exports.DrawBillboard = _Draw.DrawPoint.extend({
    type: 'billboard',
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = null;

        var that = this;
        var addattr = {
            show: false,
            position: new Cesium.CallbackProperty(function (time) {
                return that.getDrawPosition();
            }, false),
            billboard: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.billboard);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    }

});

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawLabel = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(17);

var _Attr = __webpack_require__(13);

var attr = _interopRequireWildcard(_Attr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawLabel = exports.DrawLabel = _Draw.DrawPoint.extend({
    type: 'label',
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = null;

        var that = this;
        var addattr = {
            show: false,
            position: new Cesium.CallbackProperty(function (time) {
                return that.getDrawPosition();
            }, false),
            label: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.label);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    }

});

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawModel = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(17);

var _Attr = __webpack_require__(24);

var attr = _interopRequireWildcard(_Attr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawModel = exports.DrawModel = _Draw.DrawPoint.extend({
    type: 'model',
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = null;

        var that = this;
        var addattr = {
            position: new Cesium.CallbackProperty(function (time) {
                return that.getDrawPosition();
            }, false),
            model: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        this.updateOrientation(style, entity);
        return attr.style2Entity(style, entity.model);
    },
    updateAttrForDrawing: function updateAttrForDrawing() {
        this.updateOrientation(this.entity.attribute.style, this.entity);
    },
    //角度更新
    updateOrientation: function updateOrientation(style, entity) {
        var position = entity.position.getValue(this.viewer.clock.currentTime);
        if (position == null) return;

        var heading = Cesium.Math.toRadians(Number(style.heading || 0.0));
        var pitch = Cesium.Math.toRadians(Number(style.pitch || 0.0));
        var roll = Cesium.Math.toRadians(Number(style.roll || 0.0));

        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    }

});

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawCurve = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _Attr = __webpack_require__(10);

var _Edit = __webpack_require__(56);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//曲线
var DrawCurve = exports.DrawCurve = _Draw.DrawPolyline.extend({
    type: 'curve',
    _positions_show: null,
    getDrawPosition: function getDrawPosition() {
        return this._positions_show;
    },
    updateAttrForDrawing: function updateAttrForDrawing() {
        if (this._positions_draw == null || this._positions_draw.length < 3) {
            this._positions_show = this._positions_draw;
            return;
        }

        this._positions_show = (0, _Attr.line2curve)(this._positions_draw);
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditCurve(entity, this.viewer, this.dataSource);
        return this._bindEdit(_edit);
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   


        this.entity._positions_draw = this._positions_draw;
        this.entity._positions_show = this._positions_show;

        entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
            return entity._positions_show;
        }, false);
    }

});

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditCurve = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Edit = __webpack_require__(14);

var _Attr = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditCurve = exports.EditCurve = _Edit.EditPolyline.extend({
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;

        this._positions_draw = this.entity._positions_draw;
        this._positions_show = this.entity._positions_show || this.entity.polyline.positions.getValue(this.viewer.clock.currentTime);

        //this.entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
        //    return that._positions_show;
        //}, false);
    },
    //坐标位置相关  
    updateAttrForEditing: function updateAttrForEditing() {
        if (this._positions_draw == null || this._positions_draw.length < 3) {
            this._positions_show = this._positions_draw;
            return;
        }

        this._positions_show = (0, _Attr.line2curve)(this._positions_draw);
        this.entity._positions_show = this._positions_show;
    },
    //图形编辑结束后调用
    finish: function finish() {
        //this.entity.polyline.positions = this._positions_show;
        this.entity._positions_show = this._positions_show;
        this.entity._positions_draw = this._positions_draw;
    }

});

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawPolylineVolume = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(33);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(58);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var def_minPointNum = 2;
var def_maxPointNum = 9999;

var DrawPolylineVolume = exports.DrawPolylineVolume = _Draw.DrawPolyline.extend({
    type: 'polylineVolume',
    //坐标位置相关
    _minPointNum: def_minPointNum, //至少需要点的个数 
    _maxPointNum: def_maxPointNum, //最多允许点的个数
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.config) {
            this._minPointNum = attribute.config.minPointNum || def_minPointNum;
            this._maxPointNum = attribute.config.maxPointNum || def_maxPointNum;
        } else {
            this._minPointNum = def_minPointNum;
            this._maxPointNum = def_maxPointNum;
        }

        var that = this;
        var addattr = {
            polylineVolume: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        addattr.polylineVolume.positions = new Cesium.CallbackProperty(function (time) {
            return that.getDrawPosition();
        }, false);

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        this.entity._positions_draw = this._positions_draw;

        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.polylineVolume);
    },
    updateAttrForDrawing: function updateAttrForDrawing() {},
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditPolylineVolume(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象   
        this.entity.polylineVolume.positions = this.getDrawPosition();
    }

});

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditPolylineVolume = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Edit = __webpack_require__(14);

var _Attr = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditPolylineVolume = exports.EditPolylineVolume = _Edit.EditPolyline.extend({
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;

        this._positions_draw = this.entity.polylineVolume.positions.getValue(this.viewer.clock.currentTime);
        this.entity.polylineVolume.positions = new Cesium.CallbackProperty(function (time) {
            return that.getPosition();
        }, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity.polylineVolume.positions = this.getPosition();
    }

});

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawCorridor = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(60);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(61);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var def_minPointNum = 2;
var def_maxPointNum = 9999;

var DrawCorridor = exports.DrawCorridor = _Draw.DrawPolyline.extend({
    type: 'corridor',
    //坐标位置相关
    _minPointNum: def_minPointNum, //至少需要点的个数 
    _maxPointNum: def_maxPointNum, //最多允许点的个数
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.config) {
            this._minPointNum = attribute.config.minPointNum || def_minPointNum;
            this._maxPointNum = attribute.config.maxPointNum || def_maxPointNum;
        } else {
            this._minPointNum = def_minPointNum;
            this._maxPointNum = def_maxPointNum;
        }

        var that = this;
        var addattr = {
            corridor: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        addattr.corridor.positions = new Cesium.CallbackProperty(function (time) {
            return that.getDrawPosition();
        }, false);

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        this.entity._positions_draw = this._positions_draw;

        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.corridor);
    },
    updateAttrForDrawing: function updateAttrForDrawing() {},
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditCorridor(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   

        entity._positions_draw = this.getDrawPosition();
        entity.corridor.positions = new Cesium.CallbackProperty(function (time) {
            return entity._positions_draw;
        }, false);
    }

});

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.style2Entity = style2Entity;
exports.getPositions = getPositions;
exports.getCoordinates = getCoordinates;
exports.toGeoJSON = toGeoJSON;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//属性赋值到entity
function style2Entity(style, entityattr) {
    style = style || {};
    if (entityattr == null) {
        //默认值
        entityattr = {
            fill: true
        };
    }

    //Style赋值值Entity
    for (var key in style) {
        var value = style[key];
        switch (key) {
            default:
                //直接赋值
                entityattr[key] = value;
                break;
            case "opacity": //跳过扩展其他属性的参数
            case "outlineOpacity":
                break;
            case "outlineColor":
                //边框颜色
                entityattr.outlineColor = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(style.outlineOpacity || style.opacity || 1.0);
                break;
            case "color":
                //填充颜色
                entityattr.material = new Cesium.Color.fromCssColorString(value || "#FFFF00").withAlpha(Number(style.opacity || 1.0));
                break;
            case "cornerType":
                switch (value) {
                    case "BEVELED":
                        entityattr.cornerType = Cesium.CornerType.BEVELED;
                        break;
                    case "MITERED":
                        entityattr.cornerType = Cesium.CornerType.MITERED;
                        break;
                    case "ROUNDED":
                        entityattr.cornerType = Cesium.CornerType.ROUNDED;
                        break;
                    default:
                        entityattr.cornerType = value;
                        break;
                }
                break;

        }
    }

    //如果未设置任何material，设置默认颜色
    if (entityattr.material == null) {
        entityattr.material = Cesium.Color.fromRandom({
            minimumGreen: 0.75,
            maximumBlue: 0.75,
            alpha: Number(style.opacity || 1.0)
        });
    }

    return entityattr;
}

//获取entity的坐标
function getPositions(entity) {
    return entity.corridor.positions.getValue(Cesium.JulianDate.fromDate(new Date()));
}

//获取entity的坐标（geojson规范的格式）
function getCoordinates(entity) {
    var positions = getPositions(entity);
    var coordinates = Util.cartesians2lonlats(positions);
    return coordinates;
}

//entity转geojson
function toGeoJSON(entity) {
    var coordinates = getCoordinates(entity);
    return {
        type: "Feature",
        properties: entity.attribute || {},
        geometry: {
            type: "LineString",
            coordinates: coordinates
        }
    };
}

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditCorridor = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Edit = __webpack_require__(14);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditCorridor = exports.EditCorridor = _Edit.EditPolyline.extend({
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        //var that = this;

        this._positions_draw = this.entity._positions_draw || this.entity.corridor.positions.getValue(this.viewer.clock.currentTime);
        //this.entity.corridor.positions = new Cesium.CallbackProperty(function (time) {
        //    return that.getPosition();
        //}, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity._positions_draw = this.getPosition();
    }

});

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawPolygon = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(11);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(26);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var def_minPointNum = 3;
var def_maxPointNum = 9999;

var DrawPolygon = exports.DrawPolygon = _Draw.DrawPolyline.extend({
    type: 'polygon',
    //坐标位置相关
    _minPointNum: def_minPointNum, //至少需要点的个数 
    _maxPointNum: def_maxPointNum, //最多允许点的个数
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.config) {
            this._minPointNum = attribute.config.minPointNum || def_minPointNum;
            this._maxPointNum = attribute.config.maxPointNum || def_maxPointNum;
        } else {
            this._minPointNum = def_minPointNum;
            this._maxPointNum = def_maxPointNum;
        }

        var that = this;
        var addattr = {
            polygon: attr.style2Entity(attribute.style),
            attribute: attribute
        };

        addattr.polygon.hierarchy = new Cesium.CallbackProperty(function (time) {
            var positions = that.getDrawPosition();
            return new Cesium.PolygonHierarchy(positions);
        }, false);

        //线：绘制时前2点时 + 边线宽度大于1时
        addattr.polyline = {
            clampToGround: attribute.style.clampToGround,
            show: false
        };

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象

        this.bindOutline(this.entity); //边线


        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.polygon);
    },
    bindOutline: function bindOutline(entity) {
        //是否显示：绘制时前2点时 或 边线宽度大于1时
        entity.polyline.show = new Cesium.CallbackProperty(function (time) {
            var arr = attr.getPositions(entity);
            if (arr && arr.length < 3) return true;

            return entity.polygon.outline && entity.polygon.outline.getValue(time) && entity.polygon.outlineWidth && entity.polygon.outlineWidth.getValue(time) > 1;
        }, false);

        entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
            if (!entity.polyline.show.getValue(time)) return null;

            var arr = attr.getPositions(entity);
            if (arr && arr.length < 3) return arr;

            return arr.concat([arr[0]]);
        }, false);
        entity.polyline.width = new Cesium.CallbackProperty(function (time) {
            var arr = attr.getPositions(entity);
            if (arr && arr.length < 3) return 2;

            return entity.polygon.outlineWidth;
        }, false);

        entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function (time) {
            var arr = attr.getPositions(entity);
            if (arr && arr.length < 3) return entity.polygon.material.color.getValue(time);

            return entity.polygon.outlineColor.getValue(time);
        }, false));
    },
    updateAttrForDrawing: function updateAttrForDrawing() {

        var style = this.entity.attribute.style;
        if (style.extrudedHeight) {
            //存在extrudedHeight高度设置时
            var maxHight = (0, _point.getMaxHeight)(this.getDrawPosition());
            this.entity.polygon.extrudedHeight = maxHight + Number(style.extrudedHeight);
        }
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditPolygon(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   

        entity._positions_draw = this.getDrawPosition();
        entity.polygon.hierarchy = new Cesium.CallbackProperty(function (time) {
            var positions = entity._positions_draw;
            return new Cesium.PolygonHierarchy(positions);
        }, false);
    }

});

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawRectangle = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(34);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(64);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawRectangle = exports.DrawRectangle = _Draw.DrawPolyline.extend({
    type: 'rectangle',
    //坐标位置相关
    _minPointNum: 2, //至少需要点的个数 
    _maxPointNum: 2, //最多允许点的个数
    getRectangle: function getRectangle() {
        var positions = this.getDrawPosition();
        if (positions.length < 2) return null;
        return Cesium.Rectangle.fromCartesianArray(positions);
    },
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        var that = this;
        var addattr = {
            rectangle: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        addattr.rectangle.coordinates = new Cesium.CallbackProperty(function (time) {
            return that.getRectangle();
        }, false);

        //线：边线宽度大于1时
        addattr.polyline = {
            clampToGround: attribute.style.clampToGround,
            show: false
        };

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象
        this.bindOutline(this.entity); //边线

        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.rectangle);
    },
    bindOutline: function bindOutline(entity) {
        //是否显示：边线宽度大于1时
        entity.polyline.show = new Cesium.CallbackProperty(function (time) {
            return entity.rectangle.outline && entity.rectangle.outline.getValue(time) && entity.rectangle.outlineWidth && entity.rectangle.outlineWidth.getValue(time) > 1;
        }, false);
        entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
            if (!entity.polyline.show.getValue(time)) return null;

            var positions = entity._draw_positions;
            var height = entity.rectangle.height ? entity.rectangle.height.getValue(time) : 0;

            var re = Cesium.Rectangle.fromCartesianArray(positions);
            var pt1 = Cesium.Cartesian3.fromRadians(re.west, re.south, height);
            var pt2 = Cesium.Cartesian3.fromRadians(re.east, re.south, height);
            var pt3 = Cesium.Cartesian3.fromRadians(re.east, re.north, height);
            var pt4 = Cesium.Cartesian3.fromRadians(re.west, re.north, height);

            return [pt1, pt2, pt3, pt4, pt1];
        }, false);
        entity.polyline.width = new Cesium.CallbackProperty(function (time) {
            return entity.rectangle.outlineWidth;
        }, false);
        entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function (time) {
            return entity.rectangle.outlineColor.getValue(time);
        }, false));
    },
    updateAttrForDrawing: function updateAttrForDrawing() {
        var style = this.entity.attribute.style;
        if (!style.clampToGround) {
            var maxHight = (0, _point.getMaxHeight)(this.getDrawPosition());

            this.entity.rectangle.height = maxHight;
            style.height = maxHight;

            if (style.extrudedHeight) this.entity.rectangle.extrudedHeight = maxHight + Number(style.extrudedHeight);
        }
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditRectangle(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   

        entity._positions_draw = this._positions_draw;
        //entity.rectangle.coordinates = this.getRectangle(); 
        entity.rectangle.coordinates = new Cesium.CallbackProperty(function (time) {
            if (entity._positions_draw.length < 2) return null;
            return Cesium.Rectangle.fromCartesianArray(entity._positions_draw);
        }, false);
    }

});

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditRectangle = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(26);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditRectangle = exports.EditRectangle = _Edit.EditPolygon.extend({
    //getRectangle: function () {
    //    var positions = this._positions_draw;
    //    if (positions.length < 2) return null;
    //    return Cesium.Rectangle.fromCartesianArray(positions);
    //},
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;
        this._positions_draw = this.entity._positions_draw;
        //this.entity.rectangle.coordinates = new Cesium.CallbackProperty(function (time) {
        //    return that.getRectangle();
        //}, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity._positions_draw = this._positions_draw;
        //this.entity.rectangle.coordinates = this.getRectangle();
    },
    isClampToGround: function isClampToGround() {
        return this.entity.attribute.style.clampToGround;
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var clampToGround = this.isClampToGround();
        var positions = this.getPosition();

        for (var i = 0, len = positions.length; i < len; i++) {
            var position = positions[i];

            if (this.entity.rectangle.height != undefined) {
                var newHeight = this.entity.rectangle.height.getValue(this.viewer.clock.currentTime);
                position = (0, _point.setPositionsHeight)(position, newHeight);
            }

            if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                position = (0, _point.updateHeightForClampToGround)(this.viewer, position);
            }

            //各顶点
            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: position,
                //clampToGround: clampToGround,
                onDrag: function onDrag(dragger, position) {
                    if (that.entity.rectangle.height != undefined) {
                        var newHeight = that.entity.rectangle.height.getValue(this.viewer.clock.currentTime);
                        position = (0, _point.setPositionsHeight)(position, newHeight);
                        dragger.position = position;
                    }

                    positions[dragger.index] = position;

                    //============高度调整拖拽点处理=============
                    if (that.heightDraggers && that.heightDraggers.length > 0) {
                        var extrudedHeight = that.entity.rectangle.extrudedHeight.getValue(this.viewer.clock.currentTime);
                        that.heightDraggers[dragger.index].position = (0, _point.setPositionsHeight)(position, extrudedHeight);
                    }
                }
            });
            dragger.index = i;
            this.draggers.push(dragger);
        }

        //创建高程拖拽点
        if (this.entity.rectangle.extrudedHeight) this.bindHeightDraggers(this.entity.rectangle);
    }

});

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawCircle = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Tooltip = __webpack_require__(3);

var _Attr = __webpack_require__(27);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(66);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawCircle = exports.DrawCircle = _Draw.DrawPolyline.extend({
    type: 'ellipse',
    //坐标位置相关
    _minPointNum: 2, //至少需要点的个数 
    _maxPointNum: 2, //最多允许点的个数
    getShowPosition: function getShowPosition() {
        if (this._positions_draw && this._positions_draw.length > 1) return this._positions_draw[0];
        return null;
    },
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.type == "ellipse") //椭圆
            this._maxPointNum = 3;else //圆
            this._maxPointNum = 2;

        var that = this;
        var addattr = {
            position: new Cesium.CallbackProperty(function (time) {
                return that.getShowPosition();
            }, false),
            ellipse: attr.style2Entity(attribute.style),
            attribute: attribute
        };

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象 
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.ellipse);
    },
    updateAttrForDrawing: function updateAttrForDrawing(isLoad) {
        if (!this._positions_draw) return;

        if (isLoad) {
            this.addPositionsForRadius(this._positions_draw);
            return;
        }

        if (this._positions_draw.length < 2) return;

        var style = this.entity.attribute.style;

        //高度处理
        if (!style.clampToGround) {
            var height = this.formatNum(Cesium.Cartographic.fromCartesian(this._positions_draw[0]).height, 2);
            this.entity.ellipse.height = height;
            style.height = height;

            if (style.extrudedHeight) {
                var extrudedHeight = height + Number(style.extrudedHeight);
                this.entity.ellipse.extrudedHeight = extrudedHeight;
            }
        }

        //半径处理
        var radius = this.formatNum(Cesium.Cartesian3.distance(this._positions_draw[0], this._positions_draw[1]), 2);
        this.entity.ellipse.semiMinorAxis = radius; //短半轴

        if (this._maxPointNum == 3) {
            //长半轴
            var semiMajorAxis;
            if (this._positions_draw.length == 3) {
                semiMajorAxis = this.formatNum(Cesium.Cartesian3.distance(this._positions_draw[0], this._positions_draw[2]), 2);
            } else {
                semiMajorAxis = radius;
            }
            this.entity.ellipse.semiMajorAxis = semiMajorAxis;

            style.semiMinorAxis = radius;
            style.semiMajorAxis = semiMajorAxis;
        } else {
            this.entity.ellipse.semiMajorAxis = radius;

            style.radius = radius;
        }
    },
    addPositionsForRadius: function addPositionsForRadius(position) {
        this._positions_draw = [position];

        var style = this.entity.attribute.style;

        //获取椭圆上的坐标点数组
        var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
            center: position,
            semiMajorAxis: this.entity.ellipse.semiMajorAxis.getValue(this.viewer.clock.currentTime), //长半轴
            semiMinorAxis: this.entity.ellipse.semiMinorAxis.getValue(this.viewer.clock.currentTime), //短半轴
            rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
            granularity: 2.0
        }, true, false);

        //长半轴上的坐标点
        var majorPos = new Cesium.Cartesian3(cep.positions[0], cep.positions[1], cep.positions[2]);
        this._positions_draw.push(majorPos);

        if (this._maxPointNum == 3) {
            //椭圆
            //短半轴上的坐标点 
            var minorPos = new Cesium.Cartesian3(cep.positions[3], cep.positions[4], cep.positions[5]);
            this._positions_draw.push(minorPos);
        }
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditCircle(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        var entity = this.entity;

        entity.editing = this.getEditClass(entity); //绑定编辑对象   

        entity._positions_draw = this._positions_draw;
        //this.entity.position = this.getShowPosition();
        entity.position = new Cesium.CallbackProperty(function (time) {
            if (entity._positions_draw && entity._positions_draw.length > 0) return entity._positions_draw[0];
            return null;
        }, false);
    }

});

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditCircle = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(26);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditCircle = exports.EditCircle = _Edit.EditPolygon.extend({
    //getShowPosition: function () {
    //    if (this._positions_draw && this._positions_draw.length > 0)
    //        return this._positions_draw[0];
    //    return null;
    //},
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;
        this._positions_draw = this.entity._positions_draw;
        //this.entity.position = new Cesium.CallbackProperty(time => {
        //    return that.getShowPosition();
        //}, false);
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity._positions_draw = this._positions_draw;
        //this.entity.position = this.getShowPosition();
    },
    isClampToGround: function isClampToGround() {
        return this.entity.attribute.style.clampToGround;
    },
    getPosition: function getPosition() {
        //加上高度
        if (this.entity.ellipse.height != undefined) {
            var newHeight = this.entity.ellipse.height.getValue(this.viewer.clock.currentTime);
            for (var i = 0, len = this._positions_draw.length; i < len; i++) {
                this._positions_draw[i] = (0, _point.setPositionsHeight)(this._positions_draw[i], newHeight);
            }
        }
        return this._positions_draw;
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var clampToGround = this.isClampToGround();
        var positions = this.getPosition();

        var diff = new Cesium.Cartesian3();
        var newPos = new Cesium.Cartesian3();
        var style = this.entity.attribute.style;

        //中心点
        var position = positions[0];
        if (clampToGround) {
            //贴地时求贴模型和贴地的高度
            position = (0, _point.updateHeightForClampToGround)(this.viewer, position);
            positions[0] = position;
        }

        var dragger = draggerCtl.createDragger(this.dataSource, {
            position: position,
            //clampToGround: clampToGround,
            onDrag: function onDrag(dragger, position) {
                Cesium.Cartesian3.subtract(position, positions[dragger.index], diff); //记录差值

                positions[dragger.index] = position;

                //============高度处理=============
                if (!style.clampToGround) {
                    var height = that.formatNum(Cesium.Cartographic.fromCartesian(position).height, 2);
                    that.entity.ellipse.height = height;
                    style.height = height;
                }

                var time = that.viewer.clock.currentTime;

                //============半径同步处理=============
                Cesium.Cartesian3.add(dragger.majorDragger.position.getValue(time), diff, newPos);
                dragger.majorDragger.position = newPos;

                if (dragger.minorDragger) {
                    Cesium.Cartesian3.add(dragger.minorDragger.position.getValue(time), diff, newPos);
                    dragger.minorDragger.position = newPos;
                }

                //============高度调整拖拽点处理=============
                if (that.entity.attribute.style.extrudedHeight != undefined) that.updateDraggers();
            }
        });
        dragger.index = 0;
        this.draggers.push(dragger);

        var time = this.viewer.clock.currentTime;

        //获取椭圆上的坐标点数组
        var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
            center: position,
            semiMajorAxis: this.entity.ellipse.semiMajorAxis.getValue(time), //长半轴
            semiMinorAxis: this.entity.ellipse.semiMinorAxis.getValue(time), //短半轴
            rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
            granularity: 2.0
        }, true, false);

        //长半轴上的坐标点
        var majorPos = new Cesium.Cartesian3(cep.positions[0], cep.positions[1], cep.positions[2]);
        if (clampToGround) {
            //贴地时求贴模型和贴地的高度
            majorPos = (0, _point.updateHeightForClampToGround)(this.viewer, majorPos);
        }
        positions[1] = majorPos;
        var majorDragger = draggerCtl.createDragger(this.dataSource, {
            position: majorPos,
            type: draggerCtl.PointType.EditAttr,
            tooltip: _Tooltip.message.dragger.editRadius,
            //clampToGround: clampToGround,
            onDrag: function onDrag(dragger, position) {
                if (that.entity.ellipse.height != undefined) {
                    var newHeight = that.entity.ellipse.height.getValue(time);
                    position = (0, _point.setPositionsHeight)(position, newHeight);
                    dragger.position = position;
                }
                positions[dragger.index] = position;

                var radius = that.formatNum(Cesium.Cartesian3.distance(positions[0], position), 2);
                that.entity.ellipse.semiMajorAxis = radius;

                if (style.radius) {
                    //圆
                    that.entity.ellipse.semiMinorAxis = radius;
                    style.radius = radius;
                } else {
                    style.semiMajorAxis = radius;
                }

                if (that.entity.attribute.style.extrudedHeight != undefined) that.updateDraggers();
            }
        });
        majorDragger.index = 1;
        dragger.majorDragger = majorDragger;
        this.draggers.push(majorDragger);

        //短半轴上的坐标点
        if (this._maxPointNum == 3) {
            //椭圆
            //短半轴上的坐标点 
            var minorPos = new Cesium.Cartesian3(cep.positions[3], cep.positions[4], cep.positions[5]);
            if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                minorPos = (0, _point.updateHeightForClampToGround)(this.viewer, minorPos);
            }
            positions[2] = minorPos;
            var minorDragger = draggerCtl.createDragger(this.dataSource, {
                position: minorPos,
                type: draggerCtl.PointType.EditAttr,
                tooltip: _Tooltip.message.dragger.editRadius,
                //clampToGround: clampToGround,
                onDrag: function onDrag(dragger, position) {
                    if (that.entity.ellipse.height != undefined) {
                        var newHeight = that.entity.ellipse.height.getValue(time);
                        position = (0, _point.setPositionsHeight)(position, newHeight);
                        dragger.position = position;
                    }
                    positions[dragger.index] = position;

                    var radius = that.formatNum(Cesium.Cartesian3.distance(positions[0], position), 2);
                    that.entity.ellipse.semiMinorAxis = radius;

                    if (style.radius) {
                        //圆
                        that.entity.ellipse.semiMajorAxis = radius;
                        style.radius = radius;
                    } else {
                        style.semiMinorAxis = radius;
                    }

                    if (that.entity.attribute.style.extrudedHeight != undefined) that.updateDraggers();
                }
            });
            minorDragger.index = 2;
            dragger.minorDragger = minorDragger;
            this.draggers.push(minorDragger);
        }

        //创建高度拖拽点
        if (this.entity.ellipse.extrudedHeight) {
            var extrudedHeight = this.entity.ellipse.extrudedHeight.getValue(time);

            //顶部 中心点
            var position = (0, _point.setPositionsHeight)(positions[0], extrudedHeight);
            var draggerTop = draggerCtl.createDragger(this.dataSource, {
                position: position,
                onDrag: function onDrag(dragger, position) {
                    position = (0, _point.setPositionsHeight)(position, that.entity.ellipse.height);
                    positions[0] = position;

                    that.updateDraggers();
                }
            });
            this.draggers.push(draggerTop);

            var _pos = this._maxPointNum == 3 ? [positions[1], positions[2]] : [positions[1]];
            this.bindHeightDraggers(this.entity.ellipse, _pos);

            this.heightDraggers.push(draggerTop); //拖动高度时联动修改此点高
        }
    }

});

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawEllipsoid = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _EventType = __webpack_require__(7);

var EventType = _interopRequireWildcard(_EventType);

var _Tooltip = __webpack_require__(3);

var _Attr = __webpack_require__(36);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(68);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawEllipsoid = exports.DrawEllipsoid = _Draw.DrawPolyline.extend({
    type: 'ellipsoid',
    //坐标位置相关
    _minPointNum: 2, //至少需要点的个数 
    _maxPointNum: 3, //最多允许点的个数 
    getShowPosition: function getShowPosition() {
        if (this._positions_draw && this._positions_draw.length > 0) return this._positions_draw[0];
        return null;
    },
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        var that = this;
        var addattr = {
            position: new Cesium.CallbackProperty(function (time) {
                return that.getShowPosition();
            }, false),
            ellipsoid: attr.style2Entity(attribute.style),
            attribute: attribute
        };

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象 
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.ellipsoid);
    },
    updateAttrForDrawing: function updateAttrForDrawing(isLoad) {
        if (!this._positions_draw) return;

        if (isLoad) {
            this.addPositionsForRadius(this._positions_draw);
            return;
        }

        if (this._positions_draw.length < 2) return;

        var style = this.entity.attribute.style;

        //半径处理
        var radius = this.formatNum(Cesium.Cartesian3.distance(this._positions_draw[0], this._positions_draw[1]), 2);
        style.extentRadii = radius; //短半轴
        style.heightRadii = radius;

        //长半轴
        var semiMajorAxis;
        if (this._positions_draw.length == 3) {
            semiMajorAxis = this.formatNum(Cesium.Cartesian3.distance(this._positions_draw[0], this._positions_draw[2]), 2);
        } else {
            semiMajorAxis = radius;
        }
        style.widthRadii = semiMajorAxis;

        this.updateRadii(style);
    },
    updateRadii: function updateRadii(style) {
        this.entity.ellipsoid.radii.setValue(new Cesium.Cartesian3(style.extentRadii, style.widthRadii, style.heightRadii));
    },
    addPositionsForRadius: function addPositionsForRadius(position) {
        this._positions_draw = [position];

        var style = this.entity.attribute.style;

        //获取椭圆上的坐标点数组
        var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
            center: position,
            semiMajorAxis: Number(style.extentRadii), //长半轴
            semiMinorAxis: Number(style.widthRadii), //短半轴 
            rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
            granularity: 2.0
        }, true, false);

        //长半轴上的坐标点
        var majorPos = new Cesium.Cartesian3(cep.positions[0], cep.positions[1], cep.positions[2]);
        this._positions_draw.push(majorPos);

        //短半轴上的坐标点 
        var minorPos = new Cesium.Cartesian3(cep.positions[3], cep.positions[4], cep.positions[5]);
        this._positions_draw.push(minorPos);
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditEllipsoid(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象   
        this.entity._positions_draw = this._positions_draw;
        this.entity.position = this.getShowPosition();
    }

});

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditEllipsoid = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(18);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditEllipsoid = exports.EditEllipsoid = _Edit.EditBase.extend({
    _positions_draw: null,
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        this._positions_draw = this.entity.position.getValue(this.viewer.clock.currentTime);
    },
    //图形编辑结束后调用
    finish: function finish() {
        this._positions_draw = null;
    },
    updateRadii: function updateRadii(style) {
        var radii = new Cesium.Cartesian3(Number(style.extentRadii), Number(style.widthRadii), Number(style.heightRadii));
        this.entity.ellipsoid.radii.setValue(radii);
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var style = this.entity.attribute.style;

        //位置中心点
        var position = this.entity.position.getValue(this.viewer.clock.currentTime);
        var dragger = draggerCtl.createDragger(this.dataSource, {
            position: (0, _point.addPositionsHeight)(position, style.heightRadii),
            onDrag: function onDrag(dragger, position) {
                this._positions_draw = position;
                that.entity.position.setValue(position);

                that.updateDraggers();
            }
        });
        this.draggers.push(dragger);

        //获取椭圆上的坐标点数组
        var cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
            center: position,
            semiMajorAxis: Number(style.extentRadii), //长半轴
            semiMinorAxis: Number(style.widthRadii), //短半轴 
            rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
            granularity: 2.0
        }, true, false);

        //长半轴上的坐标点
        var majorPos = new Cesium.Cartesian3(cep.positions[0], cep.positions[1], cep.positions[2]);
        var majorDragger = draggerCtl.createDragger(this.dataSource, {
            position: majorPos,
            type: draggerCtl.PointType.EditAttr,
            tooltip: _Tooltip.message.dragger.editRadius,
            onDrag: function onDrag(dragger, position) {
                var newHeight = Cesium.Cartographic.fromCartesian(that._positions_draw).height;
                position = (0, _point.setPositionsHeight)(position, newHeight);
                dragger.position = position;

                var radius = that.formatNum(Cesium.Cartesian3.distance(that._positions_draw, position), 2);
                style.extentRadii = radius; //短半轴

                that.updateRadii(style);
                that.updateDraggers();
            }
        });
        dragger.majorDragger = majorDragger;
        this.draggers.push(majorDragger);

        //短半轴上的坐标点  
        var minorPos = new Cesium.Cartesian3(cep.positions[3], cep.positions[4], cep.positions[5]);
        var minorDragger = draggerCtl.createDragger(this.dataSource, {
            position: minorPos,
            type: draggerCtl.PointType.EditAttr,
            tooltip: _Tooltip.message.dragger.editRadius,
            onDrag: function onDrag(dragger, position) {
                var newHeight = Cesium.Cartographic.fromCartesian(that._positions_draw).height;
                position = (0, _point.setPositionsHeight)(position, newHeight);
                dragger.position = position;

                var radius = that.formatNum(Cesium.Cartesian3.distance(that._positions_draw, position), 2);
                style.widthRadii = radius; //长半轴

                that.updateRadii(style);
                that.updateDraggers();
            }
        });
        dragger.minorDragger = minorDragger;
        this.draggers.push(minorDragger);
    }

});

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawWall = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(8);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(37);

var attr = _interopRequireWildcard(_Attr);

var _Edit = __webpack_require__(70);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var def_minPointNum = 2;
var def_maxPointNum = 9999;

var DrawWall = exports.DrawWall = _Draw.DrawPolyline.extend({
    type: 'wall',
    //坐标位置相关
    _minPointNum: def_minPointNum, //至少需要点的个数 
    _maxPointNum: def_maxPointNum, //最多允许点的个数
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        this._positions_draw = [];

        if (attribute.config) {
            this._minPointNum = attribute.config.minPointNum || def_minPointNum;
            this._maxPointNum = attribute.config.maxPointNum || def_maxPointNum;
        } else {
            this._minPointNum = def_minPointNum;
            this._maxPointNum = def_maxPointNum;
        }

        this.maximumHeights = [];
        this.minimumHeights = [];

        var that = this;
        var addattr = {
            wall: attr.style2Entity(attribute.style),
            attribute: attribute
        };
        addattr.wall.positions = new Cesium.CallbackProperty(function (time) {
            return that.getDrawPosition();
        }, false);
        addattr.wall.minimumHeights = new Cesium.CallbackProperty(function (time) {
            return that.getMinimumHeights();
        }, false);
        addattr.wall.maximumHeights = new Cesium.CallbackProperty(function (time) {
            return that.getMaximumHeights();
        }, false);

        this.entity = this.dataSource.entities.add(addattr); //创建要素对象   
        return this.entity;
    },
    style2Entity: function style2Entity(style, entity) {
        return attr.style2Entity(style, entity.wall);
    },
    maximumHeights: null,
    getMaximumHeights: function getMaximumHeights(entity) {
        return this.maximumHeights;
    },
    minimumHeights: null,
    getMinimumHeights: function getMinimumHeights(entity) {
        return this.minimumHeights;
    },
    updateAttrForDrawing: function updateAttrForDrawing() {
        var style = this.entity.attribute.style;
        var position = this.getDrawPosition();
        var len = position.length;

        this.maximumHeights = new Array(len);
        this.minimumHeights = new Array(len);

        for (var i = 0; i < len; i++) {
            var height = Cesium.Cartographic.fromCartesian(position[i]).height;
            this.minimumHeights[i] = height;
            this.maximumHeights[i] = height + Number(style.extrudedHeight);
        }
    },
    //获取编辑对象  
    getEditClass: function getEditClass(entity) {
        var _edit = new _Edit.EditWall(entity, this.viewer, this.dataSource);
        _edit._minPointNum = this._minPointNum;
        _edit._maxPointNum = this._maxPointNum;
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束后调用
    finish: function finish() {
        this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象   
        this.entity.wall.positions = this.getDrawPosition();
        this.entity.wall.minimumHeights = this.getMinimumHeights();
        this.entity.wall.maximumHeights = this.getMaximumHeights();
    }

});

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditWall = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(14);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditWall = exports.EditWall = _Edit.EditPolyline.extend({
    //修改坐标会回调，提高显示的效率
    changePositionsToCallback: function changePositionsToCallback() {
        var that = this;

        var time = this.viewer.clock.currentTime;

        this._positions_draw = this.entity.wall.positions.getValue(time);
        this.entity.wall.positions = new Cesium.CallbackProperty(function (time) {
            return that.getPosition();
        }, false);

        this.minimumHeights = this.entity.wall.minimumHeights.getValue(time);
        this.entity.wall.minimumHeights = new Cesium.CallbackProperty(function (time) {
            return that.getMinimumHeights();
        }, false);

        this.maximumHeights = this.entity.wall.maximumHeights.getValue(time);
        this.entity.wall.maximumHeights = new Cesium.CallbackProperty(function (time) {
            return that.getMaximumHeights();
        }, false);
    },
    maximumHeights: null,
    getMaximumHeights: function getMaximumHeights(entity) {
        return this.maximumHeights;
    },
    minimumHeights: null,
    getMinimumHeights: function getMinimumHeights(entity) {
        return this.minimumHeights;
    },
    //坐标位置相关  
    updateAttrForEditing: function updateAttrForEditing() {
        var style = this.entity.attribute.style;
        var position = this.getPosition();
        var len = position.length;

        this.maximumHeights = new Array(len);
        this.minimumHeights = new Array(len);

        for (var i = 0; i < len; i++) {
            var height = Cesium.Cartographic.fromCartesian(position[i]).height;
            this.minimumHeights[i] = height;
            this.maximumHeights[i] = height + Number(style.extrudedHeight);
        }
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity.wall.positions = this.getPosition();
    },
    bindDraggers: function bindDraggers() {
        var that = this;

        var clampToGround = this.isClampToGround();

        var positions = this.getPosition();
        var style = this.entity.attribute.style;
        var hasMidPoint = positions.length < this._maxPointNum; //是否有新增点

        for (var i = 0, len = positions.length; i < len; i++) {
            var loc = positions[i];

            //各顶点
            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: loc,
                clampToGround: clampToGround,
                onDrag: function onDrag(dragger, position) {
                    positions[dragger.index] = position;

                    //============高度调整拖拽点处理=============
                    if (that.heightDraggers && that.heightDraggers.length > 0) {
                        that.heightDraggers[dragger.index].position = (0, _point.addPositionsHeight)(position, style.extrudedHeight);
                    }

                    //============新增点拖拽点处理=============
                    if (hasMidPoint) {
                        if (dragger.index > 0) {
                            //与前一个点之间的中点 
                            that.draggers[dragger.index * 2 - 1].position = Cesium.Cartesian3.midpoint(position, positions[dragger.index - 1], new Cesium.Cartesian3());
                        }
                        if (dragger.index < positions.length - 1) {
                            //与后一个点之间的中点 
                            that.draggers[dragger.index * 2 + 1].position = Cesium.Cartesian3.midpoint(position, positions[dragger.index + 1], new Cesium.Cartesian3());
                        }
                    }
                }
            });
            dragger.index = i;
            this.draggers.push(dragger);

            //中间点，拖动后新增点
            if (hasMidPoint) {
                var nextIndex = i + 1;
                if (nextIndex < len) {
                    var midpoint = Cesium.Cartesian3.midpoint(loc, positions[nextIndex], new Cesium.Cartesian3());
                    var draggerMid = draggerCtl.createDragger(this.dataSource, {
                        position: midpoint,
                        type: draggerCtl.PointType.AddMidPoint,
                        tooltip: _Tooltip.message.dragger.addMidPoint,
                        clampToGround: clampToGround,
                        onDragStart: function onDragStart(dragger, position) {
                            positions.splice(dragger.index, 0, position); //插入点 
                            that.updateAttrForEditing();
                        },
                        onDrag: function onDrag(dragger, position) {
                            positions[dragger.index] = position;
                        },
                        onDragEnd: function onDragEnd(dragger, position) {
                            that.updateDraggers();
                        }
                    });
                    draggerMid.index = nextIndex;
                    this.draggers.push(draggerMid);
                }
            }
        }

        //创建高程拖拽点
        this.bindHeightDraggers();
    },
    //高度调整拖拽点
    heightDraggers: null,
    bindHeightDraggers: function bindHeightDraggers() {
        var that = this;

        this.heightDraggers = [];

        var positions = this.getPosition();
        var style = this.entity.attribute.style;
        var extrudedHeight = Number(style.extrudedHeight);

        for (var i = 0, len = positions.length; i < len; i++) {
            var loc = (0, _point.addPositionsHeight)(positions[i], extrudedHeight);

            var dragger = draggerCtl.createDragger(this.dataSource, {
                position: loc,
                type: draggerCtl.PointType.MoveHeight,
                tooltip: _Tooltip.message.dragger.moveHeight,
                onDrag: function onDrag(dragger, position) {
                    var thisHeight = Cesium.Cartographic.fromCartesian(position).height;
                    style.extrudedHeight = that.formatNum(thisHeight - that.minimumHeights[dragger.index], 2);

                    for (var i = 0; i < positions.length; i++) {
                        if (i == dragger.index) continue;
                        that.heightDraggers[i].position = (0, _point.addPositionsHeight)(positions[i], style.extrudedHeight);
                    }
                    that.updateAttrForEditing();
                }
            });
            dragger.index = i;

            this.draggers.push(dragger);
            this.heightDraggers.push(dragger);
        }
    }

});

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawPModel = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Draw = __webpack_require__(21);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(24);

var attr = _interopRequireWildcard(_Attr);

var _Tooltip = __webpack_require__(3);

var _EditP = __webpack_require__(72);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawPModel = exports.DrawPModel = _Draw.DrawBase.extend({
    type: 'point',
    //根据attribute参数创建Entity
    createFeature: function createFeature(attribute) {
        var _this = this;

        this._positions_draw = Cesium.Cartesian3.ZERO;

        var style = attribute.style;

        var modelPrimitive = this.primitives.add(Cesium.Model.fromGltf({
            url: style.modelUrl,
            modelMatrix: this.getModelMatrix(style),
            minimumPixelSize: style.minimumPixelSize || 30
        }));
        modelPrimitive.readyPromise.then(function (model) {
            _this.style2Entity(style, _this.entity);
        });
        modelPrimitive.attribute = attribute;
        this.entity = modelPrimitive;

        return this.entity;
    },
    getModelMatrix: function getModelMatrix(cfg, position) {
        var hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(cfg.heading || 0), Cesium.Math.toRadians(cfg.pitch || 0), Cesium.Math.toRadians(cfg.roll || 0));
        var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position || this._positions_draw, hpRoll, this.viewer.scene.globe.ellipsoid, fixedFrameTransform);
        if (cfg.scale) Cesium.Matrix4.multiplyByUniformScale(modelMatrix, cfg.scale, modelMatrix);
        return modelMatrix;
    },
    style2Entity: function style2Entity(style, entity) {
        entity.modelMatrix = this.getModelMatrix(style, entity.position);
        return attr.style2Entity(style, entity);
    },
    //绑定鼠标事件
    bindEvent: function bindEvent() {
        var _this2 = this;

        this.getHandler().setInputAction(function (event) {
            var point = (0, _point.getCurrentMousePosition)(_this2.viewer.scene, event.endPosition, _this2.entity);
            if (point) {
                _this2._positions_draw = point;
                _this2.entity.modelMatrix = _this2.getModelMatrix(_this2.entity.attribute.style);
            }
            _this2.tooltip.showAt(event.endPosition, _Tooltip.message.draw.point.start);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.getHandler().setInputAction(function (event) {
            var point = (0, _point.getCurrentMousePosition)(_this2.viewer.scene, event.position, _this2.entity);
            if (point) {
                _this2._positions_draw = point;
                _this2.disable();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    //获取编辑对象类
    getEditClass: function getEditClass(entity) {
        var _edit = new _EditP.EditPModel(entity, this.viewer, this.dataSource);
        return this._bindEdit(_edit);
    },
    //获取属性处理类
    getAttrClass: function getAttrClass() {
        return attr;
    },
    //图形绘制结束,更新属性
    finish: function finish() {
        this.entity.modelMatrix = this.getModelMatrix(this.entity.attribute.style);

        this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象     
        this.entity.position = this.getDrawPosition();
    }

});

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.EditPModel = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _Dragger = __webpack_require__(6);

var draggerCtl = _interopRequireWildcard(_Dragger);

var _Tooltip = __webpack_require__(3);

var _Edit = __webpack_require__(18);

var _Attr = __webpack_require__(27);

var circleAttr = _interopRequireWildcard(_Attr);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditPModel = exports.EditPModel = _Edit.EditBase.extend({
    //外部更新位置
    setPositions: function setPositions(position) {
        this.entity.position = position;
        this.entity.modelMatrix = this.getModelMatrix();
    },
    getModelMatrix: function getModelMatrix(position) {
        var cfg = this.entity.attribute.style;

        var hpRoll = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(cfg.heading || 0), Cesium.Math.toRadians(cfg.pitch || 0), Cesium.Math.toRadians(cfg.roll || 0));
        var fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(position || this.entity.position, hpRoll, this.viewer.scene.globe.ellipsoid, fixedFrameTransform);
        if (cfg.scale) Cesium.Matrix4.multiplyByUniformScale(modelMatrix, cfg.scale, modelMatrix);
        return modelMatrix;
    },
    bindDraggers: function bindDraggers() {
        if (!this.entity.ready) {
            var that = this;
            this.entity.readyPromise.then(function (model) {
                that.bindDraggers();
            });
            return;
        }

        var that = this;

        this.entity.draw_tooltip = _Tooltip.message.dragger.def;

        var dragger = draggerCtl.createDragger(this.dataSource, {
            dragger: this.entity,
            onDrag: function onDrag(dragger, newPosition) {
                that.entity.position = newPosition;
                that.entity.modelMatrix = that.getModelMatrix(newPosition);

                that.updateDraggers();
            }
        });

        var style = this.entity.attribute.style;

        var position = this.entity.position;
        var height = Cesium.Cartographic.fromCartesian(position).height;
        var radius = this.entity.boundingSphere.radius;

        //辅助显示：创建角度调整底部圆
        this.entityAngle = this.dataSource.entities.add({
            name: '角度调整底部圆',
            position: new Cesium.CallbackProperty(function (time) {
                return that.entity.position;
            }, false),
            ellipse: circleAttr.style2Entity({
                "fill": false,
                "outline": true,
                "outlineColor": "#ffff00",
                "outlineOpacity": 0.8,
                "radius": radius,
                "height": height
            })
        });

        //创建角度调整 拖拽点
        var majorPos = this.getHeadingPosition();
        var majorDragger = draggerCtl.createDragger(this.dataSource, {
            position: majorPos,
            type: draggerCtl.PointType.EditAttr,
            tooltip: _Tooltip.message.dragger.editHeading,
            onDrag: function onDrag(dragger, position) {
                var heading = that.getHeading(that.entity.position, position);
                style.heading = that.formatNum(heading, 1);
                //console.log(heading);

                that.entity.modelMatrix = that.getModelMatrix();
                dragger.position = that.getHeadingPosition();
            }
        });
        this.draggers.push(majorDragger);

        //辅助显示：外接包围盒子
        //this.entityBox = this.dataSource.entities.add({
        //    name: '外接包围盒子',
        //    position: new Cesium.CallbackProperty(time => {
        //        return that.entity.position;
        //    }, false),
        //    box: {
        //        dimensions: new Cesium.Cartesian3(radius, radius, radius),
        //        fill: false,
        //        outline: true,
        //        outlineColor: Cesium.Color.YELLOW
        //    }
        //});

        //缩放控制点 
        var position_scale = (0, _point.addPositionsHeight)(position, radius);
        var dragger = draggerCtl.createDragger(this.dataSource, {
            position: position_scale,
            type: draggerCtl.PointType.MoveHeight,
            tooltip: _Tooltip.message.dragger.editScale,
            onDrag: function onDrag(dragger, positionNew) {
                var radiusNew = Cesium.Cartesian3.distance(positionNew, position);

                var radiusOld = dragger.radius / style.scale;
                var scaleNew = radiusNew / radiusOld;

                dragger.radius = radiusNew;
                style.scale = that.formatNum(scaleNew, 2);

                that.entity.modelMatrix = that.getModelMatrix();
                that.updateDraggers();
            }
        });
        dragger.radius = radius;
        this.draggers.push(dragger);

        //this.entityBox = this.dataSource.entities.add({
        //    name: '缩放控制点连接线',
        //    polyline: {
        //        positions: [
        //            position,
        //            position_scale
        //        ],
        //        width: 1,
        //        material: Cesium.Color.YELLOW
        //    }
        //});

    },
    destroyDraggers: function destroyDraggers() {
        _Edit.EditBase.prototype.destroyDraggers.call(this);

        if (this.entityAngle) {
            this.dataSource.entities.remove(this.entityAngle);
            delete this.entityAngle;
        }
        if (this.entityBox) {
            this.dataSource.entities.remove(this.entityBox);
            delete this.entityBox;
        }
    },
    //图形编辑结束后调用
    finish: function finish() {
        this.entity.draw_tooltip = null;
    },
    getHeadingPosition: function getHeadingPosition() {
        //创建角度调整底部圆  
        var position = this.entity.position;
        var radius = this.entity.boundingSphere.radius;
        var angle = -Number(this.entity.attribute.style.heading || 0);

        var rotpos = new Cesium.Cartesian3(radius, 0.0, 0.0);

        var mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle)));
        Cesium.Matrix4.multiply(mat, rotationX, mat);

        mat = Cesium.Matrix4.getRotation(mat, new Cesium.Matrix3());
        rotpos = Cesium.Matrix3.multiplyByVector(mat, rotpos, rotpos);
        rotpos = Cesium.Cartesian3.add(position, rotpos, rotpos);
        return rotpos;
    },
    //获取点相对于中心点的地面角度
    getHeading: function getHeading(positionCenter, positionNew) {

        //获取该位置的默认矩阵 
        var mat = Cesium.Transforms.eastNorthUpToFixedFrame(positionCenter);
        mat = Cesium.Matrix4.getRotation(mat, new Cesium.Matrix3());

        var xaxis = Cesium.Matrix3.getColumn(mat, 0, new Cesium.Cartesian3());
        var yaxis = Cesium.Matrix3.getColumn(mat, 1, new Cesium.Cartesian3());
        var zaxis = Cesium.Matrix3.getColumn(mat, 2, new Cesium.Cartesian3());

        //计算该位置 和  positionCenter 的 角度值
        var dir = Cesium.Cartesian3.subtract(positionNew, positionCenter, new Cesium.Cartesian3());
        //z crosss (dirx cross z) 得到在 xy平面的向量
        dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
        dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
        dir = Cesium.Cartesian3.normalize(dir, dir);

        var heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

        var ay = Cesium.Cartesian3.angleBetween(yaxis, dir);
        if (ay > Math.PI * 0.5) {
            heading = 2 * Math.PI - heading;
        }

        return -Cesium.Math.toDegrees(heading);
    }

});

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isOnly = isOnly;
exports.setEnable = setEnable;
exports.getEnable = getEnable;
exports.init = init;
exports.show = show;
exports.getPopupId = getPopupId;
exports.close = close;
exports.destroy = destroy;
exports.getPopupForConfig = getPopupForConfig;
exports.getPopup = getPopup;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _point = __webpack_require__(1);

var _Util = __webpack_require__(2);

var Util = _interopRequireWildcard(_Util);

var _index = __webpack_require__(38);

var attrUtil = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//该类不仅仅是popup处理，是所有一些有关单击事件的统一处理入口（从效率考虑）。

var viewer;
var handler;
var objPopup = {};

var _isOnly = true;
var _enable = true;

function isOnly(value) {
    _isOnly = value;
}

function setEnable(value) {
    _enable = value;
    if (!value) {
        close();
    }
}

function getEnable(value) {
    return _enable;
}

function init(_viewer) {
    viewer = _viewer;

    //添加弹出框 
    var infoDiv = '<div id="pupup-all-view" ></div>';
    (0, _jquery2.default)("#" + viewer._container.id).append(infoDiv);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //单击事件
    handler.setInputAction(mousePickingClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    //移动事件
    viewer.scene.postRender.addEventListener(bind2scene);
}

//鼠标点击事件
function mousePickingClick(event) {
    removeFeature();
    unHighlighPick();

    if (_isOnly) close();

    if (!_enable) return;

    var position = event.position;
    var pickedObject = viewer.scene.pick(position);

    //普通entity对象 && viewer.scene.pickPositionSupported
    if (pickedObject && Cesium.defined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
        var entity = pickedObject.id;

        //popup
        if (Cesium.defined(entity.popup)) {
            var cartesian; // = getCurrentMousePosition(viewer.scene, position);
            if ((entity.billboard || entity.label || entity.point) && pickedObject.primitive.heightReference == Cesium.HeightReference.NONE) {
                //不贴地的可以直接取值。
                cartesian = pickedObject.primitive.position;
            } else {
                cartesian = (0, _point.getCurrentMousePosition)(viewer.scene, position);
            }
            show(entity, cartesian, position);
        }

        //加统一的click处理
        if (entity.click && typeof entity.click === 'function') {
            entity.click(entity, position);
        }
        return;
    }

    //单体化3dtiles数据的处理(如：BIM的构件，城市白膜建筑)
    if (pickedObject && Cesium.defined(pickedObject.tileset) && Cesium.defined(pickedObject.getProperty)) {
        //取属性
        var attr = {};
        var names = pickedObject.getPropertyNames();
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (!pickedObject.hasProperty(name)) continue;

            var val = pickedObject.getProperty(name);
            if (val == null) continue;
            attr[name] = val;
        }

        var cfg = pickedObject.tileset._config;
        if (cfg) {
            //popup
            if (Cesium.defined(cfg.popup)) {
                var cartesian = (0, _point.getCurrentMousePosition)(viewer.scene, position);
                var item = {
                    id: pickedObject._batchId,
                    popup: {
                        html: getPopupForConfig(cfg, attr),
                        anchor: cfg.popupAnchor || [0, -15]
                    }
                };
                show(item, cartesian, position);
            }

            //高亮显示单体对象
            if (cfg.showClickFeature) {
                highlighPick(pickedObject, cfg.clickFeatureColor);
            }

            //加统一的click处理
            if (cfg.click && typeof cfg.click === 'function') {
                cfg.click({ attr: attr, feature: pickedObject }, position);
            }
            return;
        }
    }

    //primitive对象 
    if (pickedObject && Cesium.defined(pickedObject.primitive)) {
        var primitive = pickedObject.primitive;

        //popup
        if (Cesium.defined(primitive.popup)) {
            var cartesian = (0, _point.getCurrentMousePosition)(viewer.scene, position);
            show(primitive, cartesian, position);
        }

        //加统一的click处理
        if (primitive.click && typeof primitive.click === 'function') {
            primitive.click(primitive, position);
        }
        return;
    }

    pickImageryLayerFeatures(position);
}

//瓦片图层上的矢量对象，动态获取
function pickImageryLayerFeatures(position) {
    var scene = viewer.scene;
    var pickRay = scene.camera.getPickRay(position);
    var imageryLayerFeaturePromise = scene.imageryLayers.pickImageryLayerFeatures(pickRay, scene);
    if (!Cesium.defined(imageryLayerFeaturePromise)) {
        return;
    }

    Cesium.when(imageryLayerFeaturePromise, function (features) {
        if (!Cesium.defined(features) || features.length === 0) {
            return;
        }

        //单击选中的要素对象
        var feature = features[0];
        if (feature.imageryLayer == null || feature.imageryLayer.config == null) return;

        var cfg = feature.imageryLayer.config;

        //显示要素
        if (cfg.showClickFeature && feature.data) {
            showFeature(feature.data, cfg.pickFeatureStyle);
        }

        //显示popup
        var result = getPopupForConfig(feature.imageryLayer.config, feature.properties);
        if (result) {
            //console.log("tile popup" + result);
            var cartesian = (0, _point.getCurrentMousePosition)(viewer.scene, position);
            show({
                id: 'imageryLayerFeaturePromise',
                popup: {
                    html: result,
                    anchor: feature.imageryLayer.config.popupAnchor || [0, -12]
                }
            }, cartesian, position);
        }

        //加统一的click处理
        if (cfg.click && typeof cfg.click === 'function') {
            cfg.click(feature, position);
        }
    }, function () {});
}

//单击瓦片时同步显示要素处理
var lastShowFeature;
function removeFeature() {
    if (lastShowFeature == null) return;
    viewer.dataSources.remove(lastShowFeature);
    lastShowFeature = null;
}
function showFeature(item, options) {
    removeFeature();

    var feature = item;
    if (item.geometryType && item.geometryType.indexOf('esri') != -1) {
        //arcgis图层时 
        if (JSON.stringify(item.geometry).length < 10000) {
            //屏蔽大数据，页面卡顿 
            var L = window.DiitEarth.L || window.L;
            if (L.esri) {
                feature = DiitEarth.L.esri.Util.arcgisToGeoJSON(item.geometry);
            } else {
                console.log('需要引入 mars-esri 插件解析arcgis标准的json数据！');
                return;
            }
        }
    } else if (item.geometry && item.geometry.type) {
        var L = window.DiitEarth.L || window.L;
        if (L) {
            //处理数据里面的坐标为4326
            var geojson = L.geoJSON(item.geometry, {
                coordsToLatLng: function coordsToLatLng(coords) {
                    if (coords[0] > 180 || coords[0] < -180) {
                        return L.CRS.EPSG3857.unproject(L.point(coords[0], coords[1]));
                    }
                    return new L.LatLng(coords[1], coords[0], coords[2]);
                }
            });
            feature = geojson.toGeoJSON();
        }
    }

    if (feature == null) return;

    options = options || {};
    var dataSource = Cesium.GeoJsonDataSource.load(feature, {
        clampToGround: true,
        stroke: new Cesium.Color.fromCssColorString(options.stroke || "#ffff00"),
        strokeWidth: options.strokeWidth || 3,
        fill: new Cesium.Color.fromCssColorString(options.fill || "#ffff00").withAlpha(options.fillAlpha || 0.7)
    });
    dataSource.then(function (dataSource) {
        viewer.dataSources.add(dataSource);
        lastShowFeature = dataSource;
    }).otherwise(function (error) {
        console.log(error);
    });
}

//单击3dtiles单体化处理
var highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color()
};
var defaultHighlightedClr = new Cesium.Color.fromCssColorString("#95e40c");
function unHighlighPick() {
    if (Cesium.defined(highlighted.feature)) {
        try {
            highlighted.feature.color = highlighted.originalColor;
        } catch (ex) {}
        highlighted.feature = undefined;
    }
}
function highlighPick(pickedFeature, color) {
    unHighlighPick();
    highlighted.feature = pickedFeature;

    Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
    if (color && typeof color === 'string') color = new Cesium.Color.fromCssColorString(color);
    pickedFeature.color = color || defaultHighlightedClr;
}

//popup处理
function show(entity, cartesian, viewPoint) {
    if (entity == null || entity.popup == null) return;

    if (!cartesian) {
        //外部直接传入entity调用show时，可以不传入坐标，自动取值
        cartesian = attrUtil.getPositions(entity)[0];
    }

    var eleId = getPopupId(entity);

    close(eleId);

    objPopup[eleId] = {
        id: entity.id,
        popup: entity.popup,
        cartesian: cartesian,
        viewPoint: viewPoint
    };

    //显示内容
    var inhtml;
    if (_typeof(entity.popup) === 'object') inhtml = entity.popup.html;else inhtml = entity.popup;
    if (!inhtml) return;

    if (typeof inhtml === 'function') {
        //回调方法 
        inhtml = inhtml(entity, cartesian, function (inhtml) {
            _showHtml(inhtml, eleId, entity, cartesian, viewPoint);
        });
    }

    if (!inhtml) return;

    _showHtml(inhtml, eleId, entity, cartesian, viewPoint);
}

function _showHtml(inhtml, eleId, entity, cartesian, viewPoint) {
    (0, _jquery2.default)("#pupup-all-view").append('<div id="' + eleId + '" class="cesium-popup">' + '            <a class="cesium-popup-close-button cesium-popup-color" href="javascript:viewer.mars.popup.close(\'' + eleId + '\',true)">×</a>' + '            <div class="cesium-popup-content-wrapper cesium-popup-background">' + '                <div class="cesium-popup-content cesium-popup-color">' + inhtml + '</div>' + '            </div>' + '            <div class="cesium-popup-tip-container"><div class="cesium-popup-tip cesium-popup-background"></div></div>' + '        </div>');

    //计算显示位置 
    var result = updateViewPoint(eleId, cartesian, entity.popup, viewPoint);
    if (!result) {
        close(eleId);
        return;
    }
}

function updateViewPoint(eleId, cartesian, popup, point) {
    var newpoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);
    if (newpoint) {
        point = newpoint;

        if (objPopup[eleId]) objPopup[eleId].viewPoint = newpoint;
    }

    if (point == null) {
        console.log('wgs84ToWindowCoordinates无法转换为屏幕坐标');
        return false;
    }

    //判断是否在球的背面
    var scene = viewer.scene;
    if (scene.mode === Cesium.SceneMode.SCENE3D) {
        //三维模式下 
        var pickRay = scene.camera.getPickRay(point);
        var cartesianNew = scene.globe.pick(pickRay, scene);

        if (cartesianNew) {
            var len = Cesium.Cartesian3.distance(cartesian, cartesianNew);
            if (len > 1000 * 1000) return false;
        }
    }
    //判断是否在球的背面

    var $view = (0, _jquery2.default)("#" + eleId);

    var x = point.x - $view.width() / 2;
    var y = point.y - $view.height();

    if (popup && (typeof popup === "undefined" ? "undefined" : _typeof(popup)) === 'object' && popup.anchor) {
        x += popup.anchor[0];
        y += popup.anchor[1];
    }
    $view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');

    return true;
}

function bind2scene() {
    for (var i in objPopup) {
        var item = objPopup[i];
        var result = updateViewPoint(i, item.cartesian, item.popup, item.viewPoint);
        if (!result) {
            close(i);
        }
    }
}

function getPopupId(entity) {
    var eleId = 'popup_' + ((entity.id || "") + "").replace(new RegExp("[^0-9a-zA-Z\_]", "gm"), "_");
    return eleId;
}

function close(eleId, removFea) {

    if (!_isOnly && eleId) {
        if ((typeof eleId === "undefined" ? "undefined" : _typeof(eleId)) === 'object') //传入参数是eneity对象
            eleId = getPopupId(eleId);

        for (var i in objPopup) {
            if (eleId == objPopup[i].id || eleId == i) {
                (0, _jquery2.default)("#" + i).remove();
                delete objPopup[i];
                break;
            }
        }
    } else {
        (0, _jquery2.default)("#pupup-all-view").empty();
        objPopup = {};
    }

    if (removFea) {
        removeFeature();
        unHighlighPick();
    }
}

function destroy() {
    close();
    handler.destroy();
    viewer.scene.postRender.removeEventListener(bind2scene);
}

function template(str, data) {
    for (var col in data) {
        var showval = data[col];
        if (showval == null || showval == 'Null' || showval == 'Unknown') showval = "";

        if (col.substr(0, 1) == "_") {
            col = col.substring(1); //cesium 内部属性
        }
        str = str.replace(new RegExp('{' + col + '}', "gm"), showval);
    }
    return str;
}

function getAttrVal(attr) {
    try {
        var newattr = {};
        if (attr._propertyNames && attr._propertyNames.length > 0) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = attr._propertyNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _key = _step.value;

                    newattr[_key] = attr[_key].getValue(viewer.clock.currentTime);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        } else {
            for (var key in attr) {
                if (typeof attr[key] === 'function') continue;
                newattr[key] = attr[key];
            }
        }
        return newattr;
    } catch (e) {
        console.log(e);
    }
    return attr;
}

//通用，统一配置popup方式
function getPopupForConfig(cfg, attr) {
    var _title = cfg.popupNameField ? attr[cfg.popupNameField] : cfg.name;

    if (cfg.popup) {
        return getPopup(cfg.popup, attr, _title);
    } else if (cfg.columns) {
        return getPopup(cfg.columns, attr, _title);
    }
    return false;
}

//获取Popup或Tooltip格式化字符串
function getPopup(cfg, attr, title) {
    if (!attr) return false;

    title = title || '';

    if (Util.isArray(cfg)) {
        //数组  
        var countsok = 0;
        var inhtml = '<div class="mars-popup-titile">' + title + '</div><div class="mars-popup-content" >';
        for (var i = 0; i < cfg.length; i++) {
            var thisfield = cfg[i];

            var col = thisfield.field;
            if (col == null || attr[col] == null) continue;

            if (_typeof(attr[col]) === 'object' && attr[col].hasOwnProperty && attr[col].hasOwnProperty('getValue')) attr[col] = attr[col].getValue(viewer.clock.currentTime);
            if (typeof attr[col] === 'function') continue;

            if (thisfield.type == 'details') {
                //详情按钮 
                var showval = _jquery2.default.trim(attr[col || "OBJECTID"]);
                if (showval == null || showval == '' || showval == 'Null' || showval == 'Unknown') continue;

                inhtml += '<div style="text-align: center;padding: 10px 0;"><button type="button" onclick="' + thisfield.calback + '(\'' + showval + '\');" " class="btn btn-info  btn-sm">' + (thisfield.name || '查看详情') + '</button></div>';
                continue;
            }

            var showval = _jquery2.default.trim(attr[col]);
            if (showval == null || showval == '' || showval == 'Null' || showval == 'Unknown' || showval == '0' || showval.length == 0) continue;

            if (thisfield.format) {
                //格式化
                try {
                    showval = eval(thisfield.format + "(" + showval + ")");
                } catch (e) {
                    console.log("getPopupByConfig error:" + thisfield.format);
                }
            }
            if (thisfield.unit) {
                showval += thisfield.unit;
            }

            inhtml += '<div><label>' + thisfield.name + '</label>' + showval + '</div>';
            countsok++;
        }
        inhtml += "</div>";

        if (countsok == 0) return false;
        return inhtml;
    } else if ((typeof cfg === "undefined" ? "undefined" : _typeof(cfg)) === 'object') {
        //对象,type区分逻辑
        switch (cfg.type) {
            case "iframe":
                var _url = _util.template(cfg.url, attr);

                var inhtml = '<iframe id="ifarm" src="' + _url + '"  style="width:' + (cfg.width || '300') + 'px;height:' + (cfg.height || '300') + 'px;overflow:hidden;margin:0;" scrolling="no" frameborder="0" ></iframe>';
                return inhtml;
                break;
            case "javascript":
                //回调方法 
                return eval(cfg.calback + "(" + JSON.stringify(getAttrVal(attr)) + ")");
                break;
        }
    } else if (typeof cfg === 'function') {
        return cfg(attr);
    } else if (cfg == "all") {
        //全部显示
        var countsok = 0;
        var inhtml = '<div class="mars-popup-titile">' + title + '</div><div class="mars-popup-content" >';
        for (var col in attr) {
            try {
                if (col == null || attr[col] == null) continue;

                if (col == "Shape" || col == "FID" || col == "OBJECTID" || col == "_definitionChanged" || col == "_propertyNames") continue; //不显示的字段

                if (col.substr(0, 1) == "_") {
                    col = col.substring(1); //cesium 内部属性
                }

                if (_typeof(attr[col]) === 'object' && attr[col].hasOwnProperty && attr[col].hasOwnProperty('getValue')) attr[col] = attr[col].getValue(viewer.clock.currentTime);
                if (typeof attr[col] === 'function') continue;

                var showval = _jquery2.default.trim(attr[col]);
                if (showval == null || showval == '' || showval == 'Null' || showval == 'Unknown' || showval == '0' || showval.length == 0) continue; //不显示空值，更美观友好

                inhtml += '<div><label>' + col + '</label>' + showval + '</div>';
                countsok++;
            } catch (e) {
                console.log(e);
            }
        }
        inhtml += "</div>";

        if (countsok == 0) return false;
        return inhtml;
    } else {
        //格式化字符串 
        return template(cfg, attr);
    }

    return false;
}

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.init = init;
exports.show = show;
exports.close = close;
exports.destroy = destroy;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _point = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var viewer;
var handler;

function init(_viewer) {
    viewer = _viewer;

    //添加弹出框  
    var infoDiv = '<div id="tooltip-view" class="cesium-popup" style="display:none;">' + '     <div class="cesium-popup-content-wrapper  cesium-popup-background">' + '         <div id="tooltip-content" class="cesium-popup-content cesium-popup-color"></div>' + '     </div>' + '     <div class="cesium-popup-tip-container"><div class="cesium-popup-tip  cesium-popup-background"></div></div>' + '</div> ';
    (0, _jquery2.default)("#" + viewer._container.id).append(infoDiv);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //鼠标移动事件
    handler.setInputAction(mouseMovingPicking, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

//鼠标移动事件
function mouseMovingPicking(event) {
    (0, _jquery2.default)('.cesium-viewer').css('cursor', '');

    if (viewer.scene.screenSpaceCameraController.enableRotate === false || viewer.scene.screenSpaceCameraController.enableTilt === false || viewer.scene.screenSpaceCameraController.enableTranslate === false) {
        close();
        return;
    }

    var position = event.endPosition;

    var entity; //鼠标感知的对象，可能是entity或primitive
    var pickedObject = viewer.scene.pick(position);
    //普通entity对象 && viewer.scene.pickPositionSupported
    if (pickedObject && Cesium.defined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
        entity = pickedObject.id;
    }
    //primitive对象 
    else if (pickedObject && Cesium.defined(pickedObject.primitive)) {
            entity = pickedObject.primitive;
        }

    if (entity) {
        //存在鼠标感知的对象
        if (entity.popup || entity.click || entity.cursorCSS) {
            (0, _jquery2.default)('.cesium-viewer').css('cursor', entity.cursorCSS || 'pointer');
        }

        //加统一的 mouseover 鼠标移入处理
        if (!entity.noMouseMove) {
            //排除标识了不处理其移入事件的对象 ，比如高亮对象本身
            clearTimeout(lastTime);
            lastTime = setTimeout(function () {
                activateMouseOver(entity, position);
            }, 20);
        }

        //tooltip
        if (entity.tooltip) {
            var cartesian = (0, _point.getCurrentMousePosition)(viewer.scene, position);
            show(entity, cartesian, position);
        } else {
            close();
        }
    } else {
        close();

        clearTimeout(lastTime);
        lastTime = setTimeout(activateMouseOut, 20);
    }
}

function show(entity, cartesian, position) {
    if (entity == null || entity.tooltip == null) return;

    //计算显示位置 
    if (position == null) position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, cartesian);
    if (position == null) {
        close();
        return;
    }

    var $view = (0, _jquery2.default)("#tooltip-view");

    //显示内容
    var inhtml;
    if (_typeof(entity.tooltip) === 'object') {
        inhtml = entity.tooltip.html;
        if (entity.tooltip.check) {
            if (!entity.tooltip.check()) {
                close();
                return;
            }
        }
    } else {
        inhtml = entity.tooltip;
    }

    if (typeof inhtml === 'function') {
        inhtml = inhtml(entity, cartesian); //回调方法
    }
    if (!inhtml) return;

    (0, _jquery2.default)("#tooltip-content").html(inhtml);
    $view.show();

    //定位位置
    var x = position.x - $view.width() / 2;
    var y = position.y - $view.height();

    var tooltip = entity.tooltip;
    if (tooltip && (typeof tooltip === "undefined" ? "undefined" : _typeof(tooltip)) === 'object' && tooltip.anchor) {
        x += tooltip.anchor[0];
        y += tooltip.anchor[1];
    } else {
        y -= 15; //默认偏上10像素
    }
    $view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');
}

function close() {
    (0, _jquery2.default)("#tooltip-content").empty();
    (0, _jquery2.default)("#tooltip-view").hide();
}

var lastEntity;
var lastTime;

function activateMouseOver(entity, position) {
    if (lastEntity === entity) return;

    activateMouseOut();

    if (entity.mouseover && typeof entity.mouseover === 'function') entity.mouseover(entity, position);

    lastEntity = entity;
}

function activateMouseOut() {
    if (lastEntity == null) return;

    if (lastEntity.mouseout && typeof lastEntity.mouseout === 'function') lastEntity.mouseout(lastEntity);
    lastEntity = null;
}

function destroy() {
    close();
    handler.destroy();
}

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.defaultContextmenuItems = undefined;
exports.init = init;
exports.show = show;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _point = __webpack_require__(1);

var point = _interopRequireWildcard(_point);

var _util2 = __webpack_require__(4);

var _util = _interopRequireWildcard(_util2);

var _firstPerson2 = __webpack_require__(39);

var _firstPerson = _interopRequireWildcard(_firstPerson2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var viewer;
var handler;

//右键菜单 
var defaultContextmenuItems = exports.defaultContextmenuItems = [{
    text: '显示此处经纬度',
    iconCls: 'fa fa-info-circle',
    calback: function calback(e) {
        var cartesian = point.getCurrentMousePosition(viewer.scene, e.position);
        var mpt = point.formatPositon(cartesian);

        var inhtml = "经度：" + mpt.x + " , 纬度：" + mpt.y + "<br/>高程：" + mpt.z;
        _util.alert(inhtml, '位置信息');
    }
}, {
    text: '显示当前视角信息',
    iconCls: 'fa fa-camera-retro',
    calback: function calback(e) {
        var mpt = point.getCameraView(viewer);
        _util.alert(JSON.stringify(mpt), '当前视角信息');
    }
}, {
    text: '开启光照效果',
    iconCls: 'fa fa-bullseye',
    visible: function visible() {
        return !viewer.shadows;
    },
    calback: function calback(e) {
        viewer.shadows = true;
        viewer.terrainShadows = Cesium.ShadowMode.ENABLED;
        viewer.scene.globe.enableLighting = true;
    }
}, {
    text: '关闭光照效果',
    iconCls: 'fa fa-sun-o',
    visible: function visible() {
        return viewer.shadows;
    },
    calback: function calback(e) {
        viewer.shadows = false;
        viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
        viewer.scene.globe.enableLighting = false;
    }
}, {
    text: '开启深度监测',
    iconCls: 'fa fa-eye-slash',
    visible: function visible() {
        return !viewer.scene.globe.depthTestAgainstTerrain;
    },
    calback: function calback(e) {
        viewer.scene.globe.depthTestAgainstTerrain = true;
    }
}, {
    text: '关闭深度监测',
    iconCls: 'fa fa-eye',
    visible: function visible() {
        return viewer.scene.globe.depthTestAgainstTerrain;
    },
    calback: function calback(e) {
        viewer.scene.globe.depthTestAgainstTerrain = false;
    }
}, {
    text: '开启键盘控制',
    iconCls: 'fa fa-keyboard-o',
    visible: function visible() {
        return !_firstPerson.isEnable();
    },
    calback: function calback(e) {
        _firstPerson.bind(viewer);
    }
}, {
    text: '关闭键盘控制',
    iconCls: 'fa fa-hand-o-right',
    visible: function visible() {
        return _firstPerson.isEnable();
    },
    calback: function calback(e) {
        _firstPerson.unbind(viewer);
    }
}, {
    text: '绕此处环绕飞行',
    iconCls: 'fa fa-retweet',
    visible: function visible() {
        return !point.windingPoint.isStart;
    },
    calback: function calback(e) {
        var position = point.getCurrentMousePosition(viewer.scene, e.position);
        point.windingPoint.start(viewer, position);
    }
}, {
    text: '关闭环绕飞行',
    iconCls: 'fa fa-remove',
    visible: function visible() {
        return point.windingPoint.isStart;
    },
    calback: function calback(e) {
        point.windingPoint.stop();
    }
}, {
    text: '移动到此处',
    iconCls: 'fa fa-send-o',
    calback: function calback(e) {
        var cartesian = point.getCurrentMousePosition(viewer.scene, e.position);

        var range = viewer.scene.camera.positionCartographic.height;
        if (range > 5000) range = 5000;

        viewer.camera.lookAt(cartesian, new Cesium.HeadingPitchRange(viewer.camera.heading, viewer.camera.pitch, range));
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
}, {
    text: '第一视角站到此处',
    iconCls: 'fa fa-street-view',
    calback: function calback(e) {
        var cartesian = point.getCurrentMousePosition(viewer.scene, e.position);

        viewer.camera.flyTo({
            destination: point.addPositionsHeight(cartesian, 10), //升高10米
            orientation: {
                heading: Cesium.Math.toRadians(0), //绕垂直于地心的轴旋转
                pitch: Cesium.Math.toRadians(10), //绕纬度线旋转
                roll: Cesium.Math.toRadians(0) //绕经度线旋转
            }
        });
    }
}];

function init(_viewer) {
    viewer = _viewer;

    //添加弹出框 
    var infoDiv = '<div id="mars-contextmenu" class="mars-contextmenu open" style="display:none;">\n            <ul id="mars-contextmenu-ul" class="dropdown-menu mars-contextmenu-ul"> \n            </ul>\n        </div>';
    (0, _jquery2.default)("#" + viewer._container.id).append(infoDiv);

    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(close, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    handler.setInputAction(close, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
    handler.setInputAction(close, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
    handler.setInputAction(close, Cesium.ScreenSpaceEventType.PINCH_START);
    handler.setInputAction(close, Cesium.ScreenSpaceEventType.WHEEL);
    handler.setInputAction(function (event) {
        close();
        var position = event.position;

        var entity; //鼠标感知的对象，可能是entity或primitive
        var pickedObject = viewer.scene.pick(position);
        //普通entity对象 
        if (pickedObject && Cesium.defined(pickedObject.id) && pickedObject.id instanceof Cesium.Entity) {
            entity = pickedObject.id;
            show(entity.contextmenuItems, position, entity);
            return;
        }
        //primitive对象 
        else if (pickedObject && Cesium.defined(pickedObject.primitive)) {
                entity = pickedObject.primitive;
                if (entity.contextmenuItems) show(entity.contextmenuItems, position, entity);else show(viewer.mars.contextmenuItems, position);
                return;
            }

        show(viewer.mars.contextmenuItems, position);
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

function show(contextmenu, position, entity) {
    if (!contextmenu || contextmenu.length == 0) {
        close();
        return;
    };

    var inhtml = "";
    for (var i = 0, len = contextmenu.length; i < len; i++) {
        var item = contextmenu[i];

        if (item.hasOwnProperty("visible")) {
            var visible = item.visible;
            if (typeof visible === 'function') {
                //回调方法 
                visible = item.visible();
            }
            if (!visible) continue;
        }

        if (item.text) inhtml += '<li class="contextmenu-item" data-index="' + i + '"><a href="javascript:void(0)"><i class="' + item.iconCls + '"></i>' + item.text + '</a></li>';else inhtml += '<li class="line"></li>';
    }

    if (inhtml == "") {
        close();
        return;
    };

    (0, _jquery2.default)("#mars-contextmenu-ul").html(inhtml);
    (0, _jquery2.default)("#mars-contextmenu-ul .contextmenu-item").click(function (e) {
        var index = Number((0, _jquery2.default)(this).attr('data-index'));
        var item = contextmenu[index];
        if (item && item.calback) {
            item.calback({
                position: position,
                data: item,
                target: entity
            });
        }
        close();
    });

    (0, _jquery2.default)("#mars-contextmenu").css({
        "top": position.y + 10,
        "left": position.x + 10
    }).show();
}

function close() {
    (0, _jquery2.default)("#mars-contextmenu").hide();
}

function destroy() {}

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GroupLayer = undefined;

var _BaseLayer = __webpack_require__(9);

var GroupLayer = _BaseLayer.BaseLayer.extend({
    create: function create() {
        var arr = this.config._layers;

        for (var i = 0, len = arr.length; i < len; i++) {
            this.hasOpacity = arr[i].hasOpacity;
            this.hasZIndex = arr[i].hasZIndex;
        }
    },
    setVisible: function setVisible(val) {
        this._visible = val;

        var arr = this.config._layers;
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(val);
        }
    },
    //添加 
    add: function add() {
        this._visible = true;

        var arr = this.config._layers;
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(true);
        }
    },
    //移除
    remove: function remove() {
        this._visible = false;

        var arr = this.config._layers;
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(false);
        }
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        var arr = this.config._layers;
        for (var i = 0, len = arr.length; i < len; i++) {
            arr[i].centerAt(duration);
        }
    },
    //设置透明度
    setOpacity: function setOpacity(value) {
        var arr = this.config._layers;
        for (var i = 0, len = arr.length; i < len; i++) {
            if (!arr[i].hasOpacity) continue;
            arr[i].setOpacity(value);
        }
    }

    //设置叠加顺序
    //setZIndex: function (value) {
    //    var arr = this.config._layers;
    //    for (var i = 0; i < arr.length; i++) {
    //        arr[i].setZIndex(value);
    //    }
    //},


});

exports.GroupLayer = GroupLayer;

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraticuleLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _BaseLayer = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GraticuleLayer = _BaseLayer.BaseLayer.extend({
    model: null,
    //添加 
    add: function add() {
        if (this.model == null) {
            this.initData();
        }
        this.model.setVisible(true);
    },
    //移除
    remove: function remove() {
        if (this.model == null) return;

        this.model.setVisible(false);
    },

    initData: function initData() {
        function GraticuleLayer(description, scene) {

            description = description || {};

            this._tilingScheme = description.tilingScheme || new Cesium.GeographicTilingScheme();

            this._color = description.color || new Cesium.Color(1.0, 1.0, 1.0, 0.4);

            this._tileWidth = description.tileWidth || 256;
            this._tileHeight = description.tileHeight || 256;

            this._ready = true;

            // default to decimal intervals
            this._sexagesimal = description.sexagesimal || false;
            this._numLines = description.numLines || 50;

            this._scene = scene;
            this._labels = new Cesium.LabelCollection();
            scene.primitives.add(this._labels);
            this._polylines = new Cesium.PolylineCollection();
            scene.primitives.add(this._polylines);
            this._ellipsoid = scene.globe.ellipsoid;

            var canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            this._canvas = canvas;

            var that = this;
            scene.camera.moveEnd.addEventListener(function () {
                if (!that._show) return;

                that._polylines.removeAll();
                that._labels.removeAll();
                that._currentExtent = null;
                that._drawGrid(that._getExtentView());
            });
            scene.imageryLayers.addImageryProvider(this);
        };

        var definePropertyWorks = function () {
            try {
                return 'x' in Object.defineProperty({}, 'x', {});
            } catch (e) {
                return false;
            }
        }();

        /**
         * Defines properties on an object, using Object.defineProperties if available,
         * otherwise returns the object unchanged.  This function should be used in
         * setup code to prevent errors from completely halting JavaScript execution
         * in legacy browsers.
         *
         * @private
         *
         * @exports defineProperties
         */
        var defineProperties = Object.defineProperties;
        if (!definePropertyWorks || !defineProperties) {
            defineProperties = function defineProperties(o) {
                return o;
            };
        }

        defineProperties(GraticuleLayer.prototype, {
            url: {
                get: function get() {
                    return undefined;
                }
            },

            proxy: {
                get: function get() {
                    return undefined;
                }
            },

            tileWidth: {
                get: function get() {
                    return this._tileWidth;
                }
            },

            tileHeight: {
                get: function get() {
                    return this._tileHeight;
                }
            },

            maximumLevel: {
                get: function get() {
                    return 18;
                }
            },

            minimumLevel: {
                get: function get() {
                    return 0;
                }
            },
            tilingScheme: {
                get: function get() {
                    return this._tilingScheme;
                }
            },
            rectangle: {
                get: function get() {
                    return this._tilingScheme.rectangle;
                }
            },
            tileDiscardPolicy: {
                get: function get() {
                    return undefined;
                }
            },
            errorEvent: {
                get: function get() {
                    return this._errorEvent;
                }
            },
            ready: {
                get: function get() {
                    return this._ready;
                }
            },
            credit: {
                get: function get() {
                    return this._credit;
                }
            },
            hasAlphaChannel: {
                get: function get() {
                    return true;
                }
            }
        });

        GraticuleLayer.prototype.makeLabel = function (lng, lat, text, top, color) {
            this._labels.add({
                position: this._ellipsoid.cartographicToCartesian(new Cesium.Cartographic(lng, lat, 10.0)),
                text: text,
                //font: 'normal',
                //style: Cesium.LabelStyle.FILL,
                //fillColor: 'white',
                //outlineColor: 'white',
                font: 'normal small-caps normal 16px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,

                pixelOffset: new Cesium.Cartesian2(5, top ? 5 : -5),
                eyeOffset: Cesium.Cartesian3.ZERO,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: top ? Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP,
                scale: 1.0
            });
        };

        GraticuleLayer.prototype._drawGrid = function (extent) {

            if (this._currentExtent && this._currentExtent.equals(extent)) {
                return;
            }
            this._currentExtent = extent;

            this._polylines.removeAll();
            this._labels.removeAll();

            var minPixel = 0;
            var maxPixel = this._canvasSize;

            var dLat = 0,
                dLng = 0,
                index;
            // get the nearest to the calculated value
            for (index = 0; index < mins.length && dLat < (extent.north - extent.south) / 10; index++) {
                dLat = mins[index];
            }
            for (index = 0; index < mins.length && dLng < (extent.east - extent.west) / 10; index++) {
                dLng = mins[index];
            }

            // round iteration limits to the computed grid interval
            var minLng = (extent.west < 0 ? Math.ceil(extent.west / dLng) : Math.floor(extent.west / dLng)) * dLng;
            var minLat = (extent.south < 0 ? Math.ceil(extent.south / dLat) : Math.floor(extent.south / dLat)) * dLat;
            var maxLng = (extent.east < 0 ? Math.ceil(extent.east / dLat) : Math.floor(extent.east / dLat)) * dLat;
            var maxLat = (extent.north < 0 ? Math.ceil(extent.north / dLng) : Math.floor(extent.north / dLng)) * dLng;

            // extend to make sure we cover for non refresh of tiles
            minLng = Math.max(minLng - 2 * dLng, -Math.PI);
            maxLng = Math.min(maxLng + 2 * dLng, Math.PI);
            minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2);
            maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2);

            var ellipsoid = this._ellipsoid;
            var lat,
                lng,
                granularity = Cesium.Math.toRadians(1);

            // labels positions
            var latitudeText = minLat + Math.floor((maxLat - minLat) / dLat / 2) * dLat;
            for (lng = minLng; lng < maxLng; lng += dLng) {
                // draw meridian
                var path = [];
                for (lat = minLat; lat < maxLat; lat += granularity) {
                    path.push(new Cesium.Cartographic(lng, lat));
                }
                path.push(new Cesium.Cartographic(lng, maxLat));
                this._polylines.add({
                    positions: ellipsoid.cartographicArrayToCartesianArray(path),
                    width: 1
                });
                var degLng = Cesium.Math.toDegrees(lng);
                this.makeLabel(lng, latitudeText, this._sexagesimal ? this._decToSex(degLng) : degLng.toFixed(gridPrecision(dLng)), false);
            }

            // lats
            var longitudeText = minLng + Math.floor((maxLng - minLng) / dLng / 2) * dLng;
            for (lat = minLat; lat < maxLat; lat += dLat) {
                // draw parallels
                var path = [];
                for (lng = minLng; lng < maxLng; lng += granularity) {
                    path.push(new Cesium.Cartographic(lng, lat));
                }
                path.push(new Cesium.Cartographic(maxLng, lat));
                this._polylines.add({
                    positions: ellipsoid.cartographicArrayToCartesianArray(path),
                    width: 1
                });
                var degLat = Cesium.Math.toDegrees(lat);
                this.makeLabel(longitudeText, lat, this._sexagesimal ? this._decToSex(degLat) : degLat.toFixed(gridPrecision(dLat)), true);
            }
        };

        GraticuleLayer.prototype.requestImage = function (x, y, level) {

            if (this._show) {
                this._drawGrid(this._getExtentView());
            }

            return this._canvas;
        };

        GraticuleLayer.prototype.setVisible = function (visible) {
            this._show = visible;
            if (!visible) {
                this._polylines.removeAll();
                this._labels.removeAll();
            } else {
                this._currentExtent = null;
                this._drawGrid(this._getExtentView());
            }
        };

        GraticuleLayer.prototype.isVisible = function () {
            return this._show;
        };

        GraticuleLayer.prototype._decToSex = function (d) {
            var degs = Math.floor(d);
            var mins = ((Math.abs(d) - degs) * 60.0).toFixed(2);
            if (mins == "60.00") {
                degs += 1.0;mins = "0.00";
            }
            return [degs, ":", mins].join('');
        };

        GraticuleLayer.prototype._getExtentView = function () {
            var camera = this._scene.camera;
            var canvas = this._scene.canvas;
            var corners = [camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, 0), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(0, canvas.height), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), this._ellipsoid)];
            for (var index = 0; index < 4; index++) {
                if (corners[index] === undefined) {
                    return Cesium.Rectangle.MAX_VALUE;
                }
            }
            return Cesium.Rectangle.fromCartographicArray(this._ellipsoid.cartesianArrayToCartographicArray(corners));
        };

        function gridPrecision(dDeg) {
            if (dDeg < 0.01) return 2;
            if (dDeg < 0.1) return 1;
            if (dDeg < 1) return 0;
            return 0;
        }

        var mins = [Cesium.Math.toRadians(0.05), Cesium.Math.toRadians(0.1), Cesium.Math.toRadians(0.2), Cesium.Math.toRadians(0.5), Cesium.Math.toRadians(1.0), Cesium.Math.toRadians(2.0), Cesium.Math.toRadians(5.0), Cesium.Math.toRadians(10.0)];

        function loggingMessage(message) {
            var logging = document.getElementById('logging');
            logging.innerHTML += message;
        }

        this.model = new GraticuleLayer({ numLines: 10 }, this.viewer.scene);
    }

});

exports.GraticuleLayer = GraticuleLayer;

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FeatureGridLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _TileLayer = __webpack_require__(40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FeatureGridLayer = _TileLayer.TileLayer.extend({
    dataSource: null,
    hasOpacity: false,
    create: function create() {
        this.dataSource = new Cesium.CustomDataSource(); //用于entity
        this.primitives = new Cesium.PrimitiveCollection(); //用于primitive


        var that = this;
        this.config.type_new = "custom_featuregrid";
        this.config.addImageryCache = function (opts) {
            return that._addImageryCache(opts);
        };
        this.config.removeImageryCache = function (opts) {
            return that._removeImageryCache(opts);
        };
        this.config.removeAllImageryCache = function (opts) {
            return that._removeAllImageryCache(opts);
        };
    },
    getLength: function getLength() {
        return this.primitives.length + this.dataSource.entities.values.length;
    },
    addEx: function addEx() {
        this.viewer.dataSources.add(this.dataSource);
        this.viewer.scene.primitives.add(this.primitives);
    },
    removeEx: function removeEx() {
        this.viewer.dataSources.remove(this.dataSource);
        this.viewer.scene.primitives.remove(this.primitives);
    },
    _addImageryCache: function _addImageryCache(opts) {},
    _removeImageryCache: function _removeImageryCache(opts) {},
    _removeAllImageryCache: function _removeAllImageryCache() {}

});

exports.FeatureGridLayer = FeatureGridLayer;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.POILayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _pointconvert = __webpack_require__(19);

var pointconvert = _interopRequireWildcard(_pointconvert);

var _CustomFeatureGridLayer = __webpack_require__(41);

var _Attr = __webpack_require__(23);

var _Attr2 = __webpack_require__(15);

var _Attr3 = __webpack_require__(13);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var POILayer = _CustomFeatureGridLayer.CustomFeatureGridLayer.extend({
    //查询POI服务
    _keys: null,
    _key_index: 0,
    getKey: function getKey() {
        if (!this._keys) {
            this._keys = this.config.key || ["c95467d0ed2a3755836e37dc27369f97", "4320dda936d909d73ab438b4e29cf2a2", "e64a96ed7e361cbdc0ebaeaf3818c564", "df3247b7df64434adecb876da94755d7", "d4375ec477cb0a473c448fb1f83be781", "13fdd7b2b90a9d326ae96867ebcc34ce", "c34502450ae556f42b21760faf6695a0", "57f8ebe12797a73fc5b87f5d4ef859b1"];
        }

        var thisidx = this._key_index++ % this._keys.length;
        return this._keys[thisidx];
    },

    //获取网格内的数据，calback为回调方法，参数传数据数组 
    getDataForGrid: function getDataForGrid(opts, calback) {
        var jwd1 = pointconvert.wgs2gcj([opts.rectangle.xmin, opts.rectangle.ymax]); //加偏
        var jwd2 = pointconvert.wgs2gcj([opts.rectangle.xmax, opts.rectangle.ymin]); //加偏
        var polygon = jwd1[0] + "," + jwd1[1] + "|" + jwd2[0] + "," + jwd2[1];

        var filter = this.config.filter || {};
        filter.output = "json";
        filter.key = this.getKey();
        filter.polygon = polygon;
        if (!filter.offset) filter.offset = 25;
        if (!filter.types) filter.types = "120000|130000|190000";

        var that = this;
        _jquery2.default.ajax({
            url: 'http://restapi.amap.com/v3/place/polygon',
            type: "get",
            dataType: "json",
            timeout: "5000",
            data: filter,
            success: function success(data) {
                if (data.infocode !== "10000") {
                    console.log("POI 请求失败(" + data.infocode + ")：" + data.info);
                    return;
                }
                var arrdata = data.pois;
                calback(arrdata);
            },
            error: function error(data) {
                console.log("POI 请求出错(" + data.status + ")：" + data.statusText);
            }
        });
    },
    //根据数据创造entity
    createEntity: function createEntity(opts, attributes) {
        var inthtml = "<div>名称：" + attributes.name + "</div>" + "<div>地址：" + attributes.address + "</div>" + "<div>区域：" + attributes.pname + attributes.cityname + attributes.adname + "</div>" + "<div>类别：" + attributes.type + "</div>";

        var arrjwd = attributes.location.split(",");
        arrjwd = pointconvert.gcj2wgs(arrjwd); //纠偏
        var lnglat = this.viewer.mars.point2map({ x: arrjwd[0], y: arrjwd[1] });

        var entityOptions = {
            name: attributes.name,
            position: Cesium.Cartesian3.fromDegrees(lnglat.x, lnglat.y, this.config.height || 3),
            popup: {
                html: inthtml,
                anchor: [0, -15]
            },
            properties: attributes
        };

        var symbol = this.config.symbol;
        if (symbol) {
            var styleOpt = symbol.styleOptions;
            if (symbol.styleField) {
                //存在多个symbol，按styleField进行分类
                var styleFieldVal = attr[symbol.styleField];
                var styleOptField = symbol.styleFieldOptions[styleFieldVal];
                if (styleOptField != null) {
                    styleOpt = _jquery2.default.extend({}, styleOpt);
                    styleOpt = _jquery2.default.extend(styleOpt, styleOptField);
                }
            }
            styleOpt = styleOpt || {};

            if (styleOpt.image) {
                entityOptions.billboard = (0, _Attr2.style2Entity)(styleOpt);
                entityOptions.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            } else {
                entityOptions.point = (0, _Attr.style2Entity)(styleOpt);
            }

            //加上文字标签 
            if (styleOpt.label) {
                entityOptions.label = (0, _Attr3.style2Entity)(styleOpt.label);
                entityOptions.label.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                entityOptions.label.text = attributes.name;
            }
        } else {
            //无配置时的默认值
            entityOptions.point = {
                color: new Cesium.Color.fromCssColorString("#3388ff"),
                pixelSize: 10,
                outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 20000, 0.5)
            };
            entityOptions.label = {
                text: attributes.name,
                font: 'normal small-caps normal 16px 楷体',
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -15), //偏移量   
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //是地形上方的高度 
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 5000, 0.8),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000)
            };
        }

        var entity = this.dataSource.entities.add(entityOptions);
        return entity;
    }

});

exports.POILayer = POILayer;

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GltfLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _BaseLayer = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GltfLayer = _BaseLayer.BaseLayer.extend({
    model: null,
    //添加 
    add: function add() {
        if (this.model) {
            this.viewer.entities.add(this.model);
        } else {
            this.initData();
        }
    },
    //移除
    remove: function remove() {
        this.viewer.entities.remove(this.model);
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        if (this.model == null) return;

        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        } else {
            var cfg = this.config.position;
            this.viewer.mars.centerAt(cfg, { duration: duration, isWgs84: true });
        }
    },

    initData: function initData() {
        var cfg = this.config.position;
        cfg = this.viewer.mars.point2map(cfg); //转换坐标系

        var position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0);
        var heading = Cesium.Math.toRadians(cfg.heading || 0);
        var pitch = Cesium.Math.toRadians(cfg.pitch || 0);
        var roll = Cesium.Math.toRadians(cfg.roll || 0);
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        var modelopts = { uri: this.config.url };
        for (var key in this.config) {
            if (key == "url" || key == "name" || key == "position" || key == "center" || key == "tooltip" || key == "popup") continue;
            modelopts[key] = this.config[key];
        }

        this.model = this.viewer.entities.add({
            name: this.config.name,
            position: position,
            orientation: orientation,
            model: modelopts,
            _config: this.config,
            tooltip: this.config.tooltip,
            popup: this.config.popup
        });
    },
    //设置透明度
    hasOpacity: true,
    setOpacity: function setOpacity(value) {
        if (this.model == null) return;
        this.model.model.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(value);
    }

});

exports.GltfLayer = GltfLayer;

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tiles3dLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _BaseLayer = __webpack_require__(9);

var _util = __webpack_require__(4);

var _tileset = __webpack_require__(42);

var _point = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tiles3dLayer = _BaseLayer.BaseLayer.extend({
    model: null,
    originalCenter: null,
    boundingSphere: null,
    //添加 
    add: function add() {
        if (this.model) {
            this.viewer.scene.primitives.add(this.model);
        } else {
            this.initData();
        }
    },
    //移除
    remove: function remove() {
        this.viewer.scene.primitives.remove(this.model);
        this.model = null;
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        if (this.config.extent || this.config.center) {
            this.viewer.mars.centerAt(this.config.extent || this.config.center, { duration: duration, isWgs84: true });
        } else if (this.boundingSphere) {
            this.viewer.camera.flyToBoundingSphere(this.boundingSphere, {
                offset: new Cesium.HeadingPitchRange(0.0, -0.5, this.boundingSphere.radius * 2),
                duration: duration
            });
        }
    },

    initData: function initData() {
        //默认值
        this.config.maximumScreenSpaceError = this.config.maximumScreenSpaceError || 2; //默认16
        this.config.maximumMemoryUsage = this.config.maximumMemoryUsage || 2048; //提高内存到2GB,默认512MB

        this.model = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset((0, _util.getProxyUrl)(this.config)));
        this.model._config = this.config;

        for (var key in this.config) {
            if (key == "url" || key == "type" || key == "style" || key == "classificationType") continue;
            try {
                this.model[key] = this.config[key];
            } catch (e) {}
        }
        if (this.config.style) {
            //设置style
            this.model.style = new Cesium.Cesium3DTileStyle(this.config.style);
        }

        var that = this;
        this.model.readyPromise.then(function (tileset) {
            if (that.readyPromise) {
                that.readyPromise(tileset);
            }

            if (that.hasOpacity && that._opacity != 1) {
                //透明度
                that.setOpacity(that._opacity);
            }

            //记录模型原始的中心点
            var boundingSphere = tileset.boundingSphere;
            that.boundingSphere = boundingSphere;

            if (tileset._root && tileset._root.transform) {
                that.orginMatrixInverse = Cesium.Matrix4.inverse(Cesium.Matrix4.fromArray(tileset._root.transform), new Cesium.Matrix4());

                if (that.config.scale > 0 && that.config.scale != 1) {
                    tileset._root.transform = Cesium.Matrix4.multiplyByUniformScale(tileset._root.transform, that.config.scale, tileset._root.transform);
                }
            }

            var position = boundingSphere.center; //模型原始的中心点
            var catographic = Cesium.Cartographic.fromCartesian(position);

            var height = Number(catographic.height.toFixed(2));
            var longitude = Number(Cesium.Math.toDegrees(catographic.longitude).toFixed(6));
            var latitude = Number(Cesium.Math.toDegrees(catographic.latitude).toFixed(6));
            that.originalCenter = { x: longitude, y: latitude, z: height };
            console.log((that.config.name || "") + " 模型原始位置:" + JSON.stringify(that.originalCenter));

            //转换坐标系【如果是高德谷歌国测局坐标系时转换坐标进行加偏，其它的原样返回】
            var rawCenter = that.viewer.mars.point2map(that.originalCenter);
            if (rawCenter.x != that.originalCenter.x || rawCenter.y != that.originalCenter.y || that.config.offset != null) {

                that.config.offset = that.config.offset || {}; //配置信息中指定的坐标信息或高度信息
                if (that.config.offset.x && that.config.offset.y) {
                    that.config.offset = that.viewer.mars.point2map(that.config.offset); //转换坐标系【如果是高德谷歌国测局坐标系时转换坐标进行加偏，其它的原样返回】
                }
                var offsetopt = {
                    x: that.config.offset.x || rawCenter.x,
                    y: that.config.offset.y || rawCenter.y,
                    z: that.config.offset.z || 0,
                    heading: that.config.offset.heading,
                    axis: that.config.axis,
                    scale: that.config.scale
                };

                if (that.config.offset.z == "-height") {
                    offsetopt.z = -height + 5;
                    that.updateMatrix(offsetopt);
                } else if (that.config.offset.z == "auto") {
                    that.autoHeight(position, offsetopt);
                } else {
                    that.updateMatrix(offsetopt);
                }
            }

            if (!that.viewer.mars.isFlyAnimation() && that.config.flyTo) {
                that.centerAt(0);
            }

            if (that.config.calback) {
                that.config.calback(tileset);
            }
        });
    },

    autoHeight: function autoHeight(position, offsetopt) {
        var that = this;
        //求地面海拔
        (0, _util.terrainPolyline)({
            viewer: this.viewer,
            positions: [position, position],
            calback: function calback(raisedPositions, noHeight) {
                if (raisedPositions == null || raisedPositions.length == 0 || noHeight) return;

                var point = (0, _point.formatPositon)(raisedPositions[0]);
                var offsetZ = point.z - that.originalCenter.z + 1;
                offsetopt.z = offsetZ;

                that.updateMatrix(offsetopt);
            }
        });
    },
    //变换原点坐标
    updateMatrix: function updateMatrix(offsetopt) {
        if (this.model == null) return;

        console.log((this.config.name || "") + " 模型修改后位置:" + JSON.stringify(offsetopt));

        offsetopt.transform = offsetopt.heading != null; //标识何种方式纠正
        (0, _tileset.updateMatrix)(this.model, offsetopt);
    },

    hasOpacity: true,
    //设置透明度
    setOpacity: function setOpacity(value) {
        this._opacity = value;

        if (this.model) {
            this.model.style = new Cesium.Cesium3DTileStyle({
                color: "color() *vec4(1,1,1," + value + ")"
            });
        }
    },
    showClickFeature: function showClickFeature(value) {
        if (this.model) {
            this.model._config.showClickFeature = value;
        } else {
            this.config.showClickFeature = value;
        }
    }

});

exports.Tiles3dLayer = Tiles3dLayer;

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.KmlLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _GeoJsonLayer = __webpack_require__(28);

var _util = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var KmlLayer = _GeoJsonLayer.GeoJsonLayer.extend({
    queryData: function queryData() {
        var that = this;

        var config = (0, _util.getProxyUrl)(this.config);

        var dataSource = Cesium.KmlDataSource.load(config.url, {
            camera: this.viewer.scene.camera,
            canvas: this.viewer.scene.canvas,
            clampToGround: config.clampToGround
        });
        dataSource.then(function (dataSource) {
            that.showResult(dataSource);
        }).otherwise(function (error) {
            that.showError("服务出错", error);
        });
    },
    getEntityAttr: function getEntityAttr(entity) {
        var attr = { name: entity._name };
        var extendedData = entity._kml.extendedData;
        for (var key in extendedData) {
            attr[key] = extendedData[key].value;
        }

        return attr;
    }

});

exports.KmlLayer = KmlLayer;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CzmlLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _GeoJsonLayer = __webpack_require__(28);

var _util = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CzmlLayer = _GeoJsonLayer.GeoJsonLayer.extend({
    queryData: function queryData() {
        var that = this;

        var config = (0, _util.getProxyUrl)(this.config);

        var dataSource = Cesium.CzmlDataSource.load(config.url, config);
        dataSource.then(function (dataSource) {
            that.showResult(dataSource);
        }).otherwise(function (error) {
            that.showError("服务出错", error);
        });
    },
    getEntityAttr: function getEntityAttr(entity) {
        if (entity.description && entity.description.getValue) return entity.description.getValue(this.viewer.clock.currentTime);
    }

});

exports.CzmlLayer = CzmlLayer;

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TerrainLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _BaseLayer = __webpack_require__(9);

var _util = __webpack_require__(4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TerrainLayer = _BaseLayer.BaseLayer.extend({
    terrain: null,
    //添加 
    add: function add() {
        if (!this.terrain) {
            this.terrain = (0, _util.getTerrainProvider)(this.config);
        }
        this.viewer.terrainProvider = this.terrain;
    },
    //移除
    remove: function remove() {
        this.viewer.terrainProvider = (0, _util.getEllipsoidTerrain)();
    }

});
exports.TerrainLayer = TerrainLayer;

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DrawLayer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

var _BaseLayer = __webpack_require__(9);

var _Draw = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DrawLayer = _BaseLayer.BaseLayer.extend({
    create: function create() {
        this.drawControl = new _Draw.Draw(this.viewer, {
            hasEdit: false,
            nameTooltip: false,
            removeScreenSpaceEvent: false
        });
    },
    //添加 
    add: function add() {
        if (this._isload) this.drawControl.setVisible(true);else this._loadData();
    },
    //移除
    remove: function remove() {
        this.drawControl.setVisible(false);
    },
    //定位至数据区域
    centerAt: function centerAt(duration) {
        var arr = this.drawControl.getEntitys();
        this.viewer.flyTo(arr, { duration: duration });
    },
    hasOpacity: false,
    //设置透明度
    setOpacity: function setOpacity(value) {},
    _loadData: function _loadData() {
        var that = this;
        _jquery2.default.ajax({
            type: "get",
            dataType: "json",
            url: this.config.url,
            timeout: 10000,
            success: function success(data) {
                that._isload = true;
                var arr = that.drawControl.jsonToEntity(data, true, that.config.flyTo);
                that._bindEntityConfig(arr);
            },
            error: function error(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Json文件" + that.config.url + "加载失败！");
            }
        });
    },
    _bindEntityConfig: function _bindEntityConfig(arrEntity) {
        var that = this;

        for (var i = 0, len = arrEntity.length; i < len; i++) {
            var entity = arrEntity[i];

            //popup弹窗
            if (this.config.columns || this.config.popup) {
                entity.popup = {
                    html: function html(entity) {
                        var attr = entity.attribute.attr;
                        attr.draw_type = entity.attribute.type;
                        attr.draw_typename = entity.attribute.name;
                        return that.viewer.mars.popup.getPopupForConfig(that.config, attr);
                    },
                    anchor: this.config.popupAnchor || [0, -15]
                };
            }
            if (this.config.tooltip) {
                entity.tooltip = {
                    html: function html(entity) {
                        var attr = entity.attribute.attr;
                        attr.draw_type = entity.attribute.type;
                        attr.draw_typename = entity.attribute.name;
                        return that.viewer.mars.popup.getPopupForConfig({ popup: that.config.tooltip }, attr);
                    },
                    anchor: this.config.tooltipAnchor || [0, -15]
                };
            }
            if (this.config.click) {
                entity.click = this.config.click;
            }
            if (this.config.mouseover) {
                entity.mouseover = this.config.mouseover;
            }
            if (this.config.mouseout) {
                entity.mouseout = this.config.mouseout;
            }
        }
    }

});
exports.DrawLayer = DrawLayer;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
//百度地图

var height = 33746824;
var width = 33554054;

function BaiduImageryProvider(option) {
    var url;
    switch (option.layer) {
        case "vec":
        default:
            url = 'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=' + (option.bigfont ? 'ph' : 'pl') + '&scaler=1&p=1';
            break;
        case "img_d":
            url = 'http://shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46';
            break;
        case "img_z":
            url = 'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=' + (option.bigfont ? 'sh' : 'sl') + '&v=020';
            break;

        case "custom":
            //Custom 各种自定义样式
            //可选值：dark,midnight,grayscale,hardedge,light,redalert,googlelite,grassgreen,pink,darkgreen,bluish
            option.customid = option.customid || 'midnight';
            url = 'http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=' + option.customid;
            break;

        case "time":
            //实时路况
            var time = new Date().getTime();
            url = 'http://its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time=' + time + '&label=web2D&v=017';
            break;
    }
    this._url = url;

    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 18;

    var rectangleSouthwestInMeters = new Cesium.Cartesian2(-width, -height);
    var rectangleNortheastInMeters = new Cesium.Cartesian2(width, height);
    this._tilingScheme = new Cesium.WebMercatorTilingScheme({ rectangleSouthwestInMeters: rectangleSouthwestInMeters, rectangleNortheastInMeters: rectangleNortheastInMeters });

    this._credit = undefined;
    this._rectangle = this._tilingScheme.rectangle;
    this._ready = true;
}
Cesium.defineProperties(BaiduImageryProvider.prototype, {
    url: {
        get: function get() {
            return this._url;
        }
    },

    token: {
        get: function get() {
            return this._token;
        }
    },

    proxy: {
        get: function get() {
            return this._proxy;
        }
    },

    tileWidth: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileWidth;
        }
    },

    tileHeight: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileHeight;
        }
    },

    maximumLevel: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._maximumLevel;
        }
    },

    minimumLevel: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return 0;
        }
    },

    tilingScheme: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tilingScheme;
        }
    },

    rectangle: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('rectangle must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._rectangle;
        }
    },

    tileDiscardPolicy: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileDiscardPolicy;
        }
    },

    errorEvent: {
        get: function get() {
            return this._errorEvent;
        }
    },

    ready: {
        get: function get() {
            return this._ready;
        }
    },

    readyPromise: {
        get: function get() {
            return this._readyPromise.promise;
        }
    },

    credit: {
        get: function get() {
            return this._credit;
        }
    },

    usingPrecachedTiles: {
        get: function get() {
            return this._useTiles;
        }
    },

    hasAlphaChannel: {
        get: function get() {
            return true;
        }
    },

    layers: {
        get: function get() {
            return this._layers;
        }
    }
});

BaiduImageryProvider.prototype.getTileCredits = function (x, y, level) {
    return undefined;
};

BaiduImageryProvider.prototype.requestImage = function (x, y, level) {
    if (!this._ready) {
        throw new DeveloperError('requestImage must not be called before the imagery provider is ready.');
    }

    var tileW = this._tilingScheme.getNumberOfXTilesAtLevel(level);
    var tileH = this._tilingScheme.getNumberOfYTilesAtLevel(level);

    var url = this._url.replace('{x}', x - tileW / 2).replace('{y}', tileH / 2 - y - 1).replace('{z}', level).replace('{s}', Math.floor(Math.random() * 10));

    return Cesium.ImageryProvider.loadImage(this, url);
};

exports.BaiduImageryProvider = BaiduImageryProvider;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FeatureGridImageryProvider = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function FeatureGridImageryProvider(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
    this.options = options;

    this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
    this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
    this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 0);
    this._maximumLevel = options.maximumLevel;

    if (options.rectangle && options.rectangle.xmin && options.rectangle.xmax && options.rectangle.ymin && options.rectangle.ymax) {
        var xmin = options.rectangle.xmin;
        var xmax = options.rectangle.xmax;
        var ymin = options.rectangle.ymin;
        var ymax = options.rectangle.ymax;
        options.rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
    }
    this._tilingScheme = Cesium.defaultValue(options.tilingScheme, new Cesium.GeographicTilingScheme({ ellipsoid: options.ellipsoid }));
    this._rectangle = Cesium.defaultValue(options.rectangle, this._tilingScheme.rectangle);
    this._rectangle = Cesium.Rectangle.intersection(this._rectangle, this._tilingScheme.rectangle);
    this._hasAlphaChannel = Cesium.defaultValue(options.hasAlphaChannel, true);

    this._errorEvent = new Cesium.Event();
    this._readyPromise = Cesium.when.resolve(true);
    this._credit = undefined;
    this._ready = true;
}

Cesium.defineProperties(FeatureGridImageryProvider.prototype, {
    url: {
        get: function get() {
            return this._url;
        }
    },

    token: {
        get: function get() {
            return this._token;
        }
    },

    proxy: {
        get: function get() {
            return this._proxy;
        }
    },

    tileWidth: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileWidth must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileWidth;
        }
    },

    tileHeight: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileHeight must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileHeight;
        }
    },

    maximumLevel: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._maximumLevel;
        }
    },

    minimumLevel: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug'); 
            return 0;
        }
    },

    tilingScheme: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tilingScheme;
        }
    },

    rectangle: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('rectangle must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._rectangle;
        }
    },

    tileDiscardPolicy: {
        get: function get() {
            //>>includeStart('debug', pragmas.debug);
            if (!this._ready) {
                throw new DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
            }
            //>>includeEnd('debug');

            return this._tileDiscardPolicy;
        }
    },

    errorEvent: {
        get: function get() {
            return this._errorEvent;
        }
    },

    ready: {
        get: function get() {
            return this._ready;
        }
    },

    readyPromise: {
        get: function get() {
            return this._readyPromise.promise;
        }
    },

    credit: {
        get: function get() {
            return this._credit;
        }
    },

    usingPrecachedTiles: {
        get: function get() {
            return this._useTiles;
        }
    },

    hasAlphaChannel: {
        get: function get() {
            return true;
        }
    },

    layers: {
        get: function get() {
            return this._layers;
        }
    }
});

FeatureGridImageryProvider.prototype.getTileCredits = function (x, y, level) {
    return undefined;
};

//显示瓦片信息
FeatureGridImageryProvider.prototype.requestImage = function (x, y, level) {
    var canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;

    if (level < this._minimumLevel) return canvas;

    if (this.options.debuggerTileInfo) {
        var context = canvas.getContext('2d');

        context.strokeStyle = '#ffff00';
        context.lineWidth = 2;
        context.strokeRect(1, 1, 255, 255);

        var label = 'L' + level + 'X' + x + 'Y' + y;
        context.font = 'bold 25px Arial';
        context.textAlign = 'center';
        context.fillStyle = 'black';
        context.fillText(label, 127, 127);
        context.fillStyle = '#ffff00';
        context.fillText(label, 124, 124);
    }
    return canvas;
};

FeatureGridImageryProvider.prototype._getGridKey = function (opts) {
    return opts.level + "_x" + opts.x + "_y" + opts.y;
};

FeatureGridImageryProvider.prototype.addImageryCache = function (opts) {
    if (opts.level < this._minimumLevel || opts.level < opts.maxLevel - 1) return;

    //console.log('新增' + JSON.stringify(opts));
    if (this.options.addImageryCache) {
        opts.key = this._getGridKey(opts);
        this.options.addImageryCache(opts);
    }
};

FeatureGridImageryProvider.prototype.removeImageryCache = function (opts) {
    if (opts.maxLevel < this._minimumLevel && this.options.removeAllImageryCache) {
        this.options.removeAllImageryCache();
    }
    if (opts.level < this._minimumLevel) return;

    //console.log('删除' + JSON.stringify(opts));
    if (this.options.removeImageryCache) {
        opts.key = this._getGridKey(opts);
        this.options.removeImageryCache(opts);
    }
};

exports.FeatureGridImageryProvider = FeatureGridImageryProvider;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.addLog = addLog;
//打印版权提示
function addLog() {
    try {
        eval(function (p, a, c, k, e, r) {
            e = function e(c) {
                return c.toString(a);
            };if (!''.replace(/^/, String)) {
                while (c--) {
                    r[e(c)] = k[c] || e(c);
                }k = [function (e) {
                    return r[e];
                }];e = function e() {
                    return '\\w+';
                };c = 1;
            };while (c--) {
                if (k[c]) p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
            }return p;
        }('1(g(){2.3("\\4\\5\\6\\7\\8\\9\\a\\b d e\\f\\0\\h\\i %c \\j\\k\\l\\m\\n://o.p.q","r:s")},t);', 30, 30, 'u67b6|setTimeout|console|log|u5f53|u524d|u4e09|u7ef4|u5730|u56fe|u4f7f|u7528MarsGIS||for|Cesium|u6846|function|u5b9e|u73b0|u5b98|u65b9|u7f51|u7ad9|uff1ahttp|cesium|marsgis|cn|color|red|6E4'.split('|'), 0, {}));
    } catch (e) {}
}

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GaodePOIGeocoder = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _pointconvert = __webpack_require__(19);

var pointconvert = _interopRequireWildcard(_pointconvert);

var _util = __webpack_require__(4);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//高德POI查询 类
var GaodePOIGeocoder = exports.GaodePOIGeocoder = function () {
    //========== 构造方法 ========== 
    function GaodePOIGeocoder(options) {
        _classCallCheck(this, GaodePOIGeocoder);

        options = options || {};
        this.citycode = options.citycode || '';
        //内置高德地图服务key，建议后期修改为自己申请的
        this.gaodekey = options.key || ["f2fedb9b08ae13d22f1692cd472d345e", "81825d9f2bafbb14f235d2779be90c0f", "b185732970a4487de104fa71ef575f29", "2e6ca4aeb6867fb637a5bee8333e5d3a", "027187040fa924e56048468aaa77b62c"];
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 

    _createClass(GaodePOIGeocoder, [{
        key: 'getOneKey',
        value: function getOneKey() {
            var arr = this.gaodekey;
            var n = Math.floor(Math.random() * arr.length + 1) - 1;
            return arr[n];
        }
    }, {
        key: 'geocode',
        value: function geocode(query, geocodeType) {
            var that = this;

            var key = this.getOneKey();

            var resource = new Cesium.Resource({
                url: 'http://restapi.amap.com/v3/place/text',
                queryParameters: {
                    key: key,
                    city: this.citycode,
                    //citylimit: true,
                    keywords: query
                }
            });

            return resource.fetchJson().then(function (results) {
                if (results.status == 0) {
                    (0, _util.msg)("请求失败(" + results.infocode + ")：" + results.info);
                    return;
                }
                if (results.pois.length === 0) {
                    (0, _util.msg)("未查询到“" + query + "”相关数据！");
                    return;
                }

                var height = 3000;
                if (that.viewer.camera.positionCartographic.height < height) height = that.viewer.camera.positionCartographic.height;

                return results.pois.map(function (resultObject) {
                    var arrjwd = resultObject.location.split(",");
                    arrjwd = pointconvert.gcj2wgs(arrjwd); //纠偏
                    var lnglat = that.viewer.mars.point2map({ x: arrjwd[0], y: arrjwd[1] });

                    return {
                        displayName: resultObject.name,
                        destination: Cesium.Cartesian3.fromDegrees(lnglat.x, lnglat.y, height)
                    };
                });
            });
        }
    }]);

    return GaodePOIGeocoder;
}();

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
     value: true
});
exports.testTk = testTk;
//在线公开演示版本的 授权限制


//校验授权
function testTk() {
     return true;
}

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getHeadingPitchRollByOrientation = getHeadingPitchRollByOrientation;
exports.getHeadingPitchRollByMatrix = getHeadingPitchRollByMatrix;
exports.getHeadingPitchRollForLine = getHeadingPitchRollForLine;
exports.getRotateCenterPoint = getRotateCenterPoint;
exports.getPositionTranslation = getPositionTranslation;
exports.getOffsetLine = getOffsetLine;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matrix3Scratch = new Cesium.Matrix3(); //一些涉及矩阵计算的方法

var matrix4Scratch = new Cesium.Matrix4();

// 根据模型的orientation求方位角
function getHeadingPitchRollByOrientation(position, orientation) {
    var matrix = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch), position, matrix4Scratch);
    var hpr = getHeadingPitchRollByMatrix(position, matrix);
    return hpr;
}

// 根据模型的matrix矩阵求方位角
//Cesium.Transforms.fixedFrameToHeadingPitchRoll 
function getHeadingPitchRollByMatrix(position, matrix) {
    // 计算当前模型中心处的变换矩阵
    var m1 = Cesium.Transforms.eastNorthUpToFixedFrame(position, Cesium.Ellipsoid.WGS84, new Cesium.Matrix4());
    // 矩阵相除
    var m3 = Cesium.Matrix4.multiply(Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()), matrix, new Cesium.Matrix4());
    // 得到旋转矩阵
    var mat3 = Cesium.Matrix4.getRotation(m3, new Cesium.Matrix3());
    // 计算四元数
    var q = Cesium.Quaternion.fromRotationMatrix(mat3);
    // 计算旋转角(弧度)
    var hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);

    // 得到角度
    //var heading = Cesium.Math.toDegrees(hpr.heading);
    //var pitch = Cesium.Math.toDegrees(hpr.pitch);
    //var roll = Cesium.Math.toDegrees(hpr.roll);
    //console.log('heading : ' + heading, 'pitch : ' + pitch, 'roll : ' + roll);

    return hpr;
}

var cartesian3 = new Cesium.Cartesian3();
var matrix4Scratch = new Cesium.Matrix4();
var rotationScratch = new Cesium.Matrix3();

//求localStart点到localEnd点的方向
function getHeadingPitchRollForLine(localStart, localEnd, ellipsoid) {
    ellipsoid = ellipsoid || Cesium.Ellipsoid.WGS84;

    var velocity = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(localEnd, localStart, cartesian3), cartesian3);
    Cesium.Transforms.rotationMatrixFromPositionVelocity(localStart, velocity, ellipsoid, rotationScratch);
    var modelMatrix = Cesium.Matrix4.fromRotationTranslation(rotationScratch, localStart, matrix4Scratch);

    Cesium.Matrix4.multiplyTransformation(modelMatrix, Cesium.Axis.Z_UP_TO_X_UP, modelMatrix);

    var hpr = getHeadingPitchRollByMatrix(localStart, modelMatrix);
    return hpr;
}

//获取点point1绕点center的地面法向量旋转顺时针angle角度后新坐标
function getRotateCenterPoint(center, point1, angle) {
    // 计算center的地面法向量
    var chicB = Cesium.Cartographic.fromCartesian(center);
    chicB.height = 0;
    var dB = Cesium.Cartographic.toCartesian(chicB);
    var normaB = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(dB, center, new Cesium.Cartesian3()), new Cesium.Cartesian3());

    // 构造基于center的法向量旋转90度的矩阵
    var Q = Cesium.Quaternion.fromAxisAngle(normaB, Cesium.Math.toRadians(angle));
    var m3 = Cesium.Matrix3.fromQuaternion(Q);
    var m4 = Cesium.Matrix4.fromRotationTranslation(m3);

    // 计算point1点相对center点的坐标A1
    var A1 = Cesium.Cartesian3.subtract(point1, center, new Cesium.Cartesian3());

    //对A1应用旋转矩阵
    var p = Cesium.Matrix4.multiplyByPoint(m4, A1, new Cesium.Cartesian3());
    // 新点的坐标
    var pointNew = Cesium.Cartesian3.add(p, center, new Cesium.Cartesian3());

    return pointNew;
}

//获取点的offest平移矩阵后点
function getPositionTranslation(position, offest, degree, type) {
    degree = degree || 0;
    type = type || "z";

    var rotate = Cesium.Math.toRadians(-degree); //转成弧度
    type = "UNIT_" + type.toUpperCase();
    var quaternion = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3[type], rotate); //quaternion为围绕这个z轴旋转d度的四元数
    var rotateMatrix3 = Cesium.Matrix3.fromQuaternion(quaternion); //rotateMatrix3为根据四元数求得的旋转矩阵
    var pointCartesian3 = new Cesium.Cartesian3(offest.x, offest.y, offest.z); //point的局部坐标
    var rotateTranslationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotateMatrix3, Cesium.Cartesian3.ZERO); //rotateTranslationMatrix4为旋转加平移的4x4变换矩阵，这里平移为(0,0,0)，故填个Cesium.Cartesian3.ZERO
    Cesium.Matrix4.multiplyByTranslation(rotateTranslationMatrix4, pointCartesian3, rotateTranslationMatrix4); //rotateTranslationMatrix4 = rotateTranslationMatrix4  X  pointCartesian3
    var originPositionCartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(Cesium.Cartographic.fromCartesian(position)); //得到局部坐标原点的全局坐标
    var originPositionTransform = Cesium.Transforms.eastNorthUpToFixedFrame(originPositionCartesian3); //m1为局部坐标的z轴垂直于地表，局部坐标的y轴指向正北的4x4变换矩阵
    Cesium.Matrix4.multiplyTransformation(originPositionTransform, rotateTranslationMatrix4, rotateTranslationMatrix4); //rotateTranslationMatrix4 = rotateTranslationMatrix4 X originPositionTransform
    var pointCartesian = new Cesium.Cartesian3();
    Cesium.Matrix4.getTranslation(rotateTranslationMatrix4, pointCartesian); //根据最终变换矩阵m得到p2
    return pointCartesian;
}

//计算平行线，offset正负决定方向（单位米）
function getOffsetLine(positions, offset) {
    var arrNew = [];
    for (var i = 1; i < positions.length; i++) {
        var point1 = positions[i - 1];
        var point2 = positions[i];

        var dir12 = Cesium.Cartesian3.subtract(point1, point2, new Cesium.Cartesian3());
        var dir21left = Cesium.Cartesian3.cross(point1, dir12, new Cesium.Cartesian3());

        var p1offset = computedOffsetData(point1, dir21left, offset * 1000);
        var p2offset = computedOffsetData(point2, dir21left, offset * 1000);

        if (i == 1) {
            arrNew.push(p1offset);
        }
        arrNew.push(p2offset);
    }
    return arrNew;
}

function computedOffsetData(ori, dir, wid) {
    var currRay = new Cesium.Ray(ori, dir);
    return Cesium.Ray.getPoint(currRay, wid, new Cesium.Cartesian3());
}

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FlowEcharts = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //参考了开源：https://github.com/sharpzao/EchartsCesium
//当前版本由火星科技开发 http://marsgis.cn 


var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var backAngle = Cesium.Math.toRadians(80);

// 类

var CompositeCoordinateSystem = function () {
    //========== 构造方法 ========== 
    function CompositeCoordinateSystem(GLMap, api) {
        _classCallCheck(this, CompositeCoordinateSystem);

        this._GLMap = GLMap;
        this.dimensions = ['lng', 'lat'];
        this._mapOffset = [0, 0];

        this._api = api;
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 


    _createClass(CompositeCoordinateSystem, [{
        key: 'setMapOffset',
        value: function setMapOffset(mapOffset) {
            this._mapOffset = mapOffset;
        }
    }, {
        key: 'getBMap',
        value: function getBMap() {
            return this._GLMap;
        }
    }, {
        key: 'dataToPoint',
        value: function dataToPoint(data) {
            var defVal = [99999, 99999];

            var position = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
            if (!position) {
                return defVal;
            }
            var px = this._GLMap.cartesianToCanvasCoordinates(position);
            if (!px) {
                return defVal;
            }

            //判断是否在球的背面
            var scene = this._GLMap;
            //if (scene.camera.positionCartographic.height > 10000) {//全球视野时才考虑判断
            //    var cartesianNew;
            //    if (scene.mode === Cesium.SceneMode.SCENE3D) {   //三维模式下
            //        var pickRay = scene.camera.getPickRay(px);
            //        cartesianNew = scene.globe.pick(pickRay, scene);
            //    }
            //    else { //二维模式下
            //        cartesianNew = scene.camera.pickEllipsoid(px, scene.globe.ellipsoid);
            //    }
            //    if (cartesianNew) {
            //        var carto = scene.globe.ellipsoid.cartesianToCartographic(cartesianNew);
            //        var _camera_x = Cesium.Math.toDegrees(carto.longitude);
            //        var _camera_y = Cesium.Math.toDegrees(carto.latitude);
            //        if (Math.abs(_camera_x - data[0]) > 1 || Math.abs(_camera_y - data[1]) > 1)
            //            return [NaN, NaN];
            //    }
            //}
            if (scene.mode === Cesium.SceneMode.SCENE3D) {
                var angle = Cesium.Cartesian3.angleBetween(scene.camera.position, position);
                if (angle > backAngle) return false;
            }
            //判断是否在球的背面


            return [px.x - this._mapOffset[0], px.y - this._mapOffset[1]];
        }
    }, {
        key: 'pointToData',
        value: function pointToData(pt) {
            var mapOffset = this._mapOffset;
            var pt = this._bmap.project([pt[0] + mapOffset[0], pt[1] + mapOffset[1]]);
            return [pt.lng, pt.lat];
        }
    }, {
        key: 'getViewRect',
        value: function getViewRect() {
            var api = this._api;
            return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
        }
    }, {
        key: 'getRoamTransform',
        value: function getRoamTransform() {
            return echarts.matrix.create();
        }
    }]);

    return CompositeCoordinateSystem;
}();

//用于确定创建列表数据时要使用的维度


CompositeCoordinateSystem.dimensions = ['lng', 'lat'];
CompositeCoordinateSystem.create = function (ecModel, api) {
    var coordSys;

    ecModel.eachComponent('GLMap', function (GLMapModel) {
        var painter = api.getZr().painter;
        if (!painter) return;

        var viewportRoot = painter.getViewportRoot();
        var GLMap = echarts.glMap;
        coordSys = new CompositeCoordinateSystem(GLMap, api);
        coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
        GLMapModel.coordinateSystem = coordSys;
    });

    ecModel.eachSeries(function (seriesModel) {
        if (seriesModel.get('coordinateSystem') === 'GLMap') {
            seriesModel.coordinateSystem = coordSys;
        }
    });
};

/////////扩展echarts///////////
if (window.echarts) {
    echarts.registerCoordinateSystem('GLMap', CompositeCoordinateSystem);
    echarts.registerAction({
        type: 'GLMapRoam',
        event: 'GLMapRoam',
        update: 'updateLayout'
    }, function (payload, ecModel) {});

    echarts.extendComponentModel({
        type: 'GLMap',
        getBMap: function getBMap() {
            // __bmap is injected when creating BMapCoordSys
            return this.__GLMap;
        },
        defaultOption: {
            roam: false
        }
    });

    echarts.extendComponentView({
        type: 'GLMap',
        init: function init(ecModel, api) {
            this.api = api;
            echarts.glMap.postRender.addEventListener(this.moveHandler, this);
        },
        moveHandler: function moveHandler(type, target) {
            this.api.dispatchAction({
                type: 'GLMapRoam'
            });
        },
        render: function render(GLMapModel, ecModel, api) {},
        dispose: function dispose(target) {
            echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
        }
    });
}

////////////FlowEcharts/////////////// 

// 类

var FlowEcharts = exports.FlowEcharts = function () {
    //========== 构造方法 ========== 
    function FlowEcharts(_mapContainer, option) {
        _classCallCheck(this, FlowEcharts);

        this._mapContainer = _mapContainer;

        this._overlay = this._createChartOverlay();
        this._overlay.setOption(option);
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 


    _createClass(FlowEcharts, [{
        key: '_createChartOverlay',
        value: function _createChartOverlay() {
            var scene = this._mapContainer.scene;
            scene.canvas.setAttribute('tabIndex', 0);

            var chartContainer = document.createElement('div');
            chartContainer.style.position = 'absolute';
            chartContainer.style.top = '0px';
            chartContainer.style.left = '0px';
            chartContainer.style.width = scene.canvas.width + 'px';
            chartContainer.style.height = scene.canvas.height + 'px';
            chartContainer.style.pointerEvents = 'none';
            chartContainer.setAttribute('id', 'echarts');
            chartContainer.setAttribute('class', 'echartMap');
            this._mapContainer.container.appendChild(chartContainer);
            this._echartsContainer = chartContainer;

            echarts.glMap = scene;
            return echarts.init(chartContainer);
        }
    }, {
        key: 'dispose',
        value: function dispose() {
            if (this._echartsContainer) {
                this._mapContainer.container.removeChild(this._echartsContainer);
                this._echartsContainer = null;
            }
            if (this._overlay) {
                this._overlay.dispose();
                this._overlay = null;
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            //兼容不同名称
            this.dispose();
        }
    }, {
        key: 'updateOverlay',
        value: function updateOverlay(option) {
            if (this._overlay) {
                this._overlay.setOption(option);
            }
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this._mapContainer;
        }
    }, {
        key: 'getOverlay',
        value: function getOverlay() {
            return this._overlay;
        }
    }, {
        key: 'show',
        value: function show() {
            var container = document.getElementById(this._id);
            container.style.visibility = "visible";
        }
    }, {
        key: 'hide',
        value: function hide() {
            var container = document.getElementById(this._id);
            container.style.visibility = "hidden";
        }
    }]);

    return FlowEcharts;
}();

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MapVLayer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //mapv+cesium融合，by http://marsgis.cn 


var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _MapVRenderer = __webpack_require__(94);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var divId = 0;

/**
 * @class mapVLayer
 * @classdesc MapV 图层。
 * @category Visualization MapV 
 * @param {mapv.DataSet} dataSet - MapV 图层数据集。
 * @param {Object} mapVOptions - MapV 图层参数。
 * @param {Object} options - 参数。
 * @param {string} [options.attributionPrefix] - 版权信息前缀。
 * @param {string} [options.attribution='© 2018 百度 MapV'] - 版权信息。
 * @fires mapVLayer#loaded
 */

var MapVLayer = exports.MapVLayer = function () {
	//========== 构造方法 ========== 
	function MapVLayer(t, e, i, n) {
		_classCallCheck(this, MapVLayer);

		this.map = t, this.scene = t.scene, this.mapvBaseLayer = new _MapVRenderer.MapVRenderer(t, e, i, this), this.mapVOptions = i, this.initDevicePixelRatio(), this.canvas = this._createCanvas(), this.render = this.render.bind(this), void 0 != n ? (this.container = n, n.appendChild(this.canvas)) : (this.container = t.container, this.addInnerContainer()), this.bindEvent(), this._reset();
	}
	//========== 方法 ========== 


	_createClass(MapVLayer, [{
		key: "initDevicePixelRatio",
		value: function initDevicePixelRatio() {
			this.devicePixelRatio = window.devicePixelRatio || 1;
		}
	}, {
		key: "addInnerContainer",
		value: function addInnerContainer() {
			this.container.appendChild(this.canvas);
		}
	}, {
		key: "bindEvent",
		value: function bindEvent() {
			var _this = this;

			//绑定cesium事件与mapv联动
			this.innerMoveStart = this.moveStartEvent.bind(this), this.innerMoveEnd = this.moveEndEvent.bind(this);

			this.scene.camera.moveStart.addEventListener(this.innerMoveStart, this);
			this.scene.camera.moveEnd.addEventListener(this.innerMoveEnd, this);

			//解决cesium有时 moveStart 后没有触发 moveEnd
			var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
			handler.setInputAction(function (event) {
				_this.innerMoveEnd();
			}, Cesium.ScreenSpaceEventType.LEFT_UP);
			handler.setInputAction(function (event) {
				_this.innerMoveEnd();
			}, Cesium.ScreenSpaceEventType.MIDDLE_UP);

			this.handler = handler;
		}
	}, {
		key: "unbindEvent",
		value: function unbindEvent() {
			this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
			this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);
			this.scene.postRender.removeEventListener(this._reset, this);

			if (this.handler) {
				this.handler.destroy();
				this.handler = null;
			}
		}
	}, {
		key: "moveStartEvent",
		value: function moveStartEvent() {
			this.mapvBaseLayer && this.mapvBaseLayer.animatorMovestartEvent();
			//this._unvisiable()

			this.scene.postRender.addEventListener(this._reset, this);

			console.log('mapv moveStartEvent');
		}
	}, {
		key: "moveEndEvent",
		value: function moveEndEvent() {
			this.scene.postRender.removeEventListener(this._reset, this);

			this.mapvBaseLayer && this.mapvBaseLayer.animatorMoveendEvent();
			this._reset();
			//this._visiable() 
			console.log('mapv moveEndEvent');
		}
	}, {
		key: "zoomStartEvent",
		value: function zoomStartEvent() {
			this._unvisiable();
		}
	}, {
		key: "zoomEndEvent",
		value: function zoomEndEvent() {
			this._unvisiable();
		}
	}, {
		key: "addData",
		value: function addData(t, e) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.addData(t, e);
		}
	}, {
		key: "updateData",
		value: function updateData(t, e) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.updateData(t, e);
		}
	}, {
		key: "getData",
		value: function getData() {
			return this.mapvBaseLayer && (this.dataSet = this.mapvBaseLayer.getData()), this.dataSet;
		}
	}, {
		key: "removeData",
		value: function removeData(t) {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer && this.mapvBaseLayer.removeData(t);
		}
	}, {
		key: "removeAllData",
		value: function removeAllData() {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer.clearData();
		}
	}, {
		key: "_visiable",
		value: function _visiable() {
			return this.canvas.style.display = "block";
		}
	}, {
		key: "_unvisiable",
		value: function _unvisiable() {
			return this.canvas.style.display = "none";
		}
	}, {
		key: "_createCanvas",
		value: function _createCanvas() {
			var t = document.createElement("canvas");
			t.id = this.mapVOptions.layerid || "mapv" + divId++, t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.style.pointerEvents = "none", t.style.zIndex = this.mapVOptions.zIndex || 100, t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;
			var e = this.devicePixelRatio;
			return "2d" == this.mapVOptions.context && t.getContext(this.mapVOptions.context).scale(e, e), t;
		}
	}, {
		key: "_reset",
		value: function _reset() {
			this.resizeCanvas(), this.fixPosition(), this.onResize(), this.render();
		}
	}, {
		key: "draw",
		value: function draw() {
			this._reset();
		}
	}, {
		key: "show",
		value: function show() {
			this._visiable();
		}
	}, {
		key: "hide",
		value: function hide() {
			this._unvisiable();
		}
	}, {
		key: "destroy",
		value: function destroy() {
			//释放	
			this.unbindEvent();
			this.remove();
		}
	}, {
		key: "remove",
		value: function remove() {
			void 0 != this.mapvBaseLayer && (this.removeAllData(), this.mapvBaseLayer.destroy(), this.mapvBaseLayer = void 0, this.canvas.parentElement.removeChild(this.canvas));
		}
	}, {
		key: "update",
		value: function update(t) {
			void 0 != t && this.updateData(t.data, t.options);
		}
	}, {
		key: "resizeCanvas",
		value: function resizeCanvas() {
			if (void 0 != this.canvas && null != this.canvas) {
				var t = this.canvas;
				t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;
			}
		}
	}, {
		key: "fixPosition",
		value: function fixPosition() {}
	}, {
		key: "onResize",
		value: function onResize() {}
	}, {
		key: "render",
		value: function render() {
			void 0 != this.mapvBaseLayer && this.mapvBaseLayer._canvasUpdate();
		}
	}]);

	return MapVLayer;
}();

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.MapVRenderer = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } //mapv+cesium融合，by http://marsgis.cn 


var mapv = __webpack_require__(95);

var baiduMapLayer = mapv ? mapv.baiduMapLayer : null;
var BaseLayer = baiduMapLayer ? baiduMapLayer.__proto__ : Function;

var backAngle = Cesium.Math.toRadians(80);

var MapVRenderer = exports.MapVRenderer = function (_BaseLayer) {
	_inherits(MapVRenderer, _BaseLayer);

	//========== 构造方法 ========== 
	function MapVRenderer(t, e, i, n) {
		_classCallCheck(this, MapVRenderer);

		var _this = _possibleConstructorReturn(this, (MapVRenderer.__proto__ || Object.getPrototypeOf(MapVRenderer)).call(this, t, e, i));

		if (!BaseLayer) {
			return _possibleConstructorReturn(_this);
		}

		_this.map = t, _this.scene = t.scene, _this.dataSet = e;
		i = i || {}, _this.init(i), _this.argCheck(i), _this.initDevicePixelRatio(), _this.canvasLayer = n, _this.stopAniamation = !1, _this.animation = i.animation, _this.clickEvent = _this.clickEvent.bind(_this), _this.mousemoveEvent = _this.mousemoveEvent.bind(_this), _this.bindEvent();

		return _this;
	}
	//========== 方法 ========== 


	_createClass(MapVRenderer, [{
		key: "initDevicePixelRatio",
		value: function initDevicePixelRatio() {
			this.devicePixelRatio = window.devicePixelRatio || 1;
		}
	}, {
		key: "clickEvent",
		value: function clickEvent(t) {
			var e = t.point;
			_get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "clickEvent", this).call(this, e, t);
		}
	}, {
		key: "mousemoveEvent",
		value: function mousemoveEvent(t) {
			var e = t.point;
			_get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "mousemoveEvent", this).call(this, e, t);
		}
	}, {
		key: "addAnimatorEvent",
		value: function addAnimatorEvent() {}
	}, {
		key: "animatorMovestartEvent",
		value: function animatorMovestartEvent() {
			var t = this.options.animation;
			this.isEnabledTime() && this.animator && (this.steps.step = t.stepsRange.start);
		}
	}, {
		key: "animatorMoveendEvent",
		value: function animatorMoveendEvent() {
			this.isEnabledTime() && this.animator;
		}
	}, {
		key: "bindEvent",
		value: function bindEvent() {
			this.map;
			this.options.methods && (this.options.methods.click, this.options.methods.mousemove);
		}
	}, {
		key: "unbindEvent",
		value: function unbindEvent() {
			var t = this.map;
			this.options.methods && (this.options.methods.click && t.off("click", this.clickEvent), this.options.methods.mousemove && t.off("mousemove", this.mousemoveEvent));
		}
	}, {
		key: "getContext",
		value: function getContext() {
			return this.canvasLayer.canvas.getContext(this.context);
		}
	}, {
		key: "init",
		value: function init(t) {
			this.options = t;
			this.initDataRange(t);
			this.context = this.options.context || "2d";

			if (this.options.zIndex && this.canvasLayer && this.canvasLayer.setZIndex) this.canvasLayer.setZIndex(this.options.zIndex);

			this.initAnimator();
		}
	}, {
		key: "_canvasUpdate",
		value: function _canvasUpdate(t) {
			this.map;
			var e = this.scene;
			if (this.canvasLayer && !this.stopAniamation) {
				var i = this.options.animation,
				    n = this.getContext();
				if (this.isEnabledTime()) {
					if (void 0 === t) return void this.clear(n);
					"2d" === this.context && (n.save(), n.globalCompositeOperation = "destination-out", n.fillStyle = "rgba(0, 0, 0, .1)", n.fillRect(0, 0, n.canvas.width, n.canvas.height), n.restore());
				} else this.clear(n);
				if ("2d" === this.context) for (var o in this.options) {
					n[o] = this.options[o];
				} else n.clear(n.COLOR_BUFFER_BIT);
				var a = {
					transferCoordinate: function transferCoordinate(t) {
						var defVal = [99999, 99999];

						//坐标转换
						var position = Cesium.Cartesian3.fromDegrees(t[0], t[1]);
						if (!position) {
							return defVal;
						}
						var px = e.cartesianToCanvasCoordinates(position);
						if (!px) {
							return defVal;
						}

						//判断是否在球的背面  
						if (e.mode === Cesium.SceneMode.SCENE3D) {
							var angle = Cesium.Cartesian3.angleBetween(e.camera.position, position);
							if (angle > backAngle) return false;
						}
						//判断是否在球的背面

						return [px.x, px.y];
					}
				};
				void 0 !== t && (a.filter = function (e) {
					var n = i.trails || 10;
					return !!(t && e.time > t - n && e.time < t);
				});
				var c = this.dataSet.get(a);
				this.processData(c), "m" == this.options.unit && this.options.size, this.options._size = this.options.size;
				var h = Cesium.SceneTransforms.wgs84ToWindowCoordinates(e, Cesium.Cartesian3.fromDegrees(0, 0));

				this.drawContext(n, new mapv.DataSet(c), this.options, h), this.options.updateCallback && this.options.updateCallback(t);
			}
		}
	}, {
		key: "updateData",
		value: function updateData(t, e) {
			var i = t;
			i && i.get && (i = i.get()), void 0 != i && this.dataSet.set(i), _get(MapVRenderer.prototype.__proto__ || Object.getPrototypeOf(MapVRenderer.prototype), "update", this).call(this, {
				options: e
			});
		}
	}, {
		key: "addData",
		value: function addData(t, e) {
			var i = t;
			t && t.get && (i = t.get()), this.dataSet.add(i), this.update({
				options: e
			});
		}
	}, {
		key: "getData",
		value: function getData() {
			return this.dataSet;
		}
	}, {
		key: "removeData",
		value: function removeData(t) {
			if (this.dataSet) {
				var e = this.dataSet.get({
					filter: function filter(e) {
						return null == t || "function" != typeof t || !t(e);
					}
				});
				this.dataSet.set(e), this.update({
					options: null
				});
			}
		}
	}, {
		key: "clearData",
		value: function clearData() {
			this.dataSet && this.dataSet.clear(), this.update({
				options: null
			});
		}
	}, {
		key: "draw",
		value: function draw() {
			this.canvasLayer.draw();
		}
	}, {
		key: "clear",
		value: function clear(t) {
			t && t.clearRect && t.clearRect(0, 0, t.canvas.width, t.canvas.height);
		}
		/**
      * @function MapVRenderer.prototype.destroy
      * @description 释放资源。
      */

	}, {
		key: "destroy",
		value: function destroy() {
			this.unbindEvent();
			this.clear(this.getContext());
			this.clearData();
			this.animator && this.animator.stop();
			this.animator = null;
			this.canvasLayer = null;
		}
	}]);

	return MapVRenderer;
}(BaseLayer);

/***/ }),
/* 95 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_95__;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Measure = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _turf = __webpack_require__(22);

var turf = _interopRequireWildcard(_turf);

var _Draw = __webpack_require__(16);

var _EventType = __webpack_require__(7);

var DrawEventType = _interopRequireWildcard(_EventType);

var _Attr = __webpack_require__(13);

var _Attr2 = __webpack_require__(11);

var polygonAttr = _interopRequireWildcard(_Attr2);

var _util = __webpack_require__(4);

var _point = __webpack_require__(1);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//提供测量长度、面积等 [绘制基于draw]

var Measure = function Measure(opts) {
    var viewer = opts.viewer;

    //显示测量结果文本的字体
    var _labelAttr = {
        "color": "#ffffff",
        "font_family": "楷体",
        "font_size": 20,
        "border": true,
        "border_color": "#000000",
        "border_width": 3,
        "background": true,
        "background_color": "#000000",
        "background_opacity": 0.5,
        "scaleByDistance": true,
        "scaleByDistance_far": 800000,
        "scaleByDistance_farValue": 0.5,
        "scaleByDistance_near": 1000,
        "scaleByDistance_nearValue": 1,
        "pixelOffset": [0, -15],
        disableDepthTestDistance: Number.POSITIVE_INFINITY //一直显示，不被地形等遮挡
    };
    if (opts.label) {
        for (var key in opts.label) {
            _labelAttr[key] = opts.label[key];
        }
    }

    var thisType = ""; //当前正在绘制的类别 
    var drawControl = new _Draw.Draw(viewer, { hasEdit: false, removeScreenSpaceEvent: opts.removeScreenSpaceEvent });

    //事件监听
    drawControl.on(DrawEventType.DrawAddPoint, function (e) {
        var entity = e.entity;
        switch (thisType) {
            case "length":
            case "section":
                workLength.showAddPointLength(entity);
                break;
            case "area":
                workArea.showAddPointLength(entity);
                break;
            case "volume":
                workVolume.showAddPointLength(entity);
                break;
            case "height":
                workHeight.showAddPointLength(entity);
                break;
            case "super_height":
                workSuperHeight.showAddPointLength(entity);
                break;
            case "angle":
                workAngle.showAddPointLength(entity);
                break;

        }
    });
    drawControl.on(DrawEventType.DrawRemovePoint, function (e) {
        switch (thisType) {
            case "length":
            case "section":
                workLength.showRemoveLastPointLength(e);
                break;
            case "area":
                workArea.showRemoveLastPointLength(e);
                break;
            case "volume":
                workVolume.showRemoveLastPointLength(e);
                break;
            case "height":
                workHeight.showRemoveLastPointLength(e);
                break;
            case "super_height":
                workSuperHeight.showRemoveLastPointLength(e);
                break;
            case "angle":
                workAngle.showRemoveLastPointLength(e);
                break;
        }
    });
    drawControl.on(DrawEventType.DrawMouseMove, function (e) {
        var entity = e.entity;
        switch (thisType) {
            case "length":
            case "section":
                workLength.showMoveDrawing(entity);
                break;
            case "area":
                workArea.showMoveDrawing(entity);
                break;
            case "volume":
                workVolume.showMoveDrawing(entity);
                break;
            case "height":
                workHeight.showMoveDrawing(entity);
                break;
            case "super_height":
                workSuperHeight.showMoveDrawing(entity);
                break;
            case "angle":
                workAngle.showMoveDrawing(entity);
                break;
        }
    });

    drawControl.on(DrawEventType.DrawCreated, function (e) {
        var entity = e.entity;
        switch (thisType) {
            case "length":
            case "section":
                workLength.showDrawEnd(entity);
                break;
            case "area":
                workArea.showDrawEnd(entity);
                break;
            case "volume":
                workVolume.showDrawEnd(entity);
                break;
            case "height":
                workHeight.showDrawEnd(entity);
                break;
            case "super_height":
                workSuperHeight.showDrawEnd(entity);
                break;
            case "angle":
                workAngle.showDrawEnd(entity);
                break;
        }
    });

    var dataSource = drawControl.getDataSource();

    /*长度测量*/
    function measuerLength(options) {
        endLastDraw();

        thisType = "length";
        options = options || {};
        options.type = thisType;
        if (!options.hasOwnProperty("terrain")) options.terrain = true;

        workLength.start(options);
    }

    /*剖面分析*/
    function measureSection(options) {
        endLastDraw();

        thisType = "section";
        options = options || {};
        options.type = thisType;
        options.terrain = true;

        workLength.start(options);
    }

    /*面积测量*/
    function measureArea(options) {
        endLastDraw();

        thisType = "area";
        options = options || {};
        options.type = thisType;

        workArea.start(options);
    };

    /*体积测量*/
    function measureVolume(options) {
        endLastDraw();

        thisType = "volume";
        options = options || {};
        options.type = thisType;

        workVolume.start(options);
    };

    /*高度测量*/
    function measureHeight(options) {
        endLastDraw();

        options = options || {};

        if (options.hasOwnProperty("isSuper") && !options.isSuper) {
            thisType = "height";
            options.type = thisType;
            workHeight.start(options);
        } else {
            thisType = "super_height";
            options.type = thisType;
            workSuperHeight.start(options);
        }
    };

    /*角度测量*/
    function measureAngle(options) {
        endLastDraw();

        thisType = "angle";
        options = options || {};
        options.type = thisType;

        workAngle.start(options);
    };

    //如果上次未完成绘制就单击了新的，清除之前未完成的。
    function endLastDraw() {
        workLength.clearLastNoEnd();
        workArea.clearLastNoEnd();
        workVolume.clearLastNoEnd();
        workHeight.clearLastNoEnd();
        workSuperHeight.clearLastNoEnd();
        workAngle.clearLastNoEnd();

        drawControl.stopDraw();
    }

    /*清除测量*/
    function clearMeasure() {
        thisType = "";
        endLastDraw();

        //dataSource.entities.removeAll();
        drawControl.deleteAll();
    };

    /** 更新量测结果的单位  */
    function updateUnit(thisType, unit) {
        var arr = dataSource.entities.values;
        for (var i in arr) {
            var entity = arr[i];
            if (entity.label && entity.isMarsMeasureLabel && entity.attribute && entity.attribute.value) {
                if (entity.attribute.type != thisType) continue;
                if (thisType == "area") {
                    entity.label.text._value = (entity.attribute.textEx || "") + formatArea(entity.attribute.value, unit);
                } else {
                    entity._label.text._value = (entity.attribute.textEx || "") + formatLength(entity.attribute.value, unit);
                }
            }
        }
    }

    var workLength = {
        options: null,
        arrLables: [], //各线段label
        totalLable: null, //总长label 
        disTerrainScale: 1.2, //贴地时的概略比例
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            if (this.arrLables && this.arrLables.length > 0) {
                var arrLables = this.arrLables;
                if (arrLables && arrLables.length > 0) {
                    for (var i in arrLables) {
                        dataSource.entities.remove(arrLables[i]);
                    }
                }
            }
            this.totalLable = null;
            this.arrLables = [];
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            //总长label 
            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });
            this.arrLables = [];

            drawControl.startDraw({
                type: "polyline",
                config: {
                    addHeight: options.addHeight
                },
                style: options.style || {
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1,
                    "clampToGround": this.options.type == "section" || this.options.terrain //是否贴地 
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {
            var positions = drawControl.getPositions(entity);

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: true
            });

            var tempSingleLabel = dataSource.entities.add({
                position: positions[positions.length - 1],
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            if (positions.length == 1) {
                tempSingleLabel.label.text = "起点";
                //tempSingleLabel.attribute.value = 0;
            } else {
                var distance = this.getLength(positions);
                var distancestr = formatLength(distance, this.options.unit);

                tempSingleLabel.label.text = distancestr;
                tempSingleLabel.attribute.value = distance;

                //屏蔽比较小的数值
                if (this.getLength([positions[positions.length - 2], positions[positions.length - 1]]) < 5) tempSingleLabel.show = false;
            }
            this.arrLables.push(tempSingleLabel);
        },
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {
            var label = this.arrLables.pop();
            dataSource.entities.remove(label);

            this.showMoveDrawing(e.entity);
            this.totalLable.position = e.position;
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) {
                this.totalLable.label.show = false;
                return;
            }

            var distance = this.getLength(positions);
            var distancestr = formatLength(distance, this.options.unit);

            this.totalLable.position = positions[positions.length - 1];
            this.totalLable.label.text = "总长:" + distancestr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = distance;
            this.totalLable.attribute.textEx = "总长:";

            if (this.options.calback) this.options.calback(distancestr, distance);
        },
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            var positions = drawControl.getPositions(entity);
            var count = this.arrLables.length - positions.length;
            if (count >= 0) {
                for (var i = this.arrLables.length - 1; i >= positions.length - 1; i--) {
                    dataSource.entities.remove(this.arrLables[i]);
                }
                this.arrLables.splice(positions.length - 1, count + 1);
            }
            entity._totalLable = this.totalLable;
            entity._arrLables = this.arrLables;

            this.totalLable = null;
            this.arrLables = [];

            if (entity.polyline == null) return;

            if (this.options.type == "section") this.updateSectionForTerrain(entity);else if (this.options.terrain) this.updateLengthForTerrain(entity);
        },
        //计算贴地线
        updateLengthForTerrain: function updateLengthForTerrain(entity) {
            var that = this;
            var positions = entity.polyline.positions.getValue(viewer.clock.currentTime);
            var arrLables = entity._arrLables;
            var totalLable = entity._totalLable;
            var unit = totalLable && totalLable.unit;

            var index = 0;
            var all_distance = 0;

            function getLineFD() {
                index++;

                if (index >= positions.length && totalLable) {
                    var distancestr = formatLength(all_distance, unit);

                    totalLable.label.text = "总长:" + distancestr;
                    totalLable.attribute.value = all_distance;

                    if (that.options.calback) that.options.calback(distancestr, all_distance);
                    return;
                }

                var arr = [positions[index - 1], positions[index]];
                (0, _util.terrainPolyline)({
                    viewer: viewer,
                    positions: arr,
                    calback: function calback(raisedPositions, noHeight) {
                        var distance = that.getLength(raisedPositions);
                        if (noHeight) {
                            distance = distance * that.disTerrainScale; //求高度失败，概略估算值
                        }

                        var thisLabel = arrLables[index];
                        if (thisLabel) {
                            var distancestr = formatLength(distance, unit);

                            thisLabel.label.text = distancestr;
                            thisLabel.attribute.value = distance;
                        }

                        all_distance += distance;
                        getLineFD();
                    }
                });
            }
            getLineFD();
        },

        //计算剖面
        updateSectionForTerrain: function updateSectionForTerrain(entity) {
            var positions = entity.polyline.positions.getValue(viewer.clock.currentTime);
            if (positions.length < 2) return;

            var arrLables = entity._arrLables;
            var totalLable = entity._totalLable;
            var unit = totalLable && totalLable.unit;

            var index = 0;
            var positionsNew = [];

            var alllen = 0;
            var arrLen = [];
            var arrHB = [];
            var arrLX = [];
            var arrPoint = [];

            var that = this;
            function getLineFD() {
                index++;

                var arr = [positions[index - 1], positions[index]];
                (0, _util.terrainPolyline)({
                    viewer: viewer,
                    positions: arr,
                    calback: function calback(raisedPositions, noHeight) {
                        if (noHeight) {
                            if (index == 1) positionsNew = positionsNew.concat(arr);else positionsNew = positionsNew.concat([positions[index]]);
                        } else {
                            positionsNew = positionsNew.concat(raisedPositions);
                        }

                        var h1 = Cesium.Cartographic.fromCartesian(positions[index - 1]).height;
                        var h2 = Cesium.Cartographic.fromCartesian(positions[index]).height;
                        var hstep = (h2 - h1) / raisedPositions.length;

                        for (var i = 0; i < raisedPositions.length; i++) {
                            //长度
                            if (i != 0) {
                                alllen += Cesium.Cartesian3.distance(raisedPositions[i], raisedPositions[i - 1]);
                            }
                            arrLen.push(Number(alllen.toFixed(1)));

                            //海拔高度
                            var point = (0, _point.formatPositon)(raisedPositions[i]);
                            arrHB.push(point.z);
                            arrPoint.push(point);

                            //路线高度
                            var fxgd = Number((h1 + hstep * i).toFixed(1));
                            arrLX.push(fxgd);
                        }

                        if (index >= positions.length - 1) {
                            if (totalLable) {
                                var distance = that.getLength(positionsNew);
                                var distancestr = formatLength(distance, unit);

                                totalLable.label.text = "总长:" + distancestr;
                                totalLable.attribute.value = distance;
                            }
                            if (that.options.calback) that.options.calback({
                                distancestr: distancestr,
                                distance: distance,
                                arrLen: arrLen,
                                arrLX: arrLX,
                                arrHB: arrHB,
                                arrPoint: arrPoint
                            });
                        } else {
                            var distance = that.getLength(raisedPositions);
                            var distancestr = formatLength(distance, unit);

                            var thisLabel = arrLables[index];
                            thisLabel.label.text = distancestr;
                            thisLabel.attribute.value = distance;

                            getLineFD();
                        }
                    }
                });
            }
            getLineFD();
        },
        //计算长度，单位：米
        getLength: function getLength(positions) {
            var distance = 0;
            for (var i = 0, len = positions.length - 1; i < len; i++) {
                distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
            }
            return distance;
        }
    };

    var workArea = {
        options: null,
        totalLable: null, //面积label
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            this.totalLable = null;
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            drawControl.startDraw({
                type: "polygon",
                style: options.style || {
                    color: "#00fff2",
                    outline: true,
                    outlineColor: "#fafa5a",
                    outlineWidth: 1,
                    opacity: 0.4,
                    clampToGround: true //贴地
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {},
        //绘制中删除了最后一个点
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {
            var positions = drawControl.getPositions(e.entity);
            if (positions.length < 3) {
                this.totalLable.label.show = false;
            }
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 3) {
                this.totalLable.label.show = false;
                return;
            }

            var polygon = polygonAttr.toGeoJSON(entity);
            var area = turf.area(polygon);
            var areastr = formatArea(area, this.options.unit);

            //求中心点  
            var ptcenter = (0, _point.centerOfMass)(positions);

            this.totalLable.position = ptcenter;
            this.totalLable.label.text = "面积:" + areastr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = area;
            this.totalLable.attribute.textEx = "面积:";

            if (this.options.calback) this.options.calback(areastr, area);
        },
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            if (entity.polygon == null) return;

            entity._totalLable = this.totalLable;
            this.totalLable = null;
        }
    };

    var workVolume = {
        options: null,
        totalLable: null, //体积label
        prevEntity: null, //立体边界
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            this.totalLable = null;

            if (this.prevEntity != null) dataSource.entities.remove(this.prevEntity);
            this.prevEntity = null;
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            drawControl.startDraw({
                type: "polygon",
                style: options.style || {
                    color: "#00fff2",
                    outline: true,
                    outlineColor: "#fafa5a",
                    outlineWidth: 1,
                    opacity: 0.4,
                    clampToGround: true //贴地
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {},
        //绘制中删除了最后一个点
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {},
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {},
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            if (entity.polygon == null) return;

            var positions = polygonAttr.getPositions(entity);
            var result = this.computeCutVolume(positions);

            var maxHeight = result.maxHeight;
            var totalCutVolume = result.totalCutVolume;

            var totalCutVolumestr = totalCutVolume.toFixed(2) + "立方米"; ///formatArea(totalCutVolume, this.options.unit);

            //求中心点 
            var ptcenter = (0, _point.centerOfMass)(positions, maxHeight + 10);

            this.totalLable.position = ptcenter;
            this.totalLable.label.text = "挖方体积:" + totalCutVolumestr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = totalCutVolume;
            this.totalLable.attribute.textEx = "挖方体积:";

            if (this.options.calback) this.options.calback(areastr, totalCutVolume);

            dataSource.entities.remove(entity);
            //显示立体边界
            entity = dataSource.entities.add({
                polygon: {
                    hierarchy: {
                        positions: positions
                    },
                    extrudedHeight: maxHeight,
                    closeTop: false,
                    closeBottom: false,
                    material: new Cesium.Color.fromCssColorString("#00fff2").withAlpha(0.5),
                    outline: true,
                    outlineColor: new Cesium.Color.fromCssColorString("#fafa5a").withAlpha(0.4),
                    outlineWidth: 1
                }
            });

            entity._totalLable = this.totalLable;
            this.totalLable = null;
        },
        computeCutVolume: function computeCutVolume(positions) {
            var minHeight = 15000;
            for (var i = 0; i < positions.length; i++) {
                var cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                var height = viewer.scene.globe.getHeight(cartographic);
                if (minHeight > height) minHeight = height;
            }

            var granularity = Math.PI / Math.pow(2, 11);
            granularity = granularity / 64;

            var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
                positions: positions,
                vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
                granularity: granularity
            });
            //polygon subdivision
            var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);

            var totalCutVolume = 0;
            var maxHeight = 0;

            var i0, i1, i2;
            var height1, height2, height3;
            var p1, p2, p3;
            var cartesian;
            var cartographic;
            var bottomArea;

            for (var i = 0; i < geom.indices.length; i += 3) {
                i0 = geom.indices[i];
                i1 = geom.indices[i + 1];
                i2 = geom.indices[i + 2];

                cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i0 * 3], geom.attributes.position.values[i0 * 3 + 1], geom.attributes.position.values[i0 * 3 + 2]);

                cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                height1 = viewer.scene.globe.getHeight(cartographic);
                p1 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0 /*height1 + 1000*/);

                if (maxHeight < height1) maxHeight = height1;

                cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i1 * 3], geom.attributes.position.values[i1 * 3 + 1], geom.attributes.position.values[i1 * 3 + 2]);

                cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                height2 = viewer.scene.globe.getHeight(cartographic);

                var p2 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0 /*height2 + 1000*/);

                if (maxHeight < height2) maxHeight = height2;

                cartesian = new Cesium.Cartesian3(geom.attributes.position.values[i2 * 3], geom.attributes.position.values[i2 * 3 + 1], geom.attributes.position.values[i2 * 3 + 2]);

                cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                height3 = viewer.scene.globe.getHeight(cartographic);
                p3 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0 /*height3 + 1000*/);

                if (maxHeight < height3) maxHeight = height3;

                bottomArea = this.computeAreaOfTriangle(p1, p2, p3);
                totalCutVolume = totalCutVolume + bottomArea * (height1 - minHeight + height2 - minHeight + height3 - minHeight) / 3;
            }

            return {
                maxHeight: maxHeight,
                totalCutVolume: totalCutVolume
            };
        },
        computeAreaOfTriangle: function computeAreaOfTriangle(pos1, pos2, pos3) {
            var a = Cesium.Cartesian3.distance(pos1, pos2);
            var b = Cesium.Cartesian3.distance(pos2, pos3);
            var c = Cesium.Cartesian3.distance(pos3, pos1);
            var S = (a + b + c) / 2;
            return Math.sqrt(S * (S - a) * (S - b) * (S - c));
        }

    };

    var workHeight = {
        options: null,
        totalLable: null, //高度label  
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            this.totalLable = null;
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            drawControl.startDraw({
                type: "polyline",
                config: { maxPointNum: 2 },
                style: options.style || {
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {},
        //绘制中删除了最后一个点
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {
            if (this.totalLable) this.totalLable.label.show = false;
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) {
                this.totalLable.label.show = false;
                return;
            }

            var cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
            var cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
            var height = Math.abs(cartographic1.height - cartographic.height);
            var heightstr = formatLength(height, this.options.unit);

            this.totalLable.position = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
            this.totalLable.label.text = "高度差:" + heightstr;
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = height;
            this.totalLable.attribute.textEx = "高度差:";

            if (this.options.calback) this.options.calback(heightstr, height);
        },
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            entity._totalLable = this.totalLable;
            this.totalLable = null;
        }
    };

    var workSuperHeight = {
        options: null,
        totalLable: null, //高度差label
        xLable: null, //水平距离label
        hLable: null, //水平距离label
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            if (this.xLable != null) dataSource.entities.remove(this.xLable);
            if (this.hLable != null) dataSource.entities.remove(this.hLable);

            this.totalLable = null;
            this.xLable = null;
            this.hLable = null;
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                show: false
            });
            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            var entityattr2 = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });
            entityattr2.pixelOffset = new Cesium.Cartesian2(0, 0);
            this.xLable = dataSource.entities.add({
                label: entityattr2,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            this.hLable = dataSource.entities.add({
                label: entityattr2,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            drawControl.startDraw({
                type: "polyline",
                //minMaxPoints: { min: 2, max: 2, isSuper: true },
                config: { maxPointNum: 2 },
                style: options.style || {
                    "lineType": "glow",
                    "color": "#ebe12c",
                    "width": 9,
                    "glowPower": 0.1
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {
            var lonlats = drawControl.getPositions(entity);
            if (lonlats.length == 4) {
                var mouseEndPosition = lonlats[3].clone();
                lonlats.pop();
                lonlats.pop();
                lonlats.pop();
                lonlats.push(mouseEndPosition);
            }

            if (lonlats.length == 2) {
                var zCartesian = this.getZHeightPosition(lonlats[0], lonlats[1]);
                var hDistance = this.getHDistance(lonlats[0], lonlats[1]);
                if (hDistance > 3.0) {
                    lonlats.push(zCartesian);
                    lonlats.push(lonlats[0]);
                }
            }

            this.showSuperHeight(lonlats);
        },
        //绘制中删除了最后一个点 
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {
            var lonlats = drawControl.getPositions(e.entity);
            if (lonlats.length == 2) {
                lonlats.pop();
                lonlats.pop();

                this.totalLable.label.show = false;
                this.hLable.label.show = false;
                this.xLable.label.show = false;
            }
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {
            var lonlats = drawControl.getPositions(entity);
            if (lonlats.length == 4) {
                var mouseEndPosition = lonlats[3].clone();
                lonlats.pop();
                lonlats.pop();
                lonlats.pop();
                lonlats.push(mouseEndPosition);
            }

            if (lonlats.length == 2) {
                var zCartesian = this.getZHeightPosition(lonlats[0], lonlats[1]);
                var hDistance = this.getHDistance(lonlats[0], lonlats[1]);
                if (hDistance > 3.0) {
                    lonlats.push(zCartesian);
                    lonlats.push(lonlats[0]);
                }
            }
            this.showSuperHeight(lonlats);
        },
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            entity._arrLables = [this.totalLable, this.hLable, this.xLable];

            this.totalLable = null;
            this.hLable = null;
            this.xLable = null;
        },

        /**
         * 超级 高程测量
         * 由4个点形成的三角形（首尾点相同），计算该三角形三条线段的长度
         * @param {Array} positions 4个点形成的点数组
         */
        showSuperHeight: function showSuperHeight(positions) {
            var vLength; //垂直距离
            var hLength; //水平距离
            var lLength; //长度
            var height;
            if (positions.length == 4) {
                var midLPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                var midXPoint, midHPoint;
                var cartographic0 = Cesium.Cartographic.fromCartesian(positions[0]);
                var cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
                var cartographic2 = Cesium.Cartographic.fromCartesian(positions[2]);
                var tempHeight = cartographic1.height - cartographic2.height;
                height = cartographic1.height - cartographic0.height;
                lLength = Cesium.Cartesian3.distance(positions[0], positions[1]);
                if (height > -1 && height < 1) {
                    midHPoint = positions[1];
                    this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", height);
                    this.updateSuperHeightLabel(this.hLable, midLPoint, "", lLength);
                } else {
                    if (tempHeight > -0.1 && tempHeight < 0.1) {
                        midXPoint = Cesium.Cartesian3.midpoint(positions[2], positions[1], new Cesium.Cartesian3());
                        midHPoint = Cesium.Cartesian3.midpoint(positions[2], positions[3], new Cesium.Cartesian3());
                        hLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
                        vLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
                    } else {
                        midHPoint = Cesium.Cartesian3.midpoint(positions[2], positions[1], new Cesium.Cartesian3());
                        midXPoint = Cesium.Cartesian3.midpoint(positions[2], positions[3], new Cesium.Cartesian3());
                        hLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
                        vLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
                    }
                    this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", vLength);
                    this.updateSuperHeightLabel(this.xLable, midXPoint, "", hLength);
                    this.updateSuperHeightLabel(this.hLable, midLPoint, "", lLength);
                }
            } else if (positions.length == 2) {
                vLength = Cesium.Cartesian3.distance(positions[1], positions[0]);
                var midHPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                if (xLable.label.show) {
                    xLable.label.show = false;
                    hLable.label.show = false;
                }
                this.updateSuperHeightLabel(this.totalLable, midHPoint, "高度差:", vLength);
            }

            var heightstr = formatLength(vLength, this.options.unit);
            if (this.options.calback) this.options.calback(heightstr, vLength);
        },
        /**
         * 超级 高程测量 显示标签
         * @param {Cesium.Label} currentLabel 显示标签
         * @param {Cesium.Cartesian3} postion 坐标位置
         * @param {String} type 类型("高度差"，"水平距离"，"长度")
         * @param {Object} value 值
         */
        updateSuperHeightLabel: function updateSuperHeightLabel(currentLabel, postion, type, value) {
            if (currentLabel == null) return;

            currentLabel.position = postion;
            currentLabel.label.text = type + formatLength(value, this.options.unit);
            currentLabel.label.show = true;

            currentLabel.attribute.value = value;
            currentLabel.attribute.textEx = type;
        },

        /**
           * 带有高度差的两点，判断其直角点 
           */
        getZHeightPosition: function getZHeightPosition(cartesian1, cartesian2) {
            var carto1 = Cesium.Cartographic.fromCartesian(cartesian1);
            var lng1 = Number(Cesium.Math.toDegrees(carto1.longitude));
            var lat1 = Number(Cesium.Math.toDegrees(carto1.latitude));
            var height1 = Number(carto1.height.toFixed(2));

            var carto2 = Cesium.Cartographic.fromCartesian(cartesian2);
            var lng2 = Number(Cesium.Math.toDegrees(carto2.longitude));
            var lat2 = Number(Cesium.Math.toDegrees(carto2.latitude));
            var height2 = Number(carto2.height.toFixed(2));

            if (height1 > height2) return Cesium.Cartesian3.fromDegrees(lng2, lat2, height1);else return Cesium.Cartesian3.fromDegrees(lng1, lat1, height2);
        },

        /**
         * 带有高度差的两点，计算两点间的水平距离 
         */
        getHDistance: function getHDistance(cartesian1, cartesian2) {
            var zCartesian = this.getZHeightPosition(cartesian1, cartesian2);

            var carto1 = Cesium.Cartographic.fromCartesian(cartesian2);
            var cartoZ = Cesium.Cartographic.fromCartesian(zCartesian);

            var hDistance = Cesium.Cartesian3.distance(cartesian1, zCartesian);

            if (Math.abs(Number(cartoZ.height) - Number(carto1.height)) < 0.01) {
                hDistance = Cesium.Cartesian3.distance(cartesian2, zCartesian);
            }

            return hDistance;
        }

    };

    var workAngle = {
        options: null,
        totalLable: null, //角度label  
        exLine: null, //辅助线
        //清除未完成的数据
        clearLastNoEnd: function clearLastNoEnd() {
            if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
            this.totalLable = null;

            if (this.exLine != null) dataSource.entities.remove(this.exLine);
            this.exLine = null;
        },
        //开始绘制
        start: function start(options) {
            this.options = options;

            var entityattr = (0, _Attr.style2Entity)(_labelAttr, {
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                show: false
            });

            this.totalLable = dataSource.entities.add({
                label: entityattr,
                isMarsMeasureLabel: true,
                _noMousePosition: true,
                attribute: {
                    unit: this.options.unit,
                    type: this.options.type
                }
            });

            drawControl.startDraw({
                type: "polyline",
                config: { maxPointNum: 2 },
                style: options.style || {
                    "lineType": "arrow",
                    "color": "#ebe967",
                    "width": 9,
                    "clampToGround": true
                }
            });
        },
        //绘制增加一个点后，显示该分段的长度
        showAddPointLength: function showAddPointLength(entity) {},
        //绘制中删除了最后一个点
        showRemoveLastPointLength: function showRemoveLastPointLength(e) {
            if (this.exLine) {
                this.exLine.polyline.show = false;
            }
            if (this.totalLable) this.totalLable.label.show = false;
        },
        //绘制过程移动中，动态显示长度信息
        showMoveDrawing: function showMoveDrawing(entity) {
            var positions = drawControl.getPositions(entity);
            if (positions.length < 2) {
                this.totalLable.label.show = false;
                return;
            }

            var len = Cesium.Cartesian3.distance(positions[0], positions[1]);

            //求方位角
            var point1 = (0, _point.formatPositon)(positions[0]);
            var point2 = (0, _point.formatPositon)(positions[1]);

            var pt1 = turf.point([point1.x, point1.y, point1.z]);
            var pt2 = turf.point([point2.x, point2.y, point2.z]);
            var bearing = Math.round(turf.rhumbBearing(pt1, pt2));

            //求参考点
            var newpoint = turf.destination(pt1, len / 3000, 0, { units: 'kilometers' }); //1/3
            newpoint = { x: newpoint.geometry.coordinates[0], y: newpoint.geometry.coordinates[1], z: point1.z };
            var new_position = Cesium.Cartesian3.fromDegrees(newpoint.x, newpoint.y, newpoint.z);

            this.updateExLine([positions[0], new_position]); //参考线


            this.totalLable.position = positions[1];
            this.totalLable.label.text = "角度:" + bearing + "°\n距离:" + formatLength(len);
            this.totalLable.label.show = true;

            this.totalLable.attribute.value = bearing;
            this.totalLable.attribute.textEx = "角度:";

            if (this.options.calback) this.options.calback(bearing + '°', bearing);
        },
        updateExLine: function updateExLine(positions) {
            if (this.exLine) {
                this.exLine.polyline.show = true;
                this.exLine.polyline.positions.setValue(positions);
            } else {
                this.exLine = dataSource.entities.add({
                    polyline: {
                        positions: positions,
                        width: 3,
                        clampToGround: true,
                        material: new Cesium.PolylineDashMaterialProperty({
                            color: Cesium.Color.RED
                        })
                    }
                });
            }
        },
        //绘制完成后
        showDrawEnd: function showDrawEnd(entity) {
            entity._totalLable = this.totalLable;
            this.totalLable = null;
            this.exLine = null;
        }

    };

    /**  进行单位换算，格式化显示面积    */
    function formatArea(val, unit) {
        if (val == null) return "";

        if (unit == null || unit == "auto") {
            if (val < 1000000) unit = "m";else unit = "km";
        }
        var valstr = "";
        switch (unit) {
            default:
            case "m":
                valstr = val.toFixed(2) + '平方米';
                break;
            case "km":
                valstr = (val / 1000000).toFixed(2) + '平方千米';
                break;
            case "mu":
                valstr = (val * 0.0015).toFixed(2) + '亩';
                break;
            case "wmu":
                valstr = (val * 0.00000015).toFixed(2) + '万亩';
                break;
            case "ha":
                valstr = (val * 0.0001).toFixed(2) + '公顷';
                break;
            case "wha":
                valstr = (val * 0.00000001).toFixed(2) + '万公顷';
                break;
        }

        return valstr;
    }

    /**  单位换算，格式化显示长度     */
    function formatLength(val, unit) {
        if (val == null) return "";

        if (unit == null || unit == "auto") {
            if (val < 1000) unit = "m";else unit = "km";
        }

        var valstr = "";
        switch (unit) {
            default:
            case "m":
                valstr = val.toFixed(2) + '米';
                break;
            case "km":
                valstr = (val * 0.001).toFixed(2) + '千米';
                break;
            case "mile":
                valstr = (val * 0.00054).toFixed(2) + '海里';
                break;
            case "zhang":
                valstr = (val * 0.3).toFixed(2) + '丈';
                break;
        }
        return valstr;
    }

    return {
        measuerLength: measuerLength,
        measureHeight: measureHeight,
        measureArea: measureArea,
        measureAngle: measureAngle,

        measureVolume: measureVolume,
        measureSection: measureSection,

        updateUnit: updateUnit,
        clearMeasure: clearMeasure,

        formatArea: formatArea,
        formatLength: formatLength
    };
};

exports.Measure = Measure;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DivPoint = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _jquery = __webpack_require__(5);

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//div点 类
var DivPoint = exports.DivPoint = function () {
    //========== 构造方法 ========== 
    function DivPoint(viewer, opts) {
        _classCallCheck(this, DivPoint);

        this.viewer = viewer;

        this.position = opts.position;
        this.anchor = opts.anchor;
        this._visible = true;

        //添加html
        this.$view = (0, _jquery2.default)(opts.html);
        this.$view.css({
            position: 'absolute',
            left: '0',
            top: '0'
        });
        this.$view.appendTo("#" + viewer._container.id);

        var that = this;
        if (opts.click || opts.popup) {
            this.$view.click(function (e) {
                if (opts.popup) viewer.mars.popup.show(opts, that.position);
                if (opts.click) opts.click(opts, that, e);
            });
        }
        if (opts.tooltip) {
            this.$view.hover(function () {
                //移入
                viewer.mars.tooltip.show(opts, that.position);
            }, function () {
                //移出
                viewer.mars.tooltip.close();
            });
        }
        this.$view.on('mousewheel', function (event) {
            //$(viewer.scene.canvas).trigger(event);
        });

        //移动事件
        viewer.scene.postRender.addEventListener(this.updateViewPoint, this);
    }

    //========== 对外属性 ==========  


    _createClass(DivPoint, [{
        key: 'updateViewPoint',


        //========== 方法 ========== 
        value: function updateViewPoint() {
            if (!this._visible) return;

            var scene = this.viewer.scene;
            var point = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, this.position);
            if (point == null) return;

            //判断是否在球的背面
            if (scene.mode === Cesium.SceneMode.SCENE3D) {
                //三维模式下
                var pickRay = scene.camera.getPickRay(point);
                var cartesianNew = scene.globe.pick(pickRay, scene);
                if (cartesianNew) {
                    var len = Cesium.Cartesian3.distance(this.position, cartesianNew);
                    if (len > 1000 * 1000) return false;
                }
            }
            //判断是否在球的背面

            var x = point.x;
            var y = point.y - this.$view.height();
            if (this.anchor) {
                x += this.anchor[0];
                y += this.anchor[1];
            } else {
                x -= this.$view.width() / 2; //默认为div下侧中心点
            }

            this.$view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');
        }
    }, {
        key: 'setVisible',
        value: function setVisible(val) {
            this._visible = val;
            if (val) this.$view.show();else this.$view.hide();
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.viewer.scene.postRender.removeEventListener(this.updateViewPoint, this);
            this.$view.remove();

            this.$view = null;
            this.position = null;
            this.anchor = null;
            this.viewer = null;
        }
    }, {
        key: 'dom',
        get: function get() {
            return this.$view;
        }

        //裁剪距离 

    }, {
        key: 'visible',
        get: function get() {
            return this._visible;
        },
        set: function set(val) {
            this._visible = val;
            this.setVisible(val);
        }
    }]);

    return DivPoint;
}();

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var scratch = new Cesium.Matrix4();

var matrix3Scratch = new Cesium.Matrix3();
var positionScratch = new Cesium.Cartesian3();
var orientationScratch = new Cesium.Quaternion();

//参数默认值
var defVal = {
    "model": { "show": false, "scale": 1, "minimumPixelSize": 50 },
    "label": { "show": false, "color": "#ffffff", "opacity": 1, "font_family": "楷体", "font_size": 20, "border": true, "border_color": "#000000", "border_width": 3, "background": false, "hasPixelOffset": true, "pixelOffsetX": 30, "pixelOffsetY": -30, "scaleByDistance": true, "scaleByDistance_far": 10000000, "scaleByDistance_farValue": 0.4, "scaleByDistance_near": 100000, "scaleByDistance_nearValue": 1 },
    "path": { "show": false, "lineType": "solid", "color": "#3388ff", "opacity": 0.5, "width": 1, "outline": false, "outlineColor": "#ffffff", "outlineWidth": 2 },
    "shadow": { "show": false, "color": "#00ff00", "outline": false, "opacity": 0.3 },
    "camera": { "type": "gs", "followedX": 50, "followedZ": 10 },
    "showGroundHeight": false
};

//飞行路线管理类

var FlyLine = exports.FlyLine = function () {
    //========== 构造方法 ========== 
    function FlyLine(viewer, options) {
        _classCallCheck(this, FlyLine);

        this.viewer = viewer;

        this.id = options.id || 0;
        this.name = options.name || "";
        this.points = options.points; //坐标

        //未传入时的属性取默认值的
        for (var key in defVal) {
            var val = defVal[key];

            if (options.hasOwnProperty(key) && _typeof(options[key]) === 'object') {
                for (var key2 in val) {
                    if (!options[key].hasOwnProperty(key2)) options[key][key2] = val[key2];
                }
            } else {
                options[key] = val;
            }
        }
        this.options = options; //属性

        this._isStart = false;

        this._createLine();
        this._createEntity();
    }

    //========== 对外属性 ==========  
    // //高度
    // get xxxxx() {
    //     return this.options;
    // }
    // set xxxxx(params) { 
    // }


    //========== 方法 ==========  


    _createClass(FlyLine, [{
        key: "_createLine",
        value: function _createLine() {
            //=====================计算飞行时间及坐标====================
            var property = new Cesium.SampledPositionProperty();
            var startTime = Cesium.JulianDate.fromDate(new Date()); //飞行开始时间
            var stopTime; //飞行结束时间 

            var lonlats = this.points;
            if (lonlats.length < 2) {
                console.log('路线无坐标数据，无法漫游！');
                return;
            }

            var speeds = this.options.speed;
            var isSpeedArray = !haoutil.isutil.isNumber(speeds);
            if (lonlats.length == 2) {
                //2个点时，需要插值，否则穿地 
                var centerPt = this.getPointForLineAlong(lonlats[0], lonlats[1], 0, 0.5);
                lonlats.splice(1, 0, centerPt);
                if (speeds && isSpeedArray) speeds.splice(1, 0, speeds[0]);
            }
            var defSpeed = 100; //无速度值时的 默认速度  单位：千米/小时

            var alltimes = 0; //总时长,单位：秒
            var alllen = 0; //总长度,单位：米

            var lastPoint;
            var arrLinePoint = [];
            for (var i = 0, length = lonlats.length; i < length; i++) {
                var lonlat = lonlats[i];
                var item = Cesium.Cartesian3.fromDegrees(lonlat[0], lonlat[1], lonlat[2] || 0);
                item.lonlat = lonlat;

                if (i == 0) {
                    //起点
                    var sTime = Cesium.JulianDate.addSeconds(startTime, alltimes, new Cesium.JulianDate());
                    item.time = sTime;
                    item.second = alltimes;
                    property.addSample(sTime, item);
                } else {
                    var speed = isSpeedArray ? speeds ? speeds[i - 1] : defSpeed : speeds || defSpeed;
                    var len = Cesium.Cartesian3.distance(item, lastPoint);
                    var stepTime = Math.round(len / speed * 3.6);
                    alltimes += stepTime;
                    alllen += len;

                    var sTime = Cesium.JulianDate.addSeconds(startTime, alltimes, new Cesium.JulianDate());
                    item.time = sTime;
                    item.second = alltimes;
                    property.addSample(sTime, item);
                }
                lastPoint = item;
                arrLinePoint.push(item);
            }

            this.arrLinePoint = arrLinePoint;
            stopTime = Cesium.JulianDate.addSeconds(startTime, alltimes, new Cesium.JulianDate());

            this.alllen = alllen;
            this.alltimes = alltimes;

            this.startTime = startTime;
            this.stopTime = stopTime;
            this.property = property;

            //插值，使折线边平滑 ,并且长距离下不穿地
            this.property.setInterpolationOptions({
                interpolationDegree: 2,
                interpolationAlgorithm: Cesium.LagrangePolynomialApproximation //HermitePolynomialApproximation
            });
        }
    }, {
        key: "_createEntity",
        value: function _createEntity() {
            this.options.label.text = this.name;

            var modelAttr = DiitEarth.draw.attr.model.style2Entity(this.options.model);
            var labelAttr = DiitEarth.draw.attr.label.style2Entity(this.options.label);
            var pathAttr = DiitEarth.draw.attr.polyline.style2Entity(this.options.path, {});
            pathAttr.leadTime = 0; //只显示飞过的路线
            pathAttr.trailTime = this.alltimes;

            var velocityOrientation = new Cesium.VelocityOrientationProperty(this.property); //基于移动位置自动计算方位
            this.velocityOrientation = velocityOrientation;

            this.entity = this.viewer.entities.add({
                id: this.id,
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: this.startTime,
                    stop: this.stopTime
                })]),
                position: this.property,
                orientation: velocityOrientation,
                model: modelAttr,
                label: labelAttr,
                path: pathAttr,
                point: { //必须有对象，否则viewer.trackedEntity无法跟随(无model时使用)
                    show: !modelAttr.show,
                    color: new Cesium.Color.fromCssColorString('#ffffff').withAlpha(0.01),
                    pixelSize: 1
                }
            });
        }
    }, {
        key: "updateStyle",
        value: function updateStyle(params) {
            for (var i in params) {
                if (_typeof(params[i]) === 'object' && this.options[i]) {
                    for (var key2 in params[i]) {
                        this.options[i][key2] = params[i][key2];
                    }
                } else {
                    this.options[i] = params[i];
                }
            }
        }
    }, {
        key: "updateAngle",
        value: function updateAngle(isAuto, opts) {
            if (isAuto) {
                this.entity.orientation = this.velocityOrientation; //基于移动位置自动计算方位
            } else {
                opts = opts || {};
                //当前点
                var position = Cesium.Property.getValueOrUndefined(this.property, this.viewer.clock.currentTime, positionScratch);

                //获取当前角度 
                var _orientation = Cesium.Property.getValueOrUndefined(this.velocityOrientation, this.viewer.clock.currentTime, orientationScratch);
                var autoHpr = DiitEarth.matrix.getHeadingPitchRollByOrientation(position, _orientation);

                //重新赋值新角度
                var heading = autoHpr.heading;
                var pitch = Cesium.Math.toRadians(Number(opts.pitch || 0.0));
                var roll = Cesium.Math.toRadians(Number(opts.roll || 0.0));

                this.entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(heading, pitch, roll));
            }
        }
    }, {
        key: "start",
        value: function start() {
            if (this._isStart) this.stop();
            this._isStart = true;

            //=====================绑定clock timeline==================== 
            this.viewer.clock.startTime = this.startTime.clone();
            this.viewer.clock.stopTime = this.stopTime.clone();
            this.viewer.clock.currentTime = this.startTime.clone();
            this.viewer.clock.multiplier = 1; //飞行速度 
            this.viewer.clock.shouldAnimate = true;

            if (this.options.clockRange) this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //到达终止时间后循环
            else this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; //到达终止时间后停止
            //this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED; //达到终止时间后继续读秒

            this.viewer.flyTo(this.entity);
            this.viewer.trackedEntity = this.entity;

            //投影 
            if (this.options.shadow.show) {
                if (this.options.shadow.type == "wall") this.addWallShading();else if (this.options.shadow.type == "cylinder") this.addCylinderShading();
            }

            this.viewer.scene.preRender.addEventListener(this.preRender_eventHandler, this);
        }

        //实时监控事件

    }, {
        key: "preRender_eventHandler",
        value: function preRender_eventHandler(e) {
            if (!this._isStart || this.entity == null) return;

            //视角处理
            switch (this.options.camera.type) {
                default:
                    //无 
                    if (this.viewer.trackedEntity != undefined) this.viewer.trackedEntity = undefined;
                    break;
                case "gs":
                    //跟随视角
                    if (this.viewer.trackedEntity != this.entity) this.viewer.trackedEntity = this.entity;
                    break;
                case "dy":
                    //锁定第一视角
                    if (this.viewer.trackedEntity != this.entity) this.viewer.trackedEntity = this.entity;

                    this.getModelMatrix(this.viewer.trackedEntity, this.viewer.clock.currentTime, scratch);

                    var transformX = this.options.camera.followedX; //距离运动点的距离（后方） 
                    var transformZ = this.options.camera.followedZ; //距离运动点的高度（上方）
                    this.viewer.scene.camera.lookAtTransform(scratch, new Cesium.Cartesian3(-transformX, 0, transformZ));

                    break;
                case "sd":
                    //锁定上帝视角 
                    if (this.viewer.trackedEntity != this.entity) this.viewer.trackedEntity = this.entity;

                    this.getModelMatrix(this.viewer.trackedEntity, this.viewer.clock.currentTime, scratch);

                    var transformZ = this.options.camera.followedZ; //距离运动点的高度（上方）
                    this.viewer.scene.camera.lookAtTransform(scratch, new Cesium.Cartesian3(-1, 0, transformZ));
                    break;
            }

            //当前点
            var position = Cesium.Property.getValueOrUndefined(this.entity.position, this.viewer.clock.currentTime, positionScratch);
            if (position) {
                //实时监控
                this.realTime(position);
            }
        }
    }, {
        key: "realTime",
        value: function realTime(position) {
            var time = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.viewer.clock.startTime); //已飞行时间
            var point = DiitEarth.point.formatPositon(position);
            var flyOk = this.getFlyOkPoints(position);

            this.timeinfo = {
                time: time, //已飞行时间
                len: flyOk.len, //已飞行距离
                x: point.x,
                y: point.y,
                z: point.z
            };

            if (this.options.shadow.show && this.options.shadow.type == "wall") {
                //投影 
                this.updateWallShading(flyOk.positions);
            }

            //求概略的 地面海拔 和 离地高度
            var carto = Cesium.Cartographic.fromCartesian(position);
            var heightTerrain = this.viewer.scene.globe.getHeight(carto); //地形高度
            if (heightTerrain != null && heightTerrain > 0) {
                this.timeinfo.hbgd = heightTerrain;
                this.timeinfo.ldgd = point.z - heightTerrain;
            }

            //求准确的 地面海拔 和 离地高度 (没有此需求时可以关闭，提高效率)
            if (this.options.showGroundHeight) {
                var that = this;
                DiitEarth.util.terrainPolyline({
                    viewer: that.viewer,
                    positions: [position, position],
                    calback: function calback(raisedPositions, noHeight) {
                        if (raisedPositions == null || raisedPositions.length == 0 || noHeight) {
                            return;
                        }

                        var hbgd = DiitEarth.point.formatPositon(raisedPositions[0]).z; //地面高程      
                        var ldgd = point.z - hbgd; //离地高度

                        this.timeinfo.hbgd = hbgd;
                        this.timeinfo.ldgd = ldgd;

                        if (this.entity.label) {
                            var fxgd_str = haoutil.str.formatLength(this.timeinfo.z);
                            var ldgd_str = haoutil.str.formatLength(this.timeinfo.ldgd);
                            this.entity.label.text = this.name + "\n" + "漫游高程：" + fxgd_str + "\n离地距离：" + ldgd_str;
                        }
                    }
                });
            }
        }

        //获取已飞行完成的点

    }, {
        key: "getFlyOkPoints",
        value: function getFlyOkPoints(position) {
            var arrnew = [];
            var alllen = 0;

            var thistime = this.viewer.clock.currentTime;
            var arr = this.arrLinePoint;
            for (var i = 0, length = arr.length; i < length; i++) {
                var item = arr[i];
                if (Cesium.JulianDate.compare(thistime, item.time) < 0) {
                    var len = Cesium.Cartesian3.distance(position, i == 0 ? item : arr[i - 1]);
                    alllen += len;
                    break;
                }
                if (i > 0) {
                    var len = Cesium.Cartesian3.distance(item, arr[i - 1]);
                    alllen += len;
                }
                arrnew.push(item);
            }
            arrnew.push(position);

            return {
                positions: arrnew,
                len: alllen
            };
        }

        //锁定视角计算

    }, {
        key: "getModelMatrix",
        value: function getModelMatrix(entity, time, result) {
            if (entity == null) return result;

            var position = Cesium.Property.getValueOrUndefined(entity.position, time, positionScratch);
            if (!Cesium.defined(position)) {
                return undefined;
            }

            var orientation = Cesium.Property.getValueOrUndefined(entity.orientation, time, orientationScratch);
            if (!Cesium.defined(orientation)) {
                result = Cesium.Transforms.eastNorthUpToFixedFrame(position, undefined, result);
            } else {
                result = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch), position, result);
            }
            return result;
        }

        //wall投影

    }, {
        key: "addWallShading",
        value: function addWallShading() {
            this._wall_positions = [];
            this._wall_minimumHeights = [];
            this._wall_maximumHeights = [];

            var that = this;
            var wallattr = DiitEarth.draw.attr.wall.style2Entity(this.options.shadow);
            wallattr.minimumHeights = new Cesium.CallbackProperty(function (time) {
                return that._wall_minimumHeights;
            }, false);
            wallattr.maximumHeights = new Cesium.CallbackProperty(function (time) {
                return that._wall_maximumHeights;
            }, false);
            wallattr.positions = new Cesium.CallbackProperty(function (time) {
                var position = Cesium.Property.getValueOrUndefined(that.entity.position, that.viewer.clock.currentTime, positionScratch);
                that._wall_positions[that._wall_positions.length - 1] = position;

                return that._wall_positions;
            }, false);

            this.wallEntity = this.viewer.entities.add({
                wall: wallattr
            });
        }
    }, {
        key: "updateWallShading",
        value: function updateWallShading(positions) {
            var newposition = [];
            var minimumHeights = [];
            var maximumHeights = [];
            for (var i = 0; i < positions.length; i++) {
                newposition.push(positions[i].clone());
                var carto = Cesium.Cartographic.fromCartesian(positions[i]);
                minimumHeights.push(0);
                maximumHeights.push(carto.height);
            }
            this._wall_positions = newposition;
            this._wall_minimumHeights = minimumHeights;
            this._wall_maximumHeights = maximumHeights;
        }

        //圆锥 投影

    }, {
        key: "addCylinderShading",
        value: function addCylinderShading() {
            var bottomRadiusNow = 100;
            var lengthNow = 100;

            var property = this.property;

            var wallattr = DiitEarth.draw.attr.wall.style2Entity(this.options.shadow); //主要是颜色值等属性
            wallattr.length = new Cesium.CallbackProperty(function (time) {
                return lengthNow;
            }, false);
            wallattr.topRadius = 0;
            wallattr.bottomRadius = new Cesium.CallbackProperty(function (time) {
                return bottomRadiusNow;
            }, false);
            wallattr.numberOfVerticalLines = 0;

            this.cylinderEntity = viewer.entities.add({
                position: new Cesium.CallbackProperty(function (time) {
                    var position = Cesium.Property.getValueOrUndefined(property, time, new Cesium.Cartesian3());
                    var car = Cesium.Cartographic.fromCartesian(position);
                    var newPoint = Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, car.height / 2);

                    lengthNow = car.height;
                    bottomRadiusNow = lengthNow * 0.3; //地面圆半径

                    return newPoint;
                }, false),
                cylinder: wallattr
            });
        }

        //获取剖面数据

    }, {
        key: "getTerrainHeight",
        value: function getTerrainHeight(_calback) {
            var that = this;
            var positions = this.arrLinePoint;

            var alllen = 0;
            var arrLength = [];
            var arrHbgd = [];
            var arrFxgd = [];
            var arrPoint = [];

            var index = 0;
            function getLineFD() {
                index++;

                var arr = [positions[index - 1], positions[index]];
                DiitEarth.util.terrainPolyline({
                    viewer: that.viewer,
                    positions: arr,
                    calback: function calback(raisedPositions, noHeight) {

                        var h1 = positions[index - 1].lonlat[2];
                        var h2 = positions[index].lonlat[2];
                        var hstep = (h2 - h1) / raisedPositions.length;

                        for (var i = 0; i < raisedPositions.length; i++) {
                            //已飞行长度
                            if (i != 0) {
                                alllen += Cesium.Cartesian3.distance(raisedPositions[i], raisedPositions[i - 1]);
                            }
                            arrLength.push(Number(alllen.toFixed(1)));

                            //坐标
                            var point = DiitEarth.point.formatPositon(raisedPositions[i]);
                            arrPoint.push(point);

                            //海拔高度
                            var hbgd = noHeight ? 0 : point.z;
                            arrHbgd.push(hbgd);

                            //飞行高度
                            var fxgd = Number((h1 + hstep * i).toFixed(1));
                            arrFxgd.push(fxgd);
                        }

                        if (index >= positions.length - 1) {
                            _calback({
                                arrLength: arrLength,
                                arrFxgd: arrFxgd,
                                arrHbgd: arrHbgd,
                                arrPoint: arrPoint
                            });
                        } else {
                            getLineFD();
                        }
                    }
                });
            }
            getLineFD();
        }
    }, {
        key: "toGeoJSON",
        value: function toGeoJSON() {
            return this.options;
        }
    }, {
        key: "toCZML",
        value: function toCZML() {
            var attr = this.options;

            //时间
            var currentTime = this.startTime.toString();
            var stopTime = this.stopTime.toString();

            //路径位置点
            var cartographicDegrees = [];
            var arrLinePoint = this.arrLinePoint;
            for (var i = 0, length = arrLinePoint.length; i < length; i++) {
                var item = arrLinePoint[i];

                cartographicDegrees.push(item.second);
                cartographicDegrees = cartographicDegrees.concat(item.lonlat);
            }

            var czmlLine = {
                "id": this.name,
                "description": this.options.remark,
                "availability": currentTime + "/" + stopTime,
                "orientation": { //方向
                    "velocityReference": "#position"
                },
                "position": { //位置 
                    "epoch": currentTime,
                    "cartographicDegrees": cartographicDegrees,
                    "interpolationAlgorithm": "LAGRANGE", //插值时使用的插值算法,有效值为“LINEAR”，“LAGRANGE”和“HERMITE”。
                    "interpolationDegree": 2 //插值时使用的插值程度。
                }
            };

            if (this.options.label.show) {
                //是否显示注记
                czmlLine.label = {
                    "show": true,
                    "outlineWidth": 2,
                    "text": this.name,
                    "font": "12pt 微软雅黑 Console",
                    "outlineColor": { "rgba": [0, 0, 0, 255] },
                    "horizontalOrigin": "LEFT",
                    "fillColor": { "rgba": [213, 255, 0, 255] }
                };
            }
            if (this.options.path.show) {
                //是否显示路线
                czmlLine.path = { //路线
                    "show": true,
                    "material": { "solidColor": { "color": { "rgba": [255, 0, 0, 255] } } },
                    "width": 5,
                    "resolution": 1,
                    "leadTime": 0,
                    "trailTime": this.alltimes
                };
            }
            //漫游对象(模型)
            if (this.options.model.show) {
                //是否显示模型
                czmlLine.model = this.options.model;
            }

            var czml = [{
                "version": "1.0",
                "id": "document",
                "clock": {
                    "interval": currentTime + "/" + stopTime,
                    "currentTime": currentTime,
                    "multiplier": 1
                }
            }, czmlLine];
            return czml;
        }
    }, {
        key: "stop",
        value: function stop() {
            this.viewer.trackedEntity = undefined;
            this.viewer.scene.preRender.removeEventListener(this.preRender_eventHandler, this);

            this._isStart = false;
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.stop();

            if (this.entity) {
                this.viewer.entities.remove(this.entity);
                delete this.entity;
            }
            if (this.wallEntity) {
                this.viewer.entities.remove(this.wallEntity);
                delete this.wallEntity;
            }
            if (this.cylinderEntity) {
                this.viewer.entities.remove(this.cylinderEntity);
                delete this.cylinderEntity;
            }
        }
    }]);

    return FlyLine;
}();

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TilesEditor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// 类
var TilesEditor = exports.TilesEditor = function () {
    //========== 构造方法 ========== 
    function TilesEditor(viewer, options) {
        _classCallCheck(this, TilesEditor);

        //必须的参数
        this.viewer = viewer;
        this.scene = this.viewer.scene;

        this.options = options;
        this.position = options.position;
        this.heading = options.heading || 0;
        this.range = options.range || 100;

        this.dragging = false;
        this.rotating = false;
        this.enable = false;

        this.billboards = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

        //用来平移位置的指示器
        this.movep = this.billboards.add({
            position: this.position,
            color: new Cesium.Color.fromCssColorString("#FFFF00"),
            image: options.moveImg,
            show: false,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
        //用来旋转的指示器
        this.rotatep = this.billboards.add({
            position: this.position ? this.rotationPos() : null,
            color: new Cesium.Color.fromCssColorString("#FFFF00"),
            image: options.rotateImg,
            show: false,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
    }

    //========== 对外属性 ==========  
    // //裁剪距离 
    // get distance() {
    //     return this._distance || 0;
    // }
    // set distance(val) {
    //     this._distance = val; 
    // }

    //========== 方法 ========== 

    _createClass(TilesEditor, [{
        key: "update",
        value: function update(opts) {
            for (var key in opts) {
                this[key] = opts[key];
            }

            this.movep.position = this.position;
            this.rotatep.position = this.rotationPos();
        }

        //获取当前矩阵

    }, {
        key: "modelMatrix",
        value: function modelMatrix() {
            var mat = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
            var rotationX = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(this.heading));
            Cesium.Matrix4.multiply(mat, rotationX, mat);

            //比例变换
            if (this.scale > 0 && this.scale != 1) Cesium.Matrix4.multiplyByUniformScale(mat, this.scale, mat);

            //垂直轴变换
            if (this.axis && this.axis != "") {
                var rightaxis;
                switch (this.axis.toUpperCase()) {
                    case "Y_UP_TO_Z_UP":
                        rightaxis = Cesium.Axis.Y_UP_TO_Z_UP;
                        break;
                    case "Z_UP_TO_Y_UP":
                        rightaxis = Cesium.Axis.Z_UP_TO_Y_UP;
                        break;
                    case "X_UP_TO_Z_UP":
                        rightaxis = Cesium.Axis.X_UP_TO_Z_UP;
                        break;
                    case "Z_UP_TO_X_UP":
                        rightaxis = Cesium.Axis.Z_UP_TO_X_UP;
                        break;
                    case "X_UP_TO_Y_UP":
                        rightaxis = Cesium.Axis.X_UP_TO_Y_UP;
                        break;
                    case "Y_UP_TO_X_UP":
                        rightaxis = Cesium.Axis.Y_UP_TO_X_UP;
                        break;
                }
                if (rightaxis) mat = Cesium.Matrix4.multiplyTransformation(mat, rightaxis, mat);
            }
            return mat;
        }

        //依据位置和朝向计算 旋转的位置

    }, {
        key: "rotationPos",
        value: function rotationPos() {
            var rotpos = new Cesium.Cartesian3(this.range, 0.0, 0.0);
            //依据位置和朝向计算 旋转矩阵  
            var mat = Cesium.Matrix4.getRotation(this.modelMatrix(), new Cesium.Matrix3());

            rotpos = Cesium.Matrix3.multiplyByVector(mat, rotpos, rotpos);
            rotpos = Cesium.Cartesian3.add(this.position, rotpos, rotpos);
            return rotpos;
        }
    }, {
        key: "pickTerrain",
        value: function pickTerrain(wndpos) {
            var ray = this.viewer.camera.getPickRay(wndpos);
            var pos = this.viewer.scene.globe.pick(ray, this.viewer.scene);
            return pos;
        }
    }, {
        key: "setEnable",
        value: function setEnable(v) {
            if (v) {
                var self = this;
                this.handler.setInputAction(function (p) {
                    self.handler_onLeafDown(p);
                }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                this.handler.setInputAction(function (p) {
                    self.handler_onMouseMove(p);
                }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.handler.setInputAction(function (p) {
                    self.handler_onLeftUp(p);
                }, Cesium.ScreenSpaceEventType.LEFT_UP);

                this.rotatep.show = true;
                this.movep.show = true;
            } else {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);

                this.rotatep.show = false;
                this.movep.show = false;
            }
            this._enable = false;
        }
    }, {
        key: "handler_onLeafDown",
        value: function handler_onLeafDown(event) {
            var pickedObjects = this.scene.drillPick(event.position, 2);

            for (var i = 0; i < pickedObjects.length; i++) {
                var pickedObject = pickedObjects[i];

                if (Cesium.defined(pickedObject) && pickedObject.primitive === this.movep) {
                    this.dragging = true;
                    this.scene.screenSpaceCameraController.enableRotate = false;
                    break;
                } else if (Cesium.defined(pickedObject) && pickedObject.primitive === this.rotatep) {
                    this.rotating = true;
                    this.scene.screenSpaceCameraController.enableRotate = false;
                    break;
                }
            }
        }
    }, {
        key: "handler_onMouseMove",
        value: function handler_onMouseMove(event) {
            var position = this.pickTerrain(event.endPosition);
            if (!position) return;

            if (this.dragging) {
                this.position = position;
                this.movep.position = this.position;
                this.rotatep.position = this.rotationPos();

                if (this.options.onPosition) {
                    this.options.onPosition(this.position);
                }
            } else if (this.rotating) {
                this.rotatep.position = position;
                this.range = Cesium.Cartesian3.distance(this.position, position);

                //获取该位置的默认矩阵 
                var mat = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
                mat = Cesium.Matrix4.getRotation(mat, new Cesium.Matrix3());

                var xaxis = Cesium.Matrix3.getColumn(mat, 0, new Cesium.Cartesian3());
                var yaxis = Cesium.Matrix3.getColumn(mat, 1, new Cesium.Cartesian3());
                var zaxis = Cesium.Matrix3.getColumn(mat, 2, new Cesium.Cartesian3());
                //计算该位置 和  position 的 角度值
                var dir = Cesium.Cartesian3.subtract(position, this.position, new Cesium.Cartesian3());
                //z crosss (dirx cross z) 得到在 xy平面的向量
                dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
                dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
                dir = Cesium.Cartesian3.normalize(dir, dir);

                this.heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

                var ay = Cesium.Cartesian3.angleBetween(yaxis, dir);
                if (ay > Math.PI * 0.5) {
                    this.heading = 2 * Math.PI - this.heading;
                }
                if (this.options.onHeading) {
                    this.options.onHeading(this.heading);
                }
            }
        }
    }, {
        key: "handler_onLeftUp",
        value: function handler_onLeftUp(event) {
            if (this.dragging || this.rotating) {
                this.rotating = this.dragging = false;
                this.scene.screenSpaceCameraController.enableRotate = true;
                //如果没有这句话 会导致billboards的某些没有刷新，无法再次点击
                this.billboards._createVertexArray = true;
            }
        }
    }, {
        key: "remove",
        value: function remove() {
            //从场景中移除
            if (this.billboards) {
                this.scene.primitives.remove(this.billboards);
                this.billboards = undefined;
            }
            this.enable = false;
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.remove();
            this.handler.destroy();
            this.handler = null;
            this.viewer = null;
        }
    }]);

    return TilesEditor;
}();

/***/ }),
/* 100 */
/***/ (function(module, exports) {

module.exports = "uniform sampler2D colorTexture;\r\nvarying vec2 v_textureCoordinates;\r\n\r\nfloat hash(float x){\r\n    return fract(sin(x*133.3)*13.13);\r\n}\r\n\r\nvoid main(void){ \r\n    float time = czm_frameNumber / 240.0;\r\n    vec2 resolution = czm_viewport.zw;\r\n\r\n    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\r\n    vec3 c=vec3(.6,.7,.8);\r\n\r\n    float a=-.4;\r\n    float si=sin(a),co=cos(a);\r\n    uv*=mat2(co,-si,si,co);\r\n    uv*=length(uv+vec2(0,4.9))*.3+1.;\r\n\r\n    float v=1.-sin(hash(floor(uv.x*100.))*2.);\r\n    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\r\n    c*=v*b; \r\n\r\n    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \r\n}\r\n                        "

/***/ }),
/* 101 */
/***/ (function(module, exports) {

module.exports = "uniform sampler2D colorTexture;\r\nvarying vec2 v_textureCoordinates;\r\n\r\nfloat snow(vec2 uv,float scale){\r\n    float time = czm_frameNumber / 60.0;\r\n    float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\r\n    uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\r\n    uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\r\n    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\r\n    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\r\n    return k*w;\r\n}\r\n\r\nvoid main(void){\r\n    vec2 resolution = czm_viewport.zw;\r\n    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\r\n    vec3 finalColor=vec3(0);\r\n    float c = 0.0;\r\n    // c+=snow(uv,30.)*.0;\r\n    // c+=snow(uv,20.)*.0;\r\n    // c+=snow(uv,15.)*.0;\r\n    c+=snow(uv,10.);\r\n    c+=snow(uv,8.);\r\n    c+=snow(uv,6.);\r\n    c+=snow(uv,5.);\r\n    finalColor=(vec3(c)); \r\n    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \r\n\r\n}"

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CircleFadeMaterial = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultColor = new Cesium.Color(0, 0, 0, 0);

//圆形 单个扩散效果 材质 

var CircleFadeMaterial = exports.CircleFadeMaterial = function () {
    //========== 构造方法 ========== 
    function CircleFadeMaterial(options) {
        _classCallCheck(this, CircleFadeMaterial);

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;

        this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
        this._duration = options.duration || 1000; //时长

        this._time = undefined;
    }

    //========== 对外属性 ==========  


    _createClass(CircleFadeMaterial, [{
        key: 'getType',


        //========== 方法 ========== 
        /**
         * Gets the {@link Cesium.Material} type at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the type.
         * @returns {String} The type of material.
         */
        value: function getType(time) {
            return Cesium.Material.CircleFadeMaterialType;
        }

        /**
         * Gets the value of the property at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the value.
         * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
         * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
         */

    }, {
        key: 'getValue',
        value: function getValue(time, result) {
            if (!Cesium.defined(result)) {
                result = {};
            }
            result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);

            if (this._time === undefined) {
                this._time = new Date().getTime();
            }
            result.time = (new Date().getTime() - this._time) / this._duration;
            return result;
        }

        /**
         * Compares this property to the provided property and returns
         * <code>true</code> if they are equal, <code>false</code> otherwise.
         *
         * @param { Cesium.Property} [other] The other property.
         * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
         */

    }, {
        key: 'equals',
        value: function equals(other) {
            return this === other || //
            other instanceof CircleFadeMaterial && Cesium.Property.equals(this._color, other._color);
        }
    }, {
        key: 'isConstant',
        get: function get() {
            return false;
        }
    }, {
        key: 'definitionChanged',
        get: function get() {
            return this._definitionChanged;
        }
    }]);

    return CircleFadeMaterial;
}();

Cesium.defineProperties(CircleFadeMaterial.prototype, {
    /**
     * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
     * @memberof PolylineGlowMaterialProperty.prototype
     * @type { Cesium.Property}
     */
    color: Cesium.createPropertyDescriptor('color')
});

//静态方法，处理材质
Cesium.Material.CircleFadeMaterialType = 'CircleFadeMaterial';
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleFadeMaterialType, {
    fabric: {
        type: Cesium.Material.CircleFadeMaterialType,
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            time: 1
        },
        source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    material.diffuse = 1.5 * color.rgb;\n\
                    vec2 st = materialInput.st;\n\
                    float dis = distance(st, vec2(0.5, 0.5));\n\
                    float per = fract(time);\n\
                    if(dis > per * 0.5){\n\
                        //material.alpha = 0.0;\n\
                        discard;\n\
                    }else {\n\
                            material.alpha = color.a  * dis / per / 2.0;\n\
                    }\n\
                    return material;\n\
                }"
    },
    translucent: function translucent() {
        return true;
    }
});

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TextMaterial = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultColor = new Cesium.Color(0, 0, 0, 0);

var textStyles = {
    font: '50px 楷体',
    fill: true,
    fillColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
    stroke: true,
    strokeWidth: 2,
    strokeColor: new Cesium.Color(1.0, 1.0, 1.0, 0.8),
    backgroundColor: new Cesium.Color(1.0, 1.0, 1.0, 0.1),
    textBaseline: 'top',
    padding: 40
};
var repeat = new Cesium.Cartesian2(1.0, 1.0);
//文字贴图 材质

var TextMaterial = exports.TextMaterial = function () {
    //========== 构造方法 ========== 
    function TextMaterial(options) {
        _classCallCheck(this, TextMaterial);

        options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
        if (!options.text) return;
        this._text = options.text;
        this._textStyles = Cesium.defaultValue(options.textStyles, textStyles);
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
        this.repeat = Cesium.defaultValue(options.repeat, repeat);
        this._img = this._text2Img(this._text, this._textStyles);
        var _material = getImageMaterial(this._img.src, this.repeat);
        this._materialType = Cesium.clone(_material.type); //材质类型
        this._materialImage = Cesium.clone(_material.image); //材质图片
    }

    //========== 对外属性 ==========   


    _createClass(TextMaterial, [{
        key: 'getType',


        //========== 方法 ========== 

        /**
         * Gets the {@link Cesium.Material} type at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the type.
         * @returns {String} The type of material.
         */
        value: function getType(time) {
            return this._materialType;
        }

        /**
         * Gets the value of the property at the provided time.
         *
         * @param {JulianDate} time The time for which to retrieve the value.
         * @param {Object} [result] The object to store the value into, if omitted, a new instance is created and returned.
         * @returns {Object} The modified result parameter or a new instance if the result parameter was not supplied.
         */

    }, {
        key: 'getValue',
        value: function getValue(time, result) {
            if (!Cesium.defined(result)) {
                result = {};
            }
            result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
            result.image = this._materialImage;
            result.repeat = this.repeat;
            return result;
        }

        /**
         * Compares this property to the provided property and returns
         * <code>true</code> if they are equal, <code>false</code> otherwise.
         *
         * @param {Cesium.Property} [other] The other property.
         * @returns {Boolean} <code>true</code> if left and right are equal, <code>false</code> otherwise.
         */

    }, {
        key: 'equals',
        value: function equals(other) {
            return this === other || //
            other instanceof TextMaterial && Cesium.Property.equals(this._color, other._color);
        }
    }, {
        key: '_text2Img',
        value: function _text2Img(text, styles) {
            //opts.type   img/png
            var canvas = Cesium.writeTextToCanvas(text, styles);
            if (!canvas) return;
            this.canvas = canvas;
            var img = new Image();
            img.src = canvas.toDataURL("image/png");
            return img;
        }
    }, {
        key: 'isConstant',
        get: function get() {
            return false;
        }
    }, {
        key: 'definitionChanged',
        get: function get() {
            return this._definitionChanged;
        }
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        },
        set: function set(val) {
            if (!val) return;
            this._text = val;
            delete this._img;
            this._img = this._text2Img(this._text, this._textStyles);
            var _material = getImageMaterial(this._img.src, this.repeat);
            this._materialType = Cesium.clone(_material.type); //材质类型
            this._materialImage = Cesium.clone(_material.image); //材质图片
        }
    }, {
        key: 'textStyles',
        get: function get() {
            return this._textStyles;
        },
        set: function set(val) {
            if (!val) return;
            delete this._img;
            this._textStyles = val;
            this._img = this._text2Img(this._text, this._textStyles);
            var _material = getImageMaterial(this._img.src, this.repeat);
            this._materialType = Cesium.clone(_material.type); //材质类型
            this._materialImage = Cesium.clone(_material.image); //材质图片
        }
    }]);

    return TextMaterial;
}();

Cesium.defineProperties(TextMaterial.prototype, {
    /**
     * Gets or sets the Cesium.Property specifying the {@link Cesium.Color} of the line.
     * @memberof PolylineGlowMaterialProperty.prototype
     * @type {Cesium.Property}
     */
    color: Cesium.createPropertyDescriptor('color')
});

//静态方法，处理材质
var cacheIdx = 0;
var nameEx = "Text";
function getImageMaterial(imgurl, repeat) {
    cacheIdx++;
    var typeName = nameEx + cacheIdx + "Type";
    var imageName = nameEx + cacheIdx + "Image";

    Cesium.Material[typeName] = typeName;
    Cesium.Material[imageName] = imgurl;

    Cesium.Material._materialCache.addMaterial(Cesium.Material[typeName], {
        fabric: {
            type: Cesium.Material.PolylineArrowLinkType,
            uniforms: {
                color: new Cesium.Color(1, 0, 0, 1.0),
                image: Cesium.Material[imageName],
                time: 0,
                repeat: repeat || new Cesium.Cartesian2(1.0, 1.0)
            },
            source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                        {\n\
                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                            vec2 mst = fract(materialInput.st + vec2(.0,.0));\n\
                            mst = vec2(mst.x,mst.y);\n\
                            vec2 st = fract(repeat * mst);\n\
                            vec4 colorImage = texture2D(image, st);\n\
                            if(color.a == 0.0)\n\
                            {\n\
                                material.alpha = colorImage.a;\n\
                                material.diffuse = colorImage.rgb; \n\
                            }\n\
                            else\n\
                            {\n\
                                material.alpha = colorImage.a * color.a;\n\
                                material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n\
                            }\n\
                            return material;\n\
                        }"
        },
        translucent: function translucent() {
            return true;
        }
    });

    return {
        type: Cesium.Material[typeName],
        image: Cesium.Material[imageName]
    };
}

/***/ }),
/* 104 */
/***/ (function(module, exports) {

module.exports = "attribute vec4 position;\r\nattribute vec3 normal;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvoid main()\r\n{\r\n    gl_Position = czm_modelViewProjection * position;\r\n    v_position = vec3(position);\r\n    v_positionWC = (czm_model * position).xyz;\r\n    v_positionEC = (czm_modelView * position).xyz;\r\n    v_normalEC = czm_normal * normal;\r\n}"

/***/ }),
/* 105 */
/***/ (function(module, exports) {

module.exports = "#ifdef GL_OES_standard_derivatives\r\n    #extension GL_OES_standard_derivatives : enable\r\n#endif\r\n\r\nuniform bool u_showIntersection;\r\nuniform bool u_showThroughEllipsoid;\r\n\r\nuniform float u_radius;\r\nuniform float u_xHalfAngle;\r\nuniform float u_yHalfAngle;\r\nuniform float u_normalDirection;\r\nuniform float u_type;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvec4 getColor(float sensorRadius, vec3 pointEC)\r\n{\r\n    czm_materialInput materialInput;\r\n\r\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\r\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\r\n    materialInput.str = pointMC / sensorRadius;\r\n\r\n    vec3 positionToEyeEC = -v_positionEC;\r\n    materialInput.positionToEyeEC = positionToEyeEC;\r\n\r\n    vec3 normalEC = normalize(v_normalEC);\r\n    materialInput.normalEC = u_normalDirection * normalEC;\r\n\r\n    czm_material material = czm_getMaterial(materialInput);\r\n\r\n    return mix(czm_phong(normalize(positionToEyeEC), material), vec4(material.diffuse, material.alpha), 0.4);\r\n\r\n}\r\n\r\nbool isOnBoundary(float value, float epsilon)\r\n{\r\n    float width = getIntersectionWidth();\r\n    float tolerance = width * epsilon;\r\n\r\n#ifdef GL_OES_standard_derivatives\r\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\r\n    float pixels = width * delta;\r\n    float temp = abs(value);\r\n    // There are a couple things going on here.\r\n    // First we test the value at the current fragment to see if it is within the tolerance.\r\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\r\n    // but we don't want to admit points that are obviously not on the surface.\r\n    // For example, if we are looking for \"value\" to be close to 0, but value is 1 and the adjacent value is 2,\r\n    // then the delta would be 1 and \"temp - delta\" would be \"1 - 1\" which is zero even though neither of\r\n    // the points is close to zero.\r\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\r\n#else\r\n    return abs(value) < tolerance;\r\n#endif\r\n}\r\n\r\nvec4 shade(bool isOnBoundary)\r\n{\r\n    if (u_showIntersection && isOnBoundary)\r\n    {\r\n        return getIntersectionColor();\r\n    }\r\n    if(u_type == 1.0){\r\n        return getLineColor();\r\n    }\r\n    return getColor(u_radius, v_positionEC);\r\n}\r\n\r\nfloat ellipsoidSurfaceFunction(czm_ellipsoid ellipsoid, vec3 point)\r\n{\r\n    vec3 scaled = ellipsoid.inverseRadii * point;\r\n    return dot(scaled, scaled) - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\r\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\r\n\r\n    //vec3 pixDir = normalize(v_position);\r\n    float positionX = v_position.x;\r\n    float positionY = v_position.y;\r\n    float positionZ = v_position.z;\r\n\r\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\r\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\r\n    vec3 lineY = vec3(0, positionY, positionZ);\r\n    float resX = dot(normalize(lineX), zDir);\r\n    if(resX < cos(u_xHalfAngle)-0.00001){\r\n        discard;\r\n    }\r\n    float resY = dot(normalize(lineY), zDir);\r\n    if(resY < cos(u_yHalfAngle)-0.00001){\r\n        discard;\r\n    }\r\n\r\n\r\n    czm_ellipsoid ellipsoid = czm_getWgs84EllipsoidEC();\r\n    float ellipsoidValue = ellipsoidSurfaceFunction(ellipsoid, v_positionWC);\r\n\r\n    // Occluded by the ellipsoid?\r\n\tif (!u_showThroughEllipsoid)\r\n\t{\r\n\t    // Discard if in the ellipsoid\r\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\r\n\t    if (ellipsoidValue < 0.0)\r\n\t    {\r\n            discard;\r\n\t    }\r\n\r\n\t    // Discard if in the sensor's shadow\r\n\t    if (inSensorShadow(sensorVertexWC, ellipsoid, v_positionWC))\r\n\t    {\r\n\t        discard;\r\n\t    }\r\n    }\r\n\r\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\r\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\r\n    //isOnEllipsoid = false;\r\n    //if((resX >= 0.8 && resX <= 0.81)||(resY >= 0.8 && resY <= 0.81)){\r\n    /*if(false){\r\n        gl_FragColor = vec4(1.0,0.0,0.0,1.0);\r\n    }else{\r\n        gl_FragColor = shade(isOnEllipsoid);\r\n    }\r\n*/\r\n    gl_FragColor = shade(isOnEllipsoid);\r\n\r\n}"

/***/ }),
/* 106 */
/***/ (function(module, exports) {

module.exports = "uniform vec4 u_intersectionColor;\nuniform float u_intersectionWidth;\nuniform vec4 u_lineColor;\n\nbool inSensorShadow(vec3 coneVertexWC, czm_ellipsoid ellipsoidEC, vec3 pointWC)\n{\n    // Diagonal matrix from the unscaled ellipsoid space to the scaled space.    \n    vec3 D = ellipsoidEC.inverseRadii;\n\n    // Sensor vertex in the scaled ellipsoid space\n    vec3 q = D * coneVertexWC;\n    float qMagnitudeSquared = dot(q, q);\n    float test = qMagnitudeSquared - 1.0;\n    \n    // Sensor vertex to fragment vector in the ellipsoid's scaled space\n    vec3 temp = D * pointWC - q;\n    float d = dot(temp, q);\n    \n    // Behind silhouette plane and inside silhouette cone\n    return (d < -test) && (d / length(temp) < -sqrt(test));\n}\n\n///////////////////////////////////////////////////////////////////////////////\n\nvec4 getLineColor()\n{\n    return u_lineColor;\n}\n\nvec4 getIntersectionColor()\n{\n    return u_intersectionColor;\n}\n\nfloat getIntersectionWidth()\n{\n    return u_intersectionWidth;\n}\n\nvec2 sensor2dTextureCoordinates(float sensorRadius, vec3 pointMC)\n{\n    // (s, t) both in the range [0, 1]\n    float t = pointMC.z / sensorRadius;\n    float s = 1.0 + (atan(pointMC.y, pointMC.x) / czm_twoPi);\n    s = s - floor(s);\n    \n    return vec2(s, t);\n}\n"

/***/ }),
/* 107 */
/***/ (function(module, exports) {

module.exports = "#ifdef GL_OES_standard_derivatives\r\n    #extension GL_OES_standard_derivatives : enable\r\n#endif\r\n\r\nuniform bool u_showIntersection;\r\nuniform bool u_showThroughEllipsoid;\r\n\r\nuniform float u_radius;\r\nuniform float u_xHalfAngle;\r\nuniform float u_yHalfAngle;\r\nuniform float u_normalDirection;\r\nuniform vec4 u_color;\r\n\r\nvarying vec3 v_position;\r\nvarying vec3 v_positionWC;\r\nvarying vec3 v_positionEC;\r\nvarying vec3 v_normalEC;\r\n\r\nvec4 getColor(float sensorRadius, vec3 pointEC)\r\n{\r\n    czm_materialInput materialInput;\r\n\r\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\r\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\r\n    materialInput.str = pointMC / sensorRadius;\r\n\r\n    vec3 positionToEyeEC = -v_positionEC;\r\n    materialInput.positionToEyeEC = positionToEyeEC;\r\n\r\n    vec3 normalEC = normalize(v_normalEC);\r\n    materialInput.normalEC = u_normalDirection * normalEC;\r\n\r\n    czm_material material = czm_getMaterial(materialInput);\r\n\r\n    material.diffuse = u_color.rgb;\r\n    material.alpha = u_color.a;\r\n\r\n    return mix(czm_phong(normalize(positionToEyeEC), material), vec4(material.diffuse, material.alpha), 0.4);\r\n\r\n}\r\n\r\nbool isOnBoundary(float value, float epsilon)\r\n{\r\n    float width = getIntersectionWidth();\r\n    float tolerance = width * epsilon;\r\n\r\n#ifdef GL_OES_standard_derivatives\r\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\r\n    float pixels = width * delta;\r\n    float temp = abs(value);\r\n    // There are a couple things going on here.\r\n    // First we test the value at the current fragment to see if it is within the tolerance.\r\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\r\n    // but we don't want to admit points that are obviously not on the surface.\r\n    // For example, if we are looking for \"value\" to be close to 0, but value is 1 and the adjacent value is 2,\r\n    // then the delta would be 1 and \"temp - delta\" would be \"1 - 1\" which is zero even though neither of\r\n    // the points is close to zero.\r\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\r\n#else\r\n    return abs(value) < tolerance;\r\n#endif\r\n}\r\n\r\nvec4 shade(bool isOnBoundary)\r\n{\r\n    if (u_showIntersection && isOnBoundary)\r\n    {\r\n        return getIntersectionColor();\r\n    }\r\n    return getColor(u_radius, v_positionEC);\r\n}\r\n\r\nfloat ellipsoidSurfaceFunction(czm_ellipsoid ellipsoid, vec3 point)\r\n{\r\n    vec3 scaled = ellipsoid.inverseRadii * point;\r\n    return dot(scaled, scaled) - 1.0;\r\n}\r\n\r\nvoid main()\r\n{\r\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\r\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\r\n\r\n    //vec3 pixDir = normalize(v_position);\r\n    float positionX = v_position.x;\r\n    float positionY = v_position.y;\r\n    float positionZ = v_position.z;\r\n\r\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\r\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\r\n    vec3 lineY = vec3(0, positionY, positionZ);\r\n    float resX = dot(normalize(lineX), zDir);\r\n    if(resX < cos(u_xHalfAngle) - 0.0001){\r\n        discard;\r\n    }\r\n    float resY = dot(normalize(lineY), zDir);\r\n    if(resY < cos(u_yHalfAngle)- 0.0001){\r\n        discard;\r\n    }\r\n\r\n\r\n    czm_ellipsoid ellipsoid = czm_getWgs84EllipsoidEC();\r\n    float ellipsoidValue = ellipsoidSurfaceFunction(ellipsoid, v_positionWC);\r\n\r\n    // Occluded by the ellipsoid?\r\n\tif (!u_showThroughEllipsoid)\r\n\t{\r\n\t    // Discard if in the ellipsoid\r\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\r\n\t    if (ellipsoidValue < 0.0)\r\n\t    {\r\n            discard;\r\n\t    }\r\n\r\n\t    // Discard if in the sensor's shadow\r\n\t    if (inSensorShadow(sensorVertexWC, ellipsoid, v_positionWC))\r\n\t    {\r\n\t        discard;\r\n\t    }\r\n    }\r\n\r\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\r\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\r\n    gl_FragColor = shade(isOnEllipsoid);\r\n\r\n}"

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RectangularSensorVisualizer = undefined;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _RectangularSensorPrimitive = __webpack_require__(43);

var _removePrimitive = __webpack_require__(109);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AssociativeArray = Cesium.AssociativeArray;
var Cartesian3 = Cesium.Cartesian3;
var Color = Cesium.Color;
var defined = Cesium.defined;
var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var Matrix3 = Cesium.Matrix3;
var Matrix4 = Cesium.Matrix4;
var Quaternion = Cesium.Quaternion;
var MaterialProperty = Cesium.MaterialProperty;
var Property = Cesium.Property;

var matrix3Scratch = new Matrix3();
// var matrix4Scratch = new Matrix4();
var cachedPosition = new Cartesian3();
var cachedGazePosition = new Cartesian3();
var cachedOrientation = new Quaternion();
var diffVectorScratch = new Cartesian3();
var orientationScratch = new Quaternion();

var RectangularSensorVisualizer = function RectangularSensorVisualizer(scene, entityCollection) {
    // >>includeStart('debug', pragmas.debug);
    if (!defined(scene)) {
        throw new DeveloperError('scene is required.');
    }
    if (!defined(entityCollection)) {
        throw new DeveloperError('entityCollection is required.');
    }
    // >>includeEnd('debug');

    entityCollection.collectionChanged.addEventListener(RectangularSensorVisualizer.prototype._onCollectionChanged, this);

    this._scene = scene;
    this._primitives = scene.primitives;
    this._entityCollection = entityCollection;
    this._hash = {};
    this._entitiesToVisualize = new AssociativeArray();

    this._onCollectionChanged(entityCollection, entityCollection.values, [], []);
};

/**
 * Updates the primitives created by this visualizer to match their
 * Entity counterpart at the given time.
 *
 * @param {JulianDate} time The time to update to.
 * @returns {Boolean} This function always returns true.
 */
RectangularSensorVisualizer.prototype.update = function (time) {
    // >>includeStart('debug', pragmas.debug);
    if (!defined(time)) {
        throw new DeveloperError('time is required.');
    }
    // >>includeEnd('debug');

    var entities = this._entitiesToVisualize.values;
    var hash = this._hash;
    var primitives = this._primitives;

    for (var i = 0, len = entities.length; i < len; i++) {
        var entity = entities[i];
        var rectangularSensorGraphics = entity._rectangularSensor;

        var position;
        var orientation;
        var radius;
        var xHalfAngle;
        var yHalfAngle;
        var data = hash[entity.id];
        var show = entity.isShowing && entity.isAvailable(time) && Property.getValueOrDefault(rectangularSensorGraphics._show, time, true);

        if (show) {
            position = Property.getValueOrUndefined(entity._position, time, cachedPosition);
            orientation = Property.getValueOrUndefined(entity._orientation, time, cachedOrientation);
            radius = Property.getValueOrUndefined(rectangularSensorGraphics._radius, time);
            xHalfAngle = Property.getValueOrUndefined(rectangularSensorGraphics._xHalfAngle, time);
            yHalfAngle = Property.getValueOrUndefined(rectangularSensorGraphics._yHalfAngle, time);
            show = defined(position) && defined(xHalfAngle) && defined(yHalfAngle);
        }

        if (!show) {
            // don't bother creating or updating anything else
            if (defined(data)) {
                data.primitive.show = false;
            }
            continue;
        }

        var primitive = defined(data) ? data.primitive : undefined;
        if (!defined(primitive)) {
            primitive = new _RectangularSensorPrimitive.RectangularSensorPrimitive();
            primitive.id = entity;
            primitives.add(primitive);

            data = {
                primitive: primitive,
                position: undefined,
                orientation: undefined
            };
            hash[entity.id] = data;
        }

        var gaze = Property.getValueOrUndefined(rectangularSensorGraphics._gaze, time);
        if (defined(gaze)) {

            var targetPosition = Property.getValueOrUndefined(gaze._position, time, cachedGazePosition);

            if (!defined(position) || !defined(targetPosition)) {
                continue;
            }

            var diffVector = Cartesian3.subtract(position, targetPosition, diffVectorScratch);
            var rotate = Cartesian3.angleBetween(Cesium.Cartesian3.UNIT_Z, diffVector);
            var cross = Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, diffVector, diffVectorScratch);
            var orientation = Quaternion.fromAxisAngle(cross, rotate - Math.PI, orientationScratch);

            //replace original radius
            radius = Cartesian3.distance(position, targetPosition);
            primitive.modelMatrix = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch), position, primitive.modelMatrix);
        } else {
            if (!Cartesian3.equals(position, data.position) || !Quaternion.equals(orientation, data.orientation)) {
                if (defined(orientation)) {
                    primitive.modelMatrix = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch), position, primitive.modelMatrix);
                    data.position = Cartesian3.clone(position, data.position);
                    data.orientation = Quaternion.clone(orientation, data.orientation);
                } else {
                    primitive.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
                    data.position = Cartesian3.clone(position, data.position);
                }
            }
        }

        primitive.show = true;
        primitive.gaze = gaze;
        primitive.radius = radius;
        primitive.xHalfAngle = xHalfAngle;
        primitive.yHalfAngle = yHalfAngle;
        primitive.lineColor = Property.getValueOrDefault(rectangularSensorGraphics._lineColor, time, Color.WHITE);
        primitive.showSectorLines = Property.getValueOrDefault(rectangularSensorGraphics._showSectorLines, time, true);
        primitive.showSectorSegmentLines = Property.getValueOrDefault(rectangularSensorGraphics._showSectorSegmentLines, time, true);
        primitive.showLateralSurfaces = Property.getValueOrDefault(rectangularSensorGraphics._showLateralSurfaces, time, true);
        primitive.material = MaterialProperty.getValue(time, rectangularSensorGraphics._material, primitive.material);
        primitive.showDomeSurfaces = Property.getValueOrDefault(rectangularSensorGraphics._showDomeSurfaces, time, true);
        primitive.showDomeLines = Property.getValueOrDefault(rectangularSensorGraphics._showDomeLines, time, true);
        primitive.showIntersection = Property.getValueOrDefault(rectangularSensorGraphics._showIntersection, time, true);
        primitive.intersectionColor = Property.getValueOrDefault(rectangularSensorGraphics._intersectionColor, time, Color.WHITE);
        primitive.intersectionWidth = Property.getValueOrDefault(rectangularSensorGraphics._intersectionWidth, time, 1);
        primitive.showThroughEllipsoid = Property.getValueOrDefault(rectangularSensorGraphics._showThroughEllipsoid, time, true);
        primitive.scanPlaneMode = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneMode, time);
        primitive.scanPlaneColor = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneColor, time, Color.WHITE);
        primitive.showScanPlane = Property.getValueOrDefault(rectangularSensorGraphics._showScanPlane, time, true);
        primitive.scanPlaneRate = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneRate, time, 1);
    }
    return true;
};

/**
 * Returns true if this object was destroyed; otherwise, false.
 *
 * @returns {Boolean} True if this object was destroyed; otherwise, false.
 */
RectangularSensorVisualizer.prototype.isDestroyed = function () {
    return false;
};

/**
 * Removes and destroys all primitives created by this instance.
 */
RectangularSensorVisualizer.prototype.destroy = function () {
    var entities = this._entitiesToVisualize.values;
    var hash = this._hash;
    var primitives = this._primitives;
    for (var i = entities.length - 1; i > -1; i--) {
        (0, _removePrimitive.removePrimitive)(entities[i], hash, primitives);
    }
    return destroyObject(this);
};

/**
 * @private
 */
RectangularSensorVisualizer.prototype._onCollectionChanged = function (entityCollection, added, removed, changed) {
    var i;
    var entity;
    var entities = this._entitiesToVisualize;
    var hash = this._hash;
    var primitives = this._primitives;

    for (i = added.length - 1; i > -1; i--) {
        entity = added[i];
        if (defined(entity._rectangularSensor) && defined(entity._position)) {
            entities.set(entity.id, entity);
        }
    }

    for (i = changed.length - 1; i > -1; i--) {
        entity = changed[i];
        if (defined(entity._rectangularSensor) && defined(entity._position)) {
            entities.set(entity.id, entity);
        } else {
            (0, _removePrimitive.removePrimitive)(entity, hash, primitives);
            entities.remove(entity.id);
        }
    }

    for (i = removed.length - 1; i > -1; i--) {
        entity = removed[i];
        (0, _removePrimitive.removePrimitive)(entity, hash, primitives);
        entities.remove(entity.id);
    }
};

exports.RectangularSensorVisualizer = RectangularSensorVisualizer;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removePrimitive = removePrimitive;

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function removePrimitive(entity, hash, primitives) {
    var data = hash[entity.id];
    if (Cesium.defined(data)) {
        var primitive = data.primitive;
        try {
            primitives.remove(primitive);
        } catch (e) {}
        if (primitive.isDestroyed && !primitive.isDestroyed()) {
            primitive.destroy();
        }
        delete hash[entity.id];
    }
};

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TerrainClipPlan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//   地形开挖 类
var TerrainClipPlan = exports.TerrainClipPlan = function () {
    //========== 构造方法 ========== 
    function TerrainClipPlan(viewer, options) {
        _classCallCheck(this, TerrainClipPlan);

        this.viewer = viewer;
        this.options = options || {};

        this._positions = options.positions;
        this._height = this.options.height || 0;
        this.bottomImg = options.bottomImg;
        this.wallImg = options.wallImg;
        this.splitNum = Cesium.defaultValue(options.splitNum, 50);

        if (this._positions && this._positions.length > 0) {
            this.updateData(this._positions);
        }
    }

    //========== 对外属性 ==========  
    //挖掘深度


    _createClass(TerrainClipPlan, [{
        key: 'updateData',


        //========== 方法 ========== 

        // 创建裁剪面
        value: function updateData(points) {
            this.clear();

            // this._last_depthTestAgainstTerrain = this.viewer.scene.globe.depthTestAgainstTerrain;
            // this.viewer.scene.globe.depthTestAgainstTerrain = true;
 

            // var newArr = [];
            var clippingPlanes = [];
            var pointsLength = points.length;

            var cartesian3 = new Cesium.Cartesian3();

            // var direction = Cesium.Cartesian3.subtract(points[0], points[1], cartesian3); //方向： 
            // direction = direction.x > 0; //是否顺时针
 
            function getAngle(firstPoint, endPoints) {
                var carto1 = Cesium.Cartographic.fromCartesian(firstPoint);
                var carto2 = Cesium.Cartographic.fromCartesian(endPoints);
            
                var pt1 = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [Cesium.Math.toDegrees(carto1.longitude), Cesium.Math.toDegrees(carto1.latitude), carto1.height]
                    }
                }
                var pt2 = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [Cesium.Math.toDegrees(carto2.longitude), Cesium.Math.toDegrees(carto2.latitude), carto2.height]
                    }
                }
                //API: http://turfjs.org/docs/#rhumbBearing
                var bearing = Math.round(turf.rhumbBearing(pt1, pt2));
                return bearing;
            }

            //是否顺时针 
            var startAngle = getAngle(points[0], points[1]);
            var endAngle = getAngle(points[0], points[2]);
            var direction = startAngle < endAngle;

            this.excavateMinHeight = 9999;

            for (var i = 0; i < pointsLength; ++i) {
                var nextIndex = (i + 1) % pointsLength;
                var midpoint = Cesium.Cartesian3.midpoint(points[i], points[nextIndex], new Cesium.Cartesian3());

                var tempCarto = Cesium.Cartographic.fromCartesian(points[i]);
                var heightTerrain = viewer.scene.globe.getHeight(tempCarto) || tempCarto.height; //地形高度 
                if (heightTerrain < this.excavateMinHeight) {
                    this.excavateMinHeight = heightTerrain;
                }

                // newArr.push(points[i]);
                // newArr.push(midpoint);

                var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
                var right;
                if (direction) {
                    //顺时针
                    right = Cesium.Cartesian3.subtract(points[i], midpoint, new Cesium.Cartesian3());
                } else {
                    right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
                }
                right = Cesium.Cartesian3.normalize(right, right);
                var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
                normal = Cesium.Cartesian3.normalize(normal, normal);
                var originCenteredPlane = new Cesium.Plane(normal, 0.0);
                var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
                clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
            }
            this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
                planes: clippingPlanes,
                edgeWidth: 1.0,
                edgeColor: Cesium.Color.WHITE,
                enabled: true
            });
            // this.addClippingImageMaterial(newArr);


            this._prepareWell(points);
            this._createWell(this.wellData);
        }

        //清除裁剪面

    }, {
        key: 'clear',
        value: function clear() {
            if (this.viewer.scene.globe.clippingPlanes) {
                this.viewer.scene.globe.clippingPlanes.enabled = false;
                this.viewer.scene.globe.clippingPlanes.removeAll();
                if (!this.viewer.scene.globe.clippingPlanes.isDestroyed()) this.viewer.scene.globe.clippingPlanes.destroy();
            }
            this.viewer.scene.globe.clippingPlanes = undefined;

            this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface);
            this.wellWall && this.viewer.scene.primitives.remove(this.wellWall);

            delete this.bottomSurface;
            delete this.wellWall;

            this.viewer.scene.render();

            // if (this._last_depthTestAgainstTerrain !== null)
            //     this.viewer.scene.globe.depthTestAgainstTerrain = this._last_depthTestAgainstTerrain;
        }

        //准备井数据

    }, {
        key: '_prepareWell',
        value: function _prepareWell(arr) {

            var splitNum = this.splitNum;
            var len = arr.length;
            if (len == 0) return;
            var targetHeight = this.excavateMinHeight - this.height;
            var no_height_top = [];
            var bottom_pos = [];
            var lerp_pos = [];
            for (var i = 0; i < len; i++) {
                var static_i = i == len - 1 ? 0 : i + 1;
                var currRad = Cesium.Cartographic.fromCartesian(arr[i]);
                var nextRad = Cesium.Cartographic.fromCartesian(arr[static_i]);
                var pos1 = [currRad.longitude, currRad.latitude];
                var pos2 = [nextRad.longitude, nextRad.latitude];
                if (i == 0) {
                    lerp_pos.push(new Cesium.Cartographic(pos1[0], pos1[1]));
                    bottom_pos.push(Cesium.Cartesian3.fromRadians(pos1[0], pos1[1], targetHeight));
                    no_height_top.push(Cesium.Cartesian3.fromRadians(pos1[0], pos1[1], 0));
                }
                for (var j = 1; j <= splitNum; j++) {
                    var curr_pos_lon = Cesium.Math.lerp(pos1[0], pos2[0], j / splitNum);
                    var curr_pos_lat = Cesium.Math.lerp(pos1[1], pos2[1], j / splitNum);
                    if (!(i == len - 1 && j == splitNum)) {
                        lerp_pos.push(new Cesium.Cartographic(curr_pos_lon, curr_pos_lat));
                        bottom_pos.push(Cesium.Cartesian3.fromRadians(curr_pos_lon, curr_pos_lat, targetHeight));
                        no_height_top.push(Cesium.Cartesian3.fromRadians(curr_pos_lon, curr_pos_lat, 0));
                    }
                }
            }
            this.wellData = {
                lerp_pos: lerp_pos,
                bottom_pos: bottom_pos,
                no_height_top: no_height_top
            };
        }
        //创建井

    }, {
        key: '_createWell',
        value: function _createWell(options) {
            var hasTerrain = Boolean(this.viewer.terrainProvider._layers);
            if (hasTerrain) {
                var self = this;
                this._createBottomSurface(options.bottom_pos);
                var promise = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, options.lerp_pos);
                Cesium.when(promise, function (updatedPositions) {
                    var len = updatedPositions.length;
                    var top_pos = [];
                    for (var k = 0; k < len; k++) {
                        var top_car = Cesium.Cartesian3.fromRadians(updatedPositions[k].longitude, updatedPositions[k].latitude, updatedPositions[k].height);
                        top_pos.push(top_car);
                    }
                    self._createWellWall(options.bottom_pos, top_pos);
                });
            } else {
                this._createBottomSurface(options.bottom_pos);
                this._createWellWall(options.bottom_pos, options.no_height_top);
            }
        }
        //创建井壁

    }, {
        key: '_createWellWall',
        value: function _createWellWall(bottom, top) {
            var geo = new Cesium.WellNoBottom({
                minimumArr: bottom,
                maximumArr: top
            });
            geo = Cesium.WellNoBottom.createGeometry(geo);
            var _material = new Cesium.Material({
                fabric: {
                    type: 'Image',
                    uniforms: {
                        image: this.wallImg
                    }
                }
            });
            var _appearance = new Cesium.MaterialAppearance({
                translucent: false,
                flat: true,
                material: _material
            });
            this.wellWall = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geo,
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREY)
                    },
                    id: 'PitWall'
                }),
                appearance: _appearance,
                asynchronous: false
            });
            this.viewer.scene.primitives.add(this.wellWall);
        }
        //创建井底

    }, {
        key: '_createBottomSurface',
        value: function _createBottomSurface(bottom_pos) {
            if (!bottom_pos.length) {
                return;
            }
            var geo = new Cesium.CustomPlaneGeometry({
                pos_arr: bottom_pos
            });
            geo = Cesium.CustomPlaneGeometry.createGeometry(geo);
            var _material = new Cesium.Material({
                fabric: {
                    type: 'Image',
                    uniforms: {
                        image: this.bottomImg
                    }
                }
            });
            var _appearance = new Cesium.MaterialAppearance({
                translucent: false,
                flat: true,
                material: _material
            });
            this.bottomSurface = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geo
                }),
                appearance: _appearance,
                asynchronous: false
            });
            this.viewer.scene.primitives.add(this.bottomSurface);
        }

        //切换挖掘显隐

    }, {
        key: '_switchExcavate',
        value: function _switchExcavate(val) {
            if (val) {
                this.viewer.scene.globe.material = Cesium.Material.fromType('WaJue');
                this.wellWall.show = true;
                this.bottomSurface.show = true;
            } else {
                this.viewer.scene.globe.material = null;
                this.wellWall.show = false;
                this.bottomSurface.show = false;
            }
        }

        //更新挖掘深度

    }, {
        key: '_updateExcavateDepth',
        value: function _updateExcavateDepth(depth) {
            this.bottomSurface && this.viewer.scene.primitives.remove(this.bottomSurface);
            this.wellWall && this.viewer.scene.primitives.remove(this.wellWall);

            var lerp_pos = this.wellData.lerp_pos;
            var bottom_pos = [];
            var len = lerp_pos.length;
            for (var i = 0; i < len; i++) {
                bottom_pos.push(Cesium.Cartesian3.fromRadians(lerp_pos[i].longitude, lerp_pos[i].latitude, this.excavateMinHeight - depth));
            }
            this.wellData.bottom_pos = bottom_pos;
            this._createWell(this.wellData);

            this.viewer.scene.primitives.add(this.bottomSurface);
            this.viewer.scene.primitives.add(this.wellWall);
        }
    }, {
        key: 'show',
        get: function get() {
            return this._show;
        },
        set: function set(val) {
            this._show = val;

            if (this.viewer.scene.globe.clippingPlanes) this.viewer.scene.globe.clippingPlanes.enabled = val;

            this._switchExcavate(val);
        }

        //裁剪距离 

    }, {
        key: 'height',
        get: function get() {
            return this._height;
        },
        set: function set(val) {
            this._height = val;
            this._updateExcavateDepth(val);
        }
    }]);

    return TerrainClipPlan;
}();

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TilesetClipPlan = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//模型剖切(平面)类
var TilesetClipPlan = exports.TilesetClipPlan = function () {
    //========== 构造方法 ========== 
    function TilesetClipPlan(tileset, options) {
        _classCallCheck(this, TilesetClipPlan);

        this.tileset = tileset;
        this.options = options || {};

        if (this.options.type) {
            this.type = this.options.type;
        }
        if (this.options.distance) {
            this.distance = this.options.distance;
        }
    }

    //========== 对外属性 ========== 
    //裁剪面


    _createClass(TilesetClipPlan, [{
        key: "createPlane",


        //========== 方法 ========== 

        // 创建裁剪面
        value: function createPlane(type) {
            this.clear();

            //裁剪面
            var planes;
            switch (type) {
                case TilesetClipPlan.Type.Z:
                    //水平切底部 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0, 0, 1), 1)];
                    break;
                default:
                case TilesetClipPlan.Type.ZR:
                    //水平切顶部 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0, 0, -1), 1)];
                    break;

                case TilesetClipPlan.Type.X:
                    //东西方向切1 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(1, 0, 0), 1)];
                    break;
                case TilesetClipPlan.Type.XR:
                    //东西方向切2 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(-1, 0, 0), 1)];
                    break;

                case TilesetClipPlan.Type.Y:
                    //南北方向切1 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0, 1, 0), 1)];
                    break;
                case TilesetClipPlan.Type.YR:
                    //南北方向切2 
                    planes = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0, -1, 0), 1)];
                    break;
            }

            var clippingPlanes = new Cesium.ClippingPlaneCollection({
                planes: planes,
                edgeWidth: this.options.edgeWidth || 0.0
            });
            this.clippingPlanes = clippingPlanes;
            this.tileset.clippingPlanes = clippingPlanes;
        }

        //更新裁剪距离

    }, {
        key: "updateDistance",
        value: function updateDistance(val) {
            if (this.clippingPlanes == null) return;

            for (var i = 0; i < this.clippingPlanes.length; i++) {
                var plane = this.clippingPlanes.get(i);
                plane.distance = val;
            }
        }

        //清除裁剪面

    }, {
        key: "clear",
        value: function clear() {
            if (this.tileset.clippingPlanes) {
                this.tileset.clippingPlanes.enabled = false;
                // this.tileset.clippingPlanes = undefined;
            }

            if (this.clippingPlanes) {
                this.clippingPlanes.destroy();
                delete this.clippingPlanes;
            }
        }
    }, {
        key: "planes",
        get: function get() {
            return this.clippingPlanes;
        }

        //裁剪类型

    }, {
        key: "type",
        get: function get() {
            return this._type;
        },
        set: function set(val) {
            this._type = val;
            this.createPlane(val);
        }

        //裁剪距离 

    }, {
        key: "distance",
        get: function get() {
            return this._distance || 0;
        },
        set: function set(val) {
            this._distance = val;
            this.updateDistance(val);
        }
    }]);

    return TilesetClipPlan;
}();

/**
* 裁剪模型 类型 枚举
*@enum {Number}
*/


TilesetClipPlan.Type = {
    /** z水平面,水平切底部 */
    Z: 1,
    /** z水平面，水平切顶部 */
    ZR: 2,
    /** x垂直面,水平切底部 */
    X: 3,
    /** x垂直面,东西方向切 */
    XR: 4,
    /** y垂直面, 南北方向切 */
    Y: 5,
    /** y垂直面，南北方向切*/
    YR: 6
};

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FloodByEntity = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _point = __webpack_require__(1);

var _Attr = __webpack_require__(11);

var polygonAttr = _interopRequireWildcard(_Attr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//淹没分析(平面)类
var FloodByEntity = exports.FloodByEntity = function () {
    //========== 构造方法 ========== 
    function FloodByEntity(viewer) {
        _classCallCheck(this, FloodByEntity);

        this.viewer = viewer;
    }

    //========== 对外属性 ==========  
    //高度


    _createClass(FloodByEntity, [{
        key: 'start',


        //========== 方法 ========== 


        //开发分析
        value: function start(entity, options) {
            this.stop();

            this.entity = entity;
            this.options = options;

            var that = this;

            this._last_depthTestAgainstTerrain = this.viewer.scene.globe.depthTestAgainstTerrain;
            this.viewer.scene.globe.depthTestAgainstTerrain = true;

            this.extrudedHeight = options.height;
            this.entity.polygon.extrudedHeight = new Cesium.CallbackProperty(function (time) {
                return that.extrudedHeight;
            }, false);

            //修改高度值
            var positions = polygonAttr.getPositions(this.entity);
            positions = (0, _point.setPositionsHeight)(positions, options.height);
            this.entity.polygon.hierarchy = new Cesium.PolygonHierarchy(positions);

            this.timeIdx = setInterval(function () {
                if (that.extrudedHeight > that.options.maxHeight) {
                    if (options.onStop) options.onStop();

                    that.stop();
                    return;
                }
                that.extrudedHeight += that.options.speed / 10;

                if (options.onChange) options.onChange(that.extrudedHeight);
            }, 100);
        }
        //停止分析

    }, {
        key: 'stop',
        value: function stop() {
            clearInterval(this.timeIdx);
        }

        //清除分析

    }, {
        key: 'clear',
        value: function clear() {
            this.stop();
            if (this._last_depthTestAgainstTerrain !== null) this.viewer.scene.globe.depthTestAgainstTerrain = this._last_depthTestAgainstTerrain;
            this.entity = null;
        }

        //更新高度

    }, {
        key: 'updateHeight',
        value: function updateHeight(height) {
            this.extrudedHeight = height;
        }
    }, {
        key: 'height',
        get: function get() {
            return this.extrudedHeight;
        },
        set: function set(val) {
            this.extrudedHeight = val;
        }
    }]);

    return FloodByEntity;
}();

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ViewShed3D = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _ViewFieldFS = __webpack_require__(114);

var _ViewFieldFS2 = _interopRequireDefault(_ViewFieldFS);

var _RectangularSensorGraphics = __webpack_require__(44);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOpts = {
    cameraPosition: null, //相机位置
    viewPosition: null, //视点位置
    horizontalAngle: 120, //水平张角
    verticalAngle: 90, //垂直张角
    visibleAreaColor: new Cesium.Color(0, 1, 0), //可视颜色
    hiddenAreaColor: new Cesium.Color(1, 0, 0), //不可视颜色
    alpha: 0.5, //混合度
    distance: 100, //距离
    frustum: true, //视椎体显示
    show: true //可视域显示


    //   可视分析 类
};
var ViewShed3D = exports.ViewShed3D = function () {
    //========== 构造方法 ========== 
    function ViewShed3D(viewer, options) {
        _classCallCheck(this, ViewShed3D);

        if (!viewer) return;
        if (!options) options = {};

        this.viewer = viewer;
        this.cameraPosition = Cesium.defaultValue(options.cameraPosition, defaultOpts.cameraPosition);
        this.viewPosition = Cesium.defaultValue(options.viewPosition, defaultOpts.viewPosition);
        this._horizontalAngle = Cesium.defaultValue(options.horizontalAngle, defaultOpts.horizontalAngle);
        this._verticalAngle = Cesium.defaultValue(options.verticalAngle, defaultOpts.verticalAngle);
        this._visibleAreaColor = Cesium.defaultValue(options.visibleAreaColor, defaultOpts.visibleAreaColor);
        this._hiddenAreaColor = Cesium.defaultValue(options.hiddenAreaColor, defaultOpts.hiddenAreaColor);
        this._alpha = Cesium.defaultValue(options.alpha, defaultOpts.alpha);
        this._distance = Cesium.defaultValue(options.distance, defaultOpts.distance);
        this._frustum = Cesium.defaultValue(options.frustum, defaultOpts.frustum);
        this.calback = options.calback;
        this.defaultShow = Cesium.defaultValue(options.show, true);
        if (this.cameraPosition && this.viewPosition) {
            this._addToScene();
            this.calback && this.calback();
        } else {
            this._bindMourseEvent();
        }
    }

    //========== 对外属性 ========== 
    //水平张角


    _createClass(ViewShed3D, [{
        key: "_bindMourseEvent",


        //========== 方法 ========== 

        //激活绑定事件
        value: function _bindMourseEvent() {
            var _this = this;
            var viewer = this.viewer;
            var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            handler.setInputAction(function (movement) {
                var cartesian = DiitEarth.point.getCurrentMousePosition(viewer.scene, movement.position);
                if (!cartesian) return;
                if (!_this.cameraPosition) {
                    _this.cameraPosition = cartesian;
                } else if (_this.cameraPosition && !_this.viewPosition) {
                    _this.viewPosition = cartesian;
                    _this._addToScene();
                    _this._unbindMourseEvent();
                    _this.calback && _this.calback();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            handler.setInputAction(function (movement) {
                var cartesian = DiitEarth.point.getCurrentMousePosition(viewer.scene, movement.endPosition);
                if (!cartesian) return;
                var cp = _this.cameraPosition;
                if (cp) {
                    _this.frustumQuaternion = _this.getFrustumQuaternion(cp, cartesian);
                    _this.distance = Number(Cesium.Cartesian3.distance(cp, cartesian).toFixed(1));
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this._handler = handler;
        }

        //解绑事件

    }, {
        key: "_unbindMourseEvent",
        value: function _unbindMourseEvent() {
            if (this._handler == null) return;

            this._handler.destroy();
            delete this._handler;
        }
        //添加到场景里

    }, {
        key: "_addToScene",
        value: function _addToScene() {
            this.frustumQuaternion = this.getFrustumQuaternion(this.cameraPosition, this.viewPosition);
            this._createShadowMap(this.cameraPosition, this.viewPosition);
            this._addPostProcess();
            !this.radar && this.addRadar(this.cameraPosition, this.frustumQuaternion);
            this.viewer.scene.primitives.add(this);
        }

        //创建ShadowMap

    }, {
        key: "_createShadowMap",
        value: function _createShadowMap(cpos, viewPosition, fq) {
            var camera_pos = cpos;
            var lookat_pos = viewPosition;
            var scene = this.viewer.scene;
            var camera1 = new Cesium.Camera(scene);
            camera1.position = camera_pos;
            camera1.direction = Cesium.Cartesian3.subtract(lookat_pos, camera_pos, new Cesium.Cartesian3(0, 0, 0));
            camera1.up = Cesium.Cartesian3.normalize(camera_pos, new Cesium.Cartesian3(0, 0, 0));

            var far = Number(Cesium.Cartesian3.distance(lookat_pos, camera_pos).toFixed(1));
            this.distance = far;

            camera1.frustum = new Cesium.PerspectiveFrustum({
                fov: Cesium.Math.toRadians(120),
                aspectRatio: scene.canvas.clientWidth / scene.canvas.clientHeight,
                near: 0.1,
                far: 5000
            });

            var isSpotLight = true;
            this.viewShadowMap = new Cesium.ShadowMap({
                lightCamera: camera1,
                enable: false,
                isPointLight: !isSpotLight,
                isSpotLight: isSpotLight,
                cascadesEnabled: false,
                context: scene.context,
                pointLightRadius: far
            });
        }

        //获取四元数

    }, {
        key: "getFrustumQuaternion",
        value: function getFrustumQuaternion(cpos, viewPosition) {
            var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(viewPosition, cpos, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            var up = Cesium.Cartesian3.normalize(cpos, new Cesium.Cartesian3());
            var camera = new Cesium.Camera(this.viewer.scene);
            camera.position = cpos;
            camera.direction = direction;
            camera.up = up;
            direction = camera.directionWC;
            up = camera.upWC;
            var right = camera.rightWC;
            var scratchRight = new Cesium.Cartesian3();
            var scratchRotation = new Cesium.Matrix3();
            var scratchOrientation = new Cesium.Quaternion();

            // var right = Cesium.Cartesian3.cross(direction,up,new Cesium.Cartesian3());
            right = Cesium.Cartesian3.negate(right, scratchRight);
            var rotation = scratchRotation;
            Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
            Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
            Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
            //计算视锥姿态
            var orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);
            return orientation;
        }

        //添加后处理

    }, {
        key: "_addPostProcess",
        value: function _addPostProcess() {
            var _this = this;
            var fragmentShaderSource = _ViewFieldFS2.default;
            var shadow_stc = this;
            var bias = shadow_stc.viewShadowMap._isPointLight ? shadow_stc.viewShadowMap._pointBias : shadow_stc.viewShadowMap._primitiveBias;
            this.postProcess = new Cesium.PostProcessStage({
                fragmentShader: fragmentShaderSource,
                uniforms: {
                    czzj: function czzj() {
                        return _this.verticalAngle;
                    },
                    dis: function dis() {
                        return _this.distance;
                    },
                    spzj: function spzj() {
                        return _this.horizontalAngle;
                    },
                    visibleColor: function visibleColor() {
                        return _this.visibleAreaColor;
                    },
                    disVisibleColor: function disVisibleColor() {
                        return _this.hiddenAreaColor;
                    },
                    mixNum: function mixNum() {
                        return _this.alpha;
                    },
                    stcshadow: function stcshadow() {
                        return shadow_stc.viewShadowMap._shadowMapTexture;
                    },
                    _shadowMap_matrix: function _shadowMap_matrix() {
                        return shadow_stc.viewShadowMap._shadowMapMatrix;
                    },
                    shadowMap_lightPositionEC: function shadowMap_lightPositionEC() {
                        return shadow_stc.viewShadowMap._lightPositionEC;
                    },
                    shadowMap_lightDirectionEC: function shadowMap_lightDirectionEC() {
                        return shadow_stc.viewShadowMap._lightDirectionEC;
                    },
                    shadowMap_lightUp: function shadowMap_lightUp() {
                        return shadow_stc.viewShadowMap._lightCamera.up;
                    },
                    shadowMap_lightDir: function shadowMap_lightDir() {
                        return shadow_stc.viewShadowMap._lightCamera.direction;
                    },
                    shadowMap_lightRight: function shadowMap_lightRight() {
                        return shadow_stc.viewShadowMap._lightCamera.right;
                    },
                    shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function shadowMap_texelSizeDepthBiasAndNormalShadingSmooth() {
                        var texelStepSize = new Cesium.Cartesian2();
                        texelStepSize.x = 1.0 / shadow_stc.viewShadowMap._textureSize.x;
                        texelStepSize.y = 1.0 / shadow_stc.viewShadowMap._textureSize.y;
                        return Cesium.Cartesian4.fromElements(texelStepSize.x, texelStepSize.y, bias.depthBias, bias.normalShadingSmooth, this.combinedUniforms1);
                    },
                    shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness() {
                        return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, shadow_stc.viewShadowMap._distance, shadow_stc.viewShadowMap.maximumDistance, shadow_stc.viewShadowMap._darkness, this.combinedUniforms2);
                    }
                }
            });
            this.show && this.viewer.scene.postProcessStages.add(this.postProcess);
        }

        //删除雷达

    }, {
        key: "removeRadar",
        value: function removeRadar() {
            this.viewer.entities.remove(this.radar);
        }
        //重置雷达

    }, {
        key: "resetRadar",
        value: function resetRadar() {
            this.removeRadar();
            this.addRadar(this.cameraPosition, this.frustumQuaternion);
        }
        //添加雷达

    }, {
        key: "addRadar",
        value: function addRadar(cpos, frustumQuaternion) {
            var position = cpos;
            var _this = this;
            this.radar = this.viewer.entities.add({
                position: position,
                orientation: frustumQuaternion,
                show: this.show,
                rectangularSensor: new _RectangularSensorGraphics.RectangularSensorGraphics({
                    radius: _this.distance, //传感器的半径
                    xHalfAngle: Cesium.Math.toRadians(_this.horizontalAngle / 2), //传感器水平半角
                    yHalfAngle: Cesium.Math.toRadians(_this.verticalAngle / 2), //传感器垂直半角

                    material: new Cesium.Color(0.0, 1.0, 1.0, 0.4), //目前用的统一材质
                    lineColor: new Cesium.Color(1.0, 1.0, 1.0, 1.0), //线的颜色
                    slice: 8,
                    showScanPlane: false, //是否显示扫描面
                    scanPlaneColor: new Cesium.Color(0.0, 1.0, 1.0, 1.0), //扫描面颜色
                    scanPlaneMode: 'vertical', // 扫描面模式 垂直vertical/水平horizontal
                    scanPlaneRate: 3, //扫描速率,
                    showThroughEllipsoid: false, //此参数控制深度检测，为false启用深度检测，可以解决雷达一半在地球背面时显示的问题
                    showLateralSurfaces: false,
                    showDomeSurfaces: false
                })
            });
        }

        //更新

    }, {
        key: "update",
        value: function update(frameState) {
            this.viewShadowMap && frameState.shadowMaps.push(this.viewShadowMap);
        }
    }, {
        key: "_switchShow",
        value: function _switchShow() {
            if (this.show) {
                !this.postProcess && this._addPostProcess();
            } else {
                this.viewer.scene.postProcessStages.remove(this.postProcess);
                delete this.postProcess;
                this.postProcess = null;
            }
            this.radar.show = this.show;
        }

        //销毁

    }, {
        key: "destroy",
        value: function destroy() {
            this._unbindMourseEvent();

            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.entities.remove(this.radar);

            delete this.radar;
            delete this.postProcess;
            delete this.viewShadowMap;
            delete this.verticalAngle;
            delete this.viewer;
            delete this.horizontalAngle;
            delete this.visibleAreaColor;
            delete this.hiddenAreaColor;
            delete this.distance;
            delete this.frustumQuaternion;
            delete this.cameraPosition;
            delete this.viewPosition;
            delete this.alpha;
        }
    }, {
        key: "horizontalAngle",
        get: function get() {
            return this._horizontalAngle;
        },
        set: function set(val) {
            this._horizontalAngle = val;
            this.resetRadar();
        }
        //垂直张角

    }, {
        key: "verticalAngle",
        get: function get() {
            return this._verticalAngle;
        },
        set: function set(val) {
            this._verticalAngle = val;
            this.resetRadar();
        }
        //可视距离

    }, {
        key: "distance",
        get: function get() {
            return this._distance;
        },
        set: function set(val) {
            this._distance = val;
            this.resetRadar();
        }
        //可视区域颜色

    }, {
        key: "visibleAreaColor",
        get: function get() {
            return this._visibleAreaColor;
        },
        set: function set(val) {
            this._visibleAreaColor = val;
        }
        //不可视区域颜色

    }, {
        key: "hiddenAreaColor",
        get: function get() {
            return this._hiddenAreaColor;
        },
        set: function set(val) {
            this._hiddenAreaColor = val;
        }
        //混合系数0-1

    }, {
        key: "alpha",
        get: function get() {
            return this._alpha;
        },
        set: function set(val) {
            this._alpha = val;
        }
        //显示和隐藏

    }, {
        key: "show",
        get: function get() {
            return this.defaultShow;
        },
        set: function set(val) {
            this.defaultShow = Boolean(val);
            this._switchShow();
        }
    }]);

    return ViewShed3D;
}();

/***/ }),
/* 114 */
/***/ (function(module, exports) {

module.exports = "uniform float czzj;\r\nuniform float dis;\r\nuniform float spzj;\r\nuniform vec3 visibleColor;\r\nuniform vec3 disVisibleColor;\r\nuniform float mixNum;\r\nuniform sampler2D colorTexture;\r\nuniform sampler2D stcshadow; \r\nuniform sampler2D depthTexture;\r\nuniform mat4 _shadowMap_matrix; \r\nuniform vec4 shadowMap_lightPositionEC; \r\nuniform vec4 shadowMap_lightDirectionEC;\r\nuniform vec3 shadowMap_lightUp;\r\nuniform vec3 shadowMap_lightDir;\r\nuniform vec3 shadowMap_lightRight;\r\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \r\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \r\nvarying vec2 v_textureCoordinates;\r\nvec4 toEye(in vec2 uv, in float depth){\r\n    vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\r\n    vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\r\n    posInCamera =posInCamera / posInCamera.w;\r\n    return posInCamera;\r\n}\r\nfloat getDepth(in vec4 depth){\r\n    float z_window = czm_unpackDepth(depth);\r\n    z_window = czm_reverseLogDepth(z_window);\r\n    float n_range = czm_depthRange.near;\r\n    float f_range = czm_depthRange.far;\r\n    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\r\n}\r\nfloat _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){\r\n    return texture2D(shadowMap, uv).r;\r\n}\r\nfloat _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){\r\n    return step(depth, _czm_sampleShadowMap(shadowMap, uv));\r\n}\r\nfloat _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){\r\n    float depthBias = shadowParameters.depthBias;\r\n    float depth = shadowParameters.depth;\r\n    float nDotL = shadowParameters.nDotL;\r\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\r\n    float darkness = shadowParameters.darkness;\r\n    vec2 uv = shadowParameters.texCoords;\r\n    depth -= depthBias;\r\n    vec2 texelStepSize = shadowParameters.texelStepSize;\r\n    float radius = 1.0;\r\n    float dx0 = -texelStepSize.x * radius;\r\n    float dy0 = -texelStepSize.y * radius;\r\n    float dx1 = texelStepSize.x * radius;\r\n    float dy1 = texelStepSize.y * radius;\r\n    float visibility = \r\n    (\r\n    _czm_shadowDepthCompare(shadowMap, uv, depth)\r\n    +_czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)\r\n    ) * (1.0 / 9.0)\r\n    ;\r\n    return visibility;\r\n}\r\nvec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){\r\n    vec3 v01 = point -planeOrigin;\r\n    float d = dot(planeNormal, v01) ;\r\n    return (point - planeNormal * d);\r\n}\r\nfloat ptm(vec3 pt){\r\n    return sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);\r\n}\r\nvoid main() \r\n{ \r\n    const float PI = 3.141592653589793;\r\n    vec4 color = texture2D(colorTexture, v_textureCoordinates);\r\n    vec4 currD = texture2D(depthTexture, v_textureCoordinates);\r\n\r\n    // vec4 stcc = texture2D(stcshadow, v_textureCoordinates);\r\n    // gl_FragColor = stcc;\r\n    // return;\r\n    if(currD.r>=1.0){\r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n    \r\n    float depth = getDepth(currD);\r\n    vec4 positionEC = toEye(v_textureCoordinates, depth);\r\n    vec3 normalEC = vec3(1.0);\r\n    czm_shadowParameters shadowParameters; \r\n    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \r\n    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \r\n    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \r\n    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \r\n    shadowParameters.depthBias *= max(depth * 0.01, 1.0); \r\n    vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz); \r\n    float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0); \r\n    vec4 shadowPosition = _shadowMap_matrix * positionEC; \r\n    shadowPosition /= shadowPosition.w; \r\n    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \r\n    { \r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n\r\n    //坐标与视点位置距离，大于最大距离则舍弃阴影效果\r\n    vec4 lw = czm_inverseView*  vec4(shadowMap_lightPositionEC.xyz, 1.0);\r\n    vec4 vw = czm_inverseView* vec4(positionEC.xyz, 1.0);\r\n    if(distance(lw.xyz,vw.xyz)>dis){\r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n\r\n\r\n    //水平夹角限制\r\n    vec3 ptOnSP = pointProjectOnPlane(shadowMap_lightUp,lw.xyz,vw.xyz);\r\n    directionEC = ptOnSP - lw.xyz;\r\n    float directionECMO = ptm(directionEC.xyz);\r\n    float shadowMap_lightDirMO = ptm(shadowMap_lightDir.xyz);\r\n    float cosJJ = dot(directionEC,shadowMap_lightDir)/(directionECMO*shadowMap_lightDirMO);\r\n    float degJJ = acos(cosJJ)*(180.0 / PI);\r\n    degJJ = abs(degJJ);\r\n    if(degJJ>spzj/2.0){\r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n\r\n    //垂直夹角限制\r\n    vec3 ptOnCZ = pointProjectOnPlane(shadowMap_lightRight,lw.xyz,vw.xyz);\r\n    vec3 dirOnCZ = ptOnCZ - lw.xyz;\r\n    float dirOnCZMO = ptm(dirOnCZ);\r\n    float cosJJCZ = dot(dirOnCZ,shadowMap_lightDir)/(dirOnCZMO*shadowMap_lightDirMO);\r\n    float degJJCZ = acos(cosJJCZ)*(180.0 / PI);\r\n    degJJCZ = abs(degJJCZ);\r\n    if(degJJCZ>czzj/2.0){\r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n\r\n    shadowParameters.texCoords = shadowPosition.xy; \r\n    shadowParameters.depth = shadowPosition.z; \r\n    shadowParameters.nDotL = nDotL; \r\n    float visibility = _czm_shadowVisibility(stcshadow, shadowParameters); \r\n    if(visibility==1.0){\r\n        gl_FragColor = mix(color,vec4(visibleColor,1.0),mixNum);\r\n    }else{\r\n        // if(abs(shadowPosition.z-0.0)<0.01){\r\n        //     return;\r\n        // }\r\n        gl_FragColor = mix(color,vec4(disVisibleColor,1.0),mixNum);\r\n    }\r\n} "

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.VideoShed3D = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

var _ViewVideoFS = __webpack_require__(116);

var _ViewVideoFS2 = _interopRequireDefault(_ViewVideoFS);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ratateDirection = {
    'LEFT': 'Z',
    'RIGHT': '-Z',
    'TOP': 'Y',
    'BOTTOM': '-Y',
    'ALONG': 'X',
    'INVERSE': '-X'
};

var textStyles = {
    font: '50px 楷体',
    fill: true,
    fillColor: new Cesium.Color(1.0, 1.0, 0.0, 1.0),
    stroke: true,
    strokeWidth: 2,
    strokeColor: new Cesium.Color(1.0, 1.0, 1.0, 0.8),
    backgroundColor: new Cesium.Color(1.0, 1.0, 1.0, 0.1),
    textBaseline: 'top',
    padding: 40

    //  可视域投影视频 类
};
var VideoShed3D = exports.VideoShed3D = function () {
    //========== 构造方法 ========== 
    function VideoShed3D(viewer, options) {
        _classCallCheck(this, VideoShed3D);

        if (!viewer) return;

        if (!options) options = {};
        this.viewer = viewer;
        this._cameraPosition = options.cameraPosition; //相机位置
        this._position = options.position; //视点位置
        this.type = options.type; //投影类型
        this.alpha = options.alpha || 1.0; //透明度
        this.url = options.url; //url
        this.color = options.color; //投影的颜色
        this._debugFrustum = Cesium.defaultValue(options.debugFrustum, true); //显示视椎体
        this._aspectRatio = options.aspectRatio || this._getWinWidHei(); //宽高比
        var fov = options.fov && Cesium.Math.toRadians(options.fov);
        this._camerafov = fov || this.viewer.scene.camera.frustum.fov; //相机水平张角
        this.texture = options.texture || new Cesium.Texture({ //默认材质
            context: this.viewer.scene.context,
            source: {
                width: 1,
                height: 1,
                arrayBufferView: new Uint8Array([255, 255, 255, 255])
            },
            flipY: false
        });
        this._videoPlay = Cesium.defaultValue(options.videoPlay, true); //暂停播放
        this.defaultShow = Cesium.defaultValue(options.show, true); //显示和隐藏
        this._rotateDeg = 1;
        this._dirObj = Cesium.defaultValue(options.dirObj, undefined);
        this.text = Cesium.defaultValue(options.text, undefined);
        this.textStyles = Cesium.defaultValue(options.textStyles, textStyles);
        this._disViewColor = Cesium.defaultValue(options.disViewColor, new Cesium.Color(0, 0, 0, 0.5));
        if (!this.cameraPosition || !this.cameraPosition) {
            console.log("初始化失败：请确认相机位置与视点位置正确！");
            return;
        }

        VideoShed3D.Type = {
            Color: 1,
            Image: 2,
            Video: 3,
            Text: 4
        };
        switch (this.type) {
            default:
            case VideoShed3D.Type.Video:
                this.activeVideo(this.url);
                break;
            case VideoShed3D.Type.Image:
                this.activePicture(this.url);
                this.deActiveVideo();
                break;
            case VideoShed3D.Type.Color:
                this.activeColor(this.color);
                this.deActiveVideo();
                break;
            case VideoShed3D.Type.Text:
                this.activeText(this.text, this.textStyles);
                this.deActiveVideo();
                break;
        }

        this._createShadowMap();
        this._getOrientation();
        this._addCameraFrustum();
        this._addPostProcess();
        this.viewer.scene.primitives.add(this);
    }

    //========== 对外属性 ========== 
    //混合系数0-1


    _createClass(VideoShed3D, [{
        key: "rotateCamera",


        //旋转相机
        value: function rotateCamera(axis, deg) {
            var rotateDegree = Cesium.defaultValue(deg, this._rotateDeg);
            switch (axis) {
                case ratateDirection.LEFT:
                    break;
                case ratateDirection.RIGHT:
                    rotateDegree *= -1;
                    break;
                case ratateDirection.TOP:
                    break;
                case ratateDirection.BOTTOM:
                    rotateDegree *= -1;
                    break;
                case ratateDirection.ALONG:
                    break;
                case ratateDirection.INVERSE:
                    rotateDegree *= -1;
                    break;
            }
            var newDir = this._computedNewViewDir(axis, rotateDegree);

            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this.viewShadowMap.destroy();
            this.cameraFrustum.destroy();
            this._resetCameraDir(newDir);
            this._getOrientation();
            this._addCameraFrustum();
            this._addPostProcess();
        }
    }, {
        key: "_resetCameraDir",
        value: function _resetCameraDir(dirObj) {
            if (!dirObj || !dirObj.up || !dirObj.right || !dirObj.direction) return;
            this._dirObj = dirObj;
            this._createShadowMap();
        }
        //计算新视点

    }, {
        key: "_computedNewViewDir",
        value: function _computedNewViewDir(axis, deg) {
            deg = Cesium.Math.toRadians(deg);
            var camera = this.viewShadowMap._lightCamera;
            var oldDir = Cesium.clone(camera.direction);
            var oldRight = Cesium.clone(camera.right);
            var oldTop = Cesium.clone(camera.up);
            var mat3 = new Cesium.Matrix3();

            switch (axis) {
                case ratateDirection.LEFT:
                    Cesium.Matrix3.fromRotationZ(deg, mat3);
                    break;
                case ratateDirection.RIGHT:
                    Cesium.Matrix3.fromRotationZ(deg, mat3);
                    break;
                case ratateDirection.TOP:
                    Cesium.Matrix3.fromRotationY(deg, mat3);
                    break;
                case ratateDirection.BOTTOM:
                    Cesium.Matrix3.fromRotationY(deg, mat3);
                    break;
                case ratateDirection.ALONG:
                    Cesium.Matrix3.fromRotationX(deg, mat3);
                    break;
                case ratateDirection.INVERSE:
                    Cesium.Matrix3.fromRotationX(deg, mat3);
                    break;
            }
            var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(camera.position);
            // var hpr = new Cesium.HeadingPitchRoll(viewer.camera.heading,viewer.camera.pitch,viewer.camera.roll);
            // localToWorld_Matrix = Cesium.Transforms.headingPitchRollToFixedFrame(viewer.camera.position,hpr,Cesium.Ellipsoid.WGS84,Cesium.Transforms.eastNorthUpToFixedFrame);
            var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());

            var localDir = Cesium.Matrix4.multiplyByPointAsVector(worldToLocal_Matrix, oldDir, new Cesium.Cartesian3());
            var localNewDir = Cesium.Matrix3.multiplyByVector(mat3, localDir, new Cesium.Cartesian3());
            var newDir = Cesium.Matrix4.multiplyByPointAsVector(localToWorld_Matrix, localNewDir, new Cesium.Cartesian3());

            var localRight = Cesium.Matrix4.multiplyByPointAsVector(worldToLocal_Matrix, oldRight, new Cesium.Cartesian3());
            var localNewRight = Cesium.Matrix3.multiplyByVector(mat3, localRight, new Cesium.Cartesian3());
            var newRight = Cesium.Matrix4.multiplyByPointAsVector(localToWorld_Matrix, localNewRight, new Cesium.Cartesian3());

            var localTop = Cesium.Matrix4.multiplyByPointAsVector(worldToLocal_Matrix, oldTop, new Cesium.Cartesian3());
            var localNewTop = Cesium.Matrix3.multiplyByVector(mat3, localTop, new Cesium.Cartesian3());
            var newTop = Cesium.Matrix4.multiplyByPointAsVector(localToWorld_Matrix, localNewTop, new Cesium.Cartesian3());
            return {
                direction: newDir,
                right: newRight,
                up: newTop
            };
        }
    }, {
        key: "getPercentagePoint",
        value: function getPercentagePoint(cartesian) {
            if (!cartesian) return;
            var vm = this.viewShadowMap._lightCamera._viewMatrix;
            var pm = this.viewShadowMap._lightCamera.frustum.projectionMatrix;
            var c4 = new Cesium.Cartesian4(cartesian.x, cartesian.y, cartesian.z, 1.0);
            var pvm = Cesium.Matrix4.multiply(pm, vm, new Cesium.Matrix4());
            var epos1 = Cesium.Matrix4.multiplyByVector(pvm, c4, new Cesium.Cartesian4());
            var epos2 = new Cesium.Cartesian2(epos1.x / epos1.w, epos1.y / epos1.w);
            var epos3 = new Cesium.Cartesian2(epos2.x / 2 + 0.5, epos2.y / 2 + 0.5);
            return epos3;
        }

        /**
         * 改变相机的水平张角
         */

    }, {
        key: "_changeCameraFov",
        value: function _changeCameraFov() {
            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this._createShadowMap();
            this._getOrientation();
            this._addCameraFrustum();
            this._addPostProcess();
        }

        /**
         * 改变相机视野的宽高比例（垂直张角）
         */

    }, {
        key: "_changeVideoWidHei",
        value: function _changeVideoWidHei() {
            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this._createShadowMap();
            this._getOrientation();
            this._addCameraFrustum();
            this._addPostProcess();
        }

        /**
         * 改变相机的位置
         */

    }, {
        key: "_changeCameraPos",
        value: function _changeCameraPos() {
            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this.viewShadowMap.destroy();
            this.cameraFrustum.destroy();
            this._createShadowMap();
            this._getOrientation();
            this._addCameraFrustum();
            this._addPostProcess();
        }

        /**
         * 改变相机视点的位置
         */

    }, {
        key: "_changeViewPos",
        value: function _changeViewPos() {
            this.viewer.scene.postProcessStages.remove(this.postProcess);
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this.viewShadowMap.destroy();
            this.cameraFrustum.destroy();
            this._createShadowMap();
            this._getOrientation();
            this._addCameraFrustum();
            this._addPostProcess();
        }
    }, {
        key: "_switchShow",
        value: function _switchShow() {
            if (this.show) {
                !this.postProcess && this._addPostProcess();
            } else {
                this.viewer.scene.postProcessStages.remove(this.postProcess);
                delete this.postProcess;
                this.postProcess = null;
            }
            // this.cameraFrustum.show = this.show;
        }

        /**
         * 激活或重置视频URL
         * @param videoSrc
         * @returns 
         */

    }, {
        key: "activeVideo",
        value: function activeVideo(videoSrc) {
            //在可视域添加视频
            var videoElement = this._createVideoEle(videoSrc);
            var _this = this;
            if (videoElement) {
                this.type = VideoShed3D.Type.Video;
                var viewer = this.viewer;
                if (!this.activeVideoListener) {
                    this.activeVideoListener = function () {
                        _this.videoTexture && _this.videoTexture.destroy();
                        _this.videoTexture = new Cesium.Texture({
                            context: viewer.scene.context,
                            source: videoElement,
                            pixelFormat: Cesium.PixelFormat.RGBA,
                            pixelDatatype: Cesium.PixelDatatype.UNSIGNED_BYTE
                        });
                    };
                }
                viewer.clock.onTick.addEventListener(this.activeVideoListener);
            }
        }

        //删除视频播放监听

    }, {
        key: "deActiveVideo",
        value: function deActiveVideo() {
            this.viewer.clock.onTick.removeEventListener(this.activeVideoListener);
            delete this.activeVideoListener;
        }

        /**
         * 激活或重置图片URL
         * @param videoSrc
         * @returns 
         */

    }, {
        key: "activePicture",
        value: function activePicture(picSrc) {

            //在可视域添加图片    
            this.videoTexture = this.texture;

            var _this = this;
            var image = new Image();
            image.onload = function () {
                _this.type = VideoShed3D.Type.Image;
                _this.videoTexture = new Cesium.Texture({
                    context: _this.viewer.scene.context,
                    source: image
                });
            };
            image.onerror = function () {
                console.log('图片加载失败：' + picSrc);
            };
            image.src = picSrc;
        }
    }, {
        key: "activeColor",


        /**
         * 激活或重置颜色
         * @param color
         * @returns 
         */
        value: function activeColor(color) {
            //在可视域添加纯色
            var _this = this;
            this.type = VideoShed3D.Type.Color;
            var r, g, b, a;
            if (color) {
                r = color.red * 255;
                g = color.green * 255;
                b = color.blue * 255;
                a = color.alpha * 255;
            } else {
                r = Math.random() * 255;
                g = Math.random() * 255;
                b = Math.random() * 255;
                a = Math.random() * 255;
            }
            _this.videoTexture = new Cesium.Texture({
                context: _this.viewer.scene.context,
                source: {
                    width: 1,
                    height: 1,
                    arrayBufferView: new Uint8Array([r, g, b, a])
                },
                flipY: false
            });
        }

        /**
         * 激活或重置文本
         * @param text
         * @param styles
         * @returns 
         */
        // Name	               Type	          Default	                     Description
        // font	               String	      '10px sans-serif'	             optional The CSS font to use.
        // textBaseline	       String	      'bottom'	                     optional The baseline of the text.
        // fill	               Boolean	      true	                         optional Whether to fill the text.
        // stroke	           Boolean	      false	                         optional Whether to stroke the text.
        // fillColor	       Color	      Color.WHITE	                 optional The fill color.
        // strokeColor	       Color	      Color.BLACK	                 optional The stroke color.
        // strokeWidth	       Number	      1	                             optional The stroke width.
        // backgroundColor	   Color	      Color.TRANSPARENT	             optional The background color of the canvas.
        // padding	           Number	      0	                             optional The pixel size of the padding to add around the text.

    }, {
        key: "activeText",
        value: function activeText(text, styles) {
            //在可视域添加纯色
            var _this = this;
            this.type = VideoShed3D.Type.Text;
            if (!text) return;
            styles = styles || {};
            styles.textBaseline = 'top';
            this.textCanvas = Cesium.writeTextToCanvas(text, styles);
            _this.videoTexture = new Cesium.Texture({
                context: _this.viewer.scene.context,
                source: this.textCanvas,
                flipY: true
            });
        }

        /**
         * 呈现投影相机的第一视角
         */

    }, {
        key: "locate",
        value: function locate() {
            var camera_pos = Cesium.clone(this.cameraPosition);
            var lookat_pos = Cesium.clone(this.position);
            this.viewer.camera.position = camera_pos;
            if (this._dirObj) {
                this.viewer.camera.direction = Cesium.clone(this._dirObj.direction);
                this.viewer.camera.right = Cesium.clone(this._dirObj.right);
                this.viewer.camera.up = Cesium.clone(this._dirObj.up);
                return;
            }
            this.viewer.camera.direction = Cesium.Cartesian3.subtract(lookat_pos, camera_pos, new Cesium.Cartesian3(0, 0, 0));
            this.viewer.camera.up = Cesium.Cartesian3.normalize(camera_pos, new Cesium.Cartesian3(0, 0, 0));
        }

        //获取四元数

    }, {
        key: "_getOrientation",
        value: function _getOrientation() {
            var cpos = this.cameraPosition;
            var position = this.position;
            var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(position, cpos, new Cesium.Cartesian3()), new Cesium.Cartesian3());
            var up = Cesium.Cartesian3.normalize(cpos, new Cesium.Cartesian3());
            var camera = new Cesium.Camera(this.viewer.scene);
            camera.position = cpos;
            camera.direction = direction;
            camera.up = up;
            direction = camera.directionWC;
            up = camera.upWC;
            var right = camera.rightWC;
            var scratchRight = new Cesium.Cartesian3();
            var scratchRotation = new Cesium.Matrix3();
            var scratchOrientation = new Cesium.Quaternion();

            // var right = Cesium.Cartesian3.cross(direction,up,new Cesium.Cartesian3());
            right = Cesium.Cartesian3.negate(right, scratchRight);
            var rotation = scratchRotation;
            Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
            Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
            Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
            //计算视锥姿态
            var orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);
            this.orientation = orientation;
            return orientation;
        }
        //创建video元素

    }, {
        key: "_createVideoEle",
        value: function _createVideoEle(src) {
            //创建可视域video DOM  元素
            this.videoId = 'visualDomId';
            var source_map4 = document.createElement("SOURCE");
            source_map4.type = 'video/mp4';
            source_map4.src = src;
            var source_mov = document.createElement("SOURCE");
            source_mov.type = 'video/quicktime';
            source_mov.src = src;
            var videoEle = document.createElement("VIDEO");
            // videoEle.id = this.videoId;
            videoEle.setAttribute('autoplay', true);
            videoEle.setAttribute('loop', true);
            videoEle.setAttribute('crossorigin', true);
            videoEle.appendChild(source_map4);
            videoEle.appendChild(source_mov);
            document.body.appendChild(videoEle);
            this._videoEle = videoEle;
            return videoEle;
        }

        //获取canvas宽高

    }, {
        key: "_getWinWidHei",
        value: function _getWinWidHei() {
            var scene = this.viewer.scene;
            return scene.canvas.clientWidth / scene.canvas.clientHeight;
        }

        //创建ShadowMap

    }, {
        key: "_createShadowMap",
        value: function _createShadowMap() {
            var camera_pos = this.cameraPosition;
            var lookat_pos = this.position;
            var scene = this.viewer.scene;
            var camera1 = new Cesium.Camera(scene);
            camera1.position = camera_pos;
            if (this._dirObj) {
                camera1.direction = this._dirObj.direction;
                camera1.right = this._dirObj.right;
                camera1.up = this._dirObj.up;
            } else {
                camera1.direction = Cesium.Cartesian3.subtract(lookat_pos, camera_pos, new Cesium.Cartesian3(0, 0, 0));
                camera1.up = Cesium.Cartesian3.normalize(camera_pos, new Cesium.Cartesian3(0, 0, 0));
                // this._dirObj = {
                //     direction:camera1.direction,
                //     right:camera1.right,
                //     up:camera1.up
                // }
            }

            var far = Cesium.Cartesian3.distance(lookat_pos, camera_pos);
            this.viewDis = far;
            camera1.frustum = new Cesium.PerspectiveFrustum({
                fov: this.fov,
                aspectRatio: this.aspectRatio,
                near: 0.1,
                far: far * 2
            });

            var isSpotLight = true;
            this.viewShadowMap = new Cesium.ShadowMap({
                lightCamera: camera1,
                enable: false,
                isPointLight: !isSpotLight,
                isSpotLight: isSpotLight,
                cascadesEnabled: false,
                context: scene.context,
                pointLightRadius: far
            });
        }

        //添加视椎体

    }, {
        key: "_addCameraFrustum",
        value: function _addCameraFrustum() {
            var _this = this;
            this.cameraFrustum = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: new Cesium.FrustumOutlineGeometry({
                        origin: _this.cameraPosition,
                        orientation: _this.orientation,
                        frustum: this.viewShadowMap._lightCamera.frustum,
                        _drawNearPlane: true
                    }),
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(0.0, 0.5, 0.5))
                    }
                }),
                appearance: new Cesium.PerInstanceColorAppearance({
                    translucent: false,
                    flat: true
                }),
                asynchronous: false,
                show: this.debugFrustum && this.show
            });
            this.viewer.scene.primitives.add(this.cameraFrustum);
        }
        //添加后处理

    }, {
        key: "_addPostProcess",
        value: function _addPostProcess() {
            var _this = this;
            var fragmentShaderSource = _ViewVideoFS2.default;
            var bias = _this.viewShadowMap._isPointLight ? _this.viewShadowMap._pointBias : _this.viewShadowMap._primitiveBias;
            if (!this.show) return;
            this.postProcess = new Cesium.PostProcessStage({
                fragmentShader: fragmentShaderSource,
                uniforms: {
                    mixNum: function mixNum() {
                        return _this.alpha;
                    },
                    stcshadow: function stcshadow() {
                        return _this.viewShadowMap._shadowMapTexture;
                    },
                    videoTexture: function videoTexture() {
                        return _this.videoTexture;
                    },
                    _shadowMap_matrix: function _shadowMap_matrix() {
                        return _this.viewShadowMap._shadowMapMatrix;
                    },
                    shadowMap_lightPositionEC: function shadowMap_lightPositionEC() {
                        return _this.viewShadowMap._lightPositionEC;
                    },
                    shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function shadowMap_texelSizeDepthBiasAndNormalShadingSmooth() {
                        var texelStepSize = new Cesium.Cartesian2();
                        texelStepSize.x = 1.0 / _this.viewShadowMap._textureSize.x;
                        texelStepSize.y = 1.0 / _this.viewShadowMap._textureSize.y;
                        return Cesium.Cartesian4.fromElements(texelStepSize.x, texelStepSize.y, bias.depthBias, bias.normalShadingSmooth, this.combinedUniforms1);
                    },
                    shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness() {
                        return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, _this.viewShadowMap._distance, _this.viewShadowMap.maximumDistance, _this.viewShadowMap._darkness, this.combinedUniforms2);
                    },
                    disViewColor: function disViewColor() {
                        return _this._disViewColor;
                    }
                }
            });
            this.viewer.scene.postProcessStages.add(this.postProcess);
        }
    }, {
        key: "update",
        value: function update(frameState) {
            this.viewShadowMap && frameState.shadowMaps.push(this.viewShadowMap);
        }
    }, {
        key: "destroy",
        value: function destroy() {
            this.viewer.scene.postProcessStages.remove(this.postProcess);
            // this.videoTexture.destroy();
            this.viewer.scene.primitives.remove(this.cameraFrustum);
            this._videoEle && this._videoEle.parentNode.removeChild(this._videoEle);
            this.viewer.clock.onTick.removeEventListener(this.activeVideoListener);
            delete this.activeVideoListener;
            delete this.postProcess;
            delete this.viewShadowMap;
            delete this.color;
            delete this.viewDis;
            delete this.cameraPosition;
            delete this.position;
            delete this.alpha;
            delete this._camerafov;
            delete this._cameraPosition;
            delete this.videoTexture;
            delete this.cameraFrustum;
            delete this._videoEle;

            delete this._debugFrustum;
            delete this._position;
            delete this._aspectRatio;
            delete this.url;
            delete this.orientation;
            delete this.texture;
            delete this.videoId;
            delete this.type;
            delete this.videoTexture;
            delete this.url;
            this.viewer.scene.primitives.remove(this);
            delete this.viewer;
        }
    }, {
        key: "alpha",
        get: function get() {
            return this._alpha;
        },
        set: function set(val) {
            this._alpha = val;
        }

        //相机宽高比例

    }, {
        key: "aspectRatio",
        get: function get() {
            return this._aspectRatio;
        },
        set: function set(val) {
            this._aspectRatio = val;
            this._changeVideoWidHei();
        }
        //视椎体显隐

    }, {
        key: "debugFrustum",
        get: function get() {
            return this._debugFrustum;
        },
        set: function set(val) {
            this._debugFrustum = val;
            this.cameraFrustum.show = val;
        }
        //相机水平张角

    }, {
        key: "fov",
        get: function get() {
            return this._camerafov;
        },
        set: function set(val) {
            this._camerafov = Cesium.Math.toRadians(val);
            this._changeCameraFov();
        }
        //相机位置

    }, {
        key: "cameraPosition",
        get: function get() {
            return this._cameraPosition;
        },
        set: function set(pos) {
            if (!pos) return;
            this._cameraPosition = pos;
            this._changeCameraPos();
        }
        //视点位置

    }, {
        key: "position",
        get: function get() {
            return this._position;
        },
        set: function set(pos) {
            if (!pos) return;
            this._position = pos;
            this._changeViewPos();
        }
        //切换视频 播放/暂停

    }, {
        key: "videoPlay",
        get: function get() {
            return this._videoPlay;
        },
        set: function set(val) {
            this._videoPlay = Boolean(val);
            this._videoEle && (this.videoPlay ? this._videoEle.play() : this._videoEle.pause());
        }

        /** 所有相机的参数  */

    }, {
        key: "params",
        get: function get() {
            var viewJson = {};
            viewJson.type = this.type;
            if (this.type == VideoShed3D.Type.Color) viewJson.color = this.color;else viewJson.url = this.url;

            viewJson.position = this.position;
            viewJson.cameraPosition = this.cameraPosition;
            viewJson.fov = Cesium.Math.toDegrees(this.fov);
            viewJson.aspectRatio = this.aspectRatio;
            viewJson.alpha = this.alpha;
            viewJson.debugFrustum = this.debugFrustum;
            viewJson.dirObj = this._dirObj;
            return viewJson;
        }

        //显示和隐藏

    }, {
        key: "show",
        get: function get() {
            return this.defaultShow;
        },
        set: function set(val) {
            this.defaultShow = Boolean(val);
            this._switchShow();
        }
    }, {
        key: "camera",
        get: function get() {
            return this.viewShadowMap._lightCamera;
        }
        //========== 方法 ========== 

    }, {
        key: "disViewColor",
        get: function get() {
            return this._disViewColor;
        },
        set: function set(color) {
            if (!color) return;
            this._disViewColor = color;
            if (!color.a && color.a != 0) {
                this._disViewColor.a = 1.0;
            }
        }
    }]);

    return VideoShed3D;
}();

/***/ }),
/* 116 */
/***/ (function(module, exports) {

module.exports = "\r\n\r\n\r\n\r\nuniform float mixNum;\r\nuniform sampler2D colorTexture;\r\nuniform sampler2D stcshadow; \r\nuniform sampler2D videoTexture;\r\nuniform sampler2D depthTexture;\r\nuniform mat4 _shadowMap_matrix; \r\nuniform vec4 shadowMap_lightPositionEC; \r\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \r\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \r\nuniform vec4 disViewColor;\r\nvarying vec2 v_textureCoordinates;\r\nvec4 toEye(in vec2 uv, in float depth){\r\n    vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\r\n    vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\r\n    posInCamera =posInCamera / posInCamera.w;\r\n    return posInCamera;\r\n}\r\nfloat getDepth(in vec4 depth){\r\n    float z_window = czm_unpackDepth(depth);\r\n    z_window = czm_reverseLogDepth(z_window);\r\n    float n_range = czm_depthRange.near;\r\n    float f_range = czm_depthRange.far;\r\n    return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\r\n}\r\nfloat _czm_sampleShadowMap(sampler2D shadowMap, vec2 uv){\r\n    return texture2D(shadowMap, uv).r;\r\n}\r\nfloat _czm_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth){\r\n    return step(depth, _czm_sampleShadowMap(shadowMap, uv));\r\n}\r\nfloat _czm_shadowVisibility(sampler2D shadowMap, czm_shadowParameters shadowParameters){\r\n    float depthBias = shadowParameters.depthBias;\r\n    float depth = shadowParameters.depth;\r\n    float nDotL = shadowParameters.nDotL;\r\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\r\n    float darkness = shadowParameters.darkness;\r\n    vec2 uv = shadowParameters.texCoords;\r\n    depth -= depthBias;\r\n    vec2 texelStepSize = shadowParameters.texelStepSize;\r\n    float radius = 1.0;\r\n    float dx0 = -texelStepSize.x * radius;\r\n    float dy0 = -texelStepSize.y * radius;\r\n    float dx1 = texelStepSize.x * radius;\r\n    float dy1 = texelStepSize.y * radius;\r\n    float visibility = \r\n    (\r\n    _czm_shadowDepthCompare(shadowMap, uv, depth)\r\n    +_czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +\r\n    _czm_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)\r\n    ) * (1.0 / 9.0)\r\n    ;\r\n    return visibility;\r\n}\r\nvec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point){\r\n    vec3 v01 = point -planeOrigin;\r\n    float d = dot(planeNormal, v01) ;\r\n    return (point - planeNormal * d);\r\n}\r\nfloat ptm(vec3 pt){\r\n    return sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);\r\n}\r\nvoid main() \r\n{ \r\n    const float PI = 3.141592653589793;\r\n    vec4 color = texture2D(colorTexture, v_textureCoordinates);\r\n    vec4 currD = texture2D(depthTexture, v_textureCoordinates);\r\n    if(currD.r>=1.0){\r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n    \r\n    float depth = getDepth(currD);\r\n    vec4 positionEC = toEye(v_textureCoordinates, depth);\r\n    vec3 normalEC = vec3(1.0);\r\n    czm_shadowParameters shadowParameters; \r\n    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \r\n    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \r\n    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \r\n    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \r\n    shadowParameters.depthBias *= max(depth * 0.01, 1.0); \r\n    vec3 directionEC = normalize(positionEC.xyz - shadowMap_lightPositionEC.xyz); \r\n    float nDotL = clamp(dot(normalEC, -directionEC), 0.0, 1.0); \r\n    vec4 shadowPosition = _shadowMap_matrix * positionEC; \r\n    shadowPosition /= shadowPosition.w; \r\n    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \r\n    { \r\n        gl_FragColor = color;\r\n        return;\r\n    }\r\n\r\n    shadowParameters.texCoords = shadowPosition.xy; \r\n    shadowParameters.depth = shadowPosition.z; \r\n    shadowParameters.nDotL = nDotL; \r\n    float visibility = _czm_shadowVisibility(stcshadow, shadowParameters); \r\n\r\n    vec4 videoColor = texture2D(videoTexture,shadowPosition.xy);\r\n    if(visibility==1.0){\r\n        gl_FragColor = mix(color,vec4(videoColor.xyz,1.0),mixNum*videoColor.a);\r\n    }else{\r\n        if(abs(shadowPosition.z-0.0)<0.01){\r\n            return;\r\n        }\r\n        gl_FragColor = vec4(mix(color.rgb,disViewColor.rgb,disViewColor.a),disViewColor.a);\r\n    }\r\n} "

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Underground = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cesium = __webpack_require__(0);

var _Cesium2 = _interopRequireDefault(_Cesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//地下模式类
var Underground = exports.Underground = function () {
    //========== 构造方法 ========== 
    function Underground(viewer, options) {
        _classCallCheck(this, Underground);

        this._viewer = viewer;

        var opts = Cesium.defaultValue(options, {});

        this._depth = Cesium.defaultValue(opts.depth, 500);
        this._alpha = Cesium.defaultValue(opts.alpha, 0.5);

        this.enable = Cesium.defaultValue(opts.enable, false);
    }

    //========== 对外属性 ==========  
    //显示和隐藏


    _createClass(Underground, [{
        key: "_updateImageryLayersAlpha",


        //========== 方法 ========== 
        value: function _updateImageryLayersAlpha(alpha) {
            var _layers = this._viewer.imageryLayers._layers;
            for (var i = 0, len = _layers.length; i < len; i++) {
                _layers[i].alpha = alpha;
            }
        }

        //记录历史值，用于还原

    }, {
        key: "_historyOpts",
        value: function _historyOpts() {
            var oldOpts = {};
            oldOpts.alpha = Cesium.clone(this._viewer.imageryLayers._layers[0] && this._viewer.imageryLayers._layers[0].alpha);
            oldOpts.highDynamicRange = Cesium.clone(this._viewer.scene.highDynamicRange);
            oldOpts.skyShow = Cesium.clone(this._viewer.scene.skyAtmosphere.show);
            oldOpts.skyBoxShow = Cesium.clone(this._viewer.scene.skyBox.show);
            oldOpts.depthTest = Cesium.clone(this._viewer.scene.globe.depthTestAgainstTerrain);

            if (this._viewer.scene.globe._surface && this._viewer.scene.globe._surface._tileProvider && this._viewer.scene.globe._surface._tileProvider._renderState) oldOpts.blending = Cesium.clone(this._viewer.scene.globe._surface._tileProvider._renderState.blending);

            this._oldViewOpts = oldOpts;
        }
    }, {
        key: "activate",
        value: function activate() {
            if (this._enable) return;
            this._enable = true;

            this._historyOpts();
            this._updateImageryLayersAlpha(this._alpha);

            var viewer = this._viewer;

            Cesium.ExpandByMars.underEarth.cullFace = false;
            Cesium.ExpandByMars.underEarth.enable = true;
            Cesium.ExpandByMars.underEarth.enableDepth = this._depth;
            Cesium.ExpandByMars.underEarth.enableSkirt = true;

            viewer.scene.globe.depthTestAgainstTerrain = true;
            viewer.scene.highDynamicRange = false;
            viewer.scene.skyAtmosphere.show = false;
            viewer.scene.skyBox.show = false;

            if (viewer.scene.globe._surface._tileProvider && viewer.scene.globe._surface._tileProvider._renderState && viewer.scene.globe._surface._tileProvider._renderState.blending) {
                viewer.scene.globe._surface._tileProvider._renderState.blending.enabled = true;

                viewer.scene.globe._surface._tileProvider._renderState.blending.equationRgb = Cesium.BlendEquation.ADD;
                viewer.scene.globe._surface._tileProvider._renderState.blending.equationAlpha = Cesium.BlendEquation.ADD;

                viewer.scene.globe._surface._tileProvider._renderState.blending.functionSourceAlpha = Cesium.BlendFunction.ONE;
                viewer.scene.globe._surface._tileProvider._renderState.blending.functionSourceRgb = Cesium.BlendFunction.ONE;

                viewer.scene.globe._surface._tileProvider._renderState.blending.functionDestinationAlpha = Cesium.BlendFunction.ZERO;
                viewer.scene.globe._surface._tileProvider._renderState.blending.functionDestinationRgb = Cesium.BlendFunction.ZERO;
            }
        }
    }, {
        key: "disable",
        value: function disable() {
            if (!this._enable) return;
            this._enable = false;

            this._updateImageryLayersAlpha(this._oldViewOpts.alpha);

            var viewer = this._viewer;

            Cesium.ExpandByMars.underEarth.cullFace = undefined;
            Cesium.ExpandByMars.underEarth.enable = false;
            Cesium.ExpandByMars.underEarth.enableDepth = 0;
            Cesium.ExpandByMars.underEarth.enableSkirt = false;

            viewer.scene.globe.depthTestAgainstTerrain = this._oldViewOpts.depthTest;
            viewer.scene.skyBox.show = this._oldViewOpts.skyBoxShow;
            viewer.scene.highDynamicRange = this._oldViewOpts.highDynamicRange;
            viewer.scene.skyAtmosphere.show = this._oldViewOpts.skyShow;

            if (this._oldViewOpts.blending != undefined) viewer.scene.globe._surface._tileProvider._renderState.blending = this._oldViewOpts.blending;
        }
    }, {
        key: "destroy",
        value: function destroy() {
            delete this._viewer;
            delete this._alpha;
            delete this._depth;
            delete this._enable;
            delete this._oldViewOpts;
        }
    }, {
        key: "alpha",
        get: function get() {
            return this._alpha;
        },
        set: function set(val) {
            this._alpha = Number(val);

            if (!this._enable) return;
            this._updateImageryLayersAlpha(this._alpha);
        }
    }, {
        key: "depth",
        get: function get() {
            return this._depth;
        },
        set: function set(val) {
            this._depth = Number(val);

            if (!this._enable) return;
            Cesium.ExpandByMars.underEarth.enableDepth = this._depth;
        }
    }, {
        key: "enable",
        get: function get() {
            return this._enable;
        },
        set: function set(value) {
            if (value) this.activate();else this.disable();
        }
    }]);

    return Underground;
}();

/***/ })
/******/ ]);
});