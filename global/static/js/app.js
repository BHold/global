require.config({
    paths: {
        jquery: 'external/jquery',
        underscore: 'external/underscore',
        backbone: 'external/backbone',
        d3: 'external/d3',
        topojson: 'external/topojson'
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        d3: {
            exports: 'd3'
        },
        topojson: {
            exports: 'topojson'
        },
    }
});

require(['underscore', 'backbone'], function(_, Backbone) {
    Backbone.history.start({pushState: true});
});
