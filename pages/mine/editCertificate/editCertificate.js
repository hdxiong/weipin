const network = require("../../../utils/network.js")
const utils = require("../../../utils/util.js")
const app = getApp()
const companyId = app.globalData.companyId
const paramObj = { companyId: companyId, type: 2 }

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fansId:'',
    modal: { showModal: false, modalTitle: '证书名称', inputVal: '' },
    qualifications: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fansId: options.fansId,
    })
    this.getResumeInfoByRoute()
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
   * 获取信息
   */
  getResumeInfoByRoute: function () {
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'cert',
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          qualifications:res.data.model
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 显示modal
   */
  showModal: function () {
    this.setData({
      ['modal.showModal']: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {

  },
  /**
   * 获取输入框的值
   */
  inputChange: function (e) {
    this.setData({
      ['modal.inputVal']: e.detail.value.trim()
    })

  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.setData({
      ['modal.showModal']: false,
      ['modal.inputVal']: ''
    })
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    let _data = this.data
    if (_data.modal.inputVal) {
      _data.qualifications.push({ "qualificationName": _data.modal.inputVal })
      this.setData({
        qualifications: _data.qualifications
      })
    }
    this.setData({
      ['modal.showModal']: false,
      ['modal.inputVal']: ''
    })
  },
  /**
   * 删除某个证书
   */
  delSkill: function (e) {
    let index = e.currentTarget.dataset.index
    this.data.qualifications.splice(index, 1)
    this.setData({
      qualifications: this.data.qualifications
    })
  },
  /**
   * 完成保存
   */
  save: function () {
    let _this = this
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'cert',
      model: _this.data.qualifications
    }
    network.post("/api.do", {
      method: "weiPinSp/updateResumeInfo",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        wx.navigateBack({
          delta: 1
        })
      } else {
        utils.toggleToast(_this, res.message)
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