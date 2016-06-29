/**
 * Created by choi on 2016-06-29.
 */
var express = require('express');
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var User = require('./user');
//var token = jwt.sign({ foo: 'bar' }, 'my_keyyy');
//var older_token = jwt.sign({ foo: 'bar', iat: Math.floor(Date.now()/1000)-30}, 'my_keyyy');
var router = express.Router();

var superSecret = 'mykey';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

router.post('/in', function (req, res, next) {
    User.findOne({ email:req.body.email, pw:req.body.pw }).select(email, pw).exec(function (err, user) {
        if(!user) {
            res.status(404).json({ result: false, reason: 'email not found' });
        }
        else if(user) {
            if(!user.pw) {
                res.status(404).json({ result: false, reason: 'pw not found' });
            }
            else {
                if(user.pw == req.body.pw) {
                    var token = jwt.sign({
                        email: user.email,
                        pw: user.pw
                    }, superSecret, {
                        expiresInMinutes: 60*24*7   //60분*24시간*7일
                    });
                    res.status(200).json({ result: true, reason: 'success', token: token });
                }
            }
        }
    });
});

router.use(function (req, res, next) {
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    if(token) {
        jwt.verify(token, superSecret, function (err, decoded) {
            if(err) {
                return res.status(403).send({ result: false, reason: 'token autherize fail' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
    else {
        return res.status(403).send({ result: false, reason: 'token not found' });
    }
});

router.get('/check/:content_email', function(req, res, next) {
    var sql = 'SELECT * FROM member WHERE email=?';
    var params = [req.params.content_email];
    connection.query(sql, params, function (error, cursor) {
        if(cursor.length > 0) {
            res.status(200).json({ result: true });
        }
        else {
            res.json({ result: false });
        }
    })
});

router.post('/', function (req, res, next) {
    var insert_sql = 'INSERT INTO member(email, pw, university, nickname, grade, type1, type2, type3, type4, type5) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [req.body.email, req.body.pw, req.body.university, req.body.nickname, req.body.grade, req.body.type1, req.body.type2, req.body.type3, req.body.type4, req.body.type5];
    connection.query(insert_sql, params, function (err, info) {
        if(err == null) {
            connection.query(select_sql, [info.insertId], function (error, cursor) {
                if(cursor.length > 0) {
                    res.status(200).json({
                        result: true, email: cursor[0].email, pw: cursor[0].pw, university: cursor[0].university, nickname: cursor[0].nickname, grade: cursor[0].grade, type1: cursor[0].type1, type2: cursor[0].type2, type3: cursor[0].type3, type4: cursor[0].type4, type5: cursor[0].type5
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
