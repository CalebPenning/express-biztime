/* Routes for retrieving company information */

const express = require('express')
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies;`)
        return res.json({ companies: results.rows })
    }

    catch(e) {
        return next(e)
    }
})

// Given a company code, get back information about a single company.
// if code does not exist, user recieves a not found status in the form of a json response. 
router.get("/:code", async (req, res, next) => {
    try {
        const {code} = req.params
        const results = await db.query(`SELECT * FROM companies WHERE code = $1`, [code])
        console.log(results)
        if (results.rowCount === 0) {
            const err = new ExpressError("Company not found for given code.", 404)
            return next(err)
        } else {
            return res.json({company: results.rows[0]})
        }
    }

    catch(e) {
        return next(e)
    }
})

module.exports = router