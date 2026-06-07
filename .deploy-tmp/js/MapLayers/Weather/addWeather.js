/******************************************************************************************************************************
 * 
 *  Weather Example Layers 
 * 
 *  - addRadarWeather()
 *      - Adds a layer with weather data pulled from microsoft
 * 
 *  - addInfaredWeather()
 *      - Adds a layer with weather data pulled from microsoft
 * 
 *  - animateWeather() NOT IMPLEMENTED
 *      - Will allow weather tile layers to become animated over a certain time period
 *    
******************************************************************************************************************************/


/**********************************************************************************************************************
 * 
 *  Radar Weather Layer
 *  
 *  - addRadarWeather()
 *      - Adds a layer with weather data pulled from microsoft
 *    
**********************************************************************************************************************/
function addRadarWeather() {
    //Initialize the weather tile layer.
    var layerName = "microsoft.weather.radar.main";
    var tileUrl = weatherTileUrl.replace('{subscription-key}', atlas.getSubscriptionKey()).replace('{layerName}', layerName);
    if (!tileLayer) {
        //Create a tile layer and add it to the map below the label layer.
        tileLayer = new atlas.layer.TileLayer({
            tileUrl: tileUrl,
            opacity: 0.9,
            tileSize: 256
        });

    } else {
        tileLayer.setOptions({
            tileUrl: tileUrl
        });
    }
    console.log(tileLayer)
    map.layers.add(tileLayer, 'labels');
    MyLayers.radarWeatherLayer = tileLayer;
}
/**********************************************************************************************************************
 * 
 *  Infared Weather Layer
 *  
 *  - addInfaredWeather()
 *      - Adds a layer with weather data pulled from microsoft
 *    
**********************************************************************************************************************/
function addInfaredWeather() {
    //Initialize the weather tile layer.
    var layerName = "microsoft.weather.infrared.main";
    var tileUrl = weatherTileUrl.replace('{subscription-key}', atlas.getSubscriptionKey()).replace('{layerName}', layerName);
    if (!tileLayer) {
        //Create a tile layer and add it to the map below the label layer.
        tileLayer = new atlas.layer.TileLayer({
            tileUrl: tileUrl,
            opacity: 0.9,
            tileSize: 256
        });

    } else {
        tileLayer.setOptions({
            tileUrl: tileUrl
        });
    }
    console.log(tileLayer)
    map.layers.add(tileLayer, 'labels');
    MyLayers.infraredWeatherLayer = tileLayer;
}

/**********************************************************************************************************************
 * 
 *  Animated Weather Layer
 *  
 *  - animateWeather()
 *      - Adds a layer with weather data pulled from microsoft
 *    
**********************************************************************************************************************/
var tileLayer, animationManager;

//Weather tile url from Iowa Environmental Mesonet (IEM): http://mesonet.agron.iastate.edu/ogc/
var urlTemplate = 'https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-{timestamp}/{z}/{x}/{y}.png';

//The time stamps values for the IEM service for the last 50 minutes broken up into 5 minute increments.
var timestamps = ['900913-m50m', '900913-m45m', '900913-m40m', '900913-m35m', '900913-m30m', '900913-m25m', '900913-m20m', '900913-m15m', '900913-m10m', '900913-m05m', '900913'];

var displayMessages = [];
var weatherTileUrl = 'https://atlas.microsoft.com/map/tile?subscription-key={subscription-key}&api-version=2.0&tilesetId={layerName}&zoom={z}&x={x}&y={y}';

function animateWeather() {
    var tileLayers = [];
    // Set camera to view map layer
    //  map.setCamera({
    //     center: [-99.47, 40.75],
    //     zoom: 3,
    //     view: 'Auto'
    // });
    // map.setStyle({
    //     style: 'grayscale_dark'
    // })
    //Create a tile layer option for each time stamp.
    for (var i = 0; i < timestamps.length; i++) {
        var layerOptions = {
            tileUrl: urlTemplate.replace('{timestamp}', timestamps[i]),
            tileSize: 256,
            opacity: 0.8
        };
        tileLayers.push(layerOptions);

        //Create a message to display for each frame of the animation based on the time stamp.
        var msg = 'Current';

        if (timestamps[i] != '900913') {
            msg += ' -' + timestamps[i].replace('900913-m', '') + 'in';
        }
        displayMessages.push(msg);
    }

    //Create the animation manager. 
    animationManager = new AnimatedTileLayerManager(map, {
        tileLayerOptions: tileLayers,
        below: 'labels',
        frameRate: 2
    });

    //When an animation frame loads, update the message panel. 
    animationManager.onFrameLoaded = function (e) {
        var msg = displayMessages[e.index];
        document.getElementById('messagePanel').innerText = msg;
    };
}


/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/
// weatherMapItems
// When the entire block is closed. Remove all of those layers and close the child tabs
$("#weatherMapItems").click(function () {
    if ($(this).is(":checked")) {
    
    } else {
        try {
            $("#runRadarWeather").prop('checked', false);
            $('.radarWeatherMap').css({
                display: "none"
            });
            removeLayer(MyLayers.radarWeatherLayer)

            $("#runInfaredWeather").prop('checked', false);
            $('.infaredWeatherMap').css({
                display: "none"
            });
            removeLayer(MyLayers.infraredWeatherLayer)
        } catch (err) {

        }
    }
});
// runRadarWeather 
$('#runRadarWeather').click(function () {
    if ($(this).is(":checked")) {
        $('.radarWeatherMap').css({
            display: "block"
        });
        addRadarWeather();
    } else {
        $('.radarWeatherMap').css({
            display: "none"
        });
        removeLayer(MyLayers.radarWeatherLayer)
    }
});
// runInfaredWeather 
$('#runInfaredWeather').click(function () {
    if ($(this).is(":checked")) {
        $('.infaredWeatherMap').css({
            display: "block"
        });
        addInfaredWeather();
    } else {
        $('.infaredWeatherMap').css({
            display: "none"
        });
        removeLayer(MyLayers.infraredWeatherLayer)
    }
});

// animatedWeatherMap 
$('#animatedWeatherMap').click(function () {
    if ($(this).is(":checked")) {
        $('.animatedWeatherMapInfo').css({
            display: "block"
        });
        animateWeather();
    } else {
        $('.animatedWeatherMapInfo').css({
            display: "none"
        });
        animationManager.stop()
    }
});