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

let database = {
    getMostPopularItems : function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select y.id_artikla, y.naziv_artikla, y.dostupna_kolicina, y.cijena_artikla, y.opis_artikla, y.sadrzaj_artikla,
                          ((y.suma_ocjene)/max(y.broj_ocjena)) as prosjek, y.slike_artikla
                          from(select a.id_artikla, a.naziv_artikla, a.dostupna_kolicina, a.cijena_artikla, a.opis_artikla, a.sadrzaj_artikla,
                               sum(o.ocjena)as suma_ocjene,count(o.ocjena) as broj_ocjena, array_agg(f.path) as slike_artikla
                               from artikal a, ocjene_artikala oa, ocjena o, fotografija f, artikal_fotografija af
                               where a.id_artikla = oa.id_artikal
                               and o.id_ocjena = oa.id_ocjene
                               and f.id_fotografije = af.id_fotografije
                               and a.id_artikla = af.id_artikla
                               group by a.id_artikla, a.naziv_artikla, a.dostupna_kolicina, a.cijena_artikla, a.opis_artikla,
                               a.sadrzaj_artikla) y
                          group by y.id_artikla, y.naziv_artikla, y.dostupna_kolicina, y.cijena_artikla, y.opis_artikla,
                                   y.sadrzaj_artikla, y.suma_ocjene, y.slike_artikla
                          order by prosjek desc`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.najpopularniji_artikli = result.rows;
                    next();
                }
            });
        });
    },
    getRandomItems: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`SELECT x.id_artikla, x.sadrzaj_artikla, x.naziv_artikla, x.opis_artikla, x.cijena_artikla, x.dostupna_kolicina,array_agg(f.path) as slike_artikla
                          FROM artikal x,fotografija f, artikal_fotografija af
                          where x.id_artikla = af.id_artikla
                          and f.id_fotografije = af.id_fotografije
                          group by x.id_artikla, x.sadrzaj_artikla, x.naziv_artikla, x.opis_artikla, x.cijena_artikla, x.dostupna_kolicina
                          ORDER BY RANDOM()
                          LIMIT 10`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.nasumicni_artikli = result.rows;
                    next();
                }
            });
        });
    },
    getItemsFromUserTags: function (req, res, next){

        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select a.id_artikla, a.cijena_artikla, a.naziv_artikla, a.opis_artikla, a.dostupna_kolicina,a.sadrzaj_artikla, array_agg(f.path) as slike_artikla
                          from artikal a, interesi_korisnika ik, kategorija k, kategorija_artikla ak, artikal_tagovi at, artikal_kategorija_artikla aka,
                               trgovina t, fotografija f, artikal_fotografija af
                          where ik.id_kategorija_artikla = ak.id_kategorija_artikla
                          and f.id_fotografije = af.id_fotografije
                          and a.id_artikla = af.id_artikla
                          and at.id_taga = ik.id_tagovi_artikla
                          and at.id_artikla = a.id_artikla
                          and ik.id_korisnika = $1
                          and aka.id_kategorija_artikla = ak.id_kategorija_artikla
                          and aka.id_artikla = a.id_artikla
                          and t.id_kategorije = k.id_kategorije
                          group by a.id_artikla`, [id_korisnika] ,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.artikli_na_osnovu_interesa = result.rows;
                    next();
                }
            });
        });
    },
    getPopularItemsWithImage: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select y.id_artikla, y.naziv_artikla, y.dostupna_kolicina, y.cijena_artikla, y.opis_artikla, 
                          y.sadrzaj_artikla, ((y.suma_ocjene)/max(y.broj_ocjena)) as prosjek, y.path
                          from(select a.id_artikla, a.naziv_artikla, a.dostupna_kolicina, a.cijena_artikla, a.opis_artikla, a.sadrzaj_artikla, f.path,
                               sum(o.ocjena)as suma_ocjene,count(o.ocjena) as broj_ocjena
                               from artikal a, ocjene_artikala oa, ocjena o, fotografija f
                               where a.id_artikla = oa.id_artikal
                               and f.id_fotografije = a.id_naslovnica
                               and o.id_ocjena = oa.id_ocjene
                               group by a.id_artikla, a.naziv_artikla, a.dostupna_kolicina, a.cijena_artikla, a.opis_artikla,
                                    a.sadrzaj_artikla, f.path) y
                          group by y.id_artikla, y.naziv_artikla, y.dostupna_kolicina, y.cijena_artikla, y.opis_artikla,y.sadrzaj_artikla, y.suma_ocjene, y.path
                          order by prosjek desc
                          limit 1`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.najpopularniji_artikli_sa_slikom = result.rows;
                    next();
                }
            });
        });
    },
    getAllChainStores: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select lt.naziv_lanca_trgovina, f.path, lt.id_lanca_trgovina
                          from lanac_trgovina lt, fotografija f
                          where lt.id_logo = f.id_fotografije`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.lanci_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getInfoAboutSingleItem: function (req,res,next) {
        let id_artikla = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select a.id_artikla, a.naziv_artikla, a.cijena_artikla, a.opis_artikla, a.sadrzaj_artikla, a.dostupna_kolicina,
                          array_agg(distinct f.path) as slike_artikla, array_agg(distinct tag.naziv_taga) as nazivi_taga,
                          array_agg(distinct tag.boja_taga) as boje_taga, array_agg(distinct ka.logo_kategorije) as logo_kategorije,
                          array_agg(distinct ka.naziv_kategorije) as nazivi_kategorija, array_agg(distinct ka.boja_kategorije) as boje_kategorija,
                          array_agg(distinct t.naziv_trgovine) as naziv_trgovine, array_agg(distinct lt.naziv_lanca_trgovina) as lanac_trgovina
                          from artikal a, artikal_fotografija af, fotografija f, tagovi_za_artikle tag, artikal_tagovi atag, kategorija_artikla ka,
                               artikal_kategorija_artikla aka, artikal_trgovina at, trgovina t, lanac_trgovina lt
                          where a.id_artikla = af.id_artikla
                          and atag.id_artikla = a.id_artikla
                          and aka.id_artikla = a.id_artikla
                          and lt.id_lanca_trgovina = t.id_lanca_trgovina
                          and ka.id_kategorija_artikla = aka.id_kategorija_artikla
                          and a.id_artikla = $1
                          and at.id_artikla = a.id_artikla
                          and at.id_trgovine = t.id_trgovine
                          and tag.id_taga = atag.id_taga
                          and af.id_fotografije = f.id_fotografije
                          group by a.id_artikla, a.naziv_artikla, a.cijena_artikla, a.opis_artikla, a.sadrzaj_artikla, a.dostupna_kolicina
                          order by a.id_artikla`,[id_artikla],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.informacije_o_artiklu = result.rows;
                    next();
                }
            });
        });
    },
    getCoverImage: function(req,res,next){

        let id_artikla = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select f.path
                          from artikal a, fotografija f
                          where a.id_naslovnica = f.id_fotografije
                          and a.id_artikla = $1`,[id_artikla],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pozadina = result.rows;
                    next();
                }
            });
        });
    },
    getMarkOfItem: function(req, res, next){
        let id_artikla = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select (y.suma_ocjena*1.00)/x.broj_ocjena as prosjek
                          from(select sum(o.ocjena) as suma_ocjena
                               from ocjena o, artikal a, ocjene_artikala oa
                               where o.id_ocjena = oa.id_ocjene
                               and a.id_artikla = oa.id_artikal
                               and a.id_artikla = $1) y, (select count(o1.id_ocjena) as broj_ocjena
                                                          from ocjena o1, ocjene_artikala oa1
                                                          where o1.id_ocjena = oa1.id_ocjene) x`,[id_artikla],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.ocjena = result.rows;
                    next();
                }
            });
        });
    },
    getCoverImageForShops: function(req, res, next){
        let id_artikla = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select f.path as pozadina, t.naziv_trgovine as naziv_trgovine
                          from fotografija f, artikal a, trgovina t, artikal_trgovina at
                          where t.id_pozadina = f.id_fotografije
                          and at.id_artikla = a.id_artikla
                          and a.id_artikla = at.id_trgovine
                          and a.id_artikla = $1
                          group by t.id_trgovine, pozadina, naziv_trgovine
                          order by t.id_trgovine`,[id_artikla],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pozadine_prodavnica = result.rows;
                    next();
                }
            });
        });
    },
    getAllItemsForSingleShop: function(req, res, next){
        let id_trgovine = req.params.id;
        let id_kategorije = req.params.id_category;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct a.id_artikla, a.naziv_artikla, f.path, a.cijena_artikla
                          from trgovina t, artikal a, artikal_trgovina at, fotografija f, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and f.id_fotografije = a.id_naslovnica
                          and aka.id_kategorija_artikla = ka.id_kategorija_artikla
                          and aka.id_artikla = a.id_artikla
                          and t.id_trgovine = $1
                          and ka.id_kategorija_artikla = $2
                          order by id_artikla`,[id_trgovine, id_kategorije],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_artikala = result.rows;
                    next();
                }
            });
        });
    },
    getCoverImageForShop: function(req, res, next){
        let id_trgovine = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select f.path
                          from trgovina t, fotografija f
                          where t.id_pozadina = f.id_fotografije
                          and t.id_trgovine = $1`,[id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pozadina_za_prodavnicu = result.rows;
                    next();
                }
            });
        });
    },
    getDetailInformationsAboutShop: function(req, res, next){
        let id_trgovine = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select y.naziv_kategorije, y.id_trgovine, y.ime, y.prezime, y.naziv_lanca_trgovina, y.path,
                                 y.naziv_trgovine, y.logo_kategorije, y.boja_kategorije, y.suma_ocjena, (y.suma_ocjena*1.00)/count(o.id_ocjena) as prosjek
                          from(select t.naziv_trgovine, t.id_trgovine, k.ime, k.prezime, lt.naziv_lanca_trgovina, f.path,
                                      kat.naziv_kategorije,kat.logo_kategorije, kat.boja_kategorije, sum(o.ocjena) as suma_ocjena
                               from trgovina t, lanac_trgovina lt, fotografija f, kategorija kat, korisnik k, ocjene_trgovina ot, ocjena o
                               where t.id_lanca_trgovina = lt.id_lanca_trgovina
                               and lt.id_logo = f.id_fotografije
                               and k.id_korisnika = t.id_menadzera
                               and kat.id_kategorije = t.id_kategorije
                               and ot.id_korisnika = k.id_korisnika
                               and t.id_trgovine = $1
                               and ot.id_trgovine = t.id_trgovine
                               and ot.id_ocjene = o.id_ocjena
                               group by t.naziv_trgovine, t.id_trgovine, k.ime, k.prezime, lt.naziv_lanca_trgovina, f.path,
                                        kat.naziv_kategorije, kat.logo_kategorije, kat.boja_kategorije) y, ocjena o, trgovina t, ocjene_trgovina ot
                          where ot.id_trgovine = t.id_trgovine
                          and o.id_ocjena = ot.id_ocjene
                          group by y.naziv_kategorije, y.id_trgovine, y.ime, y.prezime, y.naziv_lanca_trgovina, y.path, y.naziv_trgovine,
                                 y.logo_kategorije, y.boja_kategorije, y.suma_ocjena`,[id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.info_o_trgovini = result.rows;
                    next();
                }
            });
        });
    },
    getOneImageForItem: function (req, res, next){
        let id_trgovine = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select a.id_artikla,array_agg(f.path) as slike_artikla
                          from trgovina t, artikal a, artikal_trgovina at, fotografija f, artikal_fotografija af
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and af.id_fotografije = f.id_fotografije
                          and af.id_artikla = a.id_artikla
                          and t.id_trgovine = $1
                          group by a.id_artikla
                          order by a.id_artikla`,[id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.slike_arikala = result.rows;
                    next();
                }
            });
        });
    },
    getCategoriesOfItemsForCurrentShop: function (req, res, next){
        let id_trgovine = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct ka.id_kategorija_artikla, ka.boja_kategorije, ka.logo_kategorije, ka.naziv_kategorije
                          from kategorija_artikla ka, artikal a, trgovina t, artikal_trgovina at,artikal_kategorija_artikla aka
                          where aka.id_kategorija_artikla = ka.id_kategorija_artikla
                          and a.id_artikla = aka.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and t.id_trgovine = $1
                          and at.id_artikla = a.id_artikla
                          order by ka.id_kategorija_artikla`,[id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.kategorije_artikala_za_prodavnicu = result.rows;
                    next();
                }
            });
        });
    },
    getItemsForCurrentCategory:function(req, res, next){
        let id_trgovine = req.params.id;
        let id_kategorije = req.params.id_category;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct a.id_artikla, a.naziv_artikla, f.path, a.cijena_artikla
                          from trgovina t, artikal a, artikal_trgovina at, fotografija f, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and f.id_fotografije = a.id_naslovnica
                          and aka.id_kategorija_artikla = ka.id_kategorija_artikla
                          and aka.id_artikla = a.id_artikla
                          and t.id_trgovine = $1
                          and ka.id_kategorija_artikla = $2
                          order by a.id_artikla`,[id_trgovine, id_kategorije],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.artikli_kategorije = result.rows;
                    next();
                }
            });
        });
    },
    getPictures: function(req, res, next){
        let id_trgovine = req.params.id;
        let id_kategorije = req.params.id_category;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select a.id_artikla,array_agg(f.path) as slike_artikla
                          from trgovina t, artikal a, artikal_trgovina at, fotografija f, artikal_fotografija af,
                               kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and aka.id_artikla = a.id_artikla
                          and aka.id_kategorija_artikla = ka.id_kategorija_artikla
                          and af.id_fotografije = f.id_fotografije
                          and af.id_artikla = a.id_artikla
                          and t.id_trgovine = $1
                          and ka.id_kategorija_artikla = $2
                          group by a.id_artikla
                          order by a.id_artikla`,[id_trgovine, id_kategorije],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.slike = result.rows;
                    next();
                }
            });
        });
    },
    getShopsTopRated: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.naziv_trgovine, t.id_trgovine, f.path
                          from ocjena o, trgovina t, ocjene_trgovina ot, fotografija f
                          where o.id_ocjena = ot.id_ocjene
                          and f.id_fotografije = t.id_pozadina
                          and t.id_trgovine = ot.id_trgovine
                          group by t.naziv_trgovine, t.id_trgovine, f.path
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.najbolje_ocjenjene_prodavnice = result.rows;
                    next();
                }
            });
        });
    },
    getImagesForChainStores: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.naziv_trgovine, t.id_trgovine, f.path
                          from ocjena o, trgovina t, ocjene_trgovina ot, fotografija f, lanac_trgovina lt
                          where o.id_ocjena = ot.id_ocjene
                          and f.id_fotografije = lt.id_logo
                          and t.id_lanca_trgovina = lt.id_lanca_trgovina
                          and t.id_trgovine = ot.id_trgovine
                          group by t.naziv_trgovine, t.id_trgovine, f.path
                          order by t.id_trgovine`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.slike_za_lance_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    getAllItems: function (req, res, next) {
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije, ka.id_kategorija_artikla,
                                 array_agg(distinct a.id_artikla) as id_artikla, array_agg(distinct a.naziv_artikla) as naziv_artikla,
                                 array_agg(distinct a.opis_artikla) as opis_artikla, array_agg(distinct a.cijena_artikla) as cijena_artikla,
                                 array_agg(distinct t.naziv_trgovine)
                          from artikal a, trgovina t, artikal_trgovina at, fotografija f, artikal_fotografija af, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and ka.id_kategorija_artikla = aka.id_kategorija_artikla
                          and a.id_artikla = aka.id_artikla
                          and at.id_trgovine = t.id_trgovine
                          and af.id_artikla = a.id_artikla
                          and f.id_fotografije = af.id_fotografije
                          group by  ka.id_kategorija_artikla, ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije
                          order by ka.id_kategorija_artikla`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.svi_artikli = result.rows;
                    next();
                }
            });
        });
    },
    getCoverImagesForAllItems: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije, ka.id_kategorija_artikla, array_agg(distinct f.path) as slike_artikala
                          from artikal a, trgovina t, artikal_trgovina at, fotografija f, artikal_fotografija af, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and ka.id_kategorija_artikla = aka.id_kategorija_artikla
                          and a.id_artikla = aka.id_artikla
                          and at.id_trgovine = t.id_trgovine
                          and af.id_artikla = a.id_artikla
                          and f.id_fotografije = af.id_fotografije
                          group by  ka.id_kategorija_artikla, ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije
                          order by ka.id_kategorija_artikla`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.naslovnice_svih_artikala = result.rows;
                    next();
                }
            });
        });
    },
    getAllItemsFromBasket: function (req, res, next){

        let id_kupca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select * from Naruci($1);`,[id_kupca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.korpa = result.rows;
                    next();
                }
            });
        });
    },
    getLastIdOfOrder: function (req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select id_narudzbe as broj from narudzba order by id_narudzbe desc limit 1;`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.broj = result.rows[0].broj;
                    next();
                }
            });
        });
    },
    getAllMyOrders: function(req, res, next){
        let id_kupca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select y.naziv_artikla,y.cijena_artikla, y.kolicina, y.naziv_trgovine,y.id_artikla, y.status
                          from(select  a.naziv_artikla, a.cijena_artikla, count(a.id_artikla) as kolicina, t.naziv_trgovine,
                                       a.id_artikla, n.status
                          from artikal a, trgovina t, artikal_trgovina at, narudzba n
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and n.id_artikla = a.id_artikla
                          and n.id_kupca = $1
                          group by a.naziv_artikla, a.cijena_artikla, t.naziv_trgovine,a.id_artikla, n.status) y
                          group by y.naziv_artikla, y.cijena_artikla, y.naziv_trgovine, y.id_artikla,y.kolicina, y.status
                          order by y.cijena_artikla;`,[id_kupca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.moje_narudzbe = result.rows;
                    next();
                }
            });
        });
    },
    getStatusOfMarkForCurrentItem: function (req, res, next){
        let id_kupca = req.user.id_korisnika;
        let id_artikla = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct id_ocjene
                          from ocjene_artikala
                          where id_kupca = $1
                          and id_artikal = $2;`,[id_kupca, id_artikla],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.trenutni_artikal_ocjene_trenutnog = result.rows;
                    next();
                }
            });
        });
    },
    getStatusOfMarkForCurrentShop: function (req, res, next){
        let id_kupca = req.user.id_korisnika;
        let id_trgovine = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct id_ocjene
                          from ocjene_trgovina
                          where id_korisnika = $1
                          and id_trgovine = $2;`,[id_kupca, id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.trenutna_trgovina_ocjene_trenutnog = result.rows;
                    next();
                }
            });
        });
    },
    getCommentsForCurrentShop: function(req, res, next){
        let id_trgovine = req.params.id_shop;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select tk.tekst_komentara, k.username, tk.datum_objave, tk.vrijeme_objave,k.id_korisnika
                          from komentari_trgovci tk, korisnik k
                          where tk.id_trgovine = $1
                          and k.id_korisnika = tk.id_korisnika
                          order by tk.datum_objave, tk.vrijeme_objave desc`,[id_trgovine],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.komentari_za_prodavnicu = result.rows;
                    next();
                }
            });
        });
    },
    getAllMyOrdersThatAreDelivered: function(req, res, next){
        let id_kupca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select y.naziv_artikla,y.cijena_artikla, y.kolicina, y.naziv_trgovine,y.id_artikla, y.status
                          from(select  a.naziv_artikla, a.cijena_artikla, count(a.id_artikla) as kolicina, t.naziv_trgovine,
                                       a.id_artikla, n.status
                          from artikal a, trgovina t, artikal_trgovina at, narudzba n
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and n.id_artikla = a.id_artikla
                          and n.id_kupca = $1
                          and n.status = 2
                          group by a.naziv_artikla, a.cijena_artikla, t.naziv_trgovine,a.id_artikla, n.status) y
                          group by y.naziv_artikla, y.cijena_artikla, y.naziv_trgovine, y.id_artikla,y.kolicina, y.status
                          order by y.cijena_artikla;`,[id_kupca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.isporucene_narudzbe_moje = result.rows;
                    next();
                }
            });
        });
    },
    getAllItemsFromCatalogs: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.id_kataloga, k.naziv_kataloga, k.datum_kraja_trajanja, k.datum_pocetka_trajanja, k.boja_kataloga,
                                 t.naziv_trgovine, ko.ime, ko.prezime, ko.broj_telefona, ko.email, f.path
                          from artikal a, fotografija f, katalog k, katalog_artikli ka, trgovina t, korisnik ko, artikal_trgovina at
                          where a.id_artikla = ka.id_artikla
                          and f.id_fotografije = k.id_fotografije
                          and at.id_artikla = a.id_artikla
                          and k.datum_kraja_trajanja >= current_date
                          and at.id_trgovine = t.id_trgovine
                          and ko.id_korisnika = t.id_menadzera
                          and ka.id_kataloga = k.id_kataloga
                          order by k.id_kataloga`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.svi_katalozi = result.rows;
                    next();
                }
            });
        });
    },
    getInformationsAboutSingleCatalog: function (req, res, next){

        let id_kataloga = req.params.id;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select k.id_kataloga, k.naziv_kataloga, k.datum_kraja_trajanja, k.datum_pocetka_trajanja, k.boja_kataloga,
                               t.naziv_trgovine, ko.ime, ko.prezime, ko.broj_telefona, ko.email, f.path, t.id_trgovine,
                               a.naziv_artikla, a.id_artikla, a.cijena_artikla, a.popust, a.opis_artikla
                          from artikal a, fotografija f, katalog k, katalog_artikli ka, trgovina t, korisnik ko, artikal_trgovina at, artikal_fotografija af
                          where a.id_artikla = ka.id_artikla
                          and f.id_fotografije = af.id_fotografije
                          and af.id_artikla = a.id_artikla
                          and at.id_artikla = a.id_artikla
                          and k.datum_kraja_trajanja >= current_date
                          and at.id_trgovine = t.id_trgovine
                          and k.id_kataloga = $1
                          and ko.id_korisnika = t.id_menadzera
                          and ka.id_kataloga= k.id_kataloga
                          order by k.id_kataloga;`,[id_kataloga],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pojedinacni_katalog = result.rows;
                    next();
                }
            });
        });
    },
    orderChanged: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);

            client.on('notification', data=>{
                console.info("usao");
                const payload = JSON.parse(data.payload);
                req.notifikacije = payload;
                console.info("DODAN RED",payload);
            });

            client.query(`LISTEN new_event`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    next();
                }
            });

        });
    },
    getAllTags: function(req, res, next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select * from tagovi_za_artikle;`,function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.svi_tagovi = result.rows;
                    next();
                }
            });
        });
    }
}

