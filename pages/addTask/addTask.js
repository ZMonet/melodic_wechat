// pages/addTask/addTask.js
var dateTimePicker = require('../../utils/dateTimePicker.js');
var levelList = getApp().globalData.levelList;
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;
var circleList = getApp().globalData.circleList;
var taskStatusList = getApp().globalData.taskStatusList;

Page({

  data: {
    actionType: "",

    endTimeArray: null,
    endTime: null,
    startTimeArray: null,
    startTime: null,
    startYear: 2000,
    endYear: 2050,
    currentTime:'',

    repeatList: ['不循环','每天','每周'],
    collectionList: [],
    levelList: ['低','中','高'],

    record: {
        id: null,
        taskUid: null,
        title: null,
        level: null,
        collection: null,
        description: '',
        startTimeStr: null,
        endTimeStr: null,
        repeat: null,
        status: null,
        complete: null
    },

    collections: [],

    warnInfo: '',
    hasMessage: false
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
    }.bind(this), 1500);
  },

  onLoad: function(options){
    var that = this;

    if (options.currentCollection) {
      var record = that.data.record;
      record.collection = JSON.parse(options.currentCollection);
      that.setData({
        record:record
      })
    }

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
          var collectionList = that.data.collectionList;
          //初始化收集箱列表
          var taskBoxList = JSON.parse(res.data.content);
          if (taskBoxList.length === 0) { return; }
          for (var i = 0; i < taskBoxList.length; i++) {
            collectionList.push(taskBoxList[i].taskBoxName);
          }
          that.setData({
            collections: taskBoxList,
            collectionList:collectionList
          })
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }

    })

    this.setData({
      actionType: options.actionType
    })

    // 获取完整的年月日 时分秒，以及默认显示的数组

    var obj = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
    // 精确到分的处理，将数组的秒去掉
    var lastArray = obj.dateTimeArray.pop();
    var lastTime = obj.dateTime.pop();


    var endTimeArray = obj.dateTimeArray;
    var endTime = obj.dateTime;

    var startTimeArray = obj.dateTimeArray;
    var startTime = obj.dateTime;


    var record = this.data.record;

    this.setData({
      currentTime: obj.dateTimeArray[0][obj.dateTime[0]] + '-' + obj.dateTimeArray[1][obj.dateTime[1]] + '-' + obj.dateTimeArray[2][obj.dateTime[2]] + ' ' + obj.dateTimeArray[3][obj.dateTime[3]] + ':' + obj.dateTimeArray[4][obj.dateTime[4]]
    });
    record.endTimeStr = endTimeArray[0][endTime[0]] + '-' + endTimeArray[1][endTime[1]] + '-' + endTimeArray[2][endTime[2]] + ' ' + endTimeArray[3][endTime[3]] + ':' + endTimeArray[4][endTime[4]];
    
    record.startTimeStr = startTimeArray[0][startTime[0]] + '-' + startTimeArray[1][startTime[1]] + '-' + startTimeArray[2][startTime[2]] + ' ' + startTimeArray[3][startTime[3]] + ':' + startTimeArray[4][startTime[4]];

    this.setData({
      endTime: obj.dateTime,
      endTimeArray: obj.dateTimeArray,
      startTimeArray: obj.dateTimeArray,
      startTime: obj.dateTime,
      record:record
    });

    if (options.record !== undefined) {
      this.setData({
        record: JSON.parse(options.record)
      })
    }

    if(options.autoAdd){
      this.showMessageBox('系统已经给你自动推荐任务');
    }

    if (options.recordTitle){
      var record = this.data.record;
      record.title = options.recordTitle;
      this.setData({
        record:record
      })
    }
  },

  changeEndTime(e) {
    this.setData({ endTime: e.detail.value });
  },

  changeStartTime(e) {
    this.setData({ startTime: e.detail.value });
  },

  changeEndTimeColumn(e) {
    var arr = this.data.endTime, dateArr = this.data.endTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    var endTimeArray = this.data.endTimeArray;
    var endTime = this.data.endTime;
  
    var record = this.data.record;
    record.endTimeStr = endTimeArray[0][endTime[0]] + '-' + endTimeArray[1][endTime[1]] + '-' + endTimeArray[2][endTime[2]] + ' ' + endTimeArray[3][endTime[3]] + ':' + endTimeArray[4][endTime[4]];
    this.setData({
      endTimeArray: dateArr,
      record:record
    });
  },
  changeStartTimeColumn(e) {
    var arr = this.data.startTime, dateArr = this.data.startTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    var startTimeArray = this.data.startTimeArray;
    var startTime = this.data.startTime;


    var record = this.data.record;
    record.startTimeStr = startTimeArray[0][startTime[0]] + '-' + startTimeArray[1][startTime[1]] + '-' + startTimeArray[2][startTime[2]] + ' ' + startTimeArray[3][startTime[3]] + ':' + startTimeArray[4][startTime[4]];

    this.setData({
      startTimeArray: dateArr,
      record: record 
    });
  },

  repeatChange: function(e){
    var record = this.data.record;
    record.repeat = circleList[e.detail.value];
    this.setData({
      record:record
    })
  },

  collectionChange: function (e) {
    var record = this.data.record;
    record.collection = this.data.collections[e.detail.value];
    this.setData({
      record: record
    })
  },

  levelChange: function (e) {
    var record = this.data.record;
    record.level = levelList[e.detail.value];
    this.setData({
      record: record
    })
  },

  titleChange: function(e){
    var record = this.data.record;
    record.title = e.detail.value;
    this.setData({
      record: record
    })
  },

  descriptionChange: function(e){
    var record = this.data.record;
    record.description = e.detail.value;
    this.setData({
      record: record
    })
  },

  compareDate: function(startTime,endTime){
    return ((new Date(startTime.replace(/-/g, "\/"))) >= (new Date(endTime.replace(/-/g, "\/"))));
  },

  complete: function () {
    var that = this;    
    var userUid = wx.getStorageSync('UserUid');
    var Authorization = wx.getStorageSync('Authorization');

    if(that.data.record.title === null){
      that.showMessageBox("您还没有输入任务标题哦");
      return;
    }

    if(that.data.record.level === null){
      that.showMessageBox("您还没有选择任务优先级呢");
      return;
    }

    if(that.data.record.repeat === null){
      that.showMessageBox("您还没有选择任务重复呢");
      return;
    }

    var action = '';
    var record = this.data.record;
    var actionType = that.data.actionType;

    if (that.compareDate(that.data.currentTime,record.startTimeStr)){
      that.showMessageBox("开始时间不能小于或等于目前时间");
      return;
    }

    if (that.compareDate(record.startTimeStr, record.endTimeStr)){
      that.showMessageBox("开始时间不能大于或等于结束时间");
      return;
    }

    var pages = getCurrentPages();
    var disPage = pages[pages.length - 2];
    var records = disPage.data.records;

    if (actionType === '编辑任务') {
      records[record.id] = record;
      action = 'updateTask'
    } else if (actionType === '添加任务') {
      record.status = taskStatusList[1];
      record.id = records.length;
      action = 'addTask'
    }
    wx.request({
      url: serverURL + '/taskbox/' + action,
      data: {
        taskUid: record.taskUid,
        title: record.title,
        level: record.level === null ? levelList[0].str_en.toUpperCase() : record.level.str_en.toUpperCase(),
        collectionUid: record.collection.taskBoxUid,
        description: record.description,
        startTime: record.startTimeStr,
        endTime: record.endTimeStr,
        repeat: record.repeat.str_en.toUpperCase(),
        status: record.status.str_en.toUpperCase(),
        userUid: userUid
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
          that.showMessageBox(actionType + '成功');
          setTimeout(function () {
            wx: wx.navigateBack({
              delta: 1
            })
          }, 2200)
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    });
    
  },

  deleteTask: function () {
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    wx.request({
      url: serverURL + '/task/deleteTask',
      data:{
        'taskUid': that.data.record.taskUid,
      },
      header: {
        'Authorization': Authorization,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      success: function (res) {
        var Authorization = res.data.content;
        if (httpError.indexOf(res.statusCode) !== -1) {
          that.showMessageBox(res.data.content);
        } else {
          that.showMessageBox('删除任务成功');
          setTimeout(function () {
            wx: wx.navigateBack({
              delta: 1
            })
          }, 2200)  
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    })

  },

})