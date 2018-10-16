
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
    step:"1",       //默认改成1
    platforms:[
      { "type": 1, "platformName": "前程无忧（51job）", "logoUrl":"../../../images/resum_1.png"},
      { "type": 2, "platformName": "智联招聘", "logoUrl": "../../../images/resum_2.png" },
      { "type": 6, "platformName": "拉勾网", "logoUrl": "../../../images/resum_4.png" },
      { "type": 7, "platformName": "BOSS直聘", "logoUrl": "../../../images/resum_6.png" },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('resume', options)
    this.setData({
      options:options
    })
    this.getSimpleResume()
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
   *  获取一分钟微简历,看完成了几步
   */
  getSimpleResume: function () {
    let self = this;
    let param = {
      quickSpFansId: this.data.options.fansId,
      // companyId: this.data.options.companyId
    }
    network.post("/api.do", {
      method: "weiPinSp/getSimpleResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        if (res.data.name && res.data.phone && res.data.educationHistoryList.length > 0 && res.data.workHistoryList.length > 0) {
            self.setData({
              step: 3  
            })
        }
      }
    })
  },
  /**
   * 跳转
   */
  navigatorTo: function (e) {
    let dataset = e.currentTarget.dataset;
    let options = this.data.options;
    let queryStr = `companyinfoId=${options.companyinfoId}&positionId=${options.positionId}&fansId=${options.fansId}&shareFansId=${options.shareFansId}&recomType=${options.recomType}`;
    // commonApi.saveFormId({
    //   formId: e.detail.formId
    // })
    switch (dataset.pagetype) {
      //go 创建微简历
      case "1":
        wx.navigateTo({
          url: `../addResume/addResume?${queryStr}`,
        })
        break;
      //跳转到第三方招聘平台登录
      case "2":
        wx.navigateTo({
          url: `../loginResume/loginResume?${queryStr}&type=${dataset.type}`,
        })
        break;
      //跳转到个人档案（预览编辑）
      case "3":
        wx.navigateTo({
          url: `../../mine/editPreview/editPreview?${queryStr}&activityId=${options.activityId}`,
        })
        break;
      default:
        break;
    }
  },
  /**
   * 扫码
   */
  scanCode:function(e){
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log(res)
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