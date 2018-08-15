// pages/taskManage/taskManage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  // nextStep: function () {
  //   wx: wx.navigateTo({
  //     url: "/pages/taskManage/taskManage"
  //   })
  // },

  nextStep: function () {
    wx: wx.navigateTo({
      url: "/pages/addCollectionBox/addCollectionBox"
    })
  }

})