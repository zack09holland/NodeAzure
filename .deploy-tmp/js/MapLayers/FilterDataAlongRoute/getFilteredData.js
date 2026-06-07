/**********************************************************************************************************************
 * 
 *  Filter Data Along Route
 *  
 *  - getFilteredData()
 *      - Gets the data along a route with a buffer zone
 *  
 *  - calculateRoute()
 *  
 *  - filterData()
 *  
 *  - geocodeQuery()
 *    
 **********************************************************************************************************************/

function getFilteredData() {
    //Use SubscriptionKeyCredential with a subscription key
    var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

    //Use subscriptionKeyCredential to create a pipeline
    var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential, {
        retryOptions: {
            maxTries: 4
        }, // Retry options
    });

    //Create an instance of the SearchURL client.
    searchURL = new atlas.service.SearchURL(pipeline);

    //Create an instance of the RouteURL client.
    routeURL = new atlas.service.RouteURL(pipeline);

    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);
    map.setCamera({
        center: [-122.25, 47.64],
                zoom: 11,
                view: 'Auto'
    });
    //Generate 1000 random points within the bounds of the map view using the Turf.js library
    points = turf.randomPoint(1000, {
        bbox: map.getCamera().bounds
    });

    //Assign a color property to each point.
    for (var i = 0; i < points.features.length; i++) {
        points.features[i].properties.color = '#3399ff';
    }

    datasource.add(points);
     //Add a layer for rendering line data.
    polyLineDataLayer = new atlas.layer.PolygonLayer(datasource, null, {
        fillColor: 'rgba(255, 0, 255, 0.4)',
        filter: ['any', ['==', ['geometry-type'], 'Polygon'],
            ['==', ['geometry-type'], 'MultiPolygon']
        ] //Only render Polygon or MultiPolygon in this layer.
    });
    MyLayers.polyLineDataLayer = polyLineDataLayer;
    //Add a layer for rendering line data.
    lineDataLayer = new atlas.layer.LineLayer(datasource, null, {
        strokeColor: 'rgb(0, 204, 153)',
        strokeWidth: 5,
        filter: ['any', ['==', ['geometry-type'], 'LineString'],
            ['==', ['geometry-type'], 'MultiLineString']
        ] //Only render LineString or MultiLineString in this layer.
    });
    MyLayers.lineDataLayer = lineDataLayer;

    //Add a layer for rendering points as symbols.
    pointDataLayer = new atlas.layer.BubbleLayer(datasource, null, {
        color: ['get', 'color'],
        filter: ['any', ['==', ['geometry-type'], 'Point'],
            ['==', ['geometry-type'], 'MultiPoint']
        ] //Only render Point or MultiPoints in this layer.
    })
    MyLayers.pointDataLayer = pointDataLayer;
    map.layers.add([ polyLineDataLayer,lineDataLayer,pointDataLayer]);
}

function calculateRoute() {
    var start = document.getElementById('startTbx').value;
    var end = document.getElementById('endTbx').value;

    if (start == '' || end == '') {
        alert('Invalid waypoint point specified.');
        return;
    }

    //Geocode the start waypoint.
    geocodeQuery(start, function (startPoint) {
        if (!startPoint) {
            alert('Unable to geocode start waypoint.');
            return;
        }

        //Geocode the end waypoint.
        geocodeQuery(end, function (endPoint) {
            if (!endPoint) {
                alert('Unable to geocode end waypoint.');
                return;
            }

            routeURL.calculateRouteDirections(atlas.service.Aborter.timeout(3000), [startPoint, endPoint], {
                maxAlternatives: 0
            }).then(r => {
                if (r && r.routes && r.routes.length > 0) {
                    var route = r.routes[0];
                    var routeCoordinates = [];
                    for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
                        var leg = route.legs[legIndex];

                        //Convert the route point data into a format that the map control understands.
                        var legCoordinates = leg.points.map(function (point) {
                            return [point.longitude, point.latitude];
                        });

                        //Combine the route point data for each route leg together to form a single path.
                        routeCoordinates = routeCoordinates.concat(legCoordinates);
                    }

                    //Create a line from the route path points and add it to the data source.
                    routeLine = new atlas.data.LineString(routeCoordinates);

                    filterData();
                }
            });
        });
    });
}

function filterData() {
    if (routeLine) {
        var bufferDistance = parseFloat(document.getElementById('bufferDistance').value);

        //Create a polygon search area by buffering the route line.
        filterArea = turf.buffer(routeLine, bufferDistance, {
            units: 'miles'
        });

        //Reset the color property of each point.
        for (var i = 0; i < points.features.length; i++) {
            points.features[i].properties.color = '#3399ff';
        }

        //Calculate all points that are within the filter area.
        var ptsWithin = turf.pointsWithinPolygon(points, filterArea);

        var html = [ptsWithin.features.length];
        document.getElementById('bufferoutput').innerHTML = html.join('');

        //Change to color of all points that are in the filter area to red.
        for (var i = 0; i < ptsWithin.features.length; i++) {
            ptsWithin.features[i].properties.color = 'red';
        }

        //Update the data on the map.
        datasource.setShapes(points);
        datasource.add([filterArea, routeLine]);
    }
}

//Geocode the query and return the first coordinate.
function geocodeQuery(query, callback) {
    if (callback) {
        searchURL.searchAddress(atlas.service.Aborter.timeout(3000), query, {
            limit: 1,
            view: 'Auto'
        }).then(results => {
            var data = results.geojson.getFeatures();
            if (data && data.features.length > 0) {
                callback(data.features[0].geometry.coordinates);
            } else {
                callback(null);
            }
        });
    }
}
/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
 **********************************************************************************************************************/

// filterDataAlongRoute
$("#filterDataAlongRoute").click(function () {
    if ($(this).is(":checked")) {
        $('.filterDataAlongRouteInfo').css({
            display: "block"
        });
        getFilteredData()
    } else {
        $('.filterDataAlongRouteInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.polyLineDataLayer)
        removeLayer(MyLayers.lineDataLayer)
        removeLayer(MyLayers.pointDataLayer)
    }
});