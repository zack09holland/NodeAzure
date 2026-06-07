/**********************************************************************************************************************
 * 
 *  Census block group analysis
 *  
 *  - getBlockGroupData()
 *      - Gets the data along a route with a buffer zone
 *  
 *  - drawingModeChanged()
 *  
 *  - stateChanged()
 *  
 *  - loadState()
 *  
 *  - analyizeSearchArea()
 * 
 **********************************************************************************************************************/
var censusBlockKmlUrl = 'data/USCensus2010/BlockGroups/cb_2013_{stateId}_bg_500k.kmz';
var censusBlockStatsUrl = 'data/USCensus2010/BlockGroupPopulation/CenPop2010_Mean_BG{stateId}.txt';
var stateDataSource, blockDataSource, censusBlocks, geoIdPopTable, selectedStateIdx = -1;
function getBlockGroupData() {
    //Create a data source for state boundaries.
    stateDataSource = new atlas.source.DataSource();
    map.sources.add(stateDataSource);

    //Add layer to outline the selected state.
    stateOutlineLayer = new atlas.layer.LineLayer(stateDataSource, null, {
        strokeColor: [
            'case',
            ['all', ['has', 'isSelected'],
                ['get', 'isSelected']
            ],
            'black',
            'transparent'
        ]
    })
    map.layers.add(stateOutlineLayer);
    MyLayers.stateOutlineLayer = stateOutlineLayer;

    //Create a data source for census block data.
    blockDataSource = new atlas.source.DataSource();
    map.sources.add(blockDataSource);

    //Add layers for rendering the census blocks that are selected.
    censusPolygonLayer = new atlas.layer.PolygonLayer(blockDataSource, null, {
        fillColor: 'deepskyblue'
    });
    censusLineLayer = new atlas.layer.LineLayer(blockDataSource, null, {
        strokeColor: '#F535AA'
    })
    map.layers.add([censusPolygonLayer, censusLineLayer   ], 'labels');
    MyLayers.censusPolygonLayer = censusPolygonLayer
    MyLayers.censusLineLayer = censusLineLayer
    
    //Create an instance of the drawing manager and display the drawing toolbar.
    censusdrawingManager = new atlas.drawing.DrawingManager(map, {
        toolbar: new atlas.control.DrawingToolbar({
            buttons: ['draw-polygon', 'draw-rectangle', 'draw-circle'],
            position: 'top-left',
            style: 'light'
        })
    });

    //Clear the map and drawing canvas when the user enters into a drawing mode.
    map.events.add('drawingmodechanged', censusdrawingManager, censusDrawingModeChanged);

    //Monitor for when a polygon drawing has been completed.
    map.events.add('drawingcomplete', censusdrawingManager, analyizeSearchArea);

    //Load the US state data.
    stateDataSource.importDataFromUrl('data/geojson/US_States_500k.json');
}

function censusDrawingModeChanged(mode) {
    //Clear the drawing canvas when the user enters into a drawing mode and reset the style of all pins.
    if (mode.startsWith('draw')) {
        censusdrawingManager.getSource().clear();
        blockDataSource.clear();
    }
}

function stateChanged() {
    //When the state changes, load the data for that state.
    var stateFP = document.getElementById('stateFipCodes').value;

    document.getElementById('aggregateStats').innerHTML = '';

    if (selectedStateIdx !== -1) {
        stateDataSource.getShapes()[selectedStateIdx].properties.isSelected = false;
    }

    if (stateFP !== '') {
        //Highlight the selected state.
        var states = stateDataSource.getShapes();

        for (var i = 0; i < states.length; i++) {
            if (states[i].getProperties().STATE === stateFP) {
                states[i].setProperties({ isSelected: true });
                
                //Focus the map over the state.
                map.setCamera({ bounds: atlas.data.BoundingBox.fromData(states[i]), padding: 50 });
                break;
            }
        }

        loadState(stateFP);
    }
}

