const express = require('express');
const router = express.Router();
const pg = require("pg");
const alert = require("alert");

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
    getAllChainStore:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from lanac_trgovina order by id_lanca_trgovina",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.lanci_trgovina= result.rows;
                    next();
                }
            });
        });
    },

    getAllNumberOfShops:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(*)
                          from trgovina t, lanac_trgovina lt
                          where t.id_lanca_trgovina = lt.id_lanca_trgovina
                          group by lt.id_lanca_trgovina
                          order by lt.id_lanca_trgovina`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.broj_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllSalesAdministrators:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from korisnik k, lanac_trgovina lt
                          where k.id_korisnika = lt.id_menadzera
                          order by k.id_korisnika`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.trgovci = result.rows;
                    next();
                }
            });
        });
    }
}


router.get('/', database.getAllChainStore,
                     database.getAllNumberOfShops,
                     database.getAllSalesAdministrators,
    function(req, res, next) {
    res.render('crud_for_chain_store',{store: req.lanci_trgovina, sales: req.trgovci, number_of_shops: req.broj_trgovina});
});


router.get('/delete_chain_store',
    function(req, res, next) {
        res.redirect('/home/chain_store');
    });


router.post('/delete_chain_store/:id', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from lanac_trgovina 
                          where id_lanca_trgovina = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted chain store!');
                    res.redirect('/home/chain_store');
                }
            });
        }
    });
});


router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/chain_store');
    });

router.post('/delete_all', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from nacin_placanja`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all chain stores!');
                    res.redirect('/home/chain_store');
                }
            });
        }
    });
});


module.exports = router;