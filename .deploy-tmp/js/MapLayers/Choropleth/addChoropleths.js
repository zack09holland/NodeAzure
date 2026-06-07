/*******************************************************************************************************************************************************************
 * 
 *  Variables
 *    
*******************************************************************************************************************************************************************/
var choroplethLayer, extrudedPolygonLayer;
var defaultColor = '';
var colorScale = [];


/*******************************************************************************************************************************************************************
 * 
 *  Simple Choropleth
 *
 *  - addChoropleth()
 *      - Creates a simple choropleth example layer
 *    
*******************************************************************************************************************************************************************/
function addChoropleth() {

    choroplethLayer;
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
        center: [-94.6, 39.1],
        zoom: 3,
        pitch: 0,
        view: 'Auto'
    });

    //Create a popup but leave it closed so we can update it and display it later.
    var popup = new atlas.Popup({
        position: [0, 0]
    });

    //Create a data source and add it to the map.
    var choroplethLayerDatasource = new atlas.source.DataSource();
    map.sources.add(choroplethLayerDatasource);

    //Create a stepped expression based on the color scale. 
    var steppedExp = [
        'step',
        ['get', 'density'],
        defaultColor
    ];

    steppedExp = steppedExp.concat(colorScale);

    //Create a layer to render the polygon data.
    choroplethLayer = new atlas.layer.PolygonLayer(choroplethLayerDatasource, null, {
        fillColor: steppedExp
    });
    map.layers.add(choroplethLayer, 'labels');
    MyLayers.choroplethLayer = choroplethLayer;
    console.log("MyLayers.choroplethLayer: ",MyLayers.choroplethLayer)
    //Add a mouse move event to the polygon layer to show a popup with information.
    map.events.add('mousemove', choroplethLayer, function (e) {
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
    map.events.add('mouseleave', choroplethLayer, function (e) {
        popup.close();
    });

    //Download a GeoJSON feed and add the data to the data source.
    choroplethLayerDatasource.importDataFromUrl('data/geojson/US_States_Population_Density.json');

}


/*******************************************************************************************************************************************************************
 * 
 *  Extruded Choropleth
 * 
 *  - addExtrudedChoropleth()
 *      - Creates an extruded choropleth example layer
 *    
*******************************************************************************************************************************************************************/
function addExtrudedChoropleth() {

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
    var addExtrudedChoroplethDatasource = new atlas.source.DataSource();
    map.sources.add(addExtrudedChoroplethDatasource);

    //Load a dataset of polygons that have metadata we can style against.
    addExtrudedChoroplethDatasource.importDataFromUrl('data/geojson/US_States_Population_Density.json');

    //Create a stepped expression based on the color scale.
    var steppedExp = [
        'step',
        ['get', 'density'],
        defaultColor
    ];
    steppedExp = steppedExp.concat(colorScale);

    //Create and add a polygon extrusion layer to the map below the labels so that they are still readable.
    extrudedChoroplethLayer = new atlas.layer.PolygonExtrusionLayer(addExtrudedChoroplethDatasource, null, {
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
    map.layers.add(extrudedChoroplethLayer, 'labels');
    // Add layer to MyLayers so it can be removed
    MyLayers.extrudedChoroplethLayer = extrudedChoroplethLayer;

    // Set camera to view map layer
    map.setCamera({
        center: [-94.6, 39.1],
        zoom: 3,

        //Pitch the map so that the extrusion of the polygons is visible.
        pitch: 45,
        view: 'Auto'
    });
}

/*******************************************************************************************************************************************************************
 * 
 *  Legends
 * 
 *  - createLegend()
 *      - Creates the legend for the simple and extruded example layers
 * 
*******************************************************************************************************************************************************************/
function createLegend(id) {
    var html = ['<div id="' + id + 'Item">'];

    html.push('<i style="background:', defaultColor, '"></i> 0-', colorScale[0], '<br/>');

    for (var i = 0; i < colorScale.length; i += 2) {
        html.push(
            '<i style="background:', (colorScale[i + 1]), '"></i> ',
            colorScale[i], (colorScale[i + 2] ? '&ndash;' + colorScale[i + 2] + '<br/>' : '+')
        );
    }

    document.getElementById(id).innerHTML += html.join('');
}

/*******************************************************************************************************************************************************************
 * 
 *  County Choropleth
 * 
 *  - addCountyChoropleth()
 *      - Creates an extruded choropleth example layer
 *
 *  - createCountyLegendScaleBar()
 *      - Create a legend for the county choropleth
*******************************************************************************************************************************************************************/
function addCountyChoropleth() {
    var popup, maxScale = 30,
        colorExpressions = [];
    //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup({
        position: [0, 0]
    });

    //Create a data source and add it to the map.
    countyPolygonDatasource = new atlas.source.DataSource();
    map.sources.add(countyPolygonDatasource);

    //Create an array of expressions to define the fill color based on 
    for (var i = 0; i <= 10; i++) {
        colorExpressions.push([
            'interpolate',
            ['linear'],
            ['get', 'PopChange' + i],
            -maxScale, 'rgb(255,0,255)', // Magenta
            -maxScale / 2, 'rgb(0,0,255)', // Blue
            0, 'rgb(0,255,0)', // Green
            maxScale / 2, 'rgb(255,255,0)', // Yellow
            maxScale, 'rgb(255,0,0)' // Red
        ]);
    }

    //Create a layer to render the polygon data.
    var countyPolygonLayer = new atlas.layer.PolygonLayer(countyPolygonDatasource, null, {
        fillColor: colorExpressions[0]
    });
    map.layers.add(countyPolygonLayer, 'labels');
    MyLayers.countyPolygonLayer = countyPolygonLayer;

    //Add a mouse move event to the polygon layer to show a popup with information.
    map.events.add('mousemove', countyPolygonLayer, function (e) {
        if (e.shapes && e.shapes.length > 0) {
            var properties = e.shapes[0].getProperties();

            var html = ['<div style="padding:10px"><b>', properties.CountyName, '</b><br />', properties.StateName, '<br />% Pop Change:<br/><table><tr><td>Year</td><td>% Change</td></tr>'];

            for (var i = 0; i <= 10; i++) {
                var year = 2000 + i;
                html.push('<tr><td>', year, '</td><td>', properties['PopChange' + i], '%</td></tr>');
            }

            html.push('</table></div>');

            //Update the content of the popup.
            popup.setOptions({
                content: html.join(''),
                position: e.position
            });

            //Open the popup.
            popup.open(map);
        }
    });

    //Add a mouse leave event to the polygon layer to hide the popup.
    map.events.add('mouseleave', countyPolygonLayer, function (e) {
        popup.close();
    });

    //TODO: Update to use spatial io module.

    //Download population estimates for US counties.
    fetch('data/geojson/US_County_2010_Population.csv')
        .then(response => response.text())
        .then(function (text) {
            //Parse the CSV file data into a JSON object.
            //For faster cross referencing, create an object that indexes the state and county ids.
            var populationInfo = [];

            //Split the lines of the file.
            var lines = text.split('\n');
            var row, stateId, countyId, censusPop, obj, j;

            //Skip the header row and then parse each row into an object.
            for (var i = 1; i < lines.length; i++) {
                row = lines[i].split(',');

                stateId = row[0];
                countyId = row[1];

                if (!populationInfo[stateId]) {
                    populationInfo[stateId] = {};
                }

                //Get the 2000 population value.
                censusPop = parseFloat(row[4]);

                //Create an object to parse the CSV row into.
                obj = {
                    CountyName: row[3],
                    StateName: row[2],
                    CensusPop2000: censusPop
                };

                //Calculate the population % difference from 2000 census, and round to 1 decimal place.
                for (j = 5; j < row.length; j++) {
                    obj['PopChange' + (j - 5)] = Math.round((parseFloat(row[j]) / censusPop - 1) * 100 * 10) / 10;
                }

                populationInfo[stateId][countyId] = obj;
            }

            //Download the county boundary GeoJSON data.
            fetch('data/geojson/US_County_Boundaries.json')
                .then(function (response) {
                    return response.json();
                }).then(function (response) {
                    var features = response.features;

                    //Loop through each feature and cross reference the population data information.
                    for (var i = 0; i < features.length; i++) {
                        var prop = features[i].properties;

                        if (populationInfo[prop['STATE']] && populationInfo[prop['STATE']][prop['COUNTY']]) {
                            features[i].properties = Object.assign(prop, populationInfo[prop['STATE']][prop['COUNTY']]);
                        }
                    }

                    //Add the feature data to the data source.
                    countyPolygonDatasource.add(features);

                });
        });
}


/*******************************************************************************************************************************************************************
 * 
 *  Animated Choropleth
 * 
 *
 *  - addAnimatedChoropleth()
 *      - Creates the legend for the animated choropleth example layer
 * 
 *  - createLegendScaleBar()
 *      - Creates a color scale bar for the animated choropleth
 * 
 *  - togglePlayPause()
 *      - Allows the animated choropleth to be updated with new colors associated with new data
 * 
 *  - FrameAnimationTimer()
 *      - Updates the displayed year the animated choropleth is showing data for
*******************************************************************************************************************************************************************/
var isPaused = true;
var timer;

function addAnimatedChoropleth() {

    var popup, maxScale = 30,
        colorExpressions = [];

    //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup({
        position: [0, 0]
    });
    //Create a data source and add it to the map.
    var animatedChoroplethDatasource = new atlas.source.DataSource();
    map.sources.add(animatedChoroplethDatasource);

    //Create an array of expressions to define the fill color based on 
    for (var i = 0; i <= 10; i++) {
        colorExpressions.push([
            'interpolate',
            ['linear'],
            ['get', 'PopChange' + i],
            -maxScale, 'rgb(255,0,255)', // Magenta
            -maxScale / 2, 'rgb(0,0,255)', // Blue
            0, 'rgb(0,255,0)', // Green
            maxScale / 2, 'rgb(255,255,0)', // Yellow
            maxScale, 'rgb(255,0,0)' // Red
        ]);
    }

    //Create a layer to render the polygon data.
    animatedChoroplethLayer = new atlas.layer.PolygonLayer(animatedChoroplethDatasource, null, {
        fillColor: colorExpressions[0]
    });
    map.layers.add(animatedChoroplethLayer, 'labels');
    MyLayers.animatedChoroplethLayer = animatedChoroplethLayer;
    //Add a mouse move event to the polygon layer to show a popup with information.
    map.events.add('mousemove', animatedChoroplethLayer, function (e) {
        if (e.shapes && e.shapes.length > 0) {
            var properties = e.shapes[0].getProperties();

            var html = ['<div style="padding:10px"><b>', properties.CountyName, '</b><br />', properties.StateName, '<br />% Pop Change:<br/><table><tr><td>Year</td><td>% Change</td></tr>'];

            for (var i = 0; i <= 10; i++) {
                var year = 2000 + i;
                html.push('<tr><td>', year, '</td><td>', properties['PopChange' + i], '%</td></tr>');
            }

            html.push('</table></div>');

            //Update the content of the popup.
            popup.setOptions({
                content: html.join(''),
                position: e.position
            });

            //Open the popup.
            popup.open(map);
        }
    });

    //Add a mouse leave event to the polygon layer to hide the popup.
    map.events.add('mouseleave', animatedChoroplethLayer, function (e) {
        popup.close();
    });

    //TODO: Update to use spatial io module.

    //Download population estimates for US counties.
    fetch('data/geojson/US_County_2010_Population.csv')
        .then(response => response.text())
        .then(function (text) {
            //Parse the CSV file data into a JSON object.
            //For faster cross referencing, create an object that indexes the state and county ids.
            var populationInfo = [];

            //Split the lines of the file.
            var lines = text.split('\n');
            var row, stateId, countyId, censusPop, obj, j;

            //Skip the header row and then parse each row into an object.
            for (var i = 1; i < lines.length; i++) {
                row = lines[i].split(',');

                stateId = row[0];
                countyId = row[1];

                if (!populationInfo[stateId]) {
                    populationInfo[stateId] = {};
                }

                //Get the 2000 population value.
                censusPop = parseFloat(row[4]);

                //Create an object to parse the CSV row into.
                obj = {
                    CountyName: row[3],
                    StateName: row[2],
                    CensusPop2000: censusPop
                };

                //Calculate the population % difference from 2000 census, and round to 1 decimal place.
                for (j = 5; j < row.length; j++) {
                    obj['PopChange' + (j - 5)] = Math.round((parseFloat(row[j]) / censusPop - 1) * 100 * 10) / 10;
                }
                populationInfo[stateId][countyId] = obj;
            }

            //Download the county boundary GeoJSON data.
            fetch('data/geojson/US_County_Boundaries.json')
                .then(function (response) {
                    return response.json();
                }).then(function (response) {
                    var features = response.features;

                    //Loop through each feature and cross reference the population data information.
                    for (var i = 0; i < features.length; i++) {
                        var prop = features[i].properties;

                        if (populationInfo[prop['STATE']] && populationInfo[prop['STATE']][prop['COUNTY']]) {
                            features[i].properties = Object.assign(prop, populationInfo[prop['STATE']][prop['COUNTY']]);
                        }
                    }

                    //Add the feature data to the data source.
                    animatedChoroplethDatasource.add(features);

                    //Create an animation loop. 
                    timer = new FrameAnimationTimer(function (progress, frameIdx) {
                        //Update the fill color expression for the current frame.
                        animatedChoroplethLayer.setOptions({
                            fillColor: colorExpressions[frameIdx]
                        });

                        //Update the year in the legend.
                        document.getElementsByClassName('animatedlegend-label')[0].innerText = (2000 + frameIdx) + '';
                    }, colorExpressions.length, 10000, true);

                    document.getElementById('playPauseBtn').disabled = '';
                });
        });
}

