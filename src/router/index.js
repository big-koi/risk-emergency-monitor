import router from "./router";
import Cookies from "js-cookie";

// 获取 url 查询参数（无 ? 时返回空对象，避免 split 报错）
function getUrlParams(url) {
  const qs = url.split("?")[1];
  if (!qs) return {};
  const paramsObj = {};
  qs.split("&").forEach(param => {
    const [key, value] = param.split("=");
    if (key) paramsObj[key] = value == null ? "" : value;
  });
  return paramsObj;
}

const urlParams = getUrlParams(window.location.href);
const urlXzqdm = urlParams.xzqdm || "";
const storedXzqdm = window.localStorage.getItem("xzqdm");
const sessionXzqdm = window.sessionStorage.getItem("xzqdm");
// session 为全国/根区划 000000 时，允许用 URL 上的 xzqdm 写入 localStorage（含覆盖已有本地值）
const allowSyncFromUrlBySession = sessionXzqdm === "000000";

// 本地无行政区划代码时从 URL 同步；或 session 为 000000 且 URL 带 xzqdm 时同步
if (urlXzqdm && (!storedXzqdm || allowSyncFromUrlBySession)) {
  window.localStorage.setItem("xzqdm", urlXzqdm);
} else if (storedXzqdm && urlXzqdm && urlXzqdm !== storedXzqdm) {
  // URL 与本地不一致时如需以 URL 为准，取消下一行注释
  // window.localStorage.setItem("xzqdm", urlXzqdm);
  window.location.href = window.location.href.replace(`xzqdm=${urlXzqdm}`, `xzqdm=${storedXzqdm}`);
}


// 白名单
// const whiteList = ["/login","/rapidAnalysis"];

// let getParams = url => {
//   let arr = url.split("?");
//   if(arr.length > 1) {
//     let params = arr[1].split("&");
//     let obj = {};
//     for (let i = 0; i < params.length; i++) {
//       let param = params[i].split("=");
//       obj[param[0]] = param[1];
//     }
//     return obj;
//   } else {
//     return {}
//   }
// };
// if (getParams(window.location.hash).xzqdm) {
//   sessionStorage.setItem('xzqdm', getParams(window.location.hash).xzqdm)
// }
// const token3 = getParams(window.location.hash).token;
// router.beforeEach((to, from, next) => {
//   // const token = Cookies.get('diit-token');
//   let token = localStorage.getItem("token");
//   const token2 = sessionStorage.getItem("token");
//   token = token || token2 || token3 ;
//   // 此处是屏蔽登录路由
//   // if(to.path === '/'){
//   //   next({path: '/task'});
//   // }else{
//   //   next();
//   // }
//   // 此处是带有登录的路由
//   if (to.path === "/") {
//     if (token) {
//       next({ path: "/rapidAnalysis" });
//     } else {
//       next({ path: "/login" });
//     }
//   } else {
//     if (token) {
//       // 已登录 随便进
//       next();
//     } else if (to.query.token && to.query.login) {
//       next();
//     } else {
//       // 没登录
//       if (whiteList.includes(to.path)) {
//         // 白名单随便进
//         next();
//       } else {
//         // 否则都重定向到登录页
//         next({ path: "/login", query: { redirect: to.path } });
//       }
//     }
//   }
// });

// router.beforeEach((to, from, next) => {
//   // const token = Cookies.get('diit-token');
//   let token = localStorage.getItem("token");
//   // 此处是屏蔽登录路由
//   // if(to.path === '/'){
//   //   next({path: '/task'});
//   // }else{
//   //   next();
//   // }
//   // 此处是带有登录的路由
//   if (to.path === "/") {
//     if (token) {
//       next({ path: "/rapidAnalysis" });
//     } else {
//       next({ path: "/login" });
//     }
//   } else {
//     if (token) {
//       // 已登录 随便进
//       next();
//     } else if (to.query.token) {
//       next();
//     } else {
//       // 没登录
//       if (whiteList.includes(to.path)) {
//         // 白名单随便进
//         next();
//       } else {
//         // 否则都重定向到登录页
//         next({ path: "/login", query: { redirect: to.path } });
//       }
//     }
//   }
// });
