<template>
  <div class="case-collection-content" style="height: calc(100% - 112px);">
    <h3 class="title">基本信息</h3>
    <a-form-model
      ref="ruleForm"
      :model="form"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item label="案例名称" prop="name">
        <a-input v-model="form.name" placeholder="请输入案例名称" />
      </a-form-model-item>
      <a-form-model-item label="灾害过程日期">
        <a-range-picker
          style="width: 100%;"
          :show-time="{ format: 'HH:mm' }"
          format="YYYY-MM-DD HH:mm"
          v-model="form.date"
          allowClear
        />
      </a-form-model-item>
      <a-form-model-item label="受灾区域">
        <a-tree-select
          :value="form.region"
          showCheckedStrategy
          style="width: 100%"
          :tree-data="treeData"
          tree-checkable
          placeholder="请选择受灾区域"
          :getPopupContainer="trigger => trigger.parentNode"
          :replaceFields="{
            children: 'children',
            title: 'name',
            key: 'key',
            value: 'code'
          }"
          :dropdownStyle="{ maxHeight: '200px' }"
          allowClear
          :maxTagCount="3"
          :filterTreeNode="filterTreeNode"
          @change="handleRegionChange"
        />
      </a-form-model-item>
      <a-form-model-item label="备注">
        <a-input v-model="form.desc" type="textarea" placeholder="请输入备注" />
      </a-form-model-item>
    </a-form-model>
    <h3 class="title">历史任务</h3>
    <ul class="lsTask-list-box">
      <li v-for="(item, index) in historyCaseList">
        <span @click="caseHistoryTaskClick(item)"
          >{{ taskTypeObj[item.task_type] }}-{{
            incrementHour(item.task_name)
          }}</span
        ><a-icon
          type="close-circle"
          theme="filled"
          class="delate-case-icon"
          @click="deleteCase(item, '2')"
        />
      </li>
    </ul>
    <div class="yjxx-box">
      <h3 class="title">预警信息</h3>
      <span class="zdgl-box" @click="setAutomaticAssociation()"
        ><a-icon type="link" />{{ hasAutoAssociated ? "重新关联" : "自动关联" }}</span
      >
    </div>
    <ul class="yjxx-tab-box">
      <li
        :class="yjxxTabIndex === '1' ? 'active' : ''"
        @click="yjxxTabClick('1')"
      >
        短临预报
      </li>
      <li
        :class="yjxxTabIndex === '2' ? 'active' : ''"
        @click="yjxxTabClick('2')"
      >
        城市内涝
      </li>
      <li
        :class="yjxxTabIndex === '5' ? 'active' : ''"
        @click="yjxxTabClick('5')"
      >
        山洪
      </li>
    </ul>
    <div v-if="yjxxTabIndex === '1'">
      <h2 class="yjxx-tab-title">暴雨预警城市</h2>
      <a-table
        :columns="byyjColumns"
        :data-source="byyjTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
        size="small"
      >
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '3')"
            >删除</a
          >
        </span>
      </a-table>
      <h2 class="yjxx-tab-title">未来三小时降水量</h2>
      <a-table
        :columns="threeColumns"
        :data-source="threeTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '4')"
            >删除</a
          >
        </span>
      </a-table>
      <h2 class="yjxx-tab-title">未来3h+过去3h降水量</h2>
      <a-table
        :columns="sixColumns"
        :data-source="sixTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '4')"
            >删除</a
          >
        </span>
      </a-table>
    </div>
    <div v-if="yjxxTabIndex === '2'">
      <h2 class="yjxx-tab-title">内涝预警城市</h2>
      <a-table
        :columns="nlyjColumns"
        :data-source="nlyjTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="yj_level" slot-scope="text, record">
          <a-button
            type="primary"
            v-if="record.yj_level === '红色预警'"
            style="background: #FC5558;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '橙色预警'"
            style="background: #FD7823;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '黄色预警'"
            style="background: #F5AB18;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '蓝色预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '无预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
        </span>
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '3')"
            >删除</a
          >
        </span>
      </a-table>
      <h2 class="yjxx-tab-title">积水深度</h2>
      <a-table
        :columns="jssdColumns"
        :data-source="jssdTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '4')"
            >删除</a
          >
        </span>
      </a-table>
    </div>
    <div v-if="yjxxTabIndex === '5'">
      <h2 class="yjxx-tab-title">山洪预警城市</h2>
      <a-table
        :columns="shyjColumns"
        :data-source="shyjTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="yj_level" slot-scope="text, record">
          <a-button
            type="primary"
            v-if="record.yj_level === '红色预警'"
            style="background: #FC5558;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '橙色预警'"
            style="background: #FD7823;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '黄色预警'"
            style="background: #F5AB18;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '蓝色预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
          <a-button
            type="primary"
            v-if="record.yj_level === '无预警'"
            style="background: #5B86FC;border: none;"
          >
            {{ record.yj_level }}
          </a-button>
        </span>
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '3')"
            >删除</a
          >
        </span>
      </a-table>
      <h2 class="yjxx-tab-title">积水深度</h2>
      <a-table
        :columns="shjssdColumns"
        :data-source="shjssdTableData"
        :scroll="{ y: 200 }"
        :pagination="false"
      >
        <span slot="action" slot-scope="text, record">
          <a class="case-link case-link-delete" @click="deleteCase(record, '4')"
            >删除</a
          >
        </span>
      </a-table>
    </div>
    <h3 class="title" style="margin-top: 20px;">点位信息</h3>
    <a-table
      :columns="dwColumns"
      :data-source="dwTableData"
      :scroll="{ y: 200 }"
      :pagination="false"
    >
      <span slot="num" slot-scope="text, record, index">
        <span>{{ index + 1 }}</span>
      </span>
      <span slot="action" slot-scope="text, record">
        <a-space>
          <a class="case-link case-link-view" @click="seePrint(record)"
            >查看</a
          >
          <a class="case-link case-link-delete" @click="deleteCase(record, '5')"
            >删除</a
          >
        </a-space>
      </span>
    </a-table>
  </div>
</template>
<script>
import moment from "moment";
const treeData = [];
//案例收藏预警信息
//暴雨预警城市
const byyjColumns = [
  {
    title: "省名",
    key: "sheng_name",
    dataIndex: "sheng_name",
    ellipsis: true,
    align: "center"
  },
  {
    title: "市名",
    dataIndex: "area_name",
    key: "area_name",
    ellipsis: true,
    align: "center"
  },
  {
    title: "预警指标",
    dataIndex: "yj_level",
    ellipsis: true,
    key: "yj_level",
    align: "center"
  },
  {
    title: "预警时间",
    key: "datatime",
    dataIndex: "datatime",
    ellipsis: true,
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const byyjTableData = [];
//未来三小时
const threeColumns = [
  {
    title: "行政区",
    key: "xzq",
    ellipsis: true,
    align: "center",
    customRender: (text, record, index) => {
      return record.xianname + "-" + record.shiname + "-" + record.shengname;
    }
  },
  {
    title: "累计降雨量",
    dataIndex: "sumjy",
    key: "sumjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.sumjy + "mm";
    },
    align: "center"
  },
  {
    title: "最大小时降雨量",
    dataIndex: "maxjy",
    key: "maxjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxjy + "mm";
    },
    align: "center"
  },
  {
    title: "小时最大格网降雨量",
    key: "maxgwjy",
    dataIndex: "maxgwjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxgwjy + "mm";
    },
    align: "center"
  },
  {
    title: "预报时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const threeTableData = [];
//未来三小时加过去三小时
const sixColumns = [
  {
    title: "行政区",
    key: "xzq",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.xianname + "-" + record.shiname + "-" + record.shengname;
    },
    align: "center"
  },
  {
    title: "累计降雨量",
    dataIndex: "sumjy",
    key: "sumjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.sumjy + "mm";
    },
    align: "center"
  },
  {
    title: "最大小时降雨量",
    dataIndex: "maxjy",
    key: "maxjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxjy + "mm";
    },
    align: "center"
  },
  {
    title: "小时最大格网降雨量",
    key: "maxgwjy",
    dataIndex: "maxgwjy",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxgwjy + "mm";
    },
    align: "center"
  },
  {
    title: "预报时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const sixTableData = [];
//内涝预警城市
const nlyjColumns = [
  {
    title: "省名",
    key: "sheng_name",
    ellipsis: true,
    dataIndex: "sheng_name",
    align: "center"
  },
  {
    title: "市名",
    ellipsis: true,
    dataIndex: "area_name",
    key: "area_name",
    align: "center"
  },
  {
    title: "预警等级",
    key: "yj_level",
    ellipsis: true,
    scopedSlots: { customRender: "yj_level" },
    align: "center"
  },
  {
    title: "预警时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const nlyjTableData = [];
//内涝积水深度
const jssdColumns = [
  {
    title: "行政区",
    key: "xzq",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.shengname + "-" + record.shiname;
    },
    align: "center"
  },
  {
    title: "最大积水时间",
    dataIndex: "zdjssj",
    ellipsis: true,
    key: "zdjssj",
    align: "center"
  },
  {
    title: "最大积水深度",
    dataIndex: "maxjssd",
    key: "maxjssd",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxjssd + "m";
    },
    align: "center"
  },
  {
    title: "预报时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const jssdTableData = [];
//山洪预警城市
const shyjColumns = [
  {
    title: "省名",
    key: "sheng_name",
    ellipsis: true,
    dataIndex: "sheng_name",
    align: "center"
  },
  {
    title: "市名",
    dataIndex: "area_name",
    ellipsis: true,
    key: "area_name",
    align: "center"
  },
  {
    title: "预警等级",
    key: "yj_level",
    ellipsis: true,
    scopedSlots: { customRender: "yj_level" },
    align: "center"
  },
  {
    title: "预警时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const shyjTableData = [];
//山洪积水深度
const shjssdColumns = [
  {
    title: "行政区",
    key: "xzq",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.shengname + "-" + record.shiname;
    },
    align: "center"
  },
  {
    title: "最大积水时间",
    dataIndex: "zdjssj",
    ellipsis: true,
    key: "zdjssj",
    align: "center"
  },
  {
    title: "最大积水深度",
    dataIndex: "maxjssd",
    key: "maxjssd",
    ellipsis: true,
    customRender: (text, record, index) => {
      return record.maxjssd + "m";
    },
    align: "center"
  },
  {
    title: "预报时间",
    key: "datatime",
    ellipsis: true,
    dataIndex: "datatime",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const shjssdTableData = [];
//点位信息表格
const dwColumns = [
  {
    title: "序号",
    align: "center",
    width: 60,
    scopedSlots: { customRender: "num" },
    align: "center"
  },
  {
    title: "经度",
    dataIndex: "lon",
    key: "lon",
    align: "center"
  },
  {
    title: "纬度",
    dataIndex: "lat",
    key: "lat",
    align: "center"
  },
  {
    title: "操作",
    key: "action",
    width: 100,
    scopedSlots: { customRender: "action" },
    align: "center"
  }
];
const dwTableData = [];
import {
  getCaseInfo,
  deleteCase,
  xzqTree,
  automaticAssociation
} from "@/api/rapidAnalysis/case.js";
export default {
  props: {
    caseId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      treeData,
      filteredTreeData: [],
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      other: "",
      form: {
        name: "",
        region: [],
        date: ["", ""],
        desc: ""
      },
      rules: {
        name: [
          {
            required: true,
            message: "请输入案例名称"
          }
        ]
      },
      yjxxTabIndex: "1", //短临预报1，积水深度2，山洪5
      hasAutoAssociated: false,
      historyCaseList: [],
      taskTypeObj: {
        "1": "短临预报",
        "2": "积水深度",
        "5": "山洪"
      },
      byyjColumns,
      byyjTableData,
      threeColumns,
      threeTableData,
      sixColumns,
      sixTableData,
      nlyjColumns,
      nlyjTableData,
      jssdColumns,
      jssdTableData,
      shyjColumns,
      shyjTableData,
      shjssdColumns,
      shjssdTableData,
      dwColumns,
      dwTableData,
      cityData: [],
      dataList: []
    };
  },
  methods: {
    moment,
    incrementHour(dateStr) {
      // 使用正则表达式提取小时部分
      const hourMatch = dateStr.match(/(\d{2})时$/);

      if (!hourMatch) {
        throw new Error('无效的时间格式，请确保字符串以"XX时"结尾');
      }

      // 提取出的小时是字符串，转换为数字后加1
      const originalHour = parseInt(hourMatch[1], 10);

      // 处理小时超过23的情况（如果需要循环）
      const newHour = (originalHour + 1) % 24;

      // 格式化为两位数
      const formattedHour = newHour.toString().padStart(2, "0");

      // 替换回原字符串格式
      return dateStr.replace(/(\d{2})时$/, `${formattedHour}时`);
    },
    filterTreeNode(inputValue, treeNode) {
      // 根据节点的 title 进行搜索，不区分大小写
      return treeNode.componentOptions.propsData.title
        .toLowerCase()
        .includes(inputValue.toLowerCase());
    },
    getXzqTree() {
      xzqTree().then(res => {
        if (res.code === 200) {
          // this.treeData = res.data;
          this.treeData = this.processedTreeData(res.data);
        }
      });
    },
    processedTreeData(list) {
      // 创建深拷贝避免修改原始数据
      const data = JSON.parse(JSON.stringify(list));
      // 递归处理函数
      const processNodes = nodes => {
        return nodes.map(node => {
          // 添加新属性
          const newNode = {
            ...node,
            key: node.code + node.level,
            code: node.code + "-" + node.level
          };
          // 处理子节点
          if (node.children && node.children.length) {
            newNode.children = processNodes(node.children);
          }
          return newNode;
        });
      };
      return processNodes(data);
    },
    handleRegionChange(value) {
      debugger;
      this.form.region = value;
    },
    yjxxTabClick(index) {
      this.yjxxTabIndex = index;
      // this.getCaseInfoData();
    },
    resetCaseForm() {
      this.hasAutoAssociated = false;
      this.form = {
        name: "",
        region: [],
        date: ["", ""],
        desc: ""
      };
      this.yjxxTabIndex = "1";
      this.historyCaseList = [];
      this.byyjTableData = [];
      this.threeTableData = [];
      this.sixTableData = [];
      this.nlyjTableData = [];
      this.jssdTableData = [];
      this.shyjTableData = [];
      this.shjssdTableData = [];
      this.dwTableData = [];
      this.cityData = [];
      this.dataList = [];
    },
    syncAutoAssociatedState() {
      this.hasAutoAssociated = !!(
        (this.cityData && this.cityData.length) ||
        (this.dataList && this.dataList.length) ||
        (this.byyjTableData && this.byyjTableData.length) ||
        (this.nlyjTableData && this.nlyjTableData.length) ||
        (this.shyjTableData && this.shyjTableData.length) ||
        (this.threeTableData && this.threeTableData.length) ||
        (this.sixTableData && this.sixTableData.length) ||
        (this.jssdTableData && this.jssdTableData.length) ||
        (this.shjssdTableData && this.shjssdTableData.length)
      );
    },
    getCaseInfoData(id) {
      getCaseInfo({
        caseid: id || this.caseId
      }).then(res => {
        if (res.code === 200) {
          debugger
          //基本信息
          let region = [];
          if(res.data.case.disaster_area){
            region = res.data.case.disaster_area !== ""
                ? res.data.case.disaster_area.split(",")
                : []
          }
          this.form = {
            name: res.data.case.case_name,
            region: region,
            date: [res.data.case.start_time, res.data.case.end_time],
            desc: res.data.case.remark
          };
          this.dataList = res.data.dljs.concat(
            res.data.csnl,
            res.data.shanhong
          ); // 预警信息数据
          this.historyCaseList = res.data.history; //历史任务列表
          this.dwTableData = res.data.point; // 点位信息列表
          this.cityData = res.data.city; // 预警信息列表
          this.byyjTableData = res.data.city.filter(
            item => item.task_type === "1"
          );
          this.nlyjTableData = res.data.city.filter(
            item => item.task_type === "2"
          );
          this.shyjTableData = res.data.city.filter(
            item => item.task_type === "5"
          );
          //未来三小时
          this.threeTableData = res.data.dljs.filter(
            item => item.type === "3小时"
          );
          //未来3h+过去3h降水量
          this.sixTableData = res.data.dljs.filter(
            item => item.type === "6小时"
          );
          //积水深度
          this.jssdTableData = res.data.csnl;
          //山洪积水深度
          this.shjssdTableData = res.data.shanhong;
          this.syncAutoAssociatedState();
        }
      });
    },
    deleteCase(item, type) {
      deleteCase({
        caseid: this.caseId,
        id: item.id,
        type: type
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("删除成功");
          // this.$emit("deleteCase");
          this.getCaseInfoData();
        } else {
          this.$message.error("删除失败");
        }
      });
    },
    setAutomaticAssociation() {
      if (
        this.form.region.length === 0 ||
        this.form.date[0] === "" ||
        this.form.date[1] === ""
      ) {
        this.$message.warning("请选择灾害过程日期和受灾区域");
        return;
      }
      let xzqdmNewList;
      if (this.form.region.length > 0) {
        xzqdmNewList = this.form.region.map(item => item.split("-")[0]);
      }
      const kssj = moment(this.form.date[0])
        .startOf("hour")
        .format("YYYY-MM-DD HH:mm");
      const jssj = moment(this.form.date[1])
        .startOf("hour")
        .format("YYYY-MM-DD HH:mm");
      automaticAssociation({
        kssj: kssj,
        jssj: jssj,
        xzqdm: xzqdmNewList.join(","),
        caseid: this.caseId
      }).then(res => {
        if (res.code === 200) {
          this.$message.success("关联成功");
          this.hasAutoAssociated = true;
          this.dataList = res.data.dljs.concat(
            res.data.csnl,
            res.data.shanhong
          ); // 预警信息数据
          this.cityData = res.data.city; // 预警信息列表
          this.byyjTableData = res.data.city.filter(
            item => item.task_type === "1"
          );
          this.nlyjTableData = res.data.city.filter(
            item => item.task_type === "2"
          );
          this.shyjTableData = res.data.city.filter(
            item => item.task_type === "5"
          );
          //未来三小时
          this.threeTableData = res.data.dljs.filter(
            item => item.type === "3小时"
          );
          //未来3h+过去3h降水量
          this.sixTableData = res.data.dljs.filter(
            item => item.type === "6小时"
          );
          //积水深度
          this.jssdTableData = res.data.csnl;
          //山洪积水深度
          this.shjssdTableData = res.data.shanhong;

          getCaseInfo({
            caseid: this.caseId,
            flag: "1"
          }).then(res => {
            if (res.code === 200) {
              this.threeTableData = res.data.dljs.filter(
                item => item.type === "3小时"
              ).concat(this.threeTableData);

              this.sixTableData = res.data.dljs.filter(
                item => item.type === "6小时"
              ).concat(this.sixTableData);

              this.jssdTableData = res.data.csnl.concat(this.jssdTableData);
              // //山洪积水深度
              this.shjssdTableData = res.data.shanhong.concat(this.shjssdTableData);

              this.dataList = this.threeTableData.concat(this.sixTableData,this.jssdTableData,this.shjssdTableData); // 预警信息数据

              this.byyjTableData = res.data.city.filter(
                item => item.task_type === "1"
              ).concat(this.byyjTableData);
              this.nlyjTableData = res.data.city.filter(
                item => item.task_type === "2"
              ).concat(this.nlyjTableData);
              this.shyjTableData = res.data.city.filter(
                item => item.task_type === "5"
              ).concat(this.shyjTableData);
              this.cityData = this.byyjTableData.concat(
                this.nlyjTableData,
                this.shyjTableData
              ); // 预警信息列表
              this.$emit("handleSaveCase", true);
            }
          });
        } else {
          this.$message.error("关联失败");
        }
      });
    },
    caseHistoryTaskClick(item) {
      this.$emit("caseHistoryTaskClick", item);
    },
    seePrint(item) {
      this.$emit("seePrint", item);
    }
  },
  watch: {
    caseId(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.getCaseInfoData(newVal);
      } else if (!newVal) {
        this.resetCaseForm();
      }
    }
  },
  mounted() {
    this.getXzqTree();
    if (this.caseId) {
      this.getCaseInfoData();
    }
  }
};
</script>
<style lang="less" scoped>
.case-collection-content {
  padding: 0.12rem 0.14rem;
  overflow-y: auto;
  font-size: 0.14rem;
  color: #c2e1ff;

  .title {
    font-size: 0.15rem;
    color: #ffffff;
    line-height: 1.4;
    position: relative;
    margin-bottom: 0.12rem;
    font-weight: 600;

    &::after {
      content: "";
      width: 0.7rem;
      height: 0.06rem;
      background: rgba(127, 192, 255, 0.41);
      position: absolute;
      bottom: 0;
      left: 0;
    }
  }

  .yjxx-box {
    display: flex;
    align-items: center;

    .zdgl-box {
      font-size: 0.13rem;
      color: #ff7a00;
      margin-left: 0.12rem;
      cursor: pointer;
    }
  }

  .yjxx-tab-box {
    display: flex;
    width: 100%;
    max-width: 3rem;
    background: linear-gradient(
      304deg,
      rgba(0, 98, 186, 0.58) 6%,
      rgba(0, 92, 147, 0.62) 93%
    );
    border: 0.01rem solid;
    border-image: linear-gradient(
        180deg,
        #59b2ff,
        rgba(62, 173, 242, 0) 37%,
        rgba(41, 170, 232, 0) 65%,
        #419aff
      )
      1 1;
    border-radius: 0.04rem;

    li {
      flex: 1;
      height: 0.32rem;
      line-height: 0.32rem;
      text-align: center;
      font-size: 0.13rem;
      color: #5fb0ff;
      cursor: pointer;

      &.active {
        background: linear-gradient(120deg, #3d97f9 12%, #1482d8 89%);
        border-radius: 0.03rem 0 0 0.03rem;
        color: #fff;
      }
    }
  }

  .yjxx-tab-title {
    font-size: 0.13rem;
    color: #5fb0ff;
    margin: 0.08rem 0;
    font-weight: 500;
  }

  .lsTask-list-box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 0.08rem 0.12rem;
    margin-bottom: 0.12rem;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.13rem;

      span {
        color: #4bd5ff;
        text-decoration: underline;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .delate-case-icon {
        flex-shrink: 0;
        color: rgba(243, 243, 243, 0.38);
        padding-left: 0.04rem;
        cursor: pointer;
        font-size: 0.12rem;
      }
    }
  }

  /deep/ .ant-input,
  /deep/ .ant-input-number,
  /deep/ .ant-select-selection,
  /deep/ .ant-calendar-picker-input {
    font-size: 0.13rem;
    color: #ffffff;
    background: rgba(0, 58, 133, 0.45);
    border-color: rgba(89, 178, 255, 0.45);
  }

  /deep/ .ant-form-item-label > label {
    font-size: 0.13rem;
    color: rgba(255, 255, 255, 0.88);
  }

  /deep/ .ant-form-item {
    margin-bottom: 0.1rem;
  }

  /deep/ .ant-table {
    font-size: 0.12rem;
    color: rgba(255, 255, 255, 0.88);
  }

  /deep/ .ant-table-thead > tr > th {
    padding: 0.06rem 0.04rem !important;
    font-size: 0.12rem !important;
    color: #b2d9ff;
    background: rgba(15, 85, 166, 0.35);
    border-bottom: 0.01rem solid rgba(84, 144, 208, 0.45);
  }

  /deep/ .ant-table-tbody > tr > td {
    padding: 0.06rem 0.04rem !important;
    font-size: 0.12rem !important;
    border-bottom: 0.01rem solid rgba(84, 144, 208, 0.25);
  }

  /deep/ .ant-table-tbody > tr:hover > td {
    background: rgba(15, 85, 166, 0.28);
  }

  /deep/ .ant-select-tree li .ant-select-tree-node-content-wrapper {
    color: #ffffff;
  }

  /deep/ .ant-select-tree li span.ant-select-tree-switcher,
  /deep/ .ant-select-tree li span.ant-select-tree-iconEle {
    color: #ffffff;
  }

  /deep/ .ant-select-tree li .ant-select-tree-node-content-wrapper:hover {
    background: linear-gradient(120deg, #3d97f9 12%, #1482d8 89%);
  }

  /deep/ .ant-select-selection--multiple .ant-select-selection__choice__remove {
    color: #ffffff;
  }

  .case-link {
    font-size: 0.12rem;
    cursor: pointer;

    &.case-link-view {
      color: #70b8ff;
    }

    &.case-link-delete {
      color: #ff7a00;
    }
  }
}
</style>
