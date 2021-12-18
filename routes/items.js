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

let database={
    getAllShops: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from trgovina t, artikal a, artikal_trgovina at, kategorija k
                          where at.id_trgovine = t.id_trgovine
                          and a.id_kategorije = k.id_kategorije
                          order by a.naziv_artikla`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_trgovina = result.rows;
                    next();
                }
            });
        });
    },
}



router.get('/', database.getAllShops,
    function(req, res, next) {
        res.render('crud_for_items',{
            items: req.niz_svih_trgovina
        });
});

module.exports = router;