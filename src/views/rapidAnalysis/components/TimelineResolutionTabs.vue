<template>
  <div>
    <div class="time-tab-btn-box" v-if="showFloodTabs">
      <div
        v-for="opt in floodOptions"
        :key="'flood-' + opt.value"
        class="tab-btn-item"
        :class="{ active: floodActive === opt.value }"
        @click="$emit('flood-change', opt.value)"
      >
        {{ opt.label }}
      </div>
    </div>
    <div class="time-tab-btn-box" v-if="showShortTermTabs">
      <div
        v-for="opt in shortTermOptions"
        :key="'st-' + opt.value"
        class="tab-btn-item"
        :class="{ active: shortTermActive === opt.value }"
        @click="$emit('short-term-change', opt.value)"
      >
        {{ opt.label }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  getShortTermResolutionOptions,
  getFloodTimelineModeOptions,
  shouldShowShortTermResolutionTabs,
  shouldShowFloodTimelineTabs
} from "../modules/mapLayers/timelineStrategy";

export default {
  name: "TimelineResolutionTabs",
  props: {
    disasterTypeIndex: { type: Number, default: 1 },
    isJsDetailsChart: { type: Boolean, default: false },
    csnlValue: { type: [String, Number], default: "1" },
    shValue: { type: [String, Number], default: "1" },
    floodActive: { type: Number, default: 2 },
    shortTermActive: { type: Number, default: 3 }
  },
  computed: {
    showFloodTabs() {
      return shouldShowFloodTimelineTabs({
        disasterTypeIndex: this.disasterTypeIndex,
        isJsDetailsChart: this.isJsDetailsChart,
        csnlValue: this.csnlValue,
        shValue: this.shValue
      });
    },
    showShortTermTabs() {
      return shouldShowShortTermResolutionTabs(this.disasterTypeIndex);
    },
    floodOptions() {
      return getFloodTimelineModeOptions();
    },
    shortTermOptions() {
      return getShortTermResolutionOptions();
    }
  }
};
</script>

<style scoped lang="less">
.time-tab-btn-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 1.5rem;
  left: 0.2rem;
  z-index: 100;
  background: linear-gradient(0deg, #16446e 0%, #030c16);
  border: 0.5px solid;
  border-image: linear-gradient(270deg, #1b94ff 100%, #81c7ff 51%, #1996ff 0%)
    0.5 0.5;
  box-shadow: 0px 0px 20px 0px #013f74 inset;

  .tab-btn-item {
    padding: 0.1rem 0.2rem;
    color: #ffffff;
    cursor: pointer;

    &.active {
      background: linear-gradient(341deg, #0e7ce1 13%, #005ec7 96%);
    }
  }
}
</style>
