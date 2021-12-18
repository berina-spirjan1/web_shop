const express = require('express');
const pg = require("pg");
const router = express.Router();

const config = {
    user: 'vhaxxure',
    database: 'vhaxxure',
    password: 'PRTQj-BsWP_lwQCZdqJH94vbpZHUkuAx',
    host: 'tai.db.elephantsql.com',
    port: 5432,
    max: 100,
    idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);

router.get('/',
    function(req, res, next) {
        res.render('crud_for_orders',{
            orders: req.niz_svih_narudzbi,
            info: req.informacije_o_kupcu
        });
});

module.exports = router;