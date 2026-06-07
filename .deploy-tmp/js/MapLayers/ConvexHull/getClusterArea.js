/**********************************************************************************************************************
 * 
 *  Display cluster area with Convex Hull
 *  
 *  - getClusterArea()
 *      - Creates the points and cluster points layers
 *      - Creates the polygon and line layers for the convex area layer
 *  
 *  - displayClusterArea()
 *      - Display the cluster area convex hull
 *  
 *  - getPositions()
 *      - Determines the positions within the cluster clicked on
 *    
 **********************************************************************************************************************/

function getClusterArea() {
     //Create a data source for the point data.
     datasource = new atlas.source.DataSource(null, {
        //Tell the data source to cluster point data.
        cluster: true
    });
    map.setCamera({
        center:        
        [-94.6, 39.1],
        zoom: 3,
        view: 'Auto'
    });
    //Create a data source for the convex hull polygon. Since this will be updated frequently it is more efficient to seperate this into its own data source.
    polygonDatasource = new atlas.source.DataSource();

    //Add the data sources to the map.
    map.sources.add([polygonDatasource, datasource]);

    //Create a symbol layer to render the clusters.
    var clusterLayer = new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
            image: 'marker-red'
        },
        textOptions: {
            textField: ['get', 'point_count_abbreviated'],
            offset: [0, -1.2],
            color: "#ffffff",
            size: 14
        },
        filter: ['has', 'point_count'] //Filter individual points from this layer.
    });
    MyLayers.clusterLayer = clusterLayer;
    //Add a mouse over event to calculate and display the cluster area using a convex hull.
    map.events.add('mouseover', clusterLayer, displayClusterArea);

    //Add a mouse leave event to remove the convex hull from the map.
    map.events.add('mouseleave', clusterLayer, function () {
        polygonDatasource.clear();
    });

    pointLayer = new atlas.layer.SymbolLayer(datasource, null, {
        filter: ['!', ['has', 'point_count']] //Filter out clustered points from this layer.
    })
    MyLayers.pointLayer = pointLayer;

    //Add a polygon layer and a line layer to display the convex hull. 
    //Add two symbol layers to the map, one for clusters, one for individual points.
    map.layers.add([
        //Create a polygon layer to display the area of the convex hull.
        new atlas.layer.PolygonLayer(polygonDatasource),

        //Create a line layer to display the outline of the convex hull.
        new atlas.layer.LineLayer(polygonDatasource),

        clusterLayer,

        //Create a layer to render the individual locations.
        pointLayer
    ]);

    //Retrieve a GeoJSON data set and add it to the data source.
    earthquakeFeed = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
    datasource.importDataFromUrl(earthquakeFeed);
}
function displayClusterArea(e) {
    if (e && e.shapes && e.shapes.length > 0 && e.shapes[0].properties.cluster) {
        //Get the clustered point from the event.
        var cluster = e.shapes[0];

        //Get all points in the cluster. Set the offset to 0 and the limit to Infinity to return all points.
        datasource.getClusterLeaves(cluster.properties.cluster_id, Infinity, 0).then(function (points) {

            if (points.length === 2) {
                //When only two points in a cluster. Render a line.
                polygonDatasource.setShapes(new atlas.data.LineString(getPositions(points)));
            } else {
                var hullPolygon = atlas.math.getConvexHull(getPositions(points));

                //Overwrite all data in the polygon data source with the newly calculated convex hull polygon.
                polygonDatasource.setShapes(hullPolygon);
            }
        });
    }
}

function getPositions(shapes) {
    var pos = [];

    if (shapes) {
        for (var i = 0; i < shapes.length; i++) {
            pos.push(atlas.math.getPosition(shapes[i]));
        }
    }

    return pos;
}
/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/

// displayClusterArea
$("#displayClusterArea").click(function () {
    if ($(this).is(":checked")) {
        $('.displayClusterAreaInfo').css({
            display: "block"
        });
        getClusterArea()
    } else {
        $('.displayClusterAreaInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.clusterLayer)
        removeLayer(MyLayers.pointLayer)
    }
});