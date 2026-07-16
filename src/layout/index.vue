<template>
  <a-layout>
    <!-- 头部 -->
    <a-layout-header>
      <!-- logo -->
      <div class="logo-shadow">
        洪涝临灾仿真模拟预警系统
        <span class="sub-title">
          -
          滚动运行
        </span>
      </div>
      <div class="logo">
        洪涝临灾仿真模拟预警系统
        <span class="sub-title">
          -
          滚动运行
        </span>
      </div>
      <!-- 菜单 -->
      <!-- <top-menu></top-menu> -->
      <!-- 用户 -->
      <user></user>
    </a-layout-header>
    <!-- 面包屑 -->
    <!-- <breadcrumb></breadcrumb> -->
    <!-- 主体内容 -->
    <a-layout-content>
      <router-view v-if="!iframeShow"/>
      <iframe v-if="iframeShow" :src="iframeSrc" frameborder="0" style="width: 100%; height: 100%;"></iframe>
    </a-layout-content>
  </a-layout>
</template>

<script>
import Breadcrumb from "./components/Breadcrumb";
import TopMenu from "./components/TopMenu";
import User from "./components/User";
import {mapState} from "vuex";

export default {
  name: "layout",
  components: {User, TopMenu, Breadcrumb},
  computed: {
    ...mapState({
      iframeShow: state => state.iframe.isShow,
      iframeSrc: state => state.iframe.src
    })
  }
}
</script>

<style scoped lang="less">
.ant-layout {
  height: 100%;
  background: url(../assets/images/body_bg.png) no-repeat center center;
  background-size: 100% 100%;
}

.ant-layout-header {
  display: flex;
  position: relative;
  padding-left: 0.26rem;
  padding-right: 0.46rem;
  height: 0.78rem;
  line-height: 0.88rem;
  align-items: center;
  // background: linear-gradient(90deg, rgba(6, 29, 67, 0.8), rgba(6, 29, 67, 0.8) 30%, rgba(7, 67, 144, 0.8) 50%, rgba(6, 29, 67, 0.8) 80%, rgba(6, 29, 67, 0.8));
  // border-bottom: 0.01rem solid rgba(66,142,244,1);
  background:url(../assets/images/header_bottom_bg.png) no-repeat center center;
  // background-size: 100% 100%;
}

.logo {
  padding-left: 0.34rem;
  font-size: 0.50rem;
  font-weight: 400;
  font-family: YouSheBiaoTiHei;
  // text-shadow: 4px 4px rgba(19,80,143,0.66);
  background-image: linear-gradient(to bottom, #ffffff, #e9f8ff, #77baff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  position: absolute;
  left: 0.26rem;
  .sub-title{
    font-size: 0.34rem;
  }
}
.logo-shadow {
  padding-left: 0.34rem;
  font-size: 0.50rem;
  font-weight: 400;
  font-family: YouSheBiaoTiHei;
  text-shadow: 0.02rem 0.04rem rgba(19,80,143,0.66);
  color: transparent;
  .sub-title{
    font-size: 0.34rem;
  }
}

.ant-layout-content {
  position: relative;
  height: calc(100% - 0.78rem);
  overflow: hidden;
}
</style>
