const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const pg = require('pg');

const config = {
    user: 'postgres',
    database: 'postgres',
    password: 'berina123',
    host: 'localhost',
    port: 5433,
    max: 100,
    idleTimeoutMillis: 30000,
};
const pool = new pg.Pool(config);


module.exports = function(passport) {
    passport.use(new LocalStrategy({
        usernameField: 'username'},
        (username,sifra,done)=> {
            pool.connect(function (err, client, don) {
                if (err) {
                    throw(err);
                } else {
                    client.query("select * from korisnik where username = $1;", [username], function (err, result) {
                        don();
                        if (err)
                            throw err;
                        if (result.rows.length > 0) {
                            const user = result.rows[0];
                            bcrypt.compare(sifra, user.sifra, function (err, isMatch) {
                                if (err)
                                    throw err;
                                if (isMatch) {
                                    return done(null, user);
                                } else {
                                    return done(null, false, {message: "Password is not valid. "});
                                }
                            })
                        } else {
                            return done(null, false, {message: "Username is not valid."})
                        }
                    });
                }
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user.id_korisnika);
    });

    passport.deserializeUser(function(id, done) {

        pool.connect(function (err,client,don) {
            if(err)
                throw(err);
            else {

                client.query("select * from korisnik where id_korisnika = $1;", [id], function (err, result) {
                    don();

                    if (err)
                        throw(err);
                    else {
                        return done(null, result.rows[0]);
                    }
                });
            }
        });

    });
}