// pages/start/loginProblem/loginProblem.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;


Page({

  /**
   * 页面的初始数据
   */
  data: {

    Focus: false,
    inforTrue: false,
    warnInfo: '',
    logOut:false,
    userInfo:{
      userName:'',
      userEmail:''
    },
    newUserName:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/user/getUserInfo',
      data: {
        'userUid': userUid,
      },
      header: {
        'Authorization': Authorization,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.showMessageBox(res.data.content);
        } else {
          var getUserInfo = JSON.parse(res.data.content);
          var userInfo = that.data.userInfo;
          userInfo.userEmail = getUserInfo.userEmail.substring(0,4)+'***@qq.com';
          userInfo.userName = getUserInfo.userName.length > 8 ? userInfo.userName = getUserInfo.userName.substring(0, 8) + '...' : getUserInfo.userName;
          that.setData({
            userInfo:userInfo
          })
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }
    })
  },

  logout: function(){

    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/user/logOut',
      data: {},
      header: {
        'Authorization': Authorization,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.showMessageBox(res.data.content);
        } else {
          that.setData({
            logOut: true
          })
          setTimeout(function () {
            wx.reLaunch({
              url: '/pages/start/start',
            })
          }, 2000);
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }
    })
  },

  showMessageBox: function (error,finalFunction = null) {
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
      if(finalFunction){
        finalFunction();
      }
    }.bind(this), 2500);
  },

  feedback: function(){
    wx.navigateTo({
      url: '/pages/feedback/feedback',
    })
  },

  collectionManage: function(){
    wx.navigateTo({
      url: '/pages/addCollectionBox/addCollectionBox',
    })
  },

  calendar: function(){
    wx.navigateTo({
      url: '/pages/calendar/calendar',
    })
  },

  // 模态框
  /**
    * 弹窗
    */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  newUserNameInput: function (e) {

    this.setData({
      newUserName: e.detail.value
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    this.hideModal();
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/user/updateUserInfo',
      data: {
        'userUid': userUid,
        'userName': that.data.newUserName
      },
      header: {
        'Authorization': Authorization,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.showMessageBox(res.data.content);
        } else {
          var userInfo = that.data.userInfo;
          userInfo.userName = that.data.newUserName;
          that.showMessageBox('修改用户名成功',function(){
            that.setData({
              userInfo: userInfo
            })
          });
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }
    })
  },
})