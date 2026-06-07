/**********************************************************************************************************************
 * 
 * Variables
 *    
**********************************************************************************************************************/
var bubbleLayer, defaultOptions, testDataSize = 100,
    removeDefaults;
var popup;

//GeoJSON feed that contains the data we want to map.
var geojsonFeed = 'data/geojson/SamplePoiDataSet.json';

//GeoJSON feed of all earthquakes from the past 30 days. Sourced from the USGS.
var earthquakeFeed = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

//Colors for each EntityType property in point data: [Gas Station, Grocery Store, Restaurant, School]
var entityTypes = ['Gas Station', 'Grocery Store', 'Restaurant', 'School'];


/**********************************************************************************************************************
 * 
 *  Simple Bubble Layer w/ options Example
 *      
 *  - addbubbleLayer()
 *      - Creates the data for a bubble layer
 *      - Allows for manipulation of the layer design   
 * 
 *  - updateBubbleLayer()
 *      - Gets the design options and updates the bubble layer
 * 
 *  - getBubbleInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getPropertyValue()
 *      - Gets the property value of the elements 
 *
 *  - generateRandomPoints()
 *      - Creates random points for the example layer 
 * 
 *  - getSelectValue()
 *      - Gets the selected value from the drop downs
 *  
 *  - openTab()
 *      - Opens the tab within the bubble layer options window   
 *    
**********************************************************************************************************************/
function addbubbleLayer() {
    //Create a data source and add it to the map.
    var datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Add random point features to data source.
    datasource.add(generateRandomPoints(testDataSize));

    //Create a layer to render the point feature data.
    bubbleLayer = new atlas.layer.BubbleLayer(datasource);
    map.layers.add(bubbleLayer);
    MyLayers.bubbleLayer = bubbleLayer;

    defaultOptions = bubbleLayer.getOptions();

    //Update the bubble layer with the options in the input fields.
    updateBubbleLayer();
}

function updateBubbleLayer() {
    var options = getBubbleInputOptions();

    //Update all the options in the bubble layer.
    bubbleLayer.setOptions(options);

    document.getElementById('CodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getBubbleInputOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    return {
        color: getPropertyValue('color', document.getElementById('Color').value),
        strokeColor: getPropertyValue('strokeColor', document.getElementById('StrokeColor').value),
        blur: getPropertyValue('blur', parseFloat(document.getElementById('Blur').value)),
        opacity: getPropertyValue('opacity', parseFloat(document.getElementById('Opacity').value)),
        strokeOpacity: getPropertyValue('strokeOpacity', parseFloat(document.getElementById('StrokeOpacity').value)),
        strokeWidth: getPropertyValue('strokeWidth', parseFloat(document.getElementById('StrokeWidth').value)),
        radius: getPropertyValue('radius', parseFloat(document.getElementById('Radius').value)),
        minZoom: getPropertyValue('minZoom', parseFloat(document.getElementById('MinZoom').value)),
        maxZoom: getPropertyValue('maxZoom', parseFloat(document.getElementById('MaxZoom').value)),
        pitchAlignment: getPropertyValue('pitchAlignment', getSelectValue('PitchAlignment'))
    };
}

function getPropertyValue(propertyName, value) {
    if (removeDefaults && defaultOptions[propertyName] === value) {
        return undefined;
    }

    return value;
}

function generateRandomPoints(cnt) {
    var layerData = [];

    for (var i = 0; i < cnt; i++) {
        layerData.push(new atlas.data.Feature(new atlas.data.Point([Math.random() * 360 - 180, Math.random() * 170 - 85]), {
            title: 'Pin_' + i
        }));
    }

    return layerData;
}

function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}

function openTab(elm, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    elm.className += " active";
}


