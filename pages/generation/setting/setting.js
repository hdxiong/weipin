// pages/generation/setting/setting.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    positionList:[],
    showPositionTip:false,
    clickPositionClose:false,      //是否点击了关闭按钮
    userInfo:null,
    notReadCount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideTabBar();
    wx.hideShareMenu();
    this.loginDialog = this.selectComponent("#loginDialog");
    let globalData = getApp().globalData;
    if (globalData.fansId && globalData.hrUser) {
      //已登录
      this.getPositionList();
    } else {
      //未登录
      user.login((data) => {
        if (data.isSystemUser == 1) {
          this.getPositionList();
        }
      })
    }
    if (wx.getStorageSync('userInfo')){
        this.setData({
          userInfo: wx.getStorageSync('userInfo')
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
    this.loginDialog.hideDialog();
    let hrUser = getApp().globalData.hrUser;
    if (hrUser && hrUser.companyinfoId && hrUser.loginPhone){
      this.getPositionList()
    }
    let cb = (data) => {
      this.setData({
        notReadCount: data
      })
    }
    commonApi.getAllNotReadCount(cb);
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
  onShareAppMessage: function (res) {
    let _globalData = getApp().globalData;
    if (res.from === 'button') {
      if (_globalData.companyType == 1 || _globalData.companyType == 2) {
        return {
          imageUrl: '/images/share_home_img.png',
          path: `/pages/generation/positionList/positionList?comPid=${_globalData.companyinfoPid}&companyType=${_globalData.companyType}`
        }
      }else{
        return {
          imageUrl: '/images/share_home_img.png',
          path: '/pages/generation/positionList/positionList'
        }
      }
    }
  },
  openApp:function(){
    wx.navigateToMiniProgram({
      appId: 'wxf42fc799d723b191',
    })
  },
  openPositionInfo(){
    let hrUser = getApp().globalData.hrUser;
    if(hrUser){
      wx.navigateTo({
        url:'../positionInfo/positionInfo'
      })
    }else{
      this.loginDialog.showDialog()
    }
  },
    /**
   *  获取职位列表
   */
  getPositionList: function () {
    network.post('/api.do', {
      method: 'weiPinSp/getPositionList',
      param: JSON.stringify({
        companyinfoId: getApp().globalData.hrUser.companyinfoId,
        pageNum: 1,
        pageSize: 1
      })
    }, (res) => {
      if (res.code == "0" && res.data.positionList && res.data.positionList.length>0) {
        this.setData({
          positionList: res.data.positionList,
          showPositionTip:false
        })
      }else{
        this.setData({
          showPositionTip: true
        })
      }
    })
  },
  /**
   * 手机号授权成功
   */
  authPhoneNumberSuccess(){
    this.getPositionList()
  },
   closePositionTip() {
    this.setData({
      showPositionTip: false,
      clickPositionClose:true
    })
  },
  /**
   * 保存formId
   */
   saveFormId(e){
     commonApi.saveFormId({
       formId: e.detail.formId
     })
   },
   /**
    * 跳转
    */
  linkTo(e){
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    wx.navigateTo({
      url: '../chatList/chatList',
    })
  },
  goCodeLogo(){
    let hrUser = getApp().globalData.hrUser;
    if (hrUser && hrUser.companyinfoId) {
      wx.navigateTo({
        url: '../codeLogo/codeLogo'
      })
    } else {
      this.loginDialog.showDialog()
    }
  } 
})