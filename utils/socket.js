const config = require('../config')
const host = config.host.split('//')[1]; 

class Socket {
  constructor(senderFansId, receiverFansId) {
    this.senderFansId = senderFansId
    this.pageUnload = false
    this.connected = false
    this.wssHost = `wss://${host}/weipinChatWebSocket/${senderFansId}/${receiverFansId}`
    this.soTask = wx.connectSocket({
      url: this.wssHost,
      success(){
        console.log('connectSocket连接成功')
      },
      fail(err){
        console.log('connectSocket连接失败：', err)
      }
    })
    
    // 监听连接成功
    wx.onSocketOpen((res) => {
      console.log('WebSocket连接已打开！')
      this.connected = true
    })

    // 监听连接断开
    wx.onSocketError((res) => {
      console.log('WebSocket连接打开失败，请检查！')
      this.connected = false
      wx.connectSocket({
        url: this.wssHost
      })
    })

    // 监听连接关闭
    wx.onSocketClose((res) => {
      console.log('WebSocket关闭')
      this.connected = false
      if (!this.pageUnload){
        //非页面关闭导致的关闭，重连socket
        wx.connectSocket({
          url: this.wssHost
        })
      }
    })

  }

  sendMessage(data) {
    if(!this.connected){
      console.log('not connected')
      // return
    }
    console.log('发消息', data)
    wx.sendSocketMessage({
      data: JSON.stringify(data)
    })
  }

  

  onMessage(callback) {
    if(typeof(callback) != 'function')
      return
    // 监听服务器消息
    wx.onSocketMessage((res) => {
      const data = JSON.parse(res.data)
      callback(data)
    })
  }

  close(){
    this.pageUnload = true;
    this.soTask.close({
      reason: '页面关闭',
      success() {
        console.log('WebSocket 关闭成功！！！')
      }
    });
  }
}

export default Socket