const http = require('http')
const mysql = require('mysql');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const express = require('express');

//连接数据库服务器
var db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost', user: 'root', password: '459659281', database: 'timetable' //连接池
});

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  var pathname = url.parse(req.url).pathname;
  var query = url.parse(req.url).query;//解析用户请求路径

  //注册功能
  if (pathname == '/reg') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });
    req.on("end", function () {
      var params = querystring.parse(postdata);//GET & POST  ////解释表单数据部分
      var name = params.name
      var password = params.password
      var major = params.major
      var class1 = params.class
      var grade = params.grade
      var sno="4"
      sno+=grade

      if(major=="计算机科学与技术"){
        sno+="01"
      }else if(major=="软件工程"){
         sno+="02"
      }else if(major=="网络工程"){
        sno+="03"
      }else if(major=="数字媒体技术"){
        sno+="04"
      }
      sno+=class1
      db.query
      db.query(`insert into user(name,password,major,class,grade) values('${name}','${password}','${major}','${class1}','${grade}')`, function (err, data) {
        console.log(err)
        db.query(`select id from user where name='${name}'`, function (err, data1) {
            sno+=data1[0].id
            db.query(`update user set sno='${sno}'where id='${data1[0].id}'`, function (err, data) {
            })
          res.end(JSON.stringify({ status: "1", msg: "注册成功", sno: sno }))
        
      })
    })
  })
}
  //登录功能
  if (pathname == '/login') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var sno = params.sno
      var password = params.password
      db.query(`select sno,password,name,major from user where sno='${sno}'and password='${password}'`, function (err, data) {
        if (data == "") {
          res.end(JSON.stringify({ status: "-1" }))
        } else {
          res.end(JSON.stringify({ name: data[0].name, status: "1", major: data[0].major }))
        }
      })
    })
  }

  //管理员登录
  if (pathname == '/amlogin') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var administrators_number = params.administrators_number
      var administrators_password = params.administrators_password
      db.query(`select administrators_number,administrators_password from administrators where administrators_number='${administrators_number}'and administrators_password='${administrators_password}'`, function (err, data) {
        if (data == "") {
          res.end(JSON.stringify({ status: "-1" }))
        } else {
          res.end(JSON.stringify({ status: "1" }))
        }
      })
    })
  }


  //添加课程
  if (pathname == '/class_insert') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var name = params.name
      var startweek = params.startweek
      var endweek = params.endweek
      var major = params.major
      var classroom = params.classroom
      var teacher = params.teacher
      var week = params.week
      var time = params.time
      if (major == "计算机科学与技术") {
        db.query(`select week1,week2,time1,time2 from computer_major where start_week<='${startweek}' and'${startweek}'<end_week and end_week>='${endweek}'and '${endweek}'>start_week and(week1='${week}'||week2='${week}')&& (time1='${time}'||time2='${time}')`, function (err, data) {
          console.log(err)
          if (data == "") {
            db.query(`select week1,week2,time1,time2 from computer_major where class_name='${name}'`, function (err, data1) {
              if ((data1 == "")) {
                db.query(`insert into computer_major(class_name,start_week,end_week,week1,week2,classroom,teacher,time1,time2)values('${name}','${startweek}','${endweek}','${week}',' ','${classroom}','${teacher}','${time}',' ')`, function (err, data2) {
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                  })
                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))

                })
              }
              else if ((data1[0].week2 == " ") && ((data1[0].week1 != week && data1[0].time1 == time) || (data1[0].week1 == week && data1[0].time1 != time))) {
                db.query(`update computer_major set week2='${week}',time2='${time}'`, function (err, data2) {

                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                  })
                })
              } else {
                res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))
              }
            })

          } else {

            res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))

          }
        })
      }

      if (major == "软件工程") {
        db.query(`select week1,week2,time1,time2 from soft_major where start_week<'${startweek}' and'${startweek}'<end_week and end_week>'${endweek}'and '${endweek}'>start_week and(week1='${week}'||week2='${week}')&& (time1='${time}'||time2='${time}')`, function (err, data) {
          console.log(data)
          if (data == "") {
            db.query(`select week1,week2,time1,time2 from soft_major where class_name='${name}'`, function (err, data1) {
              if ((data1 == "")) {
                db.query(`insert into soft_major(class_name,start_week,end_week,week1,week2,classroom,teacher,time1,time2)values('${name}','${startweek}','${endweek}','${week}',' ','${classroom}','${teacher}','${time}',' ')`, function (err, data2) {
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))

                })
              }
              else if ((data1[0].week2 == " ") || (data1[0].week1 != week && data1[0].time1 == time) || (data1[0].week1 == week && data1[0].time1 != time)) {
                db.query(`update soft_major set week2='${week}',time2='${time}'`, function (err, data2) {

                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                })
              } else {
                res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))
              }
            })

          } else {

            res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))

          }
        })
      }


      if (major == "网络工程") {
        db.query(`select week1,week2,time1,time2 from web_major where start_week<'${startweek}' and'${startweek}'<end_week and end_week>'${endweek}'and '${endweek}'>start_week and(week1='${week}'||week2='${week}')&& (time1='${time}'||time2='${time}')`, function (err, data) {
          console.log(data)
          if (data == "") {
            db.query(`select week1,week2,time1,time2 from web_major where class_name='${name}'`, function (err, data1) {
              if ((data1 == "")) {
                db.query(`insert into web_major(class_name,start_week,end_week,week1,week2,classroom,teacher,time1,time2)values('${name}','${startweek}','${endweek}','${week}',' ','${classroom}','${teacher}','${time}',' ')`, function (err, data2) {
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))

                })
              }
              else if ((data1[0].week2 == " ") || (data1[0].week1 != week && data1[0].time1 == time) || (data1[0].week1 == week && data1[0].time1 != time)) {
                db.query(`update web_major set week2='${week}',time2='${time}'`, function (err, data2) {

                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                })
              } else {
                res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))
              }
            })

          } else {

            res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))

          }
        })
      }


      if (major == "数字媒体技术") {
        db.query(`select week1,week2,time1,time2 from digitmedia_major where start_week<'${startweek}' and'${startweek}'<end_week and end_week>'${endweek}'and '${endweek}'>start_week and(week1='${week}'||week2='${week}')&& (time1='${time}'||time2='${time}')`, function (err, data) {
          console.log(data)
          if (data == "") {
            db.query(`select week1,week2,time1,time2 from digitmedia_major where class_name='${name}'`, function (err, data1) {
              if ((data1 == "")) {
                db.query(`insert into digitmedia_major(class_name,start_week,end_week,week1,week2,classroom,teacher,time1,time2)values('${name}','${startweek}','${endweek}','${week}',' ','${classroom}','${teacher}','${time}',' ')`, function (err, data2) {
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))

                })
              }
              else if ((data1[0].week2 == " ") || (data1[0].week1 != week && data1[0].time1 == time) || (data1[0].week1 == week && data1[0].time1 != time)) {
                db.query(`update digitmedia_major set week2='${week}',time2='${time}'`, function (err, data2) {

                  res.end(JSON.stringify({ status: "1", msg: "课程添加成功" }))
                  db.query(`insert into classroom(classroom_name,startweek,endweek,date,time)values('${classroom}','${startweek}','${endweek}','${week}','${time}')`, function (err, data4) {
                    console.log(data4)
                    console.log(err)
                  })
                })
              } else {
                res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))
              }
            })

          } else {

            res.end(JSON.stringify({ status: "-1", msg: "课程添加失败,该时间已有课程或已超过该课程最大数量" }))

          }
        })
      }



    })
  }


  //删除课程

  if (pathname == '/class_delete') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var name = params.name
      var major = params.major
      if (major == "计算机科学与技术") {
        db.query(`select class_name from computer_major where class_name='${name}'`, function (err, data) {
          if (data == "") {
            res.end(JSON.stringify({ status: "-1", msg: "没有该课程,请核对后重试" }))
          } else {

            db.query(`select classroom,start_week,end_week from computer_major where class_name='${name}'`, function (err, data1) {
              console.log(data1)
              var startweek = data1[0].start_week
              var endweek = data1[0].end_week
              var classroom = data1[0].classroom
              db.query(`delete from computer_major where class_name='${name}'`, function (err, data) {
                db.query(`delete from classroom where classroom_name='${classroom}'and startweek='${startweek}'and endweek='${endweek}'`, function (err, data) {

                  res.end(JSON.stringify({ status: "1", msg: "删除成功" }))
                })
              })
            })
          }
        })
      }
      if (major == "软件工程") {
        db.query(`select class_name from soft_major where class_name='${name}'`, function (err, data) {

          if (data == "") {
            res.end(JSON.stringify({ status: "-1", msg: "没有该课程,请核对后重试" }))
          } else {
            db.query(`delete from soft_major where class_name='${name}'`, function (err, data) {
              res.end(JSON.stringify({ status: "1", msg: "删除成功" }))
            })
          }
        })
      }
      if (major == "网络工程") {
        db.query(`select class_name from web_major where class_name='${name}'`, function (err, data) {
          if (data == "") {
            res.end(JSON.stringify({ status: "-1", msg: "没有该课程,请核对后重试" }))
          } else {
            db.query(`delete from web_major where class_name='${name}'`, function (err, data) {
              res.end(JSON.stringify({ status: "1", msg: "删除成功" }))
            })
          }
        })
      }
      if (major == "数字媒体技术") {
        db.query(`select class_name from digitmedia_major where class_name='${name}'`, function (err, data) {
          if (data == "") {
            res.end(JSON.stringify({ status: "-1", msg: "没有该课程,请核对后重试" }))
          } else {
            db.query(`delete from digitmedia_major where class_name='${name}'`, function (err, data) {
              res.end(JSON.stringify({ status: "1", msg: "删除成功" }))
            })
          }
        })
      }
    })
  }



  //管理员查询课程&&学生课程查询
  if (pathname == '/class_query') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var name = params.name
      var major = params.major
      if (major == "计算机科学与技术") {
        db.query(`select * from computer_major`, function (err, data) {
          db.query(`select count(*) as num from user`,function(err,data1){
             console.log(data1[0].num)

            res.end(JSON.stringify({count:data1[0].num,data}))
          })
         

        })
      }
      if (major == "软件工程") {
        db.query(`select * from soft_major`, function (err, data) {
          var x = JSON.stringify(data)
          res.end(x)

        })
      }
      if (major == "网络工程") {
        db.query(`select * from web_major`, function (err, data) {
          var x = JSON.stringify(data)
          res.end(x)

        })
      }
      if (major == "数字媒体技术") {
        db.query(`select * from digitmedia_major`, function (err, data) {
          var x = JSON.stringify(data)
          res.end(x)

        })
      }
    })
  }


  //修改的信息检查
  if (pathname == '/changecheck') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var sno = params.sno
      var name = params.name
      db.query(`select sno from user where sno='${sno}'and name='${name}'`, function (err, data) {
        if (data == "") {
          res.end(JSON.stringify({ status: "-1", msg: "没有此学生的信息,请核对后再试" }))
        } else {
          res.end(JSON.stringify({ status: "1", sno: sno }))
        }
      })
    }
    )
  }



  //修改学生信息
  if (pathname == '/change') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var name = params.name
      var grade = params.grade
      var class1 = params.class
      var sno = params.sno
      var major = params.major

      db.query(`update user set name='${name}',grade='${grade}',class='${class1}',major='${major}'where sno='${sno}' `, function (err, data) {
        if (data) {
          res.end(JSON.stringify({ status: "1", msg: "修改成功" }))
        }
      })
    }
    )
  }


  //查询学生信息

  if (pathname == '/query') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var sno = params.sno
      console.log(sno)
      db.query(`select * from user where sno='${sno}'`, function (err, data) {
        if (data == "") {
          res.end(JSON.stringify({ status: "-1", msg: "没有此学生信息,请核对后重试" }))

        } else {
          res.end(JSON.stringify(data))
        }
      })
    }
    )
  }

  //删除学生信息

  if (pathname == '/delete') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var sno = params.sno
      var name = params.name
      db.query(`select * from user where sno='${sno}'and name='${name}'`, function (err, data) {
        if (data != "") {
          db.query(`delete from user where sno='${sno}'and name='${name}'`, function (err, data1) {
            res.end(JSON.stringify({ status: "1", msg: "删除成功" }))
          })
        } else {
          res.end(JSON.stringify({ status: "-1", msg: "没有此学生信息,请核对后重试" }))
        }
      })
    }
    )
  }


  //教室状态查询
  if (pathname == '/classroom_query') {
    var postdata = "";
    req.on("data", function (postDataChunk) {
      postdata += postDataChunk;
    });

    req.on("end", function () {
      var params = querystring.parse(postdata);
      var week = params.week
      var time = params.time
      var date = params.date
      db.query(`select classroom_name from classroom where '${week}'>=startweek and endweek>='${week}'and date='${date}'and time='${time}'`, function (err, data) {
        
        if (data == "") {
          db.query(`select classroom_name from classroom where id<12`, function (err, data1) {
               var x=
            res.end(JSON.stringify({ data: data1, msg: "空闲" }))
          })
        } else {
          db.query(`select classroom_name from classroom where id<12`, function (err, data1) {
        
         res.end(JSON.stringify({ data: data, msg: "占用",data1:data1,msg1:"空闲"}))
       })
          
        }
      })
    }
    )
  }

}).listen(8082)