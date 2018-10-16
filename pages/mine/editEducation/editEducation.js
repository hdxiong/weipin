
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
    wordNumber: 0,
    professional: [
      { name: '博士后', value: 0 },
      { name: '博士', value: 1 },
      { name: '研究生', value: 2 },
      { name: '本科', value: 3 },
      { name: '大专', value: 4 },
      { name: '其他', value: 5 },
      { name: '高中', value: 6 },
      { name: '中专', value: 7 },
      { name: '初中及以下', value: 8 },
      
    ],
    professIndex: 0,
    education: {
      id: 0,
      graduateSchool: '',
      major: '',
      educationLev: '',      //未选择学历默认为-1吧
      startDateStr: '',
      endDateStr: '',
      descript: '',
      isReading: 0,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fansId: options.fansId,
      ['education.id']: options.itemId,
    })
    if (options.itemId != 0) {
      this.getResumeInfoByRoute()
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

  },
  /**
   * 获取经历信息
   */
  getResumeInfoByRoute: function () {
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'eduexp',
      id: _this.data.education.id
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          education: res.data.model,
          professIndex: typeof res.data.model.educationLev == 'number' ? res.data.model.educationLev : 0,
          wordNumber: res.data.model.descript ? res.data.model.descript.length : 0
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 选择学历
   */
  bindProfessChange: function (e) {
    this.setData({
      professIndex: e.detail.value,
      ['education.educationLev']: this.data.professional[e.detail.value].value,
    })
  },
  /**
  * 切换是否在读状态
  */
  toggleReading: function () {
    if (this.data.education.isReading) {
      this.setData({
        ['education.isReading']: 0,
        ['education.endDateStr']: ""
      })
    } else {
      this.setData({
        ['education.isReading']: 1,
        ['education.endDateStr']: "至今"
      })
    }
  },
  /**
   * 操作输入框
   */
  operateInput: function (e) {
    let event = e.currentTarget.dataset.event
    let ty = e.currentTarget.dataset.type
    let keys = ["graduateSchool", "major"]
    switch (event) {
      case 'input':
        this.setData({
          ['education.' + keys[ty - 1]]: e.detail.value
        })
        break;
      case 'clear':
        this.setData({
          ['education.' + keys[ty - 1]]: ''
        })
        break;
      default:
        break;
    }
  },
  /**
   * 选择学历
   */
  bindProfessChange:function(e){
    this.setData({
      professIndex:e.detail.value,
      ['education.educationLev']:this.data.professional[e.detail.value].value,
    }) 
  },
  /**
   * 选择开始时间
   */
  bindStartDateChange: function (e) {
    this.setData({
      ['education.startDateStr']: e.detail.value
    })
  },
  /**
  * 选择结束时间
  */
  bindEndDateChange: function (e) {
    this.setData({
      ['education.endDateStr']: e.detail.value
    })
  },
  /**
  * 文本域input事件
  */
  operateTextarea: function (e) {
    this.setData({
      ['education.descript']: e.detail.value.trim(),
      wordNumber: e.detail.value.trim().length
    })
  },
  /**
  * 检查经历合法性
  */
  checkExperienceForm: function () {
    let education = this.data.education;
    if (!education.graduateSchool || education.graduateSchool == "") {
      utils.toggleToast(this, "请输入学校名称")
      return false;
    }
    if (!education.major || education.major == "") {
      utils.toggleToast(this, "请输入专业名称")
      return false;
    }
    if (education.educationLev === null || education.educationLev === '') {
      utils.toggleToast(this, "请选择学历")
      return false;
    }
    if (!education.startDateStr) {
      utils.toggleToast(this, "请选择开始时间")
      return false;
    }
    if (education.isReading == 0 && !education.endDateStr) {
      utils.toggleToast(this, "请选择结束时间")
      return false;
    }
    return true;
  },
  /**
  * 完成保存
  */
  save: function () {
    let _this = this
    if (this.checkExperienceForm()) {
      let param = {
        quickSpFansId: _this.data.fansId,
        route: 'eduexp',
        model: _this.data.education
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
    }
  },
  /**
   * 删除
   */
  del: function () {
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'eduexp',
      id: _this.data.education.id
    }
    network.post("/api.do", {
      method: "weiPinSp/delExperienceById",
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