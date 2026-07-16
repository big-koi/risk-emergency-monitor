<template>
  <a-spin :spinning="spinshow">
    <div class="modeling">
      <!-- 操作行 -->
      <div :class="stepOperation ? 'operationBox' : 'operationBox prohibit'">
        <div class="operationItem">
          <div class="label">淹没阈值：</div>
          <a-input placeholder="淹没阈值" v-model="floodThreshold" /> cm
        </div>
        <div class="operationItem">
          <div class="label">使用下渗模型：</div>
          <a-switch
            v-model="infil"
            checked-children="是"
            un-checked-children="否"
          />
        </div>
        <div
          class="operationBtn"
          @click="downloadRegion"
          v-if="stepFinish >= 2"
        >
          淹没范围下载
        </div>
        <div class="operationBtn" @click="startModeling" v-if="stepFinish != 4">
          <img src="../../assets/images/thematic/model-icon.png" />
          模型计算
        </div>
      </div>
      <a-tabs default-active-key="1" v-model="currentTab" @change="tabChange">
        <a-tab-pane
          key="1"
          tab="下渗模型参数调"
          :class="stepOperation ? '' : 'prohibit'"
        >
          <div class="argumentsBox">
            <div class="argumentItem">
              <div class="label">蒸发系数rF：</div>
              <a-input v-model="vapor" :disabled="!isEdit" />
            </div>
            <div class="argumentItem">
              <div class="label labelLarge">饱和导水率Ks倍数：</div>
              <a-input v-model="saturate" :disabled="!isEdit" />
            </div>
            <div class="argumentItem">
              <div class="label">毛管吸力ψs倍数：</div>
              <a-input v-model="attach" :disabled="!isEdit" />
            </div>
            <div class="argumentItem">
              <div class="label labelLarge">最大含水量亏损θmax倍数：</div>
              <a-input v-model="loss" :disabled="!isEdit" />
            </div>
            <div class="editSave" @click="editChange" v-if="stepFinish != 4">
              <img
                v-show="isEdit"
                src="../../assets/images/rapidAnalysis/save.png"
              />
              <img
                v-show="!isEdit"
                src="../../assets/images/thematic/edit-icon.png"
              />
              <div v-show="isEdit">保存</div>
              <div v-show="!isEdit">编辑</div>
            </div>
          </div>
          <a-table
            :loading="loading"
            :pagination="false"
            :columns="columns"
            :data-source="tableData"
          ></a-table>
        </a-tab-pane>
        <a-tab-pane
          key="2"
          tab="主模型参数调整"
          force-render
          :class="stepOperation ? '' : 'prohibit'"
        >
          <div class="argumentsBox">
            <div class="argumentItem">
              <div class="label">干湿边界：</div>
              <a-input v-model="dryAndWet" :disabled="!isEdit" />
            </div>
            <div class="argumentItem">
              <div class="label labelLarge">库伦数：</div>
              <a-input v-model="cfl" :disabled="!isEdit" />
            </div>
            <div class="argumentItem">
              <div class="label">排水能力倍数：</div>
              <a-input v-model="drain_scalar" :disabled="!isEdit" />
              <img
                @click="showPopup(1)"
                src="../../assets/images/thematic/eye.png"
              />
              <!-- <img v-else src="../../assets/images/thematic/eye-gray.png" /> -->
            </div>
            <div class="argumentItem">
              <div class="label labelLarge">曼宁系数倍数：</div>
              <a-input v-model="mann_scalar" :disabled="!isEdit" />
              <img
                @click="showPopup(2)"
                src="../../assets/images/thematic/eye.png"
              />
              <!-- <img v-else src="../../assets/images/thematic/eye-gray.png" /> -->
            </div>
            <div class="editSave" @click="editChange" v-if="stepFinish != 4">
              <img
                v-if="isEdit"
                src="../../assets/images/rapidAnalysis/save.png"
              />
              <img v-else src="../../assets/images/thematic/edit-icon.png" />
              <div v-if="isEdit">保存</div>
              <div v-else>编辑</div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
      <!-- 查看弹窗 -->
      <a-modal
        centered
        title=" kkk "
        :visible="checkModal"
        :footer="null"
        @cancel="handleCancel"
        :closeIcon="
          h =>
            h('a-icon', {
              props: {
                type: 'close-circle' // 样式
              },
              style: {
                color: '#fff' // 背景色
              }
            })
        "
        wrapClassName="tableModal"
      >
        <div class="operationBox">
          <!-- <div class="operationItem">
          <div class="label">省份选择：</div>
          <a-select style="width: 200px" v-model="province">
            <a-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
              {{ (i + 9).toString(36) + i }}
            </a-select-option>
          </a-select>
        </div> -->
          <div
            class="operationBtn"
            @click="
              eyeType == 1
                ? exportSysDrainExcel()
                : exportSysManniScalareExcel()
            "
          >
            <img src="../../assets/images/thematic/export.png" />
            导出
          </div>
        </div>
        <a-table
          :loading="loading"
          :pagination="false"
          :columns="eyeType == 1 ? columnsEyePs : columnsEyeMn"
          :data-source="tableDataEye"
        ></a-table>
        <a-pagination
          v-model="current"
          show-size-changer
          :page-size.sync="pageSize"
          :total="total"
          :pageSizeOptions="['5', '10', '20', '30', '40', '50']"
          @showSizeChange="changePageSize"
          @change="changePage"
        />
      </a-modal>
    </div>
  </a-spin>
