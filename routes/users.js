var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

/* GET users listing. */
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


module.exports = router;
