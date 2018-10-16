// pages/generation/create/create.js
let network = require("../../../utils/network.js")
let user = require("../../../utils/user.js")
let utils = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasCompany:0,
    hasResume:0,
    companyQuickSpQrcode:'',
    resumeQuickSpQrcode:'',
    showImgurl:'',
    showImg:false,
    currentCanvasId:'',
    companyInfo:null,
    companyType:'',
    auditStatus:null,    //审核状态
    posterInfo:null

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loginDialog = this.selectComponent("#loginDialog");
    
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
    let _globalData = getApp().globalData;
    if (_globalData.hrUser && _globalData.hrUser.companyinfoId) {
      if (this.loginDialog.data.isShow) {
        this.loginDialog.hideDialog();
      }
    }
    if (!_globalData.fansId) {
      user.login((data) => {
        this.getCompanyQuickSpQrcode();
      });
    } else {
      this.getCompanyQuickSpQrcode();
    }
    this.setData({
      companyType: _globalData.companyType
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
  
  // },
  linkTo(e){
    let { url } = e.currentTarget.dataset;
    switch(url){
      case '1':
        wx.navigateTo({
          url: '../newIndex/newIndex',
        })
        break;
      case '2':
        wx.navigateTo({
          url: '../../mine/editPreview/editPreview?pageType=mine',
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
  /**
   * 申请入驻或已入驻
   */
  applyEnter(e){
      let { ty } = e.target.dataset;
      let _globalData = getApp().globalData;
        console.log('tytyt',ty)
      if (!_globalData.hrUser || !_globalData.hrUser.companyinfoId) {
         this.loginDialog.showDialog();
         return;
      }
      if(ty == 1){
        network.post('/api.do', {
          method: 'rpoPlatform/applyEnter',
          param: JSON.stringify({
            companyinfoPid: _globalData.companyinfoPid,
            companyinfoId: _globalData.hrUser.companyinfoId,
            fansId: _globalData.fansId
          })
        }, (res) => {
          if (res.code == '0') {
            this.setData({
              auditStatus:0
            })
            wx.showToast({
              title: '申请提交成功，请耐心等待审核',
              icon: 'none'
            })
          }else if(res.code == '5102' || res.code == '5104'){         
            wx.showToast({
              title: res.message,
              icon:'none',
              duration:3000,
              success:function(){
                setTimeout(()=>{
                  wx.navigateTo({
                    url: '../newIndex/newIndex',
                  })
                }, 3000)
              }
            })
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            })
          }
        })
      }else if(ty == 2){
        network.post('/api.do', {
          method: 'rpoPlatform/judjeIsEnter',
          param: JSON.stringify({
            fansId: _globalData.fansId,
            companyinfoId: _globalData.hrUser.companyinfoId
          })
        }, (res) => {
          if (res.code == '0') {
            this.setData({
              auditStatus: 1
            })
          }else{
            wx.showToast({
              title: res.message,
              icon: 'none'
            })
          }
        })
      }else{
        console.log('待审核或审核失败')
      }
      
  },
  /**
 * 授权手机号成功后刷新页面
 */
  authPhoneNumberSuccess(e) {
    this.getCompanyQuickSpQrcode();

  },
  /**
   * 获取码
   */
  getCompanyQuickSpQrcode(){
    let companyinfoId = '0', hrUser = getApp().globalData.hrUser;
    if (hrUser && hrUser.companyinfoId){
      companyinfoId = hrUser.companyinfoId;
    }
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyQuickSpQrcode',
      param: JSON.stringify({
        companyinfoId: companyinfoId,
        quickSpFansId:getApp().globalData.fansId
      })
    }, (res) => {
        if(res.code == '0'){
          this.setData({
            hasCompany: res.data.hasCompany,
            hasResume: res.data.hasResume,
            companyQuickSpQrcode: res.data.companyQuickSpQrcode,
            resumeQuickSpQrcode: res.data.resumeQuickSpQrcode,
          })
          if (res.data.hasCompany == 1){
            this.getCompanyBasicInfo();
          }
          if (res.data.hasResume == 1) {
            this.drawSecondCanvas();
          }
        }
    })
  },
  /**
  * 获取公司信息
  */
  getCompanyBasicInfo(cb) {
    let companyinfoId = getApp().globalData.hrUser.companyinfoId;
    network.post('/api.do', {
      method: 'weiPinSp/getCompanyBasicInfoNew',
      param: JSON.stringify({
        reqType: 1,
        visitType: 0,
        sessionId: wx.getStorageSync('sessionId'),
        companyinfoId: companyinfoId
      })
    }, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          companyInfo: res.data,
          auditStatus: res.data.auditStatus
        })
        this.getSharePosterInfo(companyinfoId, res.data);
      }
    })
  },
  /**
   * 获取海报上信息（包含用户头像和昵称）
   */
  getSharePosterInfo(companyinfoId, companyInfo){
    network.post('/weipin/getSharePosterInfo.do', { type: 2, weiPinCompanyinfoId: companyinfoId}, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          posterInfo:res.data
        })
      }
    })
  },
  /**
   * 画公司分享图
   */
  drawFirstCanvas: function (companyInfo, posterInfo, cb) {
    let companyName = companyInfo.companyName;
    let str1 = '', str2 = '', address = '';
    if (companyName.length > 12) {
      str1 = companyName.substr(0, 12);
      str2 = companyName.substr(12);
    } else {
      str1 = companyName;
    }
    if (companyInfo.areaCodeName){
      address = companyInfo.areaCodeName.replace(/-/g, '') + companyInfo.companyAddress;
    }else{  
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
            context.drawImage(res2.tempFilePath, 20, 128,80,80)
            context.restore();
            context.setFontSize(32);
            context.setFillStyle("#ffffff");
            context.fillText(posterInfo.nickName, 124, 176);
            wx.downloadFile({
              url: _this.data.companyQuickSpQrcode,
              success:function(res3){
                context.setFillStyle('white');
                context.setStrokeStyle('rgba(92,179,255,0.5)');
                context.strokeRect(19, 247, 712, 1068);
                // context.setShadow(0,0,10,'#5cb3ff');
                context.fillRect(20,248,710,1066);
                // context.setFillStyle('white');
                // context.fillRect(20, 248, 710, 1066);
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
                      success:function(res5){
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
   * 画简历分享图
   */
  drawSecondCanvas(cb){
    var context = wx.createCanvasContext('secondCanvas');
    context.setFillStyle('white');
    context.fillRect(0, 0, 560, 560);
    wx.downloadFile({
      url: this.data.resumeQuickSpQrcode,
      success: function (res) {
        context.drawImage(res.tempFilePath, 80, 80, 400, 400);  //如果直接使用网络图片，真机不显示，故先下载成临时文件
        context.draw(true)
        setTimeout(() => {
          cb && cb();
        }, 2000)
      }
    })
  },
  /**
   * canvas转成图片并预览显示
   */
  geneShareImg: function (e) {
    let canvasId = e.currentTarget.dataset.canvas;
    let self = this;
    let cb = ()=>{
      wx.canvasToTempFilePath({
        canvasId: canvasId,
        fileType: 'jpg',
        quality: '1',
        success: function (res) {
          console.log(res.tempFilePath);
          wx.hideLoading();
          self.setData({
            showImgurl: res.tempFilePath,   //生成的图片大小就是<canvas>标签设置的大小（宽高）
            showImg: true
          })
        }
      })
    };
    wx.showLoading({
      title: '正在生成分享图',
    })
    if (canvasId == 'firstCanvas'){
      this.drawFirstCanvas(this.data.companyInfo, this.data.posterInfo, cb);
    }else{
      this.drawSecondCanvas(cb);
    }

  },
  //关闭图片预览
  closeShowimg() {
    this.setData({
      showImg: false
    })
  },
  // 保存图片到本地
  saveImg() {
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
                    // _this.geneShareImg();
                    _this.setData({
                      showImg:true
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },
})