/** Database setup for BizTime. */

const { Client } = require('pg')

let dbUri

if (process.env.NODE_ENV === "test") {
    dbUri = "postgresql:///biztimetest"
} else {
    dbUri = "postgresql:///biztime"
}

let db = new Client({
    connectionString: dbUri
})

db.connect()

module.exports = db