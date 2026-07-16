// import { Circle, Fill, Stroke, Style, Icon, Text } from "ol/style.js";
const { Cesium } = window;
// import { Tile } from 'ol/layer'
// import TileArcGISRest from 'ol/source/TileArcGISRest'
// import { LineString } from "ol/geom";
import { decrypt, encrypt } from "../../utils/complete.js";
import _Uuid from "uuid";
export default {
  addDynamicServer({ layerName, url, type }) {
    let layers = me.earth.layerManager.getLayers();
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].id == "评估级别") {
        // me.earth.layerManager.removeLayer(layers[i])
        me.earth.removeLayer(layers[i]);
        break;
      }
    }
    let layer = me.earth.layerManager.createLayer(layerName, type, url, {
      visible: true,
      name: "评估级别"
      // projection: 4326,
    });
    // me.earth.layerManager.addLayer(layer)
    me.earth.addLayer(layer);
  },
  /**
   * 添加图片底图加载
   * @param {图层名称,图片http地址} param0
   */
  addImage({ layerName, url, imageExtent, name, index, layerArray }) {
    let that = this;
    let layer = me.earth.layerManager.createLayer(layerName, 8, url, {
      visible: true,
      opacity: 0.5,
      name: layerName || "降雨数据",
      projection: 4326,
      // imageExtent:[18.160896, 17.15, 135.1015, 53.56207]
      imageExtent: imageExtent
        ? imageExtent
        : [
          73.45000183189649,
          18.170002914016372,
          135.0899935646413,
          53.54999816879432
        ]
    });
    layer.getLayer().getSource().on('imageloadend', () => {
      if (layerArray && index < layerArray.length - 1) {
        let layerName2 = layerArray[index + 1].layerName;
        let url2 = layerArray[index + 1].url
        let imageExtent2 = layerArray[index + 1].imageExtent
        that.addImage({
          layerName: layerName2,
          url: url2,
          imageExtent: imageExtent2,
          name: null,
          index: index + 1,
          layerArray: layerArray,
          opacity:  0.5
        })
      }
    });
    me.earth.addLayer(layer);
    // me.earth.render(); // 手动触发渲染
  },
  // addImage({ layerName, url, imageExtent, name, index, layerArray }) {
  //   debugger
  //   let that = this;
  //   console.log('layerName', layerName);
  //   console.log(imageExtent)
  //   console.log(layerArray)
  //   const url1 = "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"; // 其他图片
  //   const url2 = "http://117.147.213.220:8282/fzmx/file/projectServerTask/2025/202507/20250717/flood_output/2025071713_DL/depth2png/331000_depth_20250717134800.png" // 正常叠加图
  //   const url3 = "http://117.147.213.220:8282/fzmx/file/projectServerTask/2025/202507/20250709/flood_output/2025070915_DL/depth2png/150200_depth_20250709154200.png" //包头市行政区域图
  //   let layer = me.earth.layerManager.createLayer(layerName, 8, url3, {
  //     visible: true,
  //     opacity: 1,
  //     name: layerName || "降雨数据",
  //     projection: 4326,
  //     crossOrigin: 'anonymous',
  //     // imageExtent:[18.160896, 17.15, 135.1015, 53.56207]
  //     imageExtent:[
  //         109.24708333396691,
  //         40.242916666825224,
  //         111.44319444508183,
  //         42.735972222385115
  //       ]
  //   });
  //   layer.getLayer().getSource().on('imageloadend', () => {
  //     debugger
  //     // alert(`图片 ${layerName} 加载完成`);
  //     console.log(`图片 ${layerName} 加载完成，开始加载下一张`);
  //     // if (layerArray && index < layerArray.length - 1) {
  //     //   let layerName2 = layerArray[index + 1].layerName;
  //     //   let url2 = layerArray[index + 1].url
  //     //   let imageExtent2 = layerArray[index + 1].imageExtent
  //     //   that.addImage({
  //     //     layerName: layerName2,
  //     //     url: url2,
  //     //     imageExtent: imageExtent2,
  //     //     name: null,
  //     //     index: index + 1,
  //     //     layerArray: layerArray,
  //     //     opacity:  0.5
  //     //   })
  //     // }
  //   });
  //   layer.getLayer().getSource().on('imageloaderror', (error) => {
  //       debugger
  //     // alert(`图片 ${layerName} 加载完成`);
  //     console.log(error);

  //   })


  //   me.earth.addLayer(layer);
  //   // me.earth.render(); // 手动触发渲染
  // },
  addModel({}) {},

  addVFD({
    layerName,
    tableName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField = "geom",
    legendNumber,
    schemaName,
    themeSettings,
    param
  }) {
    // let url = `http://127.0.0.1:8080/geometry/${tableName}/{z}/{x}/{y}?srs=4490&showType=1&geomField=id,gradecode&geomShow=geom&customSearchCondition=BASE64` + Buffer.from("(substr(code,1,2) ='37') and  taskid='1825'  and (code like '3711%')").toString('base64');
    let url = `${servicesConfig.servicesUrl}/geometry/${tableName}/{z}/{x}/{y}`;
    // let url = `http://192.9.30.218:30001/xjdzpg/geometry/${tableName}/{z}/{x}/{y}`;
    // let url = `http://127.0.0.1:7002/geometry/${tableName}/{z}/{x}/{y}`;

    // let url = `http://127.0.0.1:8080/geometry/${tableName}/{z}/{x}/{y}`;
    if (tableName.startsWith("czttj_result_")) {
      this.addVFDCzttj(
        url,
        layerName,
        renderField,
        renderId,
        render,
        ininExtent,
        filterCondition,
        attributeFields,
        geomField,
        legendNumber,
        schemaName,
        themeSettings,
        param
      );
    } else {
      this.addVFDNew(
        url,
        layerName,
        renderField,
        renderId,
        render,
        ininExtent,
        filterCondition,
        attributeFields,
        geomField,
        legendNumber,
        schemaName,
        themeSettings
      );
    }
  },
  /**
   * 因为逻辑问题, 只使用承灾体数据
   * @param {} param0
   */
  addVFDIcon({
    layerName,
    tableName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField = "geom",
    legendNumber,
    schemaName,
    themeSettings
  }) {
    // let url = `http://127.0.0.1:8080/geometry/${tableName}/{z}/{x}/{y}?srs=4490&showType=1&geomField=id,gradecode&geomShow=geom&customSearchCondition=BASE64` + Buffer.from("(substr(code,1,2) ='37') and  taskid='1825'  and (code like '3711%')").toString('base64');
    let url = `${servicesConfig.servicesUrl}/geometry/${tableName}/{z}/{x}/{y}`;
    // let url = `http://127.0.0.1:7002/geometry/${tableName}/{z}/{x}/{y}`;
    // let url = `http://192.9.30.218:30001/xjdzpg/geometry/${tableName}/{z}/{x}/{y}`;

    // let url = `http://127.0.0.1:8080/geometry/${tableName}/{z}/{x}/{y}`;
    this.addVFDNewIcon(
      url,
      layerName,
      renderField,
      renderId,
      render,
      ininExtent,
      filterCondition,
      attributeFields,
      geomField,
      legendNumber,
      schemaName,
      themeSettings
    );
  },
  addVFDNewIcon(
    url,
    layerName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField,
    legendNumber,
    schemaName,
    themeSettings
  ) {
    const defaultStyle = {
      projection: 4490,
      style: {
        "fill-color": "#6495ED",
        "stroke-color": "#6495ED",
        "stroke-width": 0,
        "circle-radius": 3,
        "circle-fill-color": "#6495ED",
        "circle-stroke-color": "#6495ED",
        "circle-stroke-width": 0
      }
    };
    const options = {
      name: layerName,
      visible: true,
      projection: defaultStyle.projection,
      tileGrid: {
        extent: [-180, -90, 180, 90],
        origin: [-180, 90],
        tileSize: [512, 512],
        resolutions: [
          0.3515625,
          0.17578125,
          0.087890625,
          0.0439453125,
          0.02197265625,
          0.010986328125,
          0.0054931640625,
          0.00274658203125,
          0.001373291015625,
          0.0006866455078125,
          0.00034332275390625,
          0.000171661376953125,
          0.0000858306884765625,
          0.00004291534423828125,
          0.000021457672119140625,
          0.000010728836059570312,
          0.000005364418029785156,
          0.000002682209014892578,
          0.000001341104507446289,
          6.705522537231445e-7,
          3.3527612686157227e-7,
          1.6763806343078613e-7
        ]
      },
      style: defaultStyle.style
    };
    // 渲染的颜色
    let renderConfig = null;
    if (render) {
      renderConfig = render;
    } else {
      renderConfig = mapConfig.render.find(item => item.id == renderId);
    }
    renderField = renderField || renderConfig.relatedField;
    const toRender = renderConfig != null;
    if (toRender) {
      const legend = [];
      const values = [];
      for (let i = 0; i < renderConfig.render.length; i++) {
        const rcr = renderConfig.render[i];
        legend.push({
          color: rcr.color,
          label: rcr.alias,
          type: renderConfig.geotype
        });
        // 有的点型配置方案有点的大小配置
        if (rcr.radius) {
          legend[legend.length - 1].radius = rcr.radius;
        }
        let tempStyle = {};
        tempStyle.value = rcr.name;
        if (renderConfig.geotype == "LineString") {
          //线型渲染方案
          tempStyle.style = {
            "fill-color": "transparent",
            "stroke-color": rcr.color,
            "stroke-width": rcr.width || 1
          };
        } else if (renderConfig.geotype == "Point") {
          //点型渲染方案
          tempStyle.style = {
            "circle-radius": !rcr.radius ? 10 : Math.ceil(rcr.radius / 1.5), //快显的点radius值渲染出来比较大，减小一点
            "circle-fill-color": rcr.color,
            "circle-stroke-color": "transparent",
            "circle-stroke-width": 0
          };
        } else {
          //面型渲染方案
          tempStyle.style = this.getRenderStyle(rcr);
        }
        values.push(tempStyle);
      }
      options["legend"] = legend;
      options.style = values[0].style;
    }
    if (renderField == null && attributeFields == null) {
      attributeFields = "id";
    } else if (renderField != null && attributeFields != null) {
      attributeFields = attributeFields + "," + renderField;
    } else {
      attributeFields = attributeFields || renderField;
    }
    geomField = geomField || "geom";
    url =
      url +
      `?srs=${themeSettings.srs || "4490"}&showType=1&geomField=` +
      attributeFields +
      "&geomShow=" +
      geomField;
    url += `&taskId=${themeSettings.taskId}&stepNum=${themeSettings.stepNum}`;
    if (filterCondition) {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from(filterCondition).toString("base64");
    } else {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from("1=1").toString("base64");
    }
    console.info("==========vfdurl=========");
    console.log(url);

    /*  清空render 使用默认
    if (options.render) {
        delete options.render
    } */
    // 图例
    // options.legend = []

    console.log("options=", options);
    const random = Math.round(Math.random() * 100);
    // const layer = me.earth.layerManager.createLayer('vfd_' + random, 18, url, options)
    const layer = me.earth.layerManager.createLayer(
      "vfd_" + random,
      18,
      url,
      options
    );
    me.earth.addLayer(layer);
    /// start
    /// end

    //分段渲染快显，通过layer.setStyle在图层已经创建好了之后再设置style
    layer.getLayer().setStyle((feature, resolution) => {
      // var geometry = feature.getGeometry();
      // 历史地震置灰
      let icon = themeSettings.icon;
      if (feature.properties_.highlight == 0) {
        icon = themeSettings.iconGray;
      }
      // 历史地震的不需要缩放
      let scale = feature.properties_.layer == "history_event_result" ? 1 : 0.5;
      // 创建自定义图片的图标对象
      var iconStyle = new ol.style.Icon({
        src: icon, // 自定义图片的路径
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        scale: scale // 图片的缩放比例
      });
      // 设置点要素的样式
      var style = new ol.Style.Style({
        image: iconStyle
      });

      return style;
    });
    return;
    layer.getLayer().setStyle((feature, resolution) => {
      debugger;
      let currIntervalValue = this.getArrayGroupByField(
        renderField,
        themeSettings.propertyData,
        renderConfig.render.length - 1
      );
      if (currIntervalValue) {
        let group = 0;
        //获取当前阶段合适的分组值
        let suitableValue = this.getSuitableValue(
          currIntervalValue,
          feature.properties_[renderField]
        );
        if (suitableValue) {
          group = suitableValue.count;
        } else {
          group = renderConfig.render.length - 1;
        }
      } else {
        return [
          new ol.style.Style({
            stroke: new Stroke({
              color: "#666772e0",
              width: 1
            }),
            fill: new Fill({
              color: defaultStyle.style["fill-color"]
            })
          })
        ];
      }
    });
  },
  /**
   * 快显加载
   * @param {*} url 服务地址
   * @param {*} layerName 服务名称
   * @param {*} renderField 渲染字段（可为null）
   * @param {*} renderId 关联渲染（为null时，使用默认颜色渲染）
   * @param {*} ininExtent 定位范围（加载服务需要定位时）
   * @param {*} filterCondition 过滤条件（town like '371103%'）
   * @param {*} attributeFields 属性字段（renderField不为null或者表中存在gid字段时可为null，否则传递一个表中存在的非空间字段）（单值、分段专题图时renderField不为null或者表中存在gid字段时也要传一个非空间字段？但是可以不是gid、id等唯一标识的字段？）
   * @param {*} geomField geom字段（默认为geom）
   * @param {*} legendNumber 图例数量（一般情况下为null即可）
   * @param {*} themeSettings 专题图配置值（分段专题图时配置，themeSettings.layerRenderType="themeRange"，themeSettings.propertyData传入属性数据）
   */
  addVFDNew(
    url,
    layerName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField,
    legendNumber,
    schemaName,
    themeSettings
  ) {
    // debugger
    const defaultStyle = {
      projection: 4490,
      style: {
        "fill-color": "#6495ED",
        "stroke-color": "#6495ED",
        "stroke-width": 0,
        "circle-radius": 3,
        "circle-fill-color": "#6495ED",
        "circle-stroke-color": "#6495ED",
        "circle-stroke-width": 0
      }
    };
    const options = {
      name: layerName,
      visible: true,
      projection: defaultStyle.projection,
      tileGrid: {
        extent: [-180, -90, 180, 90],
        origin: [-180, 90],
        tileSize: [512, 512],
        resolutions: [
          0.3515625,
          0.17578125,
          0.087890625,
          0.0439453125,
          0.02197265625,
          0.010986328125,
          0.0054931640625,
          0.00274658203125,
          0.001373291015625,
          0.0006866455078125,
          0.00034332275390625,
          0.000171661376953125,
          0.0000858306884765625,
          0.00004291534423828125,
          0.000021457672119140625,
          0.000010728836059570312,
          0.000005364418029785156,
          0.000002682209014892578,
          0.000001341104507446289,
          6.705522537231445e-7,
          3.3527612686157227e-7,
          1.6763806343078613e-7
        ]
      },
      style: defaultStyle.style
    };
    // 渲染的颜色
    let renderConfig = null;
    if (render) {
      renderConfig = render;
    } else {
      renderConfig = mapConfig.render.find(item => item.id == renderId);
    }
    const toRender = renderConfig != null;
    if (toRender) {
      const legend = [];
      const values = [];
      for (let i = 0; i < renderConfig.render.length; i++) {
        const rcr = renderConfig.render[i];
        if (legendNumber != null && i == legendNumber) {
          break; //如果指定了图例个数，则只加载显示指定数量的图例
        }
        legend.push({
          color: rcr.color,
          label: rcr.alias,
          type: renderConfig.geotype
        });
        // 有的点型配置方案有点的大小配置
        if (rcr.radius) {
          legend[legend.length - 1].radius = rcr.radius;
        }
        let tempStyle = {};
        tempStyle.value = rcr.name;
        if (renderConfig.geotype == "LineString") {
          //线型渲染方案
          tempStyle.style = {
            "fill-color": "transparent",
            "stroke-color": rcr.color,
            "stroke-width": rcr.width || 1
          };
        } else if (renderConfig.geotype == "Point") {
          //点型渲染方案
          tempStyle.style = {
            "circle-radius": !rcr.radius ? 10 : Math.ceil(rcr.radius / 1.5), //快显的点radius值渲染出来比较大，减小一点
            "circle-fill-color": rcr.color,
            "circle-stroke-color": "transparent",
            "circle-stroke-width": 0
          };
        } else {
          //面型渲染方案
          tempStyle.style = this.getRenderStyle(rcr);
        }
        values.push(tempStyle);
      }
      options["legend"] = legend;
      if (renderField == null) {
        options.style = values[0].style;
      } else {
        const render = {
          field: renderField,
          values: values
        };
        options["render"] = render;
      }
    }
    if (renderField == null && attributeFields == null) {
      attributeFields = "id";
    } else if (renderField != null && attributeFields != null) {
      attributeFields = attributeFields + "," + renderField;
    } else {
      attributeFields = attributeFields || renderField;
    }
    geomField = geomField || "geom";
    url =
      url +
      `?srs=${(themeSettings && themeSettings.srs) ||
        "4490"}&showType=1&geomField=${attributeFields}&geomShow=` +
      geomField;
    if (themeSettings && themeSettings.taskId) {
      url += `&taskId=${themeSettings.taskId}&stepNum=${themeSettings.stepNum}`;
    }
    if (themeSettings && !themeSettings.taskId) {
      url += `&stepNum=${themeSettings.stepNum}`;
    }
    // const plainText = filterCondition;
    // const encryptedText = encrypt(plainText);
    // console.log('Encrypted Text:', encryptedText);
    if (filterCondition) {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from(filterCondition).toString("base64");
      // url = url + '&customSearchCondition=BASE64' + encryptedText;
    } else {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from("1=1").toString("base64");
      // url = url + '&customSearchCondition=BASE64' + encryptedText;
    }
    if (schemaName && schemaName != "public") {
      url = url + "&schema=" + schemaName;
    }
    console.info("==========vfdurl=========");
    console.log(url);

    //渲染方案字段有时候会有大写字母（如gradecodeZhbz），要保持全都是小写的
    if (options.render && options.render.field) {
      options.render.field = options.render.field.toLowerCase();
    }
    if (renderId == "yjfw") {
      delete options["render"];
      options.style = {
        // "fill-color": "transparent",
        "fill-color": renderConfig.render[0].color,
        "stroke-color": renderConfig.render[0].color,
        "stroke-width": renderConfig.render[0].width,
        "circle-radius": 3,
        "circle-fill-color": renderConfig.render[0].color,
        "circle-stroke-color": renderConfig.render[0].color,
        "circle-stroke-width": 3
      };
    }
    if (renderId == "lszh") {
      delete options["render"];
      options.style = {
        // "fill-color": "transparent",
        "fill-color": renderConfig.render[0].color,
        "stroke-color": "#ccc",
        "stroke-width": 2,
        "circle-radius": 3,
        "circle-fill-color": renderConfig.render[0].color,
        "circle-stroke-color": renderConfig.render[0].color,
        "circle-stroke-width": 3
      };
    }
    console.log("options=", options);
    const random = Math.round(Math.random() * 100);
    // const layer = me.earth.layerManager.createLayer('vfd_' + random, 18, url, options)
    // me.earth.zoomToExtent([104, 30.6, 104.12, 30.74])
    // if (renderId == 'yjfw' && window.location.href.includes('drawMap')) {
    //     me.earth.map.getView().fit([86.72653661700008,48.324999999627465,88.40237862344294,49.17973708400007], me.earth.map.getSize())
    // }
    const layer = me.earth.layerManager.createLayer(
      "vfd_" + random,
      18,
      url,
      options
    );
    me.earth.addLayer(layer);
    if (renderId == "distance") {
      this.customLineLayer(layer, options.style);
    }
  },
  // 承灾体统计
  addVFDCzttj(
    url,
    layerName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField,
    legendNumber,
    schemaName,
    themeSettings,
    param
  ) {
    // debugger
    const defaultStyle = {
      projection: 4490,
      style: {
        "fill-color": "#6495ED",
        "stroke-color": "#6495ED",
        "stroke-width": 0,
        "circle-radius": 3,
        "circle-fill-color": "#6495ED",
        "circle-stroke-color": "#6495ED",
        "circle-stroke-width": 0
      }
    };
    const options = {
      name: layerName,
      visible: true,
      projection: defaultStyle.projection,
      tileGrid: {
        extent: [-180, -90, 180, 90],
        origin: [-180, 90],
        tileSize: [512, 512],
        resolutions: [
          0.3515625,
          0.17578125,
          0.087890625,
          0.0439453125,
          0.02197265625,
          0.010986328125,
          0.0054931640625,
          0.00274658203125,
          0.001373291015625,
          0.0006866455078125,
          0.00034332275390625,
          0.000171661376953125,
          0.0000858306884765625,
          0.00004291534423828125,
          0.000021457672119140625,
          0.000010728836059570312,
          0.000005364418029785156,
          0.000002682209014892578,
          0.000001341104507446289,
          6.705522537231445e-7,
          3.3527612686157227e-7,
          1.6763806343078613e-7
        ]
      },
      style: defaultStyle.style
    };

    options["legend"] = [];

    if (renderField == null && attributeFields == null) {
      attributeFields = "id";
    } else if (renderField != null && attributeFields != null) {
      attributeFields = attributeFields + "," + renderField;
    } else {
      attributeFields = attributeFields || renderField;
    }
    geomField = geomField || "geom";
    url =
      url +
      `?srs=${themeSettings.srs}&showType=1&geomField=${attributeFields}&geomShow=` +
      geomField;
    url += `&taskId=${themeSettings.taskId}&stepNum=${themeSettings.stepNum}`;
    if (filterCondition) {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from(filterCondition).toString("base64");
    } else {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from("1=1").toString("base64");
    }
    console.info("==========vfdurl=========");
    console.log(url);

    console.log("options=", options);
    const random = Math.round(Math.random() * 100);
    const layer = me.earth.layerManager.createLayer(
      "vfd_" + random,
      18,
      url,
      options
    );
    me.earth.addLayer(layer);

    layer.getLayer().setStyle((feature, resolution) => {
      let icon = "";
      param.quotaItem.map(item => {
        if (feature.properties_.cztname == item.name) {
          icon = themeSettings[item.icon.split(".")[0]];
        }
      });
      var style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({ color: "red" }),
          stroke: new ol.style.Stroke({ color: "white", width: 2 })
        })
      });
      var iconStyle = new ol.style.Icon({
        src: icon, // 自定义图片的路径
        anchor: [0.5, 0.5],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        scale: 0.5 // 图片的缩放比例
      });
      var style = new ol.style.Style({
        image: iconStyle
      });
      return style;
      // console.log('feature=', feature.getGeometry)
      // var geometry = feature.getGeometry();

      // 设置点要素的样式
      /*  var style = new Style({
           image: new Circle({
               radius: 6,
               fill: new Fill({ color: 'red' }),
               stroke: new Stroke({ color: 'white', width: 2 })
           })
       }); */
      // 创建自定义图片的图标对象
      /*  var iconStyle = new Icon({
           src: themeSettings.icon, // 自定义图片的路径
           anchor: [0.5, 0.5],
           anchorXUnits: 'fraction',
           anchorYUnits: 'fraction',
           scale: 0.5 // 图片的缩放比例
       }); */
      // 设置点要素的样式
      /*   var style = new Style({
            image: iconStyle
        }); */

      // return style;
    });
  },
  customLineLayer(layer, style) {
    layer.getLayer().setStyle((feature, resolution) => {
      let distance = feature.properties_.distance;
      let line_cen_lat = feature.properties_.line_cen_lat;
      let line_cen_lng = feature.properties_.line_cen_lng;
      // 添加LineCenter marker
      this.addMarkerTxt(null, [line_cen_lng, line_cen_lat], distance);
      // 添加LinePoint marker
      let name = feature.properties_.name;
      let lat = feature.properties_.lat;
      let lng = feature.properties_.lng;
      this.addMarkerTxt(null, [lng, lat], name);

      // 填充颜色
      return [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: style["stroke-color"],
            width: 1
          }),
          fill: new ol.style.Fill({
            color: style["fill-color"]
          })
        })
      ];
      // var geometry = feature.getGeometry();

      // 设置点要素的样式
      /*  var style = new Style({
           image: new Circle({
               radius: 6,
               fill: new Fill({ color: 'red' }),
               stroke: new Stroke({ color: 'white', width: 2 })
           })
       }); */
      // 创建自定义图片的图标对象
      /*  var iconStyle = new Icon({
           src: themeSettings.icon, // 自定义图片的路径
           anchor: [0.5, 0.5],
           anchorXUnits: 'fraction',
           anchorYUnits: 'fraction',
           scale: 0.5 // 图片的缩放比例
       }); */
      // 设置点要素的样式
      /*   var style = new Style({
            image: iconStyle
        }); */

      // return style;
    });
  },
  addVFDNewBak(
    url,
    layerName,
    renderField,
    renderId,
    render,
    ininExtent,
    filterCondition,
    attributeFields,
    geomField,
    legendNumber,
    schemaName,
    themeSettings
  ) {
    const defaultStyle = {
      projection: 4490,
      style: {
        "fill-color": "#6495ED",
        "stroke-color": "#6495ED",
        "stroke-width": 0,
        "circle-radius": 3,
        "circle-fill-color": "#6495ED",
        "circle-stroke-color": "#6495ED",
        "circle-stroke-width": 0
      }
    };
    const options = {
      name: layerName,
      visible: true,
      projection: defaultStyle.projection,
      tileGrid: {
        extent: [-180, -90, 180, 90],
        origin: [-180, 90],
        tileSize: [512, 512],
        resolutions: [
          0.3515625,
          0.17578125,
          0.087890625,
          0.0439453125,
          0.02197265625,
          0.010986328125,
          0.0054931640625,
          0.00274658203125,
          0.001373291015625,
          0.0006866455078125,
          0.00034332275390625,
          0.000171661376953125,
          0.0000858306884765625,
          0.00004291534423828125,
          0.000021457672119140625,
          0.000010728836059570312,
          0.000005364418029785156,
          0.000002682209014892578,
          0.000001341104507446289,
          6.705522537231445e-7,
          3.3527612686157227e-7,
          1.6763806343078613e-7
        ]
      },
      style: defaultStyle.style
    };
    // 渲染的颜色
    let renderConfig = null;
    if (render) {
      renderConfig = render;
    } else {
      renderConfig = mapConfig.render.find(item => item.id == renderId);
    }
    const toRender = renderConfig != null;
    if (toRender) {
      const legend = [];
      const values = [];
      for (let i = 0; i < renderConfig.render.length; i++) {
        const rcr = renderConfig.render[i];
        if (legendNumber != null && i == legendNumber) {
          break; //如果指定了图例个数，则只加载显示指定数量的图例
        }
        legend.push({
          color: rcr.color,
          label: rcr.alias,
          type: renderConfig.geotype
        });
        // 有的点型配置方案有点的大小配置
        if (rcr.radius) {
          legend[legend.length - 1].radius = rcr.radius;
        }
        let tempStyle = {};
        tempStyle.value = rcr.name;
        if (renderConfig.geotype == "LineString") {
          //线型渲染方案
          tempStyle.style = {
            "fill-color": "transparent",
            "stroke-color": rcr.color,
            "stroke-width": rcr.width || 1
          };
        } else if (renderConfig.geotype == "Point") {
          //点型渲染方案
          tempStyle.style = {
            "circle-radius": !rcr.radius ? 10 : Math.ceil(rcr.radius / 1.5), //快显的点radius值渲染出来比较大，减小一点
            "circle-fill-color": rcr.color,
            "circle-stroke-color": "transparent",
            "circle-stroke-width": 0
          };
        } else {
          //面型渲染方案
          tempStyle.style = this.getRenderStyle(rcr);
        }
        values.push(tempStyle);
      }
      options["legend"] = legend;
      if (renderField == null) {
        options.style = values[0].style;
      } else {
        const render = {
          field: renderField,
          values: values
        };
        options["render"] = render;
      }
    }
    if (renderField == null && attributeFields == null) {
      attributeFields = "id";
    } else if (renderField != null && attributeFields != null) {
      attributeFields = attributeFields + "," + renderField;
    } else {
      attributeFields = attributeFields || renderField;
    }
    geomField = geomField || "geom";
    url =
      url +
      `?srs=${themeSettings.srs}&showType=1&geomField=${attributeFields}&geomShow=` +
      geomField;
    url += `&taskId=${themeSettings.taskId}&stepNum=${themeSettings.stepNum}`;
    if (filterCondition) {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from(filterCondition).toString("base64");
    } else {
      url =
        url +
        "&customSearchCondition=BASE64" +
        Buffer.from("1=1").toString("base64");
    }
    if (schemaName && schemaName != "public") {
      url = url + "&schema=" + schemaName;
    }
    console.info("==========vfdurl=========");
    console.log(url);

    //如果是分段渲染快显
    if (themeSettings && themeSettings.layerRenderType == "themeRange") {
      //清空render，不使用render参与渲染
      if (options.render) {
        delete options.render;
      }
      //清空图例，然后根据属性值分组并设置每组的图例
      if (renderConfig && renderField) {
        if (options.legend) {
          options.legend = [];
        }

        let currIntervalValue = this.getArrayGroupByField(
          renderField,
          themeSettings.propertyData,
          renderConfig.render.length - 1
        );
        for (var i = 0; i < currIntervalValue.length; i++) {
          let currentGroupLegend = {};
          currentGroupLegend.geotype = renderConfig.geotype;
          currentGroupLegend.color = renderConfig.render[i].color;
          if (i == 0) {
            currentGroupLegend.label = 0 + "";
          } else {
            currentGroupLegend.label =
              Number(currIntervalValue[i - 1]).toFixed(1) +
              "-" +
              Number(currIntervalValue[i]).toFixed(1);
          }
          options.legend.push(currentGroupLegend);
        }
      }
    }
    //渲染方案字段有时候会有大写字母（如gradecodeZhbz），要保持全都是小写的
    if (options.render && options.render.field) {
      options.render.field = options.render.field.toLowerCase();
    }
    if (renderId == "zqfw") {
      console.log("renderConfig=", renderConfig);
      delete options["render"];
      options.style = {
        // "fill-color": "transparent",
        "fill-color": renderConfig.render[0].color,
        "stroke-color": renderConfig.render[0].color,
        "stroke-width": renderConfig.render[0].width,
        "circle-radius": 3,
        "circle-fill-color": renderConfig.render[0].color,
        "circle-stroke-color": renderConfig.render[0].color,
        "circle-stroke-width": 3
      };
    }
    console.log("options=", options);
    const random = Math.round(Math.random() * 100);
    // const layer = me.earth.layerManager.createLayer('vfd_' + random, 18, url, options)
    const layer = me.earth.layerManager.createLayer(
      "vfd_" + random,
      18,
      url,
      options
    );
    me.earth.addLayer(layer);
    //分段渲染快显，通过layer.setStyle在图层已经创建好了之后再设置style
    if (themeSettings && themeSettings.layerRenderType == "themeRange") {
      layer.getLayer().setStyle((feature, resolution) => {
        debugger;
        let currIntervalValue = this.getArrayGroupByField(
          renderField,
          themeSettings.propertyData,
          renderConfig.render.length - 1
        );
        if (currIntervalValue) {
          let group = 0;
          //获取当前阶段合适的分组值
          let suitableValue = this.getSuitableValue(
            currIntervalValue,
            feature.properties_[renderField]
          );
          if (suitableValue) {
            group = suitableValue.count;
          } else {
            group = renderConfig.render.length - 1;
          }
          return [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: "#666772e0",
                width: 1
              }),
              fill: new ol.style.Fill({
                color: renderConfig.render[group].color
              })
            })
            /*  new diitmap.style.Style({
                 stroke: new diitmap.style.Stroke({
                     color: '#666772e0',
                     width: 1
                 }),
                 fill: new diitmap.style.Fill({
                     color: renderConfig.render[group].color
                 })
             }) */
          ];
        } else {
          return [
            new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: "#666772e0",
                width: 1
              }),
              fill: new ol.style.Fill({
                color: defaultStyle.style["fill-color"]
              })
            })
            /* new diitmap.style.Style({
                stroke: new diitmap.style.Stroke({
                    color: '#666772e0',
                    width: 1
                }),
                fill: new diitmap.style.Fill({
                    color: defaultStyle.style['fill-color']
                })
            }) */
          ];
        }
      });
    }
    // layer.getLayer().setZIndex(2000)
    if (ininExtent == null) {
      return;
    }
    // 不影响地图展示
    me.earth.getView().fit(ininExtent, me.earth.getSize());
    this.setCenter2(ininExtent);
  },
  // 加载图层
  addArcgisLayer(data) {
    switch (data.serviceType) {
      case 2:
        let layer = me.earth.layerManager.createLayer(
          data.text,
          data.serviceType,
          data.serviceURL,
          {
            visible: false,
            name: data.text
          }
        );
        debugger
        me.earth.addLayer(layer);
        break;
    }
  },
  removeArcgisLayer(data) {
    switch (data.serviceType) {
      case 2:
        let layers = me.earth.layerManager.getLayers();
        for (let i = 0; i < layers.length; i++) {
          if (layers[i].id == data.text) {
            me.earth.removeLayer(layers[i]);
            break;
          }
        }
        break;
    }
  },
  /**
   *
   * @param {*} size 图片大小
   * @param {*} points 坐标点 [11.1, 221.11]
   * @param {*} imgUrl 图片地址
   */
  addMarker(points, imgUrl, item, name) {
    let domid = "bookmark" + _Uuid.v4();
    $("#addMarker").append(
      `<div class='marker_class ${name}' id='${domid}'>
        <img style='height: 32px;width: 30px;' item='${JSON.stringify(item)}' class='marker_img ${name}' src='${imgUrl}' />
      </div>`
    );
    let options = {
      domid: domid,
      position: points,
      notLocate: true
    };
    me.earth.addMarker(options);
  },
  addqxjMarker(points, imgUrl, item, name) {
    let domid = "bookmark" + _Uuid.v4();
    $("#addMarker").append(
      `<div class='marker_class ${name}'  id="${domid}">"<img style='height: 32px;width: 30px;' item='${JSON.stringify(
        item
      )}' class='${name}' src='${imgUrl}'/></div>`
    );

    let options = {
      domid: domid,
      position: points,
      notLocate: true
    };
    me.earth.addMarker(options);
  },
  addMaxWgMarker(points, imgUrl, item) {
    let domid = "bookmark" + _Uuid.v4();
    $("#addMarker").append(
      `<div class='marker_class addMaxWgMarker'  id="${domid}">"<img style='width: 20px;height: 20px;' item='${JSON.stringify(
        item
      )}' class='addMaxWgMarker blinking' src='${imgUrl}'/></div>`
    );

    let options = {
      domid: domid,
      position: points,
      notLocate: true
    };
    me.earth.addMarker(options);
  },

  addToobarrMarker(points, imgUrl, item) {
    // let style = "";
    // if (size != null) {
    //   style = "style='width:" + size.width + "px;height:" + size.height + "px' ";
    // }
    let domid = "bookmark" + _Uuid.v4();
    $("#addMarker").append(
      `<div class='markerToobar_class' id="${domid}">
        <img item='${JSON.stringify(item)}' class='marker_img' src='${imgUrl}'/>
      </div>`
    );
    let options = {
      domid: domid,
      position: points,
      notLocate: true
    };
    me.earth.addMarker(options);
  },
  addMarkerTxt(size, points, txt) {
    let domid = "bookmark" + _Uuid.v4();
    $("#addMarker").append(
      "<div id=" +
        domid +
        " style='color:#ffff00;font-size:12px;font-weight:100'>" +
        txt +
        "</div>"
    );
    let options = {
      domid: domid,
      position: points,
      notLocate: true
    };
    me.earth.addMarker(options);
  },
  styleFunction(feature, resolution) {
    var geometryType = feature.getGeometry().getType();
    console.log("geometryType=", geometryType);
    if (geometryType === "Polygon") {
      // Get the polygon's coordinates
      var coordinates = feature
        .getGeometry()
        .getLinearRing(0)
        .getCoordinates();

      // Create a new LineString geometry from the exterior ring coordinates
      var boundaryGeometry = new ol.LineString(coordinates);

      // Set the style for the boundary lines
      var strokeStyle = new ol.style.Stroke({
        color: "blue",
        width: 2
      });

      return new ol.style.Style({
        stroke: strokeStyle,
        geometry: boundaryGeometry
      });
    } else {
      // 隐藏其他要素或设置为透明
      return new ol.style.Style({
        fill: new ol.style.Fill({
          color: "blue"
        }),
        stroke: new ol.style.Stroke({
          color: "blue"
        })
      });
    }
  },
  /**
   * 获取传入的value的比较合适的数组值
   * @param Array
   * @param value
   */
  getSuitableValue(Array, value) {
    var suitableValue = { value: 0, count: 0 };
    for (var i = 0; i < Array.length; i++) {
      var tempvalue = Array[i];
      if (tempvalue < value) {
        continue;
      } else {
        suitableValue.value = tempvalue;
        suitableValue.count = i;
        return suitableValue;
      }
    }
  },
  getRenderStyle(config) {
    return {
      "fill-color": config.color,
      "stroke-color": config.color,
      "stroke-width": config.width || 1,
      "circle-radius": config.width || 3,
      "circle-fill-color": config.color,
      "circle-stroke-color": config.color,
      "circle-stroke-width": config.width || 1
    };
  },
  setCenter2(ininExtent) {
    let me = this;
    let dx = ininExtent[2] - ininExtent[0];
    me.earth
      .getView()
      .setCenter([
        (ininExtent[0] + ininExtent[2]) / 2 - dx / 3.5,
        (ininExtent[1] + ininExtent[3]) / 2
      ]);
  },
  getArrayGroupByField(field, arr, several) {
    var me = this;
    // if (me.jenkBreaks.length > 0) {
    //     return me.jenkBreaks
    // }
    var resultArray = [];
    var minvalue = Number(me.getMinValueInAttr(arr, field));
    var maxvalue = Number(me.getMaxValueInAttr(arr, field));
    if (minvalue == maxvalue) {
      resultArray.push(maxvalue);
      // me.jenkBreaks = resultArray
      return resultArray;
    }
    var value = me.getValueInAttr(arr, field);
    value = me.unique(value);
    if (value.length > 8) {
      var kclass = me.getJenkBreaks2(value, several);
      kclass.unshift(0);
      // me.jenkBreaks = kclass
      return kclass;
    } else {
      if (minvalue < maxvalue) {
        resultArray.push(minvalue);
        // Math.round(maxvalue - minvalue) / several
        var Interval = (maxvalue - minvalue) / several;
        if (Interval != 0) {
          for (var i = 1; i < several; i++) {
            var value = minvalue + i * Interval;
            resultArray.push(value);
          }
          resultArray.push(maxvalue);
        }
      }
      // me.jenkBreaks = resultArray
      return resultArray;
    }
  },
  /**
   * 获取当前数组里面某个属性最大的值
   * @param arr 数组
   * @param attr 属性字段
   * @returns {number} attr属性的最大值
   */
  getMinValueInAttr(arr, attr) {
    var num = Number(arr[0][attr]);
    for (var i = 0; i < arr.length; i++) {
      if (num > Number(arr[i][attr])) {
        num = arr[i][attr];
      }
    }
    return num;
  },
  /**
   * 获取当前数组里面某个属性最大的值
   * @param arr 数组
   * @param attr 属性字段
   * @returns {number} attr属性的最大值
   */
  getMaxValueInAttr(arr, attr) {
    var num = Number(arr[0][attr]);
    for (var i = 0; i < arr.length; i++) {
      if (num < Number(arr[i][attr])) {
        num = arr[i][attr];
      }
    }
    return num;
  },
  getValueInAttr(arr, attr) {
    var valueArray = new Array();
    for (var i = 0; i < arr.length; i++) {
      valueArray.push(Number(arr[i][attr]));
    }
    return valueArray;
  },
  unique(arr) {
    return Array.from(new Set(arr));
  },
  getJenkBreaks2(data, numclass) {
    let re_data = [];
    data.forEach(d => {
      re_data.push(d.toFixed(1));
    });
    data = this.unique(re_data);
    //在javascript里，Array的sort方法，必须用这个函数，否则不是按数字大小排序
    function sortNumber(a, b) {
      return a - b;
    }
    var kclass = new Array();
    var numdata = data.length;
    data.sort(sortNumber); //先排序
    for (var i = 1; i <= numclass; i++) {
      let kls = data[Math.floor(numdata / (numclass / i) - 1)];
      kclass.push(kls);
    }
    return kclass;
  },
  getJenkBreaks(data, numclass) {
    //在javascript里，Array的sort方法，必须用这个函数，否则不是按数字大小排序
    function sortNumber(a, b) {
      return a - b;
    }

    var numdata = data.length;
    data.sort(sortNumber); //先排序
    // console.log(data)
    var mat1 = new Array();
    var mat2 = new Array();
    var st = new Array();
    for (var j = 0; j <= numdata; j++) {
      mat1[j] = new Array();
      mat2[j] = new Array();
      st[j] = 0;
      for (var i = 0; i <= numclass; i++) {
        mat1[j][i] = 0;
        mat2[j][i] = 0;
      }
    }
    for (var i = 1; i <= numclass; i++) {
      mat1[1][i] = 1;
      mat2[1][i] = 0;
      for (var j = 2; j <= numdata; j++) {
        mat2[j][i] = Number.MAX_VALUE;
      }
    }
    var v = 0;
    for (var l = 2; l <= numdata; l++) {
      var s1 = 0;
      var s2 = 0;
      var w = 0;
      var i3 = 0;
      for (var m = 1; m <= l; m++) {
        i3 = l - m + 1;
        // var val = Number(data[i3 - 1])
        var val = parseInt(data[i3 - 1]);
        s2 += val * val;
        s1 += val;
        w++;
        v = s2 - (s1 * s1) / w;
        var i4 = i3 - 1;
        if (i4 != 0) {
          for (var j = 2; j <= numclass; j++) {
            if (mat2[l][j] >= v + mat2[i4][j - 1]) {
              mat1[l][j] = i3;
              mat2[l][j] = v + mat2[i4][j - 1];
              //if (l == data.length && j == numclass.length) {
              //alert("l=" + 200 + ",j=" + 5 + ";mat2[200][5]=" + mat1[l][j] + "i3=" + i3);
              //l=200,j=5;mat2[200][5]=200i3=200
              //console.log('i3=' + i3)
              // }
            }
          }
        }
      }
      mat1[l][1] = 1;
      mat2[l][1] = v;
    }
    var k = numdata;
    var kclass = new Array();
    /* int[] kclass = new int[numclass]; */
    kclass[numclass - 1] = Number(data[data.length - 1]);
    // kclass[numclass - 1] = parseInt(data[data.length - 1])
    /*kclass[numclass - 1] = (Integer) data.get(data.size() - 1);*/
    for (var j = numclass; j >= 2; j--) {
      var id = Number(mat1[k][j]) - 2;
      kclass[j - 2] = Number(data[id]);
      k = Number(mat1[k][j] - 1);
      /*var id = parseInt(mat1[k][j]) - 2
      kclass[j - 2] = parseInt(data[id])
      k = parseInt(mat1[k][j] - 1)*/
    }
    //kclass.unshift(0)
    return kclass;
  }
};
