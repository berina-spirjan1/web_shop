const alert = require("alert");

module.exports = {
    ensureAuthenticatedSalesAdministrator: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tip_korisnika===3 && req.user.status!=='blokiran' && req.user.status!=='blokiran na 15')
                return next();
        }
        alert('error','You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}