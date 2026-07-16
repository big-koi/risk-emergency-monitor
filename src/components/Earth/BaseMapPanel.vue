<template>
  <div class="basemap-panel" slot="overlay" :maskClosable="false">
    <div class="map-base" v-if="visible">
      <div class="map-title">
        <span class="title">底图设置</span>
        <img class="close-icon" src="./close.png" @click="visible = false" />
      </div>
      <div class="topmap-box">
        <div class="basemap-item" v-show="topmaps.length > 0">
          <slot></slot>
          <div
            class="top-item"
            v-for="(item, index) in topmaps"
            :key="item.id"
            href="javascript:void(0)"
            :id="item.id"
          >
            <a-row v-if="index === currentBasemapIndex" style="width:100%">
              <a-col :span="4" style="height: 100%; line-height: 36px">
                <a-switch
                  style="margin-top: 16px; margin-left:8px; width: 50%"
                  :checked="item.options.visible"
                  @change="topCheck($event, index)"
                />
              </a-col>
              <a-col :span="19">
                <span class="topmap-name">{{ item.options.name }}</span>
                <a-row>
                  <a-slider
                    style="height:12px"
                    :defaultValue="(item.options.opacity || 1) * 100"
                    @change="topChangeOpacity($event, index)"
                  />
                </a-row>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
      <div class="botmap-box">
        <div class="basemap-item basemap-wrapper" v-show="basemaps.length > 0">
          <a
            v-for="item in basemaps"
            :key="item.id"
            href="javascript:void(0)"
            :id="item.id"
            @click="baseChange"
            :class="{ 'basemap-active': item.options.visible }"
          >
            <p v-if="item.options.type" class="map-type">{{ item.options.type }}</p>
            <img :src="item.icon" />
            <p class="map-name">{{ item.options.name }}</p>
          </a>
        </div>
      </div>
    </div>
    <div class="map-base map-base-out" v-else>
      <div class="botmap-box">
        <div class="basemap-item basemap-wrapper">
          <a
            :key="currentBasemap.id + '_out'"
            href="javascript:void(0)"
            :id="currentBasemap.id"
            @click="() => {visible = true}"
            class="basemap-active"
          >
            <p v-if="currentBasemap.options.type" class="map-type">{{ currentBasemap.options.type }}</p>
            <img :src="currentBasemap.icon" />
            <p class="map-name">{{ currentBasemap.options.name }}</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "BaseMapPanel",
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      domId: this.data.domId,
      myMap: this.data.myMap,
      visible: false,
      topmaps: [],
      basemaps: [],
      currentBasemap: {
        id: '',
        options: {}
      },
      currentBasemapIndex: 0,
      basemapsNotBlanK: [], //不包括空白底图的底图集合
      isShowBlankMap: true
    };
  },
  mounted() {
    this.data.options = this.data.options == undefined ? {} : this.data.options;
    this.isShowBlankMap =
      this.data.options.isShowBlankMap != undefined
        ? this.data.options.isShowBlankMap
        : true;
    for (let i = 0; i < this.data.topmaps.length; i++) {
      if (
        this.data.topmaps[i].options.ischange == undefined ||
        this.data.topmaps[i].options.ischange == true
      ) {
        this.topmaps.push(this.data.topmaps[i]);
      }
    }
    let existShow = false; //如果底图全部配置了不显示，则默认显示空白底图
    for (let i = 0; i < this.data.basemaps.length; i++) {
      if (
        this.data.basemaps[i].options.ischange == undefined ||
        this.data.basemaps[i].options.ischange == true
      ) {
        if (this.data.basemaps[i].options.visible) {
          existShow = true
          this.currentBasemap = this.data.basemaps[i]
        }
        this.basemaps.push(this.data.basemaps[i]);
        this.basemapsNotBlanK.push(this.data.basemaps[i]);
      }
    }
    if (this.isShowBlankMap) {
      this.basemaps.push({
        id: "blank_map",
        options: {
          name: "空白底图",
          visible: !existShow
        }
      });
      if (!existShow) {
        this.currentBasemap = {
          id: "blank_map",
          options: {
            name: "空白底图",
            visible: true
          }
        }
      }
    }
  },
  methods: {
    baseOperation() {
      this.myMap.currentTool = this;
      this.myMap.drawManager.clearDraw();
      this.myMap.measureManager.clearMeasure();
    },
    topCheck(e, index) {
      this.baseOperation();
      for (let i = 0; i < this.topmaps.length; i++) {
        if (i == index) {
          this.topmaps[index].options.visible = !!e;
        } else if (this.topmaps[i].options.visible) {
          this.topmaps[i].options.visible = false;
          this.myMap.changeTopmap([this.topmaps[i]]);
        }
      }
      this.myMap.changeTopmap([this.topmaps[index]]);
    },
    topChangeOpacity(e, index) {
      let topmap = this.topmaps[index];
      topmap.options.opacity = e / 100;
      let topLayer = this.myMap.layerManager
        .getTopLayers()
        .filter(tl => tl.id == topmap.id)[0];
      if (topLayer != null) {
        topLayer.setOpacity(topmap.options.opacity);
      }
    },
    baseChange(evt) {
      this.baseOperation();
      let id = evt.currentTarget.id;
      let basemap = this.basemaps.filter(function(item) {
        return item.id == id;
      })[0];
      if (basemap) {
        for (let i = 0; i < this.basemaps.length; i++) {
          if (this.basemaps[i].id == id) {
            this.basemaps[i].options.visible = true;
            this.currentBasemap = this.basemaps[i];
            if (['testvec'].includes(this.basemaps[i].id)) {
              this.currentBasemapIndex = 2
            } else if (['testkd', 'testfxgf', 'testimg'].includes(this.basemaps[i].id)) {
              this.currentBasemapIndex = 3
            } else if (['testter'].includes(this.basemaps[i].id)) {
              this.currentBasemapIndex = 4
            } else {
              this.currentBasemapIndex = 0
            }
          } else {
            this.basemaps[i].options.visible = false;
          }
        }
        this.myMap.changeBasemap(this.basemapsNotBlanK);
        this.topCheck(true, this.currentBasemapIndex)
      }
    }
  }
};
</script>
<style scoped>
.basemap-panel {
  border-radius: 4px;
  margin-bottom: 0px;
  background: var(--bgTransColor);
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.38);
}
.basemap-item {
  border-radius: 2px;
  padding-right: 8px;
}
.basemap-item a {
  padding: 8px;
  padding-right: 0px;
  text-align: center;
  position: relative;
  display: inline-block;
}
.map-title {
  display: flex;
  justify-content: space-between;
  padding: 14px 24px;
  color: var(--fontColorGray);
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(199, 199, 199, 0.5);
}
.map-title .close-icon {
  width: 16px;
  height: 16px;
  margin-top: 4px;
  cursor: pointer;
}
.basemap-item .top-item {
  margin-left: 11px;
  color: var(--fontColorGray);
}
.basemap-item .top-item .topmap-name{
  padding-left: 4px;
  font-size: 14px;
  text-align: left;
  color: var(--fontColorGray);
  line-height: 20px;
}