function createLegendScaleBar() {
    var canvas = document.getElementById('animatedLegendCanvas');
    var ctx = canvas.getContext('2d');

    //Create a linear gradient for the legend.
    var grd = ctx.createLinearGradient(0, 0, 256, 0);
    grd.addColorStop(0, 'rgb(255,0,255)'); // Magenta
    grd.addColorStop(0.25, 'rgb(0,0,255)'); // Blue
    grd.addColorStop(0.5, 'rgb(0,255,0)'); // Green
    grd.addColorStop(0.75, 'rgb(255,255,0)'); // Yellow
    grd.addColorStop(1, 'rgb(255,0,0)'); // Red

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function togglePlayPause() {
    if (isPaused) {
        timer.play();
    } else {
        timer.pause();
    }
    isPaused = !isPaused;
}

function FrameAnimationTimer(renderFrameCallback, numFrames, duration, loop) {
    var _timerId,
        frameIdx = 0,
        _isPaused = false;

    duration = (duration && duration > 0) ? duration : 1000;

    delay = duration / (numFrames - 1);

    this.play = function () {
        if (renderFrameCallback) {
            if (_timerId) {
                _isPaused = false;
            } else {
                _timerId = setInterval(function () {
                    if (!_isPaused) {
                        var progress = (frameIdx * delay) / duration;
                        renderFrameCallback(progress, frameIdx);
                        if (progress >= 1) {
                            if (loop) {
                                frameIdx = 0;
                            } else {
                                reset();
                            }
                        }
                        frameIdx++;
                    }
                }, delay);
            }
        }
    };

    this.pause = function () {
        _isPaused = true;
    };

    this.stop = function () {
        reset();
    };

    function reset() {
        if (_timerId != null) {
            clearInterval(_timerId);
        }
        frameIdx = 0;
        _isPaused = false;
    }
};





/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/
// choroplethItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#choroplethItems").click(function () {
    if ($(this).is(":checked")) {

    } else {
        // try {
            $("#simpleChoropleth").prop('checked', false);
            $('.choroplethInfo').css({
                display: "none"
            });
            $("#legendItem").remove();
            removeLayer(MyLayers.choroplethLayer)
            
            $("#countyChoropleth").prop('checked', false);
            $('.countyChoroplethInfo').css({
                display: "none"
            });
            removeLayer(MyLayers.countyPolygonLayer)

            // $("#extrudedChoropleth").prop('checked', false);
            // $('.extrudedChoroplethInfo').css({
            //     display: "none"
            // });
            // $("#extrudedLegendItem").remove();
            // removeLayer(MyLayers.extrudedChoroplethLayer)

            // $("#animatedChoropleth").prop('checked', false);
            // $('.animatedChoroplethInfo').css({
            //     display: "none"
            // });
            // removeLayer(MyLayers.animatedChoroplethLayer)
        // } catch (err) {
        //     console.log(err)
        // }
    }
});

