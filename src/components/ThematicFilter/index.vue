<template>
  <div class="thematic-filter">
    <a-form-model-item style="margin-right:0.05rem">
      <a-tree-select class="region-select" style="width: 1.4rem;" v-model="regionValue" :allowClear="true" :maxTagCount="1" :replaceFields="{ title: 'name', key: 'code', value: 'code', children: 'children' }" :tree-data="regionOptions" :showCheckedStrategy="SHOW_PARENT" :treeCheckStrictly="true" :filterTreeNode="filterTreeNode" tree-checkable placeholder="请选择评估区域" />
    </a-form-model-item>
    <!-- 时间 -->
    <a-form-model-item :label="option.selectTime.label">
      <a-range-picker allowClear format="YYYY-MM-DD" :placeholder="['', '']" @change="selectTime" style="width: 2.2rem;margin-right:0.05rem;" />
    </a-form-model-item>
    <!-- 搜索按钮 -->
    <a-button class="search-btn" type="primary" @click="handlerCommit">
      <img src="../../assets/images/thematic/search-icon.png" style="width: 15px;">
    </a-button>
    <!-- 新增按钮 -->
    <a-button class="add-btn" icon="plus" @click="handlerAdd"></a-button>
  </div>
</template>

<script>
import moment from "moment";
import { queryQY } from "@/api/district/index.js";
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
export default {
  name: "ThematicFilter",
  props: {
    option: {
      type: Object,
      default() {
        return {
          selectTime: {},
          xzq: [],
        };
      },
    },
  },
  data() {
    return {
      regionValue: [],
      SHOW_PARENT,
      regionOptions: [],
      // 时间
      time: ["", ""],
      xzq: [],
      regionOpt: [],
    };
  },
  mounted() {
    this.getAllRegion();
  },
  methods: {
    // 树形搜索
    filterTreeNode(value, node) {
      return node.data.props.name && node.data.props.name.includes(value);
    },
    moment,
    //时间范围
    selectTime(val, date) {
      this.time = date;
    },
    // 处理查询
    handlerCommit() {
      const region = this.regionValue.map((item) => {
        return item.value;
      });
      this.$emit("freshList", this.time, region.join(","));
    },
    // 处理新增
    handlerAdd() {
      this.$store.commit("thematicAnalysis/SET_IS_SHOW_ADD_MODAL", true);
    },
    // 获取行政区域
    getAllRegion() {
      queryQY().then((res) => {
        if (res.code == 200) {
          this.regionOptions = res.data.children;
        }
      });
    },
  },
};
</script>

<style>
.ant-select-tree-dropdown {
  max-height: 300px !important;
}
</style>
<style scoped lang="less">
.region-select {
  width: 320px;
  height: 40px;
  display: flex;
  line-height: 40px;
  align-items: center;
  /deep/.ant-select-selection--multiple {
    width: 100%;
    height: 32px;
    overflow: hidden;
    .ant-select-selection__rendered {
      display: flex;
      flex-wrap: nowrap;
      justify-content: flex-start;
      overflow-x: auto;
      overflow-y: hidden;
      height: 100%;
      padding: 0;
      margin: 0;
      &::-webkit-scrollbar {
        display: none !important;
      }
      &::-webkit-scrollbar-track {
        display: none !important;
      }
      &::-webkit-scrollbar-thumb {
        display: none !important;
      }
      // ul {
      //   width: 100%;
      //   height: 100%;
      //   overflow-y: hidden;
      //   display: -webkit-box;
      //   &::-webkit-scrollbar {
      //     width: 5px;
      //     height: 5px;
      //   }
      //   &::-webkit-scrollbar-track {
      //     background-color: #dedede;
      //     -webkit-border-radius: 1em;
      //     -moz-border-radius: 1em;
      //     border-radius: 1em;
      //   }
      //   &::-webkit-scrollbar-thumb {
      //     background-color: #bfbfbf;
      //     -webkit-border-radius: 1em;
      //     -moz-border-radius: 1em;
      //     border-radius: 1em;
      //   }
      //   & > li {
      //     padding: 0px 10px 0px 5px;
      //     box-sizing: border-box;
      //     width: 75px;
      //     float: unset;
      //   }
      // }
    }
  }
}
.ant-form-item {
  display: flex;
}

.thematic-filter {
  display: flex;
  align-items: center;
  height: 0.6rem;
  padding: 0 0.1rem;
  background-color: #fff;
  color: #494949;
  font-size: 0.14rem;
  // box-shadow: 0px 2px 8px 0px rgb(0 0 0 / 12%);
  border-bottom: 1px solid #e0e0e0;

  /deep/.ant-select-dropdown-menu-item {
    font-size: 12px;
  }
  /deep/.ant-calendar-range-picker-input {
    width: 40%;
  }
}

.ant-calendar-picker {
  /deep/ input {
    padding-right: 0;
  }

  /deep/ .ant-calendar-range-picker-separator {
    margin: 0 0.05rem;
  }
}

.search-btn {
  width: 0.3rem;
  height: 0.3rem;
  background: #2fa8fd;
  border-radius: 0.04rem;
  margin-left: 0.05rem;
  display: flex;
  align-items: center;
  justify-content: center;

  /deep/ .anticon {
    font-size: 0.24rem;
  }
}

.add-btn {
  margin-left: 0.05rem;
  color: #fff;
  width: 0.3rem;
  height: 0.3rem;
  background: #4dc559;
  border: 0.02rem solid #4dc559;
  border-radius: 0.04rem;
  padding: 0;
}
</style>
