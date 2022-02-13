const alert = require("alert");

module.exports = {
    ensureAuthenticatedArchiveCustomer: function (req,res,next) {
        if(req.isAuthenticated()){
            if(req.user.status!=='arhiviran')
                return next();
        }
        alert('You need to login to be able to continue using app.');
        res.redirect('/login');
    }
}