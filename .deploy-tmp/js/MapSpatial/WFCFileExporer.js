/**********************************************************************************************************************
 * 
 *  Census block group analysis
 *  
 *  - getBlockGroupData()
 *      - Gets the data along a route with a buffer zone
 *  
 * 
 **********************************************************************************************************************/
var client, currentServiceUrl;

var proxyServiceUrl = window.location.origin + '/Common/CorsEnabledProxyService.ashx?url=';

//Sample WFS services to let users test with.
var wfcservices = [{
        name: 'NOAA Climate outlook',
        url: 'https://idpgis.ncep.noaa.gov/arcgis/services/NWS_Climate_Outlooks/cpc_mthly_precip_outlk/MapServer/WFSServer?request=GetCapabilities&service=WFS'
    },
    {
        name: 'EPA - Snowfall indicators',
        url: 'https://gispub4.epa.gov/arcgis/services/OAR_OAP/Snowfall_Indicators/MapServer/WFSServer?'
    },
    {
        name: 'Massachusetts GIS',
        url: 'https://giswebservices.massgis.state.ma.us/geoserver/wfs?request=GetCapabilities&service=WFS'
    },
    {
        name: 'NZ GNS Science',
        url: 'https://data.gns.cri.nz/webmaps/geology/wfs'
    },
    {
        name: 'CIESIN, Columbia University',
        url: 'https://sedac.ciesin.columbia.edu/geoserver/grump-v1/ows?request=getcapabilities&service=wfs'
    },
    {
        name: 'BC Recreation Polygons',
        url: 'https://openmaps.gov.bc.ca/geo/pub/WHSE_FOREST_TENURE.FTEN_RECREATION_POLY_SVW/wfs'
    },
    {
        name: 'Aerogravity/magnetic 3d surveys',
        url: 'https://data.geus.dk/geusmap/ows/4258.jsp'
    },
    {
        name: 'NSW Villages',
        url: 'https://openapi.aurin.org.au//public/wfs'
    },
    {
        name: 'US Active mines (USGS)',
        url: 'https://mrdata.usgs.gov/wfs/active-mines'
    },
    {
        name: 'Geology of Hawaii (USGS)',
        url: 'https://mrdata.usgs.gov/wfs/hi?request=getcapabilities&service=WFS&version=1.1.0&'
    }
];

function wfcFileExplorer() {
    //Create a data source and add it to the map.
    WFCdatasource = new atlas.source.DataSource();
    map.sources.add(WFCdatasource);

    //Add a simple data layer for rendering the data.
    WFClayer = new atlas.layer.SimpleDataLayer(WFCdatasource);
    map.layers.add(WFClayer);
    MyLayers.WFClayer = WFClayer
    //Generate a selection list of some predefined WFS services.
    var html = ['<option value="-1"></option>'];

    for (var i = 0; i < wfcservices.length; i++) {
        html.push('<option value="', i, '">', wfcservices[i].name, '</option>');
    }

    document.getElementById('wfcservicesDD').innerHTML = html.join('');
}

function loadClient(url) {
    currentTypeName = null;
    currentServiceUrl = url;

    document.getElementById('mainLoadingIcon').style.display = '';
    document.getElementById('typeNames').innerHTML = '';

    WFCdatasource.clear();

    //Create the WFS client to access the service. 
    client = new atlas.io.ogc.WfsClient({
        url: url,
        // proxyService: (document.getElementById('useProxyService').checked) ? proxyServiceUrl : null
    });

    //Check the capabilities of the service.
    client.getCapabilities().then(cap => {
        currentTypeName = cap.featureTypes[0].name;

        //Create a list of feature type sets to choose from.
        var html = [];

        for (var i = 0; i < cap.featureTypes.length; i++) {
            html.push('<option value="', cap.featureTypes[i].name, '"');

            if (i === 0) {
                html.push(' selected="selected"');
            }
            html.push('>', cap.featureTypes[i].name, '</option>');
        }

        document.getElementById('typeNames').innerHTML = html.join('');

        processQuery();
    });
}

function loadWFCSelectedInput() {
    var serviceIdx = getSelectValue('wfcservicesDD');

    if (serviceIdx >= 0) {
        currentServiceUrl = wfcservices[serviceIdx].url;
        loadClient(currentServiceUrl);
    } else {
        currentServiceUrl = null;
        WFCdatasource.clear();
    }
}

function loadWFCUserInput() {
    document.getElementById('wfcservicesDD').selectedIndex = 0;

    var url = document.getElementById('wfcinputTbx').value;

    if (url) {
        loadClient(url);
    }
}

// function proxyOptionChanged() {
//     if (currentServiceUrl) {
//         loadClient(currentServiceUrl);
//     }
// }

function processQuery() {
    document.getElementById('status').innerText = '';

    if (currentTypeName) {
        //Create the request for the WFS service.
        var request = {
            typeNames: getSelectValue('typeNames')
        };

        var mf = getSelectValue('maxFeatures');

        if (mf !== 'Max') {
            request.count = parseInt(mf);
        }

        //Make a request to get features from the WFS service.
        client.getFeatures(request).then(fc => {
            if (fc) {
                //IF there is bounding box information, use it to update the map view.
                if (fc.bbox) {
                    map.setCamera({
                        bounds: fc.bbox,
                        padding: 50
                    });
                }

                //Update the shapes in the data source with the results from the request.
                WFCdatasource.setShapes(fc);

                document.getElementById('status').innerText = `${fc.features.length} features loaded.`;
                document.getElementById('mainLoadingIcon').style.display = 'none';
            }
        }, error => {
            document.getElementById('status').innerText = error;
            document.getElementById('mainLoadingIcon').style.display = 'none';
        });
    }
}

function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}





/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
 **********************************************************************************************************************/

// WFCExplorer
$("#WFCExplorer").click(function () {
    if ($(this).is(":checked")) {
        $('.WFCExplorerInfo').css({
            display: "block"
        });
        wfcFileExplorer()
    } else {
        $('.WFCExplorerInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.WFClayer)
        // drawingManager.getSource().clear();
        // drawingManager.dispose()
    }
});