/****************************************************************************************************************************
 * 
 *   Simple Spatial Example Layer
 * 
 *  - addSimpleSpatial()
 *    
/****************************************************************************************************************************/
function addSimpleSpatial() {
    var delimitedFileUrl = 'data/Gpx/Route66Attractions.xml';

    //Create a data source and add it to the map.
    simpleSpatialDatasource = new atlas.source.DataSource();
    map.sources.add(simpleSpatialDatasource);

    //Add a simple data layer for rendering the data.
    simpleSpatialLayer = new atlas.layer.SimpleDataLayer(simpleSpatialDatasource);
    map.layers.add(simpleSpatialLayer);
    MyLayers.simpleSpatialLayer = simpleSpatialLayer
    //Read a CSV file from a URL or pass in a raw string.
    atlas.io.read(delimitedFileUrl).then(r => {
        if (r) {
            //Add the feature data to the data source.
            simpleSpatialDatasource.add(r);

            //If bounding box information is known for data, set the map view to it.
            if (r.bbox) {
                map.setCamera({
                    bounds: r.bbox,
                    padding: 50
                });
            }
        }
    });
}


/****************************************************************************************************************************
 * 
 *   Shapefile Example Layers
 * 
 *  - addSmallSHP()
 *    
/****************************************************************************************************************************/
//Create a data source to add your data to.
var shpFileDatasource;
function addSHPFileExamples(){
    shpFileDatasource = new atlas.source.DataSource();
    map.sources.add(shpFileDatasource);

    //Create a popup.
    popup = new atlas.Popup();

    //Add a layers for rendering the data.
    shpFileExamplelayers = [
        new atlas.layer.PolygonLayer(shpFileDatasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
            ] //Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(shpFileDatasource, null, {
            strokeColor: 'white',
            strokeWidth: 2,
            filter: ['any', ['==', ['geometry-type'], 'Polygon'],
                ['==', ['geometry-type'], 'MultiPolygon']
            ] //Only render Polygon or MultiPolygon in this layer.
        }),
        new atlas.layer.LineLayer(shpFileDatasource, null, {
            strokeColor: 'red',
            filter: ['any', ['==', ['geometry-type'], 'LineString'],
                ['==', ['geometry-type'], 'MultiLineString']
            ] //Only render LineString or MultiLineString in this layer.
        }),
        new atlas.layer.BubbleLayer(shpFileDatasource, null, {
            filter: ['any', ['==', ['geometry-type'], 'Point'],
                ['==', ['geometry-type'], 'MultiPoint']
            ] //Only render Point or MultiPoints in this layer.
        })
    ];

    map.layers.add(shpFileExamplelayers, 'labels');
    MyLayers.shpFileExamplelayers = shpFileExamplelayers
    console.log(MyLayers.shpFileExamplelayers)
    //Add a click event to the layers to show a popup of what the user clicked on.
    map.events.add('click', shpFileExamplelayers, shpExampleFeatureClicked);

    //Create a web worker that uses the shapefile-js library.
    var wfunc = function (base, cb) {
        importScripts('data/scripts/shp.min.js');
        shp(base).then(cb);
    };

    shpWorker = cw({
        data: wfunc
    }, 2);

}

function loadShapeFileExample(url) {
    // shpFileDatasource.clear();
    popup.close();
    document.getElementById('mainLoadingIcon').style.display = '';

    shpWorker.data(cw.makeUrl(url)).then(function (data) {
        //Load the shapefile into the data source.
        shpFileDatasource.add(data);

        //Bring the data into view on the map.
        map.setCamera({
            bounds: atlas.data.BoundingBox.fromData(data),
            padding: 50
        });

        document.getElementById('mainLoadingIcon').style.display = 'none';
    });
}

function shpExampleFeatureClicked(e) {
    //Make sure the event occurred on a shape feature.
    if (e.shapes && e.shapes.length > 0) {
        //By default, show the popup where the mouse event occurred.
        var pos = e.position;
        var offset = [0, 0];
        var properties;

        if (e.shapes[0] instanceof atlas.Shape) {
            properties = e.shapes[0].getProperties();

            //If the shape is a point feature, show the popup at the points coordinate.
            if (e.shapes[0].getType() === 'Point') {
                pos = e.shapes[0].getCoordinates();
                offset = [0, -18];
            }
        } else {
            properties = e.shapes[0].properties;

            //If the shape is a point feature, show the popup at the points coordinate.
            if (e.shapes[0].type === 'Point') {
                pos = e.shapes[0].geometry.coordinates;
                offset = [0, -18];
            }
        }

        //Update the content and position of the popup.
        popup.setOptions({
            //Create a table from the properties in the feature.
            content: atlas.PopupTemplate.applyTemplate(properties),
            position: pos,
            pixelOffset: offset
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

// simpleSpatial
$("#simpleSpatial").click(function () {
    if ($(this).is(":checked")) {
        $('.simpleSpatialInfo').css({
            display: "block"
        });
        addSimpleSpatial()
    } else {
        $('.simpleSpatialInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.simpleSpatialLayer)
    }
});

$("#shpFiles").click(function () {
    if ($(this).is(":checked")) {
        // addSHPFileExamples()
    } else {
        // try {
            $("#smallSHP").prop('checked', false);
            $('.smallSHPInfo').css({
                display: "none"
            });
            
            $("#medSHP").prop('checked', false);
            $('.medSHPInfo').css({
                display: "none"
            });
            $("#largeSHP").prop('checked', false);
            $('.largeSHPInfo').css({
                display: "none"
            });
            removeLayer(MyLayers.shpFileExamplelayers[0])
            removeLayer(MyLayers.shpFileExamplelayers[1])
            removeLayer(MyLayers.shpFileExamplelayers[2])
            removeLayer(MyLayers.shpFileExamplelayers[3])
        // } catch (err) {
        //     console.log(err)
        // }
    }
});
// smallSHP
$("#smallSHP").click(function () {
    if ($(this).is(":checked")) {
        $('.smallSHPInfo').css({
            display: "block"
        });
        addSHPFileExamples()
        loadShapeFileExample('data/shp/BikeRacks.zip') 
    } else {
        $('.smallSHPInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.shpFileExamplelayers[0])
        removeLayer(MyLayers.shpFileExamplelayers[1])
        removeLayer(MyLayers.shpFileExamplelayers[2])
        removeLayer(MyLayers.shpFileExamplelayers[3])

    }
});
// medSHP
$("#medSHP").click(function () {
    if ($(this).is(":checked")) {
        $('.medSHPInfo').css({
            display: "block"
        });
        addSHPFileExamples()
        loadShapeFileExample('data/shp/plzzip5.zip')
    } else {
        $('.medSHPInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.shpFileExamplelayers[0])
        removeLayer(MyLayers.shpFileExamplelayers[1])
        removeLayer(MyLayers.shpFileExamplelayers[2])
        removeLayer(MyLayers.shpFileExamplelayers[3])  
    }
});
// largeSHP
$("#largeSHP").click(function () {
    if ($(this).is(":checked")) {
        $('.largeSHPInfo').css({
            display: "block"
        });
        addSHPFileExamples()
        loadShapeFileExample('data/shp/Electric_Power_Transmission_Lines.zip')
    } else {
        $('.largeSHPInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.shpFileExamplelayers[0])
        removeLayer(MyLayers.shpFileExamplelayers[1])
        removeLayer(MyLayers.shpFileExamplelayers[2])
        removeLayer(MyLayers.shpFileExamplelayers[3])    }
});

