const express = require('express');
const passport = require('passport');
const pg = require("pg");
const router = express.Router();
const saltRounds = 10;
let alert = require('alert');

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
    getAllInformationAboutCurrentUser: function(req,res,next){
        let username = req.body.username;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from korisnik where username=$1",[username],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.podaci = result.rows;
                    res.cookie('korisnik',req.podaci);
                    console.info("JAVLJANJE IZ FUNKCIJE KOLACICA",req.podaci);
                    next();
                }
            });
        });
    }
}

router.get('/',function(req, res, next) {
    res.render('./registration/login' );
});

router.post('/', database.getAllInformationAboutCurrentUser,(req,res,next) =>{
    if (!req.body.username || !req.body.password) {
        console.info("Nisu podaci popunjeni");
        req.flash('error', 'Molim Vas popunite sva polja.');
        res.redirect('/login');
    } else {
        passport.authenticate('local', {
            successRedirect: '/home',
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next);
    }
});


module.exports = router;
