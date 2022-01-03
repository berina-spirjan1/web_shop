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
            client.query(`select count(k.id_korpe) as ukupan_broj_narudzbi
                          from korpa k, trgovina t, artikal_trgovina at, artikal_narudzba an
                          where t.id_menadzera = $1
                          and k.id_korpe = an.id_korpe
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina`,[id_korisnika],function (err,result) {
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
    getAllChainStores: function (req,res,next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from lanac_trgovina 
                          where id_menadzera = $1`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.lista_lanaca_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllShopsFromDatabase: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from trgovina order by id_trgovine",function (err,result) {
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
    getAllBills: function(req,res,next){

        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select sum(a.cijena_artikla*at.kolicina) as ukupna_zarada
                          from artikal_trgovina at, artikal a, trgovina t, artikal_narudzba an
                          where t.id_menadzera = $1
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.cijena_svih_narudzbi = result.rows;
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

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct k.ime, k.prezime, k.id_korisnika
                          from korisnik k, trgovina t
                          where t.id_menadzera = $1
                          and t.id_menadzera = k.id_korisnika
                          order by k.ime,k.prezime`,[id_korisnika],function (err,result) {
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
    getNumberOfPendingOrders: function(req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(k.id_korpe) as narudzbe_na_cekanju
                          from korpa k, trgovina t, artikal_trgovina at, artikal_narudzba an
                          where t.id_menadzera = $1
                          and k.id_korpe = an.id_korpe
                          and k.status = 0
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.narudzbe_na_cekanju = result.rows[0].narudzbe_na_cekanju;
                    next();
                }
            });
        });
    },
    getNumberOfRejectedOrders: function(req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(k.id_korpe) as odbijene_narudzbe
                          from korpa k, trgovina t, artikal_trgovina at, artikal_narudzba an
                          where t.id_menadzera = $1
                          and k.id_korpe = an.id_korpe
                          and k.status = -1
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.odbijene_narudzbe = result.rows[0].odbijene_narudzbe;
                    next();
                }
            });
        });
    },
    getNumberOfApprovedOrders: function(req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(k.id_korpe) as odobrene_narudzbe
                          from korpa k, trgovina t, artikal_trgovina at, artikal_narudzba an
                          where t.id_menadzera = $1
                          and k.id_korpe = an.id_korpe
                          and k.status = 1
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.odobrene_narudzbe = result.rows[0].odobrene_narudzbe;
                    next();
                }
            });
        });
    },
    getSingleBill: function(req, res, next){

        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.id_korpe, sum(at.kolicina*a.cijena_artikla) as pojedinacni_racun, ko.ime, ko.prezime,
                          array_agg(a.naziv_artikla) as artikli, array_agg(t.naziv_trgovine) as prodavnice
                          from artikal a, artikal_trgovina at, korpa k, artikal_narudzba an, trgovina t, korisnik ko
                          where an.id_artikal_trgovina = at.id
                          and ko.id_korisnika = k.id_kupca
                          and t.id_trgovine = at.id_trgovine
                          and t.id_menadzera = $1
                          and a.id_artikla = at.id_artikla
                          and k.id_korpe = an.id_korpe
                          group by k.id_korpe, ko.ime, ko.prezime
                          order by k.id_korpe`, [id_trgovca] ,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("----------",result.rows);
                    req.racuni = result.rows;
                    next();
                }
            });
        });
    },
    getTotalProfit: function(req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select sum(at.kolicina*a.cijena_artikla) as ukupni_racun
                          from artikal a, artikal_trgovina at, artikal_narudzba an, trgovina t
                          where an.id_artikal_trgovina = at.id
                          and t.id_trgovine = at.id_trgovine
                          and t.id_menadzera = $1
                          and a.id_artikla = at.id_artikla`, [id_trgovca] ,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("UKUPNA ZARADA JE",result.rows);
                    req.ukupna_zarada = result.rows[0].ukupni_racun;
                    next();
                }
            });
        });
    }
}



router.get('/', database.getNumberOfShopsForCurrentSales,
                     database.getNumberOfChainStoresForCurrentSales,
                     database.getNumberOfOrdersForSales,
                     database.getAllShops,
                     database.getAllBills,
                     database.getNumberOfPendingOrders,
                     database.getNumberOfApprovedOrders,
                     database.getNumberOfRejectedOrders,
                     database.getAllChainStores,
    function(req, res, next) {
    res.render('./sales_administrator/sales_administrator_dashboard',{
        number_of_shops: req.ukupan_broj_prodavnica_vodjenih,
        number_of_chain_stores: req.ukupan_broj_lanaca_trgovina,
        number_of_orders: req.ukupan_broj_narudzbi,
        list_of_shops: req.lista_prodavnica,
        list_of_chain_stores: req.lista_lanaca_trgovina,
        name_surname: [req.user.ime, req.user.prezime],
        bill: req.cijena_svih_narudzbi,
        pending_orders: req.narudzbe_na_cekanju,
        approved_orders: req.odobrene_narudzbe,
        rejected_orders: req.odbijene_narudzbe
    });
});

router.get('/shops', database.getAllShopsFromDatabase,
    database.getAllSalesAdministratorsFromShops,
    database.getAllCategoriesFromShops,
    database.getAllChainStoresFromShop,
    // ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.render('./sales_administrator/crud_for_shops',{
            listOfShops: req.niz_svih_trgovina,
            sales: req.niz_svih_menadzera,
            categories: req.niz_svih_kategorija,
            chainStore: req.niz_svih_lanaca_trgovina
        });
});



router.get('/shops/add_shop', database.getAllDifferentCategories,
    database.getAllDifferentChainStores,
    database.getAllDifferentSalesAdministrators,
    function(req, res, next) {
        res.render('./sales_administrator/add_new_shop',{
            categories: req.niz_kategorija,
            stores: req.niz_lanca_trgovina,
            sales: req.niz_trgovaca
        });
});

router.post('/shops/add_shop',function(req, res, next) {
    let shop_name = req.body.shop_name;
    let category = req.body.category;
    let sales_administrator = req.body.sales_administrator;
    let chain_store = req.body.chain_store;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO trgovina(naziv_trgovine, id_kategorije, id_menadzera, id_lanca_trgovina)
                          VALUES ($1,$2,$3,$4)`,[shop_name, category, sales_administrator, chain_store], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/shops')
                }
            });
        }
    });
});

router.get('/shops/delete_shop',
    function(req, res, next) {
        res.redirect('/home/shops');
});


router.post('/shops/delete_shop/:id', function(req, res, next) {
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
                    res.redirect('/home/shops');
                }
            });
        }
    });
});

router.get('/shops/delete_all',
    function(req, res, next) {
        res.redirect('/home/shops');
    });

router.post('/shops/delete_all', function(req, res, next) {
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
                    res.redirect('/home/shops');
                }
            });
        }
    });
});

router.get('/bill',database.getSingleBill,
                        database.getTotalProfit,
    function (req,res,next){
   res.render('./sales_administrator/all_shops_bills',{
        bill: req.racuni,
        total: req.ukupna_zarada
   })
});

module.exports = router;