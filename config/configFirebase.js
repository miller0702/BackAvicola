const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    storageBucket: "appavicola-fc91e.appspot.com",
  });
}

const bucket = admin.storage().bucket();

module.exports = {
  admin,
  bucket,
};
