exports.port = process.env.PORT || 4000
exports.origin = process.env.ORIGIN || `http://localhost:${exports.port}`
exports.username = process.env.POSTGRES_USERNAME;
exports.password = process.env.POSTGRES_PASSWORD;
exports.database =  process.env.POSTGRES_DB;
exports.host = process.env.POSTGRES_HOST;
exports.pgPort = process.env.POSTGRES_PORT;