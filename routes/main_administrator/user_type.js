const express = require('express');
const router = express.Router();
const pg = require("pg");
const alert = require("alert");
const { ensureAuthenticatedMainAdministrator} = require('../../authentication/mainAdministrator');
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
    getAllTypesOfUser:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from tip_korisnika order by id_tip_korisnika",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.tip_korisnika = result.rows;
                    next();
                }
            });
        });
    },
    getAllNumberOfUsers:function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select count(*)
                          from korisnik k, tip_korisnika tk
                          where k.id_tip_korisnika = tk.id_tip_korisnika
                          group by tk.id_tip_korisnika
                          order by tk.id_tip_korisnika`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.broj_korisnika = result.rows;
                    next();
                }
            });
        });
    },
}


router.get('/',ensureAuthenticatedMainAdministrator, database.getAllTypesOfUser,
                     database.getAllNumberOfUsers,
    function(req, res, next) {
        res.render('./main_administrator/crud_for_type_of_user',{user_types: req.tip_korisnika, number_of_users: req.broj_korisnika});
    });


router.get('/delete_user_type',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/user_type');
    });


router.post('/delete_user_type/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from tip_korisnika 
                          where id_tip_korisnika = $1`, [req.params.id], function (err, result) {
                console.info("------------",result);
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted type of user!');
                    res.redirect('/home/user_type');
                }
            });
        }
    });
});


router.get('/delete_all',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/user_type');
    });

router.post('/delete_all', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from tip_korisnika`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all types of user!');
                    res.redirect('/home/user_type');
                }
            });
        }
    });
});

router.get('/add_user_type',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.render('./main_administrator/add_user_type');
    });

router.post('/add_user_type',ensureAuthenticatedMainAdministrator,function(req, res, next) {

    let position = req.body.position;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO tip_korisnika(pozicija_korisnika)
                          VALUES ($1)`,[position], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/user_type')
                }
            });
        }
    });
});


module.exports = router;