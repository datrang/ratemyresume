// This is the js for the default/hub.html view.
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
var firestore = firebase.firestore();
//=====================FIREBASE====================
const docRef = firestore.doc("users/pH4XWMHoEgKvlgcm8r9d");
const header = document.querySelector("#test");
const feedback = document.querySelector("#feedbackButton");
feedback.addEventListener("click", function(){
  console.log("I am going to save into firestore");
  docRef.set({
    name: "Hello"
  });
})
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
  self.show_past = function() {
    this.show_past_resumes = !this.show_past_resumes;
  };
  self.redirect_feedback = function() {
    redirect(URL('default', 'feedback'));
  };
  // Complete as needed.
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    data: {
      show_past_resumes: false,
    },
    methods: {
      show_past: self.show_past,
      redirect_feedback : self.redirect_feedback
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
