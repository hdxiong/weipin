const network = require("../../../utils/network.js")
const utils = require("../../../utils/util.js")
const commonApi = require("../../../utils/commonApi.js")
const app = getApp()
const companyId = app.globalData.companyId
const paramObj = { companyId: companyId, type: 2 }

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    deToast:{isShow:false, content:""},
    //账号
    inputAccount:'', 
    //密码
    inputPass:'', 
    //邮箱
    inputEmail:'', 
    //手机号
    inputTel:'',   
    //验证码
    vcode:"",   
    phone:'',   //手机号
    phoneCode:'',   //短信验证码
    verificationCode: '获取验证码',
    bossImgCode:'',   //boss图片验证码
    legalEmail:true,
    legalPhone:true,
    platformResume:null,
    showCodeMask:false,
    codeImgSrc:'',
    imgCaptcha:null     //图片验证码图片
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)

    this.setData({
      options: options
    })
    if (options.type == '7') {
      this.getCaptchaCode();
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
   * 获取图片验证码
   */
  getCaptchaCode(){
    network.post('/account/boss/getCaptchaCode.do',{},(res)=>{
      if(res.code == '0'){
         this.setData({
           imgCaptcha: { captchaCode: res.captchaCode, randomKey: res.randomKey}
         })
      }
    })
  },
  /**
  * 发送短信验证码
  */
  sendCheckCode: function () {
    let _this = this, type = _this.data.options.type, param = {};
    if (this.data.verificationCode.indexOf('重') > -1) {
      return;
    } else if (!_this.data.inputTel.trim()) {
      utils.toggleToast(this, "请先输入手机号码")
      return false;
    } else if (!utils.PregRule.Tel.test(_this.data.inputTel)) {
      utils.toggleToast(this, "请先输入正确的手机号码")
      return false;
    }
    if(type == '2'){
      param = { type: '2', phone: _this.data.inputTel};
    }else if(type == '7'){
      if (!_this.data.bossImgCode.trim()){
        utils.toggleToast(this, "请输入图片验证码")
        return false;
      }
      param = { type: '7', phone: _this.data.inputTel, captcha: _this.data.bossImgCode, randomKey: _this.data.imgCaptcha.randomKey};
    }    
    network.post("/account/getSmsCode.do", param, function (res) {
      if (res.code == "0") {
        let t = 60;
        let timer = setInterval(() => {
          if (t <= 0) {
            _this.setData({
              verificationCode: '获取验证码',
              isCountdown: false
            })
            clearInterval(timer);
            return false;
          }
          _this.setData({
            verificationCode: t + 's后重获取',
            isCountdown: true
          })
          t--;
        }, 1000);
      } else if (res.message) {
        utils.toggleToast(_this, res.message)
      }
    })

  },
  /**
   * 设置(存储)输入框值
   */
  setInputVal:function(e,key){
    //input事件
    if (e.currentTarget.dataset.event === "input") {
      let val = e.detail.value 
      switch(key){
        case "inputEmail":
          let reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;                
          this.setData({
            legalEmail: reg.test(val) || val.length == 0
          });
          break;
        case "inputTel":
          let regt = /^((0\d{2,3}-\d{7,8})|(1[35784]\d{9}))$/;
          this.setData({
            legalPhone: regt.test(val) || val.length == 0
          });
          break; 
      }    
      this.setData({
        [key]: e.detail.value
      });
    //点击清空按钮
    } else if (e.currentTarget.dataset.event === "clear") {
      this.setData({
        [key]: "",
      });
      if (key == "inputEmail"){
        this.setData({
          legalEmail: true,
        });
      } else if (key == "inputTel") {
        this.setData({
          legalPhone: true,
        });
      }
    }
    console.log(this.data)
  },
  /**
   * 显隐关闭icon和清空输入框内容
   */
  operateInput:function(e){
    let dataset = e.currentTarget.dataset;
    switch(dataset.type){
      case "1":
        this.setInputVal(e, "inputAccount")      
        break;
      case "2":
        this.setInputVal(e, "inputPass")  
        break;
      case "3":
        this.setInputVal(e, "inputEmail") 
        break;
      case "4":
        this.setInputVal(e, "inputTel") 
        break;
      case "5":
        this.setInputVal(e, "phoneCode")
        break;
      case "6":
        this.setInputVal(e, "bossImgCode")
        break;
      default:
        break;
    }
  },
  /**
   * 检查数据合法性
   */
  checkForm:function(data){
    let platformType = this.data.options.type;
    console.log(platformType)
    for(let key in data){
      if (!data[key].trim()){
        switch(key){
          case "account":
            utils.toggleToast(this,"账号不能为空")
            return false;
          case "pwd":
            utils.toggleToast(this, "密码不能为空")
            return false;
          // case "email":
          //   if (platformType == "2"){
          //      utils.toggleToast(this, "邮箱不能为空")  
          //     return false;
          //   }
          //   break;
          case "phone":
            if (platformType == "2" || platformType == "7") {
              utils.toggleToast(this, "手机号不能为空")
              return false;
            }     
            break;
          case "bossImgCode":
            utils.toggleToast(this, "图片验证码不能为空")
            return false;
          case "phoneCode":
            utils.toggleToast(this, "短信验证码不能为空")
            return false;
          default:
            break;
        }
      }else{
        if (this.data.legalEmail === false){
          utils.toggleToast(this, "邮箱格式不对")
          return false;
        } else if (this.data.legalPhone === false) {
          utils.toggleToast(this, "手机号格式不对")
          return false;
        }
      } 
    }
    return true;
  },
  /**
   * 提交表单
   */
  formSubmit: function (e) {
    let data = e.detail.value
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    if (this.checkForm(data)){
      this.climbeResume()
    }
  },
  /**
  *  授权登录同步平台简历
  */
  climbeResume: function (eventType) {
    let _this = this;
    let _data = _this.data;
    if (eventType != -1) {
      this.setData({
        vcode:''
      })
    }
    let param = {
      fId: '-1',
      type: _data.options.type,
      account: _data.inputAccount,
      pwd: _data.inputPass,
      vcode: _data.vcode || _data.bossImgCode,
      randomKey: _data.options.type == '7' ? _data.imgCaptcha.randomKey : '',
      businessId: '14',
      // companyId: _data.options.companyId, //
      companyId:0,
      companyinfoId: _data.options.companyinfoId,
      phone: _data.inputTel,
      email: _data.inputEmail,
      phoneCode: _data.phoneCode

    }
    if (_data.options.type == 1){
      param.positionId = _data.options.positionId;
      param.quickSpFansId = getApp().globalData.fansId;
      param.reqFrom = 'weipinSp';
    }
    let companyinfoPid = getApp().globalData.companyinfoPid;
    if (companyinfoPid) {
      param.companyinfoPid = companyinfoPid;
    }
    console.log('1接口',param)
    network.post("/account/climbingResume.do", {
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        if (_this.options.type != 1){
            _this.climbeResumeSuccess(res.data)
            _this.setData({
              platformResume: res.data
            })
        }else{
          wx.navigateTo({
            url: `../deliveryResult/deliveryResult?type=1`,
          })
        }     
      } else {
        _this.climbeResumeError(res)
        console.log(`/account/climbingResume.do:${res.message}`)
      }
    })
  },
  /**
   * 同步简历之后的成功回调
   */
  climbeResumeSuccess:function(data){
    if(typeof data === 'string'){
      data = JSON.parse(data);
      console.log('简历：', data)
      if (this.data.options.type == 2){
         data = this.parseData(data);
      }
      console.log('简历22：', data)
    }
    let educationHistoryList = data.EducationHistory;
    let workHistoryList = data.WorkHistory;
    educationHistoryList.forEach(function (item) {
      item.startDateStr = utils.formatDate(item.startDate, 'month');
      if (!item.isReading) {
        item.endDateStr = utils.formatDate(item.endDate, 'month');
        item.isReading = 0;
      } else {
        item.endDateStr = "";
        item.isReading = 1;
      }
    });
    workHistoryList.forEach(function (item) {
      item.startDateStr = utils.formatDate(item.startDate, 'month');
      if (!item.isWorking) {
        item.endDateStr = utils.formatDate(item.endDate, 'month');
        item.isWorking = 0;
      } else {
        item.endDateStr = "";
        item.isWorking = 1;
      }
    });
    let birthday = "";
    if (data.InterviewerInfo.birthday) {
      birthday = utils.formatDate(data.InterviewerInfo.birthday);
    }
    let options = this.data.options;
    //提交应聘申请的参数
    let subParam ={
      shareFansId: options.shareFansId,
      fansId: options.fansId,
      recomType: options.recomType,
      interviewResumeInfo: {
        positionId: options.positionId,
        resumeId: '',
        attachmentIds: '',
        name: data.InterviewerInfo.name,
        phone: data.InterviewerInfo.phone,
        sex: data.InterviewerInfo.sex,
        birthday: birthday,
        email: data.InterviewerInfo.email,
        educationHistoryList: educationHistoryList,
        workHistoryList: workHistoryList,
        resumeFrom: parseInt(options.type),
        resumeUrl: data.InterviewerInfo.resumeUrl
      },      
    }
    this.submitInterivewApplicationNew(subParam.interviewResumeInfo)
  },
  parseData:function(data){ 
    data.EducationHistory.forEach((item,index)=>{
      item.startDate = item.startDate.time;
      item.endDate = item.endDate.time;
    })
    data.WorkHistory.forEach((item, index) => {
      item.startDate = item.startDate.time;
      item.endDate = item.endDate.time;
    })
    data.InterviewerInfo.phone = data.InterviewerInfo.phoneStr;
    data.InterviewerInfo.birthday = data.InterviewerInfo.birthday.time;
    data.InterviewerInfo.createTime = data.InterviewerInfo.createTime.time;
    return data;
  },
  /**
   * 同步简历之后的失败回调
   */
  climbeResumeError: function(res){
    if (res.code == 1) {
      //密码错误
      utils.toggleToast(this, res.message || "账号密码错误")
    } else if (res.code == 2 || res.code == 4) {
      //需要验证码
      this.setData({
        showCodeMask:true,
        codeImgSrc:res.data
      })
    } else if (res.code == 3) {      
      //弹提示
      utils.toggleToast(this, res.message)
    }
  },
  /**
   * 提交应聘申请
   */
  submitInterivewApplicationNew2: function (subParam){
    console.log('2接口', subParam)
    let _this = this;
    network.post("/api.do", {
      method:"recruitPosition/submitInterivewApplicationNew",
      param: JSON.stringify(subParam)
    }, function (res) {
      if (res.code == "0") {
       if(res.data == 1){
         //投递成功
        //  _this.positionApplyMsg()    //模板消息,但是这个来源是第三方平台的而不是小程序，暂时这种不发吧
         wx.navigateTo({
           url: `../deliveryResult/deliveryResult?type=1`,
         })
       }else{
         wx.navigateTo({
           url: `../deliveryResult/deliveryResult?type=2`,
         })
       }
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
 * 提交应聘申请
 */
  submitInterivewApplicationNew: function (subParam) {
    console.log('2接口', subParam)
    let _this = this;
    let param = {
      interviewResumeInfo: subParam,
      quickSpFansId: getApp().globalData.fansId
    }
    let companyinfoPid = getApp().globalData.companyinfoPid;
    if (companyinfoPid) {
      param.companyinfoPid = companyinfoPid;
    }
    network.post("/api.do", {
      method: "weiPinSp/postPositionNew",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        if (res.data == 1) {
          //投递成功
          //  _this.positionApplyMsg()    //模板消息,但是这个来源是第三方平台的而不是小程序，暂时这种不发吧
          wx.navigateTo({
            url: `../deliveryResult/deliveryResult?type=1`,
          })
        } else {
          wx.navigateTo({
            url: `../deliveryResult/deliveryResult?type=2`,
          })
        }
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 发送模板消息
   */
  positionApplyMsg: function () {
    let _data = this.data
    network.post("/spMsg/positionApplyMsg.do", {
      params: {
        companyId: getApp().globalData.companyId,
        positionId: _data.options.positionId,
        applyerName: _data.platformResume.InterviewerInfo.name,
        fansId: getApp().globalData.fansId,
        shareFansId: getApp().globalData.shareFansId,
        phone: _data.platformResume.InterviewerInfo.phone,
        email: _data.platformResume.InterviewerInfo.email
      }
    }, function (res) {
      if (res.code == "0") {
        console.log('模板消息', res.message)
      }
    })
  },
  /**
   * 存储验证码输入框的值
   */
  inputVcode:function(e){
    this.setData({
      vcode: e.detail.value
    })
  },
  /**
   * 确认验证码
   */
  confirmCode: function () {
    this.setData({
      showCodeMask: false
    })
    this.climbeResume("-1")
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