<template>
  <div class="map-legend-box" v-if="visible" :style="{ bottom: bottom }">
    <div class="legend-header">
      <div class="title">图例</div>
    </div>
    <div class="legend-content">
      <div>
        <div
          class="legend-item"
          style="padding-top: 0.1rem;"
          v-for="item in riverLayers"
          :key="'hl-' + item.id"
        >
          <img :src="icons.river" alt="" />
          <span class="name">{{ riverLayerName(item.id) }}</span>
        </div>
      </div>
      <div class="legend-item" v-if="showMonitor" style="padding-top: 0.1rem;">
        <img :src="icons.monitor" alt="" />
        <span class="name">监测设备</span>
      </div>
      <div class="legend-item" v-if="disasterTypeIndex === 1" style="padding-top: 0.1rem;">
        <img :src="icons.byyj" alt="" />
        <span class="name">预警城市</span>
        <a-checkbox :checked="checks.yjcs" @change="$emit('toggle-yjcs', $event)" />
      </div>
      <div class="legend-item" v-if="disasterTypeIndex === 1" style="padding-top: 0.1rem;">
        <img :src="icons.qxyj" alt="" />
        <span class="name">气象台暴雨预警</span>
        <a-checkbox :checked="checks.qxyj" @change="$emit('toggle-qxyj', $event)" />
      </div>
      <div
        class="legend-item"
        v-if="disasterTypeIndex === 2 && isSkDetailsChart"
        style="padding-top: 0.1rem;"
      >
        <img :src="icons.skPoint" alt="" />
        <span class="name">降雨量最大格网点</span>
        <a-checkbox :checked="checks.jylzdgw" @change="$emit('toggle-jylzdgw', $event)" />
      </div>
      <h4 class="item-title" v-if="![3, 4].includes(disasterTypeIndex)">
        降雨范围
        <a-checkbox :checked="checks.jyfw" @change="$emit('toggle-jyfw', $event)" />
      </h4>
      <div class="legend-item2" v-if="disasterTypeIndex === 1">
        <div class="item" v-for="c in shortTermColors" :key="c.name">
          <span class="color-block" :style="{ background: c.color }"></span>
          <span class="name">{{ c.name }}</span>
        </div>
      </div>
      <div class="legend-item2" v-if="disasterTypeIndex === 2">
        <div class="item" v-for="c in liveColors" :key="c.name">
          <span class="color-block" :style="{ background: c.color }"></span>
          <span class="name">{{ c.name }}</span>
        </div>
      </div>
      <template v-if="[3, 4].includes(disasterTypeIndex)">
        <h4 class="item-title" v-if="showWarningLevel">
          预警等级
          <a-checkbox :checked="checks.jydj" @change="$emit('toggle-jydj', $event)" />
        </h4>
        <div class="legend-item" v-if="showWarningLevel">
          <div class="item" v-for="w in floodWarningLevels" :key="w.label">
            <img :src="w.icon" alt="" />
            <span class="name" v-html="w.desc"></span>
            <span class="name">{{ w.label }}</span>
          </div>
        </div>
        <h4 class="item-title">
          积水深度
          <a-checkbox :checked="checks.jssd" @change="$emit('toggle-jssd', $event)" />
        </h4>
        <div class="legend-item2">
          <div class="item" v-for="c in floodDepthColors" :key="c.name">
            <span class="color-block" :style="{ background: c.color }"></span>
            <span class="name">{{ c.name }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
const RIVER_NAMES = {
  1: "一级流域",
  2: "二级流域",
  3: "三级流域",
  4: "河流",
  5: "国道",
  6: "省道",
  7: "高速公路"
};

export default {
  name: "MapLegendPanel",
  props: {
    visible: { type: Boolean, default: true },
    bottom: { type: String, default: "1.5rem" },
    disasterTypeIndex: { type: Number, default: 1 },
    riverLayers: { type: Array, default: () => [] },
    showMonitor: { type: Boolean, default: false },
    isSkDetailsChart: { type: Boolean, default: false },
    showWarningLevel: { type: Boolean, default: true },
    checks: {
      type: Object,
      default: () => ({
        yjcs: true,
        qxyj: true,
        jylzdgw: true,
        jyfw: true,
        jydj: true,
        jssd: true
      })
    }
  },
  data() {
    return {
      icons: {
        river: require("../../../assets/images/rapidAnalysis/hllineIcon.png"),
        monitor: require("../../../assets/images/mark/jcdw_fyj.png"),
        byyj: require("../../../assets/images/earth/byyj.png"),
        qxyj: require("../../../assets/images/rapidAnalysis/qxyjIcon.png"),
        skPoint: require("../../../assets/images/rapidAnalysis/skjyXzIcon.png")
      },
      shortTermColors: [
        { color: "#fff", name: "无降水" },
        { color: "#d1feca", name: "0-2.5" },
        { color: "#adfca4", name: "2.5-5" },
        { color: "#4fec5d", name: "5-10" },
        { color: "#01c90d", name: "10-25" },
        { color: "#73a6fd", name: "25-50" },
        { color: "#6300fc", name: "50-100" },
        { color: "#fe00fe", name: " >100" }
      ],
      liveColors: [
        { color: "#00FF53", name: "0-10" },
        { color: "#35A304", name: "10-25" },
        { color: "#5EBAFE", name: "25-50" },
        { color: "#1400F8", name: "50-100" },
        { color: "#E11BE2", name: "100-250" },
        { color: "#872713", name: "＞＝250" }
      ],
      floodDepthColors: [
        { color: "#3B9DFF", name: "0.1-0.3" },
        { color: "#0808FF", name: "0.3-0.5" },
        { color: "#E7FF4A", name: "0.5-1.0" },
        { color: "#FFA600", name: "1.0-2.0" },
        { color: "#FF0000", name: "2.0-3.0" },
        { color: "#4C0073", name: "＞3.0" }
      ],
      floodWarningLevels: [
        {
          icon: require("../../../assets/images/rapidAnalysis/lanseyujing.png"),
          desc: "0.1-0.15m T≥1h",
          label: "蓝色预警"
        },
        {
          icon: require("../../../assets/images/rapidAnalysis/huangseyujing.png"),
          desc: "0.15-0.30m T≥1h<br />0.1-0.15m T≥3h",
          label: "黄色预警"
        },
        {
          icon: require("../../../assets/images/rapidAnalysis/chengseyujing.png"),
          desc: "0.30-0.50m T≥1h<br />0.1-0.30m T≥3h",
          label: "橙色预警"
        },
        {
          icon: require("../../../assets/images/rapidAnalysis/hongseyujing.png"),
          desc: "≥0.50m T≥1h<br />0.30-0.50m T≥3h",
          label: " 红色预警"
        }
      ]
    };
  },
  methods: {
    riverLayerName(id) {
      return RIVER_NAMES[id] || "";
    }
  }
};
</script>

<style scoped lang="less">
.map-legend-box {
  position: absolute;
  bottom: 1.5rem;
  right: 4.6rem;
  min-width: 2rem;
  background: linear-gradient(137deg, rgba(0, 46, 86, 0.35) 5%, #002c3d 99%);
  padding: 0.1rem 0.2rem;
  border: 0.01rem solid #59b2ff;
  border-radius: 0.08rem;
  font-size: 0.14rem;

  .title {
    font-weight: 600;
    color: #c2e1ff;
  }

  .legend-header {
    display: flex;
    justify-content: space-between;
  }

  .legend-content {
    .name {
      color: #ffffff;
      padding-left: 0.05rem;
    }

    .item-title {
      padding: 0.1rem 0;
      font-weight: 600;
      color: #c2e1ff;
    }

    .legend-item {
      .item {
        display: flex;
        align-items: center;
        padding-bottom: 0.05rem;
      }

      img {
        height: 20px;
      }
    }

    .legend-item2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-column-gap: 0.1rem;

      .color-block {
        display: inline-block;
        width: 0.1rem;
        height: 0.1rem;
        background: #35a304;
        border-radius: 1px;
      }
    }
  }
}
</style>
