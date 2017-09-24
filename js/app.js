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
    var attributeValue = "income2017";
    var rainValue = "total";


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
        var rainLayer = L.geoJSON(rainfall, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, bubble(rainfall)); //pass rainfall to bubble function to get
            } // circle options
        }).addTo(map);
        // updateMap(tract, rainfall);

        //  map.fitBounds(dataLayer.getBounds());

        $(".info").hide();

        //        // add a listener to update the info panel
        //        dataLayer.eachLayer(function (layer) {
        //            layer.on('mouseover', function () {
        //                updateInfo(this);
        //            });
        //        });

        //Add a listener for mouse on and mouse out
        dataLayer.on('mouseover', function () {
            $(".info").show();
        });
        dataLayer.on('mouseout', function () {
            $(".info").hide();
        });

        // draw the legend 
        drawLegend();

        //call Update Map function
        updateMap(dataLayer, rainLayer);



        //Add an event listener for when a user selects a different dropdown option
        //        $('select[name="occupied"]').change(function () {
        //            // code executed here when change event occurs
        //            //.val will get the attribute value of the selected option
        //            attributeValue = $(this).val();
        //            updateMap(dataLayer);
        //
        //        });

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
        //console.log("\n radius :", radius);
        return radius * 5; // adjust .5 as a scale factor
    }

    //resize the circle radius based rainfall amount
    function resizeCircles(rainLayer) {
        rainLayer.eachLayer(function (layer) {
            var radius = calcRadius((layer.feature.properties.total));
            layer.setRadius(radius);
        }).addTo(map);

    }

    //Dynamic update map function
    function updateMap(dataLayer, rainLayer) {

        // get the class breaks for the initial data attribute
        var tractBreaks = getClassBreaks(dataLayer);
        //console.log('breaks : ', breaks);

        var rainBreaks = getRainTotalBreaks(rainLayer);
        //console.log('rainBreaks : ', rainBreaks);

        // draw the legend now that we have the classifications
        updateLegend(tractBreaks);

        // loop through each county layer
        dataLayer.eachLayer(function (layer) {

            // shortcut reference for layer properties
            var props = layer.feature.properties;

            // set the fill color of layer based on its normalized data value
            layer.setStyle({
                fillColor: getColor(props[attributeValue], tractBreaks)
            });

        });

        // loop through each county layer
        rainLayer.eachLayer(function (layer) {

            // shortcut reference for layer properties
            var props = layer.feature.properties;

            // set the fill color of layer based on its normalized data value
            layer.setStyle({
                radius: getSize(props[rainValue], rainBreaks),
                fillColor: '#bdbdbd'
            });


            // assemble string sequence of info for tooltip
            var tooltipInfo = "<b>" + " Total: </b>" + props[rainValue] + " in."

            // bind a tooltip to layer with county-specific information
            layer.bindTooltip(tooltipInfo, {
                sticky: true
            });

        });

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

    function getRainTotalBreaks(rainLayer) {

        // create empty Array for storing values
        var values = [];

        // loop through all the counties
        rainLayer.eachLayer(function (layer) {
            var value = layer.feature.properties[rainValue];
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


    //Function to determine size of rainTotal
    function getSize(d, breaks) {

        if (d <= breaks[0][1]) {
            return 5;
        } else if (d <= breaks[1][1]) {
            return 10;
        } else if (d <= breaks[2][1]) {
            return 15;
        } else if (d <= breaks[3][1]) {
            return 20;
        } else if (d <= breaks[4][1]) {
            return 25;
        }
    }



    //Draw a Legend
    function drawLegend() {

        // create a new Leaflet control object, and position it top left
        var legendControl = L.control({
            position: 'bottomleft'
        });

        // when the legend is added to the map
        legendControl.onAdd = function (map) {

            // create a div element with an class attribute of legend
            var div = L.DomUtil.create('div', 'legend');

            // return the div to the method
            return div;

        };

        // add the empty legend div to the map
        legendControl.addTo(map);
    }


    //Function that updates the legend based on user's selection
    function updateLegend(breaks) {

        //use legend element .legend and add header information to the legend
        var legend = $('.legend').html("<h3>" + "Est. Median Income" + "</h3>");

        //loop uses .append to add new elements to the legend
        for (var i = 0; i <= breaks.length - 1; i++) {
            var color = getColor(breaks[i][0], breaks);

            var lowVal = (breaks[i][0]),
                highVal = (breaks[i][1]),
                highString, lowString;

            if (highVal <= 50000) {
                lowString = 0;
                highString = 50;
            } else if (highVal <= 82700) {
                lowString = 50;
                highString = 83;
            } else if (highVal < 125000) {
                lowString = 83;

                highString = 125;
            } else if (highVal <= 186400) {
                lowString = 125;
                highString = 186;

            } else if (lowVal => 187000) {
                lowString = 187;
                highString = 264;
            }

            legend.append(
                '<span style="background:' + color + '"></span> ' +
                '<label>' + lowString + ' &mdash; ' + highString + '</label>');
        }
        //        legend.append('<br >' +
        //            '<span style="background:' + rainCircle + '"></span> ' +
        //            '<label>' + 'Total Rainfall' + '</label>'
        //        );

    }

})();
