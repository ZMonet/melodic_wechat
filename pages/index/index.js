//index.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;
var levelList = getApp().globalData.levelList;
var circleList = getApp().globalData.circleList;
var taskStatusList = getApp().globalData.taskStatusList;
var util = require('../../utils/util.js'); 

Page({
  data: {
    records:[],
    completeNum: 0,
    bottom_status:'down',
    floatPanelStatus:'down',
    warnInfo: '',
    hasMessage: false,
    currentCollection: null,
    currentCollectionUid:null,
    collections:[],

    autoAdd:false
  },

  findCollectionByUid: function(collectionUid){
    var collectionsData = this.data.collections;
    for (var i = 0; i < collectionsData.length;i++){
      if(collectionsData[i].taskBoxUid === collectionUid) {
        return collectionsData[i];
      }
    }
    return undefined;
  },

  findRecordByTaskUid: function(taskUid){
    var records = this.data.records;
    for(var i = 0;i < records.lenth;i++){
      if(records[i].taskUid === taskUid) return true;
    }
    return false;
  },
  getCompleteNum: function(){
    var num = 0;
    var records = this.data.records;
    for(var i = 0;i < records.length;i++){
      if(records[i].status.num === 2) num++;
    }
    return num;
  },
  findLevelByName: function(levelName){
    for (var i = 0; i < levelList.length; i++) {
      if (levelList[i].str_en.toUpperCase() === levelName) {
        return levelList[i];
      }
    }
  },
  findStatusByName: function(statusName){
    for (var i = 0; i < taskStatusList.length; i++) {
      if (taskStatusList[i].str_en.toUpperCase() === statusName) {
        return taskStatusList[i];
      }
    }
  },
  findCircleByName: function(circleName){
    for (var i = 0; i < circleList.length; i++) {
      if (circleList[i].str_en.toUpperCase() === circleName) {
        return circleList[i];
      }
    }
  },


  onLoad: function(){
    this.rorateAnimation = wx.createAnimation({
      duration: 1400,
      timingFunction: 'linear', // "linear","ease","ease-in","ease-in-out","ease-out","step-start","step-end"
      delay: 0,
      transformOrigin: '50% 50% 0',
      success: function (res) {
        console.log("res")
      }
    })
  },

  onShow: function () {
    //开启时检查过期的项目
    //初始化收集箱
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
        url: serverURL + '/taskbox/findAll',
        data:{
          'userUid':userUid
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
            if(taskBoxList.length === 0) {return;}
            that.setData({
              collections: taskBoxList
            })
            wx.getStorage({
              key: 'currentCollectionUid',
              success: function(res) {
                var currentCollectionUid = res.data;
                if (currentCollectionUid && that.findCollectionByUid(currentCollectionUid) !== undefined) {
                  that.setData({
                    currentCollectionUid: currentCollectionUid
                  })
                  that.initCollectionBox(currentCollectionUid);
                }else{
                  that.setData({
                    currentCollectionUid: taskBoxList[0].taskBoxUid
                  })
                  that.initCollectionBox(taskBoxList[0].taskBoxUid);
                }
              },
              fail: function(res){
                that.setData({
                  currentCollectionIndex: taskBoxList[0].taskBoxUid
                })
                that.initCollectionBox(taskBoxList[0].taskBoxUid);
              }
            })        
          }
        },
        fail: function (res) {
          that.showMessageBox('哎呀，服务器异常了QAQ')
        }

    })
  },

  changeCurrentCollection:function(e){
    this.setData({
      currentCollectionUid: e.currentTarget.dataset.collectionuid
    })
    this.initCollectionBox(e.currentTarget.dataset.collectionuid);
    wx.setStorage({
      key: 'currentCollectionUid',
      data: e.currentTarget.dataset.collectionuid,
    })
    this.closeFloatPanel();
  },

  initCollectionBox: function (currentCollectionUid){
    //初始化默认收集箱
    var that = this;
    var defaultTaskBox = that.findCollectionByUid(currentCollectionUid);
    var taskList = defaultTaskBox.tasks;
    var records = that.data.records;
    var len = records.length;
    records.splice(0, records.length);
    for (var i = 0; i < taskList.length; i++) {
      var level = that.findLevelByName(taskList[i].priority)
      var collection = defaultTaskBox;
      var status = that.findStatusByName(taskList[i].status);
      var circle = that.findCircleByName(taskList[i].circle);
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
      currentCollection: defaultTaskBox
    })
    that.setData({
      completeNum: that.getCompleteNum()
    })
  },

  complete: function(e){
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    var completeNum = this.data.completeNum;
    var index = e.currentTarget.dataset.index;
    var records = this.data.records;

    if (records[index].status.num === 2) {
      completeNum--;
      records[index].status = taskStatusList[1];
    }
    else{
      completeNum++;
      records[index].status = taskStatusList[2];
    } 
    var record = records[index];
    wx.request({
      url: serverURL + '/taskbox/updateTask',
      data: {
        taskUid: record.taskUid,
        title: record.title,
        level: record.level.str_en.toUpperCase(),
        collectionUid: record.collection.collectionUid,
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
          that.showMessageBox('任务'+record.status.str_ch);
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    })

    this.setData({
      records: records,
      completeNum: completeNum
    })
  },

  bottomControl: function(){
    var bottom_status = this.data.bottom_status;
    if (bottom_status === 'down'){
      bottom_status = 'up';
    }else{
      bottom_status = 'down';
    }

    this.setData({
      bottom_status: bottom_status
    })
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
      if (finalFunction !== undefined) {
        finalFunction();
      }
    }.bind(this), 2500);
  },

  user_center: function(){
    wx:wx.navigateTo({
      url: '/pages/personalCenter/personalCenter',
    })
  },

  goDetail:function(e){
    var record = JSON.stringify(this.data.records[e.currentTarget.dataset.index]);

    if (this.data.records[e.currentTarget.dataset.index].status.num === 0){
      wx: wx.navigateTo({
        url: '/pages/addTask/addTask?record=' + record + "&actionType=查看过期任务",
      })
    }else{
      wx: wx.navigateTo({
        url: '/pages/addTask/addTask?record=' + record + "&actionType=编辑任务" ,
      })
    }
    
  },

  addTask: function(){
    var that = this;
    wx: wx.navigateTo({
      url: "/pages/addTask/addTask?actionType=添加任务&currentCollection=" + JSON.stringify(that.data.currentCollection),
    })
  },

  closeFloatPanel: function(){
    this.setData({
      floatPanelStatus:'down'
    })
  },

  collections: function(){
    this.setData({
      floatPanelStatus: 'up'
    })
  },

  statistic:function(){
    wx: wx.navigateTo({
      url: "/pages/statistics/statistics",
    })
  },

  getSimilarTask:function(){
    var that = this;
    this.setData({
      autoAdd:true
    });
    var currentDateTime = new Date();
    var currentDateTimeStr = util.formatTime(new Date());  
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');
    wx.request({
      url: serverURL + '/task/findSimilarTasksByDateTime',
      data: {
        'userUid': userUid,
        'currentTime': currentDateTimeStr
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
          if(res.data.content === 'null'){
            that.showMessageBox('您没有任务我们无法为您推荐哦',function(){
              that.setData({
                autoAdd: false
              })
            });
          }else{
            setTimeout(function () {
              wx: wx.navigateTo({
                url: "/pages/addTask/addTask?actionType=添加任务&currentCollection=" + JSON.stringify(that.data.currentCollection) + "&recordTitle=" + res.data.content + "&autoAdd=true",
              })
              that.setData({
                autoAdd: false
              })
            }, 1200)
          }
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
        that.setData({
          autoAdd: false
        })
      }
    })
    
  }

})
