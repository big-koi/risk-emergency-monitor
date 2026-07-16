<template>
  <a-modal
    v-model="isOpen"
    class="add-modal"
    width="8rem"
    :footer="null"
    :maskClosable="false"
    :closable="false"
    @cancel="handlerClose"
  >
    <!-- title -->
    <div slot="title" class="modal-title">
      <div class="tab-btn"></div>
      <div>
        <!-- 关闭按钮 -->
        <a-icon class="close-btn" type="close-circle" @click="handlerClose" />
      </div>
    </div>
    <!-- 内容 -->
    <div class="content">
      <!-- 从列表创建 -->
      <div v-if="tabKey == 'list'" class="list-creat">
        <a-form-model
          ref="listCreated"
          :label-col="{ span: 7 }"
          :wrapperCol="{ span: 14 }"
          :model="listCreated"
          :rules="listCreatedRules"
        >
          <!-- 评估过程名称 -->
          <a-form-model-item label="任务名称" prop="name">
            <a-input
              v-model="listCreated.taskName"
              placeholder="请输入任务名称"
            />
          </a-form-model-item>
          <!-- 评估人 -->
          <a-form-model-item label="评估人" prop="person">
            <a-input v-model="createUser" disabled />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>
    <!-- 底部 -->
    <div class="btn-group">
      <a-button
        class="commit"
        :loading="commitBtnLoading"
        @click="handlerCommit"
      >
        <img src="../../assets/images/thematic/confirm.png" />
        提交
      </a-button>
      <a-button class="reset" @click="handlerCancel">
        <img src="../../assets/images/thematic/cancel.png" />
        取消
      </a-button>
    </div>
  </a-modal>
</template>

<script>
import moment from "moment";
import { mapState } from "vuex";
import { createTask } from "../../api/task";
import { queryXZQH } from "../../api/district";

export default {
  name: "addModal",
  props: {
    option: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      // 切换显示的选中的key
      tabKey: "list",
      // 评估时间 (列表创建的)
      pgTime: ["", ""],
      // 地震时间 (手动创建的)
      quakeTime1: "",
      // 地震名称
      quakeName: "",
      // 震级
      quakeLevel: {
        max: "",
        min: ""
      },
      // 地质灾害类型
      geoType: "",
      // 从列表创建的发震时间
      listQuakeTime: null,
      // 表格头部
      tableHeader: [],
      // 列表的数据
      listData: [],
      // 列表选中的
      listSelected: [],
      listCreated: {
        taskName: "洪涝灾害风险仿真评估任务",
        personName: '管理员'
      },
      // 行政区配置项
      regionOpt: [],
      // 列表创建 字段规则
      listCreatedRules: {
        inputName: [{ required: true, message: "必填项" }],
        selectTime: [{ required: true, message: "必填项" }]
      },
      // 提交按钮的 loading
      commitBtnLoading: false,
      // 分页
      paging: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      startValue: null,
      endValue: null,
      endOpen: false
    };
  },
  computed: {
    ...mapState({
      // 是否显示
      isOpen: state => state.thematicAnalysis.isShowAddModal
    }),
    // 表格选择
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.listSelected = selectedRows;
        }
      };
    },
    createUser() {
      return this.$store.getters.userName || '管理员'
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // TODO 获取用户信息

        this.getListData();
      }
    }
  },
  mounted() {
    (this.startValue = null),
      (this.endValue = null),
      (this.endOpen = false),
      // 初始化表格头部
      this.initTableHeader();
    // 获取 行政区划 数据
    // this.getRegionData();
  },
  methods: {
    moment,
    // 获取 行政区划 数据
    getRegionData() {
      queryXZQH().then(res => {
        let data = res.data;
        this.regionOpt = data;
      });
    },
    // 处理关闭
    handlerClose() {
      this.$store.commit("thematicAnalysis/SET_IS_SHOW_ADD_MODAL", false);
    },
    // 顶部切换事件
    tabBtnClick(key) {
      this.tabKey = key;
    },
    // 从列表创建的条件筛选查询
    filterCommit() {
      // 获取列表数据
      this.getListData();
    },
    // 初始化表格头部
    initTableHeader() {
      this.tableHeader = this.option.tableHeader;
    },
    // 获取列表数据
    getListData() {},
    // 分页改变事件
    pagingChange() {
      // 获取列表数据
      this.getListData();
    },
    // 分页每页条数改变事件
    pagingPageSizeChange(curr, size) {
      this.paging.pageNum = 1;
      this.paging.pageSize = size;
      // 获取列表数据
      this.getListData();
    },
    // 处理取消
    handlerCancel() {
      let resetObj = {
        quakeName: "",
        geoType: "",
        pgTime: ["", ""],
        quakeTime1: "",
        listQuakeTime: null,
        quakeLevel: {
          max: "",
          min: ""
        },
        listCreated: {
          taskName: "洪涝灾害风险仿真评估任务",
          personName: this.$store.getters.userName || '管理员'
        }
      };
      this.$store.commit("thematicAnalysis/SET_IS_SHOW_ADD_MODAL", false);
      Object.assign(this, resetObj);
      // 获取列表数据
      this.getListData();
    },
    // 处理提交
    handlerCommit() {
      debugger
      console.log(this.listCreated)
      if (!this.listCreated.taskName) {
        this.$message.warning("请输入任务名称");
        return false;
      }
      this.$store.commit("thematicAnalysis/SET_IS_SHOW_ADD_MODAL", false);
      debugger
      let parmas = {
        taskName: this.listCreated.taskName,
        createUser: this.createUser,
        district: window.sessionStorage.getItem("xzqdm"),
      };
      createTask(parmas).then(res => {
        if (res.code == 200) {
          this.$message.success(res.msg);
          this.$emit("freshList", true);
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.add-modal {
  color: #fff;
  /deep/.ant-modal-content {
    background: #fff !important;
  }
  /deep/ .ant-modal-header {
    height: 0.62rem;
    padding: 0;
    border-bottom: solid 0.01rem #d9dbdd;

    .ant-modal-title {
      height: 100%;
    }
  }
  .ant-input[disabled] {
    background-color: #f6f6f6;
    border: none;
    color: #333333;
  }
  /deep/.ant-form-item label {
    font-size: 0.14rem;
    font-weight: 600;
    text-align: right;
    color: #333333;
  }

  .ant-pagination {
    text-align: right !important;
  }
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-left: 0.2rem;
  padding-right: 0.1rem;

  .tab-btn {
    > span {
      position: relative;
      font-size: 0.17rem;
      font-weight: bold;
      cursor: pointer;
      padding: 0 0.3rem;

      &.act {
        color: #1270e9;
        border-bottom: 2px solid #1270e9;
        padding-bottom: 0.17rem;
      }

      .icon {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0, -50%);
        display: inline-block;
        width: 0.17rem;
        height: 0.21rem;
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }
    }
  }

  .close-btn {
    margin-right: 0.18rem;
    font-size: 0.2rem;
    color: #666666;
    cursor: pointer;
  }
}

.list-creat {
  .ant-form-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.2rem;
  }

  .filter-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ant-table-wrapper {
    margin-top: 0.3rem;
  }

  .ant-pagination {
    margin-top: 0.2rem;
    text-align: center;
  }
}

.point-creat {
  width: 100%;

  .ant-row {
    width: 100%;
    justify-content: center;
    margin-top: 0.1rem;
  }

  /deep/ label {
    color: #3c3c3c;
  }
}

.btn-group {
  display: flex;
  justify-content: center;
  margin-top: 0.3rem;

  .ant-btn {
    width: 1.24rem;
    height: 0.42rem;
    line-height: 0.44rem;
    border: 0.01rem solid #c7c7c7;
    color: #3c3c3c;
    border: 0.02rem solid #d9dbdd;
    border-radius: 0.08rem;
    background-color: #fff;
    line-height: 0.42rem;

    img {
      width: 0.18rem;
      margin-right: 0.1rem;
    }

    &.commit {
      width: 80px;
      height: 32px;
      line-height: 32px;
      background: #ffffff;
      border: 1px solid #1270e9;
      border-radius: 4px;
      box-shadow: 0px 2px 4px 0px rgba(20, 77, 154, 0.29);
      color: #1270e9;
      img {
        margin-top: -3px;
      }
    }
    &.reset {
      margin-left: 0.4rem;
      width: 80px;
      height: 32px;
      line-height: 32px;
      background: #fcfcfc;
      border: 1px solid #b2b2b2;
      border-radius: 4px;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.08);
      img {
        margin-top: -3px;
      }
    }
  }
}

// .ant-table-thead > tr > th, .ant-table-tbody > tr > td{
//   padding: 10px;
// }
</style>
