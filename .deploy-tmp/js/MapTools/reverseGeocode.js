/******************************************************************************************************************************
 * 
 *  Reverse Geocoding  
 * 
 *  - reverseGeocode()
 *      - Create popup and searchURL.
 * 
 *  - mapClicked()
 *      - Execute the reverse address search query and open a popup once a response is received.
 *       
******************************************************************************************************************************/
var searchURL;

function reverseGeocode() {
    map.getCanvasContainer().style.cursor = 'crosshair';
    //Create a popup but leave it closed so we can update it and display it later.
    popup = new atlas.Popup({
        position: [0, 0]
    });
    //Add a click event to the map.
    map.events.add('click', mapClicked);

    //Create a pipeline using the Azure Maps subscription key.
    var pipeline = atlas.service.MapsURL.newPipeline(new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey()));
    //Create an instance of the SearchURL client.
    searchURL = new atlas.service.SearchURL(pipeline);
}


function mapClicked(e) {
    //Execute the reverse address search query and open a popup once a response is received.
    searchURL.searchAddressReverse(atlas.service.Aborter.timeout(3000), e.position, {
        view: 'Auto'
    }).then(results => {
        //Get the results in GeoJSON format.
        var data = results.geojson.getFeatures();

        var content = '<div style="padding:10px">';

        if (data.features.length > 0 && data.features[0].properties && data.features[0].properties.address && data.features[0].properties.address.freeformAddress) {
            content += data.features[0].properties.address.freeformAddress;
        } else {
            content += 'No address for that location!';
        }

        content += '</div>';

        //Set the popup options.
        popup.setOptions({
            position: e.position,
            content: content
        });

        //Open the popup.
        popup.open(map);
    });
}


/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/
// mapStyleOptions
$("#reverseGeocode").click(function () {
    if ($(this).is(":checked")) {
        $('.reverseGeocodeInfo').css({
            display: "block"
        });
        reverseGeocode()
    } else {
        $('.reverseGeocodeInfo').css({
            display: "none"
        });
        map.getCanvasContainer().style.cursor = 'grab';
        map.events.remove('click', mapClicked);
        // map.getCanvasContainer().style.cursor = 'pointer';

    }
});