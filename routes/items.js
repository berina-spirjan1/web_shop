const express = require('express');
const pg = require("pg");
const alert = require("alert");
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
    getAllItems: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from trgovina t, artikal a, artikal_trgovina at, kategorija_artikla k
                          where at.id_trgovine = t.id_trgovine
                          and a.id_kategorija_artikla = k.id_kategorija_artikla
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
    getAllDifferentShops: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select distinct * from trgovina order by id_trgovine",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_trgovina = result.rows;
                    next();
                }
            });
        });
    },
}



router.get('/', database.getAllItems,
    function(req, res, next) {
        res.render('crud_for_items',{
            items: req.niz_svih_trgovina
        });
});

router.get('/add_item', database.getAllDifferentShops,
    function(req, res, next) {
        res.render('add_new_item',{shops: req.niz_trgovina});
});


router.post('/add_item',function(req, res, next) {
    let name = req.body.name;
    let description = req.body.description;
    let amount = req.body.amount;
    let content = req.body.content;
    let category = req.body.category;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO artikal(naziv_artikla, opis_artikla, dostupna_kolicina, sadrzaj_artikla, id_kategorija_artikla)
                          VALUES ($1,$2,$3,$4, $5)`,[name, description, amount, content, category], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/items')
                }
            });
        }
    });
});

router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/items');
    });

router.post('/delete_all', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from artikal`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all items from database!');
                    res.redirect('/home/items');
                }
            });
        }
    });
});


module.exports = router;