/**
 * 基础地理
 */
const defaultProxyPath = "https://jcyj.ndrcc.org.cn:4001";
const jichudili = [
  {
    id: "04",
    text: "行政区划",
    children: [
      {
        id: "05",
        pid: "jichudili",
        text: "省",
        showTitle: `全国省级行政区划边界`,
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/SHENG_Polygon/MapServer",
          lendids: 2,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "06",
        pid: "jichudili",
        text: "市",
        showTitle: `全国市级行政区划边界`,
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/SHI_Polygon/MapServer",
          lendids: 2,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "07",
        pid: "jichudili",
        text: "县",
        showTitle: `全国县级行政区划边界`,
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 1,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/XIAN_Polygon1984_QP2/MapServer",
          lendids: 1,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      }
    ]
  },
  {
    id: "01",
    text: "流域边界",
    children: [
      {
        id: "02",
        pid: "jichudili",
        text: "一级流域",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/first_level_watershed/MapServer",
          lendids: 0,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "03",
        pid: "jichudili",
        text: "二级流域",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/second_level_watershed/MapServer",
          lendids: 1,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "04",
        pid: "jichudili",
        text: "三级流域",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw30/arcgis/rest/services/mapserver/san_ji_liu_yu/MapServer",
          lendids: 0,
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      }
    ]
  }
];

/**
 * 孕灾环境
 */
const yunzaihuanjing = [
  {
    id: "11",
    pid: "0",
    text: "地形",
    isServer: false,
    children: [
      {
        id: "12",
        pid: "yunzaihuanjing",
        text: "DEM",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.6,
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/DEM_2010/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "13",
        pid: "yunzaihuanjing",
        text: "地质灾害隐患点",
        isServer: true,
        ischeck: false,
        attributes: {
          legend: "dizhizaihai-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/danger_2010/MapServer"
        },
        children: null
      }
    ]
  },
  {
    id: "14",
    pid: "0",
    text: "河网",
    isServer: false,
    children: [
      {
        id: "15",
        pid: "yunzaihuanjing",
        text: "河网水面",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/he_wang_shui_mian/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "16",
        pid: "yunzaihuanjing",
        text: "线状河流",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/he_liu_line/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        }
      },
      {
        id: "17",
        pid: "yunzaihuanjing",
        text: "小流域",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 1,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/LiuYu1984_QP/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "18",
        pid: "yunzaihuanjing",
        text: "湖泊",
        isServer: true,
        ischeck: false,
        attributes: {
          legend: "hupo-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/hu_po/MapServer"
        },
        children: null
      }
      // {
      //   'id': '19',
      //   pid: 'yunzaihuanjing',
      //   'text': '水文测站点',
      //   'isServer': true,
      //   ischeck: false,
      //   'attributes': {
      //     'legend': 'hupo-lend',
      //     ledgendsource: 'arcgis',
      //     ledgendtype: 'img',
      //     'lengendlist': [ ],
      //     'serviceType': 2,
      //     'serviceURL': defaultProxyPath + '/dtfw30/arcgis/rest/services/mapserver/ce_zhan_dian/MapServer'
      //   },
      //   'children': null
      // },
      // {
      //   'id': '20',
      //   pid: 'yunzaihuanjing',
      //   'text': '三级河流',
      //   'isServer': true,
      //   ischeck: false,
      //   'attributes': {
      //     'legend': 'hupo-lend',
      //     ledgendsource: 'arcgis',
      //     ledgendtype: 'img',
      //     'lengendlist': [ ],
      //     'serviceType': 2,
      //     'serviceURL': defaultProxyPath + '/dtfw30/arcgis/rest/services/mapserver/he_liu_shui_xi/MapServer'
      //   },
      //   'children': null
      // }
    ]
  }
];

/**
 * 承灾体
 */
const chengzaiti = [
  {
    id: "19",
    pid: "0",
    text: "人口",
    isServer: false,
    children: [
      {
        id: "21",
        pid: "chengzaiti",
        text: "人口格网",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.6,
          legend: "renkougewan-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/POP/MapServer",
          nodeType: 2
        },
        children: null
      },
      {
        id: "20",
        pid: "chengzaiti",
        text: "人口密度",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.6,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/POP/Pop_2015/MapServer",
          nodeType: 2
        },
        children: null
      }
    ]
  },
  {
    id: "27",
    pid: "0",
    text: "GDP",
    isServer: false,
    children: [
      {
        id: "28",
        pid: "chengzaiti",
        text: "GDP",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.5,
          serviceType: 2,
          legend: "GDPgewan-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/GDP/MapServer"
        },
        children: null
      }
    ]
  },
  {
    id: "22",
    pid: "0",
    text: "农作物",
    isServer: false,
    children: [
      {
        id: "23",
        pid: "chengzaiti",
        text: "耕地",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.5,
          serviceType: 2,
          legend: "nongzuowumianji-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/nong_zuo_wu/MapServer"
        },
        children: null
      },
      {
        id: "24",
        pid: "chengzaiti",
        text: "玉米",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.6,
          serviceType: 2,
          legend: "nongzuowumianji-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/Maize/MapServer"
        },
        children: null
      },
      {
        id: "25",
        pid: "chengzaiti",
        text: "小麦",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.7,
          serviceType: 2,
          legend: "nongzuowumianji-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/Wheat/MapServer"
        },
        children: null
      },
      {
        id: "26",
        pid: "chengzaiti",
        text: "水稻",
        isServer: true,
        ischeck: false,
        attributes: {
          opacity: 0.7,
          serviceType: 2,
          legend: "nongzuowumianji-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: [],
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/Rice/MapServer"
        },
        children: null
      }
    ]
  },
  {
    id: "29",
    pid: "0",
    text: "交通",
    isServer: false,
    children: [
      {
        id: "30",
        pid: "chengzaiti",
        text: "国道",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/Road_Groad/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "31",
        pid: "chengzaiti",
        text: "高速公路",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/Road_motorways/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "32",
        pid: "chengzaiti",
        text: "机场",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Base/airport/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      },
      {
        id: "33",
        pid: "chengzaiti",
        text: "铁路",
        isServer: true,
        ischeck: false,
        attributes: {
          serviceType: 2,
          serviceURL:
            defaultProxyPath +
            "/dtfw/arcgis/rest/services/Flood_Screen/Road_railway/MapServer",
          lendids: 0,
          legend: "renkoumidu-lend",
          ledgendsource: "arcgis",
          ledgendtype: "img",
          lengendlist: []
        },
        children: null
      }
    ]
  }
  // {
  //   'id': '30',
  //   pid: '0',
  //   'text': '房屋',
  //   'isServer': false,
  //   'children': [
  //     {
  //       'id': '30',
  //       pid: 'chengzaiti',
  //       'text': '重庆房屋',
  //       'isServer': true,
  //       ischeck: false,
  //       'attributes': {
  //         'serviceType': 2,
  //         'serviceURL': defaultProxyPath + '/dtfw30/arcgis/rest/services/mapserver/house/MapServer',
  //         lendids: 0,
  //         'legend': 'renkoumidu-lend',
  //         ledgendsource: 'arcgis',
  //         ledgendtype: 'img',
  //         'lengendlist': [ ]
  //       },
  //       'children': null
  //     }
  //   ]
  // }
];

export const layerObj = {
  jichudili,
  yunzaihuanjing,
  chengzaiti
};
