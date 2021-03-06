const express = require('express');
const pg = require("pg");
const router = express.Router();
let alert = require('alert');
const {ensureAuthenticatedSalesAdministrator} = require("../../authentication/salesAdministrator");

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


let database = {
    getAllShops: function(req,res,next){

        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from trgovina where id_menadzera =$1 order by id_trgovine ",[id_trgovca],function (err,result) {
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
    getAllSalesAdministratorsFromShops: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.ime, k.prezime 
                          from korisnik k, trgovina t
                          where t.id_menadzera = k.id_korisnika
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_menadzera = result.rows;
                    next();
                }
            });
        });
    },
    getAllCategoriesFromShops: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.naziv_kategorije
                          from kategorija k, trgovina t
                          where t.id_kategorije = k.id_kategorije
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_kategorija = result.rows;
                    next();
                }
            });
        });
    },
    getAllChainStoresFromShop: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select l.naziv_lanca_trgovina
                          from lanac_trgovina l, trgovina t
                          where l.id_lanca_trgovina = t.id_lanca_trgovina
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_lanaca_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllDifferentCategories: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`SELECT DISTINCT k.naziv_kategorije, k.id_kategorije
                          FROM kategorija k, trgovina t
                          WHERE t.id_kategorije = k.id_kategorije
                          order by k.naziv_kategorije`,function (err,result) {
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
    getAllDifferentChainStores: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct l.naziv_lanca_trgovina, l.id_lanca_trgovina
                          from lanac_trgovina l, trgovina t
                          where l.id_lanca_trgovina = t.id_lanca_trgovina
                          order by l.naziv_lanca_trgovina`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_lanca_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllDifferentSalesAdministrators: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct k.ime, k.prezime, k.id_korisnika
                          from korisnik k, trgovina t
                          where t.id_menadzera = $1
                          order by k.ime,k.prezime`,[req.user.id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_trgovaca = result.rows;
                    next();
                }
            });
        });
    },
}



router.get('/',ensureAuthenticatedSalesAdministrator, database.getAllShops,
                database.getAllSalesAdministratorsFromShops,
                database.getAllCategoriesFromShops,
                database.getAllChainStoresFromShop,
                function(req, res, next) {

    res.render('./sales_administrator/crud_for_shops',{
        listOfShops: req.niz_svih_trgovina,
        sales: req.niz_svih_menadzera,
        categories: req.niz_svih_kategorija,
        chainStore: req.niz_svih_lanaca_trgovina,
        sale: [req.user.ime, req.user.prezime]
    });
});

router.put('/update',ensureAuthenticatedSalesAdministrator, function(req, res, next) {
    let id = req.body.id;
    let shop_name = req.body.shop;
    let category = req.body.category;
    let sales_administrator = req.body.sales_administrator;
    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`update trgovina
                          set naziv_trgovine = $1,
                              id_kategorije = $2,
                              id_menadzera = $3
                              where id_trgovine = $4;`,[shop_name, category, sales_administrator, id],function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

router.get('/add_shop',ensureAuthenticatedSalesAdministrator, database.getAllDifferentCategories,
                             database.getAllDifferentChainStores,
                             database.getAllDifferentSalesAdministrators,
    function(req, res, next) {
    res.render('./sales_administrator/add_new_shop',{
        categories: req.niz_kategorija,
        stores: req.niz_lanca_trgovina,
        sales: [req.user.id_korisnika, req.user.ime, req.user.prezime]
    });
});

router.post('/add_shop',ensureAuthenticatedSalesAdministrator,function(req, res, next) {
    let shop_name = req.body.shop_name;
    let category = req.body.category;
    let sales_administrator = 3;
    let chain_store = req.body.chain_store;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`call DodajTrgovinu($1,$2,$3,$4)`,[shop_name, category, sales_administrator, chain_store], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/sales_administrator/shops/add_location/'+shop_name);
                }
            });
        }
    });
});

router.get('/delete_shop',ensureAuthenticatedSalesAdministrator,
    function(req, res, next) {
        res.redirect('/home/sales_administrator/shops');
    });


router.post('/delete_shop/:id', ensureAuthenticatedSalesAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from trgovina 
                          where id_trgovine = $1`, [req.params.id], function (err, result) {
                console.info("------------",result);
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted shop!');
                    res.redirect('/home/sales_administrator/shops');
                }
            });
        }
    });
});

router.get('/delete_all',ensureAuthenticatedSalesAdministrator,
    function(req, res, next) {
        res.redirect('/home/sales_administrator/shops');
    });

router.post('/delete_all',ensureAuthenticatedSalesAdministrator, function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from trgovina`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all shops from database!');
                    res.redirect('/home/sales_administrator/shops');
                }
            });
        }
    });
});

router.get('/add_shop_image',ensureAuthenticatedSalesAdministrator,
    function(req, res, next) {
        res.render('./main_administrator/add_new_shop_image');
    });


router.post('/add_shop_image',ensureAuthenticatedSalesAdministrator,function(req, res, next){
    let file = req.files.uploaded_image;
    let img_name=file.name;

    if(file.mimetype === "image/jpeg" ||file.mimetype === "image/png" || file.mimetype === "image/gif" ){

        file.mv('public/images/'+file.name, function(err) {
            if (err)
                return res.status(500).send(err);
            else{
                pool.connect(function (err,client,done) {
                    if(err)
                        throw(err);
                    else {
                        client.query("select * from DodajSlikuPozadine($1);",
                            [img_name], function (err, result) {
                            done();
                            if (err)
                                throw(err);
                            else {
                                req.slika_za_prodavnicu = result;
                                console.info("SLika je",result);
                                alert('Successfully added shop image!');
                                res.redirect('/home/sales_administrator/shops');
                            }
                        });
                    }
                });
            }
        });
    } else {
        req.flash('error', 'Format of image that you try to upload is not allowed.');
        res.redirect('/home/sales_administrator/shops');
    }
})


router.get('/add_location/:shop_name', ensureAuthenticatedSalesAdministrator,function (req, res, next){
    res.render('./sales_administrator/maps_for_shop',{name: req.params.shop_name});
})

router.post('/add_location/:shop_name',function(req, res, next){

    const adresa = JSON.parse(req.body.adresa2);

    pool.query(
        'insert into adresa(latituda, longituda, ulica, grad) values ($1,$2,$3,$4) returning id_adresa',
        [adresa.latitude,adresa.longitude, adresa.formattedAddress,adresa.addressComponents.city], (err, resp) => {
            if (err) {

                return res.render('error');
            }

            pool.query('update trgovina set id_adresa=$1 where naziv_trgovine = $2', [resp.rows[0].id_adresa, req.params.shop_name],
                (err, resp) => {
                    if (err) {
                        console.error(err);
                        return res.render('error');
                    }
                    else{
                        console.log("OVO SE SALJE",resp);
                    }
                    res.redirect('/home/sales_administrator/shops');
                }
            );
        }
    );
})

module.exports = router;