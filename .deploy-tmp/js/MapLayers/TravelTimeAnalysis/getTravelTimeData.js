/**********************************************************************************************************************
 * 
 *  Display cluster area with Convex Hull
 *  
 *  - getTravelTimeData()
 *      - Creates the walking travel time around points and calculates the number of points within it
 *  
 *  - showPopup()
 *      - Display the popup
 *    
 **********************************************************************************************************************/
var policeStationsUrl = 'data/SpatialCSV/Chicago_Police_Stations.csv';
var bikeRacksUrl = 'data/SpatialCSV/Chicago_Bike_Racks.csv';
var routeURL;

function getTravelTimeData() {
    //Create a pipeline using the Azure Maps subscription key.
    var pipeline = atlas.service.MapsURL.newPipeline(new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey()));
    //Construct the RouteURL object
    routeURL = new atlas.service.RouteURL(pipeline);
    //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup();

    //Create a data source ad add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Add a simple data layer for rendering the data.
    layer = new atlas.layer.PolygonLayer(datasource, null, {
        fillColor: [
            'step',
            ['get', 'totalBikeRacks'],
            'transparent',
            1, '#f0f9e8',
            2, '#bae4bc',
            3, '#7bccc4',
            4, '#43a2ca',
            5, '#0868ac'
        ],
        fillOpacity: 0.8
    });
    map.layers.add(layer, 'labels');
    MyLayers.bikeDataLayer = layer;
    //Add a click event to the layers.
    map.events.add('click', layer, showPopup);

    travelTimeLayer = new atlas.layer.LineLayer(datasource, null, {
        strokeColor: 'black'
    })
    map.layers.add(travelTimeLayer);
    MyLayers.travelTimeLayer = travelTimeLayer;

    //Add a bubble layer for displaying police stations.
    policeStationLayer = new atlas.layer.BubbleLayer(datasource, null, {
        filter: ['==', ['geometry-type'], 'Point']
    });
    map.layers.add(policeStationLayer);
    MyLayers.policeStationLayer = policeStationLayer

    //Download the police station and crime data in parrallel.
    Promise.all([
        atlas.io.read(policeStationsUrl),
        atlas.io.read(bikeRacksUrl)
    ]).then(function (values) {
        var stations = values[0];
        var bikeRacks = values[1];

        //Update map view to display the area of bike racks.
        map.setCamera({
            bounds: bikeRacks.bbox
        });

        //Add the police station data to the map.
        datasource.add(stations);

        var routeRangePromises = [];

        //Calculate the travel time polygons from each station.
        for (var i = 0; i < stations.features.length; i++) {
            routeRangePromises.push(routeURL.calculateRouteRange(atlas.service.Aborter.timeout(10000), stations.features[i].geometry.coordinates, {
                travelMode: 'pedestrian',
                timeBudgetInSec: 5 * 60 //5 minutes.
            }));
        }

        Promise.all(routeRangePromises).then(values => {
            var isochrones = [];

            for (var i = 0; i < values.length; i++) {
                var data = values[i].geojson.getFeatures();

                //Copy the properties of the police station to the travel time polygon.
                data.features[0].properties = stations.features[i].properties;

                //Spatially join the bike rack data with each travel time polygon, then use the total number of bike racks as the aggregate.
                var ptsWithin = turf.pointsWithinPolygon(bikeRacks, data.features[0]);
                data.features[0].properties.totalBikeRacks = ptsWithin.features.length;

                //The first feature is the polygon, the second is the origin point which we can leave out.
                //Close the polygon.
                data.features[0].geometry.coordinates[0].push(data.features[0].geometry.coordinates[0][0]);
                isochrones.push(data.features[0]);
            }

            datasource.add(isochrones);
        });

        //    document.getElementById('statusPanel').innerHTML = '';
    });
}

function showPopup(e) {
    if (e.shapes && e.shapes.length > 0) {
        var properties = e.shapes[0].getProperties();

        popup.setOptions({
            //Update the content of the popup.
            content: atlas.PopupTemplate.applyTemplate(properties, {
                title: '{totalBikeRacks} bike racks'
            }),

            //Update the position of the popup.
            position: (e.shapes[0].getType() === 'Point') ? e.shapes[0].getCoordinates() : e.position
        });

        //Open the popup.
        popup.open(map);
    }
}
/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
 **********************************************************************************************************************/

// travelTimeAnalysis
$("#travelTimeAnalysis").click(function () {
    if ($(this).is(":checked")) {
        $('.travelTimeAnalysisInfo').css({
            display: "block"
        });
        getTravelTimeData()
    } else {
        $('.travelTimeAnalysisInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.bikeDataLayer)
        removeLayer(MyLayers.travelTimeLayer)
        removeLayer(MyLayers.policeStationLayer)
    }
});