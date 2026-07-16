<template>
  <!-- prohibit -->
  <div>
    <div class="earlyWarningLevelAssess" >
      <a-spin class="spin" :spinning="spinshow">
        <!-- 操作行 -->
        <div class="operationBox" v-if="stepData.status == 0">
          <a-button :class="stepOperation ? 'operationBtn' : 'operationBtn prohibit'" @click="startAssess" type="primary"
            >开始计算</a-button>
        </div>
        <div class="operationBox" v-else>
          <!-- <a-button class="operationBtn" @click="showResult" type="primary"
            >查看结果</a-button> -->
          <a-button class="operationBtn" @click="downloadResult"
            type="primary" :disabled="!step4Finish">结果下载</a-button>
        </div>
      </a-spin>
    </div>
    <early-warning-level-result v-if="isResult" :tableData="tableData" class="early-warning-level-result-table"
      @exportExcel="downloadExcel" @changePage="changePage" :legendShow.sync="legendShow"
      :legendBoxData.sync="legendBoxData" @removeAllAddedLayers="removeAllAddedLayers"/>
  </div>
</template>
<script>
import earlyWarningLevelResult from './earlyWarningLevelResult.vue'
import { getEstimateRes, getStep4pngs, exportShape, exportShp, getComputeStatus, step4Assess } from '@/api/rapidAnalysis/index.js'
import diitgis from "@/components/Layer/LayerManagerForDiitGIS.js";
export default {
  components: { earlyWarningLevelResult },
  props: {
    stepData: {
      type: Object,
      default: null,
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
  data() {
    return {
      spinshow: false,
      ifAssessed: false,
      stepOperation: true,
      step4Finish: false,
      isResult: false,
      tableData: [],
      shpUrl: '',
      timer: ''
    };
  },
  watch: {
    stepData(newVal) {

    }
  },
  mounted() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (taskInfo.step < 3) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      // this.showResult()
    }
  },
  activated() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (taskInfo.step < 3) {
      this.stepOperation = false;
    }
    if (this.stepData.status == 1) {
      this.showResult()
    }
  },
  methods: {
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
            this.$message.success("预警等级评估成功");
            this.$parent.getCurrentStepMessage();
            this.stepFinish = 4;
            this.showResult();
          }
        }
      });
    },
    startAssess () {
      this.spinshow = true;
      step4Assess({taskId: this.$route.query.taskId}).then(res => {
        if (res.code == 200) {
          this.getComputeStatus();
          this.timer = setInterval(() => {
            this.getComputeStatus();
          }, 10000);
        } else {
          this.spinshow = false
          this.$message.error("预警等级评估失败");
        }
      }).catch(err => {
        console.error(err)
        this.$message.error("预警等级评估失败");
      })
    },
    removeAllAddedLayers () {
      this.$emit('removeAllAddedLayers')
    },
    showResult() {
      this.spinshow = true;
      let formData = new FormData();
      formData.append('taskId', this.$route.query.taskId);
      formData.append('pageSize', 10);
      formData.append('pageNumber', 1);
      getEstimateRes(formData).then(res => {
        this.spinshow = false;
        if (res.code == 200) {
          // this.$message.success("预警等级评估成功");
          this.isResult = true;
          this.stepOperation = false
          this.step4Finish = true
          this.tableData = res.data
          // 调用矢量快显(不再使用，改为添加网格数据)
          // me.earth.removeAllLayer();
          this.removeAllAddedLayers()
          // this.$parent.getCurrentStepMessage();
          // diitgis.addVFD(
          //   {
          //     layerName: '最大降雨深度',   // 图层名称
          //     tableName: 'view_result_max_depth',     // 预警结果表
          //     renderField: 'gradecode',
          //     renderId: 'MAXDEPTH',
          //     filterCondition: `taskid='${this.$route.query.taskId}'`,
          //     attributeFields: 'gradecode'
          //   }
          // )
          this.addMeshLayer()
        } else {
          this.$message.error("预警等级查看失败");
        }
      }).catch(() => {
        this.$message.error("预警等级查看失败");
      })
    },
    // findName找到行政区名称
    findName (pageData, row) {
      const code = row.code
      if (!code) return '预警等级'

      const record = pageData.records.find(item => item.code == code)
      if (record) {
        const xzqName = (record.county && record.county !== '--') ? record.county
          : (record.city && record.city !== '--') ? record.city
          : (record.province && record.province !== '--') ? record.province : ''
        return xzqName + (record.level || '预警等级')
      }
    },
    // 添加网格png
    addMeshLayer () {
      const params = {
        pageNum: 1,
        pageSize: 10,
        taskId: this.$route.query.taskId,
        seq: false
      }
      getStep4pngs(params).then(res => {
        if (res.code == 200) {
          res.data.pngIds.map((item, index) => {
            const boxArr = item.box.split(",");
            const name = this.findName(res.data.pageData, item)
            diitgis.addImage({
              name,
              layerName: "预警等级" + index,
              url:
                window.servicesConfig.servicesUrl +
                "/v1/resultSource/assets?id=" +
                item.id,
              imageExtent: [
                Number(boxArr[0]),
                Number(boxArr[1]),
                Number(boxArr[2]),
                Number(boxArr[3])
              ]
            });
          });
        }
      })
    },
    downloadResult() {
      // const param = new FormData();
      // param.append('taskId', '39559d9f40b443d381de227b4ec55c79')
      const param = {
        taskId: this.$route.query.taskId,
      };
      exportShp(param).then((res) => {
        const blob = new Blob([res]);
        // 下载下来的文件名称
        const fileName = "预警等级评估结果" + ".zip";
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
    blodDownFile(blob, fileName) {
      try {
        const href = (window.URL || window.webkitURL).createObjectURL(blob) // 创建下载的链接
        if (window.navigator.msSaveBlob) {
          window.navigator.msSaveBlob(blob, fileName)
        } else {
          // 谷歌浏览器 创建a标签 添加download属性下载
          const downloadElement = document.createElement('a')
          downloadElement.href = href
          downloadElement.target = '_blank'
          downloadElement.download = fileName
          document.body.appendChild(downloadElement)
          downloadElement.click() // 点击下载
          document.body.removeChild(downloadElement) // 下载完成移除元素
          window.URL.revokeObjectURL(href) // 释放掉blob对象
        }
      } catch (e) {
        console.log('下载失败')
      }
    },
    downloadExcel() {
      const baseUrl = window.servicesConfig.servicesUrl
      window.open(`${baseUrl}/v1/estimateLevel/exportExcel?taskId=${this.$route.query.taskId}`)
    },
    changePage(pageNum, pageSize) {
      this.spinshow = true;
      let formData = new FormData();
      formData.append('taskId', this.$route.query.taskId);
      formData.append('pageSize', pageSize);
      formData.append('pageNumber', pageNum);
      getEstimateRes(formData).then(res => {
        this.spinshow = false;
        if (res.code == 200) {
          this.isResult = true;
          this.tableData = res.data
        } else {
          this.$message.error("获取预警等级评估结果失败");
        }
      })
    }

  },
};
</script>
<style lang="less" scoped>
.earlyWarningLevelAssess {
  padding: 0 0.3rem;

  .operationBox {
    display: flex;
    justify-content: end;
    margin-top: 0.26rem;

    .operationBtn {
      margin-left: 0.26rem;
    }
  }

  .renderGrade {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 0.39rem;
    background: #f7f7f7;
    border-radius: 0.04rem;
    margin-top: 0.14rem;
    padding: 0 0.2rem;
    line-height: 0.39rem;
    font-size: 0.14rem;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #333333;

    img {
      margin-left: 0.12rem;
      cursor: pointer;
    }

    .edit {
      display: flex;
      align-items: center;
      font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
      font-weight: 500;
      color: #1270e9;
      cursor: pointer;

      img {
        margin-right: 0.08rem;
      }
    }
  }

  .gradeTitle {
    margin: 0.16rem 0;
    margin-left: 0.3rem;
    font-size: 0.14rem;
    font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Medium;
    font-weight: 500;
    color: #333333;
  }

  .gradeBox {
    display: flex;
    flex-wrap: wrap;
    padding: 0 0.3rem;

    .gradeItem {
      display: flex;
      align-items: center;
      width: 50%;
      margin-bottom: 0.16rem;

      .colorCard {
        width: 0.26rem;
        height: 0.2rem;
        border-radius: 0.04rem;
        margin-right: 0.14rem;
      }

      .gradeValue {
        display: flex;
        align-items: center;

        .ant-input {
          width: 0.8rem;
          border-color: #b2b2b2;
        }

        .ant-input[disabled] {
          border: none;
          background: #f6f6f6;
          color: #333333;
        }

        div {
          margin: 0 0.1rem;
        }
      }
    }
  }
}

.early-warning-level-result-table {
  position: absolute;
  top: 2.6rem;
  left: 0;
  z-index: 10;
}
</style>
<style lang="less">
.prohibit {
  pointer-events: none;
  filter: grayscale(100%);
}
</style>
