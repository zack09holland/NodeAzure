/******************************************************************************************************************************
 * 
 *  Swipe Between Maps Example
 * 
 *  - swipeMap()
 *      - Creates two new maps to use for showing swiping between maps
 * 
 *    
******************************************************************************************************************************/

function swipeMap() {
    //Initialize a map instance.
    primaryMap = new atlas.Map('primaryMap', {
        center: [-100, 35],
        zoom: 3,
        style: 'grayscale_dark',
        view: 'Auto',
        
        //Add your Azure Maps subscription key to the map SDK. Get an Azure Maps key at https://azure.com/maps
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: atlas.getSubscriptionKey()
        }
    });

    secondaryMap = new atlas.Map('secondaryMap', {
        style: 'grayscale_dark',
        view: 'Auto',
        authOptions: {
            authType: 'subscriptionKey',
            subscriptionKey: atlas.getSubscriptionKey()
        }
    });

    new SwipeMapControl(primaryMap, secondaryMap);

    //Add some data to the left map.
    primaryMap.events.add('ready', function () {
        primaryDataSource = new atlas.source.DataSource();
        primaryMap.sources.add(primaryDataSource);

        primaryDataSource.importDataFromUrl('data/geojson/US_County_Unemployment_2017.geojson');

        //Choropleth based on unemployment rates in the US counties.
        primaryMap.layers.add(new atlas.layer.PolygonLayer(primaryDataSource, null, {
            fillColor: [
                'step',
                ['get', 'unemployment_rate'],
                '#FFEDA0',
                3, '#FED976',
                4, '#FD8D3C',
                5, '#E31A1C',
                6, '#800026'
            ],
            fillOpacity: 0.8
        }), 'labels');
    });

    //Add some data to the right map.
    secondaryMap.events.add('ready', function () {
        secondaryDataSource = new atlas.source.DataSource();
        secondaryMap.sources.add(secondaryDataSource);

        secondaryDataSource.importDataFromUrl('data/geojson/US_County_Unemployment_2017.geojson');

        //Choropleth based on suze of labor force in the US counties.
        secondaryMap.layers.add(new atlas.layer.PolygonLayer(secondaryDataSource, null, {
            fillColor: [
                'step',
                ['get', 'labor_force'],
                '#fff7f3',
                10000, '#fcc5c0',
                50000, '#dd3497',
                100000, '#48006a'
            ],
            fillOpacity: 0.8
        }), 'labels');
    });
}

/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/
// swipeMap 
$('#swipeMap').click(function () {
    if ($(this).is(":checked")) {
        $('.swipeMapInfo').css({
            display: "block"
        });
        $('.mapContainer').css({
            display: "none"
        });
        $('.swipeMapContainer').css({
            display: "block"
        });
        swipeMap();
    } else {
        $('.swipeMapInfo').css({
            display: "none"
        });
        $('.mapContainer').css({
            display: "block"
        });
        $('.swipeMapContainer').css({
            display: "none"
        });
        primaryMap.clear()
        secondaryMap.clear()
        // removeLayer(MyLayers.radarWeatherLayer)
    }
});
