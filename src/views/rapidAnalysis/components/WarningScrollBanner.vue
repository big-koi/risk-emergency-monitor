<template>
  <a-carousel
    v-if="list && list.length > 0"
    :autoplay="true"
    :interval="3000"
    :dots="false"
    class="scroll-carousel"
  >
    <div
      v-for="item in list"
      :key="item.index || item.name"
      class="scroll-item"
      :class="item.class"
    >
      {{ item.name }}
    </div>
  </a-carousel>
</template>

<script>
export default {
  name: "WarningScrollBanner",
  props: {
    list: { type: Array, default: () => [] }
  }
};
</script>

<style scoped lang="less">
.scroll-carousel {
  width: 4.2rem;
  position: fixed;
  top: 0.16rem;
  right: 5rem;
  z-index: 100;
  cursor: pointer;

  .scroll-item {
    height: 0.47rem;
    line-height: 0.47rem;
    text-align: right;
    padding-right: 0.7rem;
    font-size: 0.15rem;
    color: #ffffff;
  }

  .byyj-bg {
    background: url(../../../assets/images/rapidAnalysis/byyj_scoll_bg.png)
      no-repeat center center;
    background-size: 100% 100%;
  }

  .hongseyujing-bg {
    background: url(../../../assets/images/rapidAnalysis/nl_scoll_hongse_bg.png)
      no-repeat center center;
    background-size: 100% 100%;
  }

  .chengseyujing-bg {
    background: url(../../../assets/images/rapidAnalysis/nl_scoll_chengse_bg.png)
      no-repeat center center;
    background-size: 100% 100%;
  }

  .huangseyujing-bg {
    background: url(../../../assets/images/rapidAnalysis/nl_scoll_huangse_bg.png)
      no-repeat center center;
    background-size: 100% 100%;
  }

  .lanseyujing-bg {
    background: url(../../../assets/images/rapidAnalysis/nl_scoll_lanse_bg.png)
      no-repeat center center;
    background-size: 100% 100%;
  }
}
</style>
