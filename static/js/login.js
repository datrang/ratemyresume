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
const settings = { /* your settings... */
  timestampsInSnapshots: true
};

firestore.settings(settings);
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user);
      document.getElementById("email").innerHTML = user.email;
      document.getElementById("name").innerHTML = user.displayName;
      // User is signed in.
    } else {
      // No user is signed in.
    }
});

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
  var signIn = function() {
    //get the value based on the html
    var e = document.getElementById("loginEmail").value;
    var p = document.getElementById("loginPassword").value;
    //firebase call to login
    firebase.auth().signInWithEmailAndPassword(e, p)
      .then(function() {
        //if it succeeds then do this
        console.log("signed in");
        var user = firebase.auth().currentUser;
        console.log(user.displayName, user.email, user.uid);
        location.href = 'profile';
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log("Error Signing In ", errorMessage);
        document.getElementById("login_error").innerHTML = errorMessage;
        // ...
      });
  };
  //makes sure the fields are filled and correct
  var validateSignUp = function() {
    //get all the input values
    var email = document.getElementById("signEmail").value;
    var confirmEmail = document.getElementById("signConfirmEmail").value;
    var password = document.getElementById("signPassword").value;
    var confirmPassword = document.getElementById("signConfirmPassword").value;
    var name = document.getElementById("signName").value;
    //if the emails do not match send an error
    if (!(email === confirmEmail)) {
      document.getElementById("signError").innerHTML = "Error: Emails Do Not Match";
      return false;
    } else if (!(password === confirmPassword)) {
      document.getElementById("signError").innerHTML = "Error: Passwords Do Not Match";
      return false;
    } else if (name === null || name === '') {
      document.getElementById("signError").innerHTML = "Error: Name field cannot be empty";
      return false;
    } else {
      return true;
    }
  };
  //sign up through firebase
  var signUp = function() {
    //grab input data
    var e = document.getElementById("signEmail").value;
    var p = document.getElementById("signPassword").value;
    var n = document.getElementById("signName").value;
    if (validateSignUp()) {
      //firebase call to make the account
      firebase.auth().createUserWithEmailAndPassword(e, p)
        .then(function() {
          //send the user email a verification
          var user = firebase.auth().currentUser;
          var token = getCurrentUserId();
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
          firestore.collection("users")
          .doc(token)
          .set({
              name: n,
              email: e
            })
            .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
              console.error("Error adding document: ", error);
            });
          // location.href = 'login';
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log("Error making account", errorMessage);
          document.getElementById("signError").innerHTML = errorMessage;
          // ...
        });
    }
  };
  //sends a link to reset their password
  var resetPassword = function() {
    var auth = firebase.auth();
    //get their email address input
    var emailAddress = document.getElementById("forgotEmail").value;
    //firebasecall to send the email
    auth.sendPasswordResetEmail(emailAddress).then(function() {
      console.log("Send Password Reset Link to Email");
      document.getElementById("forgotSuccess").innerHTML = "Email Sent!";
      // Email sent.
    }).catch(function(error) {
      // An error happened.
      console.log("Error sending password reset email ", error);
      document.getElementById("forgotError").innerHTML = error;
    });
  };
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
        var token = getCurrentUserId();
        firestore.collection("users").doc(token).update({
          email: newEmail
        })
        .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        console.log("Successfully Updated Email");
        this.show_email = false;
        refresh();
        document.getElementById("profileSuccess").innerHTML = "Successfully Updated Email";
      })
      .catch(function(error) {
        // An error happened.
        console.log("Error updating email ", error)
        document.getElementById("profileError").innerHTML = error;
      });
    }
  };

  var validatePassword = function(){
    var newP = document.getElementById("newPassword").value;
    var confirm = document.getElementById("confirmPassword").value;
    //all of the fields must be filled
    if(newP == null || confirm == null){
      document.getElementById("profileError").innerHTML = "Must fill fields";
      return false;
    }
    //if the passwords don't match
    else if(!(newP === confirm)){
      document.getElementById("profileError").innerHTML = "Passwords do not match";
      return false;
    }
    //it passes
    else{
      return true;
    }
  }
  var updatePassword = function(){
    var user = firebase.auth().currentUser;
    //instead of this newPassword, get their new one and check
    var newPassword = document.getElementById("newPassword").value;
      if(validatePassword()){
        user.updatePassword(newPassword).then(function() {
          console.log("Successfully updated Password");
          this.show_password = false;
          document.getElementById("profileSuccess").innerHTML = "Success Updated Password";
          // Update successful.
        }).catch(function(error) {
          // An error happened.
          console.log("Error Updating Password ", error);
          document.getElementById("profileError").innerHTML = error;
        });
      }
  }
  var updateProfile = function(){
    //get documentbyId here and update down below
    var user = firebase.auth().currentUser;
    var name = document.getElementById("newName").value;
    user.updateProfile({
      displayName: name,
      // photoURL: "https://example.com/jane-q-user/profile.jpg"
    }).then(function() {
    // Update successful.
      var token = getCurrentUserId();
      firestore.collection("users").doc(token).update({
        name: name
      })
      .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });
      console.log("Successfully updated profile");
      document.getElementById("profileSuccess").innerHTML = "Successfully Updated Name";
      refresh();
      this.show_name = false;
    }).catch(function(error) {
    // An error happened.
      console.log("Error updating profile ", error);
      document.getElementById("profileError").innerHTML = error;
    });
  }
  var reauthenticate = function(){
    var user = firebase.auth().currentUser;
    //get their provided ids
    var credential = firebase.auth.EmailAuthProvider.credential(
        document.getElementById("authEmail").value,
        document.getElementById("authPassword").value
    );
    console.log(credential);
    // Prompt the user to re-provide their sign-in credentials
    user.reauthenticateAndRetrieveDataWithCredential(credential)
    .then(function() {
      // User re-authenticated.
      console.log("Successfully reauthenticated");
      this.edit = true;
      this.need_auth = false;
      document.getElementById("profileSuccess").innerHTML = "Successfully Authorized";
    }).catch(function(error) {
      // An error happened.
      console.log("Error reauthenticating user ", error);
      document.getElementById("profileError").innerHTML = error;
    });
  }
  var deleteUser = function(){
    var user = firebase.auth().currentUser;
    //if there is nothing in the field
    if(!this.authD){
      this.authD = true;
      document.getElementById("profileError").innerHTML = "Click Delete Again To Confirm";
    }
    else{
      user.delete().then(function() {
        console.log("Successfully deleted account");
        location.href='login';
        // User deleted.
      }).catch(function(error) {
        // An error happened.
        console.log("Error deleting account ", error);
        document.getElementById("profileError").innerHTML = error;
      });
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
      document.getElementById("profileError").innerHTML = error;
    });
  };

  var refresh = function (){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          document.getElementById("email").innerHTML = user.email;
          document.getElementById("name").innerHTML = user.displayName;
          // User is signed in.
        } else {
          // No user is signed in.
        }
    });
  };

  let uploadResume = function(){
      let selectedFile = document.getElementById('uploader').files[0];
      let filename = selectedFile.name;
      let storageRef = firebase.storage().ref('/resumes/' + filename);
      let uploadTask = storageRef.put(selectedFile);

      uploadTask.on('state_changed',
          function progress(snapshot){},
          function error(error){},
          function complete(){
          uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('File available at', downloadURL);
              firestore.collection('resumes').doc().set({
                  name:filename,
                  url: downloadURL,
                  user: getCurrentUserId(),
                  upload_time: firebase.firestore.FieldValue.serverTimestamp()
              });
              document.getElementById('uploader').value = "";
          });
      });
  };

  let renderResumeList = function(doc){
      let li = document.createElement('li');
      let name = document.createElement('span');
      let img = document.createElement('img');
      let date = document.createElement('span');

      li.setAttribute('data-id', doc.id);
      name.textContent = doc.data().name;
      img.src = doc.data().url;
      date.textContent = doc.data().upload_time.toDate();

      li.appendChild(name);
      li.appendChild(img);
      li.appendChild(date);

      resume_list.appendChild(li);
  };

  let showResume = function(){
    console.log("Show Resume");
    firestore.collection("resumes").where("user", "==", getCurrentUserId()).get().then((snapshot) =>
        snapshot.docs.forEach(doc => {
            // console.log(doc.data().name);
            // console.log(doc.data().upload_time.toDate());
            // console.log(doc.data().url);
            renderResumeList(doc);
        })
    );

    //     .get().then((snapshot) =>
    //     snapshot.docs.forEach(doc => {
    //         console.log(doc.data());
    //     })
    // );
  };

  var getCurrentUserId = function(){
    return firebase.auth().currentUser.uid;
  };
  var inverse_email = function(){
    this.show_email = !this.show_email;
  }
  var inverse_password = function(){
    this.show_password = !this.show_password;
  }
  var inverse_auth = function(){
    this.need_auth = !this.need_auth;
  }
  var inverse_name = function(){
    this.show_name = !this.show_name;
  }
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
      show_email : false,
      show_password : false,
      show_name : false,
      need_auth : false,
      authD : false
    },
    methods: {
        signIn: signIn,
        signUp: signUp,
        signOut : signOut,
        validateSignUp: validateSignUp,
        resetPassword : resetPassword,
        inverse_auth : inverse_auth,
        inverse_email : inverse_email,
        inverse_password : inverse_password,
        inverse_name : inverse_name,
        reauthenticate : reauthenticate,
        updateEmail : updateEmail,
        updatePassword : updatePassword,
        updateProfile : updateProfile,
        deleteUser : deleteUser,
        uploadResume : uploadResume,
        showResume : showResume
    }
  });

  showResume();
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