function loadState(stateId) {
    censusBlocks = null;
    censusdrawingManager.getSource().clear();
    blockDataSource.clear();
    document.getElementById('mainLoadingIcon').style.display = '';
    document.getElementById('aggregateStats').innerHTML = 'Loading census data...';
    
    Promise.all([
        atlas.io.read(censusBlockKmlUrl.replace('{stateId}', stateId)),
        atlas.io.read(censusBlockStatsUrl.replace('{stateId}', stateId))
    ]).then(values => {
        //Store the census block data.
        censusBlocks = values[0];

        var data = values[1];

        //Header: STATEFP,COUNTYFP,TRACTCE,BLKGRPCE,POPULATION,LATITUDE,LONGITUDE
        //GEOID: {STATEFP}{COUNTYFP}{TRACTCE}{BLKGRPCE}

        //Create a lookup table of population by GEOID.
        geoIdPopTable = {};

        for (var i = 0; i < data.features.length; i++) {
            var p = data.features[i].properties;
            geoIdPopTable[`${p.STATEFP}${p.COUNTYFP}${p.TRACTCE}${p.BLKGRPCE}`] = parseFloat(p.POPULATION);
        }
                    
        document.getElementById('mainLoadingIcon').style.display = 'none';
        document.getElementById('aggregateStats').innerHTML = '';
    });
}

function analyizeSearchArea(searchArea) {
    //Exit drawing mode.
    censusdrawingManager.setOptions({ mode: 'idle' });

    if (!censusBlocks) {
        alert('Census block data for a state must be loaded first.');
        return;
    }

    var poly = searchArea.toJson();

    //If the search area is a circle, create a polygon from its circle coordinates.
    if (searchArea.isCircle()) {
        poly = new atlas.data.Polygon([searchArea.getCircleCoordinates()]);
    }

    var intersects = [];
    var estimatedPop = 0;

    for (var i = 0; i < censusBlocks.features.length; i++) {
        //Check to see if the census block is a polygon and touches the search area.
        if (censusBlocks.features[i].geometry.type === 'Polygon' && !turf.booleanDisjoint(poly, censusBlocks.features[i])) {
            //Calculate the intersection of the search area to with census block group.
            var intersection = turf.intersect(poly, censusBlocks.features[i]);

            //Get the population from the GEOID of the census block.
            var population = geoIdPopTable[censusBlocks.features[i].properties.GEOID.value];

            if (population) {
                //Calculate estimated popuplation by using the area of intersection compared to the area of the census block (land + water) multiplied by the population for the census block.
                var area = atlas.math.getArea(intersection, 'squareMeters');
                estimatedPop += population * Math.min(area / (parseFloat(censusBlocks.features[i].properties.ALAND.value) + parseFloat(censusBlocks.features[i].properties.AWATER.value)), 1);
            }

            intersects.push(intersection);
        }
    }

    //Display the itersected census block group areas.
    blockDataSource.setShapes(intersects);

    document.getElementById('aggregateStats').innerHTML = `Estimated Population<div class="big-number">${Math.round(estimatedPop).toLocaleString()}</div># of census block groups<div class="big-number">${intersects.length.toLocaleString()}</div>`;

    //Focus the map over the search area.
    map.setCamera({ bounds: atlas.data.BoundingBox.fromData(poly), padding: 50 });
}

/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
 **********************************************************************************************************************/

// censusBlockGroup
$("#censusBlockGroup").click(function () {
    if ($(this).is(":checked")) {
        $('.censusBlockGroupInfo').css({
            display: "block"
        });
        getBlockGroupData()
    } else {
        $('.censusBlockGroupInfo').css({
            display: "none"
        });
        removeLayer(MyLayers.censusPolygonLayer)
        removeLayer(MyLayers.censusLineLayer)
        removeLayer(MyLayers.stateOutlineLayer)
        censusdrawingManager.getSource().clear();
        censusdrawingManager.dispose()
    }
});