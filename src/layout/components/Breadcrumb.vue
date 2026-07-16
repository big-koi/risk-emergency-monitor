<template>
  <div class="breadcrumb">
    <span>当前位置：</span>
    <a-breadcrumb>
      <a-icon slot="separator" type="double-right"/>
      <a-breadcrumb-item v-for="t in data" :key="t.key">{{ t.name }}</a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  name: "Breadcrumb",
  data() {
    return {}
  },
  computed: {
    ...mapState({
      data: state => state.breadcrumb.data
    })
  }
}
</script>

<style scoped lang="less">
.breadcrumb {
  display: flex;
  width: 100%;
  height: 0.30rem;
  padding-left: 0.21rem;
  font-size: 0.14rem;
  color: #666;
  background-color: #F4F4F4;
  align-items: center;

  > span {
    color: #7A7A7A;
  }

  .ant-breadcrumb {
    font-size: 0.14rem;

    /deep/ .ant-breadcrumb-separator {
      i {
        font-size: 0.12rem;
        color: #979797;
      }
    }

    /deep/ .ant-breadcrumb-link {
      color: #7A7A7A;
    }

    > span:last-of-type {
      /deep/ .ant-breadcrumb-link {
        color: #333333;
      }
    }
  }
}
</style>
