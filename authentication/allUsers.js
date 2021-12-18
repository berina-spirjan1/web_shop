module.exports = {
    ensureAuthenticated: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tip_korisnika === 1 || req.user.id_tip_korisnika === 2 || req.user.id_tip_korisnika === 3)
                return next();
        }
        req.flash('error','You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}