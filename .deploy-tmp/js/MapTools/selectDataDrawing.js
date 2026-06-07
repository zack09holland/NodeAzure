/**********************************************************************************************************************
 * 
 *  Select data in drawn polygon area
 *  
 *  - selectDataDrawing()
 *      - Adds a layer with weather data pulled from microsoft
 *  
 *  - drawingModeChanged()
 *      - Determine if new draw tool has been selected
 *  
 *  - searchPolygon()
 *      - Search drawn shape for points within
 *    
 **********************************************************************************************************************/

function selectDataDrawing() {
    //Create a data source and add it to the map.
    datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Generate 1000 random points within the bounds of the map view using the Turf.js library
    points = turf.randomPoint(1000, {
        bbox: map.getCamera().bounds
    });

    //Assign a color and name property to each point.
    for (var i = 0; i < points.features.length; i++) {
        points.features[i].properties = {
            name: 'Pin_' + i,
            color: '#3399ff'
        };
    }

    //Add the points to the map.
    datasource.add(points);

    //Create a layer to render the points.
    selectDataDrawingLayer = new atlas.layer.BubbleLayer(datasource, null, {
        color: ['get', 'color']
    })
    map.layers.add(selectDataDrawingLayer);
    MyLayers.selectDataDrawingLayer = selectDataDrawingLayer

    //Create an instance of the drawing manager and display the drawing toolbar.
    drawingManager = new atlas.drawing.DrawingManager(map, {
        toolbar: new atlas.control.DrawingToolbar({
            buttons: ['draw-polygon', 'draw-rectangle', 'draw-circle'],
            position: 'top-left',
            style: 'light'
        })
    });

    //Hide the polygon fill area as only want to show outline of search area.
    drawingManager.getLayers().polygonLayer.setOptions({
        visible: false
    });

    //Clear the map and drawing canvas when the user enters into a drawing mode.
    map.events.add('drawingmodechanged', drawingManager, drawingModeChanged);

    //Monitor for when a polygon drawing has been completed.
    map.events.add('drawingcomplete', drawingManager, searchPolygon);
}

function drawingModeChanged(mode) {
    //Clear the drawing canvas when the user enters into a drawing mode and reset the style of all pins.
    if (mode.startsWith('draw')) {
        drawingManager.getSource().clear();

        //Reset the color property of each point.
        for (var i = 0; i < points.features.length; i++) {
            points.features[i].properties.color = '#3399ff';
        }

        //Update the data on the map.
        datasource.setShapes(points);
    }
}

function searchPolygon(searchArea) {
    //Exit drawing mode.
    drawingManager.setOptions({ mode: 'idle' });

    var poly = searchArea.toJson();

    //If the search area is a circle, create a polygon from its circle coordinates.
    if (searchArea.isCircle()) {
        poly = new atlas.data.Polygon([searchArea.getCircleCoordinates()]);
    }

    //Calculate all points that are within the polygon area.
    var ptsWithin = turf.pointsWithinPolygon(points, poly);
    // console.log(ptsWithin.features)
    //Change to color of all points that are in the polygon area to red.
    for (var i = 0; i < ptsWithin.features.length; i++) {
        ptsWithin.features[i].properties.color = 'red';
    }
    
    //Do something with the selected points.
    //For demo purposes, we will simply output the name of each pin.
    var html = [ptsWithin.features.length, ' Pins Selected:<br/><br/>'];
    for (var i = 0; i < ptsWithin.features.length; i++) {
        html.push(ptsWithin.features[i].properties.name, '<br/>');
    }
    document.getElementById('output').innerHTML = html.join('');

    //Update the points on the map since the color property has changed.
    datasource.setShapes(points);
}

/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/

// selectDataDrawTool
$("#selectDataDrawTool").click(function () {
    if ($(this).is(":checked")) {
        $('.selectDataDrawToolInfo').css({
            display: "block"
        });
        selectDataDrawing()
    } else {
        $('.selectDataDrawToolInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.selectDataDrawingLayer)
        document.getElementById('output').innerHTML = ''
        drawingManager.getSource().clear();
        drawingManager.dispose()
    }
});