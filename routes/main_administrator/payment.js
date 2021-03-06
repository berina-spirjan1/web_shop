const express = require('express');
const router = express.Router();
const pg = require("pg");
const alert = require("alert");
const { ensureAuthenticatedMainAdministrator} = require('../../authentication/mainAdministrator');
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


let database={
    getAllTypesOfPayment:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from nacin_placanja order by id_nacin_placanja",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.tip_placanja = result.rows;
                    next();
                }
            });
        });
    }
}


router.get('/',ensureAuthenticatedMainAdministrator, database.getAllTypesOfPayment,
                     function(req, res, next) {
    res.render('./main_administrator/crud_for_payment',{payment_types: req.tip_placanja});
});


router.get('/delete_payment',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/payment');
});


router.post('/delete_payment/:id',ensureAuthenticatedMainAdministrator, function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from nacin_placanja 
                          where id_nacin_placanja = $1`, [req.params.id], function (err, result) {
                console.info("------------",result);
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted type of payment!');
                    res.redirect('/home/payment');
                }
            });
        }
    });
});


router.get('/delete_all',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/payment');
});

router.post('/delete_all', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from nacin_placanja`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all types of payment!');
                    res.redirect('/home/payment');
                }
            });
        }
    });
});

router.get('/add_payment',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.render('./main_administrator/add_payment');
    });

router.post('/add_payment',ensureAuthenticatedMainAdministrator,function(req, res, next) {

    let payment = req.body.payment;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO nacin_placanja(vrsta_placanja)
                          VALUES ($1)`,[payment], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/payment')
                }
            });
        }
    });
});



module.exports = router;