/**********************************************************************************************************************
 * 
 * Cluster Buddle Layer Example
 * 
 *  - addClusterBubbleLayer()
 *      - Creates the data to show a cluster bubble layer
 * 
 *  - clusterClicked()
 *      - Function to determine if a point cluster has been clicked on
 *    
**********************************************************************************************************************/
function addClusterBubbleLayer() {
    //Create a reusable popup.
    popup = new atlas.Popup();

    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource(null, {
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 50,

        //Calculate counts for each entity type in a cluster as custom aggregate properties.
        clusterProperties: {
            'Gas Station': ['+', ['case', ['==', ['get', 'EntityType'], 'Gas Station'], 1, 0]],
            'Grocery Store': ['+', ['case', ['==', ['get', 'EntityType'], 'Grocery Store'], 1, 0]],
            'Restaurant': ['+', ['case', ['==', ['get', 'EntityType'], 'Restaurant'], 1, 0]],
            'School': ['+', ['case', ['==', ['get', 'EntityType'], 'School'], 1, 0]]
        }
    });
    map.sources.add(datasource);

    //Create a bubble layer for rendering clustered data points.
    var clusterBubbleLayer = new atlas.layer.BubbleLayer(datasource, null, {
        radius: 20,
        color: 'purple',
        strokeWidth: 0,
        filter: ['has', 'point_count'] //Only rendered data points which have a point_count property, which clusters do.
    });

    //Add a click event to the layer so a popup can be displayed to show details about the cluster.
    map.events.add('click', clusterBubbleLayer, clusterClicked);

    //Create a symbol layer to render the count of locations in a cluster.   
    var clusterLocationCountLayer = new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
            image: 'none' //Hide the icon image.
        },
        textOptions: {
            textField: ['get', 'point_count_abbreviated'],
            offset: [0, 0.4],
            color: 'white'
        }
    })
    
    //Create a layer to render the individual locations.
    var clusterIndividualLocationLayer = new atlas.layer.SymbolLayer(datasource, null, {
        filter: ['!', ['has', 'point_count']] //Filter out clustered points from this layer.
    })

    //Add the clusterBubbleLayer and two additional layers to the map.
    map.layers.add([
        clusterBubbleLayer,clusterLocationCountLayer,clusterIndividualLocationLayer    
    ]);

    // Add cluster bubble layer to MyLayers object so it can be removed
    MyLayers.clusterBubbleLayer = clusterBubbleLayer;
    MyLayers.clusterLocationCountLayer = clusterLocationCountLayer;
    MyLayers.clusterIndividualLocationLayer = clusterIndividualLocationLayer;

    //Import the GeoJSON data into the data source.
    datasource.importDataFromUrl(geojsonFeed);
}

function clusterClicked(e) {
    if (e && e.shapes && e.shapes.length > 0 && e.shapes[0].properties.cluster) {
        //Get the clustered point from the event.
        var cluster = e.shapes[0];

        var html = ['<div style="padding:10px;">'];

        html.push(`<b>Cluster size: ${cluster.properties.point_count_abbreviated} entities</b><br/><br/>`);

        //Loop though each entity type get the count from the clusterProperties of the cluster.
        entityTypes.forEach(et => {
            html.push(`${et}: ${cluster.properties[et]}<br/>`);
        })

        html.push('</div>');

        //Update the options of the popup and open it on the map.
        popup.setOptions({
            position: cluster.geometry.coordinates,
            content: html.join('')
        });

        popup.open(map);
    }
}



/**********************************************************************************************************************
 * 
 *  Point Cluster Buddle Layer Example 
 * 
 *  - addPointClusterBubbleLayer()
 *      - Creates the data to show a point cluster bubble layer
 * 
 *  - pointClusterClicked()
 *      - Function to determine if a point cluster has been clicked on
 *    
**********************************************************************************************************************/
function addPointClusterBubbleLayer() {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource(null, {
        //Tell the data source to cluster point data.
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 45,

        //The maximium zoom level in which clustering occurs.
        //If you zoom in more than this, all points are rendered as symbols.
        clusterMaxZoom: 15
    });
    map.sources.add(datasource);

    //Create a bubble layer for rendering clustered data points.
    var pointClusterBubbleLayer = new atlas.layer.BubbleLayer(datasource, null, {
        //Scale the size of the clustered bubble based on the number of points inthe cluster.
        radius: [
            'step',
            ['get', 'point_count'],
            20, //Default of 20 pixel radius.
            100, 30, //If point_count >= 100, radius is 30 pixels.
            750, 40 //If point_count >= 750, radius is 40 pixels.
        ],

        //Change the color of the cluster based on the value on the point_cluster property of the cluster.
        color: [
            'step',
            ['get', 'point_count'],
            'rgba(0,255,0,0.8)', //Default to green. 
            100, 'rgba(255,255,0,0.8)', //If the point_count >= 100, color is yellow.
            750, 'rgba(255,0,0,0.8)' //If the point_count >= 100, color is red.
        ],
        strokeWidth: 0,
        filter: ['has', 'point_count'] //Only rendered data points which have a point_count property, which clusters do.
    });

    //Add a click event to the layer so we can zoom in when a user clicks a cluster.
    map.events.add('click', pointClusterBubbleLayer, pointClusterClicked);

    //Add mouse events to change the mouse cursor when hovering over a cluster.
    map.events.add('mouseenter', pointClusterBubbleLayer, function () {
        map.getCanvasContainer().style.cursor = 'pointer';
    });

    map.events.add('mouseleave', pointClusterBubbleLayer, function () {
        map.getCanvasContainer().style.cursor = 'grab';
    });

    //Create a symbol layer to render the count of locations in a cluster.
    var clusterPointCountLayer = new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
            image: 'none' //Hide the icon image.
        },
        textOptions: {
            textField: ['get', 'point_count_abbreviated'],
            offset: [0, 0.4]
        }
    });

    //Create a layer to render the individual locations.
    var clusterIndividualPointsLayer = new atlas.layer.SymbolLayer(datasource, null, {
        filter: ['!', ['has', 'point_count']] //Filter out clustered points from this layer.
    })

    //Add the clusterBubbleLayer and two additional layers to the map.
    map.layers.add([
        pointClusterBubbleLayer, clusterPointCountLayer, clusterIndividualPointsLayer
    ]);

    //Retrieve a GeoJSON data set and add it to the data source. 
    datasource.importDataFromUrl(earthquakeFeed);

    // Add cluster bubble layers to MyLayers object so they can be removed
    MyLayers.pointClusterBubbleLayer = pointClusterBubbleLayer;
    MyLayers.clusterPointCountLayer = clusterPointCountLayer;
    MyLayers.clusterIndividualPointsLayer = clusterIndividualPointsLayer;
}

