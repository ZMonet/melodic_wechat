// pages/calendar/dayCalendarList/dayCalendarList.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;
var levelList = getApp().globalData.levelList;
var circleList = getApp().globalData.circleList;
var taskStatusList = getApp().globalData.taskStatusList;

Page({

  /**
   * 页面的初始数据
   */
  data: {

    records:[],
    collections:[],
    currentDateTime:''

  },

  findCollectionByUid: function (collectionUid) {
    var collectionsData = this.data.collections;
    for (var i = 0; i < collectionsData.length; i++) {
      if (collectionsData[i].taskBoxUid === collectionUid) {
        return collectionsData[i];
      }
    }
    return undefined;
  },

  findRecordByTaskUid: function (taskUid) {
    var records = this.data.records;
    for (var i = 0; i < records.lenth; i++) {
      if (records[i].taskUid === taskUid) return true;
    }
    return false;
  },

  findLevelByName: function (levelName) {
    for (var i = 0; i < levelList.length; i++) {
      if (levelList[i].str_en.toUpperCase() === levelName) {
        return levelList[i];
      }
    }
  },

  findStatusByName: function (statusName) {
    for (var i = 0; i < taskStatusList.length; i++) {
      if (taskStatusList[i].str_en.toUpperCase() === statusName) {
        return taskStatusList[i];
      }
    }
  },

  findCircleByName: function (circleName) {
    for (var i = 0; i < circleList.length; i++) {
      if (circleList[i].str_en.toUpperCase() === circleName) {
        return circleList[i];
      }
    }
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

  initTaskBox: function (result) {
    //初始化默认收集箱
    var that = this;
    var taskList = result;
    var records = that.data.records;
    var len = records.length;
    records.splice(0, records.length);
    for (var i = 0; i < taskList.length; i++) {
      var level = that.findLevelByName(taskList[i].priority)
      var status = that.findStatusByName(taskList[i].status);
      var circle = that.findCircleByName(taskList[i].circle);
      var collection = that.findCollectionByUid(taskList[i].taskBoxUid);
      var task = {
        id: i,
        taskUid: taskList[i].taskUid,
        title: taskList[i].title,
        level: level,
        collection: collection,
        description: taskList[i].description,
        startTimeStr: taskList[i].startTime,
        endTimeStr: taskList[i].endTime,
        repeat: circle,
        status: status
      }
      records.push(task);
    }
    that.setData({
      records: records,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var dateTime = options.dateTime;
    this.setData({
      currentDateTime:dateTime
    })

    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/taskbox/findAll',
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
          //初始化收集箱列表
          var taskBoxList = JSON.parse(res.data.content);
          if (taskBoxList.length === 0) { return; }
          that.setData({
            collections: taskBoxList
          })
          
          wx.request({
            url: serverURL + '/task/findTasksByDate',
            data: {
              'userUid': userUid,
              'dateTime': dateTime
            },
            header: {
              'Authorization': Authorization,
              'Content-Type': 'application/json'
            },
            method: 'POST',
            success:function(res){
              if (httpError.indexOf(res.statusCode) !== -1) {
                that.showMessageBox(res.data.content);
              } else {

                var taskList = JSON.parse(res.data.content);
                if (taskList.length === 0) { return; }
                that.initTaskBox(taskList);
              }
            },
            fail: function (res) {
              that.showMessageBox('哎呀，服务器异常了QAQ')
            }
          })

        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }

    })
  },

  goDetail: function (e) {
    var record = JSON.stringify(this.data.records[e.currentTarget.dataset.index]);

    if (this.data.records[e.currentTarget.dataset.index].status.num === 0) {
      wx: wx.navigateTo({
        url: '/pages/addTask/addTask?record=' + record + "&actionType=查看过期任务",
      })
    } else {
      wx: wx.navigateTo({
        url: '/pages/addTask/addTask?record=' + record + "&actionType=编辑任务",
      })
    }

  },
  
})