
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
  // Sign In Through Firebase
  var signIn = function(){
    //get the value based on the html
    var e = document.getElementById("email").value;
    var p = document.getElementById("password").value;
    //firebase call to login
    firebase.auth().signInWithEmailAndPassword(e, p)
    .then(function(){
      //if it succeeds then do this
      console.log("signed in");
      var user = firebase.auth().currentUser;
      console.log( user.displayName, user.email, user.uid);
      location.href='hub';
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log("Error Signing In ", errorMessage);
      document.getElementById("error_message").innerHTML = errorMessage;
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
          signIn : signIn
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
