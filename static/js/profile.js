
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
  var updateProfile = function(){
    //get documentbyId here and update down below
    var user = firebase.auth().currentUser;
    var name = document.getElementById("name").value;
    user.updateProfile({
      displayName: name,
      // photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function() {
    // Update successful.
      console.log("Successfully updated profile");
    }).catch(function(error) {
    // An error happened.
      console.log("Error updating profile ", error);
    });
  }
  var updateEmail = function(){
    //get documentbyId ref to the new email in profile
    var user = firebase.auth().currentUser;
    var email = document.getElementById("email").value;
    user.updateEmail(email).then(function() {
      // Update successful.
      firestore.collection("users").getCurrentUserId().update({
        email: e
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
      console.log("Successfully Updated Email");
    }).catch(function(error) {
      // An error happened.
      console.log("Error updating email ", error)
    });
  }
  var updatePassword = function(){
    var user = firebase.auth().currentUser;
    //instead of this newPassword, get their new one and check
    var newPassword = getASecureRandomPassword();
    user.updatePassword(newPassword).then(function() {
      console.log("Successfully updated Password");
      // Update successful.
    }).catch(function(error) {
      // An error happened.
      console.log("Error Updating Password ", error);
    });
  }
  var signOut = function(){
    firebase.auth().signOut()
    .then(function() {
      console.log("Signed Out");
    // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
      console.log("Error signing out: ", error);
    });
  }

  var deleteUser = function(){
    var user = firebase.auth().currentUser;
    user.delete().then(function() {
      console.log("Successfully deleted account");
      // User deleted.
    }).catch(function(error) {
      // An error happened.
      console.log("Error deleting account ", error);
    });
  }
  //Some security-sensitive actions—such as deleting an account, setting a primary email
  //address, and changing a password—require that the user has recently signed in.
  //If you perform one of these actions, and the user signed in too long ago, the action
  //fails with an error. When this happens, re-authenticate the user by getting new sign-in
  //credentials from the user and passing the credentials to reauthenticateWithCredential
  var reauthenticate = function(){
    var user = firebase.auth().currentUser;
    //get their provided ids
    var credential = firebase.auth.EmailAuthProvider.credential(
        document.getElementById("email").value,
        document.getElementById("password").value
    );
    console.log(credential);
    // Prompt the user to re-provide their sign-in credentials
    user.reauthenticateAndRetrieveDataWithCredential(credential).then(function() {
      // User re-authenticated.
      console.log("Successfully reauthenticated");
    }).catch(function(error) {
      // An error happened.
      console.log("Error reauthenticating user ", error);
    });
  }
  self.vue = new Vue({
      el: "#vue-div",
      delimiters: ['${', '}'],
      unsafeDelimiters: ['!{', '}'],
      data: {

      },
      methods: {
          updateProfile : updateProfile,
          updateEmail : updateEmail,
          updatePassword : updatePassword,
          signOut : signOut,
          deleteUser : deleteUser,
          reauthenticate : reauthenticate
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
