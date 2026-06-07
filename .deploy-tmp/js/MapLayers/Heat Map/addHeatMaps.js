/*******************************************************************************************************************************************************************
 * 
 * Variables
 * 
*******************************************************************************************************************************************************************/
var magWeight = [
    'interpolate',
    ['exponential', 2], //Using an exponential interpolation since earthquake magnitudes are on an exponential scale.
    ['get', 'mag'],
    0, 0,
    10, 1
];
var heatGradients = [
    //Default
    [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(0,0,255,0)",
        0.1, "royalblue",
        0.3, "cyan",
        0.5, "lime",
        0.7, "yellow",
        1, "red"
    ],

    //Default with semi-transparent black mask
    [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(0,0,0,0.5)",
        0.1, "royalblue",
        0.3, "cyan",
        0.5, "lime",
        0.7, "yellow",
        1, "red"
    ],

    //Color Spectur
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.01, 'navy',
        0.25, 'blue',
        0.5, 'green',
        0.75, 'yellow',
        1, 'red'
    ],

    //Incandescent
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.01, 'black',
        0.33, 'darkred',
        0.66, 'yellow',
        1, 'white'
    ],

    //Heated Metal
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.01, 'black',
        0.25, 'purple',
        0.5, 'red',
        0.75, 'yellow',
        1, 'white'
    ],

    //Sunrise
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.01, 'red',
        0.66, 'yellow',
        1, 'white'
    ],

    //Sunrise
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.01, '#feb24c',
        0.03, '#feb24c',
        0.5, '#fd8d3c',
        0.7, '#fc4e2a',
        1, '#e31a1c'
    ],

    //Light blue to red
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
    ],

    //Gray to Aqua Green
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(236,222,239,0)',
        0.2, 'rgb(208,209,230)',
        0.4, 'rgb(166,189,219)',
        0.6, 'rgb(103,169,207)',
        0.8, 'rgb(28,144,153)'
    ],

    //Purple, pink, light blue
    [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'transparent',
        0.01, 'purple',
        0.5, '#fb00fb',
        1, '#00c3ff'
    ],

    //Stepped Colors - navy, green, yellow, red
    [
        'step',
        ['heatmap-density'],
        'transparent',
        0.01, 'navy',
        0.25, 'green',
        0.50, 'yellow',
        0.75, 'red'
    ],

    //Stepped Colors - White to pink to purple
    [
        'step',
        ['heatmap-density'],
        'transparent',
        0.01, '#fff7f3',
        0.12, '#fde0de',
        0.23, '#fcc5c0',
        0.34, '#f99fb5',
        0.45, '#f767a1',
        0.56, '#dd3497',
        0.67, '#ae017e',
        0.78, '#790277',
        0.89, '#48006a'
    ],

    //Stepped Colors
    [
        'step',
        ['heatmap-density'],
        'transparent',
        0.01, '#03939c',
        0.17, '#5ebabf',
        0.33, '#bae1e2',
        0.49, '#f8c0aa',
        0.66, '#dd7755',
        0.83, '#c22e00'
    ],
];
var removeDefaults, selectedGradientIdx = 0;
var heatMapLayer, defaultOptions;
/**********************************************************************************************************************
 * 
 *  Heat Map w/ Options Example Layer
 *      
 *  - heatMapOptions()
 *      - Creates the data for a heat map layer
 * 
 *  - updateHeatMapLayer()
 *      - Gets the design options and updates the heat map layer
 * 
 *  - getHeatMapInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getHMPropertyValue()
 *      - Gets the property value of the elements 
 *  
 *  - HMOptionsOpenTab()
 *      - Opens the tab within the bubble layer options window   
 * 
 *  - createGradientOptions()
 *      - Creates gradient color options
 * 
 *  - gradientSelected()
 *      - Returns selected gradient color    
 * 
 *  - toggleGradientDropdown()
 *      - Toggles the drop down showing all the available gradient color choices
**********************************************************************************************************************/
function heatMapOptions() {
    //CreateGradientOptions
    createGradientOptions();
    //Create a data source and add it to the map.
    heatMapOptionsdatasource = new atlas.source.DataSource();
    map.sources.add(heatMapOptionsdatasource);
    //Load a data set of points, in this case all earthquakes from the past 30 days.
    heatMapOptionsdatasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson');

    //Create a heat map layer and add it to the map.
    heatMapOptionsLayer = new atlas.layer.HeatMapLayer(heatMapOptionsdatasource);
    map.layers.add(heatMapOptionsLayer, 'labels');

    // Add layer to the MyLayers Object so it can be removed
    MyLayers.heatMapOptionsLayer = heatMapOptionsLayer


    defaultOptions = heatMapOptionsLayer.getOptions();

    //Update the heat map layer with the options in the input fields.
    gradientSelected(document.getElementById('gradientDropdown').childNodes[0], 0);
    toggleGradientDropdown();
}

