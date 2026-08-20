/**
 * 内涝 / 山洪 未来·过去三小时 Tab
 */
export const floodPeriodTabMixin = {
  methods: {
    csnlTabCheck(data) {
      this.csnlValue = data.target.value;
      this.nlChange = 0;
      this.nlCount = 0;
      this.nlData = [];
      this.tabDisasterType(3);
      if (this.isMapType) {
        this.$refs.threeMap.clearEffect();
      }
      this.nlthreeCreated = 1;
      if (data.target.value == 1) {
        this.gqsxstl = true;
        this.timeTabActive = 2;

        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: "center"
          });
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }

        this.rankingListTitle = "城市内涝最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（未来三小时）";
        // this.tabDisasterType(3);
      } else {
        this.timeTabActive = 1;
        // 过去3小时
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop();
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.disasterTypeIndex = 3;
        this.rankingListTitle = "城市内涝最大积水深度排行（过去三小时）";
        this.statisticsChartTitle = "城市内涝最大积水深度统计（过去三小时）";
        this.isTaskListBtn = true;
        this.getTaskList(4);
        this.gqsxstl = false;
      }
    },
    shTabCheck(data) {
      this.shValue = data.target.value;
      this.nlChange = 0;
      this.nlCount = 0;
      this.nlData = [];
      this.tabDisasterType(4);
      this.timeTabActive = Number(data.target.value);

      if (this.nlColumns.length == 5) {
        this.nlColumns.pop();
        this.nlColumns.push({
          title: "",
          key: "star",
          dataIndex: "star",
          align: "center",
          scopedSlots: { customRender: "star" },
          width: 50
        });
      }
      if (data.target.value == 1) {
        this.gqsxstl = true;
        this.timeTabActive = 2;
        if (this.nlColumns.length == 4) {
          this.nlColumns.push({
            title: "预警等级",
            key: "yjlevel",
            scopedSlots: { customRender: "yjlevel" },
            align: "center"
          });
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.rankingListTitle = "山洪最大积水深度排行（未来三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（未来三小时）";
      } else {
        this.gqsxstl = false;
        this.timeTabActive = 1;
        if (this.nlColumns.length == 5) {
          this.nlColumns.pop();
          this.nlColumns.push({
            title: "",
            key: "star",
            dataIndex: "star",
            align: "center",
            scopedSlots: { customRender: "star" },
            width: 50
          });
        }
        this.rankingListTitle = "山洪最大积水深度排行（过去三小时）";
        this.statisticsChartTitle = "山洪最大积水深度统计（过去三小时）";
      }
    },
  }
};

export default floodPeriodTabMixin;
