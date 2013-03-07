define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'topojson',
    'external/d3_geo_greatArcInterpolator',
    'text!../../map_data/world-110.json'
], function($, _, Backbone, d3, topojson, greatArcInterpolator, worldData) {
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
            this.d3el = d3.select(this.el);

            this.render();
        },
        events: {
            'mousedown': 'mouseDown',
            'mousemove': 'mouseMove',
            'mouseup': 'mouseUp',
            'click path': 'goToCountry'
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

            this.drawing = this.d3el.selectAll("path")
                .data(topojson.object(this.worldData, this.worldData.objects['countries-110m']).geometries)
              .enter().append("path")
                .attr({
                    'd': this.path,
                    'class': 'land',
                    'name': function(d) {return d.properties.name;},
                    'centroid': d3.geo.centroid
                });

            this.startRotation();
        },
        goToCountry: function(event) {
            var centroid = $(event.target).attr('centroid').split(','),
                yaw = -parseFloat(centroid[0]),
                pitch = -parseFloat(centroid[1]),
                that = this,
                rotate = greatArcInterpolator(this.roll);
            d3.transition()
                .duration(1250)
                .tween("rotate", function() {
                    rotate.source(that.projection.rotate()).target([yaw, pitch, that.roll]).distance();
                    return function(t) {
                        that.projection.rotate(rotate(t));
                        that.center = [yaw, pitch, that.roll];
                        that.refresh();
                    };
                });
        },
        startRotation: function() {
            this.stopRotating = false;
            var start = Date.now(),
                that = this;

            d3.timer(function() {
                var yawPitchRoll = [that.velocity * (Date.now() - start), 0, that.roll];
                that.center = yawPitchRoll;
                that.projection.rotate(yawPitchRoll);
                that.refresh();
                return that.stopRotating;
            });
        },
        stopRotation: function() {
            this.stopRotating = true;
        },
        refresh: function() {
            this.drawing.attr('d', this.path);
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
            if (this.m0) { /* If mouse is down */
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