.map-base .topmap-box {
  margin-top: 12px;
  display: block;
}
.map-base .botmap-box {
  margin-bottom: 8px;
  display: block;
}
.basemap-item a img {
  width: 110px;
  height: 75px;
  border: 1px solid var(--scrollBarColor);
  border-radius: 3px;
}
.basemap-item a p {
  margin-bottom: 0px;
  position: absolute;
  right: 0px;
  bottom: 8px;
  padding: 0px 4px;
  color: var(--fontColor);
  background: rgba(0, 0, 0, 0.5);
  line-height: 25px;
}
.basemap-item a p.top-check {
  top: 11px;
  left: 13px;
  width: 0px;
  padding: 0px;
}
.basemap-item .basemap-active {
  display: block;
}
.basemap-item .basemap-active p {
  background: var(--bgColor3);
  color: var(--whiteColor);
}
.basemap-item .basemap-active img {
  border: 1px solid var(--bgColor3);
}
.basemap-wrapper {
  display: flex;
  flex-wrap: wrap;
  max-width: 400px;
  justify-content: flex-start;
}
.basemap-wrapper a {
  position: relative;
  display: block;
  margin-left: 8px;
  margin-right: 2px;
}
.basemap-wrapper a .map-type {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 50%;
  height: 20px;
  font-size: 10px;
  line-height: 20px;
  background: linear-gradient(135deg,#67a7ff, #2682f6);
  border-radius: 2px;
  border-bottom-right-radius: 4px;
}
.basemap-wrapper a .map-name {
  width: 110px;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}
.map-base-out .basemap-wrapper a{
  margin-left: 0px;
  margin-right: 0px;
}
.map-base-out .botmap-box {
  margin-bottom: 0px;
}
</style>
