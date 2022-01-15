const express = require('express');
const router = express.Router();

const pg = require("pg");
const alert = require("alert");
const nodemailer = require("nodemailer");

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
            client.query(`select n.id_narudzbe as id_korpe, sum(at.kolicina*a.cijena_artikla) as pojedinacni_racun, ko.ime, ko.prezime, ko.email,
                          array_agg(a.naziv_artikla) as artikli, array_agg(t.naziv_trgovine) as prodavnice, n.status, array_agg(n.vrijeme_narudzbe) as vrijeme_narudzbi, n.datum_narudzbe
                          from artikal a, artikal_trgovina at, korpa k, artikal_narudzba an, trgovina t, korisnik ko, narudzba n
                          where an.id_artikal_trgovina = at.id
                          and ko.id_korisnika = k.id_kupca
                          and t.id_trgovine = at.id_trgovine
                          and t.id_menadzera = $1
                          and n.id_narudzbe = an.id_narudzbe
                          and a.id_artikla = at.id_artikla
                          and k.id_korpe = an.id_korpe
                          group by k.id_korpe, ko.ime, ko.prezime,n.status, n.datum_narudzbe, n.id_narudzbe, ko.email
                          order by n.datum_narudzbe`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.sve_narudzbe = result.rows;
                    next();
                }
            });
        });
    },
    getListOfAcceptedOrders: function(req, res, next){

        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select n.id_narudzbe as id_korpe, sum(at.kolicina*a.cijena_artikla) as pojedinacni_racun, ko.ime, ko.prezime,
                          array_agg(a.naziv_artikla) as artikli, array_agg(t.naziv_trgovine) as prodavnice, array_agg(n.vrijeme_narudzbe) as vrijeme_narudzbi, n.datum_narudzbe
                          from artikal a, artikal_trgovina at, korpa k, artikal_narudzba an, trgovina t, korisnik ko, narudzba n
                          where an.id_artikal_trgovina = at.id
                          and ko.id_korisnika = k.id_kupca
                          and t.id_trgovine = at.id_trgovine
                          and t.id_menadzera = $1
                          and n.id_narudzbe = an.id_narudzbe
                          and k.status = 1
                          and a.id_artikla = at.id_artikla
                          and k.id_korpe = an.id_korpe
                          group by k.id_korpe, ko.ime, ko.prezime, n.datum_narudzbe, n.id_narudzbe
                          order by n.datum_narudzbe`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.prihvacene_narudzbe = result.rows;
                    next();
                }
            });
        });
    },
    SendEmailChangedStatus:function (req,res,next) {

        let email = req.params.email;

        console.info("ISPISUJEM MAIL",email);

        let mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'zendev2021@gmail.com', // Your email id
                pass: 'zendev123' // Your password
            }
        });

        const mailOptions = {
            from: 'zendev2021@gmail.com',
            to: email,
            subject: "We are having some news for you 😃",
            text: "We changed status for your delivery. Please login to your account to see informations."
        };

        mail.sendMail(mailOptions,function(error,info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Successfully sent email." + info.response);
            }});
    }
}



router.get('/', database.getListOfOrders,
    function(req, res, next) {
    res.render('./sales_administrator/crud_for_orders',{
        allOrders: req.sve_narudzbe
    });
});


router.get('/approve',database.SendEmailChangedStatus,
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
    });

router.post('/approve/:id/:email', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update narudzba
                          set status = 1
                          where id_narudzbe = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully accepted order!');
                    res.redirect('/home/sales_administrator/approving_orders');
                }
            });
        }
    });
});

router.get('/reject',database.SendEmailChangedStatus,
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
    });

router.post('/reject/:id/:email', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update narudzba
                          set status = -1
                          where id_narudzbe = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully rejected order!');
                    res.redirect('/home/sales_administrator/approving_orders');
                }
            });
        }
    });
});


router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
    });

router.post('/delete_all', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from narudzba n`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all orders from your shops!');
                    res.redirect('/home/sales_administrator/approving_orders');
                }
            });
        }
    });
});

router.get('/accepted_orders',database.getListOfAcceptedOrders,
    function(req, res, next) {
        res.render('./sales_administrator/crud_for_delivery',{
            allOrders: req.prihvacene_narudzbe
    });
});


router.get('/delivery', database.SendEmailChangedStatus,
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
});

router.post('/delivery/:id/:email', function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update narudzba
                          set status = 2
                          where id_narudzbe = $1`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully delivered order!');
                    res.redirect('/home/sales_administrator/approving_orders');
                }
            });
        }
    });
});

router.get('/deliver_all',
    function(req, res, next) {
        res.redirect('/home/sales_administrator/approving_orders');
});

router.post('/deliver_all', database.getListOfAcceptedOrders, function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            for(let i = 0; i<req.prihvacene_narudzbe.length;i++){
                client.query(`update narudzba
                              set status = 2
                              where id_korpe = $1`, [req.prihvacene_narudzbe[i].id_korpe], function (err, result) {
                    don();
                    if (err)
                        throw(err);
                    else{
                        alert('Successfully delivered all orders!');
                        res.redirect('/home/sales_administrator/approving_orders');
                    }
                });
            }

        }
    });
});


module.exports = router;