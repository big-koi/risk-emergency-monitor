const servicesConfig = {
  // 后台接口地址
  // servicesUrl: 'http://apibe.top:7002/api',
  // servicesUrl: 'https://jcyj.ndrcc.org.cn:4019/waterlogging/api',
  // servicesUrl: 'http://192.9.100.97:7002/waterlogging/api',
  // servicesUrl: 'http://192.9.100.122:7002/waterlogging/api',
  // servicesUrl: 'http://192.168.16.242:7002/waterlogging/api',
  // servicesUrl: 'http://192.9.100.245:9091/',
  jczdUrl: 'http://172.16.4.212:6521/',
  // servicesUrl: 'http://117.147.213.220:8282/fzmx/',
  servicesUrl: 'http://60.30.25.215:8282/fzmx/',
  makerImgUrl: 'http://117.147.213.220:8282/fzmxweb/static/rapidAnalysis/',
  mapIid: '1788970791859',//第二个是咧
  loginCheckUrl: 'https://jcyj.ndrcc.org.cn:4001/ywgl/login/checkToken',
  // 登录
  login: {
    // url: 'http://192.9.30.248:31100/zuul/operation/login/ssologin'
    url: 'https://jcyj.ndrcc.org.cn:4001/ywgl/login/loginSDST'
  },
  WebServer: location.origin + location.pathname,
  defaultProxyPath: 'https://jcyj.ndrcc.org.cn:4001',
  jczdUrl: 'https://jcyj.ndrcc.org.cn:4001/iAOpenApiJs/iadevplayer.html',
};

window.servicesConfig = servicesConfig;
