/* Routes for retrieving invoice information */
const e = require('express')
const express = require('express')
const router = new express.Router()
const db = require("../db")
const ExpressError = require("../expressError")

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM invoices;`)
        return res.json({ invoices: results.rows })
    }

    catch(e) {
        return next(e)
    }
})

router.post("/", async (req, res, next) => {
    try {
        if (!req.body.comp_code || !req.body.amt) {
            throw new ExpressError("Please pass in a json body with the keys comp_code and amt. Comp_code should be a string and amt should be a number.", 400)
        }
        else {  
            const { comp_code, amt } = req.body
            console.log(comp_code, amt)
            const results = await db.query(
                `INSERT INTO invoices (comp_code, amt)
                VALUES ($1, $2)
                RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])
        
            if (results.rows.length === 0) {
                throw new ExpressError("Could not create new invoice.")
            }
            else {
                return res.status(201).json(results.rows)
            }
        }
    }
    
    catch(e) {
        return next(e)
    }
})

router.get("/:id", async (req, res, next) => {
    try {
        const testQuery = await db.query(
        `SELECT id, comp_code, amt
        FROM invoices WHERE id = $1`, [req.params.id])

        if (testQuery.rows.length === 0) {
            const err = new ExpressError(`Invoice with id of ${req.params.id} not found.`, 404)
            return next(err)
        } 
        
        else {
            const results = await db.query(
            `SELECT * FROM invoices
            WHERE id = $1`, [req.params.id])
            return res.json({ invoice: results.rows[0] })
        }
    }

    catch(e) {
        return next(e)
    }
})

router.put("/:id", async (req, res, next) => {
    try {
        const testQuery = await db.query(
            `SELECT id, amt
            FROM invoices WHERE id = $1`, [req.params.id]
        )
        if (testQuery.rows.length > 0) {
            const { id } = req.params
            const { amt } = req.body
            const results = await db.query(
                `UPDATE invoices
                SET amt = $1
                WHERE id = $2
                RETURNING id, comp_code, amt, paid, add_date, paid_date;`, [amt, id]
            )
            return res.json(results.rows[0])
        }
        
        else {
            return next(
                new ExpressError(
                    `Invoice with id of ${id} not found.`, 404
                )
            )
        }
    }

    catch(e) {
        return next(e)
    }
})

router.delete("/:id", async (req, res, next) => {
    try {
        const testQuery = await db.query(
            `SELECT id, amt
            FROM invoices
            WHERE id = $1`, [req.params.id]
        )
        if (testQuery.rows.length > 0) {
            const { id } = req.params
            const results = await db.query(
                `DELETE FROM invoices
                WHERE id = $1
                RETURNING id, comp_code, amt, paid, add_date, paid_date;`, [id]
            )
            return res.json({deleted: results.rows[0]})
        }

        else {
            return next(
                new ExpressError(
                    `Invoice with id of ${id} not found.`, 404
                )
            )
        }
    }

    catch(e) {
        return next(e)
    }
})

module.exports = router