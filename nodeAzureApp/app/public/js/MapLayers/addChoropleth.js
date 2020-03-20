var polygonLayer,extrudedPolygonLayer;
var defaultColor = '';
var colorScale = [];


function addChoropleth() {

    var popup, maxValue = 500;
    polygonLayer;
    defaultColor = '#FFEDA0';
    colorScale = [
        10, '#FED976',
        20, '#FEB24C',
        50, '#FD8D3C',
        100, '#FC4E2A',
        200, '#E31A1C',
        500, '#BD0026',
        1000, '#800026'
    ];
    // Set camera to view map layer
    map.setCamera({
        center: [-110, 50],
        zoom: 3,
        view: 'Auto' 
    });

    //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup({
        position: [0, 0]
    });

    //Create a data source and add it to the map.
    var datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Create a stepped expression based on the color scale. 
    var steppedExp = [
        'step',
        ['get', 'density'],
        defaultColor
    ];

    steppedExp = steppedExp.concat(colorScale);

    //Create a layer to render the polygon data.
    polygonLayer = new atlas.layer.PolygonLayer(datasource, null, {
        fillColor: steppedExp
    });
    map.layers.add(polygonLayer, 'labels');
    MyLayers.choroplethLayer = polygonLayer;
    
    //Add a mouse move event to the polygon layer to show a popup with information.
    map.events.add('mousemove', polygonLayer, function (e) {
        if (e.shapes && e.shapes.length > 0) {
            var properties = e.shapes[0].getProperties();

            //Update the content of the popup.
            popup.setOptions({
                content: '<div style="padding:10px"><b>' + properties.name + '</b><br/>Population Density: ' + properties.density + ' people/mi<sup>2</sup></div>',
                position: e.position
            });

            //Open the popup.
            popup.open(map);
        }
    });

    //Add a mouse leave event to the polygon layer to hide the popup.
    map.events.add('mouseleave', polygonLayer, function (e) {
        popup.close();
    });

    //Download a GeoJSON feed and add the data to the data source.
    datasource.importDataFromUrl('data/geojson/US_States_Population_Density.json');
    
}



function addExtrudedChoropleth(){
    
    defaultColor = '#00ff80';
    colorScale = [
        10, '#09e076',
        20, '#0bbf67',
        50, '#f7e305',
        100, '#f7c707',
        200, '#f78205',
        500, '#f75e05',
        1000, '#f72505'
    ];
    //Create a data source to add your data to.
    var datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Load a dataset of polygons that have metadata we can style against.
    datasource.importDataFromUrl('data/geojson/US_States_Population_Density.json');

    //Create a stepped expression based on the color scale.
    var steppedExp = [
        'step',
        ['get', 'density'],
        defaultColor
    ];
    steppedExp = steppedExp.concat(colorScale);

    //Create and add a polygon extrusion layer to the map below the labels so that they are still readable.
    extrudedPolygonLayer = new atlas.layer.PolygonExtrusionLayer(datasource, null, {
        base: 100,
        fillColor: steppedExp,
        fillOpacity: 0.7,
        height: [
            'interpolate',
            ['linear'],
            ['get', 'density'],
            0, 100,
            1200, 960000
        ]
    })
    map.layers.add(extrudedPolygonLayer, 'labels');
    MyLayers.extrudedPolygonLayer = extrudedPolygonLayer;

    // Set camera to view map layer
    map.setCamera({
        center: [-94.6, 39.1],
        zoom: 3,
    
        //Pitch the map so that the extrusion of the polygons is visible.
        pitch: 45,
        view: 'Auto'
    });
}

//Create the Legend
function createLegend(id) {
    var html = ['<div id="legendItem">'];
    
    html.push('<i style="background:', defaultColor, '"></i> 0-', colorScale[0], '<br/>');
    
    for (var i = 0; i < colorScale.length; i += 2) {
        html.push(
            '<i style="background:', (colorScale[i + 1]), '"></i> ',
            colorScale[i], (colorScale[i + 2] ? '&ndash;' + colorScale[i + 2] + '<br/>' : '+')
        );
    }

    document.getElementById(id).innerHTML += html.join('');
}
    //Create a legend(we run it here because we only want one)
