
const config = require("../config.js")
const network = require('./network.js')

let user = {
  _cb:null,
  _cb2:null,
  // 登录
  login: function (cb,cb2) {
    this._cb = cb;
    this._cb2 = cb2;
    let _this = this;
    let _globalData;
    if (getApp()){
      _globalData = getApp().globalData;
    }
    let sessionId = wx.getStorageSync("sessionId");
    wx.login({
      success: response => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (response.code) {
              wx.request({
                url: config.host + '/weipin/quickSpLogin.do',
                method: "POST",
                header: {
                  "lversion": `${config.lversion}`,
                  "content-type": "application/x-www-form-urlencoded"
                },
                data: {
                  code: response.code,
                  sessionId: sessionId
                },
                success: function (res) {
                  let _data = res.data
                  if (_data.code == "0") {
                    _globalData.fansId = _data.data.quickSpFansId;
                    if (_data.data.companyinfoPid){
                      _globalData.companyId = _data.data.companyId;
                      _globalData.companyinfoPid = _data.data.companyinfoPid;
                      _globalData.companyType = _data.data.companyType;
                    }

                    console.log('quickSpLogin', _data.data)
                    if (_data.data.isSystemUser == 1 && !_globalData.hrUser){
                      //第一次手机注册或登录后，下次直接登录
                      _globalData.hrUser = { companyinfoId: _data.data.companyinfoId, loginPhone: _data.data.loginPhone}
                    }
                    if (sessionId !== _data.data.sessionId) {     //不同则更新，后台设置5个小时过期
                      wx.setStorageSync('sessionId', _data.data.sessionId);
                    }
                    // if (!getApp().globalData.userInfo){      //授权改成按钮触发的了，这个不需要了
                    //   _this._authUserInfo(_data.data.quickSpFansId);
                    // }else 
                    if(cb2){
                      cb2()
                    }                  
                    if(cb){
                      cb(_data.data)
                    }
                    //rpo管理员或hr扫码进入来关联身份
                    if (getApp().globalData.rpoUserId){
                      _this._saveAuthInfo(_data.data.sessionId);
                    }
                  }
                }
              })
        }
      }
    })
  },
  /**
   * 授权用户信息
   */
  _authUserInfo(fansId){
    let _this = this;
    wx.getUserInfo({
      withCredentials:true,
      success: response => {
        // 允许授权，保存用户信息
        let eniv = {
          en: response.encryptedData,
          iv: response.iv
        }
        _this._saveUserInfo(response.userInfo, fansId, eniv);
      },
      fail:(err)=>{
        _this._cb2 && _this._cb2();
        wx.navigateTo({
          url: '/pages/generation/authorize/authorize',
        })
        //拒绝授权
        // wx.showModal({
        //   title: '提示',
        //   content: '您拒绝了授权,小程序部分功能将无法正常使用。如需正常，请按确定并在【设置】页面中授权用户信息',
        //   success: function (res) {
        //     if (res.confirm) {
        //        wx.openSetting({
        //          success: (res) => {
        //            if (res.authSetting['scope.userInfo']) {                  
        //              setTimeout(() => {   //增加延时确保授权已生效                     
        //                wx.getUserInfo({
        //                  success:(res2) => {
        //                    //保存用户信息
        //                    _this._saveUserInfo(res2.userInfo, fansId)
        //                  }
        //                })
        //              }, 100)
        //            } else {
        //              if (_this._cb2) {
        //                _this._cb2()
        //              } 
        //              console.log('未允许授权用户信息')
        //            }
        //          },
        //          fail:()=>{
        //            if (_this._cb2) {
        //              _this._cb2()
        //            } 
        //          }
        //        })          
        //     } else if (res.cancel) {
        //       if(_this._cb2){
        //         _this._cb2()
        //       }          
        //     }
        //   }
        // });
      }
    })
  },
  /**
   * 保存用户信息
   */
  _saveUserInfo(userInfo, fansId, eniv, callback){
    let _this = this;
    let _userInfo = Object.assign({},userInfo, { id: fansId })
    wx.setStorageSync('userInfo', userInfo);
    wx.request({
      url: config.host + '/weipin/saveQuickSpFans.do',
      method: "POST",
      header: {
        "lversion": `${config.lversion}`,
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        userInfo: JSON.stringify(_userInfo),
        encryptedData: eniv.en,
        iv: eniv.iv,
        sessionId: wx.getStorageSync('sessionId')
      },
      success: function (res) {
        if(res.data.code == '0'){
          getApp().globalData.userInfo = userInfo
        }
        callback && callback();
        _this._cb2 && _this._cb2(); 
      },
    })
  },
  /**
   * rpo管理员或hr扫码进入来关联身份
   */
  _saveAuthInfo(sessionId){
    console.log('getApp().globalData.rpoUserId', getApp().globalData.rpoUserId)
    network.post('/api.do', {
      method: 'weiPinSp/saveAuthInfo',
      param: JSON.stringify({
        userId: getApp().globalData.rpoUserId,
        sessionId: sessionId
      })
    }, (res2) => {
      console.log('res2res2', res2)
    })
  },
  /**
   *  是否授权了用户信息
   */
  isAuthUserInfo(){
    if (wx.getStorageSync('userInfo')) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = user