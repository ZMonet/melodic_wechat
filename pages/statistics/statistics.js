// pages/statistics/statistics.js
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;
var wxCharts = require('../../utils/wxcharts.js');
var util = require('../../utils/util.js'); 
var serverURL = getApp().globalData.serverURL;
var httpError = getApp().globalData.httpError;
var columnChart = null;
var pieChart=null;
var chartData = {
    main: {

      columnDataList: [],
      data: [],
      categories: ['日', '一', '二', '三', '四','五','六']
    }
};

Page({
  data: {
    pieDataList:[],
    currentChart:0,
    isMainChartDisplay: true,
    pieChartData:[],
    currentDateTimeStr:'',
    bestDay:'-1'
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


  onLoad: function (e) {
    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');

    this.setData({
      currentDateTimeStr: util.formatDate(new Date())
    })

    var that = this;
    var Authorization = wx.getStorageSync('Authorization');
    var userUid = wx.getStorageSync('UserUid');

    wx.request({
      url: serverURL + '/statics/bestStatics',
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
          if(res.data.content === '-1'){
            that.setData({
              bestDay: '不存在的'
            })
          }else{
            var index = parseInt(res.data.content);
            that.setData({
              bestDay: chartData.main.categories[index]
            })
          }
          
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    });

    wx.request({
      url: serverURL + '/statics/weekStatics',
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
          chartData.main.data = JSON.parse(res.data.content);
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    });

    wx.request({
      url: serverURL + '/statics/allStatics',
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
          that.setData({
            pieChartData: JSON.parse(res.data.content)
          })
          pieChart = new wxCharts({
            animation: true,
            canvasId: 'pieCanvas',
            type: 'pie',
            series: [{
              name: '已完成任务',
              data: that.data.pieChartData[0],
            }, {
              name: '未完成任务',
              data: that.data.pieChartData[1],
            }, {
              name: '已过期任务',
              data: that.data.pieChartData[2],
            }],
            width: 300,
            height: 300,
            dataLabel: true,
          });
        }
      },
      fail: function (res) {
        that.showMessageBox('哎呀，服务器异常了QAQ')
      }
    });
  },
  changeChart: function(){
    var that = this;
    var currentChart = this.data.currentChart;
    if(currentChart === 0){
      setTimeout(function(){
        columnChart = new wxCharts({
          canvasId: 'columnCanvas',
          type: 'column',
          animation: true,
          categories: chartData.main.categories,
          series: [{
            name: '完成任务量',
            color: '#188df0',
            data: chartData.main.data,
            format: function (val, name) {
              return val.toFixed(2);
            }
          }],
          yAxis: {
            min: 0,
            max: 20
          },
          xAxis: {
            disableGrid: false,
            type: 'calibration'
          },
          extra: {
            column: {
              width: 15,
            },
            legendTextColor: '#000000'
          },
          width: 300,
          height: 300,
        });
      },800);
      

      this.setData({
        currentChart:1
      })
    } else if (currentChart === 1){
      setTimeout(function(){
        pieChart = new wxCharts({
          animation: true,
          canvasId: 'pieCanvas',
          type: 'pie',
          series: [{
            name: '已完成任务',
            data: that.data.pieChartData[0],
          }, {
            name: '未完成任务',
            data: that.data.pieChartData[1],
          }, {
            name: '已过期任务',
            data: that.data.pieChartData[2],
          }],
          width: 300,
          height: 300,
          dataLabel: true,
        });
      },800);
      this.setData({
        currentChart:0
      })
    }
  }
});

