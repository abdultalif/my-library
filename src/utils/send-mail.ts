import nodemailer from 'nodemailer';
import config from '../config/environment';

const transporter = nodemailer.createTransport({
  service: config.mailService,
  auth: {
    user: config.mailUser,
    pass: config.mailPassword,
  },
});

const createEmail = (name: string, email: string, token: string) => {
  return {
    from: config.mailFrom,
    to: email,
    subject: 'MyLibrary: Verify Your Email',
    html: `
            <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%;background-color:#f6f6f6" width="100%" bgcolor="#f6f6f6">
                <tbody>
                    <tr>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top;Margin:0 auto!important;max-width:580px;padding:10px;width:580px" width="580" valign="top">
                            <div style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px">
                                <span style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;width:0">Verify Your Email</span>
                                <table style="border-collapse:separate;width:100%;background:#fff;border-radius:3px" width="100%">
                                    <tbody>
                                        <tr>
                                            <td style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px" valign="top">
                                                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%" width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Hi ${name},</p>
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Thanks for signing up for MyLibrary!  We want to make sure that we got your email right.</p>
                                                                <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Please verify your email by clicking the link below:</p>
                                                                <p><a style="color:#0079f2;text-decoration:none;font-weight:bold" href="http://127.0.0.1:5500/{diisi endpoint frontend}?email=${email}&token=${token}" target="_blank">Verify Now</a></p>
                                                                <p>If you can't click on the link, copy and paste the following URL into a new tab in your browser:</p>
                                                                <p><a href="http://127.0.0.1:3000/{diisi endpoint frontend}?email=${email}&token=${token}" target="_blank">http://127.0.0.1:5500/{diisi endpoint frontend}?email=${email}&token=${token}</a></p>
                                                                <p>Happy coding!</p>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                        </td>
                        <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                    </tr>
                </tbody>
            </table>
        `,
  };
};
export const sendMail = (name: string, email: string, token: string) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(createEmail(name, email, token), (err, info) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`Email sent: ${info.response} `);
        resolve(true);
      }
    });
  });
};

const createEmailForgotPassword = (name: string, email: string, token: string) => {
  return {
    from: config.mailFrom,
    to: email,
    subject: 'MyLibrary APP: Password Reset',
    html: `
          <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%;background-color:#f6f6f6" width="100%" bgcolor="#f6f6f6">
              <tbody>
                  <tr>
                      <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                      <td style="font-family:sans-serif;font-size:14px;vertical-align:top;Margin:0 auto!important;max-width:580px;padding:10px;width:580px" width="580" valign="top">
                          <div style="box-sizing:border-box;display:block;Margin:0 auto;max-width:580px;padding:10px">
                              <span style="color:transparent;display:none;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;width:0">Password Reset</span>
                              <table style="border-collapse:separate;width:100%;background:#fff;border-radius:3px" width="100%">
                                  <tbody>
                                      <tr>
                                          <td style="font-family:sans-serif;font-size:14px;vertical-align:top;box-sizing:border-box;padding:20px" valign="top">
                                              <table border="0" cellpadding="0" cellspacing="0" style="border-collapse:separate;width:100%" width="100%">
                                                  <tbody>
                                                      <tr>
                                                          <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">
                                                              <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">Hi ${name},</p>
                                                              <p style="font-family:sans-serif;font-size:14px;font-weight:normal;Margin:0;Margin-bottom:15px">You have requested to reset your password for MyLibrary APP. Please follow the link below to reset your password:</p>
                                                              <p><a style="color:#0079f2;text-decoration:none;font-weight:bold" href="http://127.0.0.1:5173/${token}" target="_blank">Reset Password</a></p>
                                                              <p style="color:red; font-weight:bold; Margin:0; Margin-bottom:15px">Note: This link is valid for 30 minutes. If not used within this time, the token will expire.</p>
                                                              <p>If you didn't request a password reset, please ignore this email.</p>
                                                              <p>If you can't click on the link, copy and paste the following URL into a new tab in your browser:</p>
                                                              <p><a href="http://127.0.0.1:5173/${token}" target="_blank">http://127.0.0.1:5173/${token} (url ini nanti diganti gmn frontend nya)</a></p>
                                                              <p>Thank you!</p>
                                                          </td>
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                      </td>
                      <td style="font-family:sans-serif;font-size:14px;vertical-align:top" valign="top">&nbsp;</td>
                  </tr>
              </tbody>
          </table>

      `,
  };
};

export const sendMailForgotPassword = (name: string, email: string, token: string) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(createEmailForgotPassword(name, email, token), (err, info) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(`Email sent: ${info.response} `);
        resolve(true);
      }
    });
  });
};
