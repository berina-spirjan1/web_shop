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

    getListOfOrders: function(req, res, next){

        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select n.id_narudzbe, sum(at.kolicina*a.cijena_artikla) as cijena_narudzbe, n.datum_narudzbe, 
                          n.vrijeme_narudzbe, ko.ime, ko.prezime, n.status, t.naziv_trgovine, a.naziv_artikla, k.id_korpe
                          from artikal_trgovina at, artikal a, trgovina t, artikal_narudzba an, korpa k, narudzba n, korisnik ko
                          where t.id_menadzera = $1
                          and t.id_trgovine = at.id_trgovine
                          and at.id = an.id_artikal_trgovina
                          and k.id_korpe = an.id_korpe
                          and ko.id_korisnika = n.id_kupca
                          and n.id_narudzbe = an.id_narudzbe
                          and a.id_artikla = at.id_artikla
                          group by n.datum_narudzbe, n.id_narudzbe, n.vrijeme_narudzbe, ko.ime, ko.prezime, t.naziv_trgovine, a.naziv_artikla, n.status,  k.id_korpe
                          order by n.datum_narudzbe, n.vrijeme_narudzbe`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("-----------------",result.rows);
                    req.sve_narudzbe = result.rows;
                    next();
                }
            });
        });
    }
}



router.get('/', database.getListOfOrders,
    function(req, res, next) {
    res.render('./sales_administrator/crud_for_orders',{
        allOrders: req.sve_narudzbe
    });
});


router.get('/approve',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
    });

router.post('/approve/:id', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update narudzba
                          set status = 1
                          where id_korpe = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully accepted order!');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/reject',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
    });

router.post('/reject/:id', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update narudzba
                          set status = -1
                          where id_korpe = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully rejected order!');
                    res.redirect('/home/users');
                }
            });
        }
    });
});



module.exports = router;