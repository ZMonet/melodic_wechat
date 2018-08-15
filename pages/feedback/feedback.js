// pages/feedback/feedback.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    warnInfo: '',
    hasMessage: false,
    feedback:''
  },

  showMessageBox: function (error, finalFunction) {
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
    }.bind(this), 2000);
    setTimeout(function () {
      if (finalFunction !== undefined) {
        finalFunction();
      }
    }, 2200)
  },

  nextStep: function () {
    var that = this;
    if(that.data.feedback === ''){
      that.showMessageBox('您还没有描述您的问题呢');
      return;
    }

    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/feedback/addFeedback',
      data: {
        'userUid': userUid,
        'feedback': that.data.feedback
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
          that.showMessageBox('您的意见已提交', function () {
            wx: wx.redirectTo({
              url: "/pages/personalCenter/personalCenter"
            })
          });
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }
    })
  },

  feedbackInput: function(e){
    this.setData({
      feedback:e.detail.value
    })
  }

})