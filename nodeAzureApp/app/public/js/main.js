
var map, drawingManager, controls = [];
//Note that the typeahead parameter is set to true.
var geocodeServiceUrlTemplate = 'https://atlas.microsoft.com/search/{searchType}/json?typeahead=true&subscription-key={subscription-key}&api-version=1&query={query}&language={language}&lon={lon}&lat={lat}&countrySet={countrySet}&view=Auto';
// Use SubscriptionKeyCredential with a subscription key
var subscriptionKeyCredential = new atlas.service.SubscriptionKeyCredential(atlas.getSubscriptionKey());

// Use subscriptionKeyCredential to create a pipeline
var pipeline = atlas.service.MapsURL.newPipeline(subscriptionKeyCredential);

// Construct the SearchURL object
var searchURL = new atlas.service.SearchURL(pipeline);

function GetMap() {
    console.log("we made it")
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        // center: [-98.493928, 38.096798],
        // zoom: 4,
        // view: "Auto",
        center: [-122.33, 47.6],
        zoom: 12,
        view: 'Auto',

        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'TfUWvWqVnTGKGMcIvxr5coNt7eiWrKxh6wJe0keVZSs'
        }
    });

    //Wait until the map resources are ready.

    map.events.add('ready', function () {
        mapControls()
        drawingTools();
        mapSearch();
        $('#runChoropleth').click(function() {
            $("#legend").toggle();
            map.setCamera({
                center: [-110, 50],
                zoom: 3,
                view: 'Auto' 
            });
            addChoropleth();
        });
        
    });
}
