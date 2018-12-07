
let listing_mouseover = function(listing){
    listing.style.background = "#F5F6F7"
};

let listing_mouseout = function(listing){
    listing.style.background = "#FFFFFF"
};
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

  self.show_past_resume = function() {
      this.show_past_resumes = !this.show_past_resumes;
  };

  self.show_feedback = function() {
      this.show_resume_feedback = !this.show_resume_feedback;
  };


  self.vue = new Vue({
      el: "#vue-div",
      delimiters: ['${', '}'],
      unsafeDelimiters: ['!{', '}'],
      data: {
          show_past_resumes: false,
          show_resume_feedback: false,
      },
      methods: {
          show_past_resume: self.show_past_resume,
          show_feedback: self.show_feedback
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
firebase.initializeApp(config);