function updateHeatMapLayer() {
    var heatMapOptions = getHeatMapInputOptions();
    heatMapOptionsLayer.setOptions(heatMapOptions);

    document.getElementById('hmCodeOutput').value = JSON.stringify(heatMapOptions, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getHeatMapInputOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    return {
        color: (removeDefaults && selectedGradientIdx == 0) ? undefined : heatGradients[selectedGradientIdx],
        radius: getHMPropertyValue('radius', parseFloat(document.getElementById('hmRadius').value)),
        opacity: getHMPropertyValue('opacity', parseFloat(document.getElementById('hmOpacity').value)),
        intensity: getHMPropertyValue('intensity', parseFloat(document.getElementById('Intensity').value)),
        weight: document.getElementById('Weight').checked ? magWeight : 1,
        minZoom: getHMPropertyValue('minZoom', parseFloat(document.getElementById('hmMinZoom').value)),
        maxZoom: getHMPropertyValue('maxZoom', parseFloat(document.getElementById('hmMaxZoom').value)),
        visible: getHMPropertyValue('visible', document.getElementById('Visible').checked)
    };
}

function getHMPropertyValue(propertyName, value) {
    if (removeDefaults && defaultOptions[propertyName] === value) {
        return undefined;
    }

    return value;
}


function HMOptionsOpenTab(elm, tabName) {
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

function createGradientOptions() {
    var html = [];
    for (var i = 0; i < heatGradients.length; i++) {
        var canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 15;

        var ctx = canvas.getContext('2d');
        var grd = ctx.createLinearGradient(0, 0, 150, 0);

        if (heatGradients[i][0] === 'interpolate' && heatGradients[i][1][0] === 'linear') {
            for (var j = 3; j < heatGradients[i].length; j += 2) {
                grd.addColorStop(heatGradients[i][j], heatGradients[i][j + 1]);
            }
        } else if (heatGradients[i][0] === 'step') {
            grd.addColorStop(0, heatGradients[i][2]);

            for (var j = 3; j < heatGradients[i].length - 1; j += 2) {
                grd.addColorStop(heatGradients[i][j], heatGradients[i][j + 1]);

                if ((j + 3) < heatGradients[i].length && (heatGradients[i][j] - 0.001) <= 1) {
                    grd.addColorStop(heatGradients[i][j + 2] - 0.001, heatGradients[i][j + 1]);
                }
            }

            grd.addColorStop(1, heatGradients[i][heatGradients[i].length - 1]);
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 150, 15);

        html.push('<a href="javascript:void(0)" onclick="gradientSelected(this, ', i, ');"><img src="', canvas.toDataURL(), '"/></a>');
    }

    document.getElementById('gradientDropdown').innerHTML = html.join('');
}

function gradientSelected(elm, idx) {
    selectedGradientIdx = idx;
    updateHeatMapLayer();
    console.log(elm)
    document.getElementById('gradientDropdownBtn').style.backgroundImage = 'url(' + elm.childNodes[0].src + ')';
    toggleGradientDropdown();
}

function toggleGradientDropdown() {
    document.getElementById("gradientDropdown").classList.toggle("show");
}






/*******************************************************************************************************************************************************************
 * 
 *  Clustered Heat Map Example Layer
 *      
 *  - clusteredHeatMap()
 *      - Creates the data for a heat map layer
 * 
 * 
*******************************************************************************************************************************************************************/

function clusteredHeatMap() {
    //Create a data source and add it to the map.
    clusteredHMdatasource = new atlas.source.DataSource(null, {
        //Tell the data source to cluster point data.
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 15
    });
    map.sources.add(clusteredHMdatasource);

    //Create a heatmap and add it to the map.
    clusteredHeatMapLayer = new atlas.layer.HeatMapLayer(clusteredHMdatasource, null, {
        //Set the weight to the point_count property of the data points.
        weight: ['get', 'point_count'],

        //Optionally adjust the radius of each heat point.
        radius: 20
    });
    map.layers.add(clusteredHeatMapLayer, 'labels');
    MyLayers.clusteredHeatMapLayer = clusteredHeatMapLayer;

    // Change style and camera if need be
    // map.setStyle({
    //     style: 'grayscale_dark'
    // })
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });

    //Load a data set of points, in this case earthquake data from the USGS.
    clusteredHMdatasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson');
}





