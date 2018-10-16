// pages/generation/positionList/positionList.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")

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
    positionList: [],
    notReadCount: 0,
    loading: false,
    noMore: false,
    noData: false,
    positionLogoSrc:'',
    showDefaultLogo:false,
    showAuth:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!user.isAuthUserInfo()){
        this.setData({
          showAuth:true
        })
        wx.hideTabBar();
    }
    let _this = this;
    let globalData = getApp().globalData;
    if(options.comPid){
      globalData.companyinfoPid = options.comPid;
      globalData.companyType = 2;
    }
    if (options.scene) {
      //rpo在pc系统扫小程序码进入
      var scene = decodeURIComponent(options.scene)
      var arr1 = scene.split("&");
      var obj = {};
      arr1.forEach(function (item) {
        obj[item.split('=')[0]] = item.split('=')[1]
      })
      if(obj.userId){
        globalData.rpoUserId = obj.userId;
      }
      if(obj.cPid){
        globalData.companyinfoPid = obj.cPid;
        globalData.companyType = obj.type;
      }
    }
    this.setData({
      pageNum: 1,
      positionList: [],
      domainIndex: 0,
      scaleIndex: 0,
      inputShowed: false,
      inputVal: ""
    })
    let cb = (data) => {
      this.setData({
        notReadCount: data
      })
    }
    if (!globalData.fansId) {
      user.login((data) => {
        if (globalData.companyType == 1 || globalData.companyType == 2) {
          this.getBannerAndLogo();
        }else{
          this.setData({
            showDefaultLogo:true
          })
        }
        this.getPositionList();
        commonApi.getAllNotReadCount(cb);

      });
    } else {
      if (globalData.companyType == 1 || globalData.companyType == 2) {
        this.getBannerAndLogo();
      }else{
        this.setData({
          showDefaultLogo: true
        })
      }
      this.getPositionList();
      commonApi.getAllNotReadCount(cb);
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
    if(getApp().globalData.fansId){
      let cb = (data) => {
        this.setData({
          notReadCount: data
        })
      }
      commonApi.getAllNotReadCount(cb);
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
    let globalData = getApp().globalData;
    this.setData({
      pageNum: 1,
      positionList: [],
      domainIndex: 0,
      scaleIndex: 0,
      inputShowed: false,
      inputVal: ""
    })
    this.getPositionList(() => {
      wx.stopPullDownRefresh();
    });
    if (globalData.companyType == 1 || globalData.companyType == 2) {
      this.getBannerAndLogo();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('reachBottom')
    if (!this.data.noMore && !this.data.noData) {
      this.data.pageNum++;
      this.getPositionList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
     let _globalData = getApp().globalData;
    console.log('shareshare',_globalData)
    if (_globalData.companyType == 1 || _globalData.companyType == 2){
       return {
         path: `/pages/generation/positionList/positionList?comPid=${_globalData.companyinfoPid}&companyType=${_globalData.companyType}`
       }
    }
  },
  showInput: function () {
    this.data.timestamp = +new Date();
    this.setData({
      inputShowed: true
    });
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
      positionList: [],
    })
    this.getPositionList();
  },
  /**
 * 获取banner
 */
  getBannerAndLogo() {
    var _this = this;
    var method = "rpoPlatform/getBannerAndLogo";
    var param = JSON.stringify({
      companyId: getApp().globalData.companyinfoPid
    });
    var successd = function (res) {
      if (res.code == 0 && res.data.logoUrl) {
        _this.setData({
          positionLogoSrc: res.data.logoUrl,
        })
      }else{
        _this.setData({
          showDefaultLogo: true
        })
      }
    };
    network.post('/api.do', { method: method, param: param }, successd);
  },
  /**
   *  查询职位列表 
   */
  getPositionList(cb) {
    let _globlData = getApp().globalData;
    let positionStatus = null;
    this.setData({
      loading: true,
      noMore: false,
      noData: false
    })
    if (_globlData.companyType == 1 || _globlData.companyType == 2) {
      positionStatus = 1;
    }
    let param = {
      positionName: this.data.inputVal,
      positionStatus: positionStatus,
      pageSize: 10,
      pageNum: this.data.pageNum,
      companyType:_globlData.companyType ? _globlData.companyType : 3 
    }

    if (_globlData.companyType == 1 || _globlData.companyType == 2){
      param.companyInfoPId = _globlData.companyinfoPid;
      if (_globlData.hrUser && _globlData.hrUser.companyinfoId) {
        param.companyInfoId = _globlData.hrUser.companyinfoId;
      }
    }
    network.post('/api.do', {
      method: 'weiPinPosition/getWeiPinCompanyPositionList',
      param: JSON.stringify(param)
    }, (res) => {
      // network.post('/api.do',{
      //   method:'weiPinPosition/updatePositionViews',
      //   param:JSON.stringify({})
      // })
      this.setData({
        loading: false
      })
      if (res.code == '0' && res.data) {
        this.setData({
          positionList: this.data.positionList.concat(res.data.positionList)
        })
        // if ((_globlData.companyType == 1 || _globlData.companyType == 2) && res.data.positionLogo){
        //     this.setData({
        //       positionLogoSrc: res.data.positionLogo
        //     })
        // }
        if (this.data.positionList.length > 0 && res.data.positionList.length < 10) {
          this.setData({
            noMore: true
          })
        }
        if (this.data.pageNum == 1 && res.data.positionList.length == 0) {
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
  },
  /**
   * 选择行业
   */
  selectDomain(e) {
    let val = e.currentTarget.dataset.val;
    this.setData({
      domainIndex: val * 1
    })
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
      positionList: []
    })
    this.getPositionList();
  },
  /**
   * 跳转
   */
  linkTo(e) {
    let { item } = e.currentTarget.dataset;
    commonApi.saveFormId({
      formId: e.detail.formId
    })

    wx.navigateTo({
      url: `/pages/position/detail/detail?positionId=${item.id}&cId=${item.weipinCompanyinfoId}&from=positionList`,
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
})