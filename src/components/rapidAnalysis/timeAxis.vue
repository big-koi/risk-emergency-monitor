<template>
  <div class="timeAxis">
    <!-- 时间轴 -->
    <!-- <img :class="isShouqi ? 'shouqiActive' : 'shouqi'" @click="shouqiClick" src="../../assets/images/thematic/shouqi.png" /> -->
    <div class="timeLine">
      <div class="timeLineBox">
        <div :class="switchOpen ? 'switchBtnStop' : 'switchBtn'" @click="handlerSwitch"></div>
        <div class="backward-left" @click="changeTimeBackward('start')">
          <a-icon type="step-backward" />
        </div>
        <div class="circle-left" @click="changeTime('cut', 'click')"></div>
        <div class="circle-right" @click="changeTime('add', 'click')"></div>
        <div class="line">
          <ul>
            <li :class="timeActive === index ? 'liActive' : ''"
              :style="'margin-right:' + (timeList.length > 1 ? (9.82 / (timeList.length - 1) - 0.12) : 0) + 'rem'" v-for="(item, index) in timeList"
              :key="item.time || index" @click="timePointClick(index, item.dateTime)">
              <div class="text">
                {{ item.date }}
              </div>
              <div class="time">
                {{ item.time }}
              </div>
              <img v-show="timeActive === index" src="../../assets/images/thematic/time_active.png" />
            </li>
          </ul>
        </div>
        <div class="forward-right" @click="changeTimeBackward('end')">
          <a-icon type="step-forward" />
        </div>
        <div class="left-arrow" @click="changeDate1('cut')" v-if="timeTabActive === 2">
          <div class="text">-1h</div>
        </div>
        <div class="left-arrow12" @click="changeDate2('cut')" v-if="timeTabActive === 2">
          <div class="text">-2h</div>
        </div>
        <div class="right-arrow-box">
          <div class="right-arrow12" @click="changeDate1('add')" v-if="timeTabActive === 2">
            <div class="text">+1h</div>
          </div>
        </div>
        <div class="right-arrow-box">
          <div class="right-arrow" @click="changeDate2('add')" v-if="timeTabActive === 2">
            <div class="text">+2h</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  props: {
    timeAxisShow: {
      type: Boolean,
      default: false,
    },
    timeTabActive: {
      type: Number,
      default: 1
    },
    timeData: {
      type: Array,
      default: () => [],
    }
  },
  data() {
    return {
      isShouqi: true,
      switchOpen: false,
      timeActive: 0,
      allDays: 0,
      currentDay: 0,
      allHours: 0,
      currentHour: 0,
      timeStart: 0,
      timeEnd: 10,
      timeList: [], // 时间轴时间
      timeValue: "",
      timeListAll: [], // 全部时间轴时间
      filename: "", // 当前文件名
      timerInterval: null, // 定时器引用
    };
  },
  methods: {
    /**
     * 可选的日期格式化方法
     * @param {Date} date - 需要格式化的日期对象
     * @returns {string} - 格式化后的日期字符串
     */
    dateFormat(date) {
      const pad = (num) => String(num).padStart(2, '0');
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1); // 月份从0开始
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    /**
     * 根据开始和结束时间，每六分钟生成一个时间戳或格式化后的时间字符串
     * @param {Date} startDate - 开始时间
     * @param {Date} endDate - 结束时间
     * @returns {Array<string>} - 返回格式化后的时间字符串数组
     */
    gainAllDateBetRange(startDate, endDate) {
      // 如果传入的参数不是 Date 实例，返回空数组
      if (!(startDate instanceof Date && endDate instanceof Date)) {
        return [];
      }

      const dateArr = [];
      const startTime = startDate.getTime(); // 获取开始时间的毫秒数
      const endTime = endDate.getTime(); // 获取结束时间的毫秒数
      const sixMinutesInMillis = 6 * 60 * 1000; // 六分钟的毫秒数

      for (let time = startTime; time <= endTime; time += sixMinutesInMillis) {
        const currentDate = new Date(time);
        dateArr.push(this.dateFormat(currentDate)); // 使用 dateFormat 方法格式化时间
      }
      return dateArr;
    },
    // 构建时间轴上上的点位
    initTimeLine() {
      if (this.timeData.length > 0) {
        this.timeActive = 0;
        this.timeStart = 0;
        this.timeEnd = 10;
        // let startDate = moment().format("YYYY-MM-DD HH:mm:ss");
        // let endDate = moment().add(3, "hours").format("YYYY-MM-DD HH:mm:ss");
        // this.timeListAll = this.gainAllDateBetRange(new Date(startDate),new Date(endDate));
        this.timeValue = this.timeData[0].time;
        this.filename = this.timeData[0].filename || this.timeData[0].fileName || "";
        // 优化：直接进行一次 map 操作
        this.timeListAll = this.timeData.map((item) => {
          // 确保 data 字段存在，避免 split 报错
          const dataStr = item.data || "";
          const parts = dataStr.split(" ");
          return {
            date: parts[0] || "",
            time: parts[1] || "",
            dateTime: dataStr,
            filename: item.filename || item.fileName || ""
          };
        });
        this.timeEnd = this.timeListAll.length > this.timeEnd ? this.timeEnd : this.timeListAll.length;
        this.timeList = this.timeListAll.slice(this.timeStart, this.timeEnd);
        this.$emit("updateDateTime", {
          data: this.timeList[0].dateTime,
          filename: this.timeList[0].filename,
          time: this.timeValue
        });
      } else {
        this.timeList = [];
        this.timeListAll = [];
        this.timeValue = "";
      }
    },
    // 点击时间轴上的点
    timePointClick(index = 0) {
      // 边界检查
      if (index < 0 || index >= this.timeList.length || this.timeList.length === 0) {
        return;
      }
      this.timeActive = index;
      const currentItem = this.timeList[index];
      this.$emit("updateDateTime", {
        data: currentItem.dateTime,
        filename: currentItem.filename,
        time: this.timeValue
      });
    },
    // 时间轴自动显示的开关钮操作
    handlerSwitch() {
      // 先清除之前的定时器，避免重复创建
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.switchOpen = !this.switchOpen;
      if (this.switchOpen) {
        this.changeTime("add");
        this.timerInterval = setInterval(() => {
          if (
            this.timeListAll.length > 10
              ? this.timeActive === 9
              : this.timeActive === this.timeListAll.length - 1
          ) {
            // 全部循环结束之后
            if (this.timeEnd === this.timeListAll.length) {
              this.switchOpen = false;
              clearInterval(this.timerInterval);
              this.timerInterval = null;
              return;
            }
          }
          this.changeTime("add");
        }, 500);
      }
    },
    // 时间轴加减1小时
    changeDate1(flag) {
      if (this.switchOpen) {
        this.handlerSwitch();
      }
      if (flag === "cut") {
        if (this.timeStart === 0) {
          return false
        } else {
          if (this.timeListAll[this.timeActive + this.timeStart]) {
            if (this.timeListAll[this.timeActive + this.timeStart - 10]) {
              this.timeActive = 0;
              this.timeEnd = this.timeActive + this.timeStart;
              this.timeStart = Math.max(0, this.timeActive + this.timeStart - 10);
            } else {
              // 所以timeActive要向后移
              this.timeActive = 0;
              this.timeEnd = this.timeListAll.length;
              this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
            }
          }
          this.changeCurrentTimeLine();
        }
      }

      if (flag === "add") {
        // 1小时后的时间有
        if (this.timeListAll[this.timeActive + this.timeStart + 10]) {
          if (this.timeListAll[this.timeActive + this.timeStart + 10 + 10]) {
            this.timeActive = 0;
            this.timeEnd = this.timeActive + this.timeStart + 10 + 10;
            this.timeStart = this.timeActive + this.timeStart + 10;
          } else {
            // 所以timeActive要向后移
            this.timeActive = 0;
            this.timeEnd = this.timeListAll.length;
            this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
          }
        } else {
          // 24小时后时间没有
          this.timeEnd = this.timeListAll.length;
          this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
          this.timeActive = 0;
        }
        this.changeCurrentTimeLine();
      }
      this.timePointClick(this.timeActive);
    },
    // 时间轴加减2小时
    changeDate2(flag) {
      if (this.switchOpen) {
        this.handlerSwitch();
      }
      if (flag === "cut") {
        if (this.timeStart === 0) {
          return false
        } else {
          if (this.timeListAll[this.timeActive + this.timeStart]) {
            if (this.timeListAll[this.timeActive + this.timeStart - 20]) {
              this.timeActive = 0;
              this.timeEnd = 10;
              this.timeStart = Math.max(0, this.timeActive + this.timeStart - 20);
            } else {
              // 所以timeActive要向后移
              this.timeActive = 0;
              this.timeEnd = this.timeListAll.length;
              this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
            }
          }
          this.changeCurrentTimeLine();
        }
      }

      if (flag === "add") {
        // 2小时后的时间有
        if (this.timeListAll[this.timeActive + this.timeStart + 20]) {
          if (this.timeListAll[this.timeActive + this.timeStart + 20 + 20]) {
            this.timeActive = 0;
            this.timeEnd = this.timeActive + this.timeStart + 10 + 19;
            this.timeStart = this.timeActive + this.timeStart + 20;
          } else {
            // 所以timeActive要向后移
            this.timeActive = 0;
            this.timeEnd = this.timeListAll.length;
            this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
          }
        } else {
          // 24小时后时间没有
          this.timeEnd = this.timeListAll.length;
          this.timeStart = this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
          this.timeActive = 0;
        }
        this.changeCurrentTimeLine();
      }
      this.timePointClick(this.timeActive);
    },
    // 时间轴向前向后切换一步
    changeTime(flag, isClick) {
      if (isClick === "click" && this.switchOpen) {
        this.handlerSwitch();
      }
      if (flag === "cut") {
        if (this.timeActive === 0) {
          if (this.timeStart === 0) {
            // 从整个时间轴开头，-1直接到整个时间轴末尾
            this.timeEnd = this.timeListAll.length;
            this.timeStart =
              this.timeListAll.length > 10 ? this.timeListAll.length - 10 : 0;
            this.timeActive =
              this.timeListAll.length > 10
                ? 9
                : Math.max(0, this.timeListAll.length - 1);
          } else {
            // 当前时间轴的开头，全部时间轴的中间
            this.timeEnd = Math.max(this.timeEnd - 1, 1);
            this.timeStart = Math.max(0, this.timeStart - 1);
            this.timeActive = 0;
          }
          this.changeCurrentTimeLine();
        } else {
          this.timeActive = Math.max(0, this.timeActive - 1);
        }
      }
      if (flag === "add") {
        if (
          this.timeListAll.length > 10
            ? this.timeActive === 9
            : this.timeActive === this.timeListAll.length - 1
        ) {
          // 全部循环结束之后
          if (this.timeEnd === this.timeListAll.length) {
            // 全部数据循环完，回到刚开始时候时间轴
            this.timeEnd =
              this.timeListAll.length > 10 ? 10 : this.timeListAll.length;
            this.timeStart = 0;
            this.timeActive = 0;
          } else {
            // 只是当前时间轴循环完，替换时间轴，相当于往前推移
            this.timeEnd = Math.min(this.timeEnd + 1, this.timeListAll.length);
            this.timeStart += 1;
            this.timeActive =
              this.timeListAll.length > 10 ? 9 : Math.max(0, this.timeListAll.length - 1);
          }
          this.changeCurrentTimeLine();
        } else {
          this.timeActive = Math.min(this.timeActive + 1, this.timeList.length - 1);
        }
      }
      this.timePointClick(this.timeActive);
    },
    // 重新给时间轴赋值
    changeCurrentTimeLine() {
      this.timeList = this.timeListAll.slice(this.timeStart, this.timeEnd);
    },
    changeTimeBackward(flag) {
      if (flag === "start") {
        this.timeActive = 0;
        this.timeEnd = Math.min(10, this.timeListAll.length);
        this.timeStart = 0;
      }
      if (flag === "end") {
        // 判断是不是积水深度过去三小时
        if (this.timeList.length === 3) {
          this.timeActive = 2;
        } else {
          this.timeActive = Math.min(9, this.timeListAll.length - 1);
        }
        this.timeEnd = this.timeListAll.length;
        // 防止计算出负数
        this.timeStart = Math.max(0, this.timeListAll.length - 10);
      }
      this.changeCurrentTimeLine();
      this.timePointClick(this.timeActive);
    }
  },
  watch: {
    // 监听 timeData 变化，自动初始化时间轴
    timeData: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.initTimeLine();
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    // 组件挂载时初始化时间轴
    if (this.timeData && this.timeData.length > 0) {
      this.initTimeLine();
    }
  },
  beforeDestroy() {
    // 组件销毁前清除定时器，防止内存泄漏
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
};
</script>
<style lang="less" scoped>
.timeAxis {
  /* .shouqiActive {
    position: fixed;
    bottom: 1.1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    cursor: pointer;
  }

  .shouqi {
    position: fixed;
    bottom: 0.3rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    cursor: pointer;
  } */

  .timeLine {
    position: fixed;
    bottom: 0.1rem;
    left: 0.2rem;
    // transform: translateX(-50%);
    z-index: 100;
    width: calc(100vw - 4.8rem);
    height: 1.36rem;
    // padding-right: 0.23rem;
    background: linear-gradient(0deg, #16446e 0%, #030c16);
    border: 0.5px solid;
    border-image: linear-gradient(270deg, #1b94ff 100%, #81c7ff 51%, #1996ff 0%) 0.5 0.5;
    // border-radius: 8px;
    box-shadow: 0px 0px 20px 0px #013f74 inset;
    padding-top: 0.2rem;

    .timeLineBox {
      position: relative;

      .switchBtn {
        position: absolute;
        top: -0.15rem;
        left: 0.35rem;
        width: 0.26rem;
        height: 0.26rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/play-icon.png");
        cursor: pointer;
      }

      .switchBtnStop {
        position: absolute;
        top: -0.15rem;
        left: 0.35rem;
        width: 0.26rem;
        height: 0.26rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/stop.png");
        cursor: pointer;
      }

      .circle-left {
        position: absolute;
        left: 1.17rem;
        top: -0.08rem;
        width: 0.18rem;
        height: 0.18rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/front-icon.png");
        color: #fff;
        line-height: 0.15rem;
        text-align: center;
        cursor: pointer;
        z-index: 9999;
      }

      .circle-right {
        position: absolute;
        right: 1rem;
        top: -0.08rem;
        width: 0.18rem;
        height: 0.18rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/after-icon.png");
        color: #fff;
        line-height: 0.15rem;
        text-align: center;
        cursor: pointer;
        z-index: 9999;
      }

      .line {
        // width: 9.82rem;
        height: 0.03rem;
        background: rgba(160, 208, 255, 0.56);
        border-radius: 0.02rem;
        margin-top: 0.26rem;
        margin-left: 1.5rem;
        margin-right: 1.3rem;

        ul {
          display: flex;
          justify-content: center;
        }

        li {
          position: relative;
          width: 0.12rem;
          height: 0.12rem;
          background: #C2E1FF;
          border: 0.02rem solid #C2E1FF;
          border-radius: 50%;
          box-shadow: 0rem 0.02rem 0.06rem 0rem rgba(50, 105, 246, 0.1);
          margin-right: 0.78rem;
          margin-top: -0.04rem;
          font-size: 0.12rem;
          font-weight: 600;
          text-align: center;
          color: #C2E1FF;
          cursor: pointer;

          &:last-child {
            margin-right: 0 !important;
          }

          .text {
            width: 0.8rem;
            margin-top: 0.2rem;
            margin-left: -0.35rem;
          }

          .time {
            //margin-top: -0.8rem;
            // margin-top: 0.5rem;
            margin-left: -0.22rem;
          }

          img {
            // position: absolute;
            // top: -0.12rem;
            // left: -0.07rem;
            position: absolute;
            top: -0.2rem;
            left: -0.07rem;
          }
        }

        .liActive {
          width: 2px;
          height: 0.18rem;
          background: none;
          border: none;
          border: 1px solid #fff;
          border-radius: 0;
        }
      }

      .left-arrow {
        position: relative;
        width: 0.48rem;
        height: 0.22rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/react-left.png");
        border-radius: 0.02rem;
        margin-left: 0.85rem;
        margin-top: 0.2rem;
        cursor: pointer;

        .text {
          position: absolute;
          left: 0.15rem;
          font-size: 0.12rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
          font-weight: 700;
          color: #fff;
          line-height: 0.22rem;
        }
      }

      .right-arrow {
        position: absolute;
        right: 0.68rem;
        top: 0.50rem;
        width: 0.5rem;
        height: 0.22rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/react-right.png");
        // margin-top: -0.2rem;
        cursor: pointer;

        .text {
          position: absolute;
          left: 0.05rem;
          font-size: 0.12rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
          font-weight: 700;
          color: #fff;
          line-height: 0.22rem;
        }
      }

      .left-arrow12 {
        position: relative;
        width: 0.48rem;
        height: 0.22rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/react-left.png");
        border-radius: 0.02rem;
        margin-left: 0.85rem;
        margin-top: 0.05rem;
        cursor: pointer;

        .text {
          position: absolute;
          left: 0.15rem;
          font-size: 0.12rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
          font-weight: 700;
          color: #fff;
          line-height: 0.22rem;
        }
      }

      .right-arrow12 {
        position: absolute;
        right: 0.68rem;
        top: 0.42rem;
        width: 0.5rem;
        height: 0.22rem;
        background-size: 100%;
        background-image: url("../../assets/images/thematic/react-right.png");
        margin-top: -0.2rem;
        cursor: pointer;

        .text {
          position: absolute;
          left: 0.05rem;
          font-size: 0.12rem;
          font-family: Alibaba PuHuiTi 3, Alibaba PuHuiTi 3-Bold;
          font-weight: 700;
          color: #fff;
          line-height: 0.22rem;
        }
      }

      .backward-left {
        position: absolute;
        left: 0.77rem;
        top: -0.08rem;
        width: 0.18rem;
        height: 0.18rem;
        background-size: 100%;
        color: #fff;
        line-height: 0.15rem;
        text-align: center;
        cursor: pointer;
        z-index: 9999;
        font-size: 18px;
      }

      .forward-right {
        position: absolute;
        right: 0.6rem;
        top: -0.08rem;
        width: 0.18rem;
        height: 0.18rem;
        background-size: 100%;
        color: #fff;
        line-height: 0.15rem;
        text-align: center;
        cursor: pointer;
        z-index: 9999;
        font-size: 18px;
      }
    }
  }
}
</style>
