/******************************************************************************************************************************
 * 
 *  Swipe Between Maps Example
 * 
 *  - addClusteredPieLayerExample()
 *      - Adds a layer with clustered pie chart html markers
 * 
 *  - addEvent()
 *      - Add an event to the map
 * 
 *  - markerClicked() 
 *      - Determine if the html marker was clicked
 * 
 *  - tooltipCallback() 
 *      - Creates the % via a callback
 * 
 *  - UpdateData() 
 *      - Create mock data as an update.
 *    
 ******************************************************************************************************************************/
//GeoJSON feed that contains the data we want to map.
var geojsonFeed = 'data/geojson/SamplePoiDataSet.json';

//Colors for each EntityType property in point data: [Gas Station, Grocery Store, Restaurant, School]
var entityTypes = ['Gas Station', 'Grocery Store', 'Restaurant', 'School'];
var entityTypesColors = ['#3366CC', '#DC3912', '#FF9900', '#109618'];

function addClusteredPieLayerExample() {

    //Create a reusable popup.
    popup = new atlas.Popup({
        pixelOffset: [0, -20]
    });


    //Create a data source and add it to the map.
    clusteredPieDatasource = new atlas.source.DataSource(null, {
        cluster: true,
        clusterRadius: 150,
        clusterProperties: { //Calculate counts for each entity type in a cluster
            'Gas Station': ['+', ['case', ['==', ['get', 'EntityType'], 'Gas Station'], 1, 0]],
            'Grocery Store': ['+', ['case', ['==', ['get', 'EntityType'], 'Grocery Store'], 1, 0]],
            'Restaurant': ['+', ['case', ['==', ['get', 'EntityType'], 'Restaurant'], 1, 0]],
            'School': ['+', ['case', ['==', ['get', 'EntityType'], 'School'], 1, 0]]
        }
    });
    map.sources.add(clusteredPieDatasource);

    //Create a HTML marker layer for rendering data points.
    markerLayer = new HtmlMarkerLayer(clusteredPieDatasource, null, {
        markerRenderCallback: function (id, position, properties) {
            var marker = new atlas.HtmlMarker({
                position: position,
                color: 'DodgerBlue'
            });

            addEvent('click', marker, markerClicked);

            return marker;
        },
        clusterRenderCallback: function (id, position, properties) {
            var radius = 20;

            if (properties.point_count > 1000) {
                radius = 50;
            } else if (properties.point_count > 100) {
                radius = 40;
            } else if (properties.point_count > 10) {
                radius = 30;
            }

            //Get the counts for each entity type in the cluster.
            var values = [0, 0, 0, 0];

            for (var i = 0; i < entityTypes.length; i++) {
                if (properties[entityTypes[i]]) {
                    values[i] = properties[entityTypes[i]];
                }
            }

            var cluster = new PieChartMarker({
                position: position,
                values: values,
                colors: entityTypesColors,
                radius: radius,
                strokeThickness: 1,
                strokeColor: 'white',
                innerRadius: radius * 0.5,
                text: properties.point_count_abbreviated
            }, tooltipCallback);

            addEvent('click', cluster, markerClicked);

            return cluster;
        }
    });

    map.layers.add(markerLayer);
    MyLayers.markerLayer = markerLayer;

    //Import the GeoJSON data into the data source.
    clusteredPieDatasource.importDataFromUrl(geojsonFeed);

}

function addEvent(eventType, marker, handler) {
    if (eventType && marker && handler) {
        var options = marker.getOptions();
        var html = options.htmlContent;
        var elm = html;

        if (typeof html === 'string') {
            elm = document.createElement('div');
            elm.innerHTML = html.replace(/{color}/g, options.color || "")
                .replace(/{text}/g, options.text || "");
            marker.setOptions({
                htmlContent: elm
            });
        }

        elm.style.cursor = 'pointer';

        elm['on' + eventType] = function () {
            handler(eventType, marker);
        };
    }
}

function markerClicked(eventType, marker) {
    if (marker.properties.cluster) {
        //Get the cluster expansion zoom level. This is the zoom level at which the cluster starts to break apart.
        clusteredPieDatasource.getClusterExpansionZoom(marker.properties.cluster_id).then(function (zoom) {

            //Update the map camera to be centered over the cluster.
            map.setCamera({
                center: marker.getOptions().position,
                zoom: zoom,
                type: 'ease',
                duration: 200
            });
        });
    } else {
        var desc = [
            '<div class="popup"><div class="popup-title">', marker.properties.Name,
            '</div><div>', marker.properties.EntityType, '<br/>',
            marker.properties.Address, ', ', marker.properties.City, ', ', marker.properties.State,
            ', ', marker.properties.ZipCode,
            '</div></div>'
        ];

        popup.setOptions({
            content: desc.join(''),
            position: marker.getOptions().position
        });

        popup.open(map);
    }
}

function tooltipCallback(marker, sliceIdx) {
    return entityTypes[sliceIdx] + '<br/>' + marker.getSliceValue(sliceIdx) + ' (' + marker.getSlicePercentage(sliceIdx) + '%)';
}

function UpdateData() {
    //Create mock data as an update.
    var data = [];
    for (var i = 0; i < 16000; i++) {
        data.push(new atlas.data.Feature(new atlas.data.Point([
            Math.random() * 50 - 120,
            Math.random() * 30 + 25
        ]), {
            EntityType: entityTypes[i % 4],
            Name: 'A place',
            Address: '1234 main st',
            City: 'My City',
            State: 'My State',
            ZipCode: '90210',
            Country: 'USA'
        }));
    }

    clusteredPieDatasource.setShapes(data);
}

/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/

// clusteredPieMarker
$("#clusteredPieMarker").click(function () {
    if ($(this).is(":checked")) {
        $('.clusteredPieMarkerInfo').css({
            display: "block"
        });
        addClusteredPieLayerExample()

    } else {
        $('.clusteredPieMarkerInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.markerLayer)
    }
});