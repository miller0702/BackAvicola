const admin = require('firebase-admin');
const serviceAccount = require('./google-services.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "appavicola-fc91e.appspot.com",
  });
}

const bucket = admin.storage().bucket();

module.exports = {
  admin,
  bucket,
};
