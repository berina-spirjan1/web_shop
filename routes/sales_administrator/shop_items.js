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
    },
    getAllDifferentCategories: function(req,res,next){
        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query("select * from kategorija_artikla order by id_kategorija_artikla",function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.niz_kategorija = result.rows;
                    next();
                }
            });
        });
    },
    getAllCurrentImagesAdded: function(req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select * 
                          from trenutne_fotografije 
                          where id_trgovca = $1 
                          order by id_trenutne_fotografije`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.trenutne_fotografije = result.rows;
                    next();
                }
            });
        });
    },
    getAllPosibleCategoriesForCurrentItem: function (req, res, next){
        let id_trgovca = req.user.id_korisnika;

        pool.connect(function (err,client,done) {
            if(err)
                res.end(err);
            client.query(`select *
                          from kategorija_artikla
                          where id_kategorija_artikla not in (select kt.id_kategorija_artikla
                                                              from kategorije_za_trenutni_artikal kt
                                                              where kt.id_trgovca = $1
                                                              order by kt.id_trenutna_kategorija)`,[id_trgovca],function (err,result) {
                done();
                if(err)
                    res.sendStatus(500);
                else{
                    req.moguce_kategorije = result.rows;
                    next();
                }
            });
        });
    }
}

router.get('/', database.getAllItemsFromYourShops,function(req, res, next) {
    res.render('./sales_administrator/crud_for_items_from_shops',{
        items_from_shops: req.artikli_iz_trgovina
    });
});


router.get('/add_photo',database.getAllCurrentImagesAdded,
    function(req, res, next) {

        res.render('./main_administrator/add_new_image',{
            uploadedImages: req.trenutne_fotografije
        })
});

router.post('/add_photo',
    function(req, res, next) {

        let file = req.files.image;
        let img_name=file.name;

        if(file.mimetype === "image/jpeg" ||file.mimetype === "image/png"||file.mimetype === "image/gif" ||file.mimetype === "image/jpg"){

            file.mv('public/images/'+file.name, function(err) {
                if (err)
                    return res.status(500).send(err);
                else{
                    pool.connect(function (err,client,done) {
                        if(err)
                            throw(err);
                        else {
                           client.query("select * from DodajFotografiju($1,$2);", [img_name,req.user.id_korisnika], function (err, result) {
                               done();
                               if (err)
                                   throw(err);
                               else {
                                   req.dodate_fotografije = result;
                                   alert("Successfully added image!");
                                   res.redirect('/home/sales_administrator/shops_items/add_photo');
                               }
                           });

                        }
                    });
                }
            });
        } else {
            alert('Wrong format of image!');
            res.redirect('/home/sales_administrator/shops_items/add_photo');
        }
});
router.get('/add_item', database.getAllDifferentCategories,
    database.getAllItemsFromYourShops,
    function(req, res, next) {
        res.render('./main_administrator/add_new_item',{
            itemCategory: req.niz_kategorija,
            shops: req.artikli_iz_trgovina
        });
    });

router.post('/add_item',function(req, res, next) {
    let name = req.body.name;
    let description = req.body.description;
    let amount = req.body.amount;
    let content = req.body.content;
    let shop = req.body.shop;
    let price = req.body.price;

    let file = req.files.image;
    let img_name=file.name;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            if(req.body.discount==='' || req.body.starting_date==='' || req.body.ending_date===''){
                if(file.mimetype === "image/jpeg" ||file.mimetype === "image/png"||file.mimetype === "image/gif"||file.mimetype === "image/jpg" ){

                    file.mv('public/images/'+file.name, function(err) {
                        if (err)
                            return res.status(500).send(err);
                        else{
                            pool.connect(function (err,client,done) {
                                if(err)
                                    throw(err);
                                else {
                                    client.query(`call ZavrsiBezPopusta($1, $2, $3, $4, $5, $6, $7, $8); `,
                                        [name, description, amount, price, content,img_name,shop,req.user.id_korisnika],
                                        function (err, result) {
                                        done();
                                        if (err)
                                            throw(err);
                                        else {
                                            alert("Successfully added item that is not special price!");
                                            res.redirect('/home/sales_administrator/shops_items');
                                        }
                                    });

                                }
                            });
                        }
                    });
                }
                else {
                    alert('Wrong format of image!');
                    res.redirect('/home/sales_administrator/shops_items/add_item');
                }
            }else if(req.body.discount!=='' || req.body.starting_date!=='' || req.body.ending_date!==''){
                if(file.mimetype === "image/jpeg" ||file.mimetype === "image/png" || file.mimetype === "image/gif"||file.mimetype === "image/jpg" ){

                    file.mv('public/images/'+file.name, function(err) {
                        if (err)
                            return res.status(500).send(err);
                        else{
                            pool.connect(function (err,client,done) {
                                if(err)
                                    throw(err);
                                else {
                                    client.query(`call ZavrsiSnizeni($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
                                        [name, description, amount, price,req.body.starting_date, req.body.discount,
                                            content,req.body.ending_date,img_name,shop,req.user.id_korisnika], function (err, result) {
                                            done();
                                            if (err)
                                                throw(err);
                                            else {
                                                alert("Successfully added item with special price!");
                                                res.redirect('/home/sales_administrator/shops_items');
                                            }
                                        });

                                }
                            });
                        }
                    });
                }
                else {
                    alert('Wrong format of image!');
                    res.redirect('/home/sales_administrator/shops_items/add_item');
                }

            }
        }
    });
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


router.get('/add_new_tag',
    function(req, res, next) {
        res.render('./sales_administrator/add_tags_for_items');
    });

router.post('/add_new_tag',function(req, res, next) {

    let tag_name = req.body.tag_name;
    let tag_color = req.body.tag_color;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`INSERT INTO tagovi_za_artikle(naziv_taga, boja_taga)
                          VALUES ($1,$2)`,[tag_name, tag_color], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/sales_administrator/shops_items/add_new_tag');
                }
            });
        }
    });
});

router.get('/add_item_category', database.getAllPosibleCategoriesForCurrentItem,
    function(req, res, next) {
        res.render('./main_administrator/add_item_category',{
            itemCategory: req.moguce_kategorije
    });
});

router.post('/add_item_category', function(req, res, next){
   let category = req.body.category;

    pool.connect(function (err,client,done) {
        if(err)
            throw(err);
        else {
            client.query(`call  DodajArtikluKategoriju($1, $2)`,[3, category], function (err,result) {
                done();
                if (err)
                    throw(err);
                else {
                    res.redirect('/home/sales_administrator/shops_items/add_item_category');
                }
            });
        }
    });
});


module.exports = router;
