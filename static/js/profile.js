
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

window.onload = function(){
  var user = firebase.auth().currentUser;
  console.log("on load : " , user.email);
  if (user != null) {
    document.getElementById("name").innerHTML = user.displayName;
    document.getElementById("email").innerHTML = user.email;
    uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                     // this value to authenticate with your backend server, if
                     // you have one. Use User.getToken() instead.
  }
}
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
      document.getElementById("success_message").innerHTML = "Successfully Updated Name";
    }).catch(function(error) {
    // An error happened.
      console.log("Error updating profile ", error);
      document.getElementById("error_message").innerHTML = error;
    });
  }
  var updateEmail = function(){
    //get documentbyId ref to the new email in profile
    var user = firebase.auth().currentUser;
    var newEmail = document.getElementById("newEmail").value;
    console.log(newEmail);
    if(newEmail == null){
      document.getElementById("error_message").innerHTML = "Must Type A Valid Email";
    }
    else {
      user.updateEmail(newEmail)
      .then(function() {
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
        this.show_email = false;
        document.getElementById("success_message").innerHTML = "Successfully Updated Email";
      })
      .catch(function(error) {
        // An error happened.
        console.log("Error updating email ", error)
        document.getElementById("error_message").innerHTML = error;
      });
    }
  }
  var updatePassword = function(){
    var user = firebase.auth().currentUser;
    //instead of this newPassword, get their new one and check
    var newPassword = document.getElementById("newPassword").value;
      if(validatePassword()){
        user.updatePassword(newPassword).then(function() {
          console.log("Successfully updated Password");
          document.getElementById("success_message").innerHTML = "Success Updated Password";
          // Update successful.
        }).catch(function(error) {
          // An error happened.
          console.log("Error Updating Password ", error);
          document.getElementById("error_message").innerHTML = error;
        });
      }
  }
  var validatePassword = function(){
    var newP = document.getElementById("newPassword").value;
    var confirm = document.getElementById("confirmPassword").value;
    //all of the fields must be filled
    if(newP == null || confirm == null){
      document.getElementById("error_message").innerHTML = "Must fill fields";
      return false;
    }
    //if the passwords don't match
    else if(!(newP === confirm)){
      document.getElementById("error_message").innerHTML = "Passwords do not match";
      return false;
    }
    //it passes
    else{
      return true;
    }
  }
  var signOut = function(){
    firebase.auth().signOut()
    .then(function() {
      console.log("Signed Out");
      location.href='login';
    // Sign-out successful.
    }).catch(function(error) {
      // An error happened.
      console.log("Error signing out: ", error);
    });
  }

  var deleteUser = function(){
    var user = firebase.auth().currentUser;
    //if there is nothing in the field
    if(!this.authD){
      this.authD = true;
      document.getElementById("error_message").innerHTML = "Click Delete Again To Confirm";
    }
    else{
      user.delete().then(function() {
        console.log("Successfully deleted account");
        location.href='login';
        // User deleted.
      }).catch(function(error) {
        // An error happened.
        console.log("Error deleting account ", error);
      });
    }
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
        document.getElementById("inEmail").value,
        document.getElementById("inPassword").value
    );
    console.log(credential);
    // Prompt the user to re-provide their sign-in credentials
    user.reauthenticateAndRetrieveDataWithCredential(credential)
    .then(function() {
      // User re-authenticated.
      console.log("Successfully reauthenticated");
      this.edit = true;
      this.need_auth = false;
      document.getElementById("success_message").innerHTML = "Successfully Authorized";
    }).catch(function(error) {
      // An error happened.
      console.log("Error reauthenticating user ", error);
      document.getElementById("error_message").innerHTML = error;
    });
  }
  var inverse_email = function(){
    this.show_email = !this.show_email;
  }
  var inverse_password = function(){
    this.show_password = !this.show_password;
  }
  var inverse_name = function(){
    this.show_name = !this.show_name;
  }
  var inverse_auth = function(){
    this.need_auth = !this.need_auth;
  }
  self.vue = new Vue({
      el: "#vue-div",
      delimiters: ['${', '}'],
      unsafeDelimiters: ['!{', '}'],
      data: {
        show_all : true,
        show_email : false,
        show_password : false,
        show_name : false,
        authD : false,
        edit : false,
        need_auth : false
      },
      methods: {
          updateProfile : updateProfile,
          updateEmail : updateEmail,
          updatePassword : updatePassword,
          signOut : signOut,
          deleteUser : deleteUser,
          reauthenticate : reauthenticate,
          inverse_email : inverse_email,
          inverse_password : inverse_password,
          inverse_name : inverse_name,
          inverse_auth : inverse_auth
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
