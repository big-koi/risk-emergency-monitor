<template>
  <div class="login" style="width: 100%; height: 100%;">
    <!-- <video src="../assets/video/loginVideo.mp4" autoplay loop muted class="video-bg"></video> -->
    <div class="title-box">
      <h2>洪涝临灾仿真模拟预警系统</h2>
      <h4>-滚动运行</h4>
    </div>
    <!-- 正文 -->
    <div class="login-warp">
      <!-- 主体部分 -->
      <div class="login-main">
        <!-- 欢迎 -->
        <p class="welcome">欢迎登录</p>
        <!-- 表单 -->
        <a-form-model ref="loginForm" :model="form" :rules="rules">
          <!-- 账号 -->
          <a-form-model-item label="" :colon="false" prop="account">
            <a-input v-model="form.account" placeholder="请输入用户名">
              <a-icon slot="prefix" type="user" />
            </a-input>
          </a-form-model-item>
          <!-- 密码 -->
          <a-form-model-item label="" :colon="false" prop="password">
            <a-input-password
              v-model="form.password"
              password
              placeholder="请输入密码"
            >
              <a-icon slot="prefix" type="lock" />
            </a-input-password>
          </a-form-model-item>
        </a-form-model>
        <!-- 登陆按钮 -->
        <a-button
          class="login-btn"
          type="primary"
          block
          :loading="btnLoading"
          @click="handlerLogin"
        >
          登录
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
// import JSEncrypt from '../utils/jsencrypt.min.js'
import { login } from "../api/login";
import Cookies from "js-cookie";

export default {
  name: "login",
  data() {
    return {
      form: {
        // 账号
        account: "",
        // 密码
        password: ""
      },
      // 规则
      rules: {
        // 账号
        account: [{ required: true, message: "请输入账号" }],
        // 密码
        password: [{ required: true, message: "请输入密码" }]
      },
      // 登录按钮的loading
      btnLoading: false
    };
  },
  methods: {
    // 处理登录
    handlerLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        let params = new FormData();
        let encryptPwd = this.encrypt(this.form.password);
        params.append("userid", this.form.account);
        params.append("password", encryptPwd);
        this.btnLoading = true;
        login(params).then(res => {
          let data = res.data;
          this.btnLoading = false;
          if (res.code != 200)
            return this.$notification.error({
              message: "输入的用户名或密码错误，请重新输入"
            });
          if (res.code == 200) {
            this.$notification.success({ message: "登录成功" });
            Cookies.set("diit-token", data.token, { expires: 1 });
            localStorage.setItem("token", data.token);
            sessionStorage.setItem("token", data.token);
            let token1 = data.user.userDesc ? data.user.userDesc : "000000";
            sessionStorage.setItem("xzqdm", token1);
            this.$store.dispatch("user/handlerUserParams", data.user);
            // this.$router.push('/task')
            // if (this.$route.query.redirect) {
            //   this.$router.push({
            //     path: this.$route.query.redirect
            //   }).catch(() => {
            //   });
            // } else {
            this.$router.push({
              path: "/rapidAnalysis",
              query: {
                token: data.token
              }
            });
            // }
          }
        });
      });
    },
    encrypt(word) {
      let jsencrypt = new JSEncrypt();
      let publicKey =
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCXeBkmAr/ZVij+cvWiiiP/R0ScyHZ6MeNGc/b3Rc1KgynzY7hJuw7OFIGXvAzTv8Dx12Dpzg3vAdguPEm0aeXiOuMf7bjIxh12gsa3c5e9LitmumrQEWDhFGIU6c0AXt/M6OYa2H93i34zCvQ9F1zwt0RiUiI0wq6p3ja3VhHfUQIDAQAB";
      jsencrypt.setPublicKey(publicKey);
      let str = word;
      let signdata = this.encryptLong(str, jsencrypt);
      return signdata;
    },
    encryptLong(string, jsencrypt) {
      let k = jsencrypt;
      try {
        let lt = "";
        let ct = "";
        //RSA每次加密117bytes，需要辅助方法判断字符串截取位置
        //1.获取字符串截取点
        let bytes = new Array();
        bytes.push(0);
        let byteNo = 0;
        let len, c;
        len = string.length;
        let temp = 0;
        for (let i = 0; i < len; i++) {
          c = string.charCodeAt(i);
          if (c >= 0x010000 && c <= 0x10ffff) {
            byteNo += 4;
          } else if (c >= 0x000800 && c <= 0x00ffff) {
            byteNo += 3;
          } else if (c >= 0x000080 && c <= 0x0007ff) {
            byteNo += 2;
          } else {
            byteNo += 1;
          }
          if (byteNo % 117 >= 114 || byteNo % 117 == 0) {
            if (byteNo - temp >= 114) {
              bytes.push(i);
              temp = byteNo;
            }
          }
        }
        //2.截取字符串并分段加密
        if (bytes.length > 1) {
          for (let i = 0; i < bytes.length - 1; i++) {
            let str;
            if (i == 0) {
              str = string.substring(0, bytes[i + 1] + 1);
            } else {
              str = string.substring(bytes[i] + 1, bytes[i + 1] + 1);
            }
            let t1 = k.encrypt(str);
            ct += t1;
          }
          if (bytes[bytes.length - 1] != string.length - 1) {
            let lastStr = string.substring(bytes[bytes.length - 1] + 1);
            ct += "@" + k.encrypt(lastStr);
          }
          // return hexToBytes(ct);
          return ct;
        }
        let t = k.encrypt(string);
        //  let y = hexToBytes(t);
        return t;
      } catch (ex) {
        return false;
      }

      //十六进制转字节
      function hexToBytes(hex) {
        for (let bytes = [], c = 0; c < hex.length; c += 2)
          bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
      }

      // 字节转十六进制
      function bytesToHex(bytes) {
        for (let hex = [], i = 0; i < bytes.length; i++) {
          hex.push((bytes[i] >>> 4).toString(16));
          hex.push((bytes[i] & 0xf).toString(16));
        }
        return hex.join("");
      }
    }
  }
};
</script>

