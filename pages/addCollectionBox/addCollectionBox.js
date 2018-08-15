// pages/addCollectionBox/addCollectionBox.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    collections:[],
    warnInfo: '',
    hasMessage: false,
    deleted:[],
    showModal: false,
    newCollectionName:''
  },

  onLoad: function(options){
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
          var collections = JSON.parse(res.data.content);
          var deleted = that.data.deleted;        
          for(var i = 0; i < collections.length;i++){
            deleted.push('show');
          }
          that.setData({
            collections: collections,
            deleted:deleted
          })
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }

    })
  },

  showMessageBox: function (error,finalFunction) {
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
      if(finalFunction !== undefined){
        finalFunction();
      } 
    }.bind(this), 2500);
  },

  deleteTaskBox: function(e){
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var taskBoxUid = e.currentTarget.dataset.taskboxuid;
    var index= e.currentTarget.dataset.index;
    var collections = that.data.collections;
    wx.request({
      url: serverURL + '/user/deleteTaskBox',
      data: {
        'taskBoxUid': taskBoxUid
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
          var deleted = that.data.deleted;
          deleted[index] = 'delete';
          that.setData({
            deleted: deleted
          })
          that.showMessageBox('任务删除成功',function(){
            collections.splice(index, 1);
            deleted.splice(index, 1);
            that.setData({
              deleted: deleted
            })
            that.setData({
              collections: collections
            })
          });
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }

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
  newCollectionNameInput: function(e){
    this.setData({
      newCollectionName: e.detail.value
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
      url: serverURL + '/user/addTaskBox',
      data:{
        'userUid':userUid,
        'taskBoxName':that.data.newCollectionName
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
          var deleted = that.data.deleted;
          var newCollection = JSON.parse(res.data.content);
          var collections = that.data.collections;
          collections.push(newCollection);
          deleted.push('show');
          that.showMessageBox('任务收集箱添加成功',function(){
            that.setData({
              collections: collections,
              deleted: deleted
            })
          });
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ');
      }
    })
  },

  goCollection: function(e){
    wx.setStorage({
      key: 'currentCollectionUid',
      data: e.currentTarget.dataset.collectionuid,
    })
    wx.navigateBack({
      delta:2
    })
  }
})

