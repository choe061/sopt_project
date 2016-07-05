/**
 * Created by choi on 2016-07-01.
 */
var express = require('express');
var mysql = require('mysql');
var async = require('async');
var router = express.Router();

var connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
});

var table = (function () {
    var monday = new Array(10), tuesday = new Array(10), wednesday = new Array(10), thursday = new Array(10), friday = new Array(10);
    var table = new Array(monday, tuesday, wednesday, thursday, friday);
    var sort_count = [];
    var timetable_sql = 'SELECT day1, start_period1, end_period1, day2, start_period2, end_period2 FROM timetable WHERE sid in (?, ?, ?, ?, ?)';
    var timetable_params = new Array(0);
    var countOfSid = new Array(0);
    var sort_timetable_params = new Array(0);

    return {
        table: table,
        sort_count: sort_count,
        countOfSid: countOfSid,
        timetable_sql: timetable_sql,
        timetable_params: timetable_params,
        sort_timetable_params: sort_timetable_params
    }
}());

router.get('/', function (req, res, next) {
        selecter();
        for (var i = 0; i < table.timetable_params.length; i++) {
            (function (n) {
                counter(table.timetable_params[n]);
            })(i);
        }
        console.log(table.sort_timetable_params);
        for (var i = 0; i < table.timetable_params.length; i++) {
            (function (n) {
                scheduler(n);
            })(i);
        }
});

var selecter = function () {
    table.timetable_params = [849, 590, 561, 513, 843];

    connection.query(table.timetable_sql, table.timetable_params, function (err, cursor) {
        if(err) {
            return err;
        }
        else {
            for(var i=0; i<table.timetable_params.length; i++) {
                (function (n) {
                    console.log(table.timetable_params[n]);
                })(i);
            }
            console.log(table.timetable_params);
            return table.timetable_params;
        }
    });
    console.log(table.table);
};

//과목당 한주에 몇번의 수업이 있는지 카운트, 오름차순 정렬
var counter = function(sid) {
    var count_sql = 'SELECT id, subject_name FROM timetable WHERE sid = ?';
    connection.query(count_sql, sid, function (error, count) {
        if (error) {
            return error;
        }
        else {
            //console.log(sid[n]);
            var counting = count.length;
            table.sort_timetable_params.push({
                timetable_params2: sid,
                countOfSid2: counting
            });
            var sorting_sid = "countOfSid2";
            //sid당 과목 갯수를 기준으로 오름차순 정렬
            table.sort_timetable_params.sort(function (a, b) {
                return a[sorting_sid] - b[sorting_sid];
            });
            console.log(table.sort_timetable_params);
            return table.sort_timetable_params;
        }
    });
};

var scheduler = function (i) {
    var sql = 'SELECT day1, start_period1, end_period1, day2, start_period2, end_period2 FROM timetable WHERE sid=?';//in (?, ?, ?, ?, ?)'
    console.log(table.sort_timetable_params);
    connection.query(sql, table.sort_timetable_params[i].timetable_params2, function (err, cursor) {  //틀린것! -> sid 하나에 대한 것만 가져와서 넣기!?! 1개끼리의 비교는?
        if (err) {
            return err;
        }
        else {
            console.log(cursor);
        }
    });
};
/*
var complete_s = [];
var flag = 0;
var m_min, m_min_st;
router.get('/', function (req, res, next) {
    var sql = 'SELECT day1, start_time1, end_time1, day2, start_time2, end_time2 FROM timetable WHERE sid in (1,2,3,41,42)';
    var m=[], t=[], w=[], th=[], f=[];
    connection.query(sql, function (err, cursor) {
        if(cursor.length > 0) {
            // s = cursor;
            res.json(cursor);
            for(var i=0; i<cursor.length; i++) {
                switch (cursor[i].day1) {
                    case 0:
                        m.push(cursor[i]);
                        break;
                    case 1:
                        t.push(cursor[i]);
                        break;
                    case 2:
                        w.push(cursor[i]);
                        break;
                    case 3:
                        th.push(cursor[i]);
                        break;
                    case 4:
                        f.push(cursor[i]);
                        break;
                    default :
                        console.log('찾지 못함');
                }
            }
            m_min = m[0];
            m_min_st = m[0].start_time1;
            for(var i=1; i<m.length; i++) {
                if(m_min_st > m[i].start_time1) {
                    m_min_st = m[i].start_time1;
                    m_min = m[i];
                }
            }
            complete_s.push(m_min);
            var flag_i;
            /!*for (var i=0; i<m.length; i++) {
                scheduler(m_min, m[i], flag);
                if(flag = 1) {
                    flag_i = i;
                    break;
                }
            }*!/
            //console.log(complete_s[0]);
            for(var i=0; i<m.length; i++) {
                for(var j=0; j<m.length; j++) {
                    scheduler(complete_s[i], m[j]);
                    complete_s.push(m[j]);
                    if(flag == 1) {
                        //console.log("break문"+i+j);
                        break;
                    }
                    //console.log("2차 포문"+i+j);
                }
                //console.log("1차 포문"+i+j);
            }
            //console.log(complete_s);
        }
        else {
            res.status(503).json({ result: false });
        }
    });
});

var scheduler = function (t1, t2) {
    /!*if(t1.start_time1 > t2.start_time1) {
        if(t1.start_time1 >= t2.end_time1) {
            if(t1.start_time2 > t2.start_time2) {
                if(t1.start_time2 >= t2.end_time2) {
                    flag = 1;
                    return t2;
                }
                else {
                    //console.log('시간이 겹칩1');
                    return ;
                }
            }
            else if(t1.start_time2 < t2.start_time2) {
                if(t1.end_time2 <= t2.start_time2) {
                    flag = 1;
                    return t2;
                }
                else {
                    console.log('시간이 겹칩1');
                    return ;
                }
            }
            else {
                console.log('시간이 겹칩1');
                return ;
            }
        }
        else {
            console.log('시간이 겹칩1');
            return ;
        }
    }
    else if(t1.start_time1 < t2.start_time1) {
        if(t1.end_time1 <= t2.start_time1) {
            if(t1.start_time2 > t2.start_time2) {
                if(t1.start_time2 >= t2.end_time2) {
                    flag = 1;
                    return t2;
                }
                else {
                    console.log('시간이 겹칩1');
                    return ;
                }
            }
            else if(t1.start_time2 < t2.start_time2) {
                if(t1.end_time2 <= t2.start_time2) {
                    flag = 1;
                    return t2;
                }
                else {
                    console.log('시간이 겹칩1');
                    return ;
                }
            }
            else {
                console.log('시간이 겹칩1');
                return ;
            }
        }
        else {
            console.log('시간이 겹침2');
            return ;
        }
    }
    else {
        console.log('시간이 겹침3');
        return ;
    }
};*/

module.exports = router;
