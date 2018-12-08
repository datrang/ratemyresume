
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
  //makes sure the fields are filled and correct
  var validateFields = function(){
    //get all the input values
    var email = document.getElementById("email").value;
    var confirmEmail = document.getElementById("confirmEmail").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var name = document.getElementById("name").value;
    //if the emails do not match send an error
    if(!(email === confirmEmail)){
      document.getElementById("error_message").innerHTML = "Error: Emails Do Not Match";
      return false;
    }
    else if(!(password=== confirmPassword)){
      document.getElementById("error_message").innerHTML = "Error: Passwords Do Not Match";
      return false;
    }
    else if(name === null || name === ''){
      document.getElementById("error_message").innerHTML = "Error: Name field cannot be empty";
      return false;
    }
    else{ return true; }
  }
  //sign up through firebase
  var signUp = function(){
    //grab input data
    var e = document.getElementById("email").value;
    var p = document.getElementById("password").value;
    var n = document.getElementById("name").value;
    if(validateFields()){
      //firebase call to make the account
      firebase.auth().createUserWithEmailAndPassword(e, p)
        .then(function(){
          //send the user email a verification
          var user = firebase.auth().currentUser;
          user.sendEmailVerification().then(function() {
            console.log("Email Verification Sent");
            // Email sent.
          }).catch(function(error) {
            // An error happened.
            console.log("Error sending Verification Email");
          });
          //update their display name in their user property
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
          //add their user info into the database
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
          location.href='login';
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Error making account", errorMessage);
          document.getElementById("error_message").innerHTML = errorMessage;
          // ...
        });
      }
  }
  self.vue = new Vue({
      el: "#vue-div",
      delimiters: ['${', '}'],
      unsafeDelimiters: ['!{', '}'],
      data: {

      },
      methods: {
        signUp: signUp,
        validateFields : validateFields
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
