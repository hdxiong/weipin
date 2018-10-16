// pages/generation/codeLogo/codeLogo.js

let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codeImg:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getWeipinPosiListIndexQrcode();   
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
  getWeipinPosiListIndexQrcode(){
    let _gbData = getApp().globalData;
    network.post('/weipin/getWeipinPosiListIndexQrcode.do', {
      companyInfoId: _gbData.hrUser.companyinfoId,
    }, (res) => {
      if(res.code == '0'){
        this.setData({
          codeImg:res.data
        })
      }
    })
  },
  previewImg(){
    wx.previewImage({
      urls: [this.data.codeImg]
    })
  },
  download(){
    wx.downloadFile({
      url:this.data.codeImg,
      success(res){
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res2) {
              wx.showModal({
                content: '已保存到系统相册',
                showCancel: false,
                confirmText: '我知道了',
                success: function (res3) {

                }
              })
            },
            fail(res2) {
              wx.showModal({
                title: '警告',
                content: '您点击了拒绝授权,将无法正常保存图片到本地,请删除小程序后重新获取授权。',
                success: function (res3) {

                }
              })
            }
          })
        }
      }
    })
  },
  changeLogo(){
    let _this = this;
    let _gbData = getApp().globalData;
    if (_gbData.hrUser && _gbData.hrUser.companyinfoId){
      commonApi.uploadImage('', (data) => {
        console.log(data)
        network.post('/weipin/getCustomCenterLogoQrcode.do', {
          companyInfoId: _gbData.hrUser.companyinfoId,
          centerLogoUrl: data.url
        }, (res) => {
          if (res.code == '0') {
            this.setData({
              codeImg: res.data
            })
          }
        })
      })
    }else{
       wx.showToast({
         title: '没有companyinfoId',
         icon:'none'
       })
    }
  }
})