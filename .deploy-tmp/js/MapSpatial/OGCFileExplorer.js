/*******************************************************************************************************************************************************************
 * 
 *  OGC File Explorer Example
 *
 *  - loadOGCLayer()
 *      - Creates an OGC layer and loads the url specified in the WMTS selection
 * 
 *  - loadSelectInput()
 *      - Handle user selection from the list of known OGC services.
 * 
 *  - loadUserInput()
 *      - Handle user input for a user provided OGC service URL.
 * 
 *  - clear()
 *      - Clear the map and reset the UI.
 * 
 *  - mapClick()
 *      - Handle click events on the map.
 
 *  - buildLayerList()
 *      - Create a selection list of all the sub-layers in the layer.
 *    
*******************************************************************************************************************************************************************/
var currentCapabilities;
var ogclayer;
var proxyServiceUrl = window.location.origin + '/Common/CorsEnabledProxyService.ashx?url=';

//Sample WMTS and WMS services to let users test with.
var services = [
    //WMTS services            
    { name: 'USGS Geologic maps (WMTS)', url: 'https://mrdata.usgs.gov/mapcache/wmts/' },            
    { name: 'USGS Shaded Relief Only (WMTS)', url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS/1.0.0/WMTSCapabilities.xml' },
    { name: 'Iowa City HYDROLOGY (WMTS)', url: 'https://maps.iowa-city.org/sslarcgis/rest/services/IowaCityHYDROLOGY/DFIRM/MapServer/WMTS/1.0.0/WMTSCapabilities.xml' },
    { name: 'Luxembourg admin areas (WMTS)', url: 'https://wmts1.geoportail.lu/opendata/service' },
    { name: 'basemap.at (WMTS)', url: 'https://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml' },
    { name: 'GeoNorth Ortho (WMTS)', url: 'https://gis.dnr.alaska.gov/terrapixel/cubeserv/ortho?SERVICE=WMTS&REQUEST=GetCapabilities' },
    { name: 'GeoNorth AeronauticalCharts (WMTS)', url: 'https://gis.dnr.alaska.gov/terrapixel/cubeserv/AeronauticalCharts?SERVICE=WMTS&REQUEST=GetCapabilities' },

    //WMS services
    { name: 'World geology survey (WMS)', url: 'https://mrdata.usgs.gov/services/gscworld' },
    { name: 'US Census areas (WMS)', url: 'https://tigerweb.geo.census.gov/arcgis/services/TIGERweb/tigerWMS_Current/MapServer/WMSServer' },
    { name: 'Radar base reflectivity (NOAA) (WMS)', url: 'https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Observations/radar_base_reflectivity/MapServer/WmsServer' },
    { name: 'Wetlands_Raster (WMS)', url: 'https://www.fws.gov/wetlands/arcgis/services/Wetlands_Raster/ImageServer/WMSServer' },
    { name: 'Contors (WMS)', url: 'https://carto.nationalmap.gov/arcgis/services/contours/MapServer/WMSServer' },
    { name: 'Radar meteo imagery nexrad time (NOAA) (WMS)', url: 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer' },
    { name: 'Natural Earth (WMS)', url: 'https://smallscale.nationalmap.gov/arcgis/services/NaturalEarth/MapServer/WMSServer' },
    { name: 'Water areas (WMS)', url: 'https://hydro.nationalmap.gov/arcgis/services/nhd/MapServer/WMSServer' },
    { name: 'USGS NAIP Plus (WMS)', url: 'https://services.nationalmap.gov/arcgis/services/USGSNAIPPlus/MapServer/WMSServer' },
    { name: 'Government land (WMS)', url: 'https://carto.nationalmap.gov/arcgis/services/govunits/MapServer/WMSServer' },
    { name: 'US Topo Availability (WMS)', url: 'https://index.nationalmap.gov/arcgis/services/USTopoAvailability/MapServer/WMSServer' }
];

 //Generate a selection list of some predefined OGC map services.
 var html = ['<option value="-1"></option>'];

 for (var i = 0; i < services.length; i++) {
     html.push('<option value="', i, '">', services[i].name, '</option>');
 }

 document.getElementById('servicesDD').innerHTML = html.join('');


 function loadOGCLayer(url) {
     
    //Add a click event to the map.
    map.events.add('click', mapClick);
    // clear();
    popup = new atlas.Popup();

    //Add a click event to the map.
    map.events.add('click', mapClick);

    //Show the loading icon.
    document.getElementById('mainLoadingIcon').style.display = '';

    //Create an OGC layer.
    ogclayer = new atlas.layer.OgcMapLayer({
        url: url,
        // proxyService: (document.getElementById('useProxyService').checked) ? proxyServiceUrl : null,
        bringIntoView: document.getElementById('bringIntoView').checked,
        debug: true
    });

    //Monitor for when the active layers change in the layer.
    ogclayer.onActiveLayersChanged = () => {
        //Get the capabilities if the active layers change.
        ogclayer.getCapabilities().then(cap => {
            if (cap) {
                currentCapabilities = cap;

                //Build a seleciton list of sub-layers.
                buildLayerList();
            }
        });

        //Hide the loading icon.
        document.getElementById('mainLoadingIcon').style.display = 'none';
    };

    map.layers.add(ogclayer, 'transit');
    MyLayers.ogclayer = ogclayer;

}

//Handle user selection from the list of known OGC services.
function loadSelectInput() {
    var elm = document.getElementById('servicesDD');
    var serviceIdx = parseInt(elm.options[elm.selectedIndex].value);
    console.log(services[serviceIdx].url)

    if (serviceIdx >= 0) {
        loadOGCLayer(services[serviceIdx].url);
    }
    else{
        clear();
    }
}

//Handle user input for a user provided OGC service URL.
function loadUserInput() {
    clear();

    document.getElementById('servicesDD').selectedIndex = 0;

    var url = document.getElementById('inputTbx').value;


    if (url) {
        loadOGCLayer(url);
    }
}

//Clear the map and reset the UI.
function clear() {
    currentCapabilities = null;
    // document.getElementById('layerPicker').innerHTML = '';

    if (ogcLayer) {
        map.layers.remove(ogcLayer);
        ogcLayer = null;
    }

    popup.close();
}

//Handle click events on the map.
function mapClick(e) {
    if (ogcLayer) {
        //Get the feature info for where the user clicked on the map.
        ogcLayer.getFeatureInfo(e.position).then(result => {
            if (result && result.features && result.features.length > 0) {
                popup.setOptions({
                    content: atlas.PopupTemplate.applyTemplate(result.features[0].properties),
                    position: e.position
                });

                popup.open(map);
            }
        }, error => {
            alert(error);
        });
    }
}

//Create a selection list of all the sub-layers in the layer.
function buildLayerList() {
    var cap = currentCapabilities;
    var html = [];
    var o = ogclayer.getOptions();

    for (var i = 0; i < cap.sublayers.length; i++) {
        html.push('<input type="checkbox" class="collapsible" value="', i, '"');

        var isActive = false;

        //Check to see if the layer is active.
        if (o.activeLayers && o.activeLayers.length > 0) {
            o.activeLayers.forEach(al => {
                if ((typeof al === 'string' && al === cap.sublayers[i].id) || al.id === cap.sublayers[i].id) {
                    isActive = true;
                }
            });
        }

        var t = cap.sublayers[i].title;

        if (!t || t === '') {
            t = cap.sublayers[i].id;
        }

        //Add the title to the of the sub-layer.
        if (isActive) {
            html.push('checked="checked"/>', t, '<div class="content" style="display:block">');
        } else {
            html.push('/>', t, '<div class="content">');
        }

        html.push('<p>');

        //Add the description of the sub-layer
        if (cap.sublayers[i].description && cap.sublayers[i].description !== '') {
            html.push(cap.sublayers[i].description, '<br/>');
        }

        //Add the zoom level range of the sub-layer.
        html.push('Zoom range: ', cap.sublayers[i].minZoom, ' - ', cap.sublayers[i].maxZoom, '<br/><br/>');

        //Add the legend for the sub-layer.
        if (cap.sublayers[i].styles && cap.sublayers[i].styles.length > 0 && cap.sublayers[i].styles[0].legendUrl && cap.sublayers[i].styles[0].legendUrl !== '') {
            html.push('<img src="', cap.sublayers[i].styles[0].legendUrl, '" />');
        }

        html.push('</p></div><br/>');
    }

    //Update the layer picker.
    // document.getElementById('layerPicker').innerHTML = html.join('');

    //Loop through and make each collapsible item clickable.
    var coll = document.getElementsByClassName("collapsible");

    for (var i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;

            var idx = parseInt(this.value);
            var o = layer.getOptions();
            var al = o.activeLayers || [];
            var clickedLayer = currentCapabilities.sublayers[idx].id;

            //Show the loading icon when the selected layers changes.
            document.getElementById('loadingIcon').style.display = '';

            //WMS services allow multiple layers to be selected.
            if (o.service === 'WMS') {
                if (content.style.display === "block") {
                    //Remove the layer.
                    content.style.display = "none";
                    al = al.filter(e => e.id !== clickedLayer);
                } else {
                    //Add the layer.
                    content.style.display = "block";
                    al.push(clickedLayer);
                }
            } else {
                //WMTS layers only allow a single layer to be selected.
                if (content.style.display === "block") {
                    //Remove the layer.
                    content.style.display = "none";
                    al = [];
                } else {
                    //Add the layer.
                    content.style.display = "block";
                    al = [clickedLayer];
                }
            }

            //Update the list of active layers.
            ogcLayer.setOptions({ activeLayers: al });
        });
    }
}



/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/
// simpleChoropleth
$("#ogcLayer").click(function () {
    if ($(this).is(":checked")) {
        $('.ogcLayerInfo').css({
            display: "block"
        });
    } else {
        $('.ogcLayerInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.ogclayer)
    }
});