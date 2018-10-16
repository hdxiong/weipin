// pages/generation/companyDetail/companyDetail.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyinfoId:'',
    companyInfo:{},
    companyName:'',
    positionList:[],
    pageNum:1,
    noData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     let id = options.id;
     if(id){
       this.setData({
         companyinfoId:id
       })
     }
    if (!getApp().globalData.fansId) {
      user.login((data) => {
        this.getCompanyBasicInfo();
      });
    } else {
      this.getCompanyBasicInfo();
    }
    this.getPositionList();
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
    this.getPositionList(() => {
      wx.stopPullDownRefresh();
    });
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
  //   let id = this.data.companyinfoId;
  //   return {
  //     path:`/pages/generation/companyDetail/companyDetail?id=${id}`
  //   }
  // },
  /**
  * 获取公司信息
  */
  getCompanyBasicInfo() {
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyBasicInfoNew',
      param: JSON.stringify({
        reqType:1,
        sessionId: wx.getStorageSync('sessionId'),
        visitFansId: getApp().globalData.fansId,
        companyinfoId: this.data.companyinfoId,
        visitType:1
      })
    }, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          companyInfo: res.data,
          companyName: res.data.companyName
        })
      }
    })
  },
  /**
  * 获取职位列表
  */
  getPositionList(cb) {
    network.post('/api.do', {
      method: 'weiPinSp/getPositionList',
      param: JSON.stringify({
        companyinfoId: this.data.companyinfoId,
        positionName: '',
        pageNum: this.data.pageNum,
        pageSize: 10000
      })
    }, (res) => {
      if (res.code == 0) {
        this.setData({
          positionList: res.data.positionList,
          page: res.data.page
        })
        if (this.data.pageNum == 1 && res.data.positionList.length == 0){
           this.setData({
              noData:true
           })
        }
        if (res.data.positionList.length > 0) {
          this.setData({
            hasPosition: true
          })
        }
        cb && cb();
      }
    })
  },
  /**
   * 跳转到职位详情
   */
  goDetail(e){
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let cId = this.data.companyinfoId;
    let positionId = e.currentTarget.dataset.positionid;
    wx.navigateTo({
      url: `/pages/position/detail/detail?positionId=${positionId}&cId=${cId}&from=companyDetail`,
    })
  }
})