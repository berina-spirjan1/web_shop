module.exports = {
    ensureAuthenticatedCustomer: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tipa_korisnika === 2)
                return next();
        }
        req.flash('error','You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}