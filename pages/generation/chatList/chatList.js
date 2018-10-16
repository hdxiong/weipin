// pages/generation/chatList/chatList.js
let network = require("../../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    msgList:[],
    noData:false
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
    this.getAllChatList();
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
    //因为标题栏是自定义的，安卓手机上标题栏也会跟着一起移动，所以去掉
    // this.getAllChatList(()=>{
    //   setTimeout(()=>{
    //     wx.stopPullDownRefresh();
    //   },500)
    // });
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
   * 获取消息列表
   */
  getAllChatList(cb){
    wx.showLoading({
      title: '加载中',
    })
    network.post('/weipinDirectChat/getAllChatList.do',{
      receiverFansId:getApp().globalData.fansId
    },(res) => {
      wx.hideLoading();
      if (res.code == 0 && res.data.msgList && res.data.msgList.length > 0){
        this.setData({
          msgList: res.data.msgList,
          noData:false
        })
      }else{
        this.setData({
          noData:true
        })
        console.log(`weipinDirectChat/getAllChatList.do:${res.message}`)
      }
      cb && cb();
    })
  },
  /**
   * 跳转到聊天页
   */
  linkTo(e){
    let { item } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../chat/chat?receiverFansId=${item.senderFansId}&receiverNick=${item.nickName}`,   //无法区别身份，isHr先不传
    })
  }
})