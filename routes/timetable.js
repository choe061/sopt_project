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
var schedule = function () {
    var table = [];
    var subject = [];
    var subjects = [];
};

router.post('/', function(req, res, next) {
    var select_sql = 'SELECT day1, start_period1, end_period1, day2, start_period2, end_period2 FROM timetable WHERE sid=?';
    var eval_sql = 'SELECT * FROM evaluation WHERE mid=?';
    var params = [req.body.sid];
    connection.query(select_sql, params, function (error, cursor) {
        if(error) {
            console.log('타임테이블 에러');
            res.json(error);
        }
        else {
            for(var i=0; i<cursor.length; i++) {

            }
        }
    });
});

/*router.post('/', function(req, res, next) {
    var select_sql = 'SELECT day1, start_period1, end_period1, day2, start_period2, end_period2 FROM timetable WHERE sid=?';
    var params = [req.body.sid];
        connection.query(select_sql, params, function(error, cursor) {
            if(cursor.length>0) {
                console.log(cursor);
                var usertype = new Array();
                //유저의 예상선호도를 저장할 배열 선언
                var likescore = new Array();
                for(var i = 0; i < cursor.length; i++) {
                    //유저가 중요시 여기는 타입을 배열에 저장
                    if(parseInt([req.body.type1])>5)
                        usertype.push(0);
                    if(parseInt([req.body.type2])>5)
                        usertype.push(1);
                    if(parseInt([req.body.type3])<=5)
                        usertype.push(2);
                    if(parseInt([req.body.type4])<=5)
                        usertype.push(3);
                    var k=0;

                    //likescore의 모든 값을 0으로 초기화
                    likescore[i]=0;
                    //유저의 예상선호도 likescore에 저장
                    for(var j = 0; j < 4; j++) {
                        //여기서 4는 타입의 개수
                        if(usertype[k] == j) {
                            switch(j) {
                                case 0:
                                    likescore[i] += parseInt([req.body.type1])*cursor[i].type1;
                                    break;
                                case 1:
                                    likescore[i] += parseInt([req.body.type2])*cursor[i].type2;
                                    break;
                                case 2:
                                    likescore[i] += (10-parseInt([req.body.type3]))*cursor[i].type3;
                                    break;
                                case 3:
                                    likescore[i] += (10-parseInt([req.body.type4]))*cursor[i].type4;
                                    break;
                            }
                            k++;

                        }
                    }
                    // console.log(likescore[i]);
                }

                //selection sort
                var min, temp;
                for(var i=0; i<cursor.length-1; i++) {
                    min = i;
                    for(var j=i+1; j<cursor.length; j++) {
                        if(likescore[j]<likescore[min]) min=j;
                    }
                    if(i != min) {
                        temp = likescore[i];
                        likescore[i] = likescore[min];
                        likescore[min] = temp;
                    }
                }

                console.log('----------------');
                for(var i=0; i<cursor.length; i++)
                    // console.log(likescore[i]);

                res.json({
                    result:true,
                });
            }

            else {
                res.status(503).json({
                    result:false, reason : "Cannot find selected article"
                });
            }
        });
});*/

module.exports = router;