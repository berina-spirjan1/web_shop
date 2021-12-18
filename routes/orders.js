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
            client.query("select * from narudzba order by datum_narudzbe",function (err,result) {
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
    database.getInfoAboutCustomerForOrder,
    function(req, res, next) {
        res.render('crud_for_orders',{
            orders: req.niz_svih_narudzbi,
            info: req.informacije_o_kupcu
        });
    });

router.get('/add_order', database.getAllTypesOfPayment,
                              database.getAllCustomers,
                              function(req, res, next) {
    res.render('add_new_order',{
        payment: req.niz_nacin_placanja,
        customers: req.niz_svih_kupaca
    });
});

module.exports = router;