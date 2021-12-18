const nodemailer = require("nodemailer");

module.exports =
    function sendEmailForVerification(email, token) {

        let mail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'zendev2021@gmail.com', // Your email id
                pass: 'zendev123' // Your password
            }
        });

        const mailOptions = {
            from: 'zendev2021@gmail.com',
            to: email,
            subject: 'Verify Your account',
            html: `<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
  
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;"> We're thrilled to have you here! Get ready to dive into your new account. </div>
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
                            <h1 style="font-size: 48px; font-weight: 400; margin: 2px; margin-bottom: 20px;">Welcome!</h1> <img src="https://www.kindpng.com/picc/m/715-7151711_online-shopping-clipart-png-transparent-png.png" width="125" height="120" style="display: block; border: 0px;" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">We're excited to have you get started. First, you need to confirm your account. Just press the button below.</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 60px 30px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 3px;" bgcolor="#3089c2"><a href="http://localhost:3000/verify_account?token=' + ${token} + '" style="font-size: 20px; font-family: 'Segoe UI Semibold'; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 15px 25px; border-radius: 2px; border: 1px solid #3089c2; display: inline-block; border-radius: 20px">Confirm Account</a></td>
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
                            <p style="margin: 0;"><a href="http://localhost:3000/verify_account?token=' + ${token} + '" target="_blank" style="color: #3089c2;">http://localhost:3000/verify_account</a></p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">If you have any questions, just reply to this email—we're always happy to help out.</p>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 40px 30px; border-radius: 0px 0px 4px 4px; color: #666666; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;">
                            <p style="margin: 0;">Cheers,<br>Web shop Team</p>
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