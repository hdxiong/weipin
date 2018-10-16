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
    this.loginDialog = this.selectComponent("#loginDialog");
    let gbData = getApp().globalData;
    if (!gbData.fansId) {
      user.login((data) => {
        console.log(data)
      })
    }
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
    let gbData = getApp().globalData;
    if (gbData.hrUser && gbData.hrUser.companyinfoId) {
      if (this.loginDialog.data.isShow) {
        this.loginDialog.hideDialog();
      }
    }    
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
  /**
   * 授权手机号成功后跳转
   */
  authPhoneNumberSuccess(e) {
    wx.navigateTo({
      url: '../editBaseInfo/editBaseInfo',
    })
  },
  //创建招聘
  linkTo(){
    let _globalData = getApp().globalData;
    if (!_globalData.hrUser || !_globalData.hrUser.companyinfoId) {
      this.loginDialog.showDialog();
      return;
    }
    wx.navigateTo({
      url: '../editBaseInfo/editBaseInfo',
    })
  }
})