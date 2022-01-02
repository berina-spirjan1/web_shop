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
    getAllOrders: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.id_korpe, sum(at.kolicina*a.cijena_artikla) as racun,
                          n.datum_narudzbe, n.vrijeme_narudzbe, t.naziv_trgovine, a.naziv_artikla, ko.ime, ko. prezime
                          from korpa k, artikal_trgovina at, artikal a, narudzba n, artikal_narudzba an, trgovina t, korisnik ko
                          where at.id_trgovine = t.id_trgovine
                          and k.id_korpe = an.id_korpe
                          and an.id_artikal_trgovina = at.id
                          and ko.id_korisnika = k.id_kupca
                          and n.id_narudzbe = an.id_narudzbe
                          and a.id_artikla = at.id_artikla
                          group by a.naziv_artikla, n.datum_narudzbe, n.vrijeme_narudzbe, t.naziv_trgovine, k.id_korpe, ko.ime, ko.prezime
                          order by k.id_korpe`,
                function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_narudzbi = result.rows;
                    next();
                }
            });
        });
    },
    getInfoAboutCustomerForOrder: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.ime, k.prezime 
                          from korisnik k, narudzba n
                          where k.id_korisnika = n.id_kupca
                          order by k.id_korisnika`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.informacije_o_kupcu = result.rows;
                    next();
                }
            });
        });
    },
    getAllTypesOfPayment: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select distinct id_nacin_placanja,vrsta_placanja from nacin_placanja order by vrsta_placanja",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_nacin_placanja = result.rows;
                    next();
                }
            });
        });
    },
    getAllCustomers: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from korisnik where id_tip_korisnika=2 order by ime, prezime",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_kupaca = result.rows;
                    next();
                }
            });
        });
    }
}

router.get('/', database.getAllOrders,
    function(req, res, next) {
        res.render('./main_administrator/crud_for_orders',{
            orders: req.niz_svih_narudzbi
        });
    });

router.get('/add_order', database.getAllTypesOfPayment,
                              database.getAllCustomers,
                              function(req, res, next) {
    res.render('./main_administrator/add_new_order',{
        payment: req.niz_nacin_placanja,
        customers: req.niz_svih_kupaca
    });
});

module.exports = router;