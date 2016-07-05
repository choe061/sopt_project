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

var connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
});

router.post('/in', function (req, res, next) {
    var select_sql = 'SELECT * FROM user WHERE email in (?) AND pw in (?)';
    var update_sql = 'UPDATE user SET token=? WHERE email=?';
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
                console.log(user[0]);
                var body = {email: email, pw: pw};
                var secret = 'chlqjarbs';

                var token = jwt.sign(
                    body,
                    secret,
                    {
                        expiresIn: '0.5h'   //만료기한 30분 설정
                    },{
                        algorithm: 'HS256'  //HMAC using SHA-256 hash algorithm
                    });

                console.log('token : ' + token);

                res.set({
                    'Content-Type': 'application/json',
                    'ETag': token
                });
                res.status(200).json({
                    result: true,
                    reason: '토큰 발급 성공'
                });
                var decoded = jwt.decode(token, secret);
                console.log('decoded : ' + JSON.stringify(decoded));
                connection.query(update_sql, [token, email], function (err, data) {
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

/*
router.use(function (req, res, next) {
    console.log('사용자가 app에 입장');
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, superSecret, function (err, decoded) {
            if(err) {
                throw err;
                return res.status(403).send({ result: false, reason: '토큰 인증 실패' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        return res.status(403).send({ result: false, reason: '토큰을 받지 못함' });
    }
});*/

router.get('/duplication/', function(req, res, next) {
    var sql = 'SELECT * FROM user WHERE email=?';
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
    var insert_sql = 'INSERT INTO member(email, pw, university, nickname, grade, type1, type2, type3, type4, type5) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
        req.body.type5
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
                        type5: cursor[0].type5
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
module.exports = router;
