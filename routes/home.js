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
    getTotalNumberOfUsers: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_korisnika from korisnik",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_korisnika = result.rows[0].ukupan_broj_korisnika;
                    next();
                }
            });
        });
    },
    getTotalNumberOfSalesAdministrators: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_administratora_prodaje from korisnik where id_tip_korisnika = 3",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_administratora_prodaje = result.rows[0].ukupan_broj_administratora_prodaje;
                    next();
                }
            });
        });
    },
    getTotalNumberOfCustomers: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_kupaca from korisnik where id_tip_korisnika = 2",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_kupaca = result.rows[0].ukupan_broj_kupaca;
                    next();
                }
            });
        });
    },
    getTotalNumberOfShops: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_trgovina from trgovina",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_trgovina = result.rows[0].ukupan_broj_trgovina;
                    next();
                }
            });
        });
    },
    getTotalNumberOfOrders: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_narudzbi from narudzba",function (err,result) {
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
    getTotalNumberOfItems: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_artikala from artikal",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_artikala = result.rows[0].ukupan_broj_artikala;
                    next();
                }
            });
        });
    },
    getTotalNumberOfActiveUsers: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_aktivnih_korisnika from korisnik where status='aktivan'",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_aktivnih_korisnika = result.rows[0].ukupan_broj_aktivnih_korisnika;
                    next();
                }
            });
        });
    },
    getTotalNumberOfDeactivedUsers: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_deaktivnih_korisnika from korisnik where status='deaktiviran'",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_deaktivnih_korisnika = result.rows[0].ukupan_broj_deaktivnih_korisnika;
                    next();
                }
            });
        });
    },
    getTotalNumberOfBlockedUsers: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select count(*) as ukupan_broj_blokiranih_korisnika from korisnik where status='blokiran'",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ukupan_broj_blokiranih_korisnika = result.rows[0].ukupan_broj_blokiranih_korisnika;
                    next();
                }
            });
        });
    },
    getFiveNewCustomers: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from korisnik where id_tip_korisnika=2 order by id_korisnika desc limit 5",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_kupaca = result.rows;
                    next();
                }
            });
        });
    },
    getFiveNewSalesAdministrators: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from korisnik where id_tip_korisnika=3 order by id_korisnika desc limit 5",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_administratora = result.rows;
                    next();
                }
            });
        });
    }
}


router.get('/', function(req, res, next) {

    if(req.user.id_tip_korisnika === 1) {
        res.redirect('/home/main_administrator');
    }
    else if(req.user.id_tip_korisnika === 3) {
        res.redirect('/home/sales_administrator');
    }
    else {
        res.redirect('/home/customer');
    }
});

router.get('/main_administrator', database.getTotalNumberOfSalesAdministrators,
                                  database.getTotalNumberOfCustomers,
                                  database.getTotalNumberOfItems,
                                  database.getTotalNumberOfOrders,
                                  database.getTotalNumberOfShops,
                                  database.getTotalNumberOfUsers,
                                  database.getTotalNumberOfActiveUsers,
                                  database.getTotalNumberOfDeactivedUsers,
                                  database.getTotalNumberOfBlockedUsers,
                                  database.getFiveNewCustomers,
                                  database.getFiveNewSalesAdministrators,
                                  function(req, res, next) {
    res.render('main_administrator_dashboard',
        {sales: req.ukupan_broj_administratora_prodaje,
                customers: req.ukupan_broj_kupaca,
                items: req.ukupan_broj_artikala,
                orders: req.ukupan_broj_narudzbi,
                shops: req.ukupan_broj_trgovina,
                users: req.ukupan_broj_korisnika,
                active: req.ukupan_broj_aktivnih_korisnika,
                deactivated: req.ukupan_broj_deaktivnih_korisnika,
                blocked: req.ukupan_broj_blokiranih_korisnika,
                listOfCustomers: req.niz_svih_kupaca,
                listOfAdministrators: req.niz_svih_administratora});
});

router.get('/user',function(req, res, next) {
    res.render('main_administrator_profile',{
        data: req.user
    });
});

router.get('/sales_administrator', function(req, res, next) {
    res.render('index',{title:'GOTOVOOO2'});
});

router.get('/customer', function(req, res, next) {
    res.render('index',{title:'GOTOVOOO3'});
});

router.get('/statistics', function(req, res, next) {
    res.render('index',{title:'GOTOVOOO4'});
});


module.exports = router;