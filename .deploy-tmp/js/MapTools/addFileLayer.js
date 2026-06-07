/******************************************************************************************************************************
 * 
 * createPreviewMap 
 * 
 *  - Function creates a new map to preview the layer
 *    and file being added to the main map
 * 
 *  - Design options added to the preview layers are saved to
 *    the MyLayers object to be accessed when adding them
 *    to the main map
 *      - NOTE: Due to the nature of loading the layers/files
 *              to the preview map, loadShapeFile is called twice.
 *              Once when viewing them in the preview map and again
 *              when adding them to the main map
 *    
******************************************************************************************************************************/
var defaultPolygonOptions, defaultLineOptions, 
    defaultPointOptions, defaultSimpleOptions, 
    defaultOGCOptions;

//Create a popup
var popup = new atlas.Popup();

function createPreviewMap(){
     //Initialize a map instance.
     previewMap = new atlas.Map('previewMap', {
        // center: [-98.493928, 38.096798],
        // zoom: 4,
        // view: "Auto",
        center: [-94.6, 39.1],
        zoom: 3,
        view: 'Auto',
        style: 'grayscale_light',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'TfUWvWqVnTGKGMcIvxr5coNt7eiWrKxh6wJe0keVZSs'
        }
    });
    
    previewMap.events.add('ready', function () {
        //Create a data source and add it to the map.
        previewMapDatasource = new atlas.source.DataSource();
        previewMap.sources.add(previewMapDatasource);

        previewlayers = [
            //Used to configure design options for Polygon layers.
            new atlas.layer.PolygonLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	
            }),
            //Used to configure design options for Line layers.
            new atlas.layer.LineLayer(previewMapDatasource, null, {
                strokeColor: 'red',
            }),
            //Used to configure design options for Point layers.
            new atlas.layer.BubbleLayer(previewMapDatasource, null, {
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] 
            }),
            //Used to configure design options for Simple Layers
            // new atlas.layer.SimpleDataLayer(previewMapDatasource, null, {}),
            //Used to configure design options for OGC Layers
            // new atlas.layer.OgcMapLayer(previewMapDatasource, null, {}),
        ];
        // simpleSpatialLayer = new atlas.layer.SimpleDataLayer(previewMapDatasource, null, {});
        // ogcDataLayer = new atlas.layer.OgcMapLayer(previewMapDatasource, null, {});
        // Add layers to preview map
        previewMap.layers.add(previewlayers);

        // Get the options and set them as the default options for those layers
        defaultPolygonOptions = previewlayers[0].getOptions();
        defaultLineOptions = previewlayers[1].getOptions();
        defaultPointOptions = previewlayers[2].getOptions();

        // Call functions to update the layers
        updatePolygonLayer();
        updateLineLayer();
        updatePointLayer();
        // updateSimpleLayer();
        // updateOGCLayer();

        // console.log(previewlayers)

        // Add the layers with the options set during the updating processing 
        // to the global MyLayers object so they can be added to the main map
        MyLayers.newLayers = previewlayers;
        // MyLayers.simpleSpatialLayer = simpleSpatialLayer;
    })
}


/******************************************************************************************************************************
 * 
 * Load Shapefiles
 * 
 *  loadShapeFile()
 *  - Function is used to add shapefiles of any size
 *    to the map.    
 * 
 *  featureClicked()
 *  - Function is used to determine if a feature of the
 *    data has beem clicked to initiate the popup 
******************************************************************************************************************************/
function loadShapeFile(ds,mapInput,url) {
    var wfunc = function (base, cb) {
        importScripts('data/scripts/shp.min.js');
        shp(base).then(cb);
    };
    shpWorker = cw({ data: wfunc }, 2);

    // popup.close();
    // Check to see which map were loading the files into
    if(mapInput === previewMap){
        document.getElementById('previewLoadingIcon').style.display = '';
    }else{
        document.getElementById('mainLoadingIcon').style.display = '';
    }

    shpWorker.data(cw.makeUrl(url)).then(function (data) {

        //Load the shapefile into the data source.
        ds.add(data);

        //Bring the data into view on the map.
        mapInput.setCamera({
            bounds: atlas.data.BoundingBox.fromData(data),
            padding: 50
        });
        
        // Check to see which map were loading the files into
        if(mapInput === previewMap){
            document.getElementById('previewLoadingIcon').style.display = 'none';
        }else{
            document.getElementById('mainLoadingIcon').style.display = 'none';
        }  
    });
}

