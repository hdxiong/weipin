
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
    id: 0,
    wordNumber: 0,
    projectName: '',
    company: '',
    startDateStr: '',
    endDateStr: '',
    projectDescription: '',
    untilNow: 0         //是否进行中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      fansId: options.fansId,
      id: options.itemId,
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
      route: 'projectexp',
      id: _this.data.id
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          untilNow: res.data.model.untilNow,
          projectName: res.data.model.projectName,
          company: res.data.model.company,
          startDateStr: res.data.model.startDateStr,
          endDateStr: res.data.model.endDateStr,
          projectDescription: res.data.model.projectDescription,
          wordNumber: res.data.model.projectDescription ? res.data.model.projectDescription.length : 0
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
  * 切换是否进行中
  */
  toggleWorking: function () {
    if (this.data.untilNow) {
      this.setData({
        untilNow: 0,
        endDateStr: ""
      })
    } else {
      this.setData({
        untilNow: 1,
        endDateStr: "至今"
      })
    }
  },
  /**
   * 操作输入框
   */
  operateInput: function (e) {
    let event = e.currentTarget.dataset.event
    let ty = e.currentTarget.dataset.type
    let keys = ["projectName", "company"]
    switch (event) {
      case 'input':
        this.setData({
          [keys[ty - 1]]: e.detail.value
        })
        break;
      case 'clear':
        this.setData({
          [keys[ty - 1]]: ''
        })
        break;
      default:
        break;
    }
  },
  /**
   * 选择开始时间
   */
  bindStartDateChange: function (e) {
    this.setData({
      startDateStr: e.detail.value
    })
    console.log(this.data.startDateStr)
  },
  /**
  * 选择结束时间
  */
  bindEndDateChange: function (e) {
    this.setData({
      endDateStr: e.detail.value
    })
  },
  /**
  * 文本域input事件
  */
  operateTextarea: function (e) {
    this.setData({
      projectDescription: e.detail.value,
      wordNumber: e.detail.value.length
    })
  },
  /**
  * 检查工作经历合法性
  */
  checkExperienceForm: function () {
    let _data = this.data;
    if (!_data.projectName || _data.projectName == "") {
      utils.toggleToast(this, "请输入项目名称")
      return false;
    }
    // if (!_data.company || _data.company == "") {
    //   utils.toggleToast(this, "请输入所属企业")
    //   return false;
    // }
    if (!_data.startDateStr) {
      utils.toggleToast(this, "请选择开始时间")
      return false;
    }
    if (_data.untilNow == 0 && !_data.endDateStr) {
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
        route: 'projectexp',
        model: {
          id: _this.data.id,
          projectName: _this.data.projectName,
          company: _this.data.company,
          startDateStr: _this.data.startDateStr,
          endDateStr: _this.data.endDateStr,
          projectDescription: _this.data.projectDescription,
          untilNow: _this.data.untilNow,
        }
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
      route: 'projectexp',
      id: _this.data.id
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