//app.js
App({
  onLaunch: function () {
    
  },
  globalData: {
    serverURL:"http://localhost:8080",
    //www.wereadthinker.cn
    //www.akatsuki.tk
    //39.105.54.174
    httpError:[
      401, //Unauthorized 用户名或密码错误
      403, //Forbidden 不存在此用户|已被注册
      404, 
      408,  //请求超时
      500,  //服务器错误
    ],
    levelList:[
      {
        num: 1,
        sign: "!",
        str_en: "low",
        str_ch: "低"
      },
      {
        num: 2,
        sign: "!!",
        str_en: "mid",
        str_ch: "中"
      }, 
      {
        num: 3,
        sign: "!!!",
        str_en: "high",
        str_ch: "高"
      }
    ],
    taskStatusList:[
      {
        num:0,
        str_en:'invaild',
        str_ch:'已过期'
      },
      {
        num: 1,
        str_en: 'unfinished',
        str_ch: '未完成'
      },
      {
        num: 2,
        str_en: 'finished',
        str_ch: '已完成'
      }
    ],
    circleList:[
      {
      num:0,
      str_en:'noneCircle',
      str_ch:'不循环'
      },{
        num:1,
        str_en:'everyDay',
        str_ch:'每天'
      },{
        num:2,
        str_en:'everyWeek',
        str_ch:'每周'
      }
    ]
    
  }
})