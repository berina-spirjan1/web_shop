const alert = require("alert");

module.exports = {
    ensureAuthenticatedMainAdministrator: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tip_korisnika===1)
                return next();
        }
        alert('You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}