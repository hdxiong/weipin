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
    headType:'1',
    fansId:'',
    sexArr: [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ],
    sexIndex:0,
    legalEmail: true,
    legalPhone: true,
    addEducation:true,
    addExperience:true,
    //基本信息
    interviewResumeInfo: {
      positionId: "",
      name: '',
      phone: '',
      email: '',
      sex: '请选择性别',
      birthday: '请选择出生年月',
      educationHistoryList: [],
      workHistoryList: [],
      resumeFrom: '18'
    },
    //教育经历
    professional: [
      { name: '博士', value: 1 },
      { name: '硕士', value: 2 },
      { name: '本科', value: 3 },
      { name: '大专', value: 4 },
      { name: '其他', value: 5 }
    ],
    professIndex:0,
    isReading:0,
    eduStartDateStr:'请选择开始时间',
    eduEndDateStr:'请选择结束时间',
    graduateSchool:'',
    educationLev:'请选择学历',
    major: '',
    //工作经历
    isWorking:0,
    workStartDateStr: '请选择开始时间',
    workEndDateStr: '请选择结束时间',
    workCompany: '',
    position: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    this.setData({
      options: options,
      fansId: options.fansId,
      ['interviewResumeInfo.positionId']:options.positionId
    })
    this.getSimpleResume()
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
   *  获取一分钟微简历
   */
  getSimpleResume:function(){
    let self = this;
    let param = {
      quickSpFansId: this.data.fansId,
      companyId:this.data.options.companyId
    }
    network.post("/api.do", {
      method: "weiPinSp/getSimpleResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        // if(res.data.step == 1 || res.data.step == 2){
        if (res.data.name && res.data.phone) {
          wx.showModal({
            title: '微简历',
            content: '需要导入上次的的数据吗?',
            showCancel:true,
            confirmText:"确定导入",
            success: function (response) {
              if (response.confirm){
                if (res.data.educationHistoryList && res.data.educationHistoryList.length > 0){
                  self.data.addEducation = false
                }else{
                  self.data.addEducation = true
                }
                if (res.data.workHistoryList && res.data.workHistoryList.length > 0) {
                  self.data.addExperience = false
                } else {
                  self.data.addExperience = true
                }
                self.setData({
                  headType: '1',
                  addEducation: self.data.addEducation,
                  addExperience: self.data.addExperience,
                  sexIndex:res.data.sex - 1,
                  ['interviewResumeInfo.name']: res.data.name,
                  ['interviewResumeInfo.phone']: res.data.phone,
                  ['interviewResumeInfo.email']: res.data.email,
                  ['interviewResumeInfo.sex']: res.data.sex,
                  ['interviewResumeInfo.birthday']: res.data.birthday,
                  ['interviewResumeInfo.educationHistoryList']: res.data.educationHistoryList ? res.data.educationHistoryList : [],
                  ['interviewResumeInfo.workHistoryList']: res.data.workHistoryList ? res.data.workHistoryList : [],
                })
              } else if (response.cancel){
                 self.setData({
                   addEducation:true,
                   addExperience:true,
                   ['interviewResumeInfo.name']:'',
                   ['interviewResumeInfo.phone']: '',
                   ['interviewResumeInfo.email']: '',
                   ['interviewResumeInfo.sex']: '请选择性别',
                   ['interviewResumeInfo.birthday']: '请选择出生年月',
                   ['interviewResumeInfo.educationHistoryList']: [],
                   ['interviewResumeInfo.workHistoryList']: [],
                 })
              }
            }
          })
        }else if(res.data.step == 3){     //step == 3的话，其实就走个人档案编辑流程了（后续可以删掉）
          self.setData({
            headType: res.data.step,
            addEducation: false,
            addExperience: false,
            ['interviewResumeInfo.name']: res.data.name,
            ['interviewResumeInfo.phone']: res.data.phone,
            ['interviewResumeInfo.email']: res.data.email,
            ['interviewResumeInfo.sex']: res.data.sex,
            ['interviewResumeInfo.birthday']: res.data.birthday,
            ['interviewResumeInfo.educationHistoryList']: res.data.educationHistoryList ? res.data.educationHistoryList : [],
            ['interviewResumeInfo.workHistoryList']: res.data.workHistoryList ? res.data.workHistoryList : [],
          })          
        }     
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
  * 设置(存储)输入框值
  */
  setInputVal: function (e, key) {
    
    //input事件
    if (e.currentTarget.dataset.event === "input") {
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
      if (key == "name" || key == "email" || key == "phone"){
        //基本信息
        let property = `interviewResumeInfo.${key}`;
        this.setData({
          [property]: e.detail.value
        });
      }else {
        //教育或工作经历
        this.setData({
          [key]: e.detail.value
        });
      }
    //点击清空按钮
    } else if (e.currentTarget.dataset.event === "clear") {
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
      case "4":
        this.setInputVal(e, "graduateSchool")
        break;
      case "5":
        this.setInputVal(e, "major")
        break;
      case "6":
        this.setInputVal(e, "workCompany")
        break;
      case "7":
        this.setInputVal(e, "position")
        break;
      default:
        break;
    }
  },
  /**
   * 选择生日
   */
  bindBirthdayChange:function(e){   
    this.setData({
      ['interviewResumeInfo.birthday']:e.detail.value
    })
  },
  /**
   * 选择性别
   */
  bindSexChange:function(e){
    this.setData({
      sexIndex: e.detail.value,
      ['interviewResumeInfo.sex']: this.data.sexArr[e.detail.value].value
    })
    console.log("sexsex:", this.data.interviewResumeInfo)
  },
  /**
   * 选择开始时间
   */
  bindStartDateChange:function(e){
    let dataset = e.currentTarget.dataset;
    switch(dataset.formtype){
      case "edu":
        this.setData({
          eduStartDateStr: e.detail.value
        })
        break;
      case "work":
        this.setData({
          workStartDateStr: e.detail.value
        })
        break;
      default:
        break;
    }
  },
  /**
  * 选择结束时间
  */
  bindEndDateChange: function (e) {
    let dataset = e.currentTarget.dataset;
    switch (dataset.formtype) {
      case "edu":
        this.setData({
          eduEndDateStr: e.detail.value
        })
        break;
      case "work":
        this.setData({
          workEndDateStr: e.detail.value
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
      professIndex: e.detail.value,
      educationLev: this.data.professional[e.detail.value].value,
    })
  },
  /**
  * 切换是否在读状态
  */
  toggleReading: function () {
    if(this.data.isReading){
      this.setData({
        isReading: 0,
        eduEndDateStr:"请选择结束时间"
      })
    }else{
      this.setData({
        isReading: 1,
        eduEndDateStr: "至今"
      })
    }    
  },
  /**
   * 切换是否在职状态
   */
  toggleWorking: function () {
    if (this.data.isWorking) {
      this.setData({
        isWorking: 0,
        workEndDateStr: "请选择结束时间"
      })
    } else {
      this.setData({
        isWorking: 1,
        workEndDateStr: "至今"
      })
    }    
  },
  /**
   * 检查基本信息合法性
   */
  checkBaseForm:function(){
    let ivResumeInfo = this.data.interviewResumeInfo;
    if (!ivResumeInfo.name.trim() || ivResumeInfo.name == ""){
      utils.toggleToast(this,"请输入姓名")
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
    if (!ivResumeInfo.email.trim() || ivResumeInfo.email == "") {
      utils.toggleToast(this, "请输入邮箱")
      return false;
    } else if (!this.data.legalEmail){
      utils.toggleToast(this, "邮箱格式不对")
      return false;
    }
    if (!ivResumeInfo.phone.trim() || ivResumeInfo.phone == "") {
      utils.toggleToast(this, "请输入手机号")
      return false;
    } else if (!this.data.legalPhone) {
      utils.toggleToast(this, "手机号格式不对")
      return false;
    }
    return true;
  },
  /**
   * 检查教育经历合法性
   */
  checkEducationForm: function () {
    let _data = this.data;
    if (_data.eduStartDateStr.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择开始时间")
      return false;
    }
    if (_data.isReading == 0 && _data.eduEndDateStr.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择结束时间")
      return false;
    }
    if (!_data.graduateSchool || _data.graduateSchool == "") {
      utils.toggleToast(this, "请输入毕业学校")
      return false;
    }
    if (typeof _data.educationLev == "string" && _data.educationLev.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择学历")
      return false;
    }
    if (!_data.major || _data.major == "") {
      utils.toggleToast(this, "请输入专业")
      return false;
    }
   return true;
  },
  /**
   * 检查工作经历合法性
   */
  checkExperienceForm: function () {
    let _data = this.data;
    if (_data.workStartDateStr.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择开始时间")
      return false;
    }
    if (_data.isWorking == 0 && _data.workEndDateStr.indexOf("请选择") > -1) {
      utils.toggleToast(this, "请选择结束时间")
      return false;
    }
    if (!_data.workCompany || _data.workCompany == "") {
      utils.toggleToast(this, "请输入公司名称")
      return false;
    }
    if (!_data.position || _data.position == "") {
      utils.toggleToast(this, "请输入职位名称")
      return false;
    }
    return true;
  },
 
  /**
   * 保存基本信息
   */
  saveBaseInfo:function(e){
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    if (this.checkBaseForm()){
      this.updateSimpleResume("1")
    }
  },
  /**
   * 新增教育经历
   */
  addEducationSave:function(e){
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let _data = this.data;
    if (this.checkEducationForm()) {
      _data.interviewResumeInfo.educationHistoryList.push({
        startDateStr: _data.eduStartDateStr,
        endDateStr: _data.eduEndDateStr,
        graduateSchool: _data.graduateSchool,
        major: _data.major,
        educationLev: _data.educationLev,
        isReading: _data.isReading
      })
      this.setData({
        addEducation:false,
        ['interviewResumeInfo.educationHistoryList']: _data.interviewResumeInfo.educationHistoryList
      })
      this.updateSimpleResume("2",'save')
    }
  },
   /**
   * 新增工作经历
   */
  addExperienceSave: function (e) {
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let _data = this.data;
    if (this.checkExperienceForm()) {
      _data.interviewResumeInfo.workHistoryList.push({
        startDateStr: _data.workStartDateStr,
        endDateStr: _data.workEndDateStr,
        workCompany: _data.workCompany,
        position: _data.position,
        isWorking: _data.isWorking
      })
      this.setData({
        addExperience: false,
        ['interviewResumeInfo.workHistoryList']: _data.interviewResumeInfo.workHistoryList
      })
      this.updateSimpleResume("3", 'save')
    }
  },
  /**
   * 保存或更新微简历
   */
  updateSimpleResume: function (step,ty) {
    let _this = this;
    let param = {
      quickSpFansId:this.data.fansId,
      step:step,
      simpleResumeInfo: this.data.interviewResumeInfo
    }
    network.post("/api.do", {
      method: "weiPinSp/updateSimpleResume",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
          if(ty != 'save'){
            _this.setData({
              headType: ++_this.data.headType
            })
          }
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 删除某个经历
   */
  delhistory: function(e){
    let dataset = e.currentTarget.dataset;
    let _data = this.data;
    switch(dataset.formtype){
      case "edu":
        _data.interviewResumeInfo.educationHistoryList.splice(dataset.index, 1);
        this.setData({
          ['interviewResumeInfo.educationHistoryList']: _data.interviewResumeInfo.educationHistoryList
        })
        break;
      case "work":
        _data.interviewResumeInfo.workHistoryList.splice(dataset.index, 1);
        this.setData({
          ['interviewResumeInfo.workHistoryList']: _data.interviewResumeInfo.workHistoryList
        })
        break;
      default:
        break;
    }
  },
  /**
   * 新增经历
   */
  addHistory: function (e) {
    let dataset = e.currentTarget.dataset;
    switch (dataset.formtype) {
      case "edu":
        this.setData({
          addEducation: true,
          isReading:0,
          eduStartDateStr: '请选择开始时间',
          eduEndDateStr: '请选择结束时间',
          graduateSchool: '',
          educationLev: '请选择学历',
          major: '',
        })
        break;
      case "work":
        this.setData({
          addExperience: true,
          isWorking: 0,
          workStartDateStr: '请选择开始时间',
          workEndDateStr: '请选择结束时间',
          workCompany: '',
          position: '',
        })
        break;
      default:
        break;
    }
  },
  /**
   * 返回上一步
   */
  goLastStep: function (e) {
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let dataset = e.currentTarget.dataset;
    switch (dataset.formtype) {
      case "edu":
        this.setData({
          headType: '1'
        })
        break;
      case "work":
        this.setData({
          headType: '2'
        })
        break;
      default:
        break;
    }
  },
  /**
  *  去下一步
  */
  goNextStep: function (e) {
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let dataset = e.currentTarget.dataset;
    switch (dataset.formtype) {
      case "edu":
        this.updateSimpleResume("2")
        break;
      case "work":
        this.updateSimpleResume("3")
        break;
      default:
        break;
    }
  },
  /**
  * 立即投递
  */
  goDelivery: function (e) {
 
    let _this = this;
    let param = {
      interviewResumeInfo: this.data.interviewResumeInfo,
      fansId: this.data.fansId,
      shareFansId: getApp().globalData.shareFansId,
      recomType: this.data.options.recomType,
      activityId: this.data.options.activityId
    }
    network.post("/api.do", {
      method: "recruitPosition/spSubmitApplicationRecord",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        //发送模板消息
        // _this.positionApplyMsg()    
        wx.navigateTo({
          url: `../deliveryResult/deliveryResult?type=${res.data}`,
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
    * 快速小程序的立即投递
    */
  goDelivery2: function (e) {
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let _this = this;
    let param = {
      interviewResumeInfo: this.data.interviewResumeInfo,
      quickSpFansId: getApp().globalData.fansId
    }
    let companyinfoPid = getApp().globalData.companyinfoPid;
    if (companyinfoPid){
      param.companyinfoPid = companyinfoPid;
    }
    network.post("/api.do", {
      method: "weiPinSp/postPositionNew",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {   
        wx.navigateTo({
          url: `../deliveryResult/deliveryResult?type=${res.data}`,
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * 发送模板消息
   */
  positionApplyMsg:function(){
    let _data = this.data
    network.post("/spMsg/positionApplyMsg.do", {
      params:{
        companyId: getApp().globalData.companyId,
        positionId: _data.interviewResumeInfo.positionId,
        applyerName: _data.interviewResumeInfo.name,
        fansId: getApp().globalData.fansId,
        shareFansId: getApp().globalData.shareFansId,
        phone: _data.interviewResumeInfo.phone,
        email: _data.interviewResumeInfo.email
      }    
    }, function (res) {
      if (res.code == "0") {
          console.log('模板消息',res.message)
      }
    })
  },
  /**
   * 跳转至预览编辑页面
   */
  goPreview:function(){
    let options = this.data.options;
    wx.navigateTo({
      url: `../../mine/editPreview/editPreview?companyId=${options.companyId}&positionId=${options.positionId}&fansId=${options.fansId}&shareFansId=${options.shareFansId}&recomType=${options.recomType}&activityId=${options.activityId}`,  
    })
  },
  /**
  * 返回修改
  */
  goModify: function (e) {
      this.setData({
        headType:'1',
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