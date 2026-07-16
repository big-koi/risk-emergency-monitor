<template>
  <div class="assessResult">
    <a-spin class="spin" :spinning="spinshow" wrapperClassName="spinClass">
      <div class="loadingBg" v-if="isEnlarge"></div>
      <div :class="isEnlarge ? 'quotaResultBig' : 'quotaResult'">
        <div class="header">
          <div class="title">
            <img src="../../assets/images/thematic/pgfw.png" />
            <div>评估范围提取</div>
          </div>
          <div class="expandBox" @click="enlargeHandle">
            <img src="../../assets/images/thematic/expand-icon.png" />
          </div>
        </div>
        <div class="result">
          <div class="filter">
            <div class="operationItem" v-if="xzqdm == '000000'">
              <div class="label">评估区域选择：</div>
              <a-tree-select v-model="regionValue" style="width: 200px;margin-right: 0.1rem;" :allowClear="true" :maxTagCount="3" :replaceFields="{ title: 'name', key: 'code', value: 'code', children: 'children' }" :tree-data="regionOptions" :showCheckedStrategy="SHOW_PARENT" :treeCheckStrictly="true" :filterTreeNode="filterTreeNode" tree-checkable search-placeholder="请选择评估区域" />
              <a-button type="primary" @click="confirmPgRegion" v-if="stepFinish!=4&&!isOperation">
                确定
              </a-button>
              <a-button :disabled="true" v-if="stepFinish!=4&&isOperation">
                确定
              </a-button>
            </div>
            <div class="operationItem">
              <div class="operationBtn" v-if="stepFinish!=4&&!isOperation&&xzqdm=='000000'" @click="createModal = true">
                <img src="../../assets/images/thematic/create.png" />
                新增
              </div>
              <div class="operationBtnGray" v-if="stepFinish!=4&&isOperation&&xzqdm=='000000'">
                新增
              </div>
              <div class="operationBtn" @click="exportEvaluateExcel">
                <img src="../../assets/images/thematic/export.png" />
                导出
              </div>
            </div>
          </div>
          <a-table :loading="loading" :pagination="false" :columns="pgLevelTemp.includes('流域') ? columnsLy : columns" :customRow="customRow" :data-source="tableData" :scroll="{ y: isEnlarge ? 'calc(100vh - 4rem)' : '1.5rem' }">
            <div slot="operate" slot-scope="text, record" v-if="stepFinish!=4&&!isOperation&&xzqdm=='000000'">
            <!-- <div slot="operate" slot-scope="text, record"> -->
              <!-- <a-popconfirm title="确认删除?" @confirm="() => deleleTableDataById(record.id)"> -->
              <a-popconfirm title="确认删除?" @confirm="() => deleleTableDataByCodes(record)">
                <span style="color:red;cursor: pointer;" @click.stop="">删除</span>
              </a-popconfirm>
            </div>
          </a-table>
          <a-pagination v-model="current" show-size-changer :page-size.sync="pageSize" :total="total" :pageSizeOptions="['5', '10', '20', '30', '40', '50']" @showSizeChange="changePageSize" @change="changePage" />
        </div>
      </div>
    </a-spin>
    <!-- 新增弹窗 -->
    <a-modal centered title="新增" :visible="createModal" :confirm-loading="confirmLoading" :closeIcon="h =>
      h('a-icon', {
        props: {
          type: 'close-circle' // 样式
        },
        style: {
          color: '#ffffff' // 背景色
        }
      })
      " wrapClassName="createModal" @cancel="handleCancel">
      <div class="operationItem">
        <div class="label">地区选择：</div>
        <a-tree-select v-model="regionValueAdd" style="width: 320px" :allowClear="true" :maxTagCount="3" :replaceFields="{ title: 'name', key: 'code', value: 'code', children: 'children' }" :tree-data="regionOptionsAll" :showCheckedStrategy="SHOW_PARENT" :treeCheckStrictly="true" :filterTreeNode="filterTreeNode" tree-checkable search-placeholder="请选择评估区域" />
      </div>
      <template slot="footer">
        <a-button type="primary" key="back" @click="confirmAddData">
          <img src="../../assets/images/thematic/confirm-icon.png" />
          <div>数据添加</div>
        </a-button>
        <a-button key="submit" :loading="loading" @click="handleCancel">
          <img src="../../assets/images/thematic/cancel-icon.png" />
          <div>取消</div>
        </a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import { TreeSelect } from "ant-design-vue";
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
import {
  getEvaluateScopeResult,
  deleleTableDataById,
  deleleTableDataByCodes,
  exportEvaluateExcel,
  getRegionTreeData,
  editPgRegion,
  addPgRegion,
  getHourlyMaxPrcp,
} from "@/api/rapidAnalysis/index.js";
export default {
  props: {
    pgLevel: {
      type: String,
      default: "",
    },
    isOperation: {
      type: Boolean,
    },
  },
  inject: ["eventBus"],
  data() {
    return {
      regionOptionsAll: [],
      regionName: "",
      SHOW_PARENT,
      regionValue: [],
      regionValueAdd: [],
      pgLevelTemp: "",
      regionOptions: [],
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
          title: "省级行政区划",
          dataIndex: "province",
          key: "province",
          align: "center",
        },
        {
          title: "市级行政区划",
          dataIndex: "city",
          key: "city",
          align: "center",
        },
        {
          title: "县级行政区划",
          dataIndex: "county",
          key: "county",
          align: "center",
        },
        {
          title: "累计降雨值(mm)",
          dataIndex: "prcp",
          key: "prcp",
          align: "center",
        }
      ],
      columnsLy: [
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
          title: "一级流域",
          dataIndex: "province",
          key: "province",
          align: "center",
        },
        {
          title: "二级流域",
          dataIndex: "city",
          key: "city",
          align: "center",
        },
        {
          title: "三级流域",
          dataIndex: "county",
          key: "county",
          align: "center",
        },
        {
          title: "累计最大降雨值(mm)",
          dataIndex: "prcp",
          key: "prcp",
          align: "center",
        }
      ],
      tableData: [],
      tableDataAll: [],
      barXdata: [],
      barSerisedata: [],
      isEnlarge: false,
      spinshow: false,
      current: 1,
      pageSize: 10,
      total: 0,
      createModal: false,
      stepFinish: 0,
      confirmLoading: false,
      xzqdm: sessionStorage.getItem("xzqdm")
    };
  },
  mounted() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    this.getRegionTreeData();
    this.getRegionTreeDataAll();
    this.xzqdm = sessionStorage.getItem("xzqdm")
    if (this.xzqdm == '000000') {
      this.columns.push({
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        scopedSlots: {
          customRender: "operate",
        },
        width: 60,
      })
      this.columnsLy.push({
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        scopedSlots: {
          customRender: "operate",
        },
        width: 60,
      })
    }
  },

  methods: {
    // 点击行显示统计图
    customRow(record, index) {
      return {
        on: {
          click: () => {
            if (this.pgLevel == "一级流域" || this.pgLevel == "省") {
              this.regionName = record.province;
            }
            if (this.pgLevel == "二级流域" || this.pgLevel == "市") {
              this.regionName = record.province + record.city;
            }
            if (this.pgLevel == "三级流域" || this.pgLevel == "县") {
              this.regionName = record.province + record.city + record.county;
            }
            this.getMaxPrcp(record.code);
          },
        },
      };
    },
    changePageSize(page, size) {
      this.pageSize = size;
      this.getEvaluateScopeResult();
    },
    changePage(page) {
      this.page = page;
      this.getEvaluateScopeResult();
    },
    // 放大
    enlargeHandle() {
      this.isEnlarge = !this.isEnlarge;
    },
    //新增数据
    addRegion() {},
    // 确认新增
    confirmAddData() {
      if (this.regionValueAdd.length == 0) {
        this.$message.warning("请选择地区");
      }
      let jbName = ''
      if (this.xzqdm != '000000') {
        jbName = sessionStorage.getItem('xzqType')
      } else {
        jbName = this.pgLevel
      }
      const param = {
        taskId: this.$route.query.taskId,
        codes: this.regionValueAdd.map((item) => {
          return item.value;
        }),
        jb: jbName,
      };
      addPgRegion(param).then((res) => {
        if (res.code == 200) {
          this.regionValueAdd = [];
          this.createModal = false;
          this.$message.success("新增成功");
          this.getRegionTreeData();
          this.getEvaluateScopeResult();
        } else {
          this.$message.error("新增失败");
        }
      });
    },
    // 取消新增
    handleCancel() {
      this.createModal = false;
      this.regionValueAdd = [];
    },
    filterTableByRegion(table, region) {
      if(!region.length) {
        return table
      }
      // 提取 region 数组中所有 label 的集合
      const regionLabels = new Set(region.map(item => item.label));

      // 使用 filter 方法筛选满足条件的 table 数据
      const filteredTable = table.filter(item => {
        if(this.pgLevel == "一级流域" || this.pgLevel == "省"){
          return (
            regionLabels.has(item.province)
          );
        } else if (this.pgLevel == "二级流域" || this.pgLevel == "市") {
          return (
            regionLabels.has(item.city) ||
            regionLabels.has(item.province)
          );
        } else if (this.pgLevel == "三级流域" || this.pgLevel == "县") {
          return (
            regionLabels.has(item.city) ||
            regionLabels.has(item.county) ||
            regionLabels.has(item.province)
          );
        }
      });

      return filteredTable;
    },
    // 评估区域选择确认
    confirmPgRegion() {
      this.tableData = this.filterTableByRegion(this.tableDataAll,this.regionValue)
      // let jbName = ''
      // if (this.xzqdm != '000000') {
      //   jbName = sessionStorage.getItem('xzqType')
      // } else {
      //   jbName = this.pgLevel
      // }
      // const param = {
      //   taskId: this.$route.query.taskId,
      //   codes: this.regionValue.map((item) => {
      //     return item.value;
      //   }),
      //   jb: jbName,
      // };
      // if(this.pgLevel){
        // 河南郑州选择
      // }
      // editPgRegion(param).then((res) => {
      //   if (res.code == 200) {
      //     this.getRegionTreeData();
      //     this.getEvaluateScopeResult();
      //   }
      // //   else {
      // //     this.tableData = []
      // //   }
      // // }).catch(rej => {
      // //   this.tableData = []
      // });
      // this.getEvaluateScopeResult();
    },
    // 树形搜索
    filterTreeNode(value, node) {
      return node.data.props.name && node.data.props.name.includes(value);
    },
    // 获取评估区域树形结构
    getRegionTreeData() {
      let param = {
        code: window.sessionStorage.getItem("xzqdm"),
        taskId: this.$route.query.taskId,
        step: 1,
      };
      if (this.pgLevel.includes("流域")) {
        param.code = "--";
      }
      getRegionTreeData(param).then((res) => {
        if (res.code == 200) {
          this.regionOptions = JSON.parse(JSON.stringify(res.data.children));
          if (this.pgLevel == "一级流域" || this.pgLevel == "省") {
            this.regionOptions.map((item) => {
              item.children = null;
            });
          }
          if (this.pgLevel == "二级流域" || this.pgLevel == "市") {
            this.regionOptions.map((item) => {
              item.children.map((jtem) => {
                jtem.children = null;
              });
              // item['disabled'] = true
            });
          }
          if (this.pgLevel == "三级流域" || this.pgLevel == "县") {
            this.regionOptions.map((item) => {
              // item['disabled'] = true
              item.children.map((jtem) => {
                // jtem['disabled'] = true
              });
            });
          }
          // if (init) {
          //   this.regionValue = this.regionOptions.map(item => ({
          //     label: item.province,
          //     value: item.code
          //   }));
          //   this.confirmPgRegion()
          // }
        }
      });
    },
    // 获取评估区域树形结构
    getRegionTreeDataAll() {
      let param = {
        code: window.sessionStorage.getItem("xzqdm"),
      };
      if (this.pgLevel.includes("流域")) {
        param.code = "--";
      }
      getRegionTreeData(param).then((res) => {
        if (res.code == 200) {
          this.regionOptionsAll = JSON.parse(JSON.stringify(res.data.children));
          if (this.pgLevel == "一级流域" || this.pgLevel == "省") {
            this.regionOptionsAll.map((item) => {
              item.children = null;
            });
          }
          if (this.pgLevel == "二级流域" || this.pgLevel == "市") {
            this.regionOptionsAll.map((item) => {
              item.children.map((jtem) => {
                jtem.children = null;
              });
              item["disabled"] = true;
            });
          }
          if (this.pgLevel == "三级流域" || this.pgLevel == "县") {
            this.regionOptionsAll.map((item) => {
              item["disabled"] = true;
              item.children.map((jtem) => {
                jtem["disabled"] = true;
              });
            });
          }
        }
      });
    },
    // 获取评估范围提取结果
    getEvaluateScopeResult(flag) {
      this.spinshow = true;
      let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
      const param = {
        pageNum: this.current,
        pageSize: this.pageSize,
        taskId: this.$route.query.taskId,
        type: flag == "init" ? taskInfo.jb : this.pgLevel,
      };
      if (this.xzqdm != '000000') {
        param.type = sessionStorage.getItem('xzqType')
      }
      this.$parent.$parent.$refs.geoLocation._removeGeoJsonBorderLayersOutside()
      getEvaluateScopeResult(param)
        .then((res) => {
          if (res.code == 200) {
            this.pgLevelTemp = this.pgLevel;
            this.spinshow = false;
            this.tableData = res.data.records;
            this.tableDataAll = res.data.records;
            this.$parent.$parent.$refs.geoLocation.addGeoJsonBorderLayersOutside(res.data.records)
            this.total = res.data.total;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 删除某条表格数据by codes 支持多项删除, 多项之间code用','隔开
    deleleTableDataByCodes (row) {
      const params = new URLSearchParams({
        taskId: this.$route.query.taskId,
        code: row.code
      })
      deleleTableDataByCodes(params).then((res) => {
        if (res.code == 200) {
          this.$message.success("删除成功");
          this.getEvaluateScopeResult();
        } else {
          this.$message.error("删除失败");
        }
      }).catch(err => {
        console.error(err);
        this.$message.error("删除失败");
      })
    },
    // 删除某条表格数据
    deleleTableDataById(id) {
      deleleTableDataById({ id: id }).then((res) => {
        if (res.code == 200) {
          this.$message.success("删除成功");
          this.getEvaluateScopeResult();
        } else {
          this.$message.error("删除失败");
        }
      });
    },
    // 导出excel
    exportEvaluateExcel() {
      this.spinshow = true;
      exportEvaluateExcel({ taskId: this.$route.query.taskId }).then((res) => {
        this.spinshow = false;
        const blob = new Blob([res]);
        // 下载下来的文件名称
        const fileName = "评估范围提取" + ".xlsx";
        if ("download" in document.createElement("a")) {
          // 非IE下载
          // 获取heads中的filename文件名
          const elink = document.createElement("a");
          // 下载后文件名
          elink.download = fileName;
          elink.style.display = "none";
          // 创建下载的链接
          elink.href = URL.createObjectURL(blob);
          document.body.appendChild(elink);
          // 点击下载
          elink.click();
          URL.revokeObjectURL(elink.href); // 释放URL 对象
          // 下载完成移除元素
          document.body.removeChild(elink);
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName);
        }
      });
    },
    // 根据日期排序
    sortDate(dataList) {
      // 处理'MM/DD/HH'格式日期
      function parseDate(dateStr) {
        return dateStr.split("/").map(num => parseInt(num, 10));
      }

      dataList.sort((a, b) => {
        let dateA = parseDate(a.date);
        let dateB = parseDate(b.date);

        // 比较月份、日、小时
        if (dateA[0] !== dateB[0]) {
          return dateB[0] - dateA[0];
        } else if (dateA[1] !== dateB[1]) {
          return dateB[1] - dateA[1];
        } else {
          return dateB[2] - dateA[2];
        }
      });

      return dataList; // 返回排序后的数组
    },
    // 获取最大降雨量统计图
    getMaxPrcp(tableCode) {
      this.$parent.showBarStastic(false, tableCode);
      const param = {
        taskId: this.$route.query.taskId,
        code: tableCode,
        type: sessionStorage.getItem("xzqdm") == '000000' ? this.pgLevel : sessionStorage.getItem("xzqType")
      };
      getHourlyMaxPrcp(param)
        .then((res) => {
          if (res.code == 200) {
            const dataList = this.sortDate(res.data)
            this.barXdata = dataList.map((item) => {
              return item.date;
            });
            this.barSerisedata = dataList.map((item) => {
              return item.prcp;
            });
            this.$parent.showBarStastic();
            this.eventBus.$emit("update:barXdata", this.barXdata);
            this.eventBus.$emit("update:barSerisedata", this.barSerisedata);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>
<style lang="less" scoped>
.assessResult {
  width: 100%;
  background: #fff;
  border-top: 3px solid #1963e1;

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
