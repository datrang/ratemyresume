let app = function() {
    let self = {};

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {

        },
        methods: {

        }
    });

    if(is_logged_in){
        $("#profile_section").show();
    }

    return self
};



let APP = null;

jQuery(function(){
   APP = app();
});