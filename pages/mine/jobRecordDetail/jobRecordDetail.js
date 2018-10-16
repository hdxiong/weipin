
const network = require("../../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    data:null,
    stepName: ['投递成功', '面试', '入职'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        options:options
      })  
      console.log('options',options)
      this.getDeliverHistory()
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
  getDeliverHistory: function () {
    let _this = this;
    network.post("/api.do", {
      method:'weiPinSp/getPostRecordsDeatil',
      param:JSON.stringify({
        postId: _this.data.options.postId,
      }),
      
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          data: res.data
        })
      } else {
        console.log(`weiPinSp/getPostRecordsDeatil:${res.message}`)
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