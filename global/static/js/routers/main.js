define([
    'jquery',
    'underscore',
    'backbone',
], function($, _, Backbone) {
    var Router = Backbone.Router.extend({
        routes: {
            "": "main",
            ":user": "userPage",
            ":user/:country", "userCountryPage",
            "picture/:id": "picture"
        },

        main: function() {
        },

        userPage: function(user) {
        },

        userCountryPage: function(user, country) {
        },

        picture: function(picture) {
        }
    });

    return Router;
});
