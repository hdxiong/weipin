const network = require("../../../utils/network.js")
const utils = require("../../../utils/util.js")
const commonApi = require("../../../utils/commonApi.js")
const app = getApp()
const companyId = app.globalData.companyId
const paramObj = { companyId: companyId, type: 2 }

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    basic: null,
    jobpref: null,
    link: null,
    myEvaluation: null,
    certList: [],
    educationHistoryList:[],
    languageList: [],
    prizeList: [],
    projectList: [],
    skillList: [],
    workHistoryList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    options.fansId = getApp().globalData.fansId
    this.setData({
      options:options
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAllResume()
    
  },
  /**
   * 获取个人档案
   */
  getAllResume: function () {
    let _this = this;
    let param = {
      quickSpFansId: getApp().globalData.fansId, 
    }
    network.post("/api.do", {
      method: "weiPinSp/getAllResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
         _this.setData({
           basic:res.data.basic,
           jobpref: res.data.jobpref,
           link: res.data.link,
           myEvaluation: res.data.myEvaluation,
           certList: res.data.certList,
           educationHistoryList: res.data.educationHistoryList,
           languageList: res.data.languageList,
           prizeList: res.data.prizeList,
           projectList: res.data.projectList,
           skillList: res.data.skillList,
           workHistoryList: res.data.workHistoryList,
         })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  }, 
  /**
   * 跳转到工作经历编辑页
   */
  workHistory: function (e) {
    let itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `../editWork/editWork?itemId=${itemId}&fansId=${this.data.options.fansId}`,
    })
  },
  /**
   * 跳转到教育经历编辑页
   */
  editEducation: function (e) {
    let itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `../editEducation/editEducation?itemId=${itemId}&fansId=${this.data.options.fansId}`,
    })
  },
  /**
   * 跳转到项目经历编辑页
   */
  editProject: function (e) {
    let itemId = e.currentTarget.dataset.itemid;
    wx.navigateTo({
      url: `../editProject/editProject?itemId=${itemId}&fansId=${this.data.options.fansId}`,
    })
  },
  /**
   * 跳转到语言等编辑页面
   */
  goEdit: function (e) {
    let page = e.currentTarget.dataset.page
    wx.navigateTo({
      url: `../${page}/${page}?fansId=${this.data.options.fansId}`,
    })
  },
  /**
  * 立即投递
  */
  goDelivery: function (e) {
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let _this = this, _data = this.data;
    let param = {
      interviewResumeInfo: {
        positionId:  _data.options.positionId,
        basic: _data.basic,
        jobpref: _data.jobpref,
        link: _data.link,
        myEvaluation: _data.myEvaluation,
        certList: _data.certList,
        educationHistoryList: _data.educationHistoryList,
        languageList: _data.languageList,
        prizeList: _data.prizeList,
        projectList: _data.projectList,
        skillList: _data.skillList,
        workHistoryList: _data.workHistoryList,
        resumeFrom:'18'
      },
      quickSpFansId: _data.options.fansId,
      shareFansId: getApp().globalData.shareFansId,
      recomType: _data.options.recomType,
      activityId: _data.options.activityId
    }
    console.log('submit_param',param)
    network.post("/api.do", {
      method: "weiPinSp/spSubmitApplicationRecord",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        //发送模板消息
        // _this.positionApplyMsg() 
        wx.navigateTo({
          url: `../../position/deliveryResult/deliveryResult?type=${res.data}`,
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 发送模板消息
   */
  positionApplyMsg: function () {
    let _this = this
    
    network.post("/spMsg/positionApplyMsg.do", {
      params: JSON.stringify({
        companyId: getApp().globalData.companyId,
        positionId: _this.data.options.positionId,
        applyerName: _this.data.basic.name,
        fansId: getApp().globalData.fansId,
        shareFansId: getApp().globalData.shareFansId,
        phone: _this.data.basic.phone,
        email: _this.data.basic.email
      })   
    }, function (res) {
      if (res.code == "0") {
        console.log('模板消息', res.message)
      }
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})