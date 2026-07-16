<template>
  <div class="identify-wrapper">
    <div v-show="IdentifyShow">
      <div class="identify-header">
        <span>点位查询</span>
        <a-icon type="close" style="cursor: pointer" @click="closeIdentify" />
      </div>
      <div class="search-type-box">
        <a-radio-group class="search-type-radio" v-model="searchType">
          <a-radio :value="0">地名地址查询</a-radio>
          <a-radio :value="1">经纬度查询</a-radio>
        </a-radio-group>
      </div>
      <div class="search-param-box" v-if="searchType" style="padding-bottom: 4px;">
        <a-form-model ref="locationForm" :wrapper-col="{ span: 20 }" :label-col="{ span: 4 }" :rules="rules"
          :model="searchParams">
          <a-form-model-item label="经度" prop="lon">
            <a-input v-model="searchParams.lon"></a-input>
          </a-form-model-item>
          <a-form-model-item label="纬度" prop="lat">
            <a-input v-model="searchParams.lat"></a-input>
          </a-form-model-item>
        </a-form-model>
      </div>
      <div class="search-param-box" v-else>
        <a-input v-model="searchText" placeholder="请输入关键字"></a-input>
      </div>
      <div class="search-btn-box">
        <a-button v-if="searchType" type="primary" size="small" style="margin-right: 20px"
          @click="startPickPoint">选点</a-button>
        <a-button type="primary" size="small" class="switch-btn" @click="startTransform">查询</a-button>
      </div>
    </div>
    <!-- 缓冲区查询 -->
    <div class="hcqSearch" v-if="ishcqSearch && IdentifyShow">
      <div class="buffer-header">
        <span>缓冲区查询</span>
        <a-icon type="close" style="cursor: pointer" @click="closeBuffer" />
      </div>
      <div class="contenBox">
        <a-form :model="formState" :label-col="{ span: 10 }" :wrapper-col="{ span: 10 }">
          <a-form-item label="设置缓冲区范围(KM):">
            <a-input v-model:value="formState.distance" />
          </a-form-item>
          <a-form-item label="查询数据:" :wrapper-col="{ span: 14 }">
            <a-checkbox-group v-model:value="formState.searchData" name="checkboxgroup" :options="plainOptions" />
          </a-form-item>
          <a-form-item label="缓冲区内人口数量:" :wrapper-col="{ span: 14 }" v-if="formState.userNum != -1">
            <span style="color: #fff;">{{ formState.userNum }}人</span>
          </a-form-item>
          <a-form-item label="缓冲区内农作物数量:" :wrapper-col="{ span: 14 }" v-if="formState.nzw != -1">
            <span style="color: #fff;">{{ formState.nzw }}公亩</span>
          </a-form-item>
        </a-form>
        <div style="text-align: center;">
          <a-button type="primary" @click="hcqsearchButton">查询</a-button>
        </div>

      </div>
    </div>
    <!-- 点位弹窗 -->
    <div class="identify-popup-wrapper" id="identifywrapper" v-show="popupShow">
      <div class="identify-popup-header">
        <span>详情</span>
        <a-icon @click="closeMes" class="identify-popup-close" style="cursor: pointer" type="close" />
      </div>
      <div class="identify-popup-content">
        <div class="con identify-con">
          <p class="identify-con-label">详细地址：</p>
          <p class="identify-con-value">{{ identifyModel.address || '--' }} </p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">地点名称：</p>
          <p class="identify-con-value"> {{ identifyModel.poi || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">省级名称：</p>
          <p class="identify-con-value">{{ identifyModel.province || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">市级名称：</p>
          <p class="identify-con-value">{{ identifyModel.city || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">县级名称：</p>
          <p class="identify-con-value">{{ identifyModel.county || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">乡镇名称：</p>
          <p class="identify-con-value">{{ identifyModel.town || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">经度：</p>
          <p class="identify-con-value">{{ identifyModellon || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">纬度：</p>
          <p class="identify-con-value">{{ identifyModellat || '--' }}</p>
        </div>
        <div class="con identify-con">
          <p class="identify-con-label">高程：</p>
          <p class="identify-con-value">{{ gcValue || '--' }}米</p>
        </div>
        <div class="con identify-con identify-operation-con">
          <div class="identify-operation-btn identify-operation-cache" @click='searchHcq'>缓冲区查询</div>
          <div class="identify-operation-btn identify-operation-favorite" @click="printStar(identifyModel)"><a-icon type="star" style="padding-right: 5px;"/>收藏</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import Overlay from 'ol/Overlay'
// import GeoJSON from 'ol/format/GeoJSON';
// import VectorSource from 'ol/source/Vector';
// import VectorLayer from 'ol/layer/Vector';
// import Style from "ol/style/Style";
// import Fill from "ol/style/Fill";
// import Stroke from "ol/style/Stroke";
// import Circle from "ol/style/Circle";

import { myMixin } from "../views/rapidAnalysis/mixin";

export default {
  name: 'Identify',
  mixins: [myMixin],
  props: {
    earthMap: {
      type: Object,
      default: null,
    },
    IdentifyShow: {
      type: Boolean,
      default: false
    }

  },

  data() {
    return {
      ishcqSearch: false,
      plainOptions: [
        { label: '人口', value: '1' },
        { label: '农作物', value: '2' },
      ],
      searchType: 0, // 0:正向 1:逆向
      visible: true,
      searchText: '',
      searchParams: {
        lon: '',
        lat: ''
      },
      rules: {
        lon: [{ required: true, message: '请输入经度', trigger: 'change' }],
        lat: [{ required: true, message: '请输入纬度', trigger: 'change' }]
      },
      result: {},
      locatLayer: {},
      popup: {},
      infoHTML: '',
      isstartPickPoint: false,
      identifyOverlay: null,
      popupShow: true,
      identifyModel: '',
      identifyModellon: '',
      identifyModellat: '',
      formState: {
        distance: '',
        searchData: ['1'],
        userNum: -1,
        nzw: -1,
      },
      gcValue: '--'
    }
  },
  watch: {
    IdentifyShow(newold, oldData) {
      if (!newold) {
        this.ishcqSearch = false
      }
    }
  },
  methods: {
    printStar(){
      this.$emit('printStar',{
        lon: this.identifyModellon,
        lat: this.identifyModellat
      })
    },
    closeMes() {
      this.removeBufferLayer();
      this.popupShow = false
      const marker_class = document.getElementsByClassName("markerToobar_class");
      const markersArray = Array.from(marker_class);
      markersArray.forEach(marker => marker.remove());
    },
    closeBuffer() {
      this.ishcqSearch = false
      this.formState = {
        distance: '',
        searchData: ['1'],
        userNum: -1,
        nzw: -1,
      }
    },
    searchHcq() {
      this.ishcqSearch = true
    },
    hcqsearchButton() {
      if (!this.formState.distance) {
        this.$message.warning('请输入查询范围');
        return
      }
      if (!this.formState.searchData.length === 0) {
        this.$message.warning('请选择数据类型');
        return
      }

      const params = {
        lat: this.identifyModellat,
        lng: this.identifyModellon,
        buffer: Number(this.formState.distance) * 1000
      }
      const queryParams = new URLSearchParams(params)
      const url = `${window.servicesConfig.defaultProxyPath}/alzb/map/getExtent?${queryParams.toString()}`
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(res => {
        const extent = res.data.split(',').map(Number)
        this.addFeatures(extent)
        const dataParam = new URLSearchParams({
          ...params,
          ifHuman: this.formState.searchData.includes('1'),
          ifFarm: this.formState.searchData.includes('2')
        })
        fetch(`${window.servicesConfig.defaultProxyPath}/alzb/map/getData?${dataParam.toString()}`, { method: 'GET' }).then(r => r.json()).then(r => {
          if (r.code === 200) {
            if (this.formState.searchData.includes('1')) {
              this.formState.userNum = r.data.human || 0
            } else {
              this.formState.userNum = '-1'
            }
            if (this.formState.searchData.includes('2')) {
              this.formState.nzw = r.data.farm || 0
            } else {
              this.formState.nzw = '-1'
            }
          } else {
            this.$message.error('数据查询失败')
          }
        }).catch(e => {
          console.error(e)
          this.$message.error('数据查询失败')
        })
      }).catch(err => {
        console.error(err)
      })
    },
    addFeatures(extent) {
      const data = this.buildGeoJson(extent, 90)
      const geojson = new ol.format.GeoJSON().readFeatures(data)
      const source = new ol.source.Vector({
        // 准备好的GeoJSON
        // 注意自己下载的geojson要在中心点附近，否则可能添加成功后找不到在哪
        features: geojson
      })
      const geojsonLayer = new ol.layer.Vector({
        id: 'bufferGeoJsonLayers',
        source: source,
        // 设置样式，边框和填充
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 5
          }),
          fill: new ol.style.Fill({
            color: 'rgba(7, 255, 100, 0.2)'
          }),
        }),
        zIndex: '9999'
      })
      this.removeBufferLayer()
      // 自动定位到矢量数据的范围
      this.earthMap.map.addLayer(geojsonLayer);
      const extentt = geojsonLayer.getSource().getExtent();
      this.earthMap.map.getView().fit(extentt, {
        padding: [50, 50, 50, 50], // 边距（可选）
        duration: 1000, // 动画时长（毫秒，可选）
      });
    },
    removeBufferLayer() {
      const vm = this
      let allLayers = vm.earthMap.map.getLayers().getArray()
      let geoJsonBorderLayers = allLayers.filter(l => l.getProperties().id === 'bufferGeoJsonLayers')
      geoJsonBorderLayers.forEach(lyr => {
        vm.earthMap.map.removeLayer(lyr)
      })
    },
    // 根据四至生成圆形features
    buildGeoJson(bounds, pointNum) {
      const [minLng, minLat, maxLng, maxLat] = bounds

      // 1. 计算矩形的中心点
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2

      // 2. 计算矩形的较短边，使用纬度差和经度差来确定
      const latDiff = maxLat - minLat
      const lngDiff = maxLng - minLng
      const shorterSide = Math.min(latDiff, lngDiff) // 较短边

      // 3. 计算圆的半径，单位为经纬度（较短边的一半）
      const radius = shorterSide / 2

      // 4. 定义圆的分割点数，最多不超过 200 个
      const numPoints = Math.min(200, pointNum)
      const angleStep = (2 * Math.PI) / numPoints

      // 5. 生成圆的坐标
      const coordinates = []
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep
        const dx = radius * Math.cos(angle)
        const dy = radius * Math.sin(angle)

        // 这里我们只简单地使用纬度变化为距离单位，忽略了经纬度变换带来的距离差异
        const lng = centerLng + (dx / Math.cos(centerLat * Math.PI / 180))
        const lat = centerLat + dy

        coordinates.push([lng, lat])
      }

      // 闭合圆的多边形
      coordinates.push(coordinates[0])

      // 6. 返回圆形feature
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        },
        properties: {}
      }
    },
    closeIdentify() {
      let that = this
      that.searchType = 0
      that.searchParams.lat = ''
      that.searchParams.lon = ''
      that.popupShow = false
      that.isstartPickPoint = false
      that.removeBufferLayer()
      setTimeout(() => {
        that.$emit('closeClick')
      }, 100)

    },
    startPickPoint() {
      //  监听属性查询点击事件
      this.isstartPickPoint = true;
    },
    getJwData(data) {
      this.popupShow = false;
      this.searchParams.lon = data.coordinate_[0]
      this.searchParams.lat = data.coordinate_[1]
      let datas = {
        result:{
          location:{
            lat: data.coordinate_[1],
            lon: data.coordinate_[0]
          }
        }
      };
      this.addMaker(datas)
    },
    startTransform() {
      const { lon, lat } = this.searchParams
      const keyWord = this.searchText
      if (this.searchType === 0) {
        this.searchForward(keyWord)
      } else {
        this.searchBackward(lon, lat)
      }
    },
    //  正向查询
    searchForward(keyWord) {
      if (!keyWord) {
        this.$message.error('请输入关键字')
        return
      }
      fetch(`https://api.tianditu.gov.cn/geocoder?ds={"keyWord":"${keyWord}"}&tk=73544acc9abce21e7fd4523c6f077d74`)
        .then(res => res.json())
        .then(res => {
          const lon = (res.location || res.result.location).lon
          const lat = (res.location || res.result.location).lat
          fetch(`https://api.tianditu.gov.cn/geocoder?postStr={"lon":${lon},"lat":${lat},'ver':1}&type=geocode&tk=73544acc9abce21e7fd4523c6f077d74`)
            .then(response => response.json())
            .then(response => {
              this.addResult(response, 1,lon,lat)
            }).catch(error => {
              console.error(error)
              this.$message.error('查询失败')
            })
        }).catch(err => {
          console.error(err)
          this.$message.error('查询失败')
        })
    },
    searchBackward(lon, lat) {
      if (!(lon && lat)) {
        this.$refs.locationForm.validate(v => { })
        this.$message.error('请输入经纬度')
        return
      }
      fetch(`https://api.tianditu.gov.cn/geocoder?postStr={"lon":${lon},"lat":${lat},'ver':1}&type=geocode&tk=73544acc9abce21e7fd4523c6f077d74`)
        .then(res => res.json())
        .then(res => {
          this.addResult(res, 1,lon,lat)
        }).catch(err => {
          console.error(err)
          this.$message.error('查询失败')
        })
    },
    closeIdentifyInfoBox() {
      this.$PubSub.publish('closeIdentifyInfoBox')
      this.popup.getElement().parentElement.style.display = 'none'
      // this.removeLocatlayer()
      // 清除定位点
      const features = this.locatLayer.getSource().getFeatures()
      if (features != null && features.length > 0) {
        for (let feature of features) {
          this.locatLayer.getSource().removeFeature(feature)
        }
      }
    },
    addResult(res, type,lon, lat) {
      console.log("res", res);
      const that = this;
      fetch(`https://jcyj.ndrcc.org.cn:4001/alzb/map/getHeight?lat=${lat}&lng=${lon}`)
      .then(res => res.json())
      .then(res => {
        that.gcValue = res.data;
      }).catch(err => {
        console.error(err)
        this.$message.error('查询失败')
      })
      this.$emit('addMaker', res)
      this.popupShow = true;
      console.log(res, 111);
      this.identifyModel = res.result.addressComponent
      this.identifyModellat = res.result.location.lat
      this.identifyModellon = res.result.location.lon

      this.$nextTick(() => {
        this.identifyOverlay.setPosition([res.result.location.lon, res.result.location.lat])
      })
    },

    addFavoriteHTML(position, data, res, hdata) {
      const that = this
      const html = `
        <div class="identify-popup-wrapper">
          <div class="identify-popup-header">
            <span>地点</span>
            <i class="a-icon-close identify-popup-close" style="cursor: pointer"></i>
          </div>
          <div class="identify-popup-content">
            <div class="con identify-con">
              <p class="identify-con-label">收藏信息：</p>
              <p class="identify-con-value">${data.address || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">收藏时间：</p>
              <p class="identify-con-value">${data.createTime || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">详细地址：</p>
              <p class="identify-con-value">${res.result.addressComponent.address || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">地点名称：</p>
              <p class="identify-con-value">${res.result.addressComponent.poi || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">省级名称：</p>
              <p class="identify-con-value">${res.result.addressComponent.province || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">市级名称：</p>
              <p class="identify-con-value">${res.result.addressComponent.city || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">县级名称：</p>
              <p class="identify-con-value">${res.result.addressComponent.county || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">乡镇名称：</p>
              <p class="identify-con-value">${res.result.addressComponent.town || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">经度：</p>
              <p class="identify-con-value">${res.result.location.lon || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">纬度：</p>
              <p class="identify-con-value">${res.result.location.lat || '--'}</p>
            </div>
            <div class="con identify-con">
              <p class="identify-con-label">高程：</p>
              <p class="identify-con-value">${hdata || '--'}米</p>
            </div>
            <div class="con identify-con identify-operation-con">
              <div class="identify-operation-btn identify-operation-cache">缓冲区查询</div>
              <div class="identify-operation-btn identify-operation-dislike">取消收藏</div>
            </div>
          </div>
        </div>`
      that.popup.getElement().innerHTML = html
      that.popup.setPosition([+position.lon, +position.lat])
      that.popup.getElement().parentElement.style.display = 'block'
      // 绑定info box 的关闭事件
      that.$nextTick(() => {
        document
          .querySelector('.identify-popup-close')
          .addEventListener('click', that.closeIdentifyInfoBox)
        document
          .querySelector('.identify-operation-cache')
          .addEventListener('click', that.showCacheBox)
        document
          .querySelector('.identify-operation-dislike')
          .addEventListener('click', () => that.dislikePoint(data))
      })
    },
    showCacheBox() {
      this.$PubSub.publish('showCacheBox', this.result)
      console.log('showCacheBox')
    },
    showFavoriteItem(me, data) {
      const that = this
      const position = {
        lat: data.lat,
        lon: data.lng
      }
      this.result.location = position
      const ol = window.ol
      // 定位点
      let source = new ol.source.Vector({
        crossOrigin: 'anonymous',
        features: []
      })
      let layer = new ol.layer.Vector({
        zIndex: 100,
        source: source
      })
      this.$store.DiitMap.addLayer(layer)
      const iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
          scale: 1,
          anchor: [16, 0],
          anchorXUnits: 'pixels', // X方向单位：分数
          anchorYUnits: 'pixels', // Y方向单位：像素
          anchorOrigin: 'bottom-left', // 标注样式的起点位置
          src: require('./locat.png')
        })
      })
      const feature = new ol.Feature({
        geometry: new ol.geom.Point([+position.lon, +position.lat]),
        layerType: 'identityLayer',
        properties: position
      })
      feature.setStyle(iconStyle)
      this.removeLocatlayer()
      this.locatLayer.getSource().addFeature(feature)
      this.$store.DiitMap.getView().setCenter([+position.lon, +position.lat])
      fetch(`https://api.tianditu.gov.cn/geocoder?postStr={"lon":${position.lon},"lat":${position.lat},'ver':1}&type=geocode&tk=73544acc9abce21e7fd4523c6f077d74`)
        .then(res => res.json())
        .then(res => {
          const hParams = new URLSearchParams({
            lat: position.lat,
            lng: position.lon
          })
          fetch(`${window.g.defaultProxyPath}/alzb/map/getHeight?${hParams.toString()}`, { method: 'GET' }).then(r => r.json()).then(hRes => {
            if (hRes.code === 200) {
              that.addFavoriteHTML(position, data, res, hRes.data)
            } else {
              that.addFavoriteHTML(position, data, res)
              that.$message.error('查询高程信息失败')
            }
          }).catch(err => {
            console.error(err)
            that.addFavoriteHTML(position, data, res)
            that.$message.error('查询高程信息失败')
          })
        }).catch(err => {
          console.error(err)
          that.$message.error('收藏点查看失败')
        })
    },
    dislikePoint(data) {
      const params = new URLSearchParams({
        id: data.id
      })
      // const url = `http://192.9.100.203:9999/map/deletePointCollections?${params.toString()}`
      const url = `${window.g.defaultProxyPath}/alzb/map/deletePointCollections?${params.toString()}`
      fetch(url, {
        method: 'GET'
      }).then(res => res.json()).then(res => {
        this.$message.success('取消收藏成功')
        this.closeIdentifyInfoBox()
      })
    },
    showFavoriteBox() {
      this.$PubSub.publish('showFavoriteBox', this.result)
      console.log('showFavoriteBox', this.result)
    },
    removeLocatlayer() {
      // 清除定位点
      const features = this.locatLayer.getSource().getFeatures()
      if (features != null && features.length > 0) {
        for (let feature of features) {
          this.locatLayer.getSource().removeFeature(feature)
        }
      }
      // 清除地点信息
      this.closeIdentifyInfoBox()
    }
  },
  mounted() {
    const identifyDom = document.getElementById('identifywrapper')
    this.identifyOverlay = new ol.Overlay({
      element: identifyDom,
      positioning: 'right-center',// 根据position属性的位置来进行相对点位
      className: 'custom-overlay', // 自定义 CSS 类
      // offset: [0, -30],// 在positioning之上再进行偏移
      autoPan: true,
      autoPanAnimation: {
        duration: 250,
        //当Popup超出地图边界时，为了Popup全部可见，地图移动的速度.
      },
    });
    console.log(this.identifyOverlay)
    // this.identifyOverlay.setZIndex(200);
    // 动态调整 z-index
    this.earthMap.map.addOverlay(this.identifyOverlay)
  }
}
</script>
<style scoped lang="less">
.identify-popup-wrapper {
  font-size: 16px;
  width: auto;
  height: auto;
  color: #fff;
  background: rgba(0, 58, 133, 0.7);
  border-radius: 4px;
  z-index: 99999 !important;
  .identify-popup {
    padding: 5px;
    font-size: 16px;
    width: auto;
    height: auto;
    color: #fff;
    background: rgba(0, 58, 133, 0.7);
    border-radius: 4px;
    transform: translate(-16px, calc(-100% - 40px));

  }

  .identify-popup-header {
    border-bottom: 1px solid #69a2e8;
    margin: 0 8px;
    padding: 5px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .identify-popup-content {
    padding: 5px;
  }

  .identify-popup-content>.identify-con {
    font-weight: normal;
    color: #ffff;
    line-height: normal;
    padding: 3px 3px;
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .identify-popup-content>.identify-operation-con {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .identify-popup-content>.identify-operation-con>.identify-operation-btn {
    width: 64px;
    height: 36px;
    margin-left: 12px;
    line-height: 34px;
    cursor: pointer;
    text-align: center;
    color: #fff;
    border: 1px solid #fff;
    border-radius: 4px;
    background-color: transparent;
  }

  .identify-popup-content>.identify-operation-con>.identify-operation-dislike {
    width: 84px;
  }

  .identify-popup-content>.identify-operation-con>.identify-operation-cache {
    width: 100px;
  }

  .identify-popup-content>.identify-operation-con>.identify-operation-btn:hover {
    background-color: #ecf5ff22;
  }

  /* .identify-popup-content > .identify-con > p {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
} */
  .identify-popup-content>.identify-con>.identify-con-label {
    width: 77px;
    padding-right: 4px;
    text-align: end;
  }

  .identify-popup-content>.identify-con>.identify-con-value {
    width: 150px;
    min-height: 28px;
    background: rgba(66, 148, 247, 0.2);
    border-radius: 4px;
    /* line-height: 28px; */
    padding: 4px 8px;
  }
}
</style>
<style>
.custom-overlay {
  z-index: 9999 !important;
}

</style>
<style scoped lang="less">
.hcqSearch {
  width: 380px;

  .buffer-header {
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: transparent;
    border-bottom: 1px solid rgba(105, 162, 232, 0.66);
    border-top: 1px solid rgba(105, 162, 232, 0.66);
    // background-color: #001e4c;
    color: #ffffff;
  }

  .contenBox {
    padding: 0.1rem;

    /deep/ .ant-form-item-label {
      color: #FFF !important;

    }

    /deep/ .ant-checkbox-group-item {
      color: #FFF !important;

    }
  }

}

.identify-wrapper {
  position: absolute;
  right: 4.6rem;
  top: 0.7rem;
  width: 380px;
  border-radius: 4px;
  z-index: 999;
  background-color: rgba(0, 58, 133, 0.8);
}

.identify-header {
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border-bottom: 1px solid rgba(105, 162, 232, 0.66);
  color: #ffffff;
}

.search-type-box {
  padding: 20px 34px;

  .search-type-radio {
    /deep/ .a-radio {
      color: #fff;

      .a-radio__inner,
      .a-radio__inner:hover {
        border-color: #fff;
        background: transparent;
      }

      .a-radio__inner::after {
        width: 8px;
        height: 8px;
        background-color: rgba(0, 141, 251, 1);
      }

      .a-radio__input.is-checked+.a-radio__label {
        color: #fff;
      }

      .a-radio__input.is-checked .a-radio__inner {
        color: rgba(0, 141, 251, 1);
        border-color: rgba(0, 141, 251, 1);
        background: transparent;
      }
    }
  }
}

.search-param-box {
  padding: 4px 34px 20px;

  /deep/.a-form {
    .a-form-model-item.is-required>.a-form-model-item__label {
      color: #fff;

      &::before {
        color: rgba(255, 41, 41, 1);
      }
    }
  }

  /deep/ .ant-form-item label {
    color: #fff !important;
  }

  /deep/.a-input {
    .a-input__inner {
      border-color: #fff;
      background-color: transparent;
      color: #fff;
    }
  }
}

.search-btn-box {
  display: flex;
  justify-content: center;
  padding-bottom: 20px;

  /deep/.a-button {
    font-size: 16px;

    &.switch-btn {
      color: #fff;
      border-color: #fff;
      background-color: transparent;

      &:hover {
        background-color: #ecf5ff22;
      }
    }
  }
}
</style>
