const network = require("../../../utils/network.js")
let commonApi = require("../../../utils/commonApi.js")
let utils = require("../../../utils/util.js")
const user = require("../../../utils/user.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    positionId:'',
    showBack:1,
    phoneNumber:'',
    positionInfo:null,
    companyInfo:null,   
    headImgList:[],
    checkPosition:false,
    noData:false,
    hasData:false,
    chatPeople:null,
    showShare:false,
    showImg:false,
    showImgurl:'',
    posterInfo:null,
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
    if (options.scene) {
      //海报扫码进入
      let params = utils.parseScene(options.scene);
      globalData.shareCompanyInfoId = params.cId;
      if (params.cPid) {
        globalData.companyinfoPid = params.cPid;
        globalData.companyType = 2;
      }
      this.setData({
        showBack: 0,
        positionId: params.pId
      })
    }else{
      if (options.cId && options.from != 'companyDetail' && options.from != 'positionList') {
        if (globalData.shareCompanyInfoId != options.cId) {
          globalData.shareCompanyInfoId = options.cId;
        }
      }
      if (options.from === 'share') {
        this.setData({
          showBack: 0
        })
      }
      if (options.comPid) {
        globalData.companyinfoPid = options.comPid;
        globalData.companyType = 2;
      }
      this.setData({    
        positionId: options.positionId
      })
    }
    this.setData({
      options: options
    })
    if (globalData.fansId) {
      //已登录
      this.getPositionDetail();
      this.getCompanyBasicInfo();
      this.getSharePosterInfo();
      this.getChatPeople();
    } else {
      //未登录
      user.login((data) => {
        this.getPositionDetail();
        this.getCompanyBasicInfo();
        this.getSharePosterInfo();
        this.getChatPeople();
      })
    }
    // this.getCompanyBasicInfo();    
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
  myevent(){
    debugger
    this.getVisitHistoryHeadImg();
  },
  /**
   * 获取海报上信息（包含用户头像和昵称）
   */
  getSharePosterInfo() {
    network.post('/weipin/getSharePosterInfo.do', { type: 1, positionId: this.data.positionId }, (res) => {
      if (res.code == 0 && res.data) {
        this.setData({
          posterInfo: res.data
        })
      }
    })
  },
  // 职位详情页获取直聊对象
  getChatPeople(){
    // let positionId = Number(this.data.positionId);
    network.post('/weipinDirectChat/getChatPeople.do',{
      positionId: this.data.positionId
    },(res)=>{
      if(res.code == 0){
         this.setData({
           chatPeople:res.data
         })
      }
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
        operType: 1,
        reqType:1,
        quickSpFansId: getApp().globalData.fansId
      })
    }, (res) => {
      if (res.code == '0') {  
        if (this.data.headImgList.length == 0){
          this.getVisitHistoryHeadImg(); 
        }
        let _data = res.data
        if (res.data.positionDesc){
          res.data.positionDesc = res.data.positionDesc.replace(/\n/g, '<br/>')
        }     
        this.setData({
          positionInfo:res.data,
          hasData:true
        })
      } else if (res.code == '8216'){
        //该职位已被删除！
        this.setData({
          noData:true
        })
      }
    })
  },
  /**
  * 获取公司信息
  */
  getCompanyBasicInfo: function () {
    let companyinfoId = '';
    if (this.data.options.from && (this.data.options.from == 'companyDetail' ||  this.data.options.from  == 'positionList')){
      companyinfoId = this.data.options.cId
    }else{
      companyinfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
    }
    let _this = this;
    let visitType = this.data.options.from == 'share' ? 1 : 0;
    network.post("/api.do", {
      method: "weiPinSp/getCompanyBasicInfoNew",
      param: JSON.stringify({
        reqType:1,
        sessionId: wx.getStorageSync('sessionId'),
        companyinfoId: companyinfoId,
        visitType: visitType
      })
    }, function (res) {
      console.log('getCompanyBasicInfoNew', companyinfoId, res.data)
      if (res.code == "0" && res.data) {
        _this.setData({
          companyInfo: res.data
        })
      } else {
        console.log(`weiPinSp/getCompanyBasicInfoNew:${res.message}`)
      }
    })
  },
  /**
   * 访问头像
   */
  getVisitHistoryHeadImg:function(){
    network.post('/api.do', {
      method: "weiPinSp/getVisitHistoryHeadImg",
      param: JSON.stringify({
        positionId: this.data.positionId,
      })
    }, (res) => {
      if (res.code == '0') {    
         this.setData({
           headImgList: res.data.headImgList
         })
      }
    })
  },
  //收藏职位或者取消收藏职位
  collectPosition:function(){
    network.post("/api.do", {
      method: "weiPinSp/collectPosition",
      param: JSON.stringify({
        quickSpFansId:getApp().globalData.fansId,       
        positionId: this.data.positionId,
        status: Number(!this.data.positionInfo.collectStatus)
      })
    }, (res)=>{
        if(res.code == 0){
          this.setData({
            ['positionInfo.collectStatus']: Number(!this.data.positionInfo.collectStatus)
          })
        }
    })
  },
  /**
   * 我要推荐打开sheet面板
   */
  wantRecommend(){
    this.setData({
      showShare:true
    })
  },
  /**
   *  切换分享操作菜单
   */
  toggleShareSheet(e) {
    this.setData({
      showShare: !this.data.showShare
    })
    commonApi.saveFormId({
      formId: e.detail.formId
    })
  },
  //关闭图片预览
  closeShowimg() {
    this.setData({
      showImg: false
    })
  },
  //获取firstCanvas并画图
  getFirstCanvas: function (posterInfo, cb) {  
    var _this = this;
    var context = wx.createCanvasContext('firstCanvas');
    var fillTag = (x, y, text)=>{
      context.setFillStyle('rgba(130,203,255,1)');
      context.fillRect(x, y, 162, 52);
      context.setFontSize(32);
      context.setFillStyle("#ffffff");
      context.fillText(text, x+18, y+38);
    };
    wx.downloadFile({
      url: utils.getDomain() + '/images/xcx/gene_poster_bg2.png',
      success:function(res1){
        context.setFillStyle('white');
        context.fillRect(0, 540, 750, 794);
        context.drawImage(res1.tempFilePath, 0, 0, 750, 716); 
        wx.downloadFile({
          url: posterInfo.headImg,
          success: function (res2) {
            context.save()
            context.beginPath()
            context.arc(375, 290, 135, 0, 2 * Math.PI)
            context.clip()
            context.setFillStyle('white');
            context.fillRect(238, 154, 274, 274);
            context.drawImage(res2.tempFilePath, 245, 160, 260, 260)
            context.restore();
            _this.forTagList(fillTag);
            context.setFontSize(46);
            context.setFillStyle('#ffffff');
            context.setTextAlign('center');
            context.fillText(posterInfo.nickName, 375, 490);
            context.setFontSize(28);
            context.setFillStyle('#ffffff');
            context.setTextAlign('center');
            context.fillText(posterInfo.companyName, 375, 550);
            wx.downloadFile({
              url: posterInfo.qrcodeUrl,
              success: function (res3) {
                context.setFontSize(28);
                context.setFillStyle("#5CB3FF");
                context.setTextAlign('center');
                context.fillText('我正在微聘招牛人', 375, 742);
                context.beginPath();
                context.moveTo(80, 730);
                context.lineTo(228, 730);
                context.setLineWidth(2);
                context.setStrokeStyle("#EBEEF5");
                context.stroke();
                context.beginPath();
                context.moveTo(522, 730);
                context.lineTo(670, 730);
                context.setLineWidth(2);
                context.setStrokeStyle("#EBEEF5");
                context.stroke();
                context.setFontSize(36);
                context.setTextAlign('right');
                context.setFillStyle("#333333");
                context.fillText(posterInfo.positionName, 365, 820);
                context.setTextAlign('left');
                context.setFillStyle("#FF566B");
                context.fillText(posterInfo.salary, 385, 820);
                context.setFontSize(28);
                context.setFillStyle("#999999");
                context.setTextAlign('center');
                context.fillText(`${posterInfo.workCity} | ${posterInfo.workYear} | ${posterInfo.educationRequire} | ${posterInfo.positionType}`, 375, 885);
                context.drawImage(res3.tempFilePath, 262, 955, 225, 225)
                context.setFontSize(28);
                context.setFillStyle("#6D86A3");
                context.setTextAlign('center');
                context.fillText('长按查看招聘详情', 375, 1224);
                context.setFontSize(24);
                context.setFillStyle("#999999");
                context.setTextAlign('center');
                context.fillText('(微聘小程序提供)', 375, 1270);
                context.draw(true);
                setTimeout(()=>{
                  cb && cb();
                },3000)
              }
            })
          }
        })
      }
    })
  },
  //循环画职位亮点
  forTagList(fillTag){
    let positionTagList = this.data.posterInfo.positionTagList;
    for (let i = 0; i < positionTagList.length; i++) {
      let text = positionTagList[i].name.substr(0, 4);
      switch (i) {
        case 0:
          fillTag(16, 240, text);
          break;
        case 1:
          fillTag(530, 240, text);
          break;
        case 2:
          fillTag(72, 137, text);
          break;
        case 3:
          fillTag(556, 137, text);
          break;
        case 4:
          fillTag(56, 360, text);
          break;
        case 5:
          fillTag(559, 340, text);
          break;
        case 6:
          fillTag(203, 36, text);
          break;
        case 7:
          fillTag(460, 52, text);
          break;
        default:
          break;
      }
    }
  },
  /**
   * canvas转成图片
   */
  previewQrcode: function () {
    var self = this;
    wx.showLoading({
      title: '正在生成分享图',
    })
    this.getFirstCanvas(this.data.posterInfo, ()=>{
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
  // 保存图片到本地
  saveImg(){
    let _this = this;
    commonApi.saveImage(_this.data.showImgurl, ()=>{
      _this.previewQrcode();
    })
  },
  /**
   * 跳转
   */
  linkTo: function (e) {
    let dataset = e.currentTarget.dataset;
    let _data = this.data;
    let fansId = getApp().globalData.fansId;
    let companyinfoId = '';
    if (this.data.options.from && (this.data.options.from == 'companyDetail' || this.data.options.from == 'positionList')) {
      companyinfoId = this.data.options.cId
    } else {
      companyinfoId = getApp().globalData.shareCompanyInfoId || (getApp().globalData.hrUser && getApp().globalData.hrUser.companyinfoId);
    }
    switch(dataset.url){
      //跳转到前台首页
      case "1":
        if (this.data.options.from && this.data.options.from == 'companyDetail') {
           wx.navigateBack()
        } else if (this.data.options.from && this.data.options.from == 'positionList'){
          wx.navigateTo({
            url: `../../home/newHome/newHome?cId=${companyinfoId}`,
          })
        }else{
          if (getCurrentPages().some((item) => { return item.route === 'pages/home/newHome/newHome' })) {
            wx.navigateBack()
          } else {
            wx.navigateTo({
              url: `../../home/newHome/newHome`,
            })
          }
        }

        break;
      //跳转到创建简历方式页
      case "2":
        wx.navigateTo({
          url: `../resume/resume?companyinfoId=${companyinfoId}&positionId=${_data.positionId}&fansId=${fansId}&shareFansId=${_data.shareFansId}&recomType=${_data.recomType}`,
        })
        break;
      case "3":
       console.log(dataset.item)
       if(dataset.index == 5){
         let visitNum = _data.positionInfo.positionVisit || '0';
         let hrFansId = _data.positionInfo.hrFansId;
         wx.navigateTo({
           url: `/pages/generation/avatar/avatar?positionId=${_data.positionId}&hrFansId=${hrFansId}&visitNum=${visitNum}`,
         })
       }else{
         let receiverFansId = dataset.item.id, receiverNick = dataset.item.nickName;
         if (fansId == _data.positionInfo.hrFansId || getApp().globalData.companyType == 1){
           if (fansId == receiverFansId){
             wx.showToast({
               icon: 'none',
               title: '不能与自己进行聊天',
             })
             return;
           }
           wx.navigateTo({
             url: `/pages/generation/chat/chat?receiverFansId=${receiverFansId}&receiverNick=${receiverNick}&positionId=${_data.positionId}&isHr=1`,
           })
         }
       }
        break;
      case "4":
        // let receiverFansId = _data.positionInfo.hrFansId, receiverNick = _data.positionInfo.hrNickName;
        let receiverFansId = '', receiverNick = '';
        if (_data.chatPeople && _data.chatPeople.chatFansId){
          receiverFansId = _data.chatPeople.chatFansId;
          receiverNick = _data.chatPeople.chatNickName;
        }else{
          receiverFansId = _data.positionInfo.hrFansId; 
          receiverNick = _data.positionInfo.hrNickName;
        }
        if (fansId == receiverFansId) {
          wx.showToast({
            icon: 'none',
            title: '不能与自己进行聊天',
          })
          return;
        }
        wx.navigateTo({
          url: `/pages/generation/chat/chat?receiverFansId=${receiverFansId}&receiverNick=${receiverNick}&positionId=${_data.positionId}&isHr=0`,
        })
        break;
      case "5":
        wx.switchTab({
          url: '/pages/generation/positionList/positionList',
        })
        break;
      default:
        break;
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
  onShareAppMessage: function (result) {
    let _this = this;
    let _globalData = getApp().globalData;
    let companyinfoId = '', path = '';
    if (this.data.options.from && (this.data.options.from == 'companyDetail' || this.data.options.from == 'positionList')) {
      companyinfoId = this.data.options.cId
    } else {
      companyinfoId = _globalData.shareCompanyInfoId || (_globalData.hrUser && _globalData.hrUser.companyinfoId);
    }
    path = `/pages/position/detail/detail?cId=${companyinfoId}&positionId=${_this.data.positionId}&from=share`;
    if (_globalData.companyType == 1 || _globalData.companyType == 2) {
      path = `/pages/position/detail/detail?cId=${companyinfoId}&positionId=${_this.data.positionId}&comPid=${_globalData.companyinfoPid}&companyType=${_globalData.companyType}&from=share`;
    }
    return {
      title: this.data.companyInfo.companyName + '正在使用微聘小程序招聘，快来投个简历吧',
      path: path,
      success: function (res) {
        // 转发成功
        // console.log(res)
      },
      fail: function (res) {
        // 转发失败
        
      }
    }
  }
})