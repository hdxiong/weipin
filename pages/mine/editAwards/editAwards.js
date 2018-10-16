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
    fansId: '',
    model: [],   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fansId: options.fansId
    })
    this.getResumeInfoByRoute();
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
      route: 'prize',
      id: _this.data.id
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          model:res.data.model
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 显隐关闭icon和清空输入框内容
   */
  operateInput: function (e) {
    let index = e.currentTarget.dataset.index;
    let event = e.currentTarget.dataset.event;
    switch (event) {
      case 'input':
        this.setData({
          ['model[' + index + '].qualificationName']: e.detail.value
        })
        break;
      case 'clear':
        this.setData({
          ['model[' + index + '].qualificationName']: ''
        })
        break;
      default:
        break;
    }
    console.log(this.data.model)
  },
  /**
  * 选择熟练程度
  */
  bindDateChange: function (e) {
    let index = e.currentTarget.dataset.index;    //number 类型
    this.setData({
      ['model[' + index + '].qualificationDateStr']: e.detail.value
    })
    console.log(this.data.model)
  },
  /**
   * 删除某一项
   */
  del: function (e) {
    let index = e.currentTarget.dataset.index;
    this.data.model.splice(index, 1);
    this.setData({
      model: this.data.model
    })
    console.log(this.data.model)
  },
  /**
   * 新增一项
   */
  add: function () {
    let model = this.data.model
    model.push({
      qualificationName: '',
      qualificationDateStr: ""
    })
    this.setData({
      model: model
    })
    console.log(this.data.model)
  },
  /**
   * 完成保存
   */
  save: function () {
    let _this = this
    let defineModel = this.data.model, model = [], isLegal = true;
    defineModel.forEach((item, index) => {
      if (!item.qualificationName) {
        utils.toggleToast(_this, "请完成获奖信息")
        isLegal = false
        return
      } else {
        model.push({ qualificationName: item.qualificationName, qualificationDateStr: item.qualificationDateStr })
      }
    })
    if (isLegal) {
      let param = {
        quickSpFansId: _this.data.fansId,
        route: 'prize',
        model: model
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


      console.log('请求参数model', model)
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
})