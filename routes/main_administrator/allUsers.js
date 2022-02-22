const express = require('express');
const pg = require("pg");
const router = express.Router();
const saltRounds = 10;
let alert = require('alert');

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

const {ensureAuthenticatedMainAdministrator} = require('../../authentication/mainAdministrator');
const bcrypt = require("bcrypt");
const {ensureAuthenticatedSalesAdministrator} = require("../../authentication/salesAdministrator");

let database = {
    getAllUsers: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from korisnik order by id_korisnika",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_korisnika = result.rows;
                    next();
                }
            });
        });
    },
    getAllPositions: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.pozicija_korisnika 
                          from korisnik k, tip_korisnika t
                          where k.id_tip_korisnika = t.id_tip_korisnika
                          order by k.id_korisnika`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("-------------",result.rows);
                    req.niz_svih_pozicija = result.rows;
                    next();
                }
            });
        });
    },
    getAllCategoriesFromShops: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.naziv_kategorije
                          from kategorija k, trgovina t
                          where t.id_kategorije = k.id_kategorije
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_kategorija = result.rows;
                    next();
                }
            });
        });
    },
    getAllChainStoresFromShop: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select l.naziv_lanca_trgovina
                          from lanac_trgovina l, trgovina t
                          where l.id_lanca_trgovina = t.id_lanca_trgovina
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_svih_lanaca_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllDifferentPositions: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct t.id_tip_korisnika,t.pozicija_korisnika
                          from tip_korisnika t`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_pozicija = result.rows;
                    next();
                }
            });
        });
    },
    getAllStatus: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select distinct status from korisnik order by status",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_statusa = result.rows;
                    next();
                }
            });
        });
    }
}



router.get('/',ensureAuthenticatedMainAdministrator, database.getAllUsers,
    database.getAllPositions,
    database.getAllCategoriesFromShops,
    database.getAllChainStoresFromShop,
    // ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.render('./main_administrator/crud_for_users',{
            listOfUsers: req.niz_svih_korisnika,
            positions: req.niz_svih_pozicija,
            categories: req.niz_svih_kategorija,
            chainStore: req.niz_svih_lanaca_trgovina
        });
    });

router.get('/add_user', ensureAuthenticatedMainAdministrator,database.getAllDifferentPositions,
                             database.getAllStatus,
                             function(req, res, next) {
    res.render('./main_administrator/add_new_user',{
        positions: req.niz_pozicija,
        status: req.niz_statusa
    });
});


router.post('/add_user',ensureAuthenticatedMainAdministrator,function(req, res, next) {

    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let type_of_user = req.body.type_of_user;
    let phone_number = req.body.phone_number;
    let status = req.body.status;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            bcrypt.hash(password, saltRounds).then(function(hash) {
                client.query(`INSERT INTO korisnik(ime, prezime, email, sifra, username, id_tip_korisnika, broj_telefona, status)
                              VALUES ($1,$2,$3,$4, $5, $6, $7, $8)`,[first_name, last_name, email, hash, username,  type_of_user, phone_number, status],
                    function (err,result) {
                    done();
                    if (err)
                        throw(err);
                    else {
                        res.redirect('/home/users')
                    }
                });
            });
        }
    });
});

router.get('/archive_user',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
});

router.post('/archive_user/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'deaktiviran' 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully archived user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/block_user',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
    });

router.post('/block_user/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'blokiran' 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully blocked user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/block_user_for_15',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
    });

router.post('/block_user_for_15/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'blokiran na 15', datum_blokiranja = current_date 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully blocked user for fifteen days');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/unblock_user_for_15',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
    });

router.post('/unblock_user_for_15/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'aktivan' 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully unblocked user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});


router.get('/delete_user',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
});


router.post('/delete_user/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from korisnik 
                          where id_korisnika = $1`, [req.params.id], function (err, result) {
                console.info("------------",result);
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted user!');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/update_user/:id', ensureAuthenticatedMainAdministrator,database.getAllDifferentPositions,
    function(req, res, next) {
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select * 
                          from korisnik k,tip_korisnika tk 
                          where k.id_korisnika = $1 and k.id_tip_korisnika = tk. id_tip_korisnika`,[req.params.id],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    console.info("-------------",req.niz_pozicija);
                    res.render('./main_administrator/update_user_type', {data: result.rows[0], positions: req.niz_pozicija});
                    next();
                }
            });
        });
});
0
router.post('/update_user/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {

    let user_type = req.body.id_tip_korisnika;

    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set id_tip_korisnika = $2 
                          where id_korisnika = $1`, [req.params.id,user_type], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully updated user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/delete_all',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
});

router.post('/delete_all', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`delete from korisnik`, function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully deleted all users from database!');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/unarchived_user',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
    });

router.post('/unarchived_user/:id',ensureAuthenticatedMainAdministrator, function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'aktivan' 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully unarchived user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});

router.get('/unblock_user',ensureAuthenticatedMainAdministrator,
    function(req, res, next) {
        res.redirect('/home/users');
    });

router.post('/unblock_user/:id', ensureAuthenticatedMainAdministrator,function(req, res, next) {
    pool.connect(function (err, client, don) {
        if (err)
            throw(err);
        else {
            client.query(`update korisnik
                          set status = 'aktivan' 
                          where id_korisnika = $1
                          and (id_tip_korisnika = 2
                          or id_tip_korisnika = 3)`, [req.params.id], function (err, result) {
                don();
                if (err)
                    throw(err);
                else{
                    alert('Successfully unblocked user');
                    res.redirect('/home/users');
                }
            });
        }
    });
});


module.exports = router;