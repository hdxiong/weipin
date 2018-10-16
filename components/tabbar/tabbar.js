
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIndex: {
      type: String,
      value: '0'
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
     * 切换tabbar菜单
     */
    _switchTab(e){ 
      let { idx } = e.currentTarget.dataset;
      if (idx == this.data.currentIndex){
        return;
      }
      switch(idx){
        case '0':
          wx.switchTab({
            url: '/pages/generation/companyList/companyList',
          })
          break;
        case '1':
          wx.switchTab({
            url: '/pages/generation/setting/setting',
          })
          break;
        case '2':
          wx.switchTab({
            url: '/pages/generation/create/create',
          })
          break;
      }
    }
  }
})
