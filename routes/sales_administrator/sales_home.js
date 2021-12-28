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


let database = {
    getNumberOfShopsForCurrentSales: function (req,res,next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(t.id_menadzera) as ukupan_broj_prodavnica 
                          from trgovina t
                          where t.id_menadzera = $1`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("-------- ispisujem", result.rows[0]);
                    req.ukupan_broj_prodavnica_vodjenih = result.rows[0].ukupan_broj_prodavnica;
                    next();
                }
            });
        });
    },
    getNumberOfChainStoresForCurrentSales: function (req,res,next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(lt.id_menadzera) as ukupan_broj_lanaca_trgovina
                          from lanac_trgovina lt
                          where lt.id_menadzera = $1`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_lanaca_trgovina = result.rows[0].ukupan_broj_lanaca_trgovina;
                    next();
                }
            });
        });
    },
    getNumberOfOrdersForSales: function (req,res,next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(k.id_trgovine) as ukupan_broj_narudzbi
                          from korpa k, trgovina t
                          where k.id_trgovine = t.id_trgovine
                          and t.id_menadzera = $1`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_narudzbi = result.rows[0].ukupan_broj_narudzbi;
                    next();
                }
            });
        });
    },
    getAllShops: function (req,res,next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from trgovina t, lanac_trgovina lt
                          where t.id_menadzera = $1
                          and lt.id_lanca_trgovina = t.id_lanca_trgovina
                          order by t.id_trgovine`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.lista_prodavnica = result.rows;
                    next();
                }
            });
        });
    },
}



router.get('/', database.getNumberOfShopsForCurrentSales,
                     database.getNumberOfChainStoresForCurrentSales,
                     database.getNumberOfOrdersForSales,
                     database.getAllShops,
    function(req, res, next) {
    res.render('./sales_administrator/sales_administrator_dashboard',{
        number_of_shops: req.ukupan_broj_prodavnica_vodjenih,
        number_of_chain_stores: req.ukupan_broj_lanaca_trgovina,
        number_of_orders: req.ukupan_broj_narudzbi,
        list_of_shops: req.lista_prodavnica,
        name_surname: [req.user.ime, req.user.prezime]
    });
});



module.exports = router;