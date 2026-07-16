<template>
  <div class="legend-wrap">
    <a-popover placement="leftBottom" class="popover">
      <div>
        <!-- <div v-if="IsShowText">
          <div class="diit-widget-btn">
            <a-button @click="onClick"> <diit-icon type="tuli" class="toolIcon" />图例 </a-button>
          </div>
        </div> -->
        <!-- <template v-else>
          <a-tooltip :placement="point" title="图例"> -->
        <div class="diit-widget-btn">
          <a-button>
            <diit-icon type="tuli" class="toolIcon" />
          </a-button>
        </div>
        <!-- </a-tooltip> -->
        <!-- </template> -->
      </div>
      <template slot="title">
        <div class="title">图例</div>
      </template>
      <template slot="content">
        <div class="diit-widget-drawer">
          <a-collapse v-if="Layer.length" @change="collapseChange" v-model="activeKey">
            <a-collapse-panel
              v-for="(Layers, layerIndex) in Layer"
              :key="String(layerIndex)"
              :header="Layers.name"
            >
              <template v-for="(item, $index) in Layers.LegendArry">
                <a-row :gutter="[8, 8]" :key="$index" class="widget-legend-row">
                  <a-col class="widget-legend-container" span="12" v-for="(legend, lindex) in item" :key="lindex">
                    <div class="widget-legend-img" v-if="legend.img">
                      <img class="img-icon" :src="legend.img" />
                    </div>
                    <div class="widget-legend-img" v-if="legend.color">
                      <span
                        class="img-icon"
                        :style="`background:${legend.color}`"
                      ></span>
                      <!-- <span
                        class="img-icon"
                        v-if="legend.type == 'Point'"
                        :style="`border-radius:10px; height:20px; width:20px; background: ${legend.color}`"
                      ></span>
                      <span
                        class="img-icon"
                        v-if="legend.type == 'LineString'"
                        :style="'margin-top:8px;height:5px;width:20px;background:' + legend.color"
                      ></span> -->
                      <!-- <span
                        class="img-icon"
                        v-if="legend.type == 'Polygon' || legend.type == null"
                        :style="'height:20px;width:20px;background:' + legend.color"
                      ></span> -->
                    </div>
                    <div class="widget-legend-txt">
                      <a-tooltip placement="topLeft" :title="legend.label" :mouseLeaveDelay="0">
                        <div class="text" v-text="legend.label"></div>
                      </a-tooltip>
                    </div>
                  </a-col>
                </a-row>
              </template>
            </a-collapse-panel>
          </a-collapse>
          <a-empty v-else />
        </div>
      </template>
    </a-popover>
  </div>
</template>
<script>
import WidgetsModal from './modal.vue'
export default {
  name: 'Legend',
  inject: ['mapInstance'],
  computed: {
    myMap () {
      return this.mapInstance()
    }
  },
  components: {
    WidgetsModal
  },
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    activeKey () {}
  },
  data () {
    return {
      visible: false,
      Layer: [],
      LegendArry: [],
      // point: this.data?.options?.position || 'left',
      // IsShowText: this.data?.options?.IsShowText || false,
      point:  'left',
      IsShowText:  false,
      legendConfig: [],
      activeKey: ['1']
    }
  },
  mounted () {
    const that = this
    // 图例的实现就是监听layer加载和删除事件,获取所有图层,然后解析
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.AddLayerEvent,
      that.refresh
    )
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.RemoveLayerEvent,
      that.refresh
    )
    that.myMap.eventManager.subscribe(
      that.myMap.eventManager.enumEventType.Map.ClearLayerEvent,
      that.refresh
    )
  },
  methods: {
    collapseChange () {},
    // 可能这还有点不适合你这,
    refresh (event) {
      const layers = []
      const operationLayers = this.myMap.layerManager.getOperationLayers()
      for (let i = 0; i < operationLayers.length; i++) {
        const operationLayer = operationLayers[i]
        debugger
        if (operationLayer.type === 18 || operationLayer.type === '18') {
          const options = operationLayer.options
          const layerType = options.layerType
          if (layers.filter(l => l.layerType === layerType).length === 0) {
            const layer = {
              name: options.layerTypeName,
              layerType: layerType
            }
            const legendArray = []
            if (options.render != null) {
              let legendArrayThree = []
              for (let j = 0; j < options.render.values.length; j++) {
                const renderValue = options.render.values[j]
                legendArrayThree.push({
                  label: renderValue.value,
                  color: renderValue.style['fill-color'].substring(0, 7)
                })
                if (legendArrayThree.length === 3) {
                  legendArray.push(legendArrayThree)
                  legendArrayThree = []
                }
              }
            } else if (options.style != null) {
              legendArray.push([{
                label: options.layerTypeName,
                color: options.style['fill-color'].substring(0, 7)
              }])
            }
            layer['LegendArry'] = this.processing(legendArray)
            layers.push(layer)
          }
        }
      }
      this.activeKey = (new Array(layers.length)).fill().map((_, index) => index)
      this.Layer = layers
    },
    processing (data) {
      const newData = []
      let group = []
      data.flat().forEach(item => {
        if (group.length === 2) {
          newData.push(group)
          group = []
        }
        group.push(item)
      })
      if (group.length > 0) newData.push(group)
      return newData
    }
  }
}
</script>
<style lang="less" scoped>
.title {
  font-size: 16px;
  padding: 10px 0;
}
.diit-widget-drawer {
  width: 250px;
  max-height: 300px;
  overflow: auto;
}

.widget-legend-img {
  width: 20px;
  height: 20px;

  .img-icon {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}

.widget-legend-container {
  display: flex;
  .widget-legend-txt {
    width: calc(100% - 20px);
    padding-left: 8px;

    .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
