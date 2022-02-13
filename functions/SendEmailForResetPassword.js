const nodemailer = require("nodemailer");

module.exports =
    function SendEmailForResetPassword(email, token) {

        let mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'zendev2021@gmail.com', // Your email id
                pass: '*' // Your password
            }
        });

        const mailOptions = {
            from: 'zendev2021@gmail.com',
            to: email,
            subject: 'Reset your password',
            html: `<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
  
     <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> That's okey, it happens! Click on the button below to reset your password. </div>
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#3089c2" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;"> </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#3089c2" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Segoe UI Black', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2px; margin-bottom: 20px;">Forgot your password?</h1> <img src="https://media.istockphoto.com/vectors/depressed-emoticon-vector-id480144800?k=20&m=480144800&s=612x612&w=0&h=UBol4m9eJ03gm-G34KsRHeLg7UJePn3btS1yNkCRI2Q=" width="125" height="120" style="display: block; border: 0px;" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                                        <p style="margin: 0;"> That's okey, it happens! Click on the button below to reset your password.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 3px;" bgcolor="#3089c2"><a href="http://localhost:3000/reset_password?token=' + ${token} + '" style="font-size: 20px; font-family: 'Segoe UI Semibold'; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #3089c2; display: inline-block; border-radius: 20px">Reset password</a></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr> 
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 0px 30px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">If that doesn't work, copy and paste the following link in your browser:</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 20px 30px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;"><a href="http://localhost:3000/reset_password?token=' + ${token} + '" style="color: #3089c2;">http://localhost:3000/reset_password</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>`
        };

        mail.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.info("GRESKA",error);
                return 1
            } else {
                return 0
            }
        });
};