// pages/generation/avatar/avatar.js
let network = require("../../../utils/network.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    positionId:'',
    visitNum:'0',
    hrFansId:'',
    allVisitors:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        positionId: options.positionId,
        visitNum: options.visitNum,
        hrFansId: options.hrFansId
      })
    this.getVisitHistoryHeadImg(options.positionId);
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
  
  // }
  /**
  * 访问头像
  */
  getVisitHistoryHeadImg: function (positionId) {
    network.post('/api.do', {
      method: "weiPinSp/getAllVisitHistoryHeadImg",
      param: JSON.stringify({
        positionId: positionId,
      })
    }, (res) => {
      if (res.code == '0') {    
          this.setData({
            allVisitors: res.data.allVisitInfo
          })
      }
    })
  },
  /**
   * 跳转
   */
  linkTo(e){
    let dataset = e.currentTarget.dataset;
    let receiverFansId = dataset.item.id, receiverNick = dataset.item.nickName;
    let fansId = getApp().globalData.fansId;
    if (fansId == this.data.hrFansId || getApp().globalData.companyType == 1) {
      if (fansId == receiverFansId) {
        wx.showToast({
          icon: 'none',
          title: '不能与自己进行聊天',
        })
        return;
      }
      wx.navigateTo({
        url: `/pages/generation/chat/chat?receiverFansId=${receiverFansId}&receiverNick=${receiverNick}&positionId=${this.data.positionId}&isHr=1`,
      })
    } 
  }
})