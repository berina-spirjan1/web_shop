const express = require('express');
const router = express.Router();
const pg = require("pg");
const alert = require("alert");

const config = {
    user: 'postgres',
    database: 'postgres',
    password: 'berina123',
    host: 'localhost',
    port: 5433,
    max: 100,
    idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);
const { ensureAuthenticatedMainAdministrator} = require('../../authentication/mainAdministrator');

let database={
    getAllCategoriesForItems:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from kategorija_artikla order by id_kategorija_artikla",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_kategorija = result.rows;
                    next();
                }
            });
        });
    },
    getAllNumberOfItems:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(*), ka.id_kategorija_artikla
                          from artikal a, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where aka.id_kategorija_artikla = ka.id_kategorija_artikla
                          and aka.id_artikla = a.id_artikla
                          group by ka.id_kategorija_artikla
                          order by ka.id_kategorija_artikla`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("----------",result.rows);
                    req.broj_prodavnica = result.rows;
                    next();
                }
            });
        });
    },
}


router.get('/',ensureAuthenticatedMainAdministrator, database.getAllCategoriesForItems,
                     database.getAllNumberOfItems,
    function(req, res, next) {
        res.render('./main_administrator/crud_for_item_category',{categories: req.niz_kategorija, number_of_shops: req.broj_prodavnica});
    });


router.get('/delete_item_category',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/item_category');
    });


router.post('/delete_item_category/:id',ensureAuthenticatedMainAdministrator, function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from kategorija_artikla 
                          where id_kategorija_artikla = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted item category!');
                    res.redirect('/home/item_category');
                }
            });
        }
    });
});


router.get('/delete_all',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/shop_category');
    });

router.post('/delete_all', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from kategorija`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all shop categories!');
                    res.redirect('/home/shop_category');
                }
            });
        }
    });
});


router.get('/add_new_item',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.render('./main_administrator/add_new_item_category');
});

router.post('/add_new_item',ensureAuthenticatedMainAdministrator,function(req, res, next) {

    let category_name = req.body.category_name;
    let category_logo = req.body.category_logo;
    let category_color = req.body.category_color;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO kategorija_artikla(naziv_kategorije, logo_kategorije, boja_kategorije)
                          VALUES ($1,$2,$3)`,[category_name, category_logo, category_color], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/item_category')
                }
            });
        }
    });
});

module.exports = router;