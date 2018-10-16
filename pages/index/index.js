//index.js
//获取应用实例
const app = getApp()
const emojiData = require('../../utils/emoji-data.js').emojiData;

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    emojis:[],
    positionList: [
      {
        id: 1,
        position: '前端开发'
      },
      {
        id: 2,
        position: '前端开发222'
      },

    ]
  },
  //事件处理函数
  bindViewTap: function() {
    // wx.navigateTo({
    //   url: '../logs/logs'
    // })
  },
  onLoad: function () {
    this.getEmoji()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  onReady(){
    var query = wx.createSelectorQuery();
    let vp = query.selectViewport();
    console.log(vp.scrollOffset())
    wx.createSelectorQuery().select('#userMotto').boundingClientRect(function (rect) {
      console.log(rect)
      rect.id      // 节点的ID
      rect.dataset // 节点的dataset
      rect.left    // 节点的左边界坐标
      rect.right   // 节点的右边界坐标
      rect.top     // 节点的上边界坐标
      rect.bottom  // 节点的下边界坐标
      rect.width   // 节点的宽度
      rect.height  // 节点的高度
    }).exec()
    console.log('123')
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  //获取表情
  getEmoji(){
    let emojis = [];
    console.log(emojiData.map)
    for (let key in emojiData.map){
      emojis.push(emojiData.map[key])
    }
    this.setData({
      emojis:emojis
    })
    console.log(this.data.emojis)
  }
})
