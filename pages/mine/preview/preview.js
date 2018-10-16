const network = require("../../../utils/network.js")
const utils = require("../../../utils/util.js")
const commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fansId: '',
    basic: null,
    jobpref: null,
    link: null,
    myEvaluation: null,
    certList: [],
    educationHistoryList: [],
    languageList: [],
    prizeList: [],
    projectList: [],
    skillList: [],
    workHistoryList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      //海报扫码进入
      let params = utils.parseScene(options.scene);
      this.data.fansId = params.fId;
    } else if (options.fansId) {
      //分享链接进入
      this.data.fansId = options.fansId;
    }
    this.getAllResume();
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

  },
  /**
   * 获取个人档案
   */
  getAllResume: function () {
    let _this = this;
    let param = {
      quickSpFansId: this.data.fansId,
    }
    network.post("/api.do", {
      method: "weiPinSp/getAllResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          basic: res.data.basic,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let fansId = this.data.fansId;
    let { name } = this.data.basic;
    return {
      title:`${name}的简历`,
      path:`/pages/mine/preview/preview?fansId=${fansId}`
    }
  },
  /**
   * 跳转
   */
  linkTo(e){
    wx.switchTab({
      url: '/pages/generation/create/create',
    })
  }
})