</template>
<script>
import {
  modeling,
  getInfiltrationData,
  getSysDrainData,
  exportSysDrainExcel,
  getSysManniScalarData,
  exportSysManniScalareExcel,
  getComputeStatus,
  getSecondStepImage,
  getRegionTif
} from "@/api/rapidAnalysis/index.js";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS.js";
const regionsJson = require("@/../static/config/json/regionsList.json");
export default {
  props: {
    stepData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      infil: false,
      spinshow: false,
      stepOperation: true,
      currentTab: "1",
      cfl: 0.7, //库伦数
      dryAndWet: 0.01, //干湿边界
      mann_scalar: 1, //曼宁系数倍数
      floodThreshold: 10, //淹没阈值
      drain_scalar: 1, // 排水能力倍数
      vapor: 0.3, //蒸发系数rF
      saturate: 1, //饱和导水率Ks倍数
      attach: 1, //毛管吸力ψs倍数
      loss: 1, //最大含水量亏损θmax倍数
      isEdit: false,
      loading: false,
      columns: [
        {
          title: "土地利用类型",
          dataIndex: "landUseType",
          key: "landUseType",
          align: "center"
        },
        {
          title: "蒸发系数rF",
          dataIndex: "rf",
          key: "rf",
          align: "center"
        },
        {
          title: "饱和导水率Ks",
          dataIndex: "ksscalar",
          key: "ksscalar",
          align: "center"
        },
        {
          title: "毛管吸力ψs",
          dataIndex: "phiSScalar",
          key: "phiSScalar",
          align: "center"
        },
        {
          title: "最大含水量亏损θmax",
          dataIndex: "thetaMaxScalar",
          key: "thetaMaxScalar",
          align: "center"
        }
      ],
      tableData: [],
      columnsEyePs: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 60,
          customRender: (item, record, index) => {
            return {
              children: `${(this.current - 1) * this.pageSize + index + 1}`,
              style: {
                textAlign: "center"
              }
            };
          }
        },
        {
          title: "省份",
          dataIndex: "province",
          key: "province",
          align: "center"
        },
        {
          title: "排水设计能力(m/s)",
          dataIndex: "drainScalar",
          key: "drainScalar",
          align: "center"
        }
      ],
      columnsEyeMn: [
        {
          title: "序号",
          dataIndex: "index",
          key: "index",
          width: 60,
          customRender: (item, record, index) => {
            return {
              children: `${(this.current - 1) * this.pageSize + index + 1}`,
              style: {
                textAlign: "center"
              }
            };
          }
        },
        {
          title: "土地利用类型",
          dataIndex: "secondName",
          key: "secondName",
          align: "center"
        },
        {
          title: "曼宁系数(m/s)",
          dataIndex: "manniScalar",
          key: "manniScalar",
          align: "center"
        }
      ],
      tableDataEye: [],
      checkModal: false,
      province: "",
      current: 1,
      pageSize: 10,
      stepFinish: "",
      total: 0,
      eyeType: 1,
      timer: null,
      AddImgLayerInterval: null,
      layerIndex: 0,
      regions: []
    };
  },
  mounted() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    this.regions = regionsJson;
    if (taskInfo.step == 0) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      // let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
      this.floodThreshold = taskInfo.submerge_val;
      this.vapor = taskInfo.r_F;
      this.saturate = taskInfo.K_s_scalar;
      this.attach = taskInfo.phi_s_scalar;
      this.loss = taskInfo.theta_max_scalar;
      this.dryAndWet = taskInfo.bound;
      this.cfl = taskInfo.cfl;
      this.drain_scalar = taskInfo.drain_scalar;
      this.mann_scalar = taskInfo.mann_scalar;
      this.infil = taskInfo.infil;
      // this.getInfiltrationData();
      // this.loadingModelLayer();
    }
  },
  activated() {
    this.getInfiltrationData();
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (taskInfo.step == 0) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      this.loadingModelLayer();
    }
  },
  methods: {
    // 下载tif
    downloadRegion() {
      const param = {
        taskId: this.$route.query.taskId
      };
      getRegionTif(param).then(res => {
        const blob = new Blob([res]);
        // 下载下来的文件名称
        const fileName = "淹没范围" + ".zip";
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

    // 获取每个算子计算的状态
    getComputeStatus(flag) {
      const param = {
        taskId: this.$route.query.taskId
      };
      getComputeStatus(param).then(res => {
        if (res.code == 200) {
          if (res.data.status.running) {
            this.spinshow = true;
          } else {
            clearInterval(this.timer);
            this.spinshow = false;
            this.$message.success("模型计算成功");
            this.$parent.getCurrentStepMessage();
            this.stepFinish = 2;
            this.loadingModelLayer();
          }
        }
      });
    },
    tabChange() {},
    // 编辑保存
    editChange() {
      this.isEdit = !this.isEdit;
      if (this.currentTab == 1) {
        this.getInfiltrationData();
      }
    },
    // 显示弹窗
    showPopup(flag) {
      this.eyeType = flag;
      this.checkModal = true;
      if (this.eyeType == 1) {
        this.getSysDrainData();
      } else {
        this.getSysManniScalarData();
      }
    },
    handleCancel() {
      this.checkModal = false;
    },
    changePageSize(page, size) {
      this.pageSize = size;
      if (this.eyeType == 1) {
        this.getSysDrainData();
      } else {
        this.getSysManniScalarData();
      }
    },
    changePage(page) {
      this.current = page;
      if (this.eyeType == 1) {
        this.getSysDrainData();
      } else {
        this.getSysManniScalarData();
      }
    },
    // 点击模型计算
    startModeling() {
      this.spinshow = true;
      const param = {
        taskId: this.$route.query.taskId,
        CFL: this.cfl,
        drain_scalar: this.drain_scalar,
        phi_s_scalar: this.attach,
        theta_max_scalar: this.loss,
        K_s_scalar: this.saturate,
        r_F: this.vapor,
        bound: this.dryAndWet,
        mann_scalar: this.mann_scalar,
        submerge_val: this.floodThreshold,
        infil: this.infil
      };
      modeling(param)
        .then(res => {
          if (res.code == 200) {
            this.timer = setInterval(() => {
              this.getComputeStatus(0);
            }, 10000);
          } else {
            this.$message.error("模型计算失败");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 获取下渗模型数据
    getInfiltrationData() {
      this.loading = true;
      const param = {
        pageNum: 1,
        pageSize: 100,
        kSScalarMultiply: this.saturate,
        phiSScalarMultiply: this.attach,
        thetaMaxScalarMultiply: this.loss,
        rF: this.vapor
      };
      getInfiltrationData(param)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.tableData = res.data.records;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 排水设计能力查询
    getSysDrainData() {
      this.loading = true;
      const param = {
        pageNum: this.current,
        pageSize: this.pageSize,
        multiply: this.drain_scalar
      };
      getSysDrainData(param)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.tableDataEye = res.data.records;
            this.total = res.data.total;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 排水能力导出
    exportSysDrainExcel() {
      const param = {
        multiply: this.drain_scalar
      };
      exportSysDrainExcel(param)
        .then(res => {
          const blob = new Blob([res]);
          // 下载下来的文件名称
          const fileName = "排水能力" + ".xlsx";
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
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 曼宁系数查询
    getSysManniScalarData() {
      this.loading = true;
      const param = {
        pageNum: this.current,
        pageSize: this.pageSize,
        multiply: this.mann_scalar
      };
      getSysManniScalarData(param)
        .then(res => {
          this.loading = false;
          if (res.code == 200) {
            this.tableDataEye = res.data.records;
            this.total = res.data.total;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 曼宁系数导出
    exportSysManniScalareExcel() {
      const param = {
        multiply: this.mann_scalar
      };
      exportSysManniScalareExcel(param)
        .then(res => {
          const blob = new Blob([res]);
          // 下载下来的文件名称
          const fileName = "曼宁系数" + ".xlsx";
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
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 加载图片图层
    AddImgLayer(item) {
      const boxArr = item.box.split(",");
      const layerName = "淹没范围" + item.id;
      const xzq = this.regions[item.name.substr(0,6)]
      let xzqmc = ''
      if (xzq) {
        xzqmc = xzq['name-short']
      }
      const url =
        window.servicesConfig.servicesUrl +
        "/v1/resultSource/assets?id=" +
        item.id;

      let layer = me.earth.layerManager.createLayer(layerName, 8, url, {
        // name: "淹没范围" + item.id,
        name: xzqmc + "淹没范围",
        id: "淹没范围" + item.id,
        visible: true,
        // projection: 'EPSG:4326',
        imageExtent: [boxArr[0], boxArr[1], boxArr[2], boxArr[3]]
      });
      me.earth.addLayer(layer);
    },
    // 加载模型计算图片
    loadingModelLayer() {
      getSecondStepImage({ taskId: this.$route.query.taskId }).then(res => {
        if (res.code == 200) {
          // console.log("111111", me.earth.layerManager.getLayers());
          if (res.data.length > 0) {
            this.AddImgLayer(res.data[0]);
            this.AddImgLayerInterval = setInterval(() => {
              this.layerIndex++;
              if (this.layerIndex < res.data.length) {
                this.AddImgLayer(res.data[this.layerIndex]);
              } else {
                clearInterval(this.AddImgLayerInterval);
                this.AddImgLayerInterval = null;
                this.layerIndex = 0;
              }
            }, 400);
          }
        }
      });
    }
    // 加载模型计算图片
    // loadingModelLayer() {
    //   getSecondStepImage({ taskId: this.$route.query.taskId }).then(res => {
    //     if (res.code == 200) {
    //       me.earth.layerManager.removeAllLayer();
    //       res.data.map((item, index) => {
    //         const boxArr = item.box.split(",");
    //         const layerName = "淹没范围" + item.id;
    //         const url =
    //           window.servicesConfig.servicesUrl +
    //           "/v1/resultSource/assets?id=" +
    //           item.id;
    //         let layer = me.earth.layerManager.createLayer(layerName, 8, url, {
    //           visible: true,
    //           id: layerName,
    //           name: layerName,
    //           // projection: 4326,
    //           imageExtent: [
    //             Number(boxArr[0]),
    //             Number(boxArr[1]),
    //             Number(boxArr[2]),
    //             Number(boxArr[3])
    //           ]
    //         });
    //         setTimeout(() => {
    //           me.earth.layerManager.addLayer(layer);
    //         }, index * 100);
    //         // diitgis.addImage({
    //         //   layerName,
    //         //   url:
    //         //     window.servicesConfig.servicesUrl +
    //         //     "/v1/resultSource/assets?id=" +
    //         //     item.id,
    //         //   imageExtent: [
    //         //     Number(boxArr[0]),
    //         //     Number(boxArr[1]),
    //         //     Number(boxArr[2]),
    //         //     Number(boxArr[3]),
    //         //   ],
    //         // });
    //       });
    //     }
    //   });
    // }
  }
};
</script>
<style lang="less" scoped>
.modeling {
  padding: 0 0.3rem;

  .operationBox {
    display: flex;
    justify-content: space-between;
    margin-top: 0.26rem;

    .operationBtn {
      width: 1.1rem;
      height: 0.32rem;
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

  .label {
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #333;
  }

  .operationItem {
    display: flex;
    margin-bottom: 0.2rem;
    align-items: center;
    color: #333333;

    .ant-input {
      width: 1rem !important;
      margin-right: 0.12rem;
    }
  }

  .argumentsBox {
    display: flex;
    flex-wrap: wrap;

    .argumentItem {
      position: relative;
      display: flex;
      align-items: center;
      margin-bottom: 0.16rem;

      .label {
        width: 1.5rem;
        text-align: right;
        font-size: 0.14rem;
      }

      .labelLarge {
        width: 2rem;
      }

      .ant-input {
        width: 1rem !important;
        margin-right: 0.12rem;
        border: 0.01rem solid #b2b2b2;
      }

      .ant-input[disabled] {
        border: none;
        background: #f6f6f6;
        color: #333333;
      }

      img {
        position: absolute;
        right: -0.2rem;
        cursor: pointer;
        z-index: 10;
      }
    }

    .editSave {
      position: absolute;
      right: 0.05rem;
      display: flex;
      align-items: center;
      font-size: 0.14rem;
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
      font-weight: 500;
      color: #1270e9;
      cursor: pointer;

      img {
        margin-right: 0.08rem;
      }
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

  /deep/.ant-tabs-tab {
    background: #f7f7f7;
    border-radius: 0.04rem 0.04rem 0rem 0rem;
    margin-right: 10px;
    color: #666666;
  }

  /deep/.ant-tabs-tab-active {
    background: #f0f6ff;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #1270e9;
  }

  /deep/ .ant-tabs-ink-bar {
    background: #1270e9;
  }
}
</style>
<style lang="less">
.tableModal {
  .ant-modal-title {
    color: #1963e1;
  }

  .ant-modal-header {
    background: #1963e1;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #ffffff;
  }

  .ant-modal-body {
    .operationBox {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.16rem;

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

      .operationBtn {
        width: 0.8rem;
        height: 0.32rem;
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
.prohibit {
  pointer-events: none;
  filter: grayscale(100%);
}
</style>
