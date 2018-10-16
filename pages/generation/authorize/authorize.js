// pages/generation/authorize/authorize.js

let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  // },
  getUserInfo(e){
    console.log(e.detail)
    if (e.detail.errMsg === 'getUserInfo:ok'){
      let userInfo = e.detail.userInfo;
      let fansId = getApp().globalData.fansId;
      let eniv = {
        en: e.detail.encryptedData,
        iv: e.detail.iv
      }
      let callback = () => {
        wx.navigateBack()
      }
      user._saveUserInfo(userInfo, fansId, eniv, callback);
    }else{
      wx.showToast({
        icon:'none',
        title: '不授权会影响功能使用哦！',
      })
    }
  }
})