function featureClicked(e) {
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

/**************************************************************************************************************************************************
 * 
 * Add and Process Simple Spatial Files 
 *
 *  - addSimpleFileLayer(ds,mapinput,fileName)
 *      - Parameters:
 *          - ds : datasource associated with the specific map
 *          - mapinput : map to load files to
 *              > previewMap
 *              > map
 *          - fileName : File path to add in
 * 
 *      - Used to add basic spatial files, function supports reading:
 *          - KML 
 *          - KMZ 
 *          - GPX
 *          - GeoRSS
 *          - GML
 *          - GeoJSON
 *          - CSV (with spatial columns).
 *     
**************************************************************************************************************************************************/
var proxyServiceUrl = window.location.origin + '/Common/CorsEnabledProxyService.ashx?url=';

function addSimpleFileLayer(ds,mapinput,url,isAbsolute) {
    var imageLayers = [], imageIcons = [];

    if (!isAbsolute) {
        url = window.location.origin + url;
        console.log(url)
    }
    ds.clear();

    // Check to see which map were loading the files into
    if(mapinput === previewMap){
        document.getElementById('previewLoadingIcon').style.display = '';
    }else{
        document.getElementById('mainLoadingIcon').style.display = '';
    }

    //Remove any previously loaded icon images.
    if (imageIcons.length > 0) {
        for (var i = 0; i < imageIcons.length; i++) {
            mapinput.imageSprite.remove(imageIcons[i]);
        }
        imageIcons = [];
    }

    //Remove any previously loaded ground overlays.
    if (imageLayers.length > 0) {
        mapinput.layers.remove(imageLayers);
        imageLayers = [];
    }
    console.log(url)
    atlas.io.read(url, {
        //Proxy service for accessing cross domain assets that may not have CORs enabled.
        // proxyService: proxyServiceUrl
    }).then(async r => {
        console.log(r)
        if (r) {
            //Check to see if there are any icons in the data set that need to be loaded into the map resources.
            if (r.icons) {
                //For each icon image, create a promise to add it to the map, then run the promises in parrallel.
                var imagePromises = [];
                //The keys are the names of each icon image.
                imageIcons = Object.keys(r.icons);
                if (imageIcons.length !== 0) {
                    imageIcons.forEach(function (key) {
                        imagePromises.push(mapinput.imageSprite.add(key, r.icons[key]));
                    });
                    await Promise.all(imagePromises);
                }
            }
            //Load all features.
            if (r.features && r.features.length > 0) {
                ds.add(r.features);
            }
            //Load all ground overlays.
            if (r.groundOverlays && r.groundOverlays.length > 0) {
                mapinput.layers.add(r.groundOverlays);
                imageLayers = r.groundOverlays;
            }
            //If bounding box information is known for data, set the map view to it.
            if (r.bbox) {
                mapinput.setCamera({ bounds: r.bbox, padding: 50 });
            }
            // Check to see which map were loading the files into
            if(mapinput === previewMap){
                document.getElementById('previewLoadingIcon').style.display = 'none';
            }else{
                document.getElementById('mainLoadingIcon').style.display = 'none';
            }
        }
    });
}

/******************************************************************************************************************************
 * 
 *  Add and Upload Files Functions
 * 
 *  - These functions allow the user to add files from
 *    their local drive onto the map by first uploading
 *    the file to the web server allowing the azure maps
 *    to access the file 
 *    
 *    
******************************************************************************************************************************/
var fileNameURL;
var JSONFile
function stopDefault(event) {
    event.preventDefault();
    event.stopPropagation();
}


function addLargeFilesAndSubmit(event) {
    var files = event.target.files || event.dataTransfer.files;
    document.getElementsByClassName("largefilesfld").files = files;
    submitLargeFilesForm(document.getElementsByClassName("largefilesfrm"));
}

function submitLargeFilesForm(form) {
    var fd = new FormData();
    for (var i = 0; i < form.filesfld.files.length; i++) {
        var field = form.filesfld;
        fd.append(field.name, field.files[i], field.files[i].name);
    }
    var progress = document.getElementById("progress");
    var x = new XMLHttpRequest();
    if (x.upload) {
        x.upload.addEventListener("progress", function (event) {
            var percentage = parseInt(event.loaded / event.total * 100);
            progress.innerText = progress.style.width = percentage + "%";
        });
    }
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            progress.innerText = progress.style.width = "";
            // form.filesfld.value = "";
            console.log(x)
            if (x.status == 200) {
                JSONFile = JSON.parse(x.responseText);
                console.log(JSONFile[0])

                // Added files are moved via the web server to 'app/public/data/File Uploads'
                // Create a file name URL to pass into other functions to load the data
                fileNameURL = '/data/fileUploads' + JSONFile[0]
                console.log(fileNameURL)

                // Get and set the file information to the MyFiles object
                fileName = fileNameURL.split('.')[0]
                fileExtension = fileNameURL.split('.')[1]
                console.log(fileName)
                console.log(fileExtension)
                MyFiles.newFileURL = fileNameURL
                MyFiles.newFileName = fileName
                MyFiles.newFileExt = fileExtension

                //Check the file extensions for the file being uploaded
                try {
                    if(fileExtension === 'shp' || fileExtension === 'prj' || fileExtension === 'dbf' || fileExtension === 'cpg'){
                        console.log(fileName)
                        loadShapeFile(largeFileDatasource,map,fileName)
                    }
                    else if(fileExtension === 'zip'){
                        loadShapeFile(largeFileDatasource,map,fileNameURL)
                    }
                    else if(fileExtension === 'kml' || fileExtension === 'xml' || fileExtension === 'json' || fileExtension === 'csv' ){
                        addSimpleFileLayer(largeFileDatasource,map,fileNameURL)
                    }    
                } catch (error) {
                    console.log(error)

                }
            
            } else {
                // failed - TODO: Add code to handle server errors
            }
        }
    };
    x.open("post", form.action, true);
    x.send(fd);
    return false;
}
function addFilesAndSubmit(event) {
    var files = event.target.files || event.dataTransfer.files;
    document.getElementsByClassName("filesfld").files = files;
    submitFilesForm(document.getElementsByClassName("filesfrm"));
}
function submitFilesForm(form) {
    var fd = new FormData();
    for (var i = 0; i < form.filesfld.files.length; i++) {
        var field = form.filesfld;
        fd.append(field.name, field.files[i], field.files[i].name);
    }
    var progress = document.getElementById("progress");
    var x = new XMLHttpRequest();
    if (x.upload) {
        x.upload.addEventListener("progress", function (event) {
            var percentage = parseInt(event.loaded / event.total * 100);
            progress.innerText = progress.style.width = percentage + "%";
        });
    }
    x.onreadystatechange = function () {
        if (x.readyState == 4) {
            progress.innerText = progress.style.width = "";
            // form.filesfld.value = "";
            console.log(x)
            if (x.status == 200) {
                JSONFile = JSON.parse(x.responseText);
                console.log(JSONFile[0])

                // Added files are moved via the web server to 'app/public/data/File Uploads'
                // Create a file name URL to pass into other functions to load the data
                fileNameURL = '/data/fileUploads' + JSONFile[0]
                console.log(fileNameURL)

                // Get and set the file information to the MyFiles object
                fileName = fileNameURL.split('.')[0]
                fileExtension = fileNameURL.split('.')[1]
                console.log(fileName)
                console.log(fileExtension)
                MyFiles.newFileURL = fileNameURL
                MyFiles.newFileName = fileName
                MyFiles.newFileExt = fileExtension

                //Check the file extensions for the file being uploaded
                try {
                    if(fileExtension === 'shp' || fileExtension === 'prj' || fileExtension === 'dbf' || fileExtension === 'cpg'){
                        console.log(fileName)
                        loadShapeFile(previewMapDatasource,previewMap,fileName)
                    }
                    else if(fileExtension === 'zip'){
                        loadShapeFile(previewMapDatasource,previewMap,fileNameURL)
                    }
                    else if(fileExtension === 'kml' || fileExtension === 'xml' || fileExtension === 'json' || fileExtension === 'csv' ){
                        addSimpleFileLayer(previewMapDatasource,previewMap,fileNameURL)
                    }    
                } catch (error) {
                    console.log(error)

                }
            
            } else {
                // failed - TODO: Add code to handle server errors
            }
        }
    };
    x.open("post", form.action, true);
    x.send(fd);
    return false;
}

