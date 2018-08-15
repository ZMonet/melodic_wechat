// pages/start/loginProblem/loginProblem.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    email: '',
    Focus: false,
    inforTrue: false,
    warnInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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

  showMessageBox: function (error) {
    setTimeout(function () {
      this.setData({
        loginStatus: 'none',
        warnInfo: error,
        hasMessage: true
      })
    }.bind(this), 500);
    setTimeout(function () {
      this.setData({
        hasMessage: false,
      })
    }.bind(this), 2500);
  },
  inputFocus: function () {
    this.setData({
      Focus: true
    })
  },
  inputFocus: function () {
    this.setData({
      Focus: true
    })
  },
  inputBlur: function () {
    this.setData({
      Focus: false
    })
  },
  userEmailInput: function (e) {
    var email = this.data.email;
    email = e.detail.value;
    if (email.length >= 5) {
      this.setData({
        inforTrue: true
      })
    } else {
      this.setData({
        inforTrue: false
      })
    }
    this.setData({
      email: email
    })
  },
  inputMessageDel: function () {
    this.setData({
      email: '',
      inforTrue: false
    })
  },
  nextStep: function () {
    /**
     * 此账户已存在
     */
    var that = this;
    var email = this.data.email;
    if (email.indexOf('@qq.com') === -1) {
      email = email + '@qq.com'
    }
    wx.request({
      url: serverURL + '/user/emailCheck',
      data: {
        "userEmail": email
      },
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.setData({
            inforTrue: false
          })
          that.showMessageBox(res.data.content);
        } else {
          that.setData({
            email: email
          })
          wx: wx.navigateTo({
            url: "/pages/start/loginProblem/problemComplete/problemComplete?email="+email
          })
          wx.request({
            url: serverURL + '/user/loginProblem',
            data: {
              "userEmail": email
            },
            header: { 'Content-Type': 'application/json' },
            method: 'POST',
            success: function (res) { },
            fail: function (res) { }
          })
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
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
  onShareAppMessage: function () {
  
  }
})