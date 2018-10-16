const user = require('../../utils/user.js')


Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showAuth: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  /**
   * 组件生命周期
   */
  attached() {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     *  获取用户信息授权
     */
    getUserInfo(e){
      console.log(e.detail)
      if (e.detail.errMsg == "getUserInfo:ok"){
        let fansId = getApp().globalData.fansId;
        let detail = e.detail;
        let eniv = {
          en: detail.encryptedData,
          iv: detail.iv
        };
        let cb = () => {
          wx.showToast({
            icon: 'none',
            title: '授权成功'
          })
          this.setData({
            showAuth:false
          })
          wx.showTabBar();
          this.triggerEvent('myevent');
        }
        user._saveUserInfo(detail.userInfo, fansId, eniv, cb)
      }else{
        wx.showModal({
          title: '提示',
          content: '拒绝授权，功能无法使用哦',
          showCancel:false
        })
      }
    }
  }
})
