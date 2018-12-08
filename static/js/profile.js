let app = function() {
    let self = {};

    Vue.config.silent = false; // show all warnings

    // Gets users in the database, and the current user
    self.get_users = function(){
        $.getJSON(get_users_url,
            function(data){
            self.vue.users = data.users;
            self.vue.current_user = data.current_user;
        });
    };

    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            users: [],
            current_user: null
        },
        methods: {
            get_users: self.get_users
        }
    });

    if(is_logged_in){
        $("#profile_section").show();
    }

    self.get_users();
    return self
};



let APP = null;

jQuery(function(){
   APP = app();
});