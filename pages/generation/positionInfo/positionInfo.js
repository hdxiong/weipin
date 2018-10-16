
let network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    progress:2,
    pageNum:1,
    page:{},
    positionList:[],
    currentList:[],
    focusId:'0',
    open:false,
    operationArr:[
      { src: '/images/bianj.png', text: '编辑', 'type': 'edit' },
      { src: '/images/operation_delete.png', text: '删除', 'type': 'deleted' },
      { src: '/images/operation_copy.png', text: '复制', 'type': 'copy' }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.operation = this.selectComponent("#operation");
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
      pageNum: 1,
      page: {},
      positionList: [],
      currentList: []
    })
    this.getPositionList()
    // this.operation._closed()
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
    if (this.data.page.hasNext && this.data.currentList.length == 10){
      this.data.pageNum++
      this.getPositionList()
    }

  },
  /**
   *  获取职位列表
   */
  getPositionList:function(){
    network.post('/api.do', {
      method: 'weiPinSp/getPositionList',
      param: JSON.stringify({
        spCompanyId: getApp().globalData.companyId,
        companyinfoId: getApp().globalData.hrUser.companyinfoId,
        pageNum:this.data.pageNum,
        pageSize:10
      })
    }, (res) => {
      if(res.code == "0" && res.data){
        this.setData({
          page:res.data.page,
          positionList: this.data.positionList.concat(res.data.positionList),
          currentList: res.data.positionList
        })
      }   
    })
  },
  /**
   * 跳转
   */
  navigateTo:function(e){
    let { url, id, pagetype} = e.currentTarget.dataset
    console.log(url, id, pagetype)
    switch(url){
      case "1":
        commonApi.saveFormId({
          formId: e.detail.formId
        })
         wx.navigateTo({
           url: '../createPosition/createPosition',
         })
         break;
      case "2":
        wx.navigateTo({
          url: `../positionDetail/positionDetail?positionId=${id}`,
        })
        break;
      case "3":
          wx.navigateTo({
            url: `../createPosition/createPosition?pageType=${pagetype}&positionId=${id}`,
          })
        break;
      case "4":
        wx.navigateTo({
          url: '../finish/finish',
        })
        break;
      default:
        break;
    }
  },
  /**
 * 删除
 */
  showModal: function (positionId) {
    // let positionId = e.currentTarget.dataset.id
    let _this = this
    wx.showModal({
      title: '提示',
      content: '是否删除该数据',
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          network.post('/api.do', {
            method: 'weiPinSp/delPosition',
            param: JSON.stringify({
              positionId: positionId,
            })
          }, (res2) => {
             let index = _this.data.positionList.findIndex((item)=>{
               return item.id == positionId
             })
             _this.data.positionList.splice(index,1)
             _this.setData({
               positionList:_this.data.positionList
             })
            //  _this.operation._closed()
            // _this.getPositionList();
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //组件传回事件
  onMyEvent(a){
    // let id=this.data.focusId;
    // let type=a.detail.type;
    let id = a.currentTarget.dataset.id;
    let type = a.currentTarget.dataset.pagetype;
    switch(type){
      case 'edit':
        wx.navigateTo({
          url: `../createPosition/createPosition?pageType=edit&positionId=${id}`,
        })
        break;
      case 'copy':
        wx.navigateTo({
          url: `../createPosition/createPosition?pageType=copy&positionId=${id}`,
        })
        break;
      case 'deleted':
        this.showModal(id);
        break;
      default:
        break;
    }
  },
  //更多操作
  // moreRight(e){
  //   this.setData({
  //     open:true,
  //     focusId: e.currentTarget.dataset.id
  //   })
  // }
})