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


    //Load in tract and income data
    $.getJSON("data/tract_48201_and_incomedata.geojson", function (tract) {
        processData(tract);

        //Load in rainfall data
        $.getJSON("data/daily_rainfall_totals.geojson", function (rainfall) {
            drawPoints(rainfall);
        });

    });


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


    function processData(tract) {
        var rates = [];
        //console.log('tract: ', tract);
        tract.features.map(function (tractData) {
            for (var prop in tractData.properties) {

                //Only get income2017 data then push into rates array
                if ($.isNumeric(tractData.properties[prop]) && prop === 'income2017') {
                    //  console.log(tractData.properties[prop]);
                    rates.push(Number(tractData.properties[prop]));
                    //   console.log('rates: ', rates);
                }
                rates.push(Number(tractData.properties[prop]));
            }
        });

        // var breaks = chroma.limits(rates, 'q', 5);
        // var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');
        var colorize = chroma.scale('OrRd').classes([0, 1, 50000, 100000, 150000, 210000, 260000]);
        drawMap(tract, colorize);

    }


    function drawMap(tract, colorize) {

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
        updateMap(dataLayer, colorize, '0');

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
            //console.log(layer.feature.properties.total);
            //console.log('radius', radius);
            layer.setRadius(radius);
        }).addTo(map);

    }

})();