function pointClusterClicked(e) {
    if (e && e.shapes && e.shapes.length > 0 && e.shapes[0].properties.cluster) {
        //Get the clustered point from the event.
        var cluster = e.shapes[0];

        //Get the cluster expansion zoom level. This is the zoom level at which the cluster starts to break apart.
        datasource.getClusterExpansionZoom(cluster.properties.cluster_id).then(function (zoom) {

            //Update the map camera to be centered over the cluster. 
            map.setCamera({
                center: cluster.geometry.coordinates,
                zoom: zoom,
                type: 'ease',
                duration: 200
            });
        });
    }
}








/***************************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
***************************************************************************************************************************************************************************/
// bubbleItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#bubbleItems").click(function () {
    if ($(this).is(":checked")) {
    
    } else {
        try {
            $("#bubbleOptions").prop('checked', false);
            $('.bubbleLayerInfo').css({
                display: "none"
            });
            removeLayer(MyLayers.bubbleLayer)
            $("#clusterBubbles").prop('checked', false);
            $('.clusterBubblesInfo').css({
                display: "none"
            });
            removeLayer(MyLayers.clusterBubbleLayer)
            removeLayer(MyLayers.clusterLocationCountLayer)
            removeLayer(MyLayers.clusterIndividualLocationLayer)
            $("#pointClusterBubble").prop('checked', false);
            $('.pointClusterBubbleInfo').css({
                display: "none"
            });
            removeLayer(MyLayers.pointClusterBubbleLayer)
            removeLayer(MyLayers.clusterPointCountLayer)
            removeLayer(MyLayers.clusterIndividualPointsLayer)
        } catch (err) {

        }
    }
});
// bubbleOptions
$("#bubbleOptions").click(function () {
    if ($(this).is(":checked")) {
        $('.bubbleLayerInfo').css({
            display: "block"
        });
        addbubbleLayer()
    } else {
        $('.bubbleLayerInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.bubbleLayer)
    }
});
// clusterBubbles
$("#clusterBubbles").click(function () {
    if ($(this).is(":checked")) {
        $('.clusterBubblesInfo').css({
            display: "block"
        });
        addClusterBubbleLayer()
    } else {
        $('.clusterBubblesInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.clusterBubbleLayer)
        removeLayer(MyLayers.clusterLocationCountLayer)
        removeLayer(MyLayers.clusterIndividualLocationLayer)
    }
});
// clusterBubbles
$("#pointClusterBubble").click(function () {
    if ($(this).is(":checked")) {
        $('.pointClusterBubbleInfo').css({
            display: "block"
        });
        addPointClusterBubbleLayer()
    } else {
        $('.pointClusterBubbleInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.pointClusterBubbleLayer)
        removeLayer(MyLayers.clusterPointCountLayer)
        removeLayer(MyLayers.clusterIndividualPointsLayer)

    }
});