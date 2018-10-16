//app.js

App({
  onLaunch: function () {

  },
  globalData: {
    companyId:'',
    companyName:'',
    companyAddress:'',
    searchCity:'',       //所搜索的城市
    locationCity:'',     //当前定位的城市
    phoneNumber:'',
    longlat:null,         //公司地址经纬度
    shareCompanyInfoId: '',    //来自分享的公司信息id
    fansId: '', //求职者fansId 
    hrUser: null,    //hr 标识信息
    userInfo: null,
    companyType: '',    //1:RPO企业版公司 2:RPO企业的客户公司 3:微聘普通用户的公司
    companyinfoPid:'',  //RPO公司id
    rpoUserId:''        //RPO

  }
})