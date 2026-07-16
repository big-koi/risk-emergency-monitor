const _MapConfigUrl = mapConfig.absoluteUrls.xml;
const _GeoJsonUrl = mapConfig.absoluteUrls.geoJson;

import _Esri2geo from "esri2geo";
import _X2js from 'x2js';
import { get as _ServerGet, getGISQuery as _ServerGetGISQuery } from '../../utils/http-service';
import img from '../../assets/images/mark/mark.png';
import msgImg from '../../assets/images/earth/map_icon_bg.png';
import title_icon from '../../assets/images/earth/title_icon.png';

const _ServiceUrl = servicesConfig.servicesUrl;

export default {

  Map: null, //球对象
  MapConfig: null,
  PrevMapIds: null, //changeMap加载的地图id集合
  GeoJSONLayerId: "GeoJSONLayerId", //专题图id，用于分级图、柱状图、饼图的layerId
  drawControl: null,
  earth: null,
  arrPoint: [],
  MaxTopOrder: null, //顶图使用的最大order
  MaxBaseOrder: null, //默认地图使用的最大order

  /**
   * 初始化
   * @param {*} map 球对象
   * @param earth
   */
  async init(map, earth) {
    this.Map = map;
    if (window.Zf_MapConfig == null) {
      const res = await _ServerGet(_MapConfigUrl);
      const x2js = new _X2js();
      window.Zf_MapConfig = x2js.xml2js(res);
    }
    this.MapConfig = window.Zf_MapConfig;
    this.PrevMapIds = [];
    this.MaxTopOrder = 99;
    this.MaxBaseOrder = 0;
    this.earth = earth;

  },
  /**
   * 获取地图配置
   * @param {String | string[]} codes 地图编码集合
   * @param {*} year 年份（可为空）
   */
  getMaps(codes, year) {
    if (!Array.isArray(codes)) codes = [codes];
    const mapConfigMaps = this.MapConfig.mapConfig.map;

    //若参数year不为null，直接返回对应code和year的地图
    if (year != null) return mapConfigMaps.filter(map => codes.indexOf(map._code) != -1 && (map._year == null || map._year == year));

    //若参数year为null，则需要返回对应code和year值最大（优先取year不为null的）的地图
    const codeMaxYearMap = [];
    for (let i = 0; i < mapConfigMaps.length; i++) {
      const map = mapConfigMaps[i];
      const mcode = map._code;
      const myear = map._year;
      if (codes.indexOf(map._code) == -1) continue; //
      let existMap = codeMaxYearMap.filter(cmap => cmap.code == mcode)[0]; //是否在codeMaxYearMap已添加过
      if (existMap == null) {
        existMap = {
          code: mcode,
          maxYear: myear, //existMap.maps的最大年份
          maps: [map], //year值相同的地图集合
        }
        codeMaxYearMap.push(existMap); //添加
      } else {
        if (myear == existMap.maxYear) { //year值相同则继续增加
          existMap.maps.push(map);
        } else if (myear != null && (existMap.maxYear == null || myear > existMap.maxYear)) { //若year值大于原最大year值，则替换
          existMap.maxYear = myear;
          existMap.maps = [map];
        } else { //否则不发生变化

        }
      }
    }
    let maps = [];
    for (let i = 0; i < codeMaxYearMap.length; i++) { //重新组合
      maps = maps.concat(codeMaxYearMap[i].maps);
    }
    return maps;
  },

  /**
   * 加载默认地图
   * @param {String | string[]} codes 地图编码集合
   */
  loadDefaultMaps(codes) {
    const maps = this.getMaps(codes);
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      map["order"] = map._top === true ? this.MaxTopOrder-- : this.MaxBaseOrder++;
    }
    this.addLayers(maps);
  },

  /**
   * 切换地图
   * @param {String | string[]} codes 地图编码集合
   * @param {*} year 年份（可为空）
   */
  changeMap(codes, year) {
    this.removeMap();
    const maps = this.getMaps(codes, year);
    let order = 0;
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      map["order"] = this.MaxBaseOrder + (++order);
      this.PrevMapIds.push(map.order);
    }
    this.addLayers(maps);
  },

  /**
   * 移除地图（不包括defaultMaps）
   */
  removeMap() {
    //移除PrevMap
    this.PrevMapIds.forEach(id => this.Map.removeLayerById(id));
    this.PrevMapIds = [];

    //移除GeoJSONLayer
    this.Map.removeLayerById(this.GeoJSONLayerId);

    this.clearDraw();
  },

  /**
   * 添加layer
   * @param {*} maps 地图集合
   */
  addLayers(maps) {
    for (let i = 0; i < maps.length; i++) {
      const map = maps[i];
      let layerIds = null;
      if (map._layerIds != null) {
        const layerIdsStr = map._layerIds.replace(/ /g, "");
        if (layerIdsStr != "") layerIds = layerIdsStr.split(",");
      }
      const mapLayer = this.Map.layerManager.createLayer(map.order + "", map._type || 2, map._url, {
        name: map._name || "",
        layers: layerIds,
        order: map.order,
      });
      this.Map.addLayer(mapLayer);
      this.Map.layerManager.setLayerOpacity(mapLayer, map._opacity || 1);
    }
  },

  //地图截图
  getMapImage() {
    return this.Map.getViewImg();
  },

  //恢复到全图视角
  toMapFull() {
    this.Map.fullExtent();
  },

  /**
   * 图斑定位
   * @param {String} code 地图编码
   * @param {*} year 年份（可为空）
   * @param {*} row 数据行
   * @param {*} relateField 数据中的关联字段
   * @param {*} relateFieldMap 地图服务中的关联字段
   * @param {*} callback 回调函数
   */
  locateMap(code, year, row, relateField, relateFieldMap, callback) {
    const maps = this.getMaps(code, year);
    if (maps.length == 0) {
      console.error("未找到定位服务：{code:" + code + ",year:" + year + "}");
      return;
    }
    const map = maps[0];
    relateField = map._relateField || relateField;
    relateFieldMap = map._relateFieldMap || relateFieldMap;
    // console.log("当前定位字段：{relateField:"+relateField+",relateFieldMap:"+relateFieldMap+"}" + "，可用定位字段：" + Object.keys(row));
    _ServerGetGISQuery(
      map._url,
      map._locateLayerId || 0,
      relateFieldMap,
      row[relateField],
      true
    ).then(res => {
      if (res == null || res.features == null || res.features.length == 0) {
        console.error("未查询到features");
        return;
      }
      _Esri2geo(res, (err, data) => {
        this.Map.layerManager.clearSelectLayer();
        this.Map.zoomToFeatures(data.features);
      });
      if (callback) callback(res);
    });
  },

  /**
   * 图斑定位
   * @param {String} code 地图编码
   * @param {*} year 年份（可为空）
   * @param {*} row 数据行
   * @param {*} relateField 数据中的关联字段
   * @param {*} relateFieldMap 地图服务中的关联字段
   * @param {*} callback 回调函数
   */
  locateMapByCode(code, year, row, relateField, relateFieldMap, callback) {
    const maps = this.getMaps(code, year);
    if (maps.length == 0) {
      console.error("未找到定位服务：{code:" + code + ",year:" + year + "}");
      return;
    }
    const map = maps[0];
    relateField = map._relateField || relateField;
    relateFieldMap = map._relateFieldMap || relateFieldMap;
    // console.log("当前定位字段：{relateField:"+relateField+",relateFieldMap:"+relateFieldMap+"}" + "，可用定位字段：" + Object.keys(row));
    _ServerGetGISQuery(
      map._url,
      map._locateLayerId || 0,
      relateFieldMap,
      row[relateField],
      true
    ).then(res => {
      if (res == null || res.features == null || res.features.length == 0) {
        console.error("未查询到features");
        return;
      }
      _Esri2geo(res, (err, data) => {
        this.Map.layerManager.clearSelectLayer();
        this.Map.zoomToFeatures(data.features);
      });
      if (callback) callback(res);
    });
  },

  //加载分级图
  addClassMap(xzqdm, colors, data, valueField, xzqField, year, showMapType) {
    return this.addGeoJSONLayer("52", xzqdm, colors, data, valueField, xzqField, year, showMapType);
  },

  //加载柱状图
  addBarMap(xzqdm, colors, data, valueField, xzqField, showMapType) {
    return this.addGeoJSONLayer("53", xzqdm, colors, data, valueField, xzqField, showMapType);
  },

  //加载饼图
  addPieMap(xzqdm, colors, data, valueField, xzqField, showMapType) {
    return this.addGeoJSONLayer("54", xzqdm, colors, data, valueField, xzqField, showMapType);
  },
  //加载热力图
  addHeatMap(xzqdm, colors, data, valueField, xzqField, year, showMapType) {
    return this.addGeoHeatJSONLayer("51", xzqdm, colors, data, valueField, xzqField, year, showMapType);
  },
  /**
   * 加载专题图
   * @param type
   * @param {*} xzqdm 行政区代码
   * @param {*} colors 色带
   * @param {*} data 数据
   * @param {*} valueField 数据的值字段
   * @param {*} xzqField 数据的行政区代码字段
   * @param year
   * @param showMapType
   */
  addGeoJSONLayer(type, xzqdm, colors, data, valueField, xzqField, year, showMapType) {
    this.removeMap();
    try {
      data.forEach(obj => { //防止有字符类型的数字
        valueField.forEach(field => {
          if (field.digit) {
            obj[field.field] = Number(obj[field.field]).toFixed(2);
          } else {
            obj[field.field] = parseFloat(obj[field.field]);
          }
        })
      });
      let str = "";
      if (showMapType) {
        str = "_" + showMapType;
      }
      let url = _GeoJsonUrl + (xzqdm + "0000").substring(0, 6) + str + ".json";
      let layer = this.Map.layerManager.createLayer(this.GeoJSONLayerId, type, url, {
        colors: colors,
        data: data,
        valueField: valueField,
        xzqField: xzqField,
        height: 1500,
        //maxData:100,
        //minData:0,
        isShowLabel: false,
        //legendNode:"%",
        labelOptions: {
          "ShowField": "name",
          "fontSize": "0.01rem",
          "fontStyle": "微软雅黑",
          modelOpacity: 0.5
        },
      })
      this.Map.addLayer(layer);
      if (this.Map.MapType == 3) {
        setTimeout(() => {
          this.drawPoint(data, xzqdm, xzqField, valueField, year, showMapType);
        }, 1000)
      } else if (this.Map.MapType == 2) {
        setTimeout(() => {
          this.drawPoint2(data, xzqdm, xzqField, valueField, year, showMapType);
        }, 1000)
      }
      return layer.getLayer().legend;
    } catch (error) {
      console.error("加载GeoJSONLayer失败");
      console.error(error);
    }
  },
  /**
   * 加载热力图
   * @param type
   * @param {*} xzqdm 行政区代码
   * @param {*} colors 色带
   * @param {*} data 数据
   * @param {*} valueField 数据的值字段
   * @param {*} xzqField 数据的行政区代码字段
   * @param year
   * @param showMapType
   */
  addGeoHeatJSONLayer(type, xzqdm, colors, data, valueField, xzqField, year, showMapType) {
    let me = this;
    this.removeMap();

    try {
      data.forEach(obj => { //防止有字符类型的数字
        valueField.forEach(field => {
          obj[field.field] = Number(obj[field.field])
        })
      });
      if (year == "全部") {
        year = "";
      }
      _ServerGet(_ServiceUrl + "/thematic/getGzjzRsjzqkrlt", { xzqdm: xzqdm, nf: year })
        .then(function (res) {
          let url = { Data: [] }
          let X = 0, Y = 0;

          for (let i = 0; i < res.data.length; i++) {
            let par = { id: null, X: null, Y: null, Count: null };
            par.id = res.data[i].id;
            par.X = Number(res.data[i].x);
            par.Y = Number(res.data[i].y);
            par.Count = res.data[i].count;
            url.Data.push(par);
            X = Number(res.data[i].x) + X;
            Y = Number(res.data[i].y) + Y;
          }

          //let url = window.Zf_MainConfig.PATH.WebBaseUrl+"/static/data/heat.json";//_GeoJsonUrl + (xzqdm + "0000").substr(0, 6) + ".json";
          let layer = me.Map.layerManager.createLayer(me.GeoJSONLayerId, type, url, {
            "name": "热力图",
            "center": {
              "x": X / res.data.length,
              "y": Y / res.data.length,
              //"x":119.756,
              //"y":32.175,
              "z": 100000
            }
            //ShowField:valueField[0].field
          });
          me.Map.addLayer(layer);
          return layer.getLayer().legend;
        })
        .catch(function (error) {
          console.error(error);
        });

    } catch (error) {
      console.error("加载GeoJSONLayer失败");
      console.error(error);
    }
  },
  /**
   * 增加聚类点
   * @param {*} data
   * @param {*} xzqdm
   * @param {*} xzqField
   * @param {*} valueField
   * @param year
   * @param showMapType
   */
  drawJLPoint(data, xzqdm, xzqField, valueField, year, showMapType) {
    let me = this;
    //this.removeMap();
    me.clearDraw();
    try {
      let prams = { xzqdm: xzqdm, cj: "", year: me.getYear(year), type: showMapType };
      if (xzqdm == "") {
        prams = { xzqdm: xzqdm, cj: 3, year: me.getYear(year), type: showMapType }
      }
      _ServerGet(_ServiceUrl + "/thematic/queryXzqhZxdzb", prams)
        .then(function (res) {
          //let arrPoint=[];
          for (let i = 0; i < res.data.length; i++) {
            let tbcount = 0;
            res.data[i].count = 0;
            for (let j = 0; j < data.length; j++) {
              if (data[j][xzqField] == res.data[i].XZQDM) {
                res.data[i].count = data[j][valueField[0].field];
                tbcount++;
              }
            }
            //res.data[i].count = tbcount;
            let center = {};
            if (me.Map.MapType == 3) {
              center = DiitEarth.point.getCenter(me.earth._viewer);
            } else if (me.Map.MapType == 2) {
              center = { x: res.data[i].ZXDXZB, y: res.data[i].ZXDYZB };
            }
            if (me.Map.MapType == 3) {
              let html = `<div style="width:0.42rem;height:0.58rem;background:url(${img}) no-repeat;background-size:100% 100%;">
                <div class="title" style="font-size:0.18rem;line-height:0.40rem;font-weight:bold;color:#fc8036;">` + res.data[i].count + `</div>`;
              html = html + `</div>`;
              let divpoint = new DiitEarth.DivPoint(me.earth._viewer, {
                html: html,
                position: Cesium.Cartesian3.fromDegrees(Number(res.data[i].ZXDXZB), Number(res.data[i].ZXDYZB), center.z || 424),
                anchor: [0, 0],
                click: function (e) {//单击后的回调
                  //haoutil.msg('单击了点'+e);
                },
                options: {
                  "aa": 123,
                  "bb": 456,
                  "cc": 789
                },
              });
              me.arrPoint.push(divpoint);
            } else if (me.Map.MapType == 2) {
              let markidd = "markkkk_" + i;
              let html = `<div id="${markidd}" style="width:0.42rem;height:0.58rem;background:url(${img}) no-repeat;background-size:100% 100%;">
                <div class="title" style="font-size:0.18rem;line-height:0.40rem;font-weight:bold;color:#fc8036;">` + res.data[i].count + `</div>`;
              html = html + `</div>`;
              $("#" + me.Map.target).append(html);
              let options = { domid: markidd, position: [center.x, center.y], notLocate: true };
              me.Map.addMarker(options);
            }
          }

        })
        .catch(function (error) {
          console.error(error);
        });
    } catch (error) {
      console.error("加载drawPoint失败");
      console.error(error);
    }
  },

  getYear(year) {
    if (year == null || year == "") {
      return "2019";
    }
    return year;
  },

  drawPoint(data, xzqdm, xzqField, valueField, year, showMapType) {
    let me = this;
    me.clearDraw();
    try {
      _ServerGet(_ServiceUrl + "/thematic/queryXzqhZxdzb", {
        xzqdm: xzqdm,
        cj: "",
        year: me.getYear(year),
        type: showMapType
      })
        .then(function (res) {
          //let arrPoint=[];
          for (let i = 0; i < res.data.length; i++) {
            let item = data.find(function (re) {
              return re[xzqField] == res.data[i].XZQDM;
            });
            if (item == null) {
              continue;
            }
            let center = DiitEarth.point.getCenter(me.earth._viewer);
            let html = `<div class="divpoint2" style="background: url(${msgImg}) no-repeat;background-size:100% 100%;padding:0.10rem;text-align:left;color:#fff;">
            <div class="title" style="font-size:0.17rem;font-weight:bold;color:#fff;padding:0.05rem 0;padding-bottom:0.15rem;"><img src="${title_icon}" style="padding-right:0.10rem;"/>` + res.data[i].XZQMC + `</div>`;
            for (let j = 0; j < valueField.length; j++) {
              html = html + `<div class="content">` + valueField[j].name + `：` + item[valueField[j].field] + (valueField[j].lend || "") + `</div> `;
            }
            html = html + `</div >`;
            // let html = `<div class="divpoint2" style="box-shadow: 0 0 0.66rem 0 let(--activeShadow1) inset;border: 0.01rem solid #00faff;padding:0.10rem;text-align:left;color:#fff;">
            // <div class="title" style="font-size:0.17rem;font-weight:bold;color:#333;">`+res.data[i].XZQMC+`</div>`;
            // for(let j=0;j<valueField.length;j++){
            //   let name ="";
            //   if(valueField[j].name!=undefined){
            //     name = valueField[j].name;
            //   }
            //   html = html +`<div class="content">`+name+`：`+item[valueField[j].field]+(valueField[j].lend||"")+`</div> `;
            // }
            // html =html+`</div >`;
            let divpoint = new DiitEarth.DivPoint(me.earth._viewer, {
              html: html,
              position: Cesium.Cartesian3.fromDegrees(Number(res.data[i].ZXDXZB), Number(res.data[i].ZXDYZB), center.z || 424),
              anchor: [0, 0],
              click: function (e) {//单击后的回调
                //haoutil.msg('单击了点'+e);
              },
              options: {
                "aa": 123,
                "bb": 456,
                "cc": 789
              },
            });
            me.arrPoint.push(divpoint);
          }

        })
        .catch(function (error) {
          console.error(error);
        });
    } catch (error) {
      console.error("加载drawPoint失败");
      console.error(error);
    }
  },

  drawPoint2(data, xzqdm, xzqField, valueField, year, showMapType) {
    let me = this;
    me.clearDraw();
    try {
      _ServerGet(_ServiceUrl + "/thematic/queryXzqhZxdzb", {
        xzqdm: xzqdm,
        cj: "",
        year: me.getYear(year),
        type: showMapType
      })
        .then(function (res) {
          //let arrPoint=[];
          for (let i = 0; i < res.data.length; i++) {
            let item = data.find(function (re) {
              return re[xzqField] == res.data[i].XZQDM;
            });
            if (item == null) {
              continue;
            }
            // let center = DiitEarth.point.getCenter(me.earth._viewer);
            let center = [res.data[i].ZXDXZB, res.data[i].ZXDYZB];
            let markidd = "markkkk_" + i;
            // let html = `<div id="${markidd}" class="divpoint2" style="background: linear-gradient(-90deg,rgba(2, 17, 61, 0.7) 0%,rgba(2, 17, 61, 0.7) 100%);border: 0.01rem solid #21beff;padding:0.10rem;text-align:left;color:#fff;">
            // <div class="title" style="font-size:0.17rem;font-weight:bold;color:#00F7FF;">`+res.data[i].XZQMC+`</div>`;
            // for(let j=0;j<valueField.length;j++){
            //   html = html +`<div class="content">`+valueField[j].name+`：`+item[valueField[j].field]+(valueField[j].lend||"")+`</div> `;
            // }
            let html = `<div id="${markidd}" class="divpoint2" style="background: url(${msgImg}) no-repeat;background-size:100% 100%;padding:0.10rem;text-align:left;color:#fff;">
              <div class="title" style="font-size:0.17rem;font-weight:bold;color:#fff;padding:0.05rem 0;padding-bottom:0.15rem;"><img src="${title_icon}" style="padding-right:0.10rem;"/>` + res.data[i].XZQMC + `</div>`;
            for (let j = 0; j < valueField.length; j++) {
              let name = "";
              if (valueField[j].name != undefined) {
                name = valueField[j].name;
              }
              html = html + `<div class="content">` + name + `：` + item[valueField[j].field] + (valueField[j].lend || "") + `</div> `;
            }
            html = html + `</div >`;
            $("#" + me.Map.target).append(html);
            let options = { domid: markidd, position: center, notLocate: true };
            me.Map.addMarker(options);
          }

        })
        .catch(function (error) {
          console.error(error);
        });
    } catch (error) {
      console.error("加载drawPoint失败");
      console.error(error);
    }
  },

  /**
   * 清楚绘制的点
   */
  clearDraw() {
    let me = this;
    if (me.Map.MapType == 2) {
      me.Map.clearOverlay();
      return;
    }
    me.earth.drawControl.deleteAll();

    for (let i = 0, len = me.arrPoint.length; i < len; i++) {
      me.arrPoint[i].destroy();
    }
    me.arrPoint = [];
  }

}
