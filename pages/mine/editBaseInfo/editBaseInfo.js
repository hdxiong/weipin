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
    options: null,
    fansId: '',
    wordNumber:0,
    sexArr: [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ],
    sexIndex: 0,
    legalEmail: true,
    legalPhone: true,
    //基本信息
    interviewResumeInfo: {
      name: '',
      phone: '',
      email: '',
      sex: 0,
      birthday: '',
      motto:'',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        options:options
      })
      this.getAllResume()
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
  * 获取个人档案
  */
  getAllResume: function () {
    let _this = this;
    let param = {
      quickSpFansId: _this.data.options.fansId,  
    }
    network.post("/api.do", {
      method: "weiPinSp/getAllResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        let basic = res.data.basic
        _this.setData({
          interviewResumeInfo: res.data.basic,
          sexIndex: res.data.basic.sex ? res.data.basic.sex - 1 : 0,
          wordNumber: res.data.basic.motto ? res.data.basic.motto.length : 0
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  }, 
  /**
  * 设置(存储)输入框值
  */
  setInputVal: function (e, key) {
    if (e.currentTarget.dataset.event === "input") {
      //input事件
      let val = e.detail.value
      switch (key) {
        case "email":
          let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
          this.setData({
            legalEmail: reg.test(val) || val.length == 0
          });
          break;
        case "phone":
          let regt = /^((0\d{2,3}-\d{7,8})|(1[35784]\d{9}))$/;
          this.setData({
            legalPhone: regt.test(val) || val.length == 0
          });
          break;
      }
      if (key == "name" || key == "email" || key == "phone") {
        //基本信息
        let property = `interviewResumeInfo.${key}`;
        this.setData({
          [property]: e.detail.value
        });
      } else {
        this.setData({
          [key]: e.detail.value
        });
      }
    } else if (e.currentTarget.dataset.event === "clear") {
      //点击清空按钮
      if (key == "name" || key == "email" || key == "phone") {
        let property = `interviewResumeInfo.${key}`;
        this.setData({
          [property]: ""
        });
      } else {
        this.setData({
          [key]: ""
        });
      }
      if (key == "email") {
        this.setData({
          legalEmail: true,
        });
      } else if (key == "phone") {
        this.setData({
          legalPhone: true,
        });
      }
    }
    console.log(this.data.interviewResumeInfo)

  },
  /**
   * 显隐关闭icon和清空输入框内容
   */
  operateInput: function (e) {
    let dataset = e.currentTarget.dataset;
    switch (dataset.type) {
      case "1":
        this.setInputVal(e, "name")
        break;
      case "2":
        this.setInputVal(e, "email")
        break;
      case "3":
        this.setInputVal(e, "phone")
        break;
      default:
        break;
    }
  },
  /**
   * 文本域input事件
   */
  operateTextarea:function(e){
    this.setData({
      ['interviewResumeInfo.motto']: e.detail.value,
      wordNumber:e.detail.value.length
    })
  },
  /**
   * 选择生日
   */
  bindBirthdayChange: function (e) {
    this.setData({
      ['interviewResumeInfo.birthday']: e.detail.value
    })
  },
  /**
   * 选择性别
   */
  bindSexChange: function (e) {
    this.setData({
      sexIndex: e.detail.value,
      ['interviewResumeInfo.sex']: this.data.sexArr[e.detail.value].value
    })
  },
  /**
   * 检查基本信息合法性
   */
  checkBaseForm: function () {
    let ivResumeInfo = this.data.interviewResumeInfo;
    if (!ivResumeInfo.name || ivResumeInfo.name == "") {
      utils.toggleToast(this, "请输入姓名")
      return false;
    }
    if (ivResumeInfo.birthday.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择出生年月")
      return false;
    }
    if (typeof ivResumeInfo.sex == "string" && ivResumeInfo.sex.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择性别")
      return false;
    }
    if (!ivResumeInfo.email || ivResumeInfo.email == "") {
      utils.toggleToast(this, "请输入邮箱")
      return false;
    } else if (!this.data.legalEmail) {
      utils.toggleToast(this, "邮箱格式不对")
      return false;
    }
    if (!ivResumeInfo.phone || ivResumeInfo.phone == "") {
      utils.toggleToast(this, "请输入手机号")
      return false;
    } else if (!this.data.legalPhone) {
      utils.toggleToast(this, "手机号格式不对")
      return false;
    }
    return true;
  },
  /**
   * 完成保存
   */
  save:function(){
    let _this = this;
    if (this.checkBaseForm()) {
      let param = {
        quickSpFansId: _this.data.options.fansId,    
        route: 'basic',
        model: _this.data.interviewResumeInfo
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
      console.log(this.data.interviewResumeInfo)
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