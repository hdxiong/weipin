
let network = require("../../../utils/network.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading:true,
    positionId:'',
    positionName: '',
    workCity: '',
    workYear: '',
    educationRequire: '',
    salary: '',
    positionTypeStr:'',
    posiNum:'',
    positionDesc: '',
    positionTags: [],
    companyName: "",
    scaleStr: "",
    industryStr: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
        positionId: options.positionId
      })
      this.getPositionDetail()
      this.getCompany()
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
 * 获取职位详情
 */
  getPositionDetail: function () {
    network.post('/api.do', {
      method: "weiPinSp/getPositionDetailNew",
      param: JSON.stringify({
        positionId: this.data.positionId,
        operType: 1,
        reqType:2
      })
    }, (res) => {
      this.setData({
        loading:false
      })
      if (res.code == '0') {
        let _data = res.data
        _data.positionDesc = _data.positionDesc.replace(/\n/g, '<br/>')
         this.setData({
           positionName: _data.positionName,
           workCity: _data.workCity,
           workYear: _data.workYear,
           educationRequire: _data.educationRequire,
           salary: _data.salary,
           positionTypeStr: _data.positionTypeStr,
           posiNum: _data.posiNum,
           positionTags: _data.positionTagList,
           positionDesc: _data.positionDesc
         })
      }
    })
  },
  getCompany(){
    network.post('/api.do',{
      method:'weiPinSp/getCompanyBasicInfoNew',
      param:JSON.stringify({
        reqType:1,
        sessionId: wx.getStorageSync('sessionId'),
        companyinfoId: getApp().globalData.hrUser.companyinfoId, 
        visitType:0
      })
    }, res => {
      if (res.code == 0 && res.data) {
        this.setData({
          companyName: res.data.companyName,
          scaleStr: res.data.scaleStr,
          industryStr: res.data.industryStr
        })
      }
    })
  },
  /**
   * 跳转
   */
  linkTo(){
    console.log(getCurrentPages())
    let pages = getCurrentPages()
    if (pages.some((item) => { return item.route === 'pages/home/newHome/newHome' })) {
      let index = pages.findIndex((item)=>{
        return item.route === 'pages/home/newHome/newHome'
      })
      let delta = pages.length - index - 1;
      wx.navigateBack({
        delta: delta
      })
    } else {
      getApp().globalData.shareCompanyInfoId = '';
      wx.navigateTo({
        url: `../../home/newHome/newHome`,
      })
    }
  }
})