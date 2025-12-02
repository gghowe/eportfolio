/**
 * Expects JSON payload:
 * {
 *   "name": "Sender Name",
 *   "email": "sender@example.com",
 *   "subject": "Subject line",
 *   "message": "Body text"
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


