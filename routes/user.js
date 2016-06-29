/**
 * Created by choi on 2016-06-29.
 */
var router = express.Router();
var Schema = require('ee-mysql-schema');
var schema = new Schema({
    email: { type: String, required: true, index: { unique: true } },
    pw: { type: String, required: true, select: false }
});

module.exports = router;