<template>
  <div class="thematic-list">
    <!-- 列表 -->
    <div class="list-box">
      <div v-for="(t, i) in listData" class="list-item" :key="i">
        <dl class="cnt">
          <dd class="info">
            <p class="title" @click="handlerPosition(t)">
              <img src="../../assets/images/thematic/type-map-icon.png" />{{
                t.taskName
              }}
            </p>
            <a-row v-for="(j, k) in option.info.option" :key="`${i}-${k}`">
              <div v-for="(n, m) in j" :key="`${i}-${k}-${m}`">
                <a-col class="labelText" :span="n.labelSpan">{{ n.label }}：</a-col>
                <a-col class="value" :span="n.valueSpan">
                  {{
                    n.diy
                    ? handlerListVal(t, n)
                    : notEmpty(t[n.valField], n.value)
                  }}
                </a-col>
              </div>
            </a-row>
          </dd>
        </dl>
        <!-- 按钮组 -->
        <div class="btn-group">
          <div v-if="t.step == 0" class="btn-item" @click="handlerQuickAnalysis(t)">
            <img src="../../assets/images/thematic/edit1.png" />
            开始评估
          </div>
          <div v-if="t.step > 0 && t.step < 4" class="btn-item" @click="handlerQuickAnalysis(t)">
            <img src="../../assets/images/thematic/edit2.png" />
            继续评估
          </div>
          <div v-if="t.step == 4" class="btn-item" @click="handlerQuickAnalysis(t)">
            <img src="../../assets/images/thematic/result.png" />
            评估结果
          </div>
          <div class="border"></div>
          <a-popconfirm title="确定要删除吗？" @confirm="handlerDel(t)">
            <div class="btn-item">
              <img src="../../assets/images/thematic/delete1.png" />
              删除
            </div>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <a-pagination v-model="paging.pageNum" :page-size="paging.pageSize" :total="paging.total" show-quick-jumper size="small" show-size-changer :show-total="total => `总共 ${total} 条`" @change="pagingChange" @showSizeChange="pagingPageSizeChange" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import { list, getDates, deleteTask, getBoxCode, getGeoJson } from "../../api/task";
import { notEmpty, bubbleSort } from "../../utils";
import moment from "moment";

export default {
  name: "ThematicList",
  props: {
    option: {
      type: Object,
      default() {
        return {
          type: "",
          info: {
            option: [{}],
          },
        };
      },
    },
  },
  data() {
    return {
      // 后端地址
      servicesUrl: window.servicesConfig.servicesUrl,
      // 列表的数据
      listData: [],
      // 分页
      paging: {
        pageNum: 1,
        pageSize: 10,
        total: 0,
      },
      xzqdm: window.sessionStorage.getItem('xzqdm'),
      xzqName:'',
    };
  },
  computed: {
    ...mapState({
      filterParam: (state) => state.thematicAnalysis.listFilter,
    }),
  },
  watch: {
    filterParam() {
      this.paging.pageNum = 1;
      // 获取列表数据
      this.getListData();
    },
  },
  mounted() {
    // 获取列表数据
    this.getListData();

  },
  methods: {
    notEmpty,
    // 获取列表数据
    getListData(time, xzq) {
      let param = {
        'pageNum': this.paging.pageNum,
        'pageSize': this.paging.pageSize,
        'pgStartDate': time ? time[0] : "",
        'pgEndDate': time ? time[1] : "",
        'district': xzq || window.sessionStorage.getItem("xzqdm")
      }
      list(param).then((res) => {
        let data = res.data.records;
        this.paging.total = res.data.total;
        this.listData = data;
        this.listData.map((item) => {
          let value = JSON.parse(item.value);
          item.startDate =
            value.step < 1
              ? "-"
              : moment(value.startDate, "YYYYMMDDHH").format("YYYY-MM-DD HH");
          item.endDate =
            value.step < 1
              ? "-"
              : moment(value.endDate, "YYYYMMDDHH").format("YYYY-MM-DD HH");
        });
      });
      // 获取定位数据
      if (this.xzqdm != '000000') {
        // 调接口返回四至定位[]
        getBoxCode({xzqdm:this.xzqdm}).then(res => {
          if(res.code == 200) {
            this.xzqName = res.data.name
            sessionStorage.setItem("xzqName", this.xzqName);
            sessionStorage.setItem("xzqType", res.data.type);
            let centerList = res.data.box.split(',').map(Number)
            this.$emit("locate", {center:centerList});
            sessionStorage.setItem("xzqRange", centerList);
          }
        })
        getGeoJson({xzqdm:this.xzqdm}).then(res => {
            console.log('res=', res)
            sessionStorage.setItem('features', JSON.stringify(res.features[0]))
            // 先清空
            me.earth.layerManager.clearSelectLayer();
            // 绘制
            me.earth.zoomToFeatures([res.features[0]], {
              zoom: true,
              style: {
                lineColor: "red",
                fillColor: 'transparent'
              }
            });
            // 设置级别
            me.earth.map.getView().animate({ zoom: mapConfig.zoom * 1.5 || 9 });
        })
      }
    },
    // 处理定位
    handlerPosition(item) {
      this.$emit("locate", item);
    },
    // 处理快速评估
    handlerQuickAnalysis(item) {
      this.$router.push({
        path: "/rapidAnalysis",
        query: {
          taskId: item.id,
        },
      });
      sessionStorage.setItem("rapidAnalysisData", JSON.stringify(item));
    },
    // 处理删除
    handlerDel(item) {
      let param = {
        id: item.id,
      };
      deleteTask(param).then((res) => {
        if (res.code == 200) {
          this.$message.success("删除成功");
          this.getListData();
        } else {
          this.$message.success("删除失败");
        }
      });
    },
    // 处理列表的值
    handlerListVal(item, param) {
      let valField = param.valField;
      let reg = new RegExp("(?<={)(.+?)(?=})", "g");
      let result = param.valField.match(reg);
      result.forEach((t) => {
        valField = valField.replace(`{${t}}`, item[t]);
      });
      return valField;
    },
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
  },
};
</script>

<style scoped lang="less">
.thematic-list {
  height: calc(100vh - 0.5rem);
  margin: 0.12rem 0 0 0.15rem;
  background-color: #fff;
  // box-shadow: 0px 2px 8px 0px rgb(0 0 0 / 12%);
}

.list-box {
  height: calc(100% - 1.6rem);
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0.08rem;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 0.35rem;
  }
}

.list-item {
  width: 4.9rem;
  // margin-top: 0.14rem;
  // border-radius: 0.08rem;
  // box-shadow: 0 0.02rem 0.05rem 0 rgba(0, 0, 0, 0.12);
  background-color: #fff;
  padding-bottom: 0.22rem;
  border: 1px solid #e0e0e0;

  &:first-of-type {
    margin-top: 0;
  }

  .cnt {
    display: flex;
    align-items: center;
    padding: 0.16rem;
  }

  .icon {
    position: relative;
    width: 1.28rem;
    height: 1.28rem;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-image: url("../../assets/images/map.png");

    img {
      position: absolute;
      top: 0;
      right: 0;
      width: 0.47rem;
    }
  }

  .info {
    width: 100%;
    // margin-left: 0.15rem;

    .ant-row {
      line-height: 0.3rem;
    }
  }

  .title {
    position: relative;
    padding-left: 0.12rem;
    margin-bottom: 0.06rem;
    font-size: 0.17rem;
    color: #368afb;
    letter-spacing: 0.01rem;
    // font-weight: bold;
    cursor: pointer;

    img {
      width: 0.2rem;
      margin-right: 0.1rem;
    }
  }

  // .title:before {
  //   content: "";
  //   position: absolute;
  //   left: 0;
  //   transform: translate(-16px, 5px);
  //   -webkit-transform: translate(-16px, 5px);
  //   width: 0.03rem;
  //   height: 0.14rem;
  //   background-color: #1270e9;
  // }

  .labelText {
    text-align: right;
    font-size: 0.14rem;
    color: #333;
  }

  .value {
    font-size: 0.14rem;
    // font-weight: bold;
    color: #333;
  }

  .labelText,
  .value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-group {
    display: flex;
    align-items: center;
    padding: 0 0.4rem;
    justify-content: space-between;

    .btn-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.16rem;
      height: 0.3rem;
      text-align: center;
      font-size: 0.14rem;
      background-color: #f1f8fe;
      color: #717273;
      border: 1px dashed #d7e8f9;
      line-height: 0.3rem;
      cursor: pointer;
      border-radius: 0;

      img {
        width: 0.18rem;
        margin-right: 0.05rem;
      }
    }

    .kspg-btn {
      background: #f1f8fe;
      border: 1px dashed #b6dafe;
      margin-right: 0.26rem;
      color: #1270e9;
    }

    .jxpg-btn {
      background: #eff8f0;
      border: 1px dashed #22b43e;
      margin-right: 0.26rem;
      color: #22b43e;
    }

    .pgjg-btn {
      background: #fff9f2;
      border: 1px dashed #fc982a;
      margin-right: 0.26rem;
      color: #fc982a;
    }

    .delete-btn {
      background: #fff1f0;
      border: 1px dashed #ffa0a0;
      color: #ff3e34;
    }

    .border {
      width: 0.01rem;
      height: 0.16rem;
      background: #fff;
    }
  }
}

// .list-item:before{
//   content: '';
//   position: absolute;
//   left: 0;
//   transform: translate(15px, 7px);
//   -webkit-transform: translate(15px, 7px);
//   width: 0.03rem;
//   height: 0.14rem;
//   background-color: #1270E9;
// }

.ant-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0.5rem;
  // background: #fff;
  margin-top: 0.1rem;
  text-align: center;
}
</style>
