const relativeUrls = {
  json: '/static/config/json/mapConfig.json',
  xml: '/static/config/xml/mapConfig.xml',
  geoJson: '/static/config/json/geoJson/'
}

const mapConfig = {
  // 地图类型
  mapType: 'Map',
  // 相对路径 相对于 webConfig.webAddress
  relativeUrls,
  // 绝对路径
  absoluteUrls: {
    // json: webConfig.webAddress + relativeUrls.json,
    json: 'http://localhost:8100/static/config/json/mapConfig.json',
    xml: webConfig.webAddress + relativeUrls.xml,
    geoJson: webConfig.webAddress + relativeUrls.geoJson,
  },
  render: [
    {
      "id": "jysj",
      "name": "降雨数据",
      "relatedField": "zdwd",
      "geotype": "Polygon",
      "render": [
        {
          "name": "0-10",
          "color": "rgb(170, 242, 143)",
          "alias": "0-10"
        },
        {
          "name": "10-25",
          "color": "rgb(53, 163, 4)",
          "alias": "10-25"
        },
        {
          "name": "25-50",
          "color": "rgb(93, 185, 252)",
          "alias": "25-50"
        },
        {
          "name": "50-100",
          "color": "rgb(0, 0, 248)",
          "alias": "50-100"
        },
        {
          "name": "100-250",
          "color": "rgb(225, 27, 226)",
          "alias": "100-250"
        },
        {
          "name": ">=250",
          "color": "rgb(94, 17, 1)",
          "alias": ">=250"
        }
      ]
    },
    {
      "id": "MAXDEPTH",
      "name": "最大积水深度",
      "relatedField": "gradecode",
      "geotype": "Polygon",
      "render": [
        {
          "name": "4",
          "color": "#6EACFC",
          "range": "0.05-0.15m T≥1h",
          "alias": "蓝色预警"
        },
        {
          "name": "3",
          "color": "#EDED30",
          "ranges": ["0.15-0.3m  T≥1h", "0.05-0.15m  T≥3h"],
          "range": "0.15-0.3m  T≥1h或0.05-0.15m  T≥3h",
          "alias": "黄色预警"
        },
        {
          "name": "2",
          "color": "#F59A23",
          "ranges": ["0.3-0.5m  T≥1h", "0.15-0.3m  T≥3h"],
          "range": "0.3-0.5m  T≥1h或0.15-0.3m  T≥3h",
          "alias": "橙色预警"
        },
        {
          "name": "1",
          "color": "#D7152D",
          "ranges": ["≥0.5m  T≥1h", "0.3-0.5m  T≥3h"],
          "range": "≥0.5m     T≥1h或0.3-0.5m  T≥3h",
          "alias": "红色预警"
        }
      ]
    },
    {
      "id": "flood",
      "name": "淹没",
      "relatedField": "xdsd",
      "geotype": "Polygon",
      "render": [
        {
          "name": "淹没",
          "color": "#2228f6",
          "alias": "淹没"
        },
      ]
    },
    {
      "id": "ponding",
      "name": "积水",
      "relatedField": "xdsd",
      "geotype": "Polygon",
      "render": [
        {
          "name": "0.1-0.27",
          "color": "rgb(59, 157, 255)",
          "alias": "0.1-0.27"
        },
        {
          "name": "0.27-0.5",
          "color": "rgb(8, 8, 255)",
          "alias": "0.27-0.5"
        },
        {
          "name": "0.5-1.0",
          "color": "rgb(231, 255, 74)",
          "alias": "0.5-1.0"
        },
        {
          "name": "1.0-2.0",
          "color": "rgb(255, 166, 0)",
          "alias": "1.0-2.0"
        },
        {
          "name": "2.0-3.0",
          "color": "rgb(255, 0, 0)",
          "alias": "2.0-3.0"
        },
        {
          "name": ">3.0",
          "color": "rgb(76, 0, 115)",
          "alias": ">3.0"
        },
      ]
    },
  ]
};

window.mapConfig = mapConfig;
