const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
});

async function sendMail($to, $subject, $body) {
    return new Promise((resolve,reject)=>{
        transporter.sendMail({
            from: 'noreply@mygarage.games',
            to: $to,
            subject: $subject,
            text: $body
        }, (error, info) => {
            if(error) {
                console.error(error);
                reject(false);
            } else {
                console.log(info.envelope);
                console.log(info.messageId);
                resolve(true);
            }
        });
    });
}

module.exports = {
    sendMail
}