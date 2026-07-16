<template>
  <div class="zf-legend-warn">
    <div class="legend-title">图例</div>
    <div class="legend-con">
      <div v-for="(item, index) in legendData" :key="index" class="legend-item">
        <!-- <i :style="'background:'+item.color"></i> -->
        <img crossOrigin="anonymous" :src="item.img" :style="{width: '30px', height: '30px'}"/>
        {{ item.title || (item.min.toFixed(0) + " - " + (item.max).toFixed(0)) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LegendWarn',
  props: ['legendData'],
  data() {
    return {}
  }
}
</script>

<style lang="less">
.zf-legend-warn {
  position: absolute;
  right: 0.3rem;
  bottom: 1.40rem;
  /*  background:url(../../../assets/images/legend-bg.png) no-repeat center center;
   background-size:100% 100%; */
  min-width: 1.29rem;
  height: auto;
  padding-top: 0.08rem;
  padding-bottom: 0.10rem;

  .legend-title {
    color: var(--zfColor);
    line-height: 0.40rem;
    border-bottom: 0.01rem solid #458cf9;
    margin-bottom: 0.08rem;
  }

  .legend-item {
    color: var(--zfColor);
    text-align: left;
    margin-top: 0.01rem;
    line-height: 0.26rem;
    padding-left: 0.10rem;
    padding-right: 0.10rem;
  }

  .legend-item i {
    display: inline-block;
    width: 0.40rem;
    height: 0.21rem;
    line-height: 0.20rem;
    vertical-align: middle;
    margin-left: 0.07rem;
    margin-right: 0.07rem;
  }
}
</style>