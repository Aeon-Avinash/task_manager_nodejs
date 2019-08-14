const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "support@services.taskmanager.com",
    subject: "Thanks for joining taskManager!",
    html: `<p>Welcome onboard ${name},</p>
    </p>Let me know how you get along with the app.</p>
    <br />
    <strong>Do not hesitate to reach out to us for any query with the app.</strong>
    <br />
    <p>Thanks</p>
    <p>Team taskManager</p>`
  });
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "support@services.taskmanager.com",
    subject: "We are sad to let you go! Kindly give some feedback",
    html: `<p>Hi ${name},</p>
    </p>We have enjoyed our journey together on the app platform with you as our valuable user.</p>
    <br/>
    <strong>We appreciate your decision to discontinue with our app, but we greatly welcome your feedback in knowing what we could have done to retain you as our user and to improve our overall service.</strong>
    <br/>
    <p>P.S. You will not be receiving further mails from our customer-service team.</p>
    <br/>
    <p>Thanks</p>
    <p>Team taskManager</p>`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
};