/****************************************************************************************************************************
 * 
 * createLayers
 * 
 *  -Function acts as the catalyst to add the layers
 *   to the main map by creating a new datasource
 *   and new layers associated with the main map
 *   and setting the options of the preview layers
 *   to the newly added layers
 *    
/****************************************************************************************************************************/
function createLayers(){
    console.log(map.layers.getLayers())
    map.events.add('ready', function () {
        //Create a data source and add it to the map.
        var newLayerDatasource = new atlas.source.DataSource();
        map.sources.add(newLayerDatasource);


        // Create new layers with a new datasource associated with the main map
        newlyAddedLayers = [
            new atlas.layer.PolygonLayer(newLayerDatasource, null, {}),
            new atlas.layer.LineLayer(newLayerDatasource, null, {}),
            new atlas.layer.BubbleLayer(newLayerDatasource, null, {}),
            // new atlas.layer.SimpleDataLayer(newLayerDatasource, null, {}),
            // new atlas.layer.OgcMapLayer(newLayerDatasource, null, {})
        ];
        // Get the options from the newlayers object
        polygonOptions = MyLayers.newLayers[0].options
        lineOptions = MyLayers.newLayers[1].options
        pointOptions = MyLayers.newLayers[2].options
        // simpleOptions = MyLayers.newLayers[3]._options
        // simpleOptions = MyLayers.simpleSpatialLayer._options
        // OGCOptions = MyLayers.newLayers[4].options

        // console.log("MyLayers: ",MyLayers.newLayers)
        // console.log("polygonOptions : ", polygonOptions)
        // console.log("lineOptions : ", lineOptions)
        // console.log("pointOptions : ", pointOptions)

        // Set the options for all the newlyAddedLayers
        newlyAddedLayers[0].setOptions(polygonOptions);
        newlyAddedLayers[1].setOptions(lineOptions);
        newlyAddedLayers[2].setOptions(pointOptions);

        // Set the datasource of the added layers to the new
        // datasource so it can be added to the main map
        newlyAddedLayers[0].options.source = newLayerDatasource
        newlyAddedLayers[1].options.source = newLayerDatasource
        newlyAddedLayers[2].options.source = newLayerDatasource
        
        // newlyAddedLayers[3]._datasource = newLayerDatasource
        // newlyAddedLayers[4].options.source = newLayerDatasource
        // console.log(newlyAddedLayers)

        // Add them to the map and reload the shapefile function
        map.layers.add(newlyAddedLayers, 'labels');
        ActiveLayers 
        console.log(map.layers.getLayers())
        console.log(newlyAddedLayers)

        //Add a click event to the layers to show a popup of what the user clicked on.
        map.events.add('click', newlyAddedLayers, featureClicked);
    

        // Check the file type of the new layer, files are loaded in differently
        // based on their extension type
        if (MyFiles.newFileExt === 'zip') {
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileURL)
        }
        else if (MyFiles.newFileExt === 'shp' || MyFiles.newFileExt === 'prj' || MyFiles.newFileExt === 'dbf' || MyFiles.newFileExt === 'cpg' ){
            loadShapeFile(newLayerDatasource,map,MyFiles.newFileName)
        }       
        else if(MyFiles.newFileExt === 'kml' || MyFiles.newFileExt === 'xml' || MyFiles.newFileExt === 'json' || MyFiles.newFileExt === 'csv' ){
            addSimpleFileLayer(newLayerDatasource,map,MyFiles.newFileURL)
        }    
    })
}
var largeFileDatasource = new atlas.source.DataSource();
 
