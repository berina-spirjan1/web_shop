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


router.get('/', database.getAllTypesOfPayment,
                     function(req, res, next) {
    res.render('crud_for_payment',{payment_types: req.tip_placanja});
});


router.get('/delete_payment',
    function(req, res, next) {
        res.redirect('/home/payment');
});


router.post('/delete_payment/:id', function(req, res, next) {
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


router.get('/delete_all',
    function(req, res, next) {
        res.redirect('/home/payment');
});

router.post('/delete_all', function(req, res, next) {
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


module.exports = router;