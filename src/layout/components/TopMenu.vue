<template>
  <a-menu :selectedKeys="current" mode="horizontal" @click="handlerMenuClick">
    <a-menu-item key="iframe:oneMap">
      <i class="icon one-map"></i> 一张图
    </a-menu-item>
    <a-sub-menu key="专题分析">
      <span slot="title" class="submenu-title-wrapper">
        <i class="icon analysis"></i> 专题分析 <a-icon type="down" style="margin-left: 0.05rem;"/>
      </span>
      <a-menu-item class="top-submenu-item" key="/earthquake:地震专题分析">
        地震专题分析
      </a-menu-item>
      <a-menu-item class="top-submenu-item" key="/flood:水灾专题分析">
        水灾专题分析
      </a-menu-item>
      <a-menu-item class="top-submenu-item" key="/forestFire:森林火灾专题分析">
        森林火灾专题分析
      </a-menu-item>
      <a-menu-item class="top-submenu-item" key="/geologicHazard:地质灾害专题分析">
        地质灾害专题分析
      </a-menu-item>
    </a-sub-menu>
    <a-menu-item key="/modelBuild:模型构建">
      <i class="icon model-build"></i> 模型构建
    </a-menu-item>
  </a-menu>
</template>

<script>
export default {
  name: "TopMenu",
  data() {
    return {
      current: [],
    }
  },
  mounted() {
    this.current = [sessionStorage.getItem('menuCurrent')] || [];
  },
  methods: {
    // 处理菜单点击
    handlerMenuClick({key, keyPath}) {
      // 先把iframe隐藏
      this.$store.commit('iframe/SET_IS_SHOW', false);
      //
      let keyArr = key.split(':');
      // 正常开发的页面
      if (keyArr[0] == 'loading') return this.$message.info('开发中······');
      // 菜单选中的
      this.current = [key];
      sessionStorage.setItem('menuCurrent', key);
      // 路径一样时
      if (this.$route.fullPath == keyArr[0] || this.$route.fullPath == `/layout?key=${keyArr[1]}`) return;
      // 面包屑
      this.$store.dispatch('breadcrumb/handlerSetData', keyPath);
      // iframe 的
      if (keyArr[0] == 'iframe') {
        this.$router.push({path: '/layout', query: {key: keyArr[1]}});
        this.$store.commit('iframe/SET_IS_SHOW', true);
        this.$store.commit('iframe/SET_SRC', webConfig.iframeSrc[keyArr[1]]);
        return;
      }
      //
      this.$store.commit('thematicAnalysis/SET_SUB_LIST', {isShow: false});
      this.$store.commit('thematicAnalysis/SET_LIST_FILTER', {time: ['', '']});
      // 此项目内部的
      this.$router.push(keyArr[0]);
    }
  }
}
</script>

<style scoped lang="less">
.ant-menu {
  margin-left: 0.60rem;
  background-color: transparent;

  .ant-menu-submenu-active,
  &:not(.ant-menu-inline) .ant-menu-submenu-open {
    color: #fff;
  }
}

.ant-menu-horizontal {
  border-bottom: none;

  .ant-menu-submenu,
  .ant-menu-item {
    margin: 0 0.30rem;
  }

  > .ant-menu-item,
  > .ant-menu-submenu {
    font-size: 0.18rem;
    color: #fff;

    &:hover {
      font-weight: bold;
      color: #fff;
      border-bottom-color: #fff;
    }

    .icon {
      position: relative;
      display: inline-block;
      width: 0.20rem;
      height: 0.20rem;
      margin-right: 0.10rem;
      background-repeat: no-repeat;
      background-size: 100% 100%;

      &.one-map {
        top: 0.02rem;
        width: 0.22rem;
        background-image: url("../../assets/images/menu/oneMap.png");
      }

      &.analysis {
        top: 0.03rem;
        background-image: url("../../assets/images/menu/analysis.png");
      }

      &.model-build {
        top: 0.02rem;
        width: 0.22rem;
        background-image: url("../../assets/images/menu/analysis.png");
      }
    }
  }

  /deep/ .ant-menu-submenu-title:hover {
    color: #fff;
  }

  > .ant-menu-submenu-selected,
  > .ant-menu-submenu-open,
  > .ant-menu-submenu-active,
  > .ant-menu-item-selected {
    border-bottom-color: #fff;
  }
}

.top-submenu-item {
  padding: 0;
  margin-left: 0.20rem !important;
  margin-right: 0.20rem;
  border-bottom: solid 0.01rem #DDDDDD;
  font-weight: bold;
  color: #333;
  text-align: center;

  &:last-of-type {
    border-bottom: none;
  }
}
</style>