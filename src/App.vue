<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <router-view/>
    </a-config-provider>
  </div>
</template>

<script>
import zhCN from 'ant-design-vue/es/locale/zh_CN';

export default {
  name: 'App',
  data() {
    return {
      zhCN,
    };
  },
  created() {
    // 给根元素动态设置字体大小达到适配的效果
    this.setFontSize();
    window.addEventListener('resize', () => {
      this.setFontSize();
    });
    // 保存vuex数据
    this.saveVuex();
  },
  methods: {
    // 给根元素动态设置字体大小达到适配的效果
    setFontSize() {
      let defaultSize = 1920; // 默认分辨率
      let defaultFontSize = 100; // 根元素默认字体大小(建议100 rem换算的时候好算)
      let fontSize = document.documentElement.clientWidth * defaultFontSize / defaultSize;
      document.getElementsByTagName('html')[0].style.fontSize = fontSize + 'px';
    },
    // 保存vuex数据
    saveVuex() {
      // 需要保存的
      let saveKeyArr = ['breadcrumb', 'iframe', 'user'];
      saveKeyArr.forEach(t => {
        // 在页面加载时读取sessionStorage里的状态信息
        if (sessionStorage.getItem('store')) {
          this.$store.replaceState(
            Object.assign(
              {},
              this.$store.state,
              {
                [t]: JSON.parse(sessionStorage.getItem('store'))[t]
              },
            )
          )
        }
      });

      // 在页面刷新时将vuex里的信息保存到sessionStorage里
      // beforeunload事件在页面刷新时先触发
      window.addEventListener('beforeunload', () => {
        sessionStorage.setItem('store', JSON.stringify(this.$store.state))
      });
    }
  }
}
</script>

<style lang="less">
@import './assets/style/diit-antdv.less';
@import url('./assets/style/antDesign');

#app {
  height: 100%;
  font-family: AlibabaPuHuiTi;
  font-size: 0.14rem;
  color: #333;
}
</style>
