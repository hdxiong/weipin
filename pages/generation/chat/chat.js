// pages/generation/chat/chat.js
import Socket from '../../../utils/socket'
const emojiData = require('../../../utils/emoji-data').emojiData.map;
let network = require("../../../utils/network.js");
let commonApi = require("../../../utils/commonApi.js")
let SocketTask = null;
let timer = null;
let messageId = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options:null,
    senderFansId:'',    //发送者fansId
    showResumeBtn:false,
    phoneObj:{
      senderhasPhone: false,
      activeRequest:false
    },
    wechatObj:{
      wechatNum:'',
      activeRequest:false,
      position:'1'  //触发弹框的事件位置：1-换微信，2-同意
    },
    modal:{
      showModal:false,
      modalTitle:'发送微信号',
      placeholder:'输入您的微信号',
      inputVal:'',
    },
    openPhrase:false,
    editPhrase:false,
    openEmoji:false,
    openImage: false,
    phraseList:[],
    emojiList:[], 
    textMessage:'',
    messageList:[],
    scrollTop:0,
    animateBottom:0,
    showPhraseModal:false,
    currentPhrase:{
      phrasewordId: '',
      content: ''
    },
    positionList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.positionId){
      //从职位详情过来
      this.setData({
        showResumeBtn:true
      })
    }
    if (options.receiverFansId){
      options.receiverFansId = Number(options.receiverFansId);
    }
    this.setData({
      options:options
    })
    if (options.from == 'templateMsg'){
      this.setData({
        senderFansId: options.senderFansId*1
      })
      getApp().globalData.fansId = options.senderFansId*1;   //为了授权手机号接口用到
    }else{  
      this.setData({
        senderFansId: Number(getApp().globalData.fansId)
      })
    }
    this.loadNearMsg();
    this.initSocketConnect();
    this.updateMsgStatus();
    this.handleEmoji();
    this.exchangeInfo(1);
    this.exchangeInfo(2);
    this.exchangeInfo(3);
    this.getChatPhrasewords();
    if(!options.positionId){
      this.getPositionList();
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
    SocketTask.close();
    clearInterval(timer);
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
  onBackEvent(){
    wx.switchTab({
      url: '/pages/generation/companyList/companyList',
    })
  },
  getWxmlInfo(el,cb){
    wx.createSelectorQuery().select(el).boundingClientRect((res)=>{
       cb && cb(res);   
    }).exec()
  },
  // 获取职位列表
  getPositionList(){
    network.post('/weipinDirectChat/getPositionList.do',{
      senderFansId: this.data.options.receiverFansId
     },(res)=>{
       if(res.code == 0 && res.data && res.data.length>0){
         this.setData({
           positionList:res.data
         })
       }
     })
  },
  //选择职位(消息中心进来，若收到hr投递简历的邀请)
  pickerChange: function (e) {
    let _this = this;
    let positionId = this.data.positionList[e.detail.value].id;
    messageId = e.target.dataset.id;
    _this.data.options.positionId = positionId;
    wx.showModal({
      title: '提示',
      content: '确定要投递简历吗？',
      success: function (res) {
        if (res.confirm) {
          _this.confirmPostResume();
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 初始化WebSocket连接
   */
  initSocketConnect(){
    let _this = this;
    let fansIdArr = [_this.data.senderFansId, Number(_this.data.options.receiverFansId)];
    SocketTask = new Socket(getApp().globalData.fansId, _this.data.options.receiverFansId);
    SocketTask.onMessage((data) => {
      console.log('收消息',data)
      if (fansIdArr.includes(data.senderFansId) === false || fansIdArr.includes(data.receiverFansId) === false ){ 
        //防止消息胡窜
        return;
      }
      if (data.msgType == 0){
        let emojiArr = data.msgContent.match(/\[(.+?)\]/g);
        if (emojiArr && emojiArr.length > 0){
           //含表情
           data.hasEmoji = true;
           data.newMsgContent = _this.parseEmojiTextMessage(data.msgContent);
           console.log('emoji',data)
        }
      }
      _this.data.messageList.push(data);
      _this.setData({
        messageList: _this.data.messageList
      })
      _this.getWxmlInfo('#messageList',(res)=>{
        _this.setData({
          scrollTop: res.height
        })
      });
    })
    //心跳保活，服务端keep-alive为2分钟
    timer = setInterval(()=>{
      _this.sendMessage(-1, '这是一条心跳包消息')
    },55000)
  },
  /**
   * 更新为已读状态
   */
  updateMsgStatus(){
    network.post('/weipinDirectChat/updateMsgStatus.do',{
      senderFansId: this.data.senderFansId,
      receiverFansId: this.data.options.receiverFansId
      },(res)=>{
        console.log(`updateMsgStatus.do:${res.message}`)
      })
  },
  //初始化展示表情
  handleEmoji(){
    for (let key in emojiData){
      this.data.emojiList.push({
        ekey:key,
        baseUrl: emojiData[key]
      })
    }
    this.setData({
      emojiList: this.data.emojiList
    })
  },
  //判断电话、微信、简历状态
  exchangeInfo(msgType, callback){
    network.post('/weipinDirectChat/request/exchangeInfo.do',{
      senderFansId: this.data.senderFansId,
      receiverFansId: this.data.options.receiverFansId,
      msgType: msgType
    },(res)=>{
      if (res.code == '0' && res.havePhone){
        this.setData({
          'phoneObj.senderhasPhone':true
        })
      } else if (res.code == '9804'){
        this.setData({
          'phoneObj.activeRequest': true,
          'phoneObj.senderhasPhone': true
        }) 
      } else if (res.code == '9805') {
        this.setData({
          'wechatObj.activeRequest': true
        })
      } else if (res.code == '0' && res.haveWechatNo) {
        this.setData({
          'wechatObj.wechaNum': res.wechatNo,
          'modal.inputVal': res.wechatNo
        })
      } else if (res.code == '9806') {
        // wx.showToast({
        //   title: res.message,
        //   icon:'none'
        // })
        // return;
      }
      callback && callback(res);
    })
  },
  /**
   * 获取授权手机号
   */
  getPhoneNumber(e){
    let _this = this;
    commonApi.getSpFansPhone(e,(data)=>{
      _this.sendMessage(1, '我想要和您交换联系方式， 您是否同意')
      _this.setData({
        'phoneObj.senderhasPhone':true,
        'phoneObj.activeRequest': true
      })
    });
  },
  getPhoneNumber2(e) {
    let _this = this;
    commonApi.getSpFansPhone(e, (data) => {
      _this.sendMessage(11, '', 1)
    });
  },
  /**
   * 微信对话框取消按钮点击事件
   */
  onCancel: function () {
    this.setData({
      ['modal.showModal']: false
    })
  },
  /**
   * 微信框获取输入框的值
   */
  inputChange: function (e) {
    this.setData({
      ['modal.inputVal']: e.detail.value.trim()
    })
  },
  /**
   *  微信对话框确认按钮点击事件
   */
  onConfirm: function () {
    let _data = this.data;
    let _inputVal = _data.modal.inputVal;
    if (_inputVal) {
      network.post('/weipinDirectChat/saveWeChatNo.do',{
        senderFansId: this.data.senderFansId,
        wechatNo: _inputVal
      },(res) => {
        if(res.code == 0){
          if(this.data.wechatObj.position == 1){
            this.setData({
              'wechatObj.activeRequest': true
            })
            this.sendMessage(2, '我想要和您交换微信， 您是否同意');
          }else{
            this.sendMessage(22, _inputVal, 1, messageId);
            this.setIsAgree(1);
          }
          this.setData({      
            'wechatObj.wechatNum': _inputVal,
            'modal.inputVal': _inputVal,
            'modal.showModal':false
          })
        }else{
          console.log(`weipinDirectChat/saveWeChatNo.do:${res.message}`)
        }
      })
    }else{
      wx.showToast({
        title: '微信号不能为空',
        icon:'none'
      })
      return;
    }
  },
  //点击scroll-view
  clickScrollView(){
    this.setData({
      openEmoji: false,
      openPhrase: false,
      openImage: false
    })
  },
  /**
   * 打开常用语
   */
  switchOpenPhrase() {
    if (!this.data.isFocus){
      this.setData({
        openEmoji: false,
        openPhrase: !this.data.openPhrase,
        openImage: false
      })
    }else{
      this.setData({
        isFocus:false
      })
      if (!this.data.openPhrase){
        this.setData({
          openEmoji: false,
          openPhrase: true,
          openImage: false
        })
      }
    }

  },
  /**
   * 打开图片
   */
  switchOpenImage(){
    if (!this.data.isFocus) {
    this.setData({
      openImage: !this.data.openImage,
      openEmoji:false,
      openPhrase:false
    })
    }else{
      this.setData({
        isFocus: false
      })
      if (!this.data.openImage) {
        this.setData({
          openEmoji: false,
          openPhrase: false,
          openImage: true
        })
      }
    }
  },
  /**
   * 打开表情
   */
  switchOpenEmoji(){
    if (!this.data.isFocus) {
    this.setData({
      openEmoji: !this.data.openEmoji,
      openPhrase:false,
      openImage:false
    })
    }else{
      this.setData({
        isFocus: false
      })
      if (!this.data.openEmoji) {
        this.setData({
          openEmoji: true,
          openPhrase: false,
          openImage: false
        })
      }
    }
  },
  //
  chatInputBindFocusEvent(){
    this.setData({
       isFocus:true
    })
  },
  //
  chatInputBindInputEvent(e){
    let inputVal = e.detail.value.trim();
     this.setData({
       textMessage: inputVal
     })
  },
  /**
   * 加载最近消息
   */
  loadNearMsg(){
    network.post('/weipinDirectChat/loadNearMsg.do',{
      senderFansId: this.data.senderFansId,
      receiverFansId: this.data.options.receiverFansId,
    },(res) => {
        if(res.code == '0'){
          for (let i = 0, len = res.data.length; i < len; i++){
            let item = res.data[i];
            if (item.msgType == 0){
              let emojiArr = item.msgContent.match(/\[(.+?)\]/g);
               if (emojiArr && emojiArr.length > 0) {
                 //含表情
                 item.hasEmoji = true;
                 item.newMsgContent = this.parseEmojiTextMessage(item.msgContent);
               }
             }
          }
          this.setData({
            messageList: res.data
          })
          this.getWxmlInfo('#messageList',(res)=>{
            this.setData({
              scrollTop: res.height
            })
          });
        }
    })
  },
  /**
   * 解析含表情文本
   */
   parseEmojiTextMessage(msgContent){
     let newMsgContent = []
     let t = ''
     let lastToken = ''
     for (let i = 0; i < msgContent.length; i++) {
       if (lastToken == '' && msgContent[i] == '[') {
         if (t) {
           newMsgContent.push({
             type: 'text',
             text: t
           })
         }
         t = ''
         lastToken = '['
       } else if (msgContent[i] == ']' && lastToken == '[') {
         newMsgContent.push({
           type: 'image',
           url: emojiData['[' + t + ']']
         })
         t = ''
         lastToken = ''
       } else {
         t += msgContent[i]
       }
     }
     if (t)
       newMsgContent.push({
         type: 'text',
         text: t
       })
     return newMsgContent;
   },
   /**
    *  发消息
    */
  sendMessage(msgType, msg, isAgree,id){
    SocketTask.sendMessage({
      senderFansId: this.data.senderFansId,
      receiverFansId: this.data.options.receiverFansId,
      msgContent: msg,
      msgType: msgType,
      isAgree: isAgree === 1 ? 1 : 0,
      id:id ? id : null
    })
  },
  /**
   * 发送输入框文本消息
   */
  chatInputSendTextMessage(e){
    let msg = e.detail.value.trim();
    if(!msg){
      wx.showToast({
        icon:"none",
        title: '内容不能为空',
      })
      return;
    }
    this.sendMessage(0,msg)
    this.setData({
      textMessage:''
    })
  },
  /**
   * 发送电话消息
   */
  sendPhoneMessage(){
    if (!this.data.phoneObj.activeRequest){
      this.sendMessage(1, '我想要和您交换联系方式， 您是否同意');
      this.setData({
        'phoneObj.activeRequest': true,
      })
    } else {
      wx.showToast({
        title: '已发送过请求，请勿重复操作',
        icon: 'none'
      })
    }
  },
  /**
   * 同意或拒绝
   */
  agreeOrRefuse(e){
    if (e.currentTarget.dataset.isagree === 0 || e.currentTarget.dataset.isagree === 1){
       //不为-1，表示操作过
       return;
    }
    messageId = e.currentTarget.dataset.id; 
    let _this = this;
    let msgType = e.target.dataset.msgtype, btnType = e.target.dataset.btntype;   
    let isAgree = btnType == 'agree' ? 1 : 0;
    switch(Number(msgType)){
      //换电话
      case 1:
        this.sendMessage(11, '', isAgree, messageId);
        this.setIsAgree(isAgree)
       break;
      //换微信
      case 2:
        if(isAgree == 1){
          this.setData({
            'modal.showModal': true,
            'wechatObj.position':2
          })           
        }else{
          this.sendMessage(22, '', isAgree, messageId);
          this.setIsAgree(isAgree)
        }
        break;
      //换简历
      case 3:
        if (isAgree == 1){     
          wx.showModal({
            title: '提示',
            content: '确定要投递简历吗？',
            success: function (res) {
              if (res.confirm) {
                _this.confirmPostResume();
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }else{
          this.sendMessage(33, '', isAgree, messageId);
          this.setIsAgree(isAgree);
        }
        break;
      default:
        break;
    } 
  },
  //同意拒绝后设置状态
  setIsAgree(isAgree){
    let idx = this.data.messageList.findIndex((item)=>{
        return item.id && item.id === messageId
    })
    console.log('idxidx',idx)
    this.data.messageList[idx].isAgree = isAgree;
    this.setData({
      messageList: this.data.messageList
    })
  },
  /**
   * 打电话
   */
  makePhone(e){
    let msgContent = e.currentTarget.dataset.msgcontent;
    let phone = msgContent.split('<br/>')[1];
    if(phone){
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  },
  /**
   *  复制微信号
   */
  copyWechat(e){
    let msgContent = e.currentTarget.dataset.msgcontent;
    let wechat = msgContent.split('<br/>')[1];
    if(wechat){
      wx.setClipboardData({
        data: wechat,
        success: function (res) {
          wx.showToast({
            title: '复制成功',
            icon:'none'
          })
        }
      })
    }
  },
  /**
   * 发送微信消息
   */
  sendWechatMessage() {
    if (!this.data.wechatObj.activeRequest){
      this.setData({
        'modal.showModal': true,
        'wechatObj.positon': 1
      })
    }else{
      wx.showToast({
        title: '已发送过请求，请勿重复操作',
        icon:'none'
      })
    }
  },
  /**
   * 发送简历消息
   */
  sendResumeMessage() {
    let _this = this;
    if (this.data.options.isHr == '1'){
      this.exchangeInfo(3,(res)=>{
        if(res.code == '9806'){
          wx.showToast({
            title: res.message,
            icon:'none'
          })
        }else{
          this.sendMessage(3, '我邀请您投递该职位， 您是否同意')
        }
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '确定要投递简历吗？',
        success: function (res) {
          if (res.confirm) {
            _this.confirmPostResume();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  /**
   * 投递简历 
   */
  confirmPostResume(){
    network.post('/weipinDirectChat/confirmPostResume.do',{
      senderFansId: this.data.senderFansId,
      receiverFansId: this.data.options.receiverFansId,
      positionId: this.data.options.positionId
      },(res)=>{
        if(res.code == '0'){
          if(res.haveResume == 1){
            this.sendMessage(33, '', 1, messageId);
            this.setIsAgree(1);
          }else{
            wx.showModal({
              title: '提示',
              content: '您还没有完善简历信息，先去完善',
              confirmText:'去完善',
              success: function (res2) {
                if (res2.confirm) {
                  wx.navigateTo({
                    url: '../../mine/editPreview/editPreview?pageType=mine',
                  })
                } else if (res2.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }

        }else{
          wx.showToast({
            title: res.message,
            icon:'none'
          })
        }
      })
  },
  //切换常用语状态
  switchPhraseState(){
     this.setData({
       editPhrase: !this.data.editPhrase
     })
  },
  //常用语新增事件
  newAddPhrase(){
     this.setData({
       currentPhrase: {
         phrasewordId: '',
         content: ''
       },
       showPhraseModal: true 
     })
  },
  /**
   * 关闭常用语弹框
   */
  onClosePhrase(){
      this.setData({
        showPhraseModal:false
      })
  },
  /**
   * 常用语弹框保存后
   */
  onPhraseSave(){
    this.getChatPhrasewords();
  },
  /**
   * 常用语弹框发送后
   */
  onPhraseSend(e){
    this.sendMessage(0, e.detail.content);
    this.getChatPhrasewords();
    this.setData({
      openPhrase:false
    })
  },
  /**
   * 获取常用语列表
   */
  getChatPhrasewords(){
    network.post('/weipinDirectChat/getChatPhrasewords.do',{
        quickSpFansId:getApp().globalData.fansId
      },(res)=>{
         if(res.code == '0'){
           this.setData({
             phraseList:res.data
           })
         }
      })
   },
   /**
    * 编辑常用语
    */
  modifyPhrase(e){
     let { item } = e.currentTarget.dataset;
      this.setData({
        currentPhrase: {
          phrasewordId: item.id,
          content: item.content
        },
        showPhraseModal:true     
      })
  },
  /**
   * 删除常用语
   */
  deletePhrase(e) {
    let { item } = e.currentTarget.dataset;
    network.post('/weipinDirectChat/delChatPhraseword.do', {
      phrasewordId: item.id
    }, (res) => {
      if (res.code == '0') {
        this.getChatPhrasewords();
        wx.showToast({
          title: '删除成功',
          icon:'none'
        })
      }
    })
  },
  /**
   * 选择某条常用语发送
   */
  selectPhrase(e){    
    if (!this.data.editPhrase){
      let { content } = e.currentTarget.dataset;
      this.sendMessage(0, content);
      this.setData({
        openPhrase:false
      })
    }
  },
  /**
   * 选择表情
   */
  selectEmoji(e){
    let { ekey } = e.currentTarget.dataset;
    this.setData({
      textMessage: this.data.textMessage + ekey
    })
  },
  /** 
   * 发送表情
   */
  sendEmojiMessage(){
    let textMessage = this.data.textMessage;
    if (!textMessage){
      wx.showToast({
        title: '内容不能为空',
        icon:'none'
      })
    }else{
      this.sendMessage(0, textMessage)
      this.setData({
        openEmoji:false,
        textMessage:''
      })
    }
  },
  /**
   * 发送图片
   */
  openCameraOrAlbum(e){
    let _this = this;
    let { stype } = e.currentTarget.dataset;
    commonApi.uploadImage(stype,(res)=>{
      console.log('uploadImg',res)
      _this.sendMessage(5,res.url)
      _this.setData({
        openImage:false
      })
    })
  },
  /**
   * 预览图片消息
   */
  previewImageMessage(e){
    let { src } = e.target.dataset;
    wx.previewImage({
      urls: [src] // 需要预览的图片http链接列表
    })
  }
})