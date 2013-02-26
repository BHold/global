define(["jquery", "underscore", "backbone", "models/picture"], function($, _, Backbone, Picture) {
    var Pictures = Backbone.Collection.extend({
        model: Picture
    });

    return Pictures;
});
