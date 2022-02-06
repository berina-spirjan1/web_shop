const alert = require("alert");

module.exports = {
    ensureAuthenticatedCustomer: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tipa_korisnika === 2 && (req.user.status!=='blokiran' || req.user.status!=='blokiran na 15' || req.user.status!=='arhiviran'))
                return next();
        }
        alert('You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}