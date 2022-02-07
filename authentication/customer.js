const alert = require("alert");

module.exports = {
    ensureAuthenticatedCustomer: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.status!=='blokiran' && req.user.status!=='blokiran na 15')
                return next();
        }
        alert('You need to login to be able to continue using app3.');
        res.redirect('/login');
    }
}