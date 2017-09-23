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
        // updateMap(dataLayer, colorize, '0');

    }

    function bubble(pointData) {
        var circleOptions = {
            fillColor: "brown",
            color: "#000",
            weight: .8,
            opacity: 1,
            fillOpacity: 0.8,
            radius: 9
        };
        return circleOptions;
    }



    //options for creating circleMarkers from GeoJson point data
    var options = {
        pointToLayer: function (feature, ll) {
            return L.circleMarker(ll, {
                opacity: 3,
                weight: 1,
                fillOpacity: .7,
                fillColor: '#a6bddb',
                color: 'grey'

            })
        }
    }





    //Dynamic update map function
    function updateMap(dataLayer, colorize, income) {

        //  loop through each tract layer
        dataLayer.eachLayer(function (layer) {

            // shortcut reference for layer properties
            var props = layer.feature.properties;
            // console.log(layer.feature.properties.income2017);

            // set the fill color of layer based on its normalized data value using break values in colorize
            layer.setStyle({
                fillColor: colorize(Number(props.income2017))
            });

            // assemble string sequence of info for tooltip
            var tooltipInfo = "<b>" + "Household Income: " + " </b></br>" + "$" + props.income2017.toLocaleString()

            // bind a tooltip to layer with county-specific information
            layer.bindTooltip(tooltipInfo, {
                sticky: true
            });

        });
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

    //calculate the radius
    function calcRadius(val) {
        var radius = Math.sqrt(val / Math.PI);
        return radius * 5; // adjust .5 as a scale factor
    }

    //resize the circle radius based rainfall amount
    function resizeCircles(rainfall) {
        rainfall.eachLayer(function (layer) {
            var radius = calcRadius(Number(layer.feature.properties.total));
            layer.setRadius(radius);
        }).addTo(map);

    }





})();