/*******************************************************************************************************************************************************************
 * 
 *  Consistent Heat Map Example Layer
 *      
 *  - consistentHeatMap()
 *      - Creates the data for a heat map layer
 * 
 * 
*******************************************************************************************************************************************************************/
function consistentHeatMap() {
    //Create a data source and add it to the map.
    consistentHMDatasource = new atlas.source.DataSource();
    map.sources.add(consistentHMDatasource);

    //Load a data set of points, in this case some sample point of interest data.
    consistentHMDatasource.importDataFromUrl('data/geojson/SamplePoiDataSet.json');

    //Create a heatmap and add it to the map.
    consistentHeatMapLayer = new atlas.layer.HeatMapLayer(consistentHMDatasource, null, {
        radius: [
            'interpolate',
            ['exponential', 2],
            ['zoom'],
            //For all zoom levels 10 or lower, set the radius to 2 pixels.
            10, 2,

            //Between zoom level 10 and 22, exponentially scale the radius from 2 pixels to 50000 pixels.
            22, 50000
        ]
    });
    map.layers.add(consistentHeatMapLayer, 'labels');
    MyLayers.consistentHeatMapLayer = consistentHeatMapLayer;
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });
};

/*******************************************************************************************************************************************************************
 * 
 *  Weighted Heat Map Example Layer
 *      
 *  - weightedHeatMap()
 *      - Creates the data for a heat map layer
 * 
 * 
*******************************************************************************************************************************************************************/

function weightedHeatMap() {
    //Create a data source and add it to the map.
    weightedHMDatasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Load a data set of points, in this case earthquake data from the USGS.
    weightedHMDatasource.importDataFromUrl('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');

    //Create a heatmap and add it to the map.
    weightedHeatMapLayer = new atlas.layer.HeatMapLayer(weightedHMDatasource, null, {
        weight: [
            'interpolate',
            ['exponential', 2], //Using an exponential interpolation since earthquake magnitudes are on an exponential scale.
            ['get', 'mag'],
            0, 0,
            6, 1 //Any earthquake above a magnitude of 6 will have a weight of 1
        ],
        radius: [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            22, 200
        ],
        color: [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)'
        ]
    });
    map.layers.add(weightedHeatMapLayer, 'labels');
    MyLayers.weightedHeatMapLayer = weightedHeatMapLayer;
    // map.setCamera({
    //     center: [-97, 39],
    //     zoom: 3,
    // });
};




/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/

// heatMapItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#heatMapItems").click(function () {
    if ($(this).is(":checked")) {

    } else {
        try {
            $("#runClusteredHM").prop('checked', false);
            $('.clusteredHM').css({
                display: "none"
            });
            removeLayer(MyLayers.clusteredHeatMapLayer)

            $("#runConsistentHM").prop('checked', false);
            $('.consistentHM').css({
                display: "none"
            });
            removeLayer(MyLayers.consistentHeatMapLayer)

            $("#runWeightedHM").prop('checked', false);
            $('.weightedHM').css({
                display: "none"
            });
            removeLayer(MyLayers.weightedHeatMapLayer)
        } catch (err) {

        }
    }
});



// runHMOptions
$('#runHMOptions').click(function () {
    if ($(this).is(":checked")) {
        $('.hmOptions').css({
            display: "block"
        });
        heatMapOptions();
    } else {
        $('.hmOptions').css({
            display: "none"
        });
        removeLayer(MyLayers.heatMapOptionsLayer)
    }
});
// runClusteredHM
$('#runClusteredHM').click(function () {
    if ($(this).is(":checked")) {
        $('.clusteredHM').css({
            display: "block"
        });
        clusteredHeatMap();
    } else {
        $('.clusteredHM').css({
            display: "none"
        });
        removeLayer(MyLayers.clusteredHeatMapLayer)
    }
});

// runConsistentHM
$('#runConsistentHM').click(function () {
    if ($(this).is(":checked")) {
        $('.consistentHM').css({
            display: "block"
        });
        consistentHeatMap();
    } else {
        $('.consistentHM').css({
            display: "none"
        });
        removeLayer(MyLayers.consistentHeatMapLayer)
    }
});

// runWeightedHM 
$('#runWeightedHM').click(function () {
    if ($(this).is(":checked")) {
        $('.weightedHM').css({
            display: "block"
        });
        weightedHeatMap();
    } else {
        $('.weightedHM').css({
            display: "none"
        });
        removeLayer(MyLayers.weightedHeatMapLayer)
    }
});