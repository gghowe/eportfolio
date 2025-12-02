/**
 * Expects JSON payload:
 * {
 *   "name": "Sender Name",
 *   "email": "sender@example.com",
 *   "subject": "Subject line",
 *   "message": "Body text",
 *   "confirmEmail": true
 * }
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildJsonResponse_(400, { status: 'error', message: 'No payload received.' });
    }

    var payload = e.postData.contents;
    var data;

    try {
      data = JSON.parse(payload);
    } catch (err) {
      return buildJsonResponse_(400, { status: 'error', message: 'Invalid JSON payload.' });
    }

    var name = (data.name || '').toString().trim();
    var email = (data.email || '').toString().trim();
    var subject = (data.subject || '').toString().trim();
    var message = (data.message || '').toString().trim();
    var confirmEmail = !!data.confirmEmail;

    if (!name || !email || !subject || !message) {
      return buildJsonResponse_(400, {
        status: 'error',
        message: 'Missing one or more required fields: name, email, subject, message.'
      });
    }

    // TODO: change this to the address you want to receive contact form emails at.
    var RECIPIENT = Session.getActiveUser().getEmail() || 'ghowe050+contactme@gmail.com';

    var mailSubject = '[ePortfolio Contact] ' + subject;
    var mailBody =
      'You received a new message from your ePortfolio contact form.\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Subject: ' + subject + '\n\n' +
      'Message:\n' + message + '\n';

    GmailApp.sendEmail(RECIPIENT, mailSubject, mailBody, {
      replyTo: email
    });

    // Optionally send confirmation email back to the sender
    if (confirmEmail) {
      var confirmSubject = 'I received your message';
      var confirmBody =
        'Hi ' + name + ',\n\n' +
        'Thanks for reaching out through my ePortfolio contact form. I\'ve received your message and will follow up as soon as I can.\n\n' +
        'Here\'s a copy of what you sent:\n\n' +
        'Subject: ' + subject + '\n\n' +
        'Message:\n' + message + '\n\n' +
        '- Garrett';

      GmailApp.sendEmail(email, confirmSubject, confirmBody, {
        replyTo: RECIPIENT
      });
    }

    return buildJsonResponse_(200, { status: 'success', message: 'Email sent successfully.' });
  } catch (err) {
    return buildJsonResponse_(500, { status: 'error', message: 'Server error: ' + err });
  }
}

function buildJsonResponse_(statusCode, obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

  // Apps Script Web Apps don't let us set real HTTP status codes here,
  // but we include it in the JSON for debugging on the client.
  return output;
}