function createLargeLayer(){
    console.log(map.layers.getLayers())
    map.events.add('ready', function () {
        //Create a data source and add it to the map.
        // var largeFileDatasource = new atlas.source.DataSource();
        map.sources.add(largeFileDatasource);


        // Create new layers with a new datasource associated with the main map
        newLargeFile = [
            new atlas.layer.PolygonLayer(largeFileDatasource, null, { 
                filter: ['any', ['==', ['geometry-type'], 'Polygon'], ['==', ['geometry-type'], 'MultiPolygon']]	}),
            new atlas.layer.LineLayer(largeFileDatasource, null, {        
                strokeColor: 'red',
        }),
            new atlas.layer.BubbleLayer(largeFileDatasource, null, {       
                filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] 
        }),
            // new atlas.layer.SimpleDataLayer(newLayerDatasource, null, {}),
            // new atlas.layer.OgcMapLayer(newLayerDatasource, null, {})
        ];

        // Add them to the map and reload the shapefile function
        map.layers.add(newLargeFile, 'labels');
         
        // console.log(map.layers.getLayers())
        // console.log(newlyAddedLayers)

        //Add a click event to the layers to show a popup of what the user clicked on.
        map.events.add('click', newLargeFile, featureClicked);
    

        // Check the file type of the new layer, files are loaded in differently
        // based on their extension type
        if (MyFiles.newFileExt === 'zip') {
            loadShapeFile(largeFileDatasource,map,MyFiles.newFileURL)
        }
        else if (MyFiles.newFileExt === 'shp' || MyFiles.newFileExt === 'prj' || MyFiles.newFileExt === 'dbf' || MyFiles.newFileExt === 'cpg' ){
            loadShapeFile(largeFileDatasource,map,MyFiles.newFileName)
        }       
        else if(MyFiles.newFileExt === 'kml' || MyFiles.newFileExt === 'xml' || MyFiles.newFileExt === 'json' || MyFiles.newFileExt === 'csv' ){
            addSimpleFileLayer(largeFileDatasource,map,MyFiles.newFileURL)
        }    
    })
}




/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/
// Create the layers when they click save changes
$("#saveFileBtn").click(function () { 
    createLayers()    
});
// Add the files and initiate the upload process
var fileupload = $(".filesfld");
$("#addFileBtn").click(function () {
    fileupload.click();
    // fileupload.change(function () {
    //     var fileName = MyFiles
    //     // fileName = document.getElementById("fileUpload").files[0].path
    //     console.log(fileName)
    // })
});
var largefileupload = $(".largefilesfld");

$("#addLargeFileBtn").click(function () {
    largefileupload.click();
    createLargeLayer()    
    // fileupload.change(function () {
    //     var fileName = MyFiles
    //     // fileName = document.getElementById("fileUpload").files[0].path
    //     console.log(fileName)
    // })
});



