
// Initialize Firebase
var config = {
  apiKey: "AIzaSyCxdoH5XmTKOXxA37mK_I_gDRi5fkvrXkk",
  authDomain: "resume-rater.firebaseapp.com",
  databaseURL: "https://resume-rater.firebaseio.com",
  projectId: "resume-rater",
  storageBucket: "resume-rater.appspot.com",
  messagingSenderId: "220789866717"
};
firebase.initializeApp(config);
const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);
// This is the js for the default/index.html view.

var app = function() {

  var self = {};

  Vue.config.silent = false; // show all warnings

  // Extends an array
  self.extend = function(a, b) {
    for (var i = 0; i < b.length; i++) {
      a.push(b[i]);
    }
  };

  // Enumerates an array.
  var enumerate = function(arr) {
    var k = 0;
    return arr.map(function(e) {
      e._idx = k++;
    });
  };
  var signUp = function(){
  var e = document.getElementById("email").value;
  var p = document.getElementById("password").value;
  var n = document.getElementById("name").value;
  firebase.auth().createUserWithEmailAndPassword(e, p)
    .then(function(){
      var user = firebase.auth().currentUser;
      user.sendEmailVerification().then(function() {
        console.log("Email Verification Sent");
        // Email sent.
      }).catch(function(error) {
        // An error happened.
        console.log("Error sending Verification Email");
      });
      user.updateProfile({
        //update their display Name
        displayName: n
      }).then(function() {
      // Update successful.
        console.log("Successfully updated profile");
      }).catch(function(error) {
      // An error happened.
        console.log("Error updating profile ", error);
      });
      firestore.collection("users").add({
        name: n,
        email: e
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error making account", errorMessage);
      // ...
    });
}
  self.vue = new Vue({
      el: "#vue-div",
      delimiters: ['${', '}'],
      unsafeDelimiters: ['!{', '}'],
      data: {

      },
      methods: {
        signUp: signUp
      }
  });
  return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function() {
  APP = app();
});
