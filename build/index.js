"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _sendgrid = require('sendgrid');

var _sendgrid2 = _interopRequireDefault(_sendgrid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var replacePlaceHolder = function replacePlaceHolder(text, options) {
  return text.replace(/%email%/g, options.user.get("email")).replace(/%username%/g, options.user.get("firstname")).replace(/%appname%/g, options.appName).replace(/%link%/g, options.link);
};

var MailTemplateAdapter = function MailTemplateAdapter(mailOptions) {
  if (!mailOptions || !mailOptions.adapter) {
    throw 'MailTemplateAdapter requires an adapter.';
  }
  var adapter = mailOptions.adapter;
  var sendgrid = (0, _sendgrid2.default)(mailOptions.apiKey);
  if (!mailOptions.template) {
    return adapter;
  }

  var customeized = {};

  if (mailOptions.template.verification) {
    var verification = mailOptions.template.verification;

    if (!verification.subject) {
      throw 'MailTemplateAdapter verification requires subject.';
    }
    var verificationSubject = verification.subject;
    var verificationText = "";

    if (verification.body) {
      verificationText = verification.body;
    } else if (verification.bodyFile) {
      verificationText = _fs2.default.readFileSync(verification.bodyFile, "utf8");
    } else {
      throw 'MailTemplateAdapter verification requires body.';
    }

    customeized.sendVerificationEmail = function (options) {
      var _this = this;

        return new Promise(function (resolve, reject) {
     var to = options.user.get("email");
           var text = replacePlaceHolder(verificationText, options);
           var subject = replacePlaceHolder(verificationSubject, options);
             sendgrid.send({
                from: mailOptions.from,
                to: to,
                subject: subject,
                html: text
              }, function (err, json) {
              if (err) {
                  reject(err);
              }
              resolve(json);
              });
      });
    };
}

  if (mailOptions.template.resetPassword) {
    var resetPassword = mailOptions.template.resetPassword;

    if (!resetPassword.subject) {
      throw 'MailTemplateAdapter resetPassword requires subject.';
    }
    var resetPasswordSubject = resetPassword.subject;
    var resetPasswordText = "";

    if (resetPassword.body) {
      resetPasswordText = resetPassword.body;
    } else if (resetPassword.bodyFile) {
      resetPasswordText = _fs2.default.readFileSync(resetPassword.bodyFile, "utf8");
    } else {
      throw 'MailTemplateAdapter resetPassword requires body.';
    }

    customeized.sendPasswordResetEmail = function (options) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {

        var to = options.user.get("email");
        var text = replacePlaceHolder(resetPasswordText, options);
        var subject = replacePlaceHolder(resetPasswordSubject, options);

        _this2.sendMail({ text: text, to: to, subject: subject }).then(function (json) {
          resolve(json);
        }, function (err) {
          reject(err);
        });
      });
    };
  }

  return Object.freeze({
    sendVerificationEmail: customeized.sendVerificationEmail,
    sendPasswordResetEmail: customeized.sendPasswordResetEmail,
    sendMail: customeized.sendVerificationEmail
  });
};

module.exports = MailTemplateAdapter;
