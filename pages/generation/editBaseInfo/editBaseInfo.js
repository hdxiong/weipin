// pages/generation/editBaseInfo/editBaseInfo.js
let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerSrc:'https://aijuhr.com/upload/quickSp/default/quickSpBanner.jpg',
    logoSrc:'/images/default-logo.png',
    showCompanyList:false,
    companyList:[],
    domainList:[],
    domainIndex:0,
    scales: [
      {
        value: 1,
        label: "0-50人"
      },
      {
        value: 2,
        label: "50-100人"
      },
      {
        value: 3,
        label: "100-500人"
      },
      {
        value: 4,
        label: "500-1000人"
      },
      {
        value: 5,
        label: "1000人以上"
      }
    ],
    scaleIndex:0,
    companyInfo: {
      id: '',
      logoId: '',
      companyName:'',
      industryId: -1,
      scaleId: -1,
      companyAddress: '',
      contactMan:'',
      companyPhone: '',
      introduction:'',
      loginPhone: '',
      longitude:'',
      latitude:'',
      provinceCode:'',
      cityCode:'',
      countyCode:'',
      areaCodeName:''
    },
    cityArray:[],
    addMargin:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
    this.getAllCompanyDomain(()=>{
      this.getCompanyBasicInfo()
    })
    this.setData({
      ['companyInfo.loginPhone']: (getApp().globalData.hrUser && getApp().globalData.hrUser.loginPhone) || getApp().globalData.phoneNumber,
    })
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
    this.setData({
      ['companyInfo.companyAddress']: getApp().globalData.companyAddress,
      ['companyInfo.longitude']: getApp().globalData.longlat ? getApp().globalData.longlat.longitude : '',
      ['companyInfo.latitude']: getApp().globalData.longlat ? getApp().globalData.longlat.latitude : ''
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
   * 获取公司信息
   */
  getCompanyBasicInfo(){
    network.post('/api.do',{
      method:'weiPinSp/getCompanyBasicInfoNew',
        param:JSON.stringify({
          reqType:1,
          sessionId: wx.getStorageSync('sessionId'),
          companyinfoId: getApp().globalData.hrUser.companyinfoId,
          visitType:0
        })
    },(res)=>{
      if(res.code == 0 && res.data){
        this.fillData(res.data);
      }
    })
  },
  /**
   * 编辑状态先填充数据
   */
  fillData: function (companyBaseInfo){   
      getApp().globalData.companyAddress = companyBaseInfo.companyAddress;
      getApp().globalData.longlat = { longitude: companyBaseInfo.longitude, latitude: companyBaseInfo.latitude}
      this.setData({
        ['companyInfo.id']: companyBaseInfo.id,
        ['companyInfo.companyName']: companyBaseInfo.companyName,
        ['companyInfo.logoId']: companyBaseInfo.logoId,
        ['companyInfo.contactMan']: companyBaseInfo.contactMan,
        ['companyInfo.companyAddress']: companyBaseInfo.companyAddress,
        ['companyInfo.longitude']: companyBaseInfo.longitude,
        ['companyInfo.latitude']: companyBaseInfo.latitude,
        ['companyInfo.companyPhone']: companyBaseInfo.companyPhone,
        ['companyInfo.industryId']: companyBaseInfo.industryId,
        ['companyInfo.scaleId']: companyBaseInfo.scaleId,
        ['companyInfo.introduction']: companyBaseInfo.introduction || '',
        ['companyInfo.provinceCode']: companyBaseInfo.provinceCode,
        ['companyInfo.cityCode']: companyBaseInfo.cityCode,
        ['companyInfo.countyCode']: companyBaseInfo.countyCode,
        ['companyInfo.areaCodeName']: companyBaseInfo.areaCodeName,
        cityArray: companyBaseInfo.areaCodeName ? companyBaseInfo.areaCodeName.split('-') : [],
        logoSrc: companyBaseInfo.logoUrl
      })
      let domainIndex = this.data.domainList.findIndex((item)=>{
        return item.id == companyBaseInfo.industryId
      })
      let scaleIndex = this.data.scales.findIndex((item) => {
        return item.value == companyBaseInfo.scaleId
      })
      this.setData({
        domainIndex: domainIndex === -1 ? 0 : domainIndex,
        scaleIndex: scaleIndex === -1 ? 0 : scaleIndex,    
      })
  },
  /**
   * 添加logo
   */
  chooseLogoImage: function (e) {
    commonApi.uploadImage('album',(res) => {
      this.setData({
        ['companyInfo.logoId']: res.id,
        logoSrc: res.url
      })
    })

  },
  /**
   * 监听input事件
   */
  operateInput: function (e) {
    let prop = e.currentTarget.dataset.prop
    if(e.detail.cursor > 0){    
      let value = '';
      if (prop == 'companyInfo.introduction'){
        value = e.detail.value.replace(/^\s+/, '')
      }else{
        value = e.detail.value.trim()
      }
      this.setData({
        [prop]: value
      })
      if (prop === 'companyInfo.companyName' && value) {
        this.searchCompany(value)
      }
    }else{
      this.setData({
        [prop]: ''
      })
    }
  },
  /**
   * 
   */
  onblur(){
      this.setData({
        showCompanyList:false
      })
  },
  /**
   * 模糊搜索公司列表
   */
  searchCompany(value){
    network.post('/api.do', {
      method: "weiPinSp/searchCompany",
      param: JSON.stringify({
        companyName: value
      })
    }, (res) => {
      if (res.code == 0 && res.data && res.data.length > 0) {
        this.setData({
          showCompanyList: true,
          companyList:res.data
        })
      } else {
        this.setData({
          showCompanyList: false,
        })
      }
    })
  },
  /**
   * 选择picker
   */
  bindPickerChange: function (e) {
    let index = e.currentTarget.dataset.index
    switch(index){
      case '1':
        this.setData({
          domainIndex: e.detail.value,
          ['companyInfo.industryId']: this.data.domainList[e.detail.value].id
        })
        break;
      case '2':
        this.setData({
          scaleIndex: e.detail.value,
          ['companyInfo.scaleId']: this.data.scales[e.detail.value].value
        })
        break;
      default:
        break;
    }
  },
  /**
  * 选择省市区
  */
  bindRegionChange: function (e) {
    this.setData({
      cityArray: e.detail.value,
      'companyInfo.areaCodeName': e.detail.value.join('-')
    })
    if(e.detail.code){
      this.setData({
        'companyInfo.provinceCode': e.detail.code[0],
        'companyInfo.cityCode': e.detail.code[1],
        'companyInfo.countyCode': e.detail.code[2],
      })
    }
  },
  //查询公司行业列表
  getAllCompanyDomain:function(cb) {
    var _this = this;
    var method = "miniRecruit/getAllCompanyDomain";
    var param = JSON.stringify({});
    var successd = function (res) {
      if (res.code == 0) {
        _this.setData({
          domainList:res.data
        })
        if(cb){
          cb()
        }
      }
    };
    network.post('/api.do', { method: method, param: param}, successd);
  },
  /**
   * 检测数据
   */
  checkFormData:function(){
    let companyInfo = this.data.companyInfo;
    let telReg = /(^0\d{2,3}-\d{7,8}$)|(^1[3|4|5|6|7|8|9][0-9]{9}$)/;
    if (!telReg.test(companyInfo.companyPhone)){
        wx.showToast({
          icon:'none',
          title: '请填写正确的公司联系方式',
        })
        return false;
    }
    return true;
  },
  /**
   * 保存
   */
  save:function(e){
    console.log(e.detail.formId)
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    if(!this.checkFormData()){
      return;
    }    
    network.post('/api.do',{
      method: "weiPinSp/saveCompanyBasicInfoNew",
      param: JSON.stringify({
        companyBasicInfo:this.data.companyInfo,
        quickSpFansId: getApp().globalData.fansId,
        sessionId: wx.getStorageSync('sessionId')
      })
    },(res)=>{
      if(res.code == '0'){      
        if (res.data != this.data.companyInfo.id){
          //新建公司信息
          getApp().globalData.hrUser.companyinfoId = res.data
          wx.setStorageSync('hrUser', { companyinfoId: res.data, loginPhone: getApp().globalData.hrUser.loginPhone })
        }      
        wx.navigateBack()
      }else{
        wx.showToast({
          icon:'none',
          title: res.message,
        })
      }
    })
  },
  linkTo: function (e) {
    let url = e.currentTarget.dataset.url;
    switch(url){
      case '1':
        wx.navigateTo({
          url: '../searchAddress/searchAddress',
        })
        break;

    }
   
  },
  selectCompany(e){
    let item = e.currentTarget.dataset.item
    this.setData({
      showCompanyList:false,
      ['companyInfo.companyName']:item
    })
  },
  /**
   * 安卓手机键盘挡住文本域的问题处理
   */
  taFocus(e){
     let systemInfo = wx.getSystemInfoSync();
     if (systemInfo.system.indexOf("Android")>-1){
        this.setData({
          addMargin:true
        })
        setTimeout(()=>{
          //延时是为了确保margin样式加上之后再滚动
          let top = systemInfo.windowHeight + 500;
          wx.pageScrollTo({
            scrollTop: top,
            duration: 30
          })
        },300)
     }  
  },
  taBlur(e){
    if (this.data.addMargin){
      this.setData({
        addMargin: false
      })
    }
  }
})