const express = require('express');
const router = express.Router();
const pg = require("pg");

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
            client.query("select * from nacin_placanja",function (err,result) {
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


router.get('/', database.getAllTypesOfPayment,function(req, res, next) {
    res.render('crud_for_payment',{payment_types: req.tip_placanja});
});



module.exports = router;