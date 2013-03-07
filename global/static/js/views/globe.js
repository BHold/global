define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'topojson',
    'text!../../map_data/world-110.json'
], function($, _, Backbone, d3, topojson, worldData) {
    var GlobeView = Backbone.View.extend({
        el: 'svg',
        initialize: function() {
            this.worldData = JSON.parse(worldData);
            this.width = this.$el.width();
            this.height = this.$el.height();
            this.roll = -23.44;
            this.center = [0, 0, this.roll];
            this.m0 = null;
            this.velocity = .01;

            this.render();
        },
        events: {
            'mousedown': 'mouseDown',
            'mousemove': 'mouseMove',
            'mouseup': 'mouseUp'
        },
        render: function() {
            this.createGlobe();

            return this;
        },
        createGlobe: function() {
            this.projection = d3.geo.orthographic()
                .scale(Math.min(this.height, this.width) * .45)
                .translate([this.width / 2, this.height /2])
                .rotate(this.center)
                .clipAngle(90);

            this.path = d3.geo.path().projection(this.projection);

            this.drawing = d3.select(this.el).selectAll("path")
                .data(topojson.object(this.worldData, this.worldData.objects['countries-110m']).geometries)
              .enter().append("path")
                .attr("d", this.path);

            this.startRotation();
        },
        startRotation: function() {
            this.stopRotating = false;
            var start = Date.now(),
                that = this;

            d3.timer(function() {
                var yawPitchRoll = [that.velocity * (Date.now() - start), 0, that.roll];
                that.projection.rotate(yawPitchRoll);
                that.center = yawPitchRoll;
                that.refresh();
                return that.stopRotating;
            });
        },
        stopRotation: function() {
            this.stopRotating = true;
        },
        refresh: function() {
            this.drawing.attr("d", this.path);
        },
        mouseDown: function(event) {
            this.m0 = [event.pageX, event.pageY];
            if (!this.stopRotating) {
                this.stopRotation();
            }
        },
        mouseUp: function() {
            if (this.m0) {
                this.m0 = null;
            }
        },
        mouseMove: function(event) {
            if (this.m0) {
                var m1 = [event.pageX, event.pageY];
                this.center = [this.center[0] - (this.m0[0] - m1[0]) / 8, this.center[1] + (this.m0[1] - m1[1]) / 8, this.roll];
                this.projection.rotate(this.center);
                this.m0 = m1;
                this.refresh();
            }
        },
    });

    return GlobeView;
});
