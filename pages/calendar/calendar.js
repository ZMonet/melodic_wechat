// pages/calendar/calendar.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;

Page({
  data: {
    currentDate: "2017年05月03日",
    dayList: '',
    currentDayList: [],
    currentObj: ''
  },

  showMessageBox: function (error) {
    this.setData({
      warnInfo: error,
      hasMessage: true
    })
    setTimeout(function () {
      this.setData({
        hasMessage: false,
      })
    }.bind(this), 1800);
  },

  markCalendar: function (currentObj){
    var that = this;
    var currentDayList = this.data.currentDayList;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/task/findTasksByUserUid',
      data: {
        'userUid': userUid
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
          var taskDayList = JSON.parse(res.data.content);
          for (var i = 0; i < taskDayList.length; i++) {

            for (var j = 0; j < currentDayList.length; j++) {
              var day = currentObj.getFullYear() + '-' + ((currentObj.getMonth() + 1).toString().length > 1 ? '' : '0') + (currentObj.getMonth() + 1) + '-' + (currentDayList[j].value.toString().length > 1 ? '' : '0') + currentDayList[j].value;
              if (taskDayList[i].startTime.substring(0, 10) === day) {
                currentDayList[j].hasTask = true;
                j = currentDayList.length;
              }
            }
          }
        }
        that.setData({
          currentDayList: currentDayList
        })
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    })
  },

  doDay: function (e) {
    var that = this
    var currentObj = that.data.currentObj
    var Y = currentObj.getFullYear();
    var m = currentObj.getMonth() + 1;
    var d = currentObj.getDate();
    var str = ''
    if (e.currentTarget.dataset.key == 'left') {
      m -= 1
      if (m <= 0) {
        str = (Y - 1) + '/' + 12 + '/' + d
      } else {
        str = Y + '/' + m + '/' + d
      }
    } else {
      m += 1
      if (m <= 12) {
        str = Y + '/' + m + '/' + d
      } else {
        str = (Y + 1) + '/' + 1 + '/' + d
      }
    }
    currentObj = new Date(str)
    this.setData({
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
      currentObj: currentObj
    })
    this.setSchedule(currentObj);
  },
  strToDate:function(dateObj) {
    dateObj = dateObj.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/')
    dateObj = dateObj.slice(0, dateObj.indexOf("."))
    return new Date(dateObj)
  },
  getCurrentDayString: function () {
    var objDate = this.data.currentObj
    if (objDate != '') {
      return objDate
    } else {
      var c_obj = new Date();
      var a = c_obj.getFullYear() + '/' + (c_obj.getMonth() + 1) + '/' + c_obj.getDate();  
      console.log('a:'+a);
      return this.strToDate(a);
    }
  },
  setSchedule: function (currentObj) {
    var that = this
    var m = currentObj.getMonth() + 1
    var Y = currentObj.getFullYear()
    var d = currentObj.getDate();
    var dayString = Y + '/' + m + '/' + currentObj.getDate()
    var currentDayNum = new Date(Y, m, 0).getDate()
    var currentDayWeek = currentObj.getUTCDay() + 1
    var result = currentDayWeek - (d % 7 - 1);
    var firstKey = result <= 0 ? 7 + result : result;
    var currentDayList = []
    var f = 0
    for (var i = 0; i < 42; i++) {
      let data = []
      if (i < firstKey - 1) {
        currentDayList[i] = {
          value: '',
          hasTask: false
        } 
      } else {
        if (f < currentDayNum) {
          currentDayList[i] ={
            value: f + 1,
            hasTask: false
          } 
          f = currentDayList[i].value
        } else if (f >= currentDayNum) {
          currentDayList[i] = {
            value: '',
            hasTask: false
          } 
        }
      }
    }
    that.setData({
      currentDayList: currentDayList
    })
    that.markCalendar(currentObj);
  },

  onLoad: function (options) {
    var currentObj = this.getCurrentDayString();
    console.log('currentObj:' + currentObj.getFullYear());
    this.setData({
      currentDate: currentObj.getFullYear() + '年' + (currentObj.getMonth() + 1) + '月',
      currentObj: currentObj
    })
    this.setSchedule(currentObj);
  },

  goDetail:function(e){
    var currentObj = this.data.currentObj;
    var currentDayList = this.data.currentDayList;
    var currentDay = currentObj.getFullYear() + '-' + ((currentObj.getMonth() + 1).toString().length > 1 ? '' : '0') + (currentObj.getMonth() + 1) + '-' + (e.currentTarget.dataset.day.toString().length > 1 ? '' : '0') + e.currentTarget.dataset.day;
    wx.navigateTo({
      url: '/pages/calendar/dayCalendarList/dayCalendarList?dateTime='+currentDay,
    })
  }
}) 