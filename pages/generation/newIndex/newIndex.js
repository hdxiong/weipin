

let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let commonApi = require("../../../utils/commonApi.js")
let utils = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyInfo:null,
    quickSpQrcode:'',
    showImgurl: '',
    showBubbleDesktop:false,
    showEditIcon:false,
    showImg: false,
    showShare: false,
    open: false,    //操作菜单  
    operationArr: [
      { src: '/images/bianj.png', text: '编辑', 'type': 'edit' },
      { src: '/images/operation_delete.png', text: '删除', 'type': 'deleted' },
      { src: '/images/operation_preview.png', text: '预览', 'type': 'preview' },
      { src: '/images/operation_share.png', text: '分享', 'type': 'share' }
    ],
    showPositionTip:false,
    clickPositionClose:false,
    posterInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    this.loginDialog = this.selectComponent("#loginDialog");
    let globalData = getApp().globalData;
    if (globalData.fansId && globalData.hrUser && globalData.hrUser.companyinfoId){
      //已登录
      this.getCompanyBasicInfo();
      this.getPositionList();
    }else{
      //未登录
      user.login((data) => {
        if (data.isSystemUser == 1) {
          this.getCompanyBasicInfo();
          this.getPositionList();
        }

      })
    }
  },
  getUserInfo(){
    user.login((data) => {
      if (data.isSystemUser == 1) {
        this.getCompanyBasicInfo();
        this.getPositionList();
      }

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
    if (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId){
      if (this.loginDialog.data.isShow){
          this.loginDialog.hideDialog();
      }
      this.getCompanyBasicInfo();
      // this.getQuickSpQrcodeNew();
      this.getPositionList();
      // wx.showTabBar();
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let path = '';
    let _globalData = getApp().globalData;
    let cId = (_globalData.hrUser && _globalData.hrUser.companyinfoId) ? _globalData.hrUser.companyinfoId :'';
    if (res.from === 'button') {
      if (_globalData.companyType == 1 || _globalData.companyType == 2) {
        path = `/pages/home/newHome/newHome?cId=${cId}&comPid=${_globalData.companyinfoPid}&companyType=${_globalData.companyType}&fromShare=true`
      } else {
        path = `/pages/home/newHome/newHome?cId=${cId}&fromShare=true`;
      }
      return {
        title: this.data.companyInfo.companyName + '正在使用微聘小程序招聘，快来投个简历吧',
        path: path
      }
    }
  
  },
  /**
 * 获取公司信息
 */
  getCompanyBasicInfo(cb) {
    if (!getApp().globalData.hrUser){
      return;
    }
    let companyinfoId = getApp().globalData.hrUser.companyinfoId;
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyBasicInfoNew',
      param: JSON.stringify({
        reqType: 1,
        sessionId: wx.getStorageSync('sessionId'),
        companyinfoId: companyinfoId, 
        visitType:0
      })
    }, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          companyInfo:res.data
        })
        if (res.data && res.data.companyName){
          this.setData({
            showEditIcon:true
          })
          this.getSharePosterInfo(companyinfoId);
        }
      }
      if(res.code == 0 && !res.data && cb){
        //新用户，还未公司信息
        cb()
      }
    })
  },
  /**
   * 获取海报上信息（包含用户头像和昵称）
   */
  getSharePosterInfo(companyinfoId) {
    network.post('/weipin/getSharePosterInfo.do', { type: 2, weiPinCompanyinfoId: companyinfoId }, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          posterInfo: res.data
        })
      }
    })
  },
  /**
  * 获取小程序码
  */
  getQuickSpQrcodeNew() {
    network.post('/api.do', {
      method: 'weiPinSp/getQuickSpQrcodeNew',
      param: JSON.stringify({
        companyinfoId: getApp().globalData.hrUser.companyinfoId
      })
    }, (res) => {
      if (res.code == 0) {
        this.setData({
          quickSpQrcode: res.data.quickSpQrcode
        })
      }
    })
  },
  /**
   * 删除公司信息
   */
  delCompanyInfo(){
    let _globalData = getApp().globalData;
    network.post('/api.do', {
      method: 'weiPinSp/delCompanyInfo',
      param: JSON.stringify({
        companyinfoId: _globalData.hrUser.companyinfoId
      })
    }, (res) => {
      if (res.code == 0) {
         this.setData({
           companyInfo:null,
           open:false,
           showEditIcon:false
         })
         _globalData.companyAddress = '';
         _globalData.longlat = null;
         _globalData.companyinfoPid = '';
         _globalData.hrUser.companyinfoId = '';
         wx.showTabBar();
      }else{
        wx.showToast({
          icon:'none',
          title: res.message,
        })
      }
    })
  },
  //获取firstCanvas并画图
  getFirstCanvas: function (posterInfo,cb) {   
    let companyInfo = this.data.companyInfo;
    let companyName = companyInfo.companyName;
    let str1='',str2='', address = '';
    if(companyName.length>12){
      str1 = companyName.substr(0,12);
      str2 = companyName.substr(12);
    }else{
      str1 = companyName;
    }
    if (companyInfo.areaCodeName) {
      address = companyInfo.areaCodeName.replace(/-/g, '') + companyInfo.companyAddress;
    } else {
      address = companyInfo.companyAddress;
    }
    var _this = this;
    var context = wx.createCanvasContext('firstCanvas');
    wx.downloadFile({
      url: utils.getDomain() + '/images/xcx/gene_banner_top.jpg',
      success: function (res) {
        context.setFillStyle('white');
        context.fillRect(0, 248, 750, 1086);
        context.drawImage(res.tempFilePath, 0, 0, 750, 363);
        wx.downloadFile({
          url: posterInfo.headImg,
          success: function (res2) {
            context.save()
            context.beginPath()
            context.arc(60, 168, 40, 0, 2 * Math.PI)
            context.clip()
            context.drawImage(res2.tempFilePath, 20, 128, 80, 80)
            context.restore();
            context.setFontSize(32);
            context.setFillStyle("#ffffff");
            context.fillText(posterInfo.nickName, 124, 176);
            wx.downloadFile({
              url: companyInfo.quickspQrcode,
              success: function (res3) {
                context.setFillStyle('white');
                context.setStrokeStyle('rgba(92,179,255,0.5)');
                context.strokeRect(19, 247, 712, 1068);
                // context.setShadow(0,0,10,'#5cb3ff');
                context.fillRect(20, 248, 710, 1066);
                context.setFontSize(44);
                context.setFillStyle("#000000");
                context.fillText(str1, 50, 337);
                if (str2) {
                  context.setFontSize(44);
                  context.setFillStyle("#000000");
                  context.fillText(str2, 50, 370);
                }
                wx.downloadFile({
                  url: companyInfo.logoUrl,
                  success: function (res4) {
                    context.save();
                    context.beginPath();
                    context.arc(635, 337, 65, 0, 2 * Math.PI);
                    context.clip();
                    context.drawImage(res4.tempFilePath, 570, 272, 130, 130);
                    context.restore();
                    context.setFillStyle('rgba(92,179,255,0.08)');
                    context.fillRect(55, 447, 180, 52);
                    context.setFillStyle('rgba(92,179,255,0.08)');
                    context.fillRect(260, 447, 180, 52);
                    context.setFontSize(32);
                    context.setFillStyle("#5CB3FF");
                    context.fillText(companyInfo.industryStr, 80, 485);
                    context.fillText(companyInfo.scaleStr, 300, 485);
                    context.setFontSize(28);
                    context.setFillStyle("#999999");
                    context.fillText(address, 55, 550);
                    context.setFontSize(40);
                    context.setFillStyle("#5CB3FF");
                    context.fillText('正在招聘', 292, 740);
                    context.beginPath();
                    context.moveTo(80, 725);
                    context.lineTo(228, 725);
                    context.setLineWidth(2);
                    context.setStrokeStyle("#EBEEF5");
                    context.stroke();
                    context.beginPath();
                    context.moveTo(502, 725);
                    context.lineTo(670, 725);
                    context.setLineWidth(2);
                    context.setStrokeStyle("#EBEEF5");
                    context.stroke();
                    context.drawImage(res3.tempFilePath, 262, 830, 225, 225)
                    context.setFontSize(28);
                    context.setFillStyle("#6D86A3");
                    context.fillText('长按查看招聘详情', 260, 1107);
                    context.setFontSize(24);
                    context.setFillStyle("#999999");
                    context.fillText('(微聘小程序提供)', 280, 1154);
                    wx.downloadFile({
                      url: utils.getDomain() + '/images/xcx/gene_poster_bg1.png',
                      success: function (res5) {
                        context.drawImage(res5.tempFilePath, 0, 1150, 750, 184);
                        context.draw(true);
                        setTimeout(() => {
                          cb && cb();
                        }, 2000)
                      }
                    })
                  }
                })
              }
            })
          }
        })
      },
    })
  },
  /**
   * canvas转成图片
   */
  previewQrcode:function(){
    var self = this;
    wx.showLoading({
      title: '正在生成分享图',
    })
    this.getFirstCanvas(this.data.posterInfo, () => {
      wx.canvasToTempFilePath({
        canvasId: 'firstCanvas',
        fileType: 'jpg',
        quality: '1',
        success: function (res) {
          console.log(res.tempFilePath)
          wx.hideLoading();
          self.setData({
            showImgurl: res.tempFilePath,   //生成的图片大小就是<canvas>标签设置的大小（宽高）
            showImg: true
          })
        }
      })
    })
  },
  //关闭图片预览
  closeShowimg() {
    this.setData({
      showImg: false
    })
    wx.showTabBar();
  },
  /**
   * 跳转到企业详情
   */
  linkTo:function(e){
    let url = e.currentTarget.dataset.url;
    switch(url){
      case '1':
        commonApi.saveFormId({
          formId: e.detail.formId
        })
        if (getApp().globalData.hrUser){
          wx.navigateTo({
            url: '../editBaseInfo/editBaseInfo',
          })
        }else{
          this.loginDialog.showDialog()
        }    
        break;
      case '2':
        commonApi.saveFormId({
          formId: e.detail.formId
        })
        getApp().globalData.shareCompanyInfoId = '';
        wx.navigateTo({
          url: '../../home/newHome/newHome',
        })
        break;
      case '3':          
          wx.navigateTo({
            url: '../positionInfo/positionInfo',
          })
       
        break;
      default:
       
        break;
    }
   
  },
  // 保存图片到本地
  saveImg(res) {
    var _this = this;
    wx.saveImageToPhotosAlbum({
      filePath: _this.data.showImgurl,
      success(res2) {
        wx.showModal({
          content: '海报已保存到系统相册\n快去分享给朋友',
          showCancel: false,
          confirmText: '我知道了',
          success: function (res2) {

          }
        })
      },
      fail(res2) {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权,将无法正常保存图片到本地,点击确定重新获取授权。',
          success: function (res2) {
            if (res2.confirm) {
              wx.openSetting({
                success: function (res3) {
                  if (res3.authSetting['scope.writePhotosAlbum']) {
                    _this.previewQrcode();
                  }
                }
              })
            }
          }
        })
      }
    })
  },
  /**
   * 点击编辑图标
   */
  clickEdit(){
    if (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId){
      if (this.data.companyInfo && this.data.companyInfo.companyName) {
        wx.hideTabBar()
        this.setData({
          open: true
        })
      } else {
        wx.navigateTo({
          url: '../editBaseInfo/editBaseInfo',
        })
      }
    }else{
      this.loginDialog.showDialog()
    }       
  },
  /**
   * 监听operation组件内事件
   */
  onMyEvent(e){
      let ty = e.detail.type;
      switch(ty){
        case 'edit':
          this.setData({
            open: false,
          })
            wx.navigateTo({
              url: '../editBaseInfo/editBaseInfo',
            })
            break;
        case 'deleted':
           wx.showModal({
             title: '提示',
             content: '你确定删除公司信息吗？',
             confirmText:'确定',
             success: (res)=>{
               if (res.confirm) {
                 this.delCompanyInfo();
               } else if (res.cancel) {
                 console.log('用户点击取消')
               }
             }
           })
          
          break;
        case 'preview':
          this.setData({
            open: false,
          })
          getApp().globalData.shareCompanyInfoId = '';
          wx.navigateTo({
            url: '../../home/newHome/newHome',
          })

          break;
        case 'share':
          this.setData({
            open:false,
            showShare:true
          })
          break;
        default:
          break;
      }
  },
  /**
   *  切换分享操作菜单
   */
  toggleShareSheet(e){
    this.setData({
      showShare: !this.data.showShare
    })
    if (this.data.showShare){
      wx.hideTabBar()
    } else if (!this.data.showShare && !e.target.dataset.target){
      wx.showTabBar();
    }
    commonApi.saveFormId({
      formId: e.detail.formId
    })
  },
  /**
   * 授权手机号成功后刷新页面
   */
  authPhoneNumberSuccess(e){
    this.getCompanyBasicInfo();
    // this.getQuickSpQrcodeNew();
    this.getPositionList();
    wx.showTabBar();
  },
  /**
*  获取职位列表
*/
  getPositionList: function () {
    network.post('/api.do', {
      method: 'weiPinSp/getPositionList',
      param: JSON.stringify({
        companyinfoId: getApp().globalData.hrUser.companyinfoId,
        pageNum: 1,
        pageSize: 1
      })
    }, (res) => {
      if (res.code == "0" && res.data.positionList && res.data.positionList.length>0) {
        this.setData({
          showPositionTip: false,
        })
      }else{
        this.setData({
          showPositionTip: true,
        })
      }
    })
  },
  closePositionTip(){
    this.setData({
      showPositionTip:false,
      clickPositionClose:true
    })
  } 
})