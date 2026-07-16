<template>
  <div class="integration-page">
    <!-- 右上角退出登录 -->
    <div class="logout-wrap" @click="handlerLogout">
      <a-icon type="logout" />
      <span>退出登录</span>
    </div>
    <!-- 顶部标题栏 -->
    <div class="title-box">
      <h1 class="main-title">
        <img src="../../assets/images/integration/title.png" alt="title" class="title-img">
        <!-- <span class="title-highlight">洪涝</span>临灾仿真模拟预警系统 - 滚动运行 -->
      </h1>
    </div>

    <!-- 选择区域面板 -->
    <div class="region-panel">
      <div class="panel-header">
        <span class="panel-title">请选择</span>
        <span class="view-warning-link">查看预警情况 <a-icon type="forward" /></span>
      </div>

      <div class="nation-btn-wrap">
        <button
          class="region-btn nation-btn"
          :class="{ active: selectedRegion === '全国' }"
          @click="selectRegion('全国')"
        >
          全国
        </button>
      </div>

      <div class="hot-label">热门城市:</div>
      <div class="region-grid">
        <button
          v-for="item in regionList"
          :key="item.code"
          class="region-btn"
          :class="{ active: selectedRegion === item.name }"
          @click="selectRegion(item)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie';

export default {
  name: 'Integration',
  data() {
    return {
      selectedRegion: '全国',
      // 省/自治区/直辖市/特别行政区：name 名称，code 行政区划代码（6位）
      regionList: [
        { name: '北京市', code: '110000' },
        { name: '天津市', code: '120000' },
        { name: '河北省', code: '130000' },
        { name: '山西省', code: '140000' },
        { name: '内蒙古自治区', code: '150000' },
        { name: '辽宁省', code: '210000' },
        { name: '吉林省', code: '220000' },
        { name: '黑龙江省', code: '230000' },
        { name: '上海市', code: '310000' },
        { name: '江苏省', code: '320000' },
        { name: '浙江省', code: '330000' },
        { name: '安徽省', code: '340000' },
        { name: '福建省', code: '350000' },
        { name: '江西省', code: '360000' },
        { name: '山东省', code: '370000' },
        { name: '河南省', code: '410000' },
        { name: '湖北省', code: '420000' },
        { name: '湖南省', code: '430000' },
        { name: '广东省', code: '440000' },
        { name: '广西壮族自治区', code: '450000' },
        { name: '海南省', code: '460000' },
        { name: '重庆市', code: '500000' },
        { name: '四川省', code: '510000' },
        { name: '贵州省', code: '520000' },
        { name: '云南省', code: '530000' },
        { name: '西藏自治区', code: '540000' },
        { name: '陕西省', code: '610000' },
        { name: '甘肃省', code: '620000' },
        { name: '青海省', code: '630000' },
        { name: '宁夏回族自治区', code: '640000' },
        { name: '新疆维吾尔自治区', code: '650000' },
        { name: '香港特别行政区', code: '810000' },
        { name: '澳门特别行政区', code: '820000' },
        { name: '台湾省', code: '710000' }
      ]
    };
  },
  methods: {
    selectRegion(item) {
      const name = typeof item === 'string' ? item : (item && item.name);
      const code = item && item.code;
      this.selectedRegion = name || '全国';

      if (name === '全国' || !code) {
        // window.open(`http://127.0.0.1:8101/rapidAnalysis?xzqdm=000000`, '_blank');
        window.open(`${window.location.origin}/fzweb/rapidAnalysis`, '_blank');
        // this.$router.push('/rapidAnalysis');
        return;
      }

      // 写入行政区代码，供省级系统默认定位
      window.open(`${window.location.origin}/provinceWeb/#/?xzqdm=${code}`, '_blank');
      // this.$router.push({ path: '/rapidAnalysis', query: { xzqdm: code } });
    },
    handlerLogout() {
      Cookies.remove('diit-token');
      localStorage.clear();
      sessionStorage.clear();
      this.$router.push('/login');
    }
  }
};
</script>

<style lang="less" scoped>
.integration-page {
  min-height: 100vh;
  background: url(../../assets/images/integration/bg.png) no-repeat center center;
  background-size: cover;
  box-sizing: border-box;
  position: relative;
}

.logout-wrap {
  position: absolute;
  top: 24px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(64, 169, 255, 0.4);
  background: rgba(22, 65, 115, 0.5);
  transition: all 0.2s;
  &:hover {
    color: #fff;
    background: rgba(34, 95, 165, 0.8);
    border-color: rgba(64, 169, 255, 0.7);
  }
  .anticon {
    font-size: 16px;
  }
}

.title-box {
  margin-bottom: 48px;
  margin-left: 170px;
  .main-title {
    position: relative;
    display: inline-block;
    margin: 0;
    font-size: 42px;
    font-weight: 600;
    color: #fff;
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
    letter-spacing: 1px;
    margin-top: 20px;
    .title-highlight {
      position: relative;
      padding-right: 6px;
      &::before,
      &::after {
        content: '';
        position: absolute;
        bottom: -6px;
        width: 3px;
        height: 14px;
        background: linear-gradient(180deg, #1890ff, #40a9ff);
        border-radius: 2px;
      }
      &::before {
        left: 0;
      }
      &::after {
        left: 8px;
      }
    }
  }
}

.region-panel {
  max-width: 900px;
  padding: 28px 32px 36px;
  background: url(../../assets/images/integration/box-bg.png) no-repeat center center;
  background-size: 100% 100%;
  margin: 0 auto;
  // position: absolute;
  // top: 50%;
  // left: 50%;
  // transform: translate(-50%, -50%);
}

.panel-header {
  display: flex;
  margin-bottom: 20px;
  .panel-title {
    font-size: 22px;
    font-weight: 700;
    color: #fff;
  }
  .view-warning-link {
    font-size: 14px;
    color: #fff;
    text-decoration: none;
    opacity: 0.9;
    line-height: 40px;
    padding-left: 10px;
    // transition: opacity 0.2s;
    // &:hover {
    //   opacity: 1;
    //   text-decoration: underline;
    // }
  }
}

.nation-btn-wrap {
  margin-bottom: 20px;
  .nation-btn {
    min-width: 100px;
  }
}

.hot-label {
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px 16px;
}

.region-btn {
  padding: 10px 16px;
  font-size: 14px;
  color: #fff;
  background: rgba(22, 65, 115, 0.8);
  border: 1px solid rgba(64, 169, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  &:hover {
    background: linear-gradient(135deg, #43AFFF 0%, #167FFF 100%);
    border-color: #1890ff;
  }
  &.active {
    background: linear-gradient(135deg, #43AFFF 0%, #167FFF 100%);
    border-color: #1890ff;
  }
}
</style>
