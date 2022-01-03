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

let database = {
    getAllCatalogsForYourShops: function(req, res, next){
        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.naziv_kataloga, k.boja_kataloga, k.logo_kataloga, k.datum_pocetka_trajanja, 
                          k.datum_kraja_trajanja, t.naziv_trgovine, array_agg(a.naziv_artikla) as artikli_u_katalogu, k.id_kataloga
                          from katalog k, trgovina t, katalog_artikala_trgovina kat, katalog_artikli ka, artikal a
                          where ka.id_artikla =  a.id_artikla
                          and kat.id_katalog_artikli = ka.id_katalog_artikli
                          and t.id_trgovine = kat.id_trgovine
                          and t.id_menadzera = $1
                          and k.id_kataloga = ka.id_kataloga
                          group by k.id_kataloga,k.naziv_kataloga, k.boja_kataloga, k.logo_kataloga, k.datum_pocetka_trajanja, k.datum_kraja_trajanja, t.naziv_trgovine
                          order by k.id_kataloga,k.naziv_kataloga`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.katalog = result.rows;
                    next();
                }
            });
        });
    }
}


router.get('/', database.getAllCatalogsForYourShops,function(req, res, next) {
    res.render('./sales_administrator/crud_for_catalog',{catalogs: req.katalog});
});

router.get('/delete_catalog',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/catalog');
    });


router.post('/delete_catalog/:id', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from katalog
                          where id_kataloga = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted catalog!');
                    res.redirect('/home/sales_administrator/catalog');
                }
            });
        }
    });
});




router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/catalog');
    });

router.post('/delete_all', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from katalog k`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all catalogs from database!');
                    res.redirect('/home/sales_administrator/catalog');
                }
            });
        }
    });
});

module.exports = router;