// pages/home/newHome/newHome.js
const utils = require("../../../utils/util.js")
let network = require("../../../utils/network.js")
const user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
        options:null,
        companyInfo:null,
        positionList:[],
        page:null,
        pageNum:1,
        tabIndex:1,
        isOpen:false,
        inputVal:'',
        inputShowed: false,
        tabsTop:null,
        tabsFixed:false,
        confirmInputVal:'',
        noData:false,
        showBack:1,
        notReadCount:0,
        showAuth:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!user.isAuthUserInfo()) {
      this.setData({
        showAuth: true
      })
    }
    let globalData = getApp().globalData;
    if(options){
      this.setData({
        options: options
      })
    }
    if (options.scene) {
      //海报扫码进入
      var scene = decodeURIComponent(options.scene)
      var arr1 = scene.split("&");
      var obj = {};
      arr1.forEach(function (item) {
        obj[item.split('=')[0]] = item.split('=')[1]
      })
      globalData.shareCompanyInfoId = obj.cId;
      if(obj.cPid){
        globalData.companyinfoPid = obj.cPid;
        // globalData.companyType = obj.comType;
        globalData.companyType = 2;
      }
      this.setData({
        showBack:0
      })
      // getApp().globalData.rpoUserId = obj.userId;
    } else if (options.cId) {
      //分享链接进入
      globalData.shareCompanyInfoId = options.cId;
      if (options.comPid) {
        globalData.companyinfoPid = options.comPid;
        globalData.companyType = 2;
      }
      if(options.fromShare){
        this.setData({
          showBack: 0
        })
      }
    }

    let cb = (data) => {
      this.setData({
        notReadCount: data
      })
    }
    if (globalData.fansId && globalData.hrUser) {
      //已登录
      this.getCompanyBasicInfo();
      this.getPositionList();
      this.sendTemplateMsg();
      commonApi.getAllNotReadCount(cb);
    } else {
      //未登录
      user.login((data) => {
        this.getCompanyBasicInfo();
        this.getPositionList();
        commonApi.getAllNotReadCount(cb);
      },()=>{
        this.sendTemplateMsg();
      })
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
    // this.setData({
    //   pageNum: 1,
    //   positionList:[],
    //   page:null
    // })
    // this.getPositionList();
    let cb = (data) => {
      this.setData({
        notReadCount: data
      })
    }
    commonApi.getAllNotReadCount(cb);
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
    // if (this.data.page && this.data.page.hasNext && this.data.tabIndex == 2 && this.data.positionList && this.data.positionList.length>0){
    //   this.setData({
    //     pageNum: ++this.data.pageNum
    //   })
    //   this.getPositionList()
    // }
  },
  onPageScroll:function(e){
    if(e.scrollTop>=this.data.tabsTop){
      this.setData({
        tabsFixed:true
      })
    }else{
      this.setData({
        tabsFixed:false
      })
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let  path = '';
    let _globalData = getApp().globalData;
    let companyInfoId = _globalData.shareCompanyInfoId ||  (_globalData.hrUser && _globalData.hrUser.companyinfoId);
    if (_globalData.companyType == 1 || _globalData.companyType == 2) {
      path = `/pages/home/newHome/newHome?cId=${companyInfoId}&comPid=${_globalData.companyinfoPid}&companyType=${_globalData.companyType}&fromShare=true`
    }else{
      path = `/pages/home/newHome/newHome?cId=${companyInfoId}&fromShare=true`;
    }
    return{
      title: this.data.companyInfo.companyName + '正在使用微聘小程序招聘，快来投个简历吧',
      path: path,
    }
  },
  /**
  * 获取公司信息
  */
  getCompanyBasicInfo() {
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyBasicInfoNew',
      param: JSON.stringify({
        reqType: 1,
        sessionId: wx.getStorageSync('sessionId'),
        visitFansId: getApp().globalData.fansId,
        companyinfoId: getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId),
        visitType:0
      })
    }, (res) => {
      if (res.code == 0) {
         if (res.data.introduction) {
            res.data.introduction = res.data.introduction.replace(/\n/g, '<br/>')
          }         
        this.setData({
          companyInfo: res.data
        })
        utils.getWxmlInfo('#tabs', (res) => {
          this.setData({
            tabsTop: res.top - 64
          })
          console.log(this.data.tabsTop)
        })
      }
    })
  },
  /**
* 获取职位列表
*/
  getPositionList() {
    network.post('/api.do', {
      method: 'weiPinSp/getPositionList',
      param: JSON.stringify({
        companyinfoId: getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId),
        positionName: this.data.inputVal,      
        pageNum:this.data.pageNum,
        pageSize:1000
      })
    }, (res) => {
      if (res.code == 0) {
        if (this.data.pageNum == 1 && res.data.positionList.length == 0){
          this.setData({
            noData:true
          })
          return;
        }else{
          this.setData({
            noData:false
          })
        }
        this.setData({
          positionList: this.data.positionList.concat(res.data.positionList),
          page:res.data.page
        })
      }
    })
  },
  /**
   * 获得焦点
   */
  onFocus(){
    this.setData({
      inputShowed: true
    });
  },
  /**
   * 失去焦点
   */
  onBlur(){
    this.setData({
      // inputVal:'',
      inputShowed: false
    });
  },
  /**
   * 输入完成进行搜索
   */
  confirmSearch(e){
    let val = e.detail.value   //输入框的值
    if (val !== this.data.confirmInputVal){
      this.setData({
        inputVal: val,
        positionList: [],
        pageNum: 1,
        confirmInputVal: val

      })
      this.getPositionList();
    }  

  },
  switchTab:function(e){
      let index = e.currentTarget.dataset.tab;
      // if(index == '2'){
      //   this.setData({
      //     pageNum: 1,
      //     positionList:[],
      //     page:null
      //   })
      //   this.getPositionList();
      // }
      this.setData({
        tabIndex:index
      })
  },
  downOrUp:function(e){
    this.setData({
      isOpen:!this.data.isOpen
    })
  },
  linkTo:function(e){
    let url = e.currentTarget.dataset.url;
    switch(url){
      case '1':
        wx.navigateTo({
          url: '../../generation/create/create',
        })
        // if(getCurrentPages().length > 1){
        //   wx.navigateBack()
        // }else{
        //   wx.navigateTo({
        //     url: '../../generation/newIndex/newIndex',
        //   })
        // }
        break;
      case '2':
        wx.switchTab({
          url: '../../generation/positionList/positionList',
        })
        break;
      case '3':
        let item = e.currentTarget.dataset.item;
        let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
        wx.navigateTo({
          url: `../../position/detail/detail?positionId=${item.id}&cId=${companyInfoId}`,
        })
        break;
      case '4':
        // let companyInfo = this.data.companyInfo;
        // wx.navigateTo({
        //   url: `../map/map?latitude=${companyInfo.latitude}&longitude=${companyInfo.longitude}`,
        // })
        break;
    }
    
  },
  /**
   * 跳转到详情页
   */
  goDetail(e){
    let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
    let dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
    })
  },
  /**
   * 新访客进入给分享者发送模板消息
   */
  sendTemplateMsg(){
    if (this.data.options.fromShare || this.data.options.scene){
      //来自分享打开，才发
      network.post('/weipin/newVisitor.do', {
        companyinfoId: getApp().globalData.shareCompanyInfoId,
        visitFansId: getApp().globalData.fansId
      }, (res) => {
        if (res.code == '0') {
          console.log('模板消息发送成功')
        } else {
          console.log(`weipin/newVisitor.do:${res.message}`)
        }
      })
    }
  },
  /**
 * 保存formId
 */
  saveFormId(e) {
    commonApi.saveFormId({
      formId: e.detail.formId
    })
  },
  /**
  * 保存用户信息
  */
  getUserInfo: function (e) {
    let dataset = e.currentTarget.dataset;
    let companyInfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
    if (!getApp().globalData.userInfo) {
      if (e.detail.errMsg == "getUserInfo:ok"){
        let _userInfo = Object.assign({}, e.detail.userInfo, { id: getApp().globalData.fansId })
        console.log(_userInfo)
        network.post('/weipin/saveQuickSpFans.do', {
          userInfo: JSON.stringify(_userInfo)

        }, (res) => {
            getApp().globalData.userInfo = e.detail.userInfo
            wx.setStorageSync('userInfo', e.detail.userInfo)              
            wx.navigateTo({
              url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
            })
        })
      }else{
         //拒绝授权errMsg:"getUserInfo:fail auth deny"也能跳到详情页，只是不显示该用户的头像
        wx.navigateTo({
          url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
        })
      }     
    } else {
      wx.navigateTo({
        url: `../../position/detail/detail?positionId=${dataset.positionid}&cId=${companyInfoId}`,
      })
    }
  },
  //跳转消息中心
  goChatList() {
    wx.navigateTo({
      url: '../../generation/chatList/chatList',
    })
  },
})