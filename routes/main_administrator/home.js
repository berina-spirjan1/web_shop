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
    },
    getNumberOfOrdersForSingleDay: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select max(y.count) as najvise_po_danu, y.naziv_lanca_trgovina, y.datum_narudzbe
                          from (select lc.naziv_lanca_trgovina, count(t.id_lanca_trgovina), n.datum_narudzbe
                                from trgovina t, artikal_trgovina at, artikal_narudzba an, narudzba n, korpa k, lanac_trgovina lc
                                where t.id_trgovine = at.id_trgovine
                                and at.id = an.id_artikal_trgovina
                                and lc.id_lanca_trgovina = t.id_lanca_trgovina
                                and an.id_narudzbe = n.id_narudzbe
                                and k.id_korpe = an.id_korpe
                                group by lc.naziv_lanca_trgovina, n.datum_narudzbe
                                order by n.datum_narudzbe) y
                          group by y.naziv_lanca_trgovina, y.datum_narudzbe
                          order by y.datum_narudzbe`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_proracuna_po_danima = result.rows;
                    next();
                }
            });
        });
    },
    getMostPopularCategoryOfArticleForSingleDays: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select max(y.count) as najpopularniji_po_danu, y.naziv_kategorije, y.datum_narudzbe
                          from (select ka.naziv_kategorije, count(aka.id_kategorija_artikla), n.datum_narudzbe
                                from kategorija_artikla ka, artikal_kategorija_artikla aka, narudzba n, artikal_narudzba an,
                                artikal a, korpa k, artikal_trgovina atv
                                where ka.id_kategorija_artikla = aka.id_kategorija_artikla
                                and an.id_narudzbe = n.id_narudzbe
                                and k.id_korpe = an.id_korpe
                                and at.id_artikla = a.id_artikla
                                and at.id = an.id_artikal_trgovina
                                and aka.id_artikla = a.id_artikla
                                group by ka.naziv_kategorije, n.datum_narudzbe
                                order by n.datum_narudzbe) y
                        group by y.naziv_kategorije, y.datum_narudzbe
                        order by y.datum_narudzbe`,
                function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_najpopularnijih_kategorija = result.rows;
                    next();
                }
            });
        });
    },
    getNumberOfOrdersByDay: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select  datum_narudzbe, count(id_narudzbe)
                          from narudzba
                          group by datum_narudzbe
                          order by datum_narudzbe`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_narudzbi_po_danu = result.rows;
                    next();
                }
            });
        });
    },
    getTotalProfitForSingleDay: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select  n.datum_narudzbe, sum(a.cijena_artikla * at.kolicina) as zarada
                          from artikal a, artikal_narudzba an, artikal_trgovina at, narudzba n
                          where a.id_artikla = at.id_artikla
                          and an.id_artikal_trgovina = at.id
                          and n.id_narudzbe = an.id_narudzbe
                          group by n.datum_narudzbe
                          order by n.datum_narudzbe`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.profit_po_danu = result.rows;
                    next();
                }
            });
        });
    }
}


router.get('/', function(req, res, next) {

    if(req.user.id_tip_korisnika === 1 && req.user.status !== 'blokiran' && req.user.id_adresa!==null) {
        res.redirect('/home/main_administrator');
    }
    else if(req.user.id_tip_korisnika === 3 && req.user.status !== 'blokiran' && req.user.id_adresa!==null) {
        res.redirect('/home/sales_administrator/approving_orders');
    }
    else if (req.user.id_tip_korisnika === 2 && req.user.status !== 'blokiran' && req.user.id_adresa!==null){
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
    res.render('./main_administrator/main_administrator_dashboard',
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
                listOfAdministrators: req.niz_svih_administratora,
                name_surname: [req.user.ime, req.user.prezime]
        });
});

router.get('/user',function(req, res, next) {
    res.render('./main_administrator/main_administrator_profile',{
        data: req.user
    });
});

router.get('/statistics',database.getNumberOfOrdersForSingleDay,
                              database.getMostPopularCategoryOfArticleForSingleDays,
                              database.getNumberOfOrdersByDay,
                              database.getTotalProfitForSingleDay,
    function(req, res, next) {
    res.render('./main_administrator/statistics',{
        singleDayOrders: req.niz_proracuna_po_danima,
        popularItemCategories: req.niz_najpopularnijih_kategorija,
        number_of_orders: req.niz_narudzbi_po_danu,
        profit: req.profit_po_danu
    });
});


module.exports = router;