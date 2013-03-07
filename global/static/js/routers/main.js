define([
    'jquery',
    'underscore',
    'backbone',
    'views/globe'
], function($, _, Backbone, GlobeView) {
    var Router = Backbone.Router.extend({
        initialize: function() {
            this.globeView = new GlobeView();
            Backbone.history.start({pushState: true});
        },

        routes: {
            "": "main",
            ":user": "userPage",
            ":user/:country": "userCountryPage",
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