<style scoped lang="less">
.login {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  // background-color: #568ef8;
  background: url(../assets/images/login/login_bg.png) no-repeat center center;
  background-size: 100% 100%;
  .video-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    background-color: #000;
  }
  .title-box{
    position: absolute;
    top: 40px;
    left: 150px;
    h2{
      font-size: 64px;
      font-weight: 400;
      font-family: YouSheBiaoTiHei;
      // text-shadow: 4px 4px rgba(19,80,143,0.66);
      background-image: linear-gradient(to bottom, #ffffff, #e9f8ff, #77baff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    h4{
      font-size: 50px;
      font-weight: 400;
      font-family: YouSheBiaoTiHei;
      // text-shadow: 4px 4px rgba(19,80,143,0.66);
      background-image: linear-gradient(to bottom, #ffffff, #e9f8ff, #77baff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  }
}

.login-warp {
  position: absolute;
  top: 50%;
  right: 88px;
  z-index: 2;
  display: flex;
  width: 460px;
  height: 600px;
  transform: translateY(-50%);
  background: url(../assets/images/login/login_main_bg.png) no-repeat center
   center;
  background-size: 100% 100%;
  // background-color: #fff;
}

.login-main {
  width: 100%;
  height: 100%;
  padding: 130px 80px;
  .welcome {
    font-size: 48px;
    font-family: Alibaba PuHuiTi 2.0, Alibaba PuHuiTi 2.0-Bold;
    font-weight: Bold;
    text-align: left;
    color: #ffffff;
    line-height: 67px;
    background: url(../assets/images/login/welcome_bg.png) no-repeat left bottom;
  }

  .title {
    margin-top: 0.28rem;
    font-size: 0.34rem;
    color: #333;
    font-weight: bold;
  }

  .ant-form {
    margin-top: 0.4rem;

    /deep/ .ant-input{
      border: 0;
      color: #ffffff;
      height: 52px;
      padding-left: 0.42rem !important;
      font-size: 18px;
      border-radius: 6px;
      background: rgba(104,152,205,0.35);
    }

    /deep/ .has-error .ant-input-affix-wrapper .ant-input, /deep/ .has-error .ant-input-affix-wrapper .ant-input:hover{
      background: rgba(104,152,205,0.35);
      border-radius: 6px;
      border: 0;
    }

    /deep/ .ant-form-item-label > label {
      font-size: 0.22rem;
      color: #ffffff;

      &::before {
        display: none;
      }
    }

    /deep/ .ant-form-item-control-wrapper {
      height: 0.68rem;
      margin-top: 0.1rem;
    }

    .ant-form-item {
      &:not(:first-of-type) {
        margin-top: 0.2rem;
      }
    }

    .anticon {
      font-size: 18px;
      color: #ffffff;
    }

    /deep/ .ant-input-password-icon{
      font-size: 18px;
      color: #ffffff;
    }

    /deep/ .has-error .ant-form-explain, /deep/ .has-error .ant-form-split{
      color: #ffffff;
      padding-top: 10px;
    }
  }

  .login-btn {
    height: 52px;
    margin-top: 67px;
    font-size: 20px;
    font-weight: bold;
    // background-color: #3a63ff;
    background: linear-gradient(123deg,#43afff 1%, #0e67d4 86%);
    border: 0;
    border-radius: 6px;
  }
}
</style>
