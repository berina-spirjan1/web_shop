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
    getAllCategoriesForShops:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from kategorija order by id_kategorije",function (err,result) {
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
    getAllNumberOfShops:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(*)
                          from trgovina t, kategorija k
                          where k.id_kategorije = t.id_kategorije
                          group by k.id_kategorije
                          order by k.id_kategorije`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.broj_prodavnica = result.rows;
                    next();
                }
            });
        });
    },
}


router.get('/', database.getAllCategoriesForShops,
                     database.getAllNumberOfShops,
    function(req, res, next) {
        res.render('crud_for_shop_category',{categories: req.niz_kategorija, number_of_shops: req.broj_prodavnica});
    });


router.get('/delete_shop_category',
    function(req, res, next) {
        res.redirect('/home/shop_category');
    });


router.post('/delete_shop_category/:id', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from kategorija 
                          where id_kategorije = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted shop category!');
                    res.redirect('/home/shop_category');
                }
            });
        }
    });
});


router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/shop_category');
    });

router.post('/delete_all', function(req, res, next) {
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


router.get('/add_new_shop_category',
    function(req, res, next) {
        res.render('add_new_shop_category');
    });

router.post('/add_new_shop_category',function(req, res, next) {
    console.info("------------------",req.body);

    let category_name = req.body.category_name;
    let category_logo = req.body.category_logo;
    let category_color = req.body.category_color;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO kategorija(naziv_kategorije, logo_kategorije, boja_kategorije)
                          VALUES ($1,$2,$3)`,[category_name, category_logo, category_color], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/shop_category')
                }
            });
        }
    });
});


module.exports = router;