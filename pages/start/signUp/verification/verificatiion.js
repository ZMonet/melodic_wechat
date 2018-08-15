// pages/start/signUp/verification/verificatiion.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userSignUpMessage: {
      email:'',
      password:'',
      verificationCode:''
    },
    headerEmail:"",
    Focus: false,
    inforTrue: false,
    resendTime:'',
    disable:true,
    warnInfo: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userSignUpMessage = JSON.parse(options.userSignUpMessage);
    this.setData({
      userSignUpMessage: userSignUpMessage,
      headerEmail: userSignUpMessage.email.substring(0, 3)
    })
  }, 

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    /**
     * 服务器发送验证码操作
     */
    var that = this;
    this.setData({
      resendTime: '(60s)',
      disable: true
    })
    var time = 60;
    var interval = setInterval(function () {
      time--;
      that.setData({
        resendTime: '(' + time + 's)'
      })
      if (time < 0) {
        clearInterval(interval);
        that.setData({
          resendTime: '',
          disable: false
        })
      }
    }, 1000)
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
  userVerificationInput: function (e) {
    var userSignUpMessage = this.data.userSignUpMessage;
    userSignUpMessage.verificationCode = e.detail.value;
    if (userSignUpMessage.verificationCode.length == 6) {
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
    userSignUpMessage.verificationCode = '';
    this.setData({
      userSignUpMessage: userSignUpMessage,
      inforTrue: false
    })
  },
  resend: function () {
    /**
     * 服务器发送验证码操作
     */
    var that = this;
    wx.request({
      url: serverURL + '/user/signup/verificate',
      data: {
        "userEmail": that.data.userSignUpMessage.email,
      },
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      success: function (res) {},
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    })

    this.setData({
      resendTime:'(60s)',
      disable:true
    })
    var time = 60;
    var interval = setInterval(function(){
      time--;
      that.setData({
        resendTime:'('+time+'s)'
      })
      if(time < 0){
        clearInterval(interval);
        that.setData({
          resendTime:'',
          disable:false
        })
      }
    },1000)
  },
  nextStep: function () {
    /**
     * 验证码检测
     */
    var that = this;
    wx.request({
      url: serverURL + '/user/signip/matchVerificationCode',
      data: {
        "userEmail": that.data.userSignUpMessage.email,
        "verificationCode": that.data.userSignUpMessage.verificationCode
      },
      header: { 'Content-Type': 'application/json' },
      method: 'POST',
      success: function (res) {
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.setData({
            inforTrue: false
          })
          that.showMessageBox(res.data.content);
        }else{
          var userSignUpMessage = JSON.stringify(that.data.userSignUpMessage);
          wx: wx.navigateTo({
            url: '/pages/start/signUp/setPassword/setPassword?userSignUpMessage=' + userSignUpMessage,
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