(function () {

    // mapbox access token for sophia58 account
    L.mapbox.accessToken = 'pk.eyJ1Ijoic29waGlhNTgiLCJhIjoiY2o2OWliZThsMHNwcDMycnBrcnEyNHlkZiJ9._d2dOKGl4oPWzUxOSnMgfA';

    // create the Leaflet map using mapbox.light tiles
    var map = L.mapbox.map('map', 'mapbox.light', {
        zoomSnap: .1,
        center: [29.842, -95.393],
        zoom: 7,
        minZoom: 6,
        maxZoom: 9
        //        maxBounds: L.latLngBounds([-6.22, 27.72], [5.76, 47.83])
    });

    // var colorize;

    //Load in tract and income data
    $.getJSON("data/tract_48201_and_incomedata.geojson", function (tract) {

        // counties is accessible here
        //console.log(tract);
        processData(tract);

    });

    function processData(tract) {
        var rates = [];
        //console.log('tract: ', tract);
        tract.features.map(function (tractData) {
            for (var prop in tractData.properties) {
                rates.push(Number(tractData.properties[prop]));
                // console.log('rates: ', rates);
            }
        });

        var breaks = chroma.limits(rates, 'q', 7);
        var colorize = chroma.scale(chroma.brewer.OrRd).classes(breaks).mode('lab');

        drawMap(tract, colorize);
        //        var color = colorize(20);
        //        console.log(color); // a {_rgb: Array[4]}
    }


    function drawMap(tract, colorize) {
        console.log(colorize);

        // create Leaflet object with geometry data and add to map
        var dataLayer = L.geoJson(tract, {
            style: function (feature) {
                return {
                    color: 'black',
                    weight: 1,
                    fillOpacity: 1,
                    fillColor: '#1f78b4'
                };
            }
        }).addTo(map);
        updateMap(dataLayer, colorize, '80000');

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
            var tooltipInfo = "<b>" + "Household Income: " + " </b></br>" + props.income2017

            // bind a tooltip to layer with county-specific information
            layer.bindTooltip(tooltipInfo, {
                sticky: true
            });

        });
    }


})();
