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


router.get('/single_item/:id',database.getInfoAboutSingleItem,
                                   database.getCoverImage,
                                   database.getMarkOfItem,
    function(req, res, next){

   res.render('./customers/single_item_page',{
        single_item: req.informacije_o_artiklu,
        cover_image: req.pozadina,
        mark_of_item: req.ocjena
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




module.exports = router;