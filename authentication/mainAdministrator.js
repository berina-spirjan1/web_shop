const alert = require("alert");

module.exports = {
    ensureAuthenticatedMainAdministrator: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tipa_korisnika === 1)
                return next();
        }
        alert('You need to login to be able to continue using app4.');
        res.redirect('/login');
    }
}