// simpleChoropleth
$("#simpleChoropleth").click(function () {
    if ($(this).is(":checked")) {
        $('.choroplethInfo').css({
            display: "block"
        });
        addChoropleth();
        createLegend('legend');
    } else {
        $('.choroplethInfo').css({
            display: "none"
        });
        $("#legendItem").remove();
        removeLayer(MyLayers.choroplethLayer)
    }
});

// extrudedChoropleth
$("#extrudedChoropleth").click(function () {
    if ($(this).is(":checked")) {
        $('.extrudedChoroplethInfo').css({
            display: "block"
        });
        addExtrudedChoropleth();
        createLegend('extrudedLegend');
    } else {
        $('.extrudedChoroplethInfo').css({
            display: "none"
        });
        $("#extrudedLegendItem").remove();
        removeLayer(MyLayers.extrudedChoroplethLayer)
    }
});

// animatedChoropleth
$("#animatedChoropleth").click(function () {
    if ($(this).is(":checked")) {
        $('.animatedChoroplethInfo').css({
            display: "block"
        });
        addAnimatedChoropleth();
        createLegendScaleBar();
    } else {
        $('.animatedChoroplethInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.animatedChoroplethLayer)
    }
});
// countyChoropleth
$("#countyChoropleth").click(function () {
    if ($(this).is(":checked")) {
        $('.countyChoroplethInfo').css({
            display: "block"
        });
        addCountyChoropleth();
        // createCountyLegendScaleBar();
    } else {
        $('.countyChoroplethInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.countyPolygonLayer)
    }
});

