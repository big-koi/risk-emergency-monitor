<template>
  <div class="evaluateScopeBox">
    <a-spin :spinning="loading">
      <div class="evaluateScope">
        <!-- 操作行 -->
        <div class="operationBox">
          <div class="operationItem">
            <div class="label">数据类型：</div>
            <a-select style="width: 120px" v-model="dataType" :disabled="isOverly" @change="dataTypeChange">
              <a-select-option value="anal">
                实况数据
              </a-select-option>
              <a-select-option value="fcst">
                预报数据
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="operationBox">
          <div class="operationItem">
            <div class="label">评估日期：</div>
            <a-range-picker :open="rangePickerOpen" format="YYYY-MM-DD HH" v-model="pgDate" :show-time="{ defaultValue: moment('00', 'HH') }" v-show="!isOverly" @openChange="handleOpenChange" />
            <div class="pgDateBox" v-show="isOverly">
              {{ pgDateStart }} 至 {{ pgDateEnd }}
              <!-- {{ moment(pgDate[0]).format("YYYY-MM-DD HH") }} 至 {{ moment(pgDate[1]).format("YYYY-MM-DD HH") }} -->
            </div>
          </div>
          <div class="operationBtn" @click="rainDataOverlying" v-show="!isOverly">
            <img src="../../assets/images/thematic/rain-data.png" />
            降雨数据叠加
          </div>
          <div class="operationBtn" v-show="!isOverly">
            <img src="../../assets/images/thematic/rain-custom.png" />
            降雨数据自定义
          </div>
          <div class="operationBtn" @click="evaluateScopeCollect" v-show="isOverly&&stepFinish!=4&&collectBtnShow&&xzqdm=='000000'">
            <img src="../../assets/images/thematic/tq.png" />
            评估范围提取
          </div>
          <div class="operationBtnDisabled" v-show="collectDisabled&&reCollectShow&&stepFinish!=4&&xzqdm=='000000'">
            重新提取
          </div>
          <div class="operationBtn" @click="confirmEvaluateScopeCollect" v-show="!collectDisabled&&reCollectShow&&stepFinish!=4&&xzqdm=='000000'">
            重新提取
          </div>
          <div class="operationBtnDisabled" v-show="pgRangeDisabledBtn&&isReSelect&&stepFinish!=4&&xzqdm=='000000'">
            重新选择
          </div>
          <div class="operationBtn" @click="evaluateScopeCustom" v-show="!pgRangeDisabledBtn&&isReSelect&&stepFinish!=4&&xzqdm=='000000'">
            重新选择
          </div>
        </div>
        <div class="pgRangeBox" v-show="isOverly">
          <div class="operationItem">
            <div class="operationItemLeft" v-if="xzqdm == '000000'">
              <div class="label">评估维度：</div>
              <a-radio-group :options="pgDimensionOptions" v-model="pgDimension" @change="pgDataChange(1)" />
            </div>
            <div class="operationBtn" v-if="xzqdm == '000000'" @click="evaluateScopeCustom" v-show="isOverly&&stepFinish!=4&&pgRangeBtn">
              <img src="../../assets/images/thematic/tq.png" />
              评估范围自定义
            </div>
            <div class="operationBtn" @click="modelDataHandle" v-show="isShowModelBtn&&stepFinish!=4">
              <img src="../../assets/images/thematic/tq.png" />
              模型数据处理
            </div>
          </div>
          <div class="operationItem">
            <div class="operationItemLeft">
              <div class="label">{{ xzqdm == '000000' ? '评估级别：' : '评估范围：'  }}</div>
              <a-radio-group v-if="xzqdm == '000000'" :options="pgLevelOptions[pgDimension]" v-model="pgLevel" @change="pgLevelChange" />
              <span v-else>{{ xzqName }}</span>
              <!-- <a-radio-group v-else :options="pgLevelOptionsmini" v-model="pgLevel" @change="pgLevelChange" /> -->
            </div>
          </div>
          <div class="operationItem" v-if="rainThresholdShow">
            <div class="operationItemLeft rain">
              <div class="label">降雨阈值：</div>
              <a-input placeholder="请输入降雨阈值" v-model="rainThreshold" @change="pgDataChange(2)" />mm
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <AssessResultVue v-if="isResult" :isOperation.sync="isOperation" :pgLevel.sync="pgLevel" ref="assessResultVue" :class="rainThresholdShow?'assessResultVue':'assessResultNoRain'" />
    <a-modal centered title="降雨阈值" :visible="rainThresholdModal" @cancel="handleCancelThreshold" @ok="confirmEvaluateScopeCollect" :closeIcon="h =>
      h('a-icon', {
        props: {
          type: 'close-circle' // 样式
        },
        style: {
          color: '#fff' // 背景色
        }
      })
      " wrapClassName="rainModal">
      <div class="operationItem">
        <div class="operationItemLeft rain">
          <div class="label">降雨阈值：</div>
          <a-input placeholder="请输入降雨阈值" v-model="rainThreshold" />mm
        </div>

      </div>
    </a-modal>
    <a-modal centered title="评估范围自定义" :width="1000" :visible="customModel" @cancel="handleCancelCustom" @ok="confirmEvaluateScopeCustom" :closeIcon="h =>
      h('a-icon', {
        props: {
          type: 'close-circle' // 样式
        },
        style: {
          color: '#fff' // 背景色
        }
      })
      " wrapClassName="rainModal">
      <div class="customTitle">地区选择：</div>
      <div class="content">
        <a-spin :spinning="loadingTree">
          <a-tree v-model="checkedRegion" :replaceFields="{title: 'name', key: 'code', value: 'code', children: 'children'}" checkable :auto-expand-parent="false" :tree-data="regionOptionsAll" @check="checkRegionChange" />
        </a-spin>
      </div>
      <div class="customTitle">评估区域({{regionNum}}):</div>
      <div class="regionBox">
        <div class="regionBoxItem" v-for="item in regionChencked" :key="item.code">
          <div class="title">{{item.name}}</div>
          <div class="regionBoxBtn">
            <div class="btnItem" v-for="jtem in item.children" :key="jtem.code">
              <div class="text">{{jtem.name}}</div>
              <img src="../../assets/images/thematic/close2.png" @click="deleteRegionChecked(item.name,jtem)" />
            </div>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>
