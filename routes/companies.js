/* Routes for retrieving company information */
const express = require('express')
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")


// return a json response of all companies in the database
router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies;`)
        return res.json({ companies: results.rows })
    }

    catch(e) {
        return next(e)
    }
})

// Given some json, if valid, create a new company and commit to db.
router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body
        if (
            !req.body.name ||
            !req.body.code ||
            !req.body.description
        ) {
            const err = new ExpressError("Body is missing either 'code', 'name' or 'description' in its body.", 400)
            return next(err)
        }

        else {
            const results = await db.query(
                `INSERT INTO companies 
                (code, name, description)
                VALUES ($1, $2, $3)
                RETURNING code, name, description;`,
                [code, name, description])
            return res.status(201).json(results.rows)
        }
    }

    catch(e) {
        return next(e)
    }
})

// Given a company code, get back information about a single company.
// if code does not exist, user recieves a not found status and an error in the form of a json response. 
router.get("/:code", async (req, res, next) => {
    try {
        const {code} = req.params
        const results = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code])

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

router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params
        const { name, description } = req.body
        const results = await db.query(
        `UPDATE companies
        SET name=$1, description=$2
        WHERE code=$3
        RETURNING code, name, description;`,
        [name, description, code])
        console.log(results)
        if (results.rowCount === 0) {
            const err = new ExpressError("Company not found for given code.", 404)
            return next(err)
        } else {
            return res.json(results.rows[0])
        }
    }

    catch(e) {
        return next(e)
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params
        const results = await db.query(
            `DELETE FROM companies
            WHERE code = $1`, [code]
        )
        return res.json({message: "Your query was successful."})
    }

    catch(e) {
        return next(e)
    }
})


module.exports = router