<template>
    <div id="player" style="width: 100%;height: 100%;">
    </div>
</template>

<script>
import * as acapi from '../../../static/threeMap/ac.min'
export default {
    name: 'Player',
    data() {
        return {
            api: null,
            tifFiles: [],
        }
    },
    mounted() {
        //初始化API实例并启动渲染，DigitalTwinPlayer对象的构造参数请参考API开发文档
        this.api = new acapi.DigitalTwinPlayer("117.147.213.205:8087", {
            "domId": "player", 'iid': window.servicesConfig.mapIid, 'apiOptions': {
            }, ui: {
                startupInfo: false,
                statusIndicator: false,
            }
        }).getAPI();
        //this.api.hydrodynamic2d.reset()

    },
    methods: {
        updetData(data) {
            let tifFiles = []
            data.forEach((item, index) => {
                tifFiles.push({
                    id: index + "_tif",
                    name: item
                })
            });
            tifFiles.forEach((item, index) => {
                const updateConfig = {
                    "id": item.id,
                    "updateTime": 1,
                    "waterDepth": item.name
                };
                this.api.hydrodynamic2d.update(updateConfig);
                console.log("updateConfig", updateConfig);

            })
        },
        addModelResult(data) {
            this.api.hydrodynamic2d.clear();
            let tifFiles = []
            data.forEach((item, index) => {
                tifFiles.push({
                    id: index + "_tif",
                    name: item
                })
            });
            let modelConfig = {}
            tifFiles.forEach((item, index) => {
                // 水动力模型配置对象
                modelConfig = {
                    "id": item.id,                  // 模型唯一标识
                    "offset": [0, 0, 100],            // 模型偏移量
                    "collision": true,                // 启用碰撞检测
                    "waveBrightness": 10,             // 波浪亮度
                    "arrowColor": [1, 0.5, 0, 0],     // 箭头颜色
                    "arrowTiling": 2,                 // 箭头平铺密度
                    "rippleDensity": 1,               // 涟漪密度
                    "rippleTiling": 1,                // 涟漪平铺密度
                    "speedFactor": 1,                 // 速度因子
                    "alphaComposite": true,           // 启用透明度合成
                    "displayMode": 1, // 显示模式
                    "waterMode": 0,                   // 水模式
                    "waterDepth": item.name, // 初始水深数据
                    "alphaMode": 0,                   // 透明度模式
                    'depthRange': [0, 7],             //tif文件的的水深的最小值和最大值
                    "colors": {                       // 色带配置
                        "gradient": true,               // 启用渐变
                        "invalidColor": [0, 0, 0, 0],   // 无效值颜色
                        "colorStops": [                 // 色带断点配置
                            { "value": 0, "color": [1, 1, 1, 1] }, //蓝色
                            { "value": 2, "color": [59 / 255, 156 / 255, 254 / 255, 1] }, //蓝色
                            { "value": 3, "color": [8 / 255, 8 / 255, 254 / 255, 1] }, //深蓝色
                            { "value": 4, "color": [230 / 255, 254 / 255, 74 / 255, 1] },//黄色
                            { "value": 5, "color": [254 / 255, 165 / 255, 0, 1] },//深黄色
                            { "value": 6, "color": [254 / 255, 0, 0, 1] },//红色
                            { "value": 7, "color": [76 / 255, 0, 115 / 255, 1] }//紫色
                        ]
                    }
                };
                // 添加水动力模型并聚焦
                this.api.hydrodynamic2d.addByTif(modelConfig);
                // this.api.hydrodynamic2d.focus(item.id, 1000);
            })
            console.log("添加modelConfig", modelConfig);

        },
        clearEffect() {
            // 清除水动力模型
            this.api.hydrodynamic2d.clear();
        },
        resetApi() {
            this.api.camera.set(809179.345469, 985330.905625, 1657703.84, -34.415504, -101.43409, 0);
        },
        clearLine() {
            // 清楚轮廓线
            this.api.polyline.clear();
        },
        async addPolyline(data) {
            let jwdData = []
            let pArr = [];
            jwdData = JSON.parse(data.feature).coordinates
            await this.api.polyline.clear();
            jwdData.forEach((item, index) => {
                pArr.push({
                    id: index + "_line",
                    coordinates: item[0],
                    coordinateType: 1,//坐标系类型，取值范围：0为Projection类型，1为WGS84类型，2为火星坐标系(GCJ02)，3为百度坐标系(BD09)，默认值：0 
                    range: [1, 10000000],//可视范围：[近裁距离, 远裁距离]，取值范围: [任意负值, 任意正值]
                    color: [229 / 255, 61 / 255, 48 / 255, 1],//折线颜色绿色
                    thickness: 500,//折线宽度
                    intensity: 1,//亮度
                    flowRate: 0.5,//流速
                    shape: 0, //折线类型 0：直线， 1：曲线
                    depthTest: false,//是否做深度检测 开启后会被地形高度遮挡
                    style: 4,//折线样式 参考样式枚举：PolylineStyle
                    tiling: 0//材质贴图平铺比例
                })
            })
            await this.api.polyline.add(pArr);
            this.api.polyline.focus(pArr[0].id, 40000, 3);
        },


        async JCQPolyline(data) {
            let jwdData = []
            let pArr = [];
            jwdData = JSON.parse(data.feature).coordinates
            await this.api.polyline.clear();
            jwdData.forEach((item, index) => {
                pArr.push({
                    id: index + "jcq_line",
                    coordinates: item[0],
                    coordinateType: 1,//坐标系类型，取值范围：0为Projection类型，1为WGS84类型，2为火星坐标系(GCJ02)，3为百度坐标系(BD09)，默认值：0 
                    range: [1, 10000000],//可视范围：[近裁距离, 远裁距离]，取值范围: [任意负值, 任意正值]
                    color: [35 / 255, 170 / 255, 242 / 255, 1],//折线颜色
                    thickness: 500,//折线宽度
                    intensity: 1,//亮度
                    flowRate: 0.5,//流速
                    shape: 0, //折线类型 0：直线， 1：曲线
                    depthTest: false,//是否做深度检测 开启后会被地形高度遮挡
                    style: 4,//折线样式 参考样式枚举：PolylineStyle
                    tiling: 0//材质贴图平铺比例
                })
            })
            await this.api.polyline.add(pArr);
            // this.api.polyline.focus(pArr[0].id, 40000, 3);
        },
        async shqPolyline(data) {
            let jwdData = []
            let pArr = [];
            jwdData = JSON.parse(data.feature).coordinates
            await this.api.polyline.clear();
            jwdData.forEach((item, index) => {
                pArr.push({
                    id: index + "shq_line",
                    coordinates: item[0],
                    coordinateType: 1,//坐标系类型，取值范围：0为Projection类型，1为WGS84类型，2为火星坐标系(GCJ02)，3为百度坐标系(BD09)，默认值：0 
                    range: [1, 10000000],//可视范围：[近裁距离, 远裁距离]，取值范围: [任意负值, 任意正值]
                    color: [231 / 255, 255 / 255, 74 / 255, 1],//折线颜色
                    thickness: 500,//折线宽度
                    intensity: 1,//亮度
                    flowRate: 0.5,//流速
                    shape: 0, //折线类型 0：直线， 1：曲线
                    depthTest: false,//是否做深度检测 开启后会被地形高度遮挡
                    style: 4,//折线样式 参考样式枚举：PolylineStyle
                    tiling: 0//材质贴图平铺比例
                })
            })
            await this.api.polyline.add(pArr);
            // this.api.polyline.focus(pArr[0].id, 40000, 3);
        },
        async addMaker(data) {
            console.log("加载addMaker", data);
            let markerArr = [];
            this.api.marker.clear();
            data.forEach((item, index) => {
                markerArr.push({
                    id: index + '_marker',
                    groupId: 'markerAdd',
                    coordinate: [item.x, item.y],//坐标位置 自动高度开启可以不给坐标高度z 标注可以定位到下方物体上
                    coordinateType: 1,//默认0是投影坐标系，也可以设置为经纬度空间坐标系值为1
                    anchors: [-25, 50],//锚点，设置Marker的整体偏移，取值规则和imageSize设置的宽高有关，图片的左上角会对准标注点的坐标位置。示例设置规则：x=-imageSize.width/2，y=imageSize.height
                    imageSize: [50, 50],//图片的尺寸
                    hoverImageSize: [50, 50],//鼠标悬停时显示的图片尺寸
                    imagePath: item.iconUrl,//显示图片路径
                    hoverImagePath: item.iconUrl,// 鼠标悬停时显示的图片路径
                    fixedSize: false,//图片固定尺寸，取值范围：false 自适应，近大远小，true 固定尺寸，默认值：false 

                    range: [1, 100000000],//可视范围
                    viewHeightRange: [100, 10000000],// 可见高度范围
                    rangeRatio: 1,//可见高度范围的衰减系数

                    text: '',//显示的文字
                    useTextAnimation: false,//关闭文字展开动画效果 打开会影响效率
                    textRange: [1, 1000],//文本可视范围[近裁距离, 远裁距离]
                    textOffset: [0, 0],// 文本偏移
                    textBackgroundColor: '',//文本背景颜色
                    fontSize: 24,//字体大小
                    fontOutlineSize: 1,//字体轮廓线大小
                    fontColor: '#FFFFFF',//字体颜色
                    fontOutlineColor: [229 / 255, 61 / 255, 48 / 255, 1],//字体轮廓线颜色

                    popupURL: '',//弹窗HTML链接
                    popupBackgroundColor: '',//弹窗背景颜色
                    popupSize: [600, 600],//弹窗大小
                    popupOffset: [0, 0],//弹窗偏移

                    showLine: true,//标注点下方是否显示垂直牵引线
                    lineSize: [2, 50],//垂直牵引线宽度和高度[width, height]
                    lineColor: item.yjlevel === "红色预警" ? '#fc5558' : item.yjlevel === "橙色预警" ? '#fd7823' : item.yjlevel === "黄色预警" ? '#f5ab18' : item.yjlevel === "蓝色预警" ? '#5b86fc' : '',//垂直牵引线颜色
                    lineOffset: [25, 0],//垂直牵引线偏移

                    autoHidePopupWindow: true,//失去焦点后是否自动关闭弹出窗口
                    autoHeight: true,// 自动判断下方是否有物体
                    displayMode: 4,// 智能显示模式: 根据当前相机高度自动适配以上模式，类似金字塔lod加载效果，内置规则:range范围的1%内取值2，1%至10%取值1，大于10%取值0
                    autoDisplayModeSwitchFirstRatio: 0.01,//智能模式时的显示模式切换时range参数的首段比例，仅在displayMode=4时生效，取值范围：[0.01~1.0)，默认值0.01，示例：如果range=[1,1000]，则在[1,10]范围内dislayMode=2
                    autoDisplayModeSwitchSecondRatio: 0.1,//智能模式时的显示模式切换时range参数的第二段比例，仅在displayMode=4时生效，取值范围：[0.01~1.0)，默认值0.1，示例：如果range=[1,1000]，则在[10,100]范围内dislayMode=1，大于100则dislayMode=1
                    clusterByImage: true,// 聚合时是否根据图片路径分类，即当多个marker的imagePath路径参数相同时按路径对marker分类聚合
                    priority: 0,//避让优先级
                    occlusionCull: false//是否参与遮挡剔除
                })
            })

            //海量poi添加请使用批量添加 提供效率 
            console.log('markerArr', markerArr);
            await this.api.marker.add(markerArr);
            // this.api.marker.focus(markerArr[0].id, 100, 0);
        },

        clearMaker() {
            this.api.marker.clear();
        }
    },
    destroyed() {
        this.api.hydrodynamic2d.clear();
    },
}
</script>
