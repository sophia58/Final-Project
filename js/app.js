(function () {


    // mapbox access token for sophia58 account
    L.mapbox.accessToken = 'pk.eyJ1Ijoic29waGlhNTgiLCJhIjoiY2o2OWliZThsMHNwcDMycnBrcnEyNHlkZiJ9._d2dOKGl4oPWzUxOSnMgfA';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.light', {
        //zoomSnap: .1,
        center: [29.842, -95.393],
        zoom: 9.5,
        dragging: true,
        zoomControl: true
    });

    // set global variables mapped attribute, and normalizing attribute 
    var attributeValue = "total";


    //Load in tract and rainfall data
    $.when(
        $.getJSON("data/tract_48201_and_incomedata.geojson"),
        $.getJSON("data/daily_rainfall_totals.geojson")
    ).done(function (tract, rainfall) {
        // console.log("tract: ", tract);
        // console.log("rain: ", rainfall);

        drawMap(tract, rainfall);

    });



    function drawMap(tract, rainfall) {

        // create Leaflet object with geometry data and add to map
        var dataLayer = L.geoJson(tract, {
            style: function (feature) {
                return {
                    color: 'black',
                    weight: .3,
                    fillOpacity: 1,
                    fillColor: '#1f78b4'
                };
            }
        }).addTo(map);

        // create Leaflet object with geometry data and add to map
        L.geoJSON(rainfall, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, bubble(rainfall)); //pass rainfall to bubble function to get
            } // circle options
        }).addTo(map);
        updateMap(tract, rainfall);

    }

    //style each gage site
    function bubble(pointData) {
        var circleOptions = {
            fillColor: "brown",
            color: "#000",
            weight: .8,
            opacity: 1,
            fillOpacity: 0.8,
            radius: 5,
        };
        return circleOptions;
    }

    //calculate the radius
    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        console.log("\n radius :", radius);
        return radius * 10; // adjust .5 as a scale factor
    }

    //resize the circle radius based rainfall amount
    function resizeCircles(rainfall) {
        rainfall.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties.total));
            layer.setRadius(radius);
        }).addTo(map);

    }


    //Dynamic update map function
    function updateMap(tract, rainfall) {

        // get the class breaks for the initial data attribute
        var breaks = getClassBreaks(tract);

        // draw the legend now that we have the classifications
        updateLegend(breaks);

        //        // loop through each county layer
        //        dataLayer.eachLayer(function (layer) {
        //
        //            // shortcut reference for layer properties
        //            var props = layer.feature.properties;
        //
        //            // set the fill color of layer based on its normalized data value
        //            layer.setStyle({
        //                fillColor: "yellow"
        //                //                fillColor: getColor(props[attributeValue] / props[normValue], breaks)
        //            });
        //
        //            // assemble string sequence of info for tooltip
        //            var tooltipInfo = "test"
        //
        //            //                "<b>" + props["NAME"] + " County</b></br>" +
        //            //                labels[attributeValue] + ": " + ((props[attributeValue] /
        //            //                    props[normValue]) * 100).toLocaleString() + "%"
        //
        //            // bind a tooltip to layer with county-specific information
        //            layer.bindTooltip(tooltipInfo, {
        //                sticky: true
        //            });
        //
        //        });
    }



    //drawLegend
    function drawLegend(data) {
        // create Leaflet control for the legend
        var legend = L.control({
            position: 'bottomleft'
        });
        // when added to the map
        legend.onAdd = function (map) {

            // select the element with id of 'legend'
            var div = L.DomUtil.get("legend");

            // disable the mouse events
            L.DomEvent.disableScrollPropagation(div);
            L.DomEvent.disableClickPropagation(div);

            // add legend to the control
            return div;

        }

        //for each feature you iterate through and push numeric values for each grade level into an array
        var dataValues = [];
        data.features.map(function (school) {
            for (var grade in school.properties) {
                var attribute = school.properties[grade];
                if (Number(attribute)) {
                    dataValues.push(attribute);
                    //console.log(attribute);
                }
            }
        });
    }


    function drawPoints(rainfall) {
        var rainLayer = L.geoJson(rainfall, options);
        resizeCircles(rainLayer);
        // map.fitBounds(rainLayer.getBounds());

    }

    function getClassBreaks(dataLayer) {

        // create empty Array for storing values
        var values = [];

        // loop through all the counties
        dataLayer.eachLayer(function (layer) {
            var value = layer.feature.properties[attributeValue];
            values.push(value); // push the normalized value for each layer into the Array
        });

        // determine similar clusters
        var clusters = ss.ckmeans(values, 5);

        // create an array of the lowest value within each cluster
        var breaks = clusters.map(function (cluster) {
            return [cluster[0], cluster.pop()];
        });

        //return array of arrays, e.g., [[0.24,0.25], [0.26, 0.37], etc]
        return breaks;

    }

    function getColor(d, breaks) {
        // function accepts a single normalized data attribute value
        // and uses a series of conditional statements to determine which
        // which color value to return to return to the function caller

        if (d <= breaks[0][1]) {
            return '#f1eef6';
        } else if (d <= breaks[1][1]) {
            return '#bdc9e1';
        } else if (d <= breaks[2][1]) {
            return '#74a9cf';
        } else if (d <= breaks[3][1]) {
            return '#2b8cbe'
        } else if (d <= breaks[4][1]) {
            return '#045a8d'
        }
    }




})();
