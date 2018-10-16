
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
    id:0,
    wordNumber:0,
    isWorking: 0,
    workStartDateStr: '',
    workEndDateStr: '',
    workCompany: '',
    position: '',
    workDepartment: '',
    descript: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        fansId:options.fansId,
        id:options.itemId,
      })
      if(options.itemId != 0){
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
  getResumeInfoByRoute:function(){
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,  
      route: 'jobexp',
      id: _this.data.id
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        _this.setData({
          isWorking: res.data.model.isWorking,
          workStartDateStr: res.data.model.startDateStr,
          workEndDateStr: res.data.model.endDateStr,
          workCompany: res.data.model.workCompany,
          position: res.data.model.position,
          workDepartment: res.data.model.workDepartment,
          descript: res.data.model.descript,
          wordNumber: res.data.model.descript ? res.data.model.descript.length : 0
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
  * 切换是否在职状态
  */
  toggleWorking: function () {
    if (this.data.isWorking) {
      this.setData({
        isWorking: 0,
        workEndDateStr: ""
      })
    } else {
      this.setData({
        isWorking: 1,
        workEndDateStr: "至今"
      })
    }
  },
  /**
   * 操作输入框
   */
  operateInput:function(e){
    let event = e.currentTarget.dataset.event
    let ty = e.currentTarget.dataset.type
    let keys = ["workCompany", "position","workDepartment"]
    switch(event){
      case 'input':
        this.setData({
          [keys[ty-1]]: e.detail.value
        })
        break;
      case 'clear':
        this.setData({
          [keys[ty - 1]]:''
        })
        break;
      default:
        break;
    }
  },
  /**
   * 选择开始时间
   */
  bindStartDateChange:function(e){
      this.setData({
        workStartDateStr:e.detail.value
      })
      console.log(this.data.workStartDateStr)
  },
  /**
  * 选择结束时间
  */
  bindEndDateChange: function (e) {
    this.setData({
      workEndDateStr: e.detail.value
    })
  },
  /**
  * 文本域input事件
  */
  operateTextarea: function (e) {
    this.setData({
      descript: e.detail.value,
      wordNumber: e.detail.value.length
    })
  },
  /**
  * 检查工作经历合法性
  */
  checkExperienceForm: function () {
    let _data = this.data;
    if (!_data.workCompany || _data.workCompany == "") {
      utils.toggleToast(this, "请输入公司名称")
      return false;
    }
    if (!_data.position || _data.position == "") {
      utils.toggleToast(this, "请输入职位名称")
      return false;
    }
    if (!_data.workStartDateStr) {
      utils.toggleToast(this, "请选择开始时间")
      return false;
    }
    if (_data.isWorking == 0 && !_data.workEndDateStr) {
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
      console.log(this.data)
      let param = {
        quickSpFansId: _this.data.fansId,    
        route: 'jobexp',
        model: {
          id:_this.data.id,
          startDateStr: _this.data.workStartDateStr,
          endDateStr: _this.data.workEndDateStr,
          isWorking: _this.data.isWorking,
          position: _this.data.position,
          workCompany: _this.data.workCompany,
          workDepartment: _this.data.workDepartment,
          descript: _this.data.descript
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
  del:function(){
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'jobexp',
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