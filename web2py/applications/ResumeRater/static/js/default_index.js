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
        var k=0; return arr.map(function(e) {
            e._idx = k++;
        });
    };

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy 
        var sent_content = self.vue.form_content; //
        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content,
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                // Adds the post to the list of posts.
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_content: sent_content,
                    reply_list: [],
                    is_author: true
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        self.vue.form_state = false;
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                // console.log("I got my list");
            }
        );
        // console.log("I fired the get");
    };

    self.process_posts = function() {
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like.

        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            Vue.set(e, 'hover', null);
            Vue.set(e, 'editing', false);
            Vue.set(e, 'show_reply', e.show_reply);
            Vue.set(e, '_thumb_count',e.thumb_count);
            Vue.set(e, 'add_reply', false);
            Vue.set(e, 'form_reply_content', "");
            enumerate(e.reply_list);
            e.reply_list.map(function (f) {
               Vue.set(f, 'reply_editing', false)
            });
        });
    };

    //This processes the mouse click and changes the thumb state for the current user
    // and it also post the value to the database
    self.thumb_mouseclick = function (post_idx, thumbState) {
        var p = self.vue.post_list[post_idx];

        if(p.thumb == 'u'){
            if(thumbState == 'u'){
                p.thumb = null;
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: null,
                });
            }else{
                p.thumb = 'd'
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: 'd',
                });
            }
        }else if(p.thumb == 'd'){
            if(thumbState == 'd'){
                p.thumb = null;
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: null,
                });
            }else{
                p.thumb = 'u';
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: 'u',

                });
            }
        }else{
            p.thumb = thumbState;
            if(thumbState == 'u'){
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: 'u',
                });
            }else{
                $.post(set_thumb_url, {
                    post_id: p.id,
                    thumb_state: 'd',
                });
            }
        }
    };

     // This changes the thumbCount based on the current user's choice
     self.thumb_count = function(thumbCount, thumbState){
         // console.log(thumbCount)
        if(thumbState == 'u'){
            if(thumbCount == null){
                return 1
            }else{
                return thumbCount+ 1;
            }
        }else if(thumbState == 'd'){
            if(thumbCount == null){
                return -1
            }else{
                return thumbCount - 1;
            }
        }else{
            if(thumbCount == null){
                return 0
            }else{
                return thumbCount;
            }
        }
    }

    // This changes the hover value when you hover over a thumb
    self.thumb_mouseover = function (post_idx, thumbState) {
        // When we mouse over something, the face has to assume the opposite
        // of the current state, to indicate the effect.
        var p = self.vue.post_list[post_idx];
        // console.log(p.hover);
        if(thumbState == 'u'){
            p.hover = 'u'
        }else if(thumbState == 'd'){
            p.hover = 'd'
        }
    };

     // When you take your mouse off the thumb, it'll change it back to default
    self.thumbs_mouseout = function (post_idx) {
        // Out of the star rating; set number of visible back to rating.
        var p = self.vue.post_list[post_idx];
        p.hover = null;
    };

    // This click function for when you want to edit your post
    self.show_edit_post_button = function (post_idx){
        var p = self.vue.post_list[post_idx];
        p.editing = true;
    };

    self.submit_edit = function (post_idx, content){
        var p = self.vue.post_list[post_idx];
        var post_content = content;
        $.post(edit_post_url, {
            post_id:  p.id,
            post_content: post_content
        });
        p.editing =false;
    }

    self.show_reply_button = function (post_idx){
        var p = self.vue.post_list[post_idx];
        if(p.show_reply == true){
            p.show_reply = false;
            p.add_reply = false;
        }else{
            p.show_reply = true;
        }
    }

    self.add_reply_button = function (post_idx){
        var p = self.vue.post_list[post_idx];
        p.add_reply = true;
    }

    self.submit_reply_button = function (post_idx, content){
        var p = self.vue.post_list[post_idx];
        var reply_content = content
        $.post(add_reply_url, {
            reply_content: reply_content,
            post_id: p.id
        },
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-reply"));
                // Clears the form.
                p.form_reply_content = "";
                // Adds the reply to the list of replies.
                var new_reply = {
                    id: data.reply_id,
                    post_id: p.id,
                    reply_content: reply_content,
                    is_author: true
                };
                p.reply_list.push(new_reply);
                // We re-enumerate the array.
                self.process_posts();
        });
        p.add_reply = false;
    }

    self.open_reply_edit_button = function(post_idx, reply_idx){
        // console.log(reply_idx);
        var p = self.vue.post_list[post_idx];
        p.reply_list[reply_idx].reply_editing = true;
        // console.log(p)
    }

    self.submit_reply_edit_button = function(post_idx, reply_idx, content){
        console.log(content)
        var p = self.vue.post_list[post_idx];
        var reply = p.reply_list[reply_idx];
        $.post(edit_reply_url, {
            post_id: p.id,
            reply_id: reply.id,
            reply_content: content
        });
        p.reply_list[reply_idx].reply_editing = false;
    }

    // The click function for when you want to show the form
    self.show_form = function(){
        self.vue.form_state = true;
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            post_list: [],
            thumb: "",
            form_state: false,
            post_content: ""
        },
        methods: {
            add_post: self.add_post,
            thumb_mouseover: self.thumb_mouseover,
            thumb_mouseout: self.thumbs_mouseout,
            thumb_mouseclick: self.thumb_mouseclick,
            thumb_count: self.thumb_count,
            show_form: self.show_form,
            show_edit_post_button: self.show_edit_post_button,
            submit_edit: self.submit_edit,
            show_reply_button: self.show_reply_button,
            add_reply_button: self.add_reply_button,
            submit_reply_button: self.submit_reply_button,
            open_reply_edit_button: self.open_reply_edit_button,
            submit_reply_edit_button:self.submit_reply_edit_button
        }
    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();
    }

    // Gets the posts.
    self.get_posts();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