let helpers = {
    count: function (req,res,next) {
        if(typeof req.user !== "undefined") {
            pool.connect(function (err, client, done) {
                if (err)
                    throw(err);
                else {
                    client.query("select count(*) as brojac from trenutna_korpa where id_kupca = $1;", [req.user.id_korisnika], function (err, result) {
                        done();
                        req.brojac = result.rows[0].brojac;
                        if (err)
                            throw(err);
                        else {
                            next();
                        }
                    });
                }
            });
        }else{
            req.brojac = 0;
            next();
        }
    },
    SendEmailForSuccessfullyOrdering:function (req,res,next) {

        let id_kupca = req.user.id_korisnika;

        pool.connect(function (err, client, done) {
            if (err)
                throw(err);
            else {
                client.query(`select email from korisnik where id_korisnika = $1`, [id_kupca], function (err, result) {
                    done();
                    if (err)
                        throw(err);
                    else{

                        let email = result.rows[0].email;
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
                            subject: "Thank you for ordering items 😃",
                            text: "Your order is sent to our shops. Please wait for delivery."
                        };

                        mail.sendMail(mailOptions,function(error,info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log("Successfully sent email." + info.response);
                            }
                        });
                    }
                });
            }
        });
    },
    searchForItem: function(req, res, next){

        let name = req.params.search_key.toLowerCase();

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije, ka.id_kategorija_artikla,
                                 array_agg(distinct a.id_artikla) as id_artikla, array_agg(distinct a.naziv_artikla) as naziv_artikla,
                                 array_agg(distinct a.opis_artikla) as opis_artikla, array_agg(distinct a.cijena_artikla) as cijena_artikla,
                                 array_agg(distinct t.naziv_trgovine)
                          from artikal a, trgovina t, artikal_trgovina at, fotografija f, artikal_fotografija af, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and ka.id_kategorija_artikla = aka.id_kategorija_artikla
                          and a.id_artikla = aka.id_artikla
                          and (opis_artikla ilike $1
                          or sadrzaj_artikla ilike $1
                          or naziv_artikla ilike $1
                          or ka.naziv_kategorije ilike $1)
                          and at.id_trgovine = t.id_trgovine
                          and af.id_artikla = a.id_artikla
                          and f.id_fotografije = af.id_fotografije
                          group by  ka.id_kategorija_artikla, ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije
                          order by ka.id_kategorija_artikla`,['%'+name+'%'],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pretraga_artikala = result.rows;
                    next();
                }
            });
        });
    },
    getCoverImagesForSearchItems: function(req, res, next){

        let name = req.params.search_key.toLowerCase();

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select distinct ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije, ka.id_kategorija_artikla, array_agg(distinct f.path) as slike_artikala
                          from artikal a, trgovina t, artikal_trgovina at, fotografija f, artikal_fotografija af, kategorija_artikla ka, artikal_kategorija_artikla aka
                          where a.id_artikla = at.id_artikla
                          and ka.id_kategorija_artikla = aka.id_kategorija_artikla
                          and a.id_artikla = aka.id_artikla
                          and at.id_trgovine = t.id_trgovine
                          and af.id_artikla = a.id_artikla
                          and (opis_artikla ilike $1
                          or sadrzaj_artikla ilike $1
                          or naziv_artikla ilike $1)
                          and f.id_fotografije = af.id_fotografije
                          group by  ka.id_kategorija_artikla, ka.naziv_kategorije, ka.logo_kategorije, ka.boja_kategorije
                          order by ka.id_kategorija_artikla`,['%'+name+'%'],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.naslovnice_pretrazenih_artikala = result.rows;
                    next();
                }
            });
        });
    },
    searchForShop: function(req, res, next){
        let name = req.params.search_key_shop.toLowerCase();

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.naziv_trgovine, t.id_trgovine, f.path
                          from trgovina t, fotografija f, lanac_trgovina lt
                          where (t.naziv_trgovine ilike $1
                          or lt.naziv_lanca_trgovina ilike $1)
                          and f.id_fotografije = t.id_pozadina
                          group by t.naziv_trgovine, t.id_trgovine, f.path
                          order by t.id_trgovine`,['%'+name+'%'],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pretrazene_prodavnice = result.rows;
                    next();
                }
            });
        });
    },
    getChainStoreImagesForSearch: function(req,res,next){
        let name = req.params.search_key_shop.toLowerCase();

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.naziv_trgovine, t.id_trgovine, f.path
                          from trgovina t, fotografija f, lanac_trgovina lt
                          where (t.naziv_trgovine ilike $1
                          or lt.naziv_lanca_trgovina ilike $1)
                          and f.id_fotografije = lt.id_logo
                          group by t.naziv_trgovine, t.id_trgovine, f.path
                          order by t.id_trgovine`,['%'+name+'%'],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.naslovnice_pretrazenih_trgovina = result.rows;
                    next();
                }
            });
        });
    },
    searchChainStore: function(req, res, next){
        let name = req.params.search_key_shop.toLowerCase();

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select lt.naziv_lanca_trgovina, f.path, lt.id_lanca_trgovina
                          from lanac_trgovina lt, fotografija f
                          where lt.id_logo = f.id_fotografije
                          and lt.naziv_lanca_trgovina ilike $1;`,['%'+name+'%'],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.pretrazeni_lanci_trgovina = result.rows;
                    next();
                }
            });
        });
    }
}



router.get('/', database.getMostPopularItems,
                     database.getRandomItems,
                     database.getItemsFromUserTags,
                     database.getPopularItemsWithImage,
                     database.getAllChainStores,
    function(req, res, next) {
    res.render('./customers/homepage',{
        most_popular: req.najpopularniji_artikli,
        random: req.nasumicni_artikli,
        items_from_interest: req.artikli_na_osnovu_interesa,
        pined_item: req.najpopularniji_artikli_sa_slikom,
        user_info: [req.user.ime, req.user.prezime],
        chain_stores: req.lanci_trgovina
    });
});
router.get('/shops',database.getAllChainStores,
                         database.getShopsTopRated,
                         database.getImagesForChainStores,
    function (req, res, next){
   res.render('./customers/all_shops',{
       chain_stores: req.lanci_trgovina,
       top_rated_shops: req.najbolje_ocjenjene_prodavnice,
       images: req.slike_za_lance_trgovina
   }) ;
});


router.get('/single_item/:id',database.getInfoAboutSingleItem,
                                   database.getCoverImage,
                                   database.getMarkOfItem,
                                   database.getStatusOfMarkForCurrentItem,
    function(req, res, next){

   res.render('./customers/single_item_page',{
        single_item: req.informacije_o_artiklu,
        cover_image: req.pozadina,
        mark_of_item: Math.round(req.ocjena[0].prosjek,2),
        is_rated: req.trenutni_artikal_ocjene_trenutnog
   });
});

router.get('/single_item/:id/description',database.getInfoAboutSingleItem,
    database.getCoverImage,
    database.getMarkOfItem,
    function(req, res, next){

        res.render('./customers/single_item_page_description',{
            single_item: req.informacije_o_artiklu,
            cover_image: req.pozadina,
            mark_of_item: req.ocjena
        });
});

router.get('/single_item/:id/content',database.getInfoAboutSingleItem,
    database.getCoverImage,
    database.getMarkOfItem,
    function(req, res, next){

        res.render('./customers/single_item_page_content',{
            single_item: req.informacije_o_artiklu,
            cover_image: req.pozadina,
            mark_of_item: req.ocjena
        });
});

router.get('/single_item/:id/shops',database.getInfoAboutSingleItem,
    database.getCoverImage,
    database.getMarkOfItem,
    database.getCoverImageForShops,
    function(req, res, next){
        res.render('./customers/single_item_page_shops',{
            single_item: req.informacije_o_artiklu,
            cover_image: req.pozadina,
            mark_of_item: req.ocjena,
            cover_images_shops: req.pozadine_prodavnica
        });
});

router.get('/single_item/:id/images',database.getInfoAboutSingleItem,
    database.getCoverImage,
    database.getMarkOfItem,
    function(req, res, next){
        res.render('./customers/single_item_page_images',{
            single_item: req.informacije_o_artiklu,
            cover_image: req.pozadina,
            mark_of_item: req.ocjena
        });
});

router.get('/single_shop/:id', database.getAllItemsForSingleShop,
                                    database.getCoverImageForShop,
                                    database.getDetailInformationsAboutShop,
                                    database.getStatusOfMarkForCurrentShop,
    function(req, res, next){


        res.render('./customers/single_shop_page',{
            items: req.niz_artikala,
            cover: req.pozadina_za_prodavnicu,
            info: req.info_o_trgovini,
            mark_of_item: Math.round(req.info_o_trgovini[0].prosjek,2),
            is_rated: req.trenutna_trgovina_ocjene_trenutnog
        });
});

router.get('/single_shop/:id/items', database.getAllItemsForSingleShop,
    database.getCoverImageForShop,
    database.getDetailInformationsAboutShop,
    database.getOneImageForItem,
    function(req, res, next){
        res.render('./customers/single_shop_page_items',{
            items: req.niz_artikala,
            cover: req.pozadina_za_prodavnicu,
            info: req.info_o_trgovini,
            images: req.slike_arikala
        });
});

router.get('/single_shop/:id/categories',
    database.getAllItemsForSingleShop,
    database.getCoverImageForShop,
    database.getDetailInformationsAboutShop,
    database.getCategoriesOfItemsForCurrentShop,
    function(req, res, next){
        res.render('./customers/single_shop_page_categories',{
            items: req.niz_artikala,
            cover: req.pozadina_za_prodavnicu,
            info: req.info_o_trgovini,
            categories: req.kategorije_artikala_za_prodavnicu
        });
});

router.get('/single_shop/:id/categories/:id_category',
    database.getAllItemsForSingleShop,
    database.getCoverImageForShop,
    database.getDetailInformationsAboutShop,
    database.getCategoriesOfItemsForCurrentShop,
    database.getPictures,
    database.getItemsForCurrentCategory,
    function(req, res, next){
        res.render('./customers/single_shop_page_categories_items',{
            items: req.artikli_kategorije,
            cover: req.pozadina_za_prodavnicu,
            info: req.info_o_trgovini,
            images: req.slike,
            categories: req.kategorije_artikala_za_prodavnicu
        });
});
router.get('/interest',database.getAllTags,function(req,res,next){
    res.render('./customers/interest_list',{
        tags: req.svi_tagovi
    });
})


router.get('/all_items',database.getAllItems,
                             database.getCoverImagesForAllItems,
    function (req, res, next) {

    res.render('./customers/all_items',{
        cover_images: req.naslovnice_svih_artikala,
        all_items: req.svi_artikli
    });
})

router.get('/basket',database.getAllItemsFromBasket,function(req, res, next){
    res.render('./customers/market_basket',{
        basket: req.korpa
    });
})

router.post('/basket/:id',helpers.count,function(req, res, next){

    let id_artikla= req.params.id;
    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`insert into trenutna_korpa(id_artikla, id_kupca)
                          values($1,$2);`, [id_artikla, id_kupca],function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    let brojac = req.brojac;
                    brojac.parseInt;
                    brojac++;
                    alert("Successfully added item to your basket!");
                }
            });
        }
    });
});

router.get('/delete_from_basket/:id', function (req,res,next){

    let id_kupca = req.user.id_korisnika;
    let id_artikla = req.params.id;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from trenutna_korpa 
                          where id_trenutne_korpe = (select distinct id_trenutne_korpe 
                                                     from trenutna_korpa
                                                     where id_kupca = $1 
                                                     and id_artikla = $2 
                                                     limit 1);`,[id_kupca,id_artikla],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/basket');
            });
        }
    });
});

