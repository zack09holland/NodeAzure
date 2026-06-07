// Globally scoped variables
var map, previewMap;
var imageExporter;
var MyLayers = {}; // Holds layers added to the map
var MyFiles = {};  // Holds the file information for files added to the map
var ActiveLayers = {};
/*************************************************************************************
 *  GetMap
 * 
 *  - Initializes the main mapping interface and when
 *    ready loads the map tools
 *      - mapControls
 *      - drawingTools
 *      - mapSearch() 
 *    
****************************************************************************************/
function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        preserveDrawingBuffer: true,
        center: [-94.6, 39.1],
        zoom: 3,
        view: 'Auto',
        style: 'grayscale_light',

        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: 'fxg6dMtNQQ3zqgzk_loQeMxznejQj5swKZF9Vcj5rQ0'
        },
        // Possible way to hide API key and use a token and clientID
        ////URL to custom endpoint to fetch Access token.
        // var url = 'https://adtokens.azurewebsites.net/api/HttpTrigger1?code=dv9Xz4tZQthdufbocOV9RLaaUhQoegXQJSeQQckm6DZyG/1ymppSoQ==';
        // authOptions: {
        //     authType: "anonymous",
        //     clientId: "35267128-0f1e-41de-aa97-f7a7ec8c2dbd",
        //     getToken: function(resolve, reject, map) {
        //         fetch(url).then(function(response) {
        //             return response.text();
        //         }).then(function(token) {
        //             resolve(token);
        //         });
        //     }
        // }
    });
    
    // Wait until the map resources are ready.
    // (Other Map layer functions are controlled via onclick events)
    map.events.add('ready', function () {
        imageExporter = new MapImageExporter(map);

        mapStyleOptions();
        mapControls();
        // drawingTools();
        mapSearch();

    });
}

