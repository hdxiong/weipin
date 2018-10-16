// pages/generation/createPosition/createPosition.js

let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
      step:1,
      pageType:'',    //'':新建,'edit':编辑，'copy':复制
      positionId:'',    //职位id
      isThousandUnits:false,
      positionTags:[
        { id: 1, name: "五险一金" }, { id: 2, name: "年底双薪" }, { id: 3, name: "带薪年假" }, { id: 4, name: "弹性工作" },{ id: 5, name: "交通补贴" },{ id: 6, name: "节日福利" },
        { id: 7, name: "住房补贴" },{ id: 8, name: "无试用期" },{ id: 9, name: "定期体检" },{ id: 10, name: "免费班车" },{ id: 11, name: "员工旅游" }, { id: 12, name: "每年多次调薪" },
        { id: 13, name: "加班补助" },{ id: 14, name: "股票期权" },{id: 15, name: "通讯补贴"},{ id: 16, name: "年终分红" },{ id: 17, name: "健身俱乐部" },{ id: 18, name: "包住" },
        { id: 19, name: "包吃" },{ id: 20, name: "餐补" }
      ],
      positionTagIdArray: [1, 2, 3, 4, 5, 9, 10, 17],
      // region: ['浙江省', '杭州市'],    //设置初始化地址
      workYears: [
        { value: 1, label: "不限" },
        { value: 2, label: "应届" },
        { value: 3, label: "1年以下" },
        { value: 4, label: "1-3年" },
        { value: 5, label: "3-5年" },
        { value: 6, label: "5-10年" },
        { value: 7, label: "10年以上" }
      ],
      workYearIndex:0,
      educations: [
        { value: 1, label: "不限" },
        { value: 2, label: "高中以下" },
        { value: 7, label: "高中" },
        { value: 3, label: "大专" },
        { value: 4, label: "本科" },
        { value: 5, label: "硕士" },
        { value: 6, label: "博士" }
      ],
      educationIndex:0,
      positionTypes: [
        { value: 1, label: "全职" },
        { value: 2, label: "兼职" },
        { value: 3, label: "实习" },
      ],
      positionTypeIndex:0,
      quickSpPosition: {
        "id": null,
        "positionName": "",
        "workCityArray": [],
        "workYear": 1,
        "educationRequire": 1,
        "positionSalaryLowest": '',
        "positionSalaryHighest": '',
        "salaryIsMianYi": 0,
        "positionDesc": "",
        "positionType": 1,
        "posiNum": '',
        "positionTagIds": ""
      },
      addMargin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let ty = options.pageType
    let id = options.positionId
    if(ty){
      this.setData({
        pageType:ty,
        positionId: id
      })
      this.getPositionDetail()
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
 * 监听input事件
 */
  operateInput: function (e) {
    let prop = e.currentTarget.dataset.prop
    if (prop == "quickSpPosition.positionDesc"){
      var value = e.detail.value.replace(/^\s+/,'')  //去除前面的空格
    }else{
      var value = e.detail.value.trim()
    }
    this.setData({
      [prop]: value
    })
  },
  /**
 * 选择地址
 */
  bindRegionChange: function (e) {
    console.log(e.detail)
    e.detail.value.pop();   //删除县区项 
    this.setData({
      ['quickSpPosition.workCityArray']: e.detail.value
    })
  },
  /**
   *  选择picker
   */
  bindAccountChange: function (e) {
    let index = e.currentTarget.dataset.index
    switch (index) {
      case '1':
        this.setData({
          workYearIndex: e.detail.value,
          ['quickSpPosition.workYear']: this.data.workYears[e.detail.value].value
        })
        break;
      case '2':
        this.setData({
          educationIndex: e.detail.value,
          ['quickSpPosition.educationRequire']: this.data.educations[e.detail.value].value
        })
        break;
      case '3':
        this.setData({
          positionTypeIndex: e.detail.value,
          ['quickSpPosition.positionType']: this.data.positionTypes[e.detail.value].value
        })
        break;
      default:
        break;
    }
  },
  /**
   * 是否k为单位
   */
  radioChange: function (e) {
    this.setData({
      isThousandUnits: !this.data.isThousandUnits,
      ['quickSpPosition.salaryIsMianYi']: !this.data.isThousandUnits ? 1 : 0
    })
  },
  /**
   *  选择职位性质（事件委托） 
   */
  selectPositionType(e){
      let pt = e.target.dataset.pt;
      this.setData({
        ['quickSpPosition.positionType']:pt
      })
  },
  /**
   * 获取职位详情
   */
  getPositionDetail: function () {

    network.post('/api.do', {
      method: "weiPinSp/getPositionDetailNew",
      param: JSON.stringify({
        positionId: this.data.positionId,
        operType:2,
        reqType:2
      })
    }, (res)=>{
      if (res.code == '0') {
        let detail = res.data;
        if (detail.positionDesc.indexOf('<')>-1){
          //若为富文本,则去掉html标签
          var dd = detail.positionDesc.replace(/<\/?.+?>/g, "");
          var desc = dd.replace(/ /g, "");
        }else{
          var desc = detail.positionDesc
        }
        this.setData({
          ['quickSpPosition.positionName']: detail.positionName,
          ['quickSpPosition.workCityArray']: detail.workCityArray,
          ['quickSpPosition.workYear']: detail.workYear,
          ['quickSpPosition.educationRequire']: detail.educationRequire,
          ['quickSpPosition.positionSalaryLowest']: detail.positionSalaryLowest || '',
          ['quickSpPosition.positionSalaryHighest']: detail.positionSalaryHighest || '',
          ['quickSpPosition.salaryIsMianYi']: detail.salaryIsMianYi,
          ['quickSpPosition.positionDesc']: desc,
          ['quickSpPosition.positionType']: detail.positionType*1,
          ['quickSpPosition.posiNum']: detail.posiNum == 0 ? '' : detail.posiNum,
          ['quickSpPosition.positionTagIds']: detail.positionTagIdArray.join(),
          positionTagIdArray: detail.positionTagIdArray         
        })
        if (detail.salaryIsMianYi == 1){
          this.setData({
            isThousandUnits:true
          })
        } else if (detail.salaryIsMianYi == 0){
          this.setData({
            isThousandUnits: false
          })
        }
        let workYearIndex = this.data.workYears.findIndex((item) => {
          return item.value == detail.workYear
        })
        let educationIndex = this.data.educations.findIndex((item) => {
          return item.value == detail.educationRequire
        })
        let positionTypeIndex = this.data.positionTypes.findIndex((item) => {
          return item.value == detail.positionType
        })
        this.setData({
          workYearIndex: workYearIndex,
          educationIndex: educationIndex,
          positionTypeIndex: positionTypeIndex
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message,
        })
      }
    })
  },
  /**
   * 下一步
   */
  nextStep:function(){
    if (!this.data.isThousandUnits &&( this.data.quickSpPosition.positionSalaryLowest*1 >= this.data.quickSpPosition.positionSalaryHighest*1)) {
      wx.showToast({
        icon: 'none',
        title: '薪酬下限应小于薪酬上限',
      })
      return false;
    }
    this.setData({
      step:2
    })
  },
  /**
   * 选择职位亮点
   */
  chooseHeightlight:function(e){
    let item = e.currentTarget.dataset.item;
    let pTagIdArr = this.data.positionTagIdArray;
    var index = pTagIdArr.indexOf(item.id);
    if (index == -1) {
      if (pTagIdArr.length < 8) {
        pTagIdArr.push(item.id)
      }else{
        wx.showToast({
          icon:'none',
          title: '最多只能选择8个职位亮点',
        })
      }
    } else {
      pTagIdArr.splice(index, 1);
    }
    this.setData({
      positionTagIdArray: pTagIdArr
    })
  },
  /**
   * 上一步
   */
  preStep:function(e){
      commonApi.saveFormId({
        formId: e.detail.formId
      })
      this.setData({
        step:1
      })
  },
  /**
 * 保存
 */
  save: function (e) {
    commonApi.saveFormId({
      formId: e.detail.formId
    })
    let _this = this;
    if(_this.data.pageType == "edit"){
      _this.data.quickSpPosition.id = _this.data.positionId
    }
    if (!_this.data.quickSpPosition.posiNum){
      _this.data.quickSpPosition.posiNum = 0
    }
    _this.data.quickSpPosition.positionSalaryLowest = _this.data.quickSpPosition.positionSalaryLowest * 1;
    _this.data.quickSpPosition.positionSalaryHighest = _this.data.quickSpPosition.positionSalaryHighest * 1;
    _this.data.quickSpPosition.posiNum = _this.data.quickSpPosition.posiNum	* 1;
    _this.data.quickSpPosition.positionTagIds = _this.data.positionTagIdArray.join();
    console.log(getApp().globalData.hrUser);
    let params = {
      quickSpPosition: _this.data.quickSpPosition,
      spCompanyId: getApp().globalData.companyId,
      companyinfoId: getApp().globalData.hrUser.companyinfoId
    }
    network.post('/api.do', {
      method: "weiPinSp/savePositionNew",
      param: JSON.stringify(params)
    }, function (res) {
      if (res.code == '0') {
        console.log(getCurrentPages)
        if(_this.data.pageType){
          wx.navigateBack({
            delta: 1
          })
        }else{
          wx.navigateBack({
            delta: 1
          })
        }
      }else if(res.code == '8205'){
        wx.showModal({
          title: '提示',
          content: '您可发布的职位数已达上线，联系\n客服为您开通权限：15381033283',   //模拟器看不到换行，真机可以换行
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.message,
        })
      }
    })
  },
  /**
 * 安卓手机键盘挡住文本域的问题处理
 */
  taFocus(e) {
    let systemInfo = wx.getSystemInfoSync();
    if (systemInfo.system.indexOf("Android") > -1) {
      this.setData({
        addMargin: true
      })
      setTimeout(() => {
        //延时是为了确保margin样式加上之后再滚动
        let top = systemInfo.windowHeight + 500;
        wx.pageScrollTo({
          scrollTop: top,
          duration: 30
        })
      }, 300)
    }
  },
  taBlur(e) {
    if (this.data.addMargin) {
      this.setData({
        addMargin: false
      })
    }
  }
})