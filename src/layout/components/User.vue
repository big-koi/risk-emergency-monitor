<template>
  <div class="user-box">
    <!-- <div class="date-time">
      更新时间： {{ new Date().toLocaleString() }}
    </div> -->
    <!-- <i class="ver-line"></i> -->
    <!-- <span class="user-name" v-if="$store.getters.taskStatus"> {{ $store.getters.taskStatus }}</span>
    <img v-else src="@/assets/images/tishi.png" alt="" class="avatar"> -->
    <!-- <span class="user-name">管理员/</span> -->
    <i class="ver-line ver-line-2"></i>
    <span class="logout" @click="handlerLogout" v-if="isLogin">
      <a-icon type="poweroff" />
    </span>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import Axios from "axios";
export default {
  name: "User",
  data() {
    return {
      date: "",
      isLogin: false
    };
  },
  methods: {
    // 处理退出登录
    handlerLogout() {
      Cookies.remove("diit-token");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + "/fzweb/#/login";
      // this.$router.push("/login");
      // Cookies.remove("diit-token");
      // const xzqdm = window.sessionStorage.getItem("xzqdm");
      // if (process.env.NODE_ENV === "production") {
      //   if (xzqdm == "000000") {
      //     window.location.href = webConfig.jcWebAddress;
      //   } else if (xzqdm && xzqdm != "000000") {
      //     this.$router.push("/login");
      //   } else {
      //     window.location.href = webConfig.jcWebAddress;
      //   }
      // } else {
      //   if (xzqdm == "000000") {
      //     window.location.href = webConfig.jcWebAddress;
      //   } else if (xzqdm && xzqdm != "000000") {
      //     this.$router.push("/login");
      //   } else {
      //     window.location.href = webConfig.jcWebAddress;
      //   }
      // }
    }
  },
  mounted() {
    const vm = this;
    if(this.$route.query.isLogin){
      this.isLogin = this.$route.query.isLogin
    }
    // if (process.env.NODE_ENV === "production") {
    if (this.$route.query.token) {
      Axios({
        method: "post",
        url: servicesConfig.loginCheckUrl,
        data: {
          token: this.$route.query.token
        }
      })
        .then(res => {
          if (!res.data) {
            this.$router.push("/login");
            // window.open(webConfig.jcWebAddress);
          } else {
            this.$router.push("/");
            // Axios({
            //   method: "post",
            //   url: servicesConfig.loginCheckUrl + "GetUser",
            //   data: {
            //     token: this.$route.query.token
            //   }
            // })
            //   .then(response => {
            //     if (response.status !== 200) return;
            //     const str = response.data.substring(
            //       1,
            //       response.data.length - 1
            //     );
            //     const list = str.split(",");
            //     const trimmedList = list.map(v => v.trim());
            //     const obj = {};
            //     trimmedList.forEach(v => {
            //       const [key, str] = v.split("=");
            //       let value;
            //       switch (str) {
            //         case "null":
            //           value = null;
            //           break;
            //         case "undefined":
            //           value = undefined;
            //           break;
            //         case "0":
            //           value = 0;
            //           break;
            //         case "true":
            //           value = true;
            //           break;
            //         case "false":
            //           value = false;
            //           break;
            //         default:
            //           value = str;
            //           break;
            //       }
            //       obj[key] = value;
            //     });
            //     this.$store.dispatch("user/handlerUserParams", obj);
            //   })
            //   .catch(error => {
            //     console.log(error);
            //   });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    // }

    // const d = new Date()
    // const year = d.getFullYear()
    // const month = d.getMonth() + 1
    // const day = d.getDate()
    // this.date = `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    // const h = d.getHours();
    // const m = d.getMinutes();
    // const s = d.getSeconds();
    // const time = document.querySelector('#time-wrapper')
    // time.style.setProperty('--ds', s)
    // time.style.setProperty('--dm', m + s / 60)
    // time.style.setProperty('--dh', h + m / 60 + s / 3600)
  }
};
</script>

<style scoped lang="less">
.user-box {
  margin-left: auto;
  display: flex;
  align-items: center;
  color: #c2e1ff;

  .ver-line {
    position: relative;
    top: 0.03rem;
    display: inline-block;
    width: 0.02rem;
    height: 0.37rem;
    margin: 0 0.24rem;
    background: rgba(205, 233, 251, 0.32);

    &-2 {
      top: 0.01rem;
      height: 0.18rem;
    }
  }

  .avatar {
    margin-right: 0.12rem;
  }

  .logout {
    color: #1482d8;
    cursor: pointer;
  }

  .date-time {
    p {
      line-height: 1 !important;
      text-align: end;
      font-family: PangMenZhengDao;
    }
  }
}
</style>
<style>
@property --h {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

@property --m {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

@property --s {
  syntax: "<integer>";
  inherits: false;
  initial-value: 0;
}

.header-time {
  --step: 60s;
  display: grid;
  grid-template-columns: 0.33rem 0.12rem 0.33rem 0.12rem 0.33rem;
  align-items: center;
  font-size: 0.26rem;
}

.header-time > span {
  text-align: center;
}

.split {
  animation: shark 1s step-end infinite;
}

.hour::after {
  counter-reset: hour var(--h);
  content: counter(hour, decimal-leading-zero);
  animation: hour calc(var(--step) * 60 * 24) infinite steps(24);
  animation-delay: calc(-1 * var(--step) * var(--dh) * 60);
}

.minutes::after {
  counter-reset: minutes var(--m);
  content: counter(minutes, decimal-leading-zero);
  animation: minutes calc(var(--step) * 60) infinite steps(60);
  animation-delay: calc(-1 * var(--step) * var(--dm));
}

.seconds::after {
  counter-reset: seconds var(--s);
  content: counter(seconds, decimal-leading-zero);
  animation: seconds var(--step) infinite steps(60);
  animation-delay: calc(-1 * var(--step) * var(--ds) / 60);
}

@keyframes hour {
  to {
    --h: 24;
  }
}

@keyframes minutes {
  to {
    --m: 60;
  }
}

@keyframes seconds {
  to {
    --s: 60;
  }
}

@keyframes shark {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>
