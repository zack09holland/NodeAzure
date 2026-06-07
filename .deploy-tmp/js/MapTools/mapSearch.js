/******************************************************************************************************************************
 * 
 *  Map Search
 * 
 *  - mapSearch()
 *      - Allows the user to input an address and using jquery autocomplete provide suggestions in a drop down 
 *    
******************************************************************************************************************************/

//Note that the typeahead parameter is set to true.
var geocodeServiceUrlTemplate = 'https://atlas.microsoft.com/search/{searchType}/json?typeahead=true&subscription-key={subscription-key}&api-version=1&query={query}&language={language}&lon={lon}&lat={lat}&countrySet={countrySet}&view=Auto';
// Use SubscriptionKeyCredential with a subscription key
var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

// Use subscriptionKeyCredential to create a pipeline
var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);

// Construct the SearchURL object
var searchURL = new atlas.service.SearchURL(pipeline);

function mapSearch() {
    //Create a data source to store the data in.
    var datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    //Add a layer for rendering point data.
    map.layers.add(new atlas.layer.SymbolLayer(datasource));

    //Create a jQuery autocomplete UI widget.
    $("#queryTbx").autocomplete({
        minLength: 3, //Don't ask for suggestions until atleast 3 characters have been typed. This will reduce costs by not making requests that will likely not have much relevance.
        source: function (request, response) {
            var center = map.getCamera().center;

            // var elm = document.getElementById('countrySelector');
            // var countryIso = elm.options[elm.selectedIndex].value;
            
            //Create a URL to the Azure Maps search service to perform the search.
            var requestUrl = geocodeServiceUrlTemplate.replace('{query}', encodeURIComponent(request.term))
                .replace('{searchType}', 'address')
                .replace('{subscription-key}', atlas.getSubscriptionKey())
                .replace('{language}', 'en-US')
                .replace('{lon}', center[0]) //Use a lat and lon value of the center the map to bais the results to the current map view.
                .replace('{lat}', center[1])
                .replace('{countrySet}', "US"); //A comma seperated string of country codes to limit the suggestions to.

            $.ajax({
                url: requestUrl,
                success: function (data) {
                    response(data.results);

                }
            });
        },
        select: function (event, ui) {
            //Remove any previous added data from the map.
            datasource.clear();
            //Create a point feature to mark the selected location.
            datasource.add(new atlas.data.Feature(new atlas.data.Point([ui.item.position.lon, ui.item.position.lat]), ui.item));
            //Zoom the map into the selected location.
            map.setCamera({
                bounds: [
                    ui.item.viewport.topLeftPoint.lon, ui.item.viewport.btmRightPoint.lat,
                    ui.item.viewport.btmRightPoint.lon, ui.item.viewport.topLeftPoint.lat
                ],
                padding: 30
            });
            
        }
        
    }).autocomplete("instance")._renderItem = function (ul, item) {

        //Format the displayed suggestion to show the formatted suggestion string.
        var suggestionLabel = item.address.freeformAddress;

        if (item.poi && item.poi.name) {
            suggestionLabel = item.poi.name + ' (' + suggestionLabel + ')';
        }

        return $("<li>")
            .append("<a>" + suggestionLabel + "</a>")
            .appendTo(ul);
    };

}