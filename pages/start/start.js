// pages/start/start.js
var encoder = require('../../utils/md5.js');
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus:'none',
    currentFocus:'',
    userCertificate:{
      userName:'',
      password:''
    },
    warnInfo:'',
    hasMessage:false,
    loadingMessage:'正在加载中...',
    userSignUpMessage:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /**
     * 如果用户是从登录界面回传
     */
    this.setData({
      userCertificate: {
        userName: "2335195449@qq.com",
        password: "a123456"
      },
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
    if (this.data.userSignUpMessage != null) {
      this.setData({
        loginStatus: 'loading',
        loadingMessage: '欢迎加入melodic'
      })
      setTimeout(function(){
        this.newLogIn();
      }.bind(this),500)
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
  showMessageBox: function (error){
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


  inputFocus: function (e){
    this.setData({
      currentFocus:e.currentTarget.id
    })
  },
  inputBlur: function (){
    this.setData({
      currentFocus:''
    })
  },
  imputMessageDel: function(e){
    var userCertificate = this.data.userCertificate;

    if (e.currentTarget.dataset.type == "userName"){
      userCertificate.userName = '';  
    } else if (e.currentTarget.dataset.type == "password"){
      userCertificate.password = '';  
    }

    this.setData({
      userCertificate: userCertificate
    })
  },
  userNameInput: function(e){
    var that = this;
    var userCertificate = that.data.userCertificate;
    userCertificate.userName = e.detail.value;
    this.setData({
      userCertificate: userCertificate
    })
  },
  userPasswordInput: function(e){
    var that = this;
    var userCertificate = that.data.userCertificate;
    userCertificate.password = e.detail.value;
    this.setData({
      userCertificate: userCertificate
    })
  },
  logIn: function(){
    if (this.data.userCertificate.userName == '' && this.data.userCertificate.password == ''){
      this.showMessageBox('亲，我们发现您用户名和密码都没有输入呢')
    }else if(this.data.userCertificate.password == ''){
      this.showMessageBox('亲，你还没有输密码呢')
    } else if (this.data.userCertificate.userName == ''){
      this.showMessageBox('亲，您忘记输用户名了哦')
    } else if (this.data.userCertificate.userName != '' && this.data.userCertificate.password != ''){
      /**
       * 登录操作
       */
      var that = this;
      var userName = "";
      var userEmail = "";
      var userVerification = encoder.hexMD5(this.data.userCertificate.password);
      var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
      if (reg.test(this.data.userCertificate.userName)) userEmail = this.data.userCertificate.userName;
      else userName = this.data.userCertificate.userName;

      wx.request({
        url: serverURL+'/user/login',
        data:{
          "userEmail":userEmail,
          "userName":userName,
          "userVerification": userVerification
        },
        header: { 'Content-Type': 'application/json' },
        method:'POST',
        success: function(res){
          if (httpError.indexOf(res.statusCode) !== -1){
            that.showMessageBox(res.data.content);
          }else{
            var response = JSON.parse(res.data.content);
            wx.setStorage({
              key: 'UserUid',
              data: response.userUid,
            })
            wx.setStorage({
              key: 'DefaultTaskBoxUid',
              data: response.taskBoxUid,
            })
            var userCertificate = that.data.userCertificate;
            userCertificate.password = userVerification;
            that.setData({
              userCertificate: userCertificate
            })
            wx.setStorage({
              key: 'Authorization',
              data: response.Authorization
            })
            wx: wx.redirectTo({
              url: '/pages/index/index',
            })
          }
        },
        fail: function(res){
          that.showMessageBox('哎呀，服务器异常了QAQ')
        }
      })
      this.setData({
        loginStatus: 'loading'
      })
    }
  },

  /**
   * 新注册用户登录
   */
  newLogIn: function(){
    var that = this;
    wx.request({
      url: serverURL + '/user/login',
      data: {
        "userName": "",
        "userEmail": that.data.userSignUpMessage.email,
        "userVerification": that.data.userSignUpMessage.password
      },
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.showMessageBox(res.data.content);
        } else {
          var response = JSON.parse(res.data.content);
          wx.setStorage({
            key: 'Authorization',
            data: response.Authorization
          })
          wx.setStorage({
            key: 'UserUid',
            data: response.userUid,
          })
          wx.setStorage({
            key: 'DefaultTaskBoxUid',
            data: response.defaultTaskBoxUid,
          })
          wx: wx.redirectTo({
            url: '/pages/index/index',
          })
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    })
  },
  signUp: function(){
    wx:wx.navigateTo({
      url: '/pages/start/signUp/signUp'
    })
  },
  solveLoginProblem: function(){
    wx:wx.navigateTo({
      url: '/pages/start/loginProblem/loginProblem',
    })
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
  
  },

})