<script>
import moment from "moment";
import diitgis from "@/components/Layer/LayerManagerForDiitGIS";
import AssessResultVue from "./assessResult.vue";
import {
  rainDataOverlying,
  evaluateScopeCollect,
  getRegionTreeData,
  evaluateScopeCollectData,
  evaluateScopeCustom,
  getComputeStatus,
} from "@/api/rapidAnalysis/index.js";

export default {
  components: {
    AssessResultVue,
  },
  props: {
    stepData: {
      type: Object,
      default: () => null,
    },
    isShowBar: {
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      moment,
      xzqdm: window.sessionStorage.getItem("xzqdm"),
      loadingTree: false,
      checkedRegion: [],
      regionChencked: [], //自定义勾选的行政区
      regionOptionsAll: [],
      claims: 1,
      regionNum: 0,
      collectDisabled: false, //提取按钮是否可以点击
      collectBtnShow: true, //提取按钮显示
      reCollectShow: false, // 重新提取按钮显示
      isShowModelBtn: false, //模型数据处理
      pgRangeBtn: true, //评估范围自定义按钮显示
      pgRangeDisabledBtn: false, //评估范围自定义按钮是否可点击
      isReSelect: false, //重新选择按钮
      rainThresholdModal: false,
      rainThresholdShow: false,
      customModel: false, //评估范围自定义弹窗
      isResult: false,
      imgSrc: "",
      loading: false,
      dataType: "anal",
      pgDate: ["", ""],
      isOverly: false,
      pgDimension: "prov",
      pgDimensionOptions: [
        {
          label: "流域",
          value: "basin",
        },
        {
          label: "行政区划",
          value: "prov",
        },
      ],
      pgLevel: "省",
      pgLevelOptionsmini: [{
            label: "市级",
            value: "市",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Base/SHI_Polygon/MapServer",
          },],
      pgLevelOptions: {
        basin: [
          {
            label: "一级流域",
            value: "一级流域",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Flood_Screen/first_level_watershed/MapServer",
          },
          {
            label: "二级流域",
            value: "二级流域",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Flood_Screen/second_level_watershed/MapServer",
          },
          {
            label: "三级流域",
            value: "三级流域",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw30/arcgis/rest/services/mapserver/san_ji_liu_yu/MapServer",
          },
        ],
        prov: [
          {
            label: "省级",
            value: "省",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Flood_Screen/SHENG_Polygon/MapServer",
          },
          {
            label: "市级",
            value: "市",
            type: 2,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Base/SHI_Polygon/MapServer",
          },
          {
            label: "县级",
            value: "县",
            type: 1,
            url: "https://jcyj.ndrcc.org.cn:4001/dtfw/arcgis/rest/services/Flood_Screen/XIAN_Polygon1984_QP2/MapServer",
          },
        ],
      },
      pgDateStart: "",
      pgDateEnd: "",
      stepFinish: 0,
      timer: null,
      rainThreshold: 50, //阈值
      xzqName: sessionStorage.getItem("xzqName"),
      rangePickerOpen: false,
    };
  },
  mounted() {
    let taskInfo = JSON.parse(sessionStorage.getItem("taskInfo"));
    this.stepFinish = taskInfo.step;
    if (this.stepData.status == 1) {
      this.isOverly = true;
      this.isResult = true;
      this.pgDateStart = moment(taskInfo.startDate, "YYYYMMDDHH").format(
        "YYYY-MM-DD HH"
      );
      this.pgDateEnd = moment(taskInfo.endDate, "YYYYMMDDHH").format(
        "YYYY-MM-DD HH"
      );
      this.pgLevel = taskInfo.jb;
      if (this.xzqdm != '000000') {
        this.pgLevel = this.getRegionLevel(this.xzqdm)
      }
      this.pgDimension = taskInfo.level;
      this.dataType = taskInfo.type;
      this.rainThreshold = taskInfo.minPrcp;
      this.claims = taskInfo.claims;
      if (this.claims == 1) {
        this.rainThresholdShow = true; //降雨阈值
        this.collectDisabled = true; // 不能再提取
        this.reCollectShow = true; //重新提取按钮显示
        this.collectBtnShow = false; //评估范围提取不显示
        this.isShowModelBtn = true; // 显示模型数据处理按钮
        this.pgRangeBtn = false; // 不显示评估范围自定义按钮
      }
      if (this.claims == 2) {
        this.pgRangeDisabledBtn = true; // 不能再自定义选择
        this.isShowModelBtn = true; // 显示模型数据处理按钮
        this.isReSelect = true; // 显示重新选择按钮
        this.collectBtnShow = false; // 不显示评估范围提取按钮
        this.pgRangeBtn = false; // 不显示评估范围自定义按钮
        // 回显自定义范围
        let obj = {};
        this.regionNum = taskInfo.regions.length;
        taskInfo.regions.map((item) => {
          if (obj.hasOwnProperty(item.province)) {
            obj[item.province].push({
              code: item.code,
              name: item.name,
            });
          } else {
            obj[item.province] = [];
            obj[item.province].push({
              code: item.code,
              name: item.name,
            });
          }
        });
        this.regionChencked = [];
        for (const key in obj) {
          if (obj.hasOwnProperty.call(obj, key)) {
            this.regionChencked.push({
              name: key,
              children: obj[key],
            });
          }
        }
        this.checkedRegion = taskInfo.regions.map((item) => {
          return item.code;
        });
      }
      // this.getRainDataOverlyingLayer();
      // this.loadBasinOrReginLayer();
      // this.$nextTick(() => {
      //   this.$refs.assessResultVue.getEvaluateScopeResult();
      // });
    }
  },
  computed: {
    isOperation() {
      return (
        (this.collectDisabled || this.pgRangeDisabledBtn) &&
        this.stepData.status == 1
      );
    },
  },
  activated() {
    if (this.stepData.status == 1) {
      this.getRainDataOverlyingLayer();
      this.$nextTick(() => {
        this.$refs.assessResultVue.getEvaluateScopeResult("init");
      });
    }
    if (this.isOverly) {
      this.loadBasinOrReginLayer();
    }
  },
  methods: {
    handleOpenChange(status){
      let that = this
      if(status) {
        this.rangePickerOpen = true
      } else {
        let pgDateEnd = moment(this.pgDate[1])
        let hasDate
        this.rangePickerOpen = false
        if (this.dataType == 'fcst' ) {
          hasDate = moment().add(11, 'days').startOf('day').add(8, 'hours').startOf('hours').add(1, 'seconds');
          if (pgDateEnd > hasDate) {
            this.$confirm({
              title: `未查询到${hasDate.format("YYYY年MM月DD日")}08:00:00至${pgDateEnd.format("YYYY年MM月DD日HH:mm:ss")}降雨数据`,
              content: '请重新选择',
              onOk(){
                return new Promise((resolve, reject) => {
                  that.rangePickerOpen = true
                  setTimeout(resolve, 0);
                }).catch(() => console.log('Oops errors!'));
              },
              onCancel(){
                return new Promise((resolve, reject) => {
                  that.pgDate = ['','']
                  setTimeout(resolve, 0);
                }).catch(() => console.log('Oops errors!'));
              }
            });
          } else {
            this.rangePickerOpen = false
          }
        } else if (this.dataType == 'anal') {
          hasDate = moment().subtract(1, 'hours').startOf('hours').add(1, 'seconds');
          if (pgDateEnd > hasDate) {
            let title = hasDate.format("YYYY年MM月DD日HH:mm:ss") == pgDateEnd.format("YYYY年MM月DD日HH:mm:ss") ? `未查询到${hasDate.format("YYYY年MM月DD日HH:mm:ss")}降雨数据` : `未查询到${hasDate.format("YYYY年MM月DD日HH:mm:ss")}至${pgDateEnd.format("YYYY年MM月DD日HH:mm:ss")}降雨数据`
            this.$confirm({
              title: title,
              content: '请重新选择',
              onOk(){
                return new Promise((resolve, reject) => {
                  that.rangePickerOpen = true
                  setTimeout(resolve, 0);
                }).catch(() => console.log('Oops errors!'));
              },
              onCancel(){
                return new Promise((resolve, reject) => {
                  that.pgDate = ['','']
                  setTimeout(resolve, 0);
                }).catch(() => console.log('Oops errors!'));
              }
            });
          } else {
            this.rangePickerOpen = false
          }
        }
      }
    },
    dataTypeChange() {
      this.pgDate = ["", ""]
      this.pgDateStart = ""
      this.pgDateEnd = ""
    },
    disabledDate(current) {
      if (this.dataType == 'fcst' ) {
        // console.log('current && current < moment().endOf("day")', current && current < moment().endOf('day'))
        return  current && current < moment().endOf('day');
      } else if (this.dataType == 'anal') {
        // console.log('current && current > moment().endOf("day")', current && current > moment().endOf('day'))
        return  current && current > moment().endOf('day');
      }
    },
    // 获取每个算子计算的状态
    getComputeStatus(flag) {
      const param = {
        taskId: this.$route.query.taskId,
      };
      getComputeStatus(param).then((res) => {
        if (res.code == 200) {
          if (res.data.status.running) {
            this.loading = true;
            // this.$refs.assessResultVue.spinshow = true;
          } else {
            this.loading = false;
            clearInterval(this.timer);
            if (flag == 0) {
              this.pgDateStart = moment(this.pgDate[0]).format("YYYY-MM-DD HH");
              this.pgDateEnd = moment(this.pgDate[1]).format("YYYY-MM-DD HH");
              this.loading = false;
              // this.$refs.assessResultVue.spinshow = false;
              this.isOverly = true;
              this.getRainDataOverlyingLayer();
              this.loadBasinOrReginLayer();
              this.$parent.legendShow = true;
              this.$parent.onloadLegend();
            }
            if (flag == 1) {
              this.$message.success("模型数据处理成功");
              this.$parent.getCurrentStepMessage();
            }
          }
        }
      });
    },
    // 点击降雨数据叠加
    rainDataOverlying() {
      if (this.pgDate[0] && this.pgDate[1]) {
        this.loading = true;
        const param = {
          taskId: this.$route.query.taskId,
          type: this.dataType,
          startDate: moment(this.pgDate[0]).format("YYYYMMDDHH"),
          endDate: moment(this.pgDate[1]).format("YYYYMMDDHH"),
          districtCode: window.sessionStorage.getItem("xzqdm"),
        };
        rainDataOverlying(param)
          .then((res) => {
            if (res.code == 200) {
              this.timer = setInterval(() => {
                this.getComputeStatus(0);
              }, 10000);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        this.$message.warning("请选择正确的评估日期范围");
      }
    },
    // 获取降雨数据叠加之后的图层
    getRainDataOverlyingLayer() {
      diitgis.addImage({
        layerName: "降雨数据叠加",
        url:
          window.servicesConfig.servicesUrl +
          "/v1/resultSource/assets?name=output.png&step=0&taskId=" +
          this.$route.query.taskId,
      });
    },
    // 评估层级改变
    pgLevelChange() {
      this.pgDataChange();
      this.loadBasinOrReginLayer();
      this.$parent.onloadLegend();
    },
    //加载流域和行政区地图
    loadBasinOrReginLayer() {
      let reginType = this.xzqdm == '000000' ? this.pgDimension : 'prov'
      let pgLevel = this.pgLevelOptions[reginType].filter((item) => {
        return item.value == this.pgLevel;
      })[0];
      diitgis.addDynamicServer({
        layerName: "评估级别",
        url: pgLevel.url,
        type: pgLevel.type,
      });
      if (this.xzqdm != '000000') {
        this.checkedRegion = [this.xzqdm]
        this.confirmEvaluateScopeCustom(false)
      }
    },
    // 评估层级。降雨阈值发生变化时
    pgDataChange(type) {
      this.collectDisabled = false;
      this.pgRangeDisabledBtn = false;
      if (type == 1) {
        this.pgLevel = this.pgDimension === 'prov' ? '省' : '一级流域';
        this.loadBasinOrReginLayer();
        this.$parent.onloadLegend();
      }
    },
    // 关闭降雨阈值
    handleCancelThreshold() {
      this.rainThresholdModal = false;
    },
    // 点击评估范围提取
    evaluateScopeCollect() {
      if (!this.pgLevel) {
        this.$message.warning("请选择评估级别");
        return;
      }
      if (!this.rainThreshold) {
        this.$message.warning("请填写降雨阈值");
        return;
      }
      this.rainThresholdModal = true;
    },
    // 确定评估范围提取
    confirmEvaluateScopeCollect() {
      if (!this.pgLevel) {
        this.$message.warning("请选择评估级别");
        return;
      }
      if (!this.rainThreshold) {
        this.$message.warning("请填写降雨阈值");
        return;
      }
      let jbName = ''
      if (this.xzqdm != '000000') {
        jbName = sessionStorage.getItem('xzqType')
      } else {
        jbName = this.pgLevel
      }
      const param = {
        taskId: this.$route.query.taskId,
        level: this.pgDimension,
        jb: jbName,
        minPrcp: this.rainThreshold,
      };
      evaluateScopeCollectData(param).then((res) => {
        if (res.code == 200) {
          this.claims = 1;
          this.$message.success("评估范围提取成功");
          this.isResult = true;
          this.rainThresholdShow = true; //降雨阈值
          this.collectDisabled = true; // 不能再提取
          this.reCollectShow = true; //重新提取按钮显示
          this.collectBtnShow = false; //评估范围提取不显示
          this.isShowModelBtn = true; // 显示模型数据处理按钮
          this.pgRangeBtn = false; // 不显示评估范围自定义按钮
          this.$nextTick(() => {
            this.$refs.assessResultVue.getEvaluateScopeResult();
            this.$refs.assessResultVue.getRegionTreeData();
            this.$refs.assessResultVue.getRegionTreeDataAll();
          });
          this.handleCancelThreshold();
        } else {
          this.$message.error("评估范围提取失败");
        }
      });
    },
    getRegionLevel(regionCode) {
        if (regionCode === "000000") {
            return "省";
        }
        const provinceCode = regionCode.substring(0, 2) + "0000";
        const cityCode = regionCode.substring(0, 4) + "00";

        if (regionCode === provinceCode) {
            return "省";
        } else if (regionCode === cityCode) {
            return "市";
        } else {
            return "县";
        }
    },
    // 获取评估区域树形结构
    getRegionTreeDataAll() {
      this.loadingTree = true;
      let param = {
        code: window.sessionStorage.getItem("xzqdm"),
      };
      if (this.pgLevel.includes("流域")) {
        param.code = "--";
      }
      getRegionTreeData(param).then((res) => {
        this.loadingTree = false;
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
    // 树形勾选变化
    checkRegionChange(checkedKeys, e) {
      let obj = {};
      this.regionNum = e.checkedNodes.length;
      e.checkedNodes.map((item) => {
        if (obj.hasOwnProperty(item.data.props.province)) {
          obj[item.data.props.province].push({
            code: item.data.props.code,
            name: item.data.props.name,
          });
        } else {
          obj[item.data.props.province] = [];
          obj[item.data.props.province].push({
            code: item.data.props.code,
            name: item.data.props.name,
          });
        }
      });
      this.regionChencked = [];
      for (const key in obj) {
        if (obj.hasOwnProperty.call(obj, key)) {
          this.regionChencked.push({
            name: key,
            children: obj[key],
          });
        }
      }
    },
    // 删除已经选中的行政区
    deleteRegionChecked(name, item) {
      for (let i = 0; i < this.regionChencked.length; i++) {
        if (this.regionChencked[i].name == name) {
          for (let j = 0; j < this.regionChencked[i].children.length; j++) {
            if (this.regionChencked[i].children[j].code == item.code) {
              this.regionChencked[i].children.splice(j, 1);
              this.regionNum -= 1;
              break;
            }
          }
          if (this.regionChencked[i].children.length == 0) {
            this.regionChencked.splice(i, 1);
          }
          break;
        }
      }
      this.checkedRegion.splice(this.checkedRegion.indexOf(item.code), 1);
    },
    // 点击评估范围自定义
    evaluateScopeCustom() {
      if (!this.pgLevel) {
        this.$message.warning("请选择评估级别");
        return;
      }
      this.getRegionTreeDataAll();
      this.customModel = true;
    },
    // 确定评估范围自定义
    confirmEvaluateScopeCustom(show = true) {
      let jbName = ''
      if (this.xzqdm != '000000') {
        jbName = sessionStorage.getItem('xzqType')
      } else {
        jbName = this.pgLevel
      }
      const param = {
        taskId: this.$route.query.taskId,
        codes: this.checkedRegion,
        jb: jbName,
      };
      evaluateScopeCustom(param).then((res) => {
        if (res.code == 200) {
          if(show) {
            this.$message.success("评估范围自定义成功");
          }
          this.claims = 2;
          this.isResult = true;
          this.pgRangeDisabledBtn = true; // 不能再自定义选择
          this.isShowModelBtn = true; // 显示模型数据处理按钮
          this.isReSelect = true; // 显示重新选择按钮
          this.collectBtnShow = false; // 不显示评估范围提取按钮
          this.pgRangeBtn = false; // 不显示评估范围自定义按钮
          this.$nextTick(() => {
            this.$refs.assessResultVue.getEvaluateScopeResult();
            this.$refs.assessResultVue.getRegionTreeData();
            this.$refs.assessResultVue.getRegionTreeDataAll();
          });
          this.handleCancelCustom();
        } else {
          this.$message.error("评估范围自定义失败");
        }
      });
    },
    // 关闭评估范围自定义
    handleCancelCustom() {
      this.customModel = false;
    },
    // 模型数据处理
    modelDataHandle() {
      this.loading = true;
      let jbName = ''
      if (this.xzqdm != '000000') {
        jbName = sessionStorage.getItem('xzqType')
      } else {
        jbName = this.pgLevel
      }
      const param = {
        taskId: this.$route.query.taskId,
        level: this.pgDimension,
        jb: jbName,
        minPrcp: this.rainThreshold,
        claims: this.claims,
      };
      evaluateScopeCollect(param)
        .then((res) => {
          this.loading = res.code == 200;
          if (res.code == 200) {
            this.getComputeStatus(1);
            this.timer = setInterval(() => {
              this.getComputeStatus(1);
            }, 10000);
          }
        })
        .catch((err) => {
          this.loading = false;
          console.log(err);
        });
    },
    // 展示柱状图
    showBarStastic(flag = true, code) {
      this.$emit("update:isShowBar", flag);
      if (code) {
        this.$parent.$refs.geoLocation.mapLocate(code, true, true)
      }
    },
  },
};
</script>
<style lang="less" scoped>
.evaluateScopeBox {
  position: relative;

  .evaluateScope {
    padding: 0 0.3rem;

    .operationBox {
      display: flex;
      justify-content: space-between;

      .operationBtn {
        width: 1.4rem;
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
      .operationBtnDisabled {
        width: 1.4rem;
        height: 0.32rem;
        background: #f5f5f5;
        border: 0.01rem solid #d9d9d9;
        border-radius: 0.04rem;
        text-align: center;
        line-height: 0.32rem;
        color: #d3d3d3;
        cursor: not-allowed;
      }

      .pgDateBox {
        width: 3.82rem;
        height: 0.32rem;
        background: #f6f6f6;
        border-radius: 0.04rem;
        padding-left: 0.12rem;
        line-height: 0.32rem;
      }
    }
  }
  .assessResultNoRain {
    position: absolute;
    top: 2.4rem;
    left: 0;
    z-index: 10;
  }

  .assessResultVue {
    position: absolute;
    top: 2.6rem;
    left: 0;
    z-index: 10;
  }
}
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
    margin-bottom: 0.16rem;
    align-items: center;
    color: #333333;
    .rain .ant-input {
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

      .rain .ant-input {
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
.ant-calendar-time-picker-btn {
  border: 1px solid #1890ff;
  height: 24px;
  line-height: 24px;
  padding: 0 5px;
  color: #1890ff;
}
.ant-calendar-time-picker-btn-disabled {
  border: none;
}
.rainModal {
  .ant-modal-title {
    color: #fff;
  }

  .ant-modal-header {
    background: #1963e1;
    font-family: PingFang SC, PingFang SC-Semibold;
    font-weight: 600;
    color: #ffffff;
  }
  .ant-modal-footer {
    .ant-btn-primary {
      background: #1963e1;
      border-color: #1963e1;
    }
  }
  .customTitle {
    width: 100%;
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
    color: #333;
    background: #f2f2f2;
    margin-bottom: 20px;
  }
  .ant-tree {
    height: 300px;
    overflow: auto;
    margin-bottom: 10px;
  }
  .content {
    padding: 0 20px;
  }
  .regionBox {
    height: 220px;
    padding: 0 20px;
    overflow: auto;
    .regionBoxItem {
      width: 100%;
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 10px;
      .title {
        margin-bottom: 10px;
        color: #1963e1;
      }
      .regionBoxBtn {
        display: flex;
        .btnItem {
          display: flex;
          align-items: center;
          height: 30px;
          background: #1963e1;
          border-radius: 10px;
          padding: 0 10px;
          margin-right: 10px;
          line-height: 30px;
          text-align: center;
          color: #fff;
          .text {
            margin-right: 5px;
          }
          img {
            width: 14px;
            cursor: pointer;
          }
        }
      }
    }
  }
}
.label {
  font-family: PingFang SC, PingFang SC-Semibold;
  font-weight: 600;
  color: #333;
}
.operationItem {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.16rem;
  align-items: center;
  color: #333333;
  .operationItemLeft {
    display: flex;
    align-items: center;
  }
  .operationBtn {
    width: 1.4rem;
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

  .ant-calendar-picker {
    width: 2.5rem !important;
  }

  .rain .ant-input {
    width: 1rem !important;
    margin-right: 0.12rem;
  }

  /deep/.ant-radio-wrapper-checked {
    color: #1270e9;
  }
}
/deep/.ant-modal-confirm-btns > ant-btn{
  display: none;
}
</style>
