var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
});

//유저 정보 유청
router.get('/:content_id', function (req, res, next) {
    var select_sql = 'SELECT * FROM member WHERE id=?';
    var params = [req.params.content_id];
    connection.query(select_sql, params, function (error, cursor) {
        if(cursor.length > 0) {
            res.json(cursor[0]);
        }
        else {
            res.status(503).json({
                result: false, reason: "Cannot find ID"
            });
        }
    });
});

//해당 유저의 다음 강의 시간
router.get('/:content_mid/next', function (req, res, next) {
    var select_sql = 'SELECT sid FROM selection WHERE mid=?';
    var m_params = [req.params.content_mid];
    var s_params = new Array();
    var dayOfTable = new Array();
    var now_time;
    var now_day;
    var next_lec;

    connection.query(select_sql, m_params, function(error, cursor){
        if(error) {
            res.json(error);
        }
        else {
            var d = new Date();
            //날짜를 yy:mm:dd로 바꾸는 함수
            function len(n, digits) {
                var zero = '';
                n = n.toString();
                if (n.length < digits) {
                    for (var i = 0; i < digits - n.length; i++) {
                        zero += '0';
                    }
                }
                return zero + n;
            }

            now_day = d.getDay() - 1; //월요일:0으로 timetable을 설정했기 때문에 -1
            now_time = len(d.getHours(), 2) + ':' + len(d.getMinutes(), 2) + ':' + len(d.getSeconds(), 2);
            console.log('요일-' + now_day);
            console.log('yy:mm:ss-' + now_time);
            for(var i=0; i<cursor.length; i++) {
                s_params.push(cursor[i].sid);
            }

            connection.query('SELECT classroom, day1, start_time1, day2, start_time2 FROM timetable WHERE id in (' + s_params + ')', function (err, data) {
                if (err) {
                    res.json(err);
                }
                else {
                    for(var i=0; i<data.length; i++) {
                        if(data[i].classroom) {
                            var classroom2 = data[i].classroom.split(' :');
                            console.log(classroom2[0]);
                            data[i].classroom = classroom2[0];
                        }
                    }
                    for(var i=0; i<data.length; i++) {
                        (function (n) {
                            if(data[n].day1 == now_day) {
                                dayOfTable.push({
                                    classroom: data[n].classroom,
                                    day: data[n].day1,
                                    start_time: data[n].start_time1
                                });
                            }
                            else if(data[n].day2 == now_day) {
                                dayOfTable.push({
                                    classroom: data[n].classroom,
                                    day: data[n].day2,
                                    start_time: data[n].start_time2
                                });
                            }
                        })(i);
                    }
                    var sorting_time = "start_time";
                    //오늘 요일에 해당하는 과목들을 시간별로 오름차순 정렬
                    dayOfTable.sort(function (a, b) {
                        return a[sorting_time] - b[sorting_time];
                    });
                    // console.log(dayOfTable);

                    for(var i=dayOfTable.length-1; i>=0; i--) {
                        if (now_time < dayOfTable[i].start_time) {
                            next_lec = dayOfTable[i];
                        }
                    }
                    console.log(next_lec);
                    res.json(next_lec);
                }
            });
        }
    });
});

//해당 유저의 시간표를 보여준다
router.get('/:content_mid/timetable', function (req, res, next) {
    var mytable_select_sql = 'SELECT sid FROM selection WHERE mid=?';
    var m_params = [req.params.content_mid];
    var s_params = new Array();
    connection.query(mytable_select_sql, m_params, function (error, mytable) {
        if(error) {
            res.json(error);
        }
        else {
            for(var i=0; i<mytable.length; i++) {
                s_params.push(mytable[i].sid);
            }
            connection.query('SELECT * FROM timetable WHERE id in (' + s_params + ')', function (err, data) {
                if(err) {
                    res.json(err);
                }
                else {
                    res.json(data);
                }
            });
        }
    });
});

router.get('/:content_mid/timetable/:content_id', function (req, res, next) {
    var select_sql = 'SELECT sid FROM selection WHERE mid=?';
    var m_params = [req.params.content_mid];
    var s_params = [req.params.content_id];
    connection.query(select_sql, m_params, function (error, data) {
        if(error) {
            res.json(error);
        }
        else {
            connection.query('SELECT * FROM timetable WHERE id in (' + s_params + ')', function (err, subject) {
                if(err) {
                    res.json(err);
                }
                else {
                    res.json(subject);
                }
            });
        }
    })
})

module.exports = router;