router.get('/delete_all_amount_from_basket/:id', function (req,res,next){

    let id_kupca = req.user.id_korisnika;
    let id_artikla = req.params.id;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from trenutna_korpa 
                          where id_trenutne_korpe in (select distinct id_trenutne_korpe 
                                                     from trenutna_korpa
                                                     where id_kupca = $1 
                                                     and id_artikla = $2);`,[id_kupca,id_artikla],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/basket');
            });
        }
    });
});

router.get('/delete_all_from_basket', function (req, res, next){

    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from trenutna_korpa 
                          where id_kupca = $1);`,[id_kupca],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/basket');
            });
        }
    });
})

router.get('/successfully_ordering',helpers.SendEmailForSuccessfullyOrdering,function(req, res, next){
    res.redirect('/home/customer');
})

router.post('/successfully_ordering', database.getAllItemsFromBasket,
                                           database.orderChanged,
                                           database.getLastIdOfOrder,
    function(req, res, next){
    alert('You successfully order items. Check your email for confirmation 😉');

    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err, client, done) {
        if (err)
            throw(err);
        else {
                client.query(`call ZavrsiKorpu($1);`,
                    [id_kupca], function (err, result) {
                        done();
                        if (err)
                            throw(err);
                        else{
                            res.redirect('/home/customer');
                        }
                });
        }
    });
});

router.get('/all_orders',database.getAllMyOrders,function(req, res, next){
    res.render('./customers/my_orders',{
        all_my_orders: req.moje_narudzbe
    })
})
router.get('/all_delivery_orders',database.getAllMyOrdersThatAreDelivered,function(req, res, next){
    res.render('./customers/my_orders_that_are_delivered',{
        all_my_orders: req.isporucene_narudzbe_moje
    })
})

router.get('/all_catalogs',database.getAllItemsFromCatalogs,function(req, res, next){
    res.render('./customers/all_catalogs',{
        all_catalogs: req.svi_katalozi
    })
})

router.get('/catalog/:id',database.getInformationsAboutSingleCatalog,function(req, res, next){
    res.render('./customers/single_catalog',{
        catalog: req.pojedinacni_katalog
    })
})

router.get('/:search_key',helpers.getCoverImagesForSearchItems,
                               helpers.searchForItem,
    function(req,res,next){
    res.render('./customers/all_items',{
        cover_images: req.naslovnice_pretrazenih_artikala,
        all_items: req.pretraga_artikala
    });
});

router.get('/shops/:search_key_shop',helpers.searchChainStore,
    helpers.searchForShop, helpers.getChainStoreImagesForSearch,
    function(req,res,next){
        res.render('./customers/all_shops',{
            chain_stores: req.pretrazeni_lanci_trgovina,
            top_rated_shops: req.pretrazene_prodavnice,
            images: req.naslovnice_pretrazenih_trgovina
        }) ;
    });


router.get('/delete_from_order/:id', function (req,res,next){

    let id_kupca = req.user.id_korisnika;
    let id_artikla = req.params.id;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from narudzba
                          where id_narudzbe = (select distinct id_narudzbe 
                                                     from narudzba
                                                     where id_kupca = $1 
                                                     and id_artikla = $2 
                                                     limit 1);`,[id_kupca,id_artikla],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/all_orders');
            });
        }
    });
});

router.get('/delete_all_amount_from_order/:id', function (req,res,next){

    let id_kupca = req.user.id_korisnika;
    let id_artikla = req.params.id;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from narudzba
                          where id_narudzbe in (select distinct id_narudzbe
                                                     from narudzba
                                                     where id_kupca = $1 
                                                     and id_artikla = $2);`,[id_kupca,id_artikla],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/all_orders');
            });
        }
    });
});

router.get('/delete_all_from_order', function (req, res, next){

    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`delete from narudzba 
                          where id_kupca = $1);`,[id_kupca],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    res.redirect('/home/customer/all_orders');
            });
        }
    });
})

router.get('/mark_item/:id_item/:id',function(req, res, next){
    res.redirect('/home/customer/single_item/'+req.params.id_item);
});

router.post('/mark_item/:id_item/:id',function(req, res, next){
    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`call UpisiOcjenuZaArikal($1, $2, $3);`,[req.params.id, req.params.id_item, id_kupca],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    alert("Successfully rated item!")
                    res.redirect('/home/customer/single_item/'+req.params.id_item);
            });
        }
    });
})

router.get('/mark_shop/:id_shop/:id',function(req, res, next){
    res.redirect('/home/customer/single_shop/'+req.params.id_shop);
});

router.post('/mark_shop/:id_shop/:id',function(req, res, next){
    let id_kupca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`call UpisiOcjenuZaTrgovinu($1, $2, $3);`,[req.params.id, req.params.id_shop, id_kupca],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    alert("Successfully rated shop!")
                    res.redirect('/home/customer/single_shop/'+req.params.id_shop);
            });
        }
    });
});

router.get('/add_comment/:id_shop',database.getCommentsForCurrentShop,function(req, res, next){
    res.render('./customers/comments',{
        comments: req.komentari_za_prodavnicu,
        current_user: req.user.id_korisnika,
        shop: req.params.id_shop
    })
});

router.post('/add_comment/:id_shop',function(req, res, next){
    let id_kupca = req.user.id_korisnika;
    let tekst_komentara = req.body.text_of_comment;
    let id_trgovine = req.params.id_shop;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`call KreirajNoviKomentar($1, $2, $3)`,[id_kupca, id_trgovine, tekst_komentara],function (err,result) {
                done();
                if (err)
                    throw(err);
                else
                    alert("Successfully added new comment!")
                res.redirect('/home/customer/add_comment/'+req.params.id_shop);
            });
        }
    });
});


module.exports = router;