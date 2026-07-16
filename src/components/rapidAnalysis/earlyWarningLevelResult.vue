<template>
  <div class="assessResult">
    <a-spin class="spin" :spinning="spinshow" wrapperClassName="spinClass">
      <div class="loadingBg" v-if="isEnlarge"></div>
      <div :class="isEnlarge ? 'quotaResultBig' : 'quotaResult'">
        <div class="header">
          <div class="title">
            <img src="../../assets/images/thematic/pgfw.png" />
            <div>预警范围评估结果</div>
          </div>
          <div class="operationBTNS">
            <div class="operationBtn" @click="downloadExcel">Excel导出</div>
            <div class="expandBox" @click="enlargeHandle">
              <img src="../../assets/images/thematic/expand-icon.png" />
            </div>
          </div>
        </div>
        <div class="result">
          <a-table :loading="loading" :pagination="false" :columns="columns" :customRow="customRow" :data-source="tableData" :scroll="{ y: isEnlarge ? 'calc(100vh - 4rem)' : '3.5rem' }">
          </a-table>
          <a-pagination v-model="current" show-size-changer :page-size.sync="pageSize" :total="total" :pageSizeOptions="['5', '10', '20', '30', '40', '50']" @showSizeChange="changePageSize" @change="changePage" />
        </div>
      </div>
    </a-spin>
  </div>
</template>
<script>
import diitgis from "@/components/Layer/LayerManagerForDiitGIS.js";
export default {
  props: {
    pgLevel: {
      type: String,
      default: "",
    },
    isOperation: {
      type: Boolean,
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    legendShow: {
      type: Boolean,
      default: false,
    },
    legendBoxData: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  inject: ["eventBus"],
  data() {
    return {
      loading: false,
      columns: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 60,
          customRender: (item, record, index) => {
            return {
              children: `${(this.current - 1) * this.pageSize + index + 1}`,
              style: {
                textAlign: "center",
              },
            };
          },
        },
        {
          title: "省级",
          dataIndex: "province",
          key: "province",
          align: "center",
        },
        {
          title: "市级",
          dataIndex: "city",
          key: "city",
          align: "center",
        },
        {
          title: "县级",
          dataIndex: "county",
          key: "county",
          align: "center",
        },
        // {
        //   title: "最大积水时间",
        //   dataIndex: "date",
        //   key: "date",
        //   align: "center",
        //   width: '18%',
        // },
        {
          title: "最大积水深度(m)",
          dataIndex: "maxDepth",
          key: "maxDepth",
          align: "center",
          width: '23%',
          customRender: (item, record, index) => {
            return {
              children: item.toFixed(2),
            };
          },
        },
        {
          title: "预警等级",
          dataIndex: "level",
          key: "level",
          align: "center",
          width: '15%',
        },
        // {
        //   title: "操作",
        //   dataIndex: "operate",
        //   key: "operate",
        //   align: "center",
        //   scopedSlots: {
        //     customRender: "operate",
        //   },
        //   width: 60,
        // },
      ],
      isEnlarge: false,
      spinshow: false,
      current: 1,
      pageSize: 10,
      total: 0,
    };
  },
  mounted() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
  },
  methods: {
    downloadExcel() {
      this.$emit('exportExcel')
    },
    changePageSize(page, size) {
      this.pageSize = size;
      this.$emit('changePage', page, size);
    },
    changePage(page) {
      this.page = page;
      this.$emit('changePage', page, this.pageSize);
    },
    // 放大
    enlargeHandle() {
      this.isEnlarge = !this.isEnlarge;
    },
    // 地图显示
    _showzsmap() {
      getFjqz({ taskId: this.taskId }).then(res => {
        console.log("res=", res);
        if (res.code == 200 && res.data) {
          this.warningRanges = res.data
          // me.earth.removeAllLayer();
          this.$emit('removeAllAddedLayers')
          // 构建render
          let render = {
            id: "zs",
            name: "指数",
            relatedField: "zs",
            geotype: "Polygon",
            render: []
          };
          res.data.forEach((e, i) => {
            render.render.push({
              name: i + 1,
              color: e.color,
              alias: e.name,
              label: e.name
            });
          });
          this.$emit("update:legendShow", true);
          this.$emit("update:legendBoxData", render.render);
          diitgis.addVFD({
            layerName: "指数图层",
            tableName: "zs_result_t2",
            renderField: "gradlecode",
            renderId: null,
            render: render,
            filterCondition: `taskid = '${this.taskId}' and datetime='${this.checkDate}'`,
            attributeFields: "gradlecode"
          });
        }
      });
    },
    customRow(record, index) {
      return {
        on: {
          click: () => {
            // console.log(record.code)
            // debugger
          },
        },
      };
    },
  },
};
</script>
<style lang="less" scoped>
.assessResult {
  width: 100%;
  background: #fff;
  border-top: 3px solid #1963e1;
  max-height: 5.5rem;

  .operationBtnGray {
    width: 0.8rem;
    height: 0.32rem;
    border: 0.01rem solid #d9d9d9;
    background-color: #f5f5f5;
    border-radius: 0.04rem;
    margin-right: 0.16rem;
    font-size: 0.14rem;
    font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
    text-align: center;
    color: #b8b8b8;
    line-height: 0.32rem;
    cursor: not-allowed;
  }

  .quotaResultBig {
    position: fixed !important;
    top: 0.7rem !important;
    left: 0.7rem !important;
    width: 92%;
    height: 85vh;
    background: #fafafa;
    box-shadow: 0rem 0.02rem 0.05rem 0rem rgba(185, 185, 185, 0.88);
    box-sizing: border-box;
    z-index: 9999;
  }

  .loadingBg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.22rem;
    padding-bottom: 14px;
    border-bottom: 1px solid #eaeaea;
    font-size: 0.16rem;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #333333;

    .title {
      display: flex;
      align-items: center;

      img {
        margin-right: 0.1rem;
      }
    }

    .expandBox {
      cursor: pointer;
    }
  }

  .result {
    padding: 0.14rem 0.22rem;

    .filter {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.15rem;

      .operationItem {
        display: flex;
        align-items: center;

        .label {
          font-size: 0.14rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
          font-weight: 700;
          color: #333333;
        }

        .operationBtn {
          width: 0.8rem;
          height: 0.32rem;
          border: 0.01rem solid #1270e9;
          border-radius: 0.04rem;
          box-shadow: 0rem 0.02rem 0.04rem 0rem rgba(19, 73, 141, 0.24);
          margin-right: 0.16rem;
          font-size: 0.14rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
          text-align: center;
          color: #1270e9;
          line-height: 0.32rem;
          cursor: pointer;
        }
      }

      .ant-btn-primary {
        background: #1270e9;
      }
    }

    /deep/.ant-table-thead {
      background: #f2f3f5;
    }

    /deep/.ant-table-thead > tr > th {
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Semibold;
      font-weight: 600;
      color: #494949;
    }

    /deep/ .ant-table-tbody > tr > td {
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Regular;
      color: #494949;
    }

    .ant-pagination {
      margin-top: 0.1rem;
      text-align: right;
    }
  }
}
.operationBTNS {
  display: flex;
  .operationBtn {
    width: 1rem;
    height: 0.32rem;
    margin-right: 0.16rem;
    background: #ffffff;
    border: 0.01rem solid #1270e9;
    border-radius: 0.04rem;
    box-shadow: 0rem 0.02rem 0.04rem 0rem rgba(19, 73, 141, 0.24);
    text-align: center;
    line-height: 0.32rem;
    color: #1270e9;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.ant-modal-content {
  background: #fff !important;
}

.ant-select-tree-dropdown {
  height: 200px;
}

.createModal {
  .ant-modal-title {
    color: #fff;
  }

  .ant-modal-header {
    background: #1963e1;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #ffffff;
  }

  .operationItem {
    display: flex;
    align-items: center;

    .label {
      font-size: 0.14rem;
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
      font-weight: 700;
      color: #333333;
    }
  }

  .ant-modal-footer {
    display: flex;
    justify-content: end;
    border: none;
  }

  .ant-btn {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 0.01rem solid #1270e9;
    border-radius: 0.04rem;
    box-shadow: 0rem 0.02rem 0.04rem 0rem rgba(19, 73, 141, 0.24);
    color: #1270e9;

    img {
      margin-right: 0.1rem;
    }
  }

  .ant-btn-primary {
    background: #1270e9;
    color: #fff;
  }
}
</style>
