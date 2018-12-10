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
    let profileTab = document.getElementById("profileTab");
    let loginTab = document.getElementById("loginTab");
    let hubTab = document.getElementById("hubTab");
    let rateTab = document.getElementById("rateTab");
    let reviewTab = document.getElementById("reviewTab");
    let email = document.getElementById("email");
    let name = document.getElementById("name");
    loading.style.display = "block";
    doneLoading.style.display = "none";
    if (user) {
      if(email != null && name != null){
        document.getElementById("email").innerHTML = user.email;
        document.getElementById("name").innerHTML = user.displayName;
      }
      profileTab.style.display = "block";
      hubTab.style.display = "block";
      reviewTab.style.display = "block";
      rateTab.style.display = "block";
      loginTab.style.display = "none";
      // User is signed in.
    } else {
      // No user is signed in."
      profileTab.style.display = "none";
      hubTab.style.display = "none";
      reviewTab.style.display = "none";
      rateTab.style.display = "none";
      loginTab.style.display = "block";
    }
    loading.style.display = "none";
    doneLoading.style.display = "block";
});

let listing_mouseover = function(listing){
    listing.style.background = "#F5F6F7"
};

let listing_mouseout = function(listing){
    listing.style.background = "#FFFFFF"
};

let app = function() {

  let self = {};

  Vue.config.silent = false; // show all warnings

  // Extends an array
  self.extend = function(a, b) {
    for (var i = 0; i < b.length; i++) {
      a.push(b[i]);
    }
  };

  // Enumerates an array.
  let enumerate = function(arr) {
    let k = 0;
    return arr.map(function(e) {
      e._idx = k++;
    });
  };

  // Sign In Through Firebase
  let signIn = function() {
    //get the value based on the html
    var e = document.getElementById("loginEmail").value;
    var p = document.getElementById("loginPassword").value;
    //firebase call to login
    firebase.auth().signInWithEmailAndPassword(e, p)
      .then(function() {
        //if it succeeds then do this
        console.log("signed in");
        let user = firebase.auth().currentUser;
        console.log(user.displayName, user.email, user.uid);
        location.href = 'profile';
      })
      .catch(function(error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        console.log("Error Signing In ", errorMessage);
        document.getElementById("login_error").innerHTML = errorMessage;
        // ...
      });
  };

  //makes sure the fields are filled and correct
  let validateSignUp = function() {
    //get all the input values
    let email = document.getElementById("signEmail").value;
    let confirmEmail = document.getElementById("signConfirmEmail").value;
    let password = document.getElementById("signPassword").value;
    let confirmPassword = document.getElementById("signConfirmPassword").value;
    let name = document.getElementById("signName").value;
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
  let signUp = function() {
    //grab input data
    let e = document.getElementById("signEmail").value;
    let p = document.getElementById("signPassword").value;
    let n = document.getElementById("signName").value;
    if (validateSignUp()) {
      //firebase call to make the account
      firebase.auth().createUserWithEmailAndPassword(e, p)
        .then(function() {
          //send the user email a verification
          let user = firebase.auth().currentUser;
          let token = getCurrentUserId();
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
              email: e,
              uid: token
            })
            .then(function(docRef) {
              console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
              console.error("Error adding document: ", error);
            });
          location.href = 'hub';
        })
        .catch(function(error) {
          // Handle Errors here.
          let errorCode = error.code;
          let errorMessage = error.message;
          console.log("Error making account", errorMessage);
          document.getElementById("signError").innerHTML = errorMessage;
          // ...
        });
    }
  };
  //sends a link to reset their password

  let resetPassword = function() {
    let auth = firebase.auth();
    //get their email address input
    let emailAddress = document.getElementById("forgotEmail").value;
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

  let updateEmail = function(){
    //get documentbyId ref to the new email in profile
    let user = firebase.auth().currentUser;
    let newEmail = document.getElementById("newEmail").value;
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

  let validatePassword = function(){
    let newP = document.getElementById("newPassword").value;
    let confirm = document.getElementById("confirmPassword").value;
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
  };

  let updatePassword = function(){
    let user = firebase.auth().currentUser;
    //instead of this newPassword, get their new one and check
    let newPassword = document.getElementById("newPassword").value;
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
  };

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

  // let updateProfile = function(){
  //   //get documentbyId here and update down below
  //   let user = firebase.auth().currentUser;
  //   let name = document.getElementById("newName").value;
  //   user.updateProfile({
  //     displayName: name,
  //     // photoURL: "https://example.com/jane-q-user/profile.jpg"
  //   }).then(function() {
  //       // Update successful.
  //       let token = getCurrentUserId();
  //       firestore.collection("users").where("uid", "==", token).limit(1).get().then((snapshot) =>
  //           snapshot.docs.forEach(doc => {
  //               doc.update({
  //                   name: name
  //               }).then(function(doc){
  //                   console.log("Document written with ID: ", docRef.id);
  //               }).catch(function(error){
  //                   console.error("Error adding document: ", error);
  //               });
  //               console.log("Successfully updated profile");
  //               document.getElementById("profileSuccess").innerHTML = "Successfully Updated Name";
  //               refresh();
  //               this.show_name = false;
  //           }))
  //   }).catch(function(error) {
  //       console.log("Error updating profile ", error);
  //       document.getElementById("profileError").innerHTML = error;
  //   });
  //
  //   //   userRef.update({
  //   //     name: name
  //   //   })
  //   //   .then(function(docRef) {
  //   //     console.log("Document written with ID: ", docRef.id);
  //   //   })
  //   //   .catch(function(error) {
  //   //       console.error("Error adding document: ", error);
  //   //   });
  //   //   console.log("Successfully updated profile");
  //   //   document.getElementById("profileSuccess").innerHTML = "Successfully Updated Name";
  //   //   refresh();
  //   //   this.show_name = false;
  //   // }).catch(function(error) {
  //   // // An error happened.
  //   //   console.log("Error updating profile ", error);
  //   //   document.getElementById("profileError").innerHTML = error;
  //   // });
  // };

  let reauthenticate = function(){
    let user = firebase.auth().currentUser;
    //get their provided ids
    let credential = firebase.auth.EmailAuthProvider.credential(
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
  };

  let deleteUser = function(){
    let user = firebase.auth().currentUser;
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
  };

  let signOut = function(){
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

  let refresh = function () {
      firebase.auth().onAuthStateChanged(function (user) {
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
      let resume = document.createElement('iframe');
      let date = document.createElement('span');

      li.setAttribute('data-id', doc.id);
      name.textContent = doc.data().name;
      resume.src = doc.data().url;
      date.textContent = doc.data().upload_time.toDate();

      li.appendChild(name);
      li.appendChild(resume);
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
  };

  let checkLogin = function(){
      firebase.auth().onAuthStateChanged(function(user) {
          let profileTab = document.getElementById("profileTab");
          let loginTab = document.getElementById("loginTab");
          if (user) {
            document.getElementById("email").innerHTML = user.email;
            document.getElementById("name").innerHTML = user.displayName;
            profileTab.style.display = "block";
            loginTab.style.display = "none";
            // User is signed in.
          } else {
            // No user is signed in."
            profileTab.style.display = "none";
            loginTab.style.display = "block";
          }
      });
  };


  let getCurrentUserId = function(){
    return firebase.auth().currentUser.uid;
  };

  let inverse_email = function(){
    this.show_email = !this.show_email;
  };

  let inverse_password = function(){
    this.show_password = !this.show_password;
  };

  let inverse_auth = function(){
    this.need_auth = !this.need_auth;
  };

  let inverse_name = function(){
    this.show_name = !this.show_name;
  };

  let show_past_resume = function() {
      this.show_past_resumes = !this.show_past_resumes;
  };

  let show_feedback = function() {
      this.show_resume_feedback = !this.show_resume_feedback;
  };
  let home_upload_button = function(){
    var user = firebase.auth().currentUser;
     if(user != null){
       location.href = 'hub';
     }
     else{
       location.href = 'signUp';
     }
   };
   let home_login_button = function(){
     var user = firebase.auth().currentUser;
      if(user != null){
        location.href = 'hub';
      }
      else{
        location.href = 'login';
      }
    };

  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
      show_email : false,
      show_password : false,
      show_name : false,
      need_auth : false,
      authD : false,
      show_past_resumes: false,
      show_resume_feedback: false,
      is_logged_in : false
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
        showResume : showResume,
        checkLogin : checkLogin,
        show_past_resume: show_past_resume,
        show_feedback: show_feedback,
        home_upload_button : home_upload_button,
        home_login_button : home_login_button
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
