// pages/generation/companyList/companyList.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")
var amapFile = require('../../../utils/amap-wx.js');
var utils = require('../../../utils/util.js');
var amapKey = '519819b794296fda61370f3c4d045ff6';
var myAmapFun = new amapFile.AMapWX({ key: amapKey });

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    pageNum: 1,
    currentFilterTab: 0,
    domainList: [],
    domainIndex: 0,
    scales: [
      {
        value: 0,
        label: "全部"
      },
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
    scaleIndex: 0,
    companyList: [],
    notReadCount: 0,
    loading: false,
    noMore: false,
    noData: false,
    currentCity:{
      city: '', citycode: '', location:''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.hideTabBar();
    this.getLocation();
    this.getAllCompanyDomain();
    // let _this = this;
    // let globalData = getApp().globalData;
    // let cb = (data) => {
    //   this.setData({
    //     notReadCount: data
    //   })
    // }
    // this.setData({
    //   pageNum: 1,
    //   companyList: [],
    //   domainIndex: 0,
    //   scaleIndex: 0,
    //   inputShowed: false,
    //   inputVal: ""
    // })
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
    // let _this = this;
    // let globalData = getApp().globalData;
    // let cb = (data) => {
    //    this.setData({
    //     notReadCount: data
    //   })
    // }
    // this.setData({
    //   pageNum: 1,
    //   companyList: [],
    //   domainIndex: 0,
    //   scaleIndex: 0,
    //   inputShowed: false,
    //   inputVal: ""
    // })
    // if (!globalData.fansId) {
    //   user.login((data) => {
    //     this.getCompanyList();
    //     commonApi.getAllNotReadCount(cb);
    //   });
    // } else {
    //   this.getCompanyList();
    //   commonApi.getAllNotReadCount(cb);
    // }
     
    let searchCity = getApp().globalData.searchCity;
    if (searchCity){
      this.setData({
        'currentCity.city': searchCity,
        pageNum: 1,
        companyList: [],
        // domainIndex: 0,
        // scaleIndex: 0,
        // inputShowed: false,
        // inputVal: ""
      })
      if (searchCity == '未知'){
        this.setData({
          noData:true,
          noMore:false
        })
      }else{
        this.getCompanyList();
      }
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
    this.setData({
      'currentCity.city': ''
    })
    getApp().globalData.searchCity = '';
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      pageNum: 1,
      companyList: [],
      domainIndex: 0,
      scaleIndex: 0,
      inputShowed: false,
      inputVal: ""
    })
    this.getCompanyList(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('reachBottom')
    if (!this.data.noMore && !this.data.noData) {
      this.data.pageNum++;
      this.getCompanyList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // },
  getLocation(){
    let _this = this;
    //会弹是否允许获取地理位置框
    myAmapFun.getRegeo({
      success: function (data) {
        //确定成功回调
        let _data = data[0].regeocodeData.addressComponent
        console.log('所在城市',_data)
        _this.setData({
          currentCity: { city: _data.city, citycode: _data.citycode, location: _data.streetNumber.location }
        })
        _this.getCompanyList();
        getApp().globalData.locationCity = _data.city;
      },
      fail: function (info) {
        //拒绝失败回调
        // if (info.errMsg == 'getLocation:fail auth deny'){
           _this.setData({
              'currentCity.city':'未知',
               noData:true,
            })
           getApp().globalData.locationCity = '未知';
            wx.showModal({
              title: '提示',
              content: '您拒绝了授权，请删除小程序重新进入授权，否则部分功能无法使用。',
            })    
        // }        
      }
    })
  },
  showInput: function () {
    wx.navigateTo({
      url: '../companySearch/companySearch',
    })
    // this.data.timestamp = +new Date();
    // this.setData({
    //   inputShowed: true
    // });
  },
  hideInput: function () {
    if (+new Date() - this.data.timestamp < 888) {
      return;
    }
    this.setData({
      inputShowed: false,
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  /**
   * 搜索
   */
  confirmSearch(e) {
    this.setData({
      pageNum: 1,
      companyList: [],
    })
    this.getCompanyList();
  },
  /**
   * 查询公司行业列表
   */
  getAllCompanyDomain: function (cb) {
    var _this = this;
    var method = "miniRecruit/getAllCompanyDomain";
    var param = JSON.stringify({});
    var successd = function (res) {
      if (res.code == 0) {
        _this.setData({
          domainList: res.data
        })
        if (cb) {
          cb()
        }
      }
    };
    network.post('/api.do', { method: method, param: param }, successd);
  },
  /**
   *  查询公司列表 
   */
  getCompanyList(cb) {
    let globalData = getApp().globalData, auditStatus = null, showStatus = null;
    this.setData({
      loading: true,
      noMore: false,
      noData: false
    })
    if (globalData.companyType == 1 || globalData.companyType == 2) {
      auditStatus = 1;
      showStatus = 1;
    }
    let param = {
      companyinfoPid: globalData.companyinfoPid,
      area: this.data.currentCity.city == '全国' ? '' : this.data.currentCity.city,
      keyWord: this.data.inputVal,
      showStatus: showStatus,
      auditStatus: auditStatus,
      pageSize: 10,
      pageNum: this.data.pageNum,
      countPosition: 1
    }
    if (this.data.scaleIndex > 0) {
      param.scale = this.data.scaleIndex;
    }
    if (this.data.domainIndex > 0) {
      param.industry = this.data.domainIndex;
    }
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyList',
      param: JSON.stringify(param)
    }, (res) => {
      this.setData({
        loading: false
      })
      if (res.code == '0' && res.data) {
        this.setData({
          companyList: this.data.companyList.concat(res.data.list)
        })
        if (this.data.companyList.length > 0 && res.data.list.length < 10) {
          this.setData({
            noMore: true
          })
        }
        if (this.data.pageNum == 1 && res.data.list.length == 0) {
          this.setData({
            noData: true
          })
        }
      } else {
        wx.showToast({
          title: res.message,
        })
      }
      cb && cb();
    })
  },
  /**
   * 打开筛选条件
   */
  selectFilter(e) {
    let { filter } = e.currentTarget.dataset;
    if (this.data.currentFilterTab == filter) {
      this.setData({
        currentFilterTab: 0
      })
    } else {
      this.setData({
        currentFilterTab: filter
      })
    }
  },
  /**
   * 点击遮罩
   */
  closeFilter() {
    this.setData({
      currentFilterTab: 0
    })
  },
  /**
   * 选择规模
   */
  selectScale(e) {
    let val = e.currentTarget.dataset.val;
    this.setData({
      scaleIndex: val * 1
    })
    setTimeout(()=>{
      this.confirm();
    },100)
  },
  /**
   * 选择行业
   */
  selectDomain(e) {
    let val = e.currentTarget.dataset.val;
    this.setData({
      domainIndex: val * 1
    })
    setTimeout(() => {
      this.confirm();
    }, 100)
  },
  /**
   * 重置
   */
  reset() {
    if (this.data.currentFilterTab == 1) {
      this.setData({
        scaleIndex: 0
      })
    }
    if (this.data.currentFilterTab == 2) {
      this.setData({
        domainIndex: 0
      })
    }
  },
  /**
   * 筛选确定
   */
  confirm() {
    this.setData({
      currentFilterTab: 0,
      pageNum: 1,
      companyList: []
    })
    this.getCompanyList();
  },
  /**
   * 跳转
   */
  linkTo(e) {
    let { id } = e.currentTarget.dataset;
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    wx.navigateTo({
      url: `../companyDetail/companyDetail?id=${id}`,
    })
  },
  //跳转消息中心
  goChatList() {
    wx.navigateTo({
      url: '../chatList/chatList',
    })
  },
  //跳转创建
  goCreate() {
    wx.navigateTo({
      url: '../create/create',
    })
  },
  goCity(){
    wx.navigateTo({
      url: '../cityList/cityList?city=' + this.data.currentCity.city,
    })
  }
})