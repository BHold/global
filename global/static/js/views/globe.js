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
            this.globeScale = Math.min(this.height, this.width) * 0.45,
            this.globalRoll = -23.44;
            this.m0 = null;
            this.velocity = .01;
            this.d3el = d3.select(this.el);
            this.hasPlaceLabels = false;

            this.render();
        },
        events: {
            'mousedown': 'mouseDown',
            'mousemove': 'mouseMove',
            'mouseup': 'mouseUp',
            'click path': 'goToCountry',
            'dblclick': 'goToGlobe'
        },
        render: function() {
            this.createGlobe();

            return this;
        },
        createGlobe: function() {
            this.projection = d3.geo.orthographic()
                .scale(this.globeScale)
                .translate([this.width / 2, this.height /2])
                .rotate([0, 0, this.globalRoll])
                .clipAngle(90);

            this.path = d3.geo.path().projection(this.projection);

            this.d3el.selectAll("path")
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
        goToGlobe: function(event) {
            if (!event.target === this.el || this.projection.rotate()[2] <= this.globalRoll) {
                /* Only scale out to globe if click was not on land,
                 * and we're not already at globe scale */
                return;
            }
            var currentScale = this.projection.scale(),
                coords = this.projection.rotate(),
                currentRoll = coords.pop(),
                that = this;

            d3.transition()
                .duration(2250)
                .tween("zoomout", function() {
                    var places = that.getPlaces();
                    return function(t) {
                        coords[2] = currentRoll + (t * that.globalRoll);

                        that.projection
                            .rotate(coords)
                            .scale(currentScale - (t * (currentScale - that.globeScale)));
                        places.attr('opacity', 1 - t);
                        that.refresh();
                    };
                })
                .call(this.endAll, that, this.removePlaces);
        },
        goToCountry: function(event) {
            var centroid = $(event.target).attr('centroid').split(','),
                yaw = -parseFloat(centroid[0]),
                pitch = -parseFloat(centroid[1]),
                currentScale = this.projection.scale(),
                roll = this.projection.rotate()[2],
                rotate = greatArcInterpolator(),
                countryScale = this.getCountryScale(event.target);
                that = this;

            d3.transition()
                .duration(2250)
                .tween("zoomin", function() {
                    rotate.source(that.projection.rotate()).target([yaw, pitch]).distance();
                    var hadPlacesAlready = that.hasPlaceLabels,
                        places = that.getPlaces();

                    return function(t) {
                        var destination = rotate(t),
                            currentRoll = roll - (t * roll);
                        destination.push(currentRoll);
                        that.projection
                            .rotate(destination)
                            .scale(currentScale + (t * (countryScale - currentScale)));
                        if (!hadPlacesAlready) {
                            places.attr('opacity', t);
                        }
                        that.refresh();
                    };
                })
                .call(this.endAll, that, this.getPlaces);
        },
        getCountryScale: function(elem) {
            /*  Find scale for selected Country.
             *
             *  First find largest percentage of a hemisphere elem spans (lat or lng),
             *  then find largest scale that country will fit within. If that scale is
             *  too large (subjective), instead return maxScale.
             */
            var bounds = d3.geo.bounds($(elem)[0]["__data__"]),
                lngSpan = bounds[1][0] - bounds[0][0],
                latSpan = bounds[1][1] - bounds[0][1],
                lngPercent = lngSpan / 180,
                latPercent = latSpan / 90,
                maxBoundPercent = Math.max(lngPercent, latPercent),
                rawScale = this.globeScale * (1 / maxBoundPercent),
                maxScale = this.globeScale * 4;

            return rawScale > maxScale ? maxScale : rawScale;
        },
        getPlaces: function() {
            if (this.hasPlaceLabels) {
                return this.d3el.select('.places');
            } else {
                this.hasPlaceLabels = true;
                return this.d3el.append('path')
                    .datum(topojson.object(this.worldData, this.worldData.objects['places-SR1']))
                    .attr({
                        'class': 'places',
                        'd': this.path
                    });
            }
        },
        removePlaces: function() {
            this.getPlaces().remove();
            this.hasPlaceLabels = false;
        },
        startRotation: function() {
            this.stopRotating = false;
            var start = Date.now(),
                that = this;

            d3.timer(function() {
                var yawPitchRoll = [that.velocity * (Date.now() - start), 0, that.projection.rotate()[2]];
                that.projection.rotate(yawPitchRoll);
                that.refresh();
                return that.stopRotating;
            });
        },
        stopRotation: function() {
            this.stopRotating = true;
        },
        refresh: function() {
            this.d3el.selectAll('.land').attr('d', this.path);
            this.d3el.select('.places').attr('d', this.path);

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
                var m1 = [event.pageX, event.pageY],
                    center = [this.projection.rotate()[0] - (this.m0[0] - m1[0]) / 8, this.projection.rotate()[1] + (this.m0[1] - m1[1]) / 8, this.projection.rotate()[2]];
                this.projection.rotate(center);
                this.m0 = m1;
                this.refresh();
            }
        },
        endAll: function(transition, context, callback) {
            /* Utility function that will invoke a callback once all transitions are finished */
            var n = 0;
            transition
                .each(function() {++n;})
                .each('end', function() {if (!--n) callback.apply(context, arguments);});
        },
    });

    return GlobeView;
});
