var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    host: 'soon.japanwest.cloudapp.azure.com',
    user: 'alzzauser',
    password: 'alzza',
    database: 'alzza'
});

var select_sql = 'SELECT * FROM member WHERE id=?';
/* GET users listing. */
router.get('/:content_id', function (req, res, next) {
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

router.post('/', function (req, res, next) {
    var insert_sql = 'INSERT INTO member(email, pw, university, nickname, grade, type1, type2, type3, type4, type5) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    var params = [req.body.email, req.body.pw, req.body.university, req.body.nickname, req.body.grade, req.body.type1, req.body.type2, req.body.type3, req.body.type4, req.body.type5];
    connection.query(insert_sql, params, function (err, info) {
        if(err == null) {
            connection.query(select_sql, [info.insertId], function (error, cursor) {
                if(cursor.length > 0) {
                    res.json({
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
