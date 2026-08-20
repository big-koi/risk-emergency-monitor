/**
 * 案例收藏编排（打开/收藏/保存/删除）
 */
import moment from "moment";
import {
  buildOpenCaseCollectionPatch,
  buildCreateCasePanelPatch,
  buildShowCaseDetailsPatch,
  buildCloseCaseDetailsPatch,
  buildExpandCaseDetailsPatch,
  buildCollapseCaseDetailsPatch,
  buildOpenCaseListDetailsPatch,
  buildPrintStarPrep,
  buildStarCasePrep,
  planStarCollectFollowUp,
  buildSingleCollectPointParams,
  buildSingleCollectDataParams,
  buildSaveCaseRequest,
  buildAfterSaveCasePatch,
  formatCaseHistoryTaskTime,
  fetchCaseList,
  requestSingleCollect,
  requestSaveCase,
  requestDeleteCase,
  requestCreateCaseDraft
} from "../modules/caseCollection";

export const caseCollectionMixin = {
  methods: {
    //打开案例收藏的弹窗
    openCaseCollcetion() {
      Object.assign(
        this,
        buildOpenCaseCollectionPatch({
          detailsShow: this.isCaseCollectionDetailsShow,
          fullscreen: this.isCaseCollectionFullscreen
        })
      );
      this.getCaseAll();
    },
    printStarClick(print) {
      Object.assign(this, buildPrintStarPrep(print));
      const follow = planStarCollectFollowUp({
        detailsShow: this.isCaseCollectionDetailsShow,
        fullscreen: this.isCaseCollectionFullscreen,
        selectMode: "light"
      });
      if (follow.action === "addToCollection") {
        this.addCaseToCollection();
      } else {
        Object.assign(this, follow.selectPatch || {});
        this.getCaseAll();
      }
    },
    caseSelectChange(value) {
      this.caseSelectValue = value;
    },
    //单个收藏
    addCaseToCollection() {
      requestSingleCollect(
        buildSingleCollectPointParams({
          caseSelectValue: this.caseSelectValue,
          caseDetailsId: this.caseDetailsId,
          coordinatePoint: this.coordinatePoint,
          caseTaskId: this.caseTaskId,
          singleCollectType: this.singleCollectType,
          disasterTypeIndex: this.disasterTypeIndex
        })
      ).then(result => {
        if (result.ok) {
          this.$message.success(result.message);
          const caseMain = this.getCaseMainRef();
          if (caseMain) caseMain.getCaseInfoData();
        } else {
          this.$message.error(result.message);
        }
      });
    },
    createCase() {
      Object.assign(this, buildCreateCasePanelPatch());
      this.$nextTick(() => {
        if (this.getCaseMainRef()) {
          this.getCaseMainRef().resetCaseForm();
        }
      });
      this.getSaveCase_other();
    },
    getSaveCase_other() {
      requestCreateCaseDraft().then(result => {
        if (result.ok && result.data) {
          this.caseDetailsId = result.data;
        }
      });
    },
    closeCaseDetails() {
      Object.assign(this, buildCloseCaseDetailsPatch());
    },
    showScreenCaseDetails() {
      Object.assign(this, buildExpandCaseDetailsPatch());
    },
    hideScreenCaseDetails() {
      Object.assign(this, buildCollapseCaseDetailsPatch());
    },
    // 任务列表时间收藏案例
    starCase(item) {
      Object.assign(this, buildStarCasePrep(item));
      this.getCaseAll();
      const follow = planStarCollectFollowUp({
        detailsShow: this.isCaseCollectionDetailsShow,
        fullscreen: this.isCaseCollectionFullscreen
      });
      if (follow.action === "addToCollection") {
        this.addCaseToCollection();
      } else {
        Object.assign(this, follow.selectPatch || {});
      }
    },
    // 数据列表收藏
    starCaseData(item, type, yjlx) {
      requestSingleCollect(
        buildSingleCollectDataParams({
          caseDetailsId: this.caseDetailsId,
          item: item,
          type: type,
          yjlx: yjlx
        })
      ).then(result => {
        if (result.ok) {
          this.$message.success(result.message);
          const caseMain = this.getCaseMainRef();
          if (caseMain) caseMain.getCaseInfoData();
        } else {
          this.$message.error(result.message);
        }
      });
    },
    //获取案例列表
    getCaseAll() {
      fetchCaseList(this.caseSearchValue).then(result => {
        if (result.ok) {
          this.caseList = result.data || [];
        }
      });
    },
    //查看案例详情
    showCaseDetails(item) {
      Object.assign(this, buildShowCaseDetailsPatch(item.case_id));
    },
    handleSaveCase(type) {
      const caseMain = this.getCaseMainRef();
      if (!caseMain) {
        this.$message.error("案例详情未就绪");
        return;
      }
      const built = buildSaveCaseRequest(
        {
          form: caseMain.form,
          print: caseMain.dwTableData,
          history: caseMain.historyCaseList,
          cityData: caseMain.cityData,
          dataList: caseMain.dataList,
          caseDetailsId: this.caseDetailsId
        },
        dateVal =>
          moment(dateVal)
            .startOf("hour")
            .format("YYYY-MM-DD HH:mm:ss")
      );
      if (!built.valid) {
        this.$message.error(built.error || "请填写案例名称");
        return;
      }
      requestSaveCase(built.payload).then(result => {
        if (result.ok) {
          Object.assign(
            this,
            buildAfterSaveCasePatch({
              caseId: result.data,
              keepDetailsOpen: type
            })
          );
          this.$message.success(result.message);
          this.getCaseAll();
          const caseMainRef = this.getCaseMainRef();
          if (caseMainRef) caseMainRef.getCaseInfoData(result.data);
        } else {
          this.$message.error(result.message);
        }
      });
    },
    openCaseListDetails() {
      Object.assign(this, buildOpenCaseListDetailsPatch());
    },
    deleteCase(item, type) {
      this.$confirm({
        title: "提示",
        content: "确定要删除当前案例吗？",
        okText: "确认",
        cancelText: "取消",
        onOk: () => {
          return requestDeleteCase(item, type).then(result => {
            if (result.ok) {
              this.$message.success(result.message);
              this.getCaseAll();
            } else {
              this.$message.error(result.message);
            }
          });
        }
      });
    },
    caseHistoryTaskClick(item) {
      item.tasktime = formatCaseHistoryTaskTime(item.task_name);
    },
    seePrint(item) {
      const identifyRef = this.getIdentifyRef();
      if (identifyRef && typeof identifyRef.searchBackward === "function") {
        identifyRef.searchBackward(item.lon, item.lat);
      }
    }
  }
};

export default caseCollectionMixin;
