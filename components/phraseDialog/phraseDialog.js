
const network = require("../../utils/network.js")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    phrase:{
      type:Object,
      value:{
        phrasewordId:'',
        content:''
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    taValue:'',
  },
  /**
   * 组件生命周期
   */
  attached() {
    if (this.data.phrase.content){
      this.setData({
        taValue: this.data.phrase.content
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _close(){
      this.triggerEvent('close');   
    },
    _inputChange(e){
      let val = e.detail.value.trim();
      if(val.length <= 200){
        this.setData({
          taValue: val
        })
      }else{
        this.setData({
          taValue: val.substr(0,200)
        })
      }      
    },
    //保存
    _save(cb){
      if (!this.data.taValue){
         wx.showToast({
           title: '内容不能为空',
           icon:'none'
         })
         return;
      }
      network.post('/weipinDirectChat/saveChatPhraseword.do',{
        quickSpFansId:getApp().globalData.fansId,
        content: this.data.taValue,
        phrasewordId: this.data.phrase.phrasewordId
      },(res)=>{
        //注意：同时执行多个triggerEvent时，只第一个会生效
        if (cb && typeof cb === 'function') {
          cb(res);
        }else{
          this.triggerEvent('save');  
        }
        this._close();  
      })
    },
    //发送
    _send(){
       this._save((res)=>{
          this.triggerEvent('send', { content: this.data.taValue });
       })
    }
  },
})
