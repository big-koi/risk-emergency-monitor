<template>
  <div :class="['panel-hzs', position, { open: isOpen }]">
    <!-- 控制按钮 -->
    <span class="control-btn" @click="handlerOpen">
      <a-icon :type="`double-${iconArrow}`"/>
      <!-- <img src="../../assets/images/thematic/cutOut.png" /> -->
    </span>
    <!-- 内容 -->
    <div class="panel-box">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex"
export default {
  name: "ThematicPanel",
  data() {
    return {
      // 是否打开
      isOpen: true,
      // 位置
      position: 'right',
    }
  },
  computed: {
    iconArrow() {
      if (this.position == 'left') {
        return this.isOpen ? 'left' : 'right'
      }
      if (this.position == 'right') {
        return this.isOpen ? 'right' : 'left'
      }
    },
    ...mapState({
      listShow: state => state.thematicAnalysis.listShow
    })
  },
  methods: {
    // 处理打开关闭
    handlerOpen() {
      this.isOpen = !this.isOpen;
      // this.$store.commit('thematicAnalysis/SET_SUB_LIST', {isShow: state.});
    }
  }
}
</script>

<style scoped lang="less">
.panel-hzs {
  position: absolute;
  top: 0;
  width: 8.3rem;
  height: 100%;
  border-radius: 0.04rem;
  transition: 500ms;

  .control-btn {
    position: absolute;
    top: 1rem;
    left: 8.3rem;
    border-radius: 0 0.04rem 0.04rem 0;
    z-index: 10;
    background-color: #f4f4f4;
    padding: 10px 5px;
    border: 1px solid #E3E3E3;
    border-left: 0;
    cursor: pointer;
    img {
      width: 1.03rem;
      height: 0.22rem;
      cursor: pointer;
    }
  }

  &.left {
    left: -8.3rem;
    .control-btn {
      left: 8.3rem;
      border-radius: 0.04rem 0 0 0.04rem;
    }
    &.open {
      left: 0;
    }
  }

  &.right {
    right: -8.3rem;

    .control-btn {
      left: -0.24rem;
      border-right: 0;
      border-left: 1px solid #E3E3E3;
      border-radius: 0.04rem 0 0 0.04rem;
      background: #fff;
      height: 47px;
      top: 0.99rem;
    }

    &.open {
      right: 0;
    }
  }

  .panel-box {
    height: 45px;
    position: relative;
  }
}
</style>