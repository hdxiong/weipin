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
    region: ['浙江省', '杭州市'],    //设置初始化地址
    workTypes:[
      {name:'全职',value:1},
      { name: '兼职', value: 2 },
      { name: '实习', value: 3 },
    ],
    workTypeIndex:0,
    salaryRange: [[], []],
    salaryValue:[0,0],    //设置月薪范围
    model: {
      maxSalary: 0,
      expectPosition: '',
      workType: 1,     //默认全职      
      minSalary: 0,
      expectPlace: ''
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
     this.initSalaryRange()
     this.setData({
       fansId: options.fansId,
     })
     this.getResumeInfoByRoute()
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
 * 获取信息
 */
  getResumeInfoByRoute: function () {
    let _this = this;
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'jobpref',
    }
    network.post("/api.do", {
      method: "weiPinSp/getResumeInfoByRoute",
      param: JSON.stringify(param)
    }, function (res) {
      if (res.code == "0") {
        if (res.data.model.expectPlace){
          _this.data.region = res.data.model.expectPlace.split(" ")
        }
        _this.setData({
          model: res.data.model,
          workTypeIndex: res.data.model.workType ? res.data.model.workType-1 : 0,
          region: _this.data.region,
          salaryValue: [res.data.model.minSalary, res.data.model.maxSalary]
        })
      } else {
        utils.toggleToast(_this, res.message)
      }
    })
  },
  /**
   * input事件
   */
  operateInput:function(e){
    let event = e.currentTarget.dataset.event
    switch (event) {
      case 'input':
        this.setData({
          ['model.expectPosition']: e.detail.value
        })
        break;
      case 'clear':
        this.setData({
          ['model.expectPosition']: ''
        })
        break;
      default:
        break;
    }
  },
  /**
   *  选择工作类型
   */
  bindWorkTypeChange: function (e) {
    console.log(typeof e.detail.value)
    this.setData({
      workTypeIndex: parseInt(e.detail.value),
      ['model.workType']: parseInt(e.detail.value) + 1
    })
  },
  /**
   * 选择地址
   */
  bindRegionChange:function(e){
    e.detail.value.pop();   //删除县区项 
    this.setData({
      region: e.detail.value,
      ['model.expectPlace']: e.detail.value.join(" ")
    })
    console.log(this.data.region,this.data.model)
  },
  /**
   * 选择薪资范围
   */
  bindSalaryChange:function(e){
    let selectedVal = e.detail.value    //返回数组
    let salaryRange = this.data.salaryRange
    this.setData({
      salaryValue: selectedVal,
      ['model.minSalary']: salaryRange[0][selectedVal[0]],
      ['model.maxSalary']: salaryRange[1][selectedVal[1]],
    })
    console.log(this.data.salaryValue)
  },
  /**
   *  初始化薪资数据
   */
  initSalaryRange:function(){
    let minTotal = 20, maxTotal = 40;  
    for(let i = 1; i <= minTotal; i++){
      this.data.salaryRange[0].push(i)
    }
    for (let j = 1; j <= maxTotal; j++) {
      this.data.salaryRange[1].push(j)
    }
    this.setData({
      salaryRange: this.data.salaryRange
    })
  },
  /**
   * 确保右边大于左边
   */
  columnchange:function(e){
      console.log(e.detail)
      let detail = e.detail, sv = this.data.salaryValue;
      if(detail.column === 0){
        this.setData({
          ['salaryValue[0]']: detail.value
        })
        if (detail.value > sv[1]){
          this.setData({
            salaryValue:[detail.value,detail.value]
           })
        }
      }
      if (detail.column === 1) {
        this.setData({
          ['salaryValue[1]']: detail.value
        })
        if (sv[0] > detail.value) {
          this.setData({
            salaryValue: [detail.value, detail.value]
          })
        }
      }
  },
  /**
  * 保存
  */
  save: function () {
    let _this = this
    if(this.data.workTypeIndex == 0){  //防止没选择，使用默认的全职
      _this.data.model.workType = 1
    }
    let param = {
      quickSpFansId: _this.data.fansId,
      route: 'jobpref',
      model: _this.data.model
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