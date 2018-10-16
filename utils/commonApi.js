/* 全局公用接口 */

let network = require('./network.js')
let config = require('../config.js')


/**
 * 解密授权手机号
 * @param {Object} e - {iv:'', encryptedData:''}
 * @param {Function} success - 授权解密之后的回调函数
 * @param {Function} cancel - 取消授权之后的回调函数
 */
export function getSpFansPhone(e,success,cancel) {
  let getQuickSpFansPhone = (code)=>{
    if (e.detail.errMsg == "getPhoneNumber:ok") {
      let globalData = getApp().globalData;
      let params = {
        code: code,
        quickSpFansId: globalData.fansId,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      }
      console.log('params', params)
      network.post('/weipin/getQuickSpFansPhone.do', params, (res) => {
        console.log('getSpFansPhone', res)
        if (res.code == 0 && res.data.phone) {
          globalData.phoneNumber = res.data.phone
          globalData.fansId = res.data.id
          console.log('你的手机号是：' + res.data.phone)
          wx.showToast({
            title: '授权成功',
            icon: 'success',
            duration: 1500,
            success: function () {
              if (success) {
                setTimeout(() => {
                  success(res.data)
                }, 1500)
              }
            },
          })
        }else{
          wx.showToast({
            icon:'none',
            title: '授权失败，请重试',
          })
        }
      })
    } else {
      wx.showToast({
        title: '您取消了授权',
        icon: 'none',
        duration: 1500,
        success: function () {
          if (cancel) {
            setTimeout(() => {
              cancel()
            }, 1500)
          }
        },
      })
    }
  }
  wx.login({
    success: response => {
      getQuickSpFansPhone(response.code)
    }
  })  
}

/**
 * 收集到的formId上报保存
 */
export function saveFormId(obj,success,fail){
  network.post('/weipin/saveFormid.do', {
      quickSpFansId :getApp().globalData.fansId,
      formid:obj.formId
  }, (res) => {
    console.log('saveFormid', res)
    if(res.code == 0){     
      if(success){
        success()
      }
    }else{
      if(fail){
        fail()
      }
    }
  })
}

/**
 * 上传图片
 */
export function uploadImage(sType,success,fail){
  let sourceType = ['album'];
  if (sType == 'camera'){
    sourceType = ['camera']
  }
  wx.chooseImage({
    count: 1,
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      var tempFilePaths = res.tempFilePaths
      var tempFiles = res.tempFiles
      if (tempFiles[0].size > 2 * 1024 * 1024) {
        wx.showToast({
          icon: 'none',
          title: '图片大小不能超过2M',
        })
        return false;
      }
      wx.showLoading({
        title: '图片正在上传',
      })
      //上传
      wx.uploadFile({
        url: config.host + '/weixin/uploadImg.do',
        filePath: tempFilePaths[0],
        name: 'imageFile',
        header: {
          "Content-Type": "multipart/form-data"
        },
        success: function (res2) {    
          wx.hideLoading() 
          let data = JSON.parse(JSON.parse(res2.data).data)
          // console.log('uploadfile', data)
          if (success){
            success(data)
          }
        },
        fail:function(err){
          // console.log(err)
          wx.hideLoading() 
          if(err.errMsg.indexOf('请求超时')>-1){
            wx.showToast({
              icon: 'none',
              title: '上传超时，请重新上传图片',
            })
          }
          if(fail){
            fail()
          }
        }
      })
    }
  })
}

/**
 * 获取未读消息总数
 */
export function getAllNotReadCount(success,fail){
  network.post('/weipinDirectChat/getAllNotReadCount.do',{
    receiverFansId: getApp().globalData.fansId
  },(res) => {
    if(res.code == 0){
      success && success(res.data)
    }
  })
}

export function saveImage(filePath, cb){
  wx.saveImageToPhotosAlbum({
    filePath: filePath,
    success(res) {
      wx.showModal({
        content: '海报已保存到系统相册\n快去分享给朋友',
        showCancel: false,
        confirmText: '我知道了',
        success: function (res) {

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
                  cb && cb();
                }
              }
            })
          }
        }
      })
    }
  })
}