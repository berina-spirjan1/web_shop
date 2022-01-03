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
    getAllItemsFromYourShops: function(req, res, next){
        let id_korisnika = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select t.id_trgovine,array_agg(a.id_artikla) as id_artikala, array_agg(a.cijena_artikla) as cijena_artikala, array_agg(a.naziv_artikla) as nazivi_artikala,
                          array_agg(a.dostupna_kolicina) as kolicina_artikala, t.naziv_trgovine
                          from artikal a, trgovina t, artikal_trgovina at
                          where a.id_artikla = at.id_artikla
                          and t.id_trgovine = at.id_trgovine
                          and t.id_menadzera = $1
                          group by t.id_trgovine
                          order by t.id_trgovine`,[id_korisnika],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.artikli_iz_trgovina = result.rows;
                    next();
                }
            });
        });
    }
}

router.get('/', database.getAllItemsFromYourShops,function(req, res, next) {
    res.render('./sales_administrator/crud_for_items_from_shops',{items_from_shops: req.artikli_iz_trgovina});
});

router.get('/edit_shop_item/:id', function(req, res, next) {

    let id_trgovca = req.user.id_korisnika;

    pool.connect(function (err,client,done) {
        if(err)
            res.end(err);
        client.query(`select a.id_artikla, a.cijena_artikla, a.naziv_artikla, a.dostupna_kolicina
                      from artikal a, trgovina t, artikal_trgovina at
                      where a.id_artikla = at.id_artikla
                      and t.id_trgovine = at.id_trgovine
                      and t.id_menadzera = $1
                      and t.id_trgovine = $2
                      order by a.id_artikla`,[id_trgovca, req.params.id],function (err,result) {
            done();
            if(err)
                res.sendStatus(500);
            else{
                req.artikli = result.rows;
                res.render('./sales_administrator/crud_for_items',{items: req.artikli});
                next();
            }
        });
    });

});


module.exports = router;
