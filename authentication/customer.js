const alert = require("alert");

module.exports = {
    ensureAuthenticatedCustomer: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.id_tip_korisnika ===2 && req.user.status!=='blokiran' && req.user.status!=='blokiran na 15')
                return next();
        }
        alert('You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}