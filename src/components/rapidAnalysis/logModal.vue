<template>
  <div class="logModal">
    <div :class="layoutValue=='bottom'?'modal':'modalMiddle'" v-drag draggable="true">
      <div class="header">
        <div class="title">日志详情</div>
        <div class="operation">
          <img @click="layout=!layout" src="../../assets/images/thematic/more.png">
          <img @click="closeLog" src="../../assets/images/thematic/close2.png">
          <div class="layout" v-show="layout">
            <img v-show="layoutValue!='middle'" @click="switchLayout('middle')" src="../../assets/images/thematic/fuzhi.png">
            <img v-show="layoutValue=='middle'" @click="switchLayout('middle')" src="../../assets/images/thematic/fuzhi2.png">
            <img v-show="layoutValue!='bottom'" @click="switchLayout('bottom')" src="../../assets/images/thematic/window.png">
            <img v-show="layoutValue=='bottom'" @click="switchLayout('bottom')" src="../../assets/images/thematic/window2.png">
          </div>
        </div>
      </div>
      <a-spin :spinning="loading">
        <div class="content" v-html="logMessage"></div>
      </a-spin>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      layout: false,
      layoutValue: "bottom",
      logMessage: "",
      SSEsource: "",
    };
  },
  //自定义指令
  directives: {
    drag: {
      // 指令的定义
      bind: function (el) {
        let oDiv = el; // 当前元素
        // let self = this // 上下文
        // 禁止选择网页上的文字
        document.onselectstart = function () {
          return false;
        };
        oDiv.onmousedown = function (e0) {
          // 鼠标按下，计算当前元素距离可视区的距离
          let disX = e0.clientX - oDiv.offsetLeft;
          let disY = e0.clientY - oDiv.offsetTop;
          document.onmousemove = function (e) {
            // 通过事件委托，计算移动的距离
            let l = e.clientX - disX;
            let t = e.clientY - disY;
            // 移动当前元素
            oDiv.style.left = l + "px";
            oDiv.style.top = t + "px";
          };
          document.onmouseup = function (e) {
            document.onmousemove = null;
            document.onmouseup = null;
          };
          // return false不加的话可能导致黏连，就是拖到一个地方时div粘在鼠标上不下来，相当于onmouseup失效
          return false;
        };
      },
    },
  },
  created() {
    const taskInfo = JSON.parse(window.sessionStorage.getItem("taskInfo"));
    const that = this;
    if (window.EventSource) {
      this.loading = true;
      // 建立连接
      that.SSEsource = new EventSource(
        `${window.servicesConfig.servicesUrl}/v1/logger/subscribe?taskId=${taskInfo.taskId}`
      );

      that.SSEsource.onopen = function (event) {
        console.log("SSE链接成功");
      };

      that.SSEsource.onmessage = function (event) {
        console.log(event);
        if (event.data) {
          that.loading = false;
          that.logMessage = event.data;
          //    console.log('后端返回的数据:', event.data);
        }
      };
      that.SSEsource.onerror = (error) => {
        if (e.readyState == EventSource.CLOSED) {
          console.log("连接关闭");
        } else {
          console.log("onerror:" + e.readyState);
        }
      };
    } else {
      this.$message.warning("你的浏览器不支持SSE");
    }
    // if (typeof WebSocket === "undefined") {
    //   this.$message.warning("您的浏览器不支持socket");
    // } else {
    //   const taskInfo = JSON.parse(window.sessionStorage.getItem("taskInfo"));
    //   const path = `ws://${window.servicesConfig.servicesUrl.replace(
    //     "http://",
    //     ""
    //   )}/v1/logger/subscribe?taskId=${taskInfo.taskId}`;
    //   // 实例化socket
    //   this.socket = new WebSocket(path);
    //   // 监听socket连接
    //   this.socket.onopen = this.open;
    //   // 监听socket错误信息
    //   this.socket.onerror = this.error;
    //   // 监听socket消息
    //   this.socket.onmessage = this.getMessage;
    // }
  },
  methods: {
    closeLog() {
      this.$parent.showLogModal = false;
      this.layout = false;
    },
    // 切换弹窗形式
    switchLayout(param) {
      this.layout = false;
      this.layoutValue = param;
    },
    // websocket
    open() {
      console.log("socket连接成功");
    },
    error() {
      console.log("socket连接失败");
    },
    getMessage(msg) {
      console.log(msg.data);
    },
    send(param) {
      this.socket.send(param);
    },
    close() {
      console.log("socket已经关闭");
    },
  },
  beforeDestroy() {
    if (this.SSEsource) {
      // 关闭SSE
      this.SSEsource.close();
      this.SSEsource = null;
    }
  },
};
</script>
<style lang="less" scoped>
.logModal {
  display: flex;
  justify-content: center;
  align-items: center;
  .modal {
    position: fixed;
    bottom: 0;
    width: 98%;
    height: 400px;
    background: #fff;

    z-index: 998;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 40px;
      background: #1b63e1;
      padding: 0 10px;
      line-height: 40px;
      color: #fff;
      font-size: 18px;
      img {
        cursor: pointer;
        margin-right: 10px;
      }
      .operation {
        position: relative;
        .layout {
          position: absolute;
          right: 40px;
          top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #ccc;
          background: #fff;
          padding: 0 10px;
          padding-right: 0;
          z-index: 999;
        }
      }
    }
    .content {
      height: calc(400px - 40px);
      padding: 10px;
      overflow: auto;
    }
  }
  .modalMiddle {
    position: fixed;
    top: 15%;
    width: 900px;
    height: 600px;
    background: #fff;
    // margin-left: 50%;
    // transform: translate(-50%, -50%);
    z-index: 998;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 40px;
      background: #1b63e1;
      padding: 0 10px;
      line-height: 40px;
      color: #fff;
      font-size: 18px;
      img {
        cursor: pointer;
        margin-right: 10px;
      }
      .operation {
        position: relative;
        .layout {
          position: absolute;
          right: 40px;
          top: 50px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          border: 1px solid #ccc;
          padding: 0 10px;
          padding-right: 0;
          z-index: 999;
        }
      }
    }
    .content {
      padding: 10px;
      height: calc(600px - 40px);
      overflow: auto;
    }
  }
}
</style>