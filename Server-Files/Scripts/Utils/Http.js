// All http codes used
const FORBIDEN = 403;
const NOT_FOUND = 404;
const OK = 200;
const CREATED = 201;
const INTERNAL_ERROR = 500;
const BAD_REQUEST = 400;
const NO_CONTENT = 204;

function endResponse(response, code, value = "") {
    response.statusCode = code;
    response.end(value);
}

module.exports.endResponse = endResponse;

module.exports.FORBIDEN = FORBIDEN;
module.exports.NOT_FOUND = NOT_FOUND;
module.exports.OK = OK;
module.exports.CREATED = CREATED;
module.exports.INTERNAL_ERROR = INTERNAL_ERROR;
module.exports.BAD_REQUEST = BAD_REQUEST;
module.exports.NO_CONTENT = NO_CONTENT;