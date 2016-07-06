/**
 * Created by choi on 2016-06-29.
 */
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');

var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var secret = 'chlqjarbs';   //token생성을 위한 secret key

var connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
});

router.get('/duplication/', function(req, res, next) {
    var sql = 'SELECT * FROM member WHERE email=?';
    var params = [req.query.email];
    connection.query(sql, params, function (error, cursor) {
        if(cursor.length > 0) {
            res.status(200).json({ result: false });
        }
        else {
            res.status(200).json({ result: true });
        }
    })
});

router.post('/up', function (req, res, next) {
    var insert_sql = 'INSERT INTO member(email, pw, university, nickname, grade, type1, type2, type3, type4, type5, satisfaction, usertype) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var select_sql = 'SELECT * FROM member WHERE id=?';
    var params = [
        req.body.email,
        req.body.pw,
        req.body.university,
        req.body.nickname,
        req.body.grade,
        req.body.type1,
        req.body.type2,
        req.body.type3,
        req.body.type4,
        req.body.type5,
        req.body.satisfaction,
        req.body.usertype
    ];
    connection.query(insert_sql, params, function (err, info) {
        if(err == null) {
            connection.query(select_sql, [info.insertId], function (error, cursor) {
                if(cursor.length > 0) {
                    res.status(200).json({
                        result: true,
                        email: cursor[0].email,
                        pw: cursor[0].pw,
                        university: cursor[0].university,
                        nickname: cursor[0].nickname,
                        grade: cursor[0].grade,
                        type1: cursor[0].type1,
                        type2: cursor[0].type2,
                        type3: cursor[0].type3,
                        type4: cursor[0].type4,
                        type5: cursor[0].type5,
                        satisfaction: cursor[0].satisfaction,
                        usertype: cursor[0].usertype
                    });
                }
                else {
                    res.status(503).json({ result: false, reason: "Cannot post" });
                }
            });
        }
        else {
            res.status(503).json(err);
        }
    });
});


router.post('/in', function (req, res, next) {
    var select_sql = 'SELECT * FROM member WHERE email in (?) AND pw in (?)';
    var update_sql = 'UPDATE member SET token=(?), exp_time=(?) WHERE email in (?)';
    var email = req.body.email;
    var pw = req.body.pw;
    connection.query(select_sql, [email, pw], function (err, user) {
        if(err) {
            console.log('500: server error');
            res.status(500).json(err);
        }
        else {
            if(!user[0]) {
                console.log('404: incorrect email or pw');
                res.status(404).json({
                    result: false,
                    reason: 'email또는 password 잘못됨'
                });
            }
            else if(user[0]) {
                //console.log(user[0]);
                var d = new Date();
                var exp_time = d.getTime()+120000;//test버전은 만료시간 2분 //1800000;   //만료시간 : 현재시간+30분으로 설정
                var body = {email: email, pw: pw};

                var token = jwt.sign(
                    body,
                    secret,
                    {
                        expiresIn: '0.01h'   //만료기한 30분 설정
                    },{
                        algorithm: 'HS256'  //HMAC using SHA-256 hash algorithm
                    });

                console.log('token : ' + token);
                res.status(200).json({
                    result: true,
                    token: token,
                    reason: '토큰 발급 성공'
                });
                var decoded = jwt.decode(token, secret);
                console.log('decoded : ' + JSON.stringify(decoded));
                connection.query(update_sql, [token, exp_time, email], function (err, data) {
                    if(err) {
                        console.log('토큰 저장 실패');
                    }
                    else {
                        console.log('토큰 저장 성공');
                    }
                });
            }
        }
    });
});

router.post('/auth', function (req, res, next) {
    var exp_sql = 'SELECT exp_time FROM member WHERE token=?';
    var delete_sql = 'UPDATE member SET token=null, exp_time=null WHERE token=?';
    var params = [req.body.token];
    connection.query(exp_sql, params, function (error, exp) {
        if(error) {
            res.json(error);
        }
        else {
            var d = new Date();
            var now_time = d.getTime();
            console.log(exp[0].exp_time);
            console.log(now_time);
            if(exp[0].exp_time > now_time) {
                res.json({ result: true });
            }
            else {  //30분이 지났을 경우 token, exp_time 삭제
                connection.query(delete_sql, params, function (error, cursor) {
                    if(error) {
                        res.json(error);
                    }
                    else {
                        res.json({ result: false });
                    }
                });
            }
        }
    });
});

module.exports = router;
