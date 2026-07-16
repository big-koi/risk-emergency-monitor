<template>
  <div class="zf-layer-choice zf-radio-group">
    <div class="zf-layer-choice-cnt">
      <a-radio-group v-model="layerradio" @change="onRadioChange">
        <a-radio
          v-for="(item, index) in mapData"
          :key="index"
          :style="{
            'margin-top': mapData.length == 1 ? '10px' : parseInt((135 - 15 * mapData.length) / (mapData.length +1)) + 'px',
            'margin-bottom': mapData.length == 1 ? '10px' : '',
          }"
          :value="index"
        >
          {{ item.name }}
        </a-radio>
      </a-radio-group>
    </div>
    <!-- 标记 -->
  </div>
</template>

<script>
export default {
  name: "LayerChoice",
  props: {
    mapData: {},
  },
  data() {
    return {
      layerradio: null,
    };
  },
  mounted() {
    if (this.mapData == null || this.mapData.length == 0) return;
    this.layerradio = 0;
    setTimeout(() => {
      this.onRadioChange();
    }, 500);
  },
  methods: {
    onRadioChange() {
      this.$emit("layerChange", this.mapData[this.layerradio].code);
    },
  },
};
</script>
<style lang="less">
.zf-layer-choice {
  // width: 1.62rem;
  max-height: 1.50rem;
  margin: auto;
  text-align: left;
  padding-top: 0.10rem;
  padding-left: 0.20rem;
  padding-bottom: 0.10rem;

  .zf-layer-choice-cnt {
    max-height: 1.30rem;
    overflow: auto;
  }
}
</style>
