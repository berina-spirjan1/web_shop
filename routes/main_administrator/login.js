const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', function(req, res, next) {
    res.render('./registration/login' );
});

router.post('/', (req,res,next) =>{
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
