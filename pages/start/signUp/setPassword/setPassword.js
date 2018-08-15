// pages/start/signUp/setPassword/setPassword.js
var encoder = require('../../../../utils/md5.js');
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userSignUpMessage: {
      email: '',
      password: '',
      verificationCode: ''
    },
    Focus: false,
    inforTrue: false, 
    warnInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userSignUpMessage = JSON.parse(options.userSignUpMessage);
    this.setData({
      userSignUpMessage: userSignUpMessage
    })
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
  inputBlur: function () {
    this.setData({
      Focus: false
    })
  },
  userPasswordInput: function (e) {
    var userSignUpMessage = this.data.userSignUpMessage;
    userSignUpMessage.password = e.detail.value;
    if (userSignUpMessage.password.length >= 6) {
      this.setData({
        inforTrue: true
      })
    } else {
      this.setData({
        inforTrue: false
      })
    }
    this.setData({
      userSignUpMessage: userSignUpMessage
    })
  },
  inputMessageDel: function () {
    var userSignUpMessage = this.data.userSignUpMessage;
    userSignUpMessage.password='';
    this.setData({
      userSignUpMessage: userSignUpMessage,
      inforTrue: false
    })
    console.log(this.data.userSignUpMessage);
  },
  complete: function () {
    var that = this;
    var password = that.data.userSignUpMessage.password;
    var reg = new RegExp(/^(?![^a-zA-Z]+$)(?!\D+$)/);
    if (reg.test(password)){
      /**
       * 向服务器传递数据注册操作
       */
      password = encoder.hexMD5(password);
      var userSignUpMessage = that.data.userSignUpMessage;
      var pages = getCurrentPages();

      wx.request({
        url: serverURL + '/user/signup',
        data: {
          "userEmail": userSignUpMessage.email,
          "userVerification": password
        },
        header: { 'Content-Type': 'application/json' },
        method: 'POST',
        success: function (res) {
          
          if (httpError.indexOf(res.statusCode) !== -1) {
            that.showMessageBox(res.data.content);
          }else{
            var userSignUpMessage = that.data.userSignUpMessage;
            userSignUpMessage.password = password;
            that.setData({
              userSignUpMessage: userSignUpMessage
            })
            var disPage = pages[pages.length - 4];
            disPage.setData({
              userSignUpMessage: userSignUpMessage
            })
            wx: wx.navigateBack({
              delta: 3
            })
          }
        },
        fail: function (res) {
          that.showMessageBox('哎呀，服务器异常了QAQ')
        }
      })
    }else{
      this.setData({
        inforTrue: false
      })
      this.showMessageBox('亲，您的密码不符合要求哦');
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
  onShareAppMessage: function () {
  
  }
})