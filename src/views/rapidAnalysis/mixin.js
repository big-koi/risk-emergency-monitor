import diitgis from "@/components/Layer/LayerManagerForDiitGIS";

// mixin.js
export const myMixin = {

    data() {
        return {
            yjcsTlCheckData: true,
            jyfwTlCheckData: true,
            jydjTlCheckData: true,
            jssdTlCheckData: true,
            qxyjCheckkData: false,
            hlTlData: [],
        }
    },
    mounted() {
    },
    created() {
    },
    methods: {
        closeIdentify() {
            this.popupShow = false
        },
        // 地图点位经纬度查询数据
        searchBackward(type, item) {
            if (['qxyj', 'byyj'].includes(type)) {
                this.identifyModel = item
                this.$nextTick(() => {
                    this.identifyOverlay.setPosition([item.lon, item.lat])
                    this.popupShow = true
                })
            } else {
                fetch(`https://api.tianditu.gov.cn/geocoder?postStr={"lon":${item.lon},"lat":${item.lat},'ver':1}&type=geocode&tk=73544acc9abce21e7fd4523c6f077d74`)
                    .then(res => res.json())
                    .then(res => {
                        this.popupShow = true
                        this.identifyModel = res.result.addressComponent
                        this.identifyModel.jyl = item.jyl || item.max
                        this.identifyModellat = res.result.location.lat
                        this.identifyModellon = res.result.location.lon
                        this.$nextTick(() => {
                            this.identifyOverlay.setPosition([res.result.location.lon, res.result.location.lat])
                        })
                    }).catch(err => {
                        console.error(err)
                        this.$message.error('查询失败')
                    })
            }

        },
        // 基础图层添加图列
        ischeck(data) {
          this.hlTlData = data
        },
        posttionButton() {
            this.showTaskList = false
            this.isOpenLayerList = false
            this.IdentifyShow = false
        },
        openLayerList() {
            this.$refs.buttonPostion.isModel = false
            this.showTaskList = false
            this.isOpenLayerList = false
            this.IdentifyShow = false
            this.isOpenLayerList = true
        },
        removeLocatlayer() {
        },
        //点位查询按钮
        showIdentify() {
            // this.$refs.identifyDom.visible = true
            this.$refs.buttonPostion.isModel = false
            this.isOpenLayerList = false
            this.showTaskList = false
            this.IdentifyShow = true
        },
        closeClick() {
            this.IdentifyShow = false
            const marker_class = document.getElementsByClassName("markerToobar_class");
            const markersArray = Array.from(marker_class);
            markersArray.forEach(marker => marker.remove());

        },
        addMaker(data) {
            const marker_class = document.getElementsByClassName("markerToobar_class");
            const markersArray = Array.from(marker_class);
            markersArray.forEach(marker => marker.remove());
            let imgUrl = require('../../assets/images/rapidAnalysis/locat.png')
            diitgis.addToobarrMarker([data.result.location.lon, data.result.location.lat], imgUrl, {});
        },
        yjcsTlCheck(e) {
            let value = e.target.checked
            this.yjcsTlCheckData = value
            if (value) {
                this.showMaker(true, 'byyj')

            } else {
                this.showMaker(false, 'byyj')
            }
        },
        jyfwTlCheck(e) {
            let value = e.target.checked
            this.jyfwTlCheckData = value
            if (value) {
                this.getByyjcsData('colorImg')
            } else {
                this.earthMap.removeAllLayer();
            }
        },
        jydjTlCheck(e) {
            let value = e.target.checked
            this.jydjTlCheckData = e.target.checked
            if (value) {
                this.showMaker(true, 'yjdj')

            } else {
                if (this.isMapType) {
                    this.$refs.threeMap.clearMaker()
                } else {
                    this.showMaker(false, 'yjdj')

                }
            }
        },
        jssdTlCheck(e) {
            let value = e.target.checked
            this.jssdTlCheckData = value
            if (value) {
                if (this.disasterTypeIndex === 3) {
                    if (this.csnlValue == 1) {
                        this.getJssdData();
                    } else {
                        this.getJsGqthreeData()
                    }
                } else if (this.disasterTypeIndex === 4) {
                    if (this.shValue == 1) {
                        this.getshJssdData();
                    } else {
                        this.getShGqthreeData()
                    }
                }
            } else {
                if (this.isMapType) {
                    this.$refs.threeMap.clearEffect()
                } else {
                    this.earthMap.removeAllLayer();
                }
            }

        },
        jylzdgwCheck(e) {
            let value = e.target.checked
            this.jylzdgwCheckData = value
            if (value) {
                // this.getQGMaxWgIcon()
                this.showMaker(true, 'skjyXz')

            } else {
                this.showMaker(false, 'skjyXz')
            }
        },
        qxyjCheck(e) {
            let value = e.target.checked
            this.qxyjCheckkData = value
            if (value) {
                this.searchQxtYj()
            } else {
                this.showMaker(false, 'qxyj')
            }
        },
        showMaker(type, className) {
            const marker_class = document.getElementsByClassName(className);
            const markersArray = Array.from(marker_class);
            console.log('markersArray', markersArray);
            markersArray.forEach((item) => {
                if (type) {
                    item.style.display = 'block'
                } else {
                    item.style.display = 'none'
                }
            })

        },
        openLayer() {
            this.isOpenLayerList = false
        }
    }
}
