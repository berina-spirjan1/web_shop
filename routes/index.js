const express = require('express');
const router = express.Router();
const pg = require('pg');
const randtoken = require('rand-token');

let sendEmailForResetPassword = require('../functions/SendEmailForResetPassword');
let sendEmailForVerification = require('../functions/SendEmailForVerification');

const config = {
  user: 'vhaxxure',
  database: 'vhaxxure',
  password: 'PRTQj-BsWP_lwQCZdqJH94vbpZHUkuAx',
  host: 'tai.db.elephantsql.com',
  port: 5432,
  max: 100,
  idleTimeoutMillis: 30000,
};

const pool = new pg.Pool(config);
const bcrypt = require('bcrypt');
const saltRounds = 10;

const{ ensureAuthenticated } = require('../authentication/allUsers');

let database = {
  Validation: function(req, res, next){

    const first_name = req.body.ime;
    const last_name = req.body.prezime;
    const email = req.body.email;
    const mobile_number = req.body.broj_telefona;
    const username = req.body.username;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;

    let errors = [];

    if(!first_name || !last_name || !email || !password || !confirm_password || !mobile_number || !username){
      errors.push({message:"Please fill all required fields."});
    }
    if(password.length < 8){
      errors.push({message:"Password must be at least 8 characters long."});
    }
    if(password !== confirm_password){
      errors.push({message:"Passwords do not match."});
    }

    if(errors.length > 0){
      res.render('sign_up', {errors,first_name,last_name,email,username,password,confirm_password});
    }
    else{
      pool.connect(function (err,client,done) {
        if(err)
          res.end(err);
        client.query("select email from korisnik where email = $1",[email],function (err,result) {
          done();
          if(err)
            res.sendStatus(500);
          if(result.rows.length > 0){
            errors.push({message:"E-mail used. Try with another one."});
            res.render("sign_up",{errors,password,confirm_password,first_name,last_name,email, username});
          }
          else{
            next();
          }
        });
      });
    }
  },
  CreateNewUser: function (req,res,next) {
    const first_name = req.body.ime;
    const last_name = req.body.prezime;
    const mobile_number = req.body.broj_telefona;
    const username = req.body.username;
    const email= req.body.email;
    const sifra= req.body.password;

    bcrypt.hash(sifra, saltRounds).then(function(hash) {
      pool.connect(function (err,client,done) {
        if(err)
          res.end(err);
        client.query("insert into korisnik(ime,prezime,email,sifra, username, broj_telefona)" +
            "values($1,$2,$3,$4,$5,$6);",[first_name,last_name,email,hash,username, mobile_number],function (err) {
          done();
          if(err)
            res.sendStatus(500);
          else {
            // req.flash('success_msg', 'Sada ste registrovani, prijavite se');
            res.redirect('/login');
          }
        });
      });
    });
  }
}

router.get('/', function(req, res, next) {
  res.redirect('/login');
});

router.get('/sign_up', function(req, res, next) {
  res.render('sign_up' );
});

router.post('/sign_up',database.Validation,database.CreateNewUser, function (req, res, next) {});

router.get('/verify_account', function(req, res, next) {
  res.render('verify_account' );
});

router.post('/verify_account', function(req, res, next) {

  const email = req.body.email;

  pool.query('SELECT * FROM korisnik WHERE email =$1',[email], function(err, result) {
    if (err) throw err;

    let type = 'success';
    let msg = 'Email already verified';

    if (result.rows.length > 0) {

      let token = randtoken.generate(20);

      if(result.rows[0].verifikacija === 0 ){

        let sent = sendEmailForVerification(email, token);

        console.info("SENDER JE",sent);

        if (sent === 0) {

          pool.query(`UPDATE korisnik SET token=$1, verifikacija=1 WHERE email=$2`, [token,email], function(err, result) {
            if(err) throw err

          });

          type = 'success';
          msg = 'The verification link has been sent to your email address';
          console.info("-----------------------------------------",type,msg);
          res.redirect('/successfully_verified_account');

        } else {
          type = 'error';
          msg = 'Something goes to wrong. Please try again';
        }
      }


    } else {
      console.log('2');
      type = 'error';
      msg = 'The Email is not registered with us';

    }

    req.flash(type, msg);
    res.redirect('/login');
  });
})

router.get('/successfully_verified_account', function(req, res, next) {
  res.render('successfully_verified_account');
});


router.get('/forgot_password', function(req, res, next) {
  res.render('forgot_password');
});

router.post('/forgot_password', function(req, res, next) {

  const email = req.body.email;

  pool.query('SELECT * FROM korisnik WHERE email =$1',[email], function(err, result) {
    if (err) throw err;

    let type = 'success';
    let msg = 'Email already verified';

    if (result.rows.length > 0) {

      let token = randtoken.generate(20);

      if(result.rows[0].verifikacija === 0 ){

        let sent = sendEmailForResetPassword(email, token);

        console.info("SENDER JE",sent);

        if (sent === 0) {

          pool.query(`UPDATE korisnik SET token=$1 WHERE email=$2`, [token,email], function(err, result) {
            if(err) throw err

          });

          type = 'success';
          msg = 'The verification link has been sent to your email address';
          console.info("-----------------------------------------",type,msg);

        } else {
          type = 'error';
          msg = 'Something goes to wrong. Please try again';
        }
      }


    } else {
      console.log('2');
      type = 'error';
      msg = 'The Email is not registered with us';

    }

    req.flash(type, msg);
    res.redirect('/login');
  });

})


router.get('/reset_password', function(req, res, next) {
  res.render('reset_password');
});

router.post('/reset_password', function(req, res, next) {

  let token = req.body.token;
  let password = req.body.password;

  pool.query('SELECT * FROM korisnik WHERE token = $1', [token] ,function(err, result) {
    if (err) throw err;

    let type;
    let msg;

    if (result.length > 0) {

      bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {

          let data = {
            password: hash
          };

          pool.query('UPDATE korisnik SET sifra = $1 WHERE email = $2', [data.password, result[0].email], function(err, result) {
            if(err) throw err

          });

        });
      });

      type = 'success';
      msg = 'Your password has been updated successfully';

    } else {

      console.log('2');
      type = 'success';
      msg = 'Invalid link; please try again';

    }

    req.flash(type, msg);
    res.redirect('/login');
  });
})


module.exports = router;
