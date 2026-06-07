/************************************************************************************************************************************
 * 
 *  Polygon Design Options
 * 
 *  - updatePolygonLayer()
 *      - Allows the user to update design settings
 *        of polygons
 * 
 *  - getPolygonInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getPolygonPropertyValue()
 *      - Gets the property value of the elements 
 * 
 *  - getSelectValue()
 *      - Gets the selected value from the drop downs
 *  
 *  - openPolyTab()
 *      - Opens the tab within the polygon designer      
 *  
 *  - createFillPatternOptions()
 *      - Creates the fill pattern options for the polygon  
 *    
 *  - fillPatternSelected()
 *      - Fills the polygon with the chosen selection and
 *        calls updatePolygonLayer() to update the layer  
 *  
 *  - toggleFillPatternDropdown()
 *      - Opens a color selection window  
 *    
************************************************************************************************************************************/

var fillPatterns = [
    'fill-checker-blue', 'fill-checker-darkblue', 'fill-checker-green', 'fill-checker-red', 'fill-checker-yellow',
    'fill-diamond-blue', 'fill-diamond-darkblue', 'fill-diamond-green', 'fill-diamond-red', 'fill-diamond-yellow',
    'fill-grid-blue', 'fill-grid-darkblue', 'fill-grid-green', 'fill-grid-red', 'fill-grid-yellow',
    'fill-smallgrid-blue', 'fill-smallgrid-darkblue', 'fill-smallgrid-green', 'fill-smallgrid-red', 'fill-smallgrid-yellow',
    'fill-stripes-downwards-blue', 'fill-stripes-downwards-darkblue', 'fill-stripes-downwards-green', 'fill-stripes-downwards-red', 'fill-stripes-downwards-yellow',
    'fill-stripes-upwards-blue', 'fill-stripes-upwards-darkblue', 'fill-stripes-upwards-green', 'fill-stripes-upwards-red', 'fill-stripes-upwards-yellow',
];

function updatePolygonLayer() {
    var options = getPolygonInputOptions();

    //Update all the options in the polygon layer.
    previewlayers[0].setOptions(options);
    // previewSimpleSpatialLayer[0].setOptions(options);


    document.getElementById('polyDesignCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getPolygonInputOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    var options = {                
        fillOpacity: getPolygonPropertyValue('fillOpacity', parseFloat(document.getElementById('polyFillOpacity').value)),
        minZoom: getPolygonPropertyValue('minZoom', parseFloat(document.getElementById('polyMinZoom').value)),
        maxZoom: getPolygonPropertyValue('maxZoom', parseFloat(document.getElementById('polyMaxZoom').value)),
        visible: getPolygonPropertyValue('visible', document.getElementById('polyVisible').checked)
    };

    //Need to make the fill pattern undefined to override it.
    previewlayers[0].setOptions({ fillPattern: undefined });

    if (document.getElementById('fillColorBtn').checked || document.getElementById('FillColorTransparent').checked) {
        options.fillColor = getPolygonPropertyValue('fillColor', document.getElementById('FillColorTransparent').checked ? 'transparent' : document.getElementById('FillColor').value);
    } else {
        options.fillPattern = fillPatterns[selectedFillPatternIdx];
    }

    return options;
}

function getPolygonPropertyValue(propertyName, value) {
    // if (removeDefaults && defaultPolygonOptions[propertyName] === value) {
    //     return undefined;
    // }
    return value;
}

function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}

function openPolyTab(elm, tabName) {
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

function createFillPatternOptions() {
    var html = [];

    for (var i = 0; i < fillPatterns.length; i++) {
        map.imageSprite.add(fillPatterns[i], '../Common/images/fill-patterns/' + fillPatterns[i] + '.png');

        html.push('<a class="pattern-selector" href="javascript:void(0);" onclick="fillPatternSelected(this, ', i, ');" style="background-image:url(\'../Common/images/fill-patterns/', fillPatterns[i], '.png\')" title="', fillPatterns[i], '"></a>');
    }

    document.getElementById('fillPatternDropdown').innerHTML = html.join('');
}

function fillPatternSelected(elm, idx) {
    selectedFillPatternIdx = idx;            
    document.getElementById('fillPatternBtn').style.backgroundImage = elm.style.backgroundImage;
    
    toggleFillPatternDropdown();
    updatePolygonLayer();
}

function toggleFillPatternDropdown() {
    document.getElementById("fillPatternDropdown").classList.toggle("show");
}


/******************************************************************************************************************************
 * 
 *  Line Layer Design Options  
 * 
 *  - updateLineLayer()
 *      - Returns the settings chosen in the designer
 * 
 *  - getLineInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getLinePropertyValue()
 *      - Gets the property value of the elements 
 * 
 *  - getSelectValue()
 *      - Gets the selected value from the drop downs
 *  
 *  - openLineTab()
 *      - Opens the tab within the designer       
******************************************************************************************************************************/
var defaultOptions, removeDefaults;
function updateLineLayer() {
    var options = getLineInputOptions();

    //Update all the options in the bubble layer.
    previewlayers[1].setOptions(options);
    // previewSimpleSpatialLayer[1].setOptions(options);

    document.getElementById('lineDesignCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getLineInputOptions() {
    removeDefaults = document.getElementById('lineRemoveDefaults').checked;

    var sda = document.getElementById('lineStrokeDashArray').value;
    var dashArray = undefined;

    if (sda && sda != '') {
        sda = sda.split(/[\s,]+/);
        if (sda && sda.length > 1) {
            dashArray = [];
            for (var i = 0; i < sda.length; i++) {
                dashArray.push(parseInt(sda[i]));
            }
        }
    }   

    return {
        lineCap: getLinePropertyValue('lineCap', getSelectValue('lineCap').value),
        lineJoin: getLinePropertyValue('lineJoin', getSelectValue('lineJoin').value),
        strokeDashArray: dashArray,
        strokeColor: getLinePropertyValue('strokeColor', document.getElementById('lineStrokeColor').value),
        blur: getLinePropertyValue('blur', parseFloat(document.getElementById('lineBlur').value)),
        strokeOpacity: getLinePropertyValue('strokeOpacity', parseFloat(document.getElementById('lineStrokeOpacity').value)),
        strokeWidth: getLinePropertyValue('strokeWidth', parseFloat(document.getElementById('lineStrokeWidth').value)),    
        minZoom: getLinePropertyValue('minZoom', parseFloat(document.getElementById('lineMinZoom').value)),
        maxZoom: getLinePropertyValue('maxZoom', parseFloat(document.getElementById('lineMaxZoom').value)),
        visible: getLinePropertyValue('visible', document.getElementById('lineVisible').checked),
        pitchAlignment: getLinePropertyValue('pitchAlignment', getSelectValue('linePitchAlignment'))
    };
}

function getLinePropertyValue(propertyName, value) {
    // if (removeDefaults && defaultLineOptions[propertyName] === value) {
    //     return undefined;
    // }
    return value;
}

function getSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}

function openLineTab(elm, tabName) {
    console.log(tabName)
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

/******************************************************************************************************************************
 * 
 *  Point Design Options  
 * 
 *  - updatePointLayer()
 *      - Returns the settings chosen in the designer
 * 
 *  - getPointInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getPointPropertyValue()
 *      - Gets the property value of the elements 
 *  
 *  - openPointTab()
 *      - Opens the tab within the designer       
******************************************************************************************************************************/
var defaultOptions, removeDefaults;
function updatePointLayer() {
    var options = getPointInputOptions();

    //Update all the options in the point layer component of the preview layers.
    previewlayers[2].setOptions(options);

    document.getElementById('pointDesignCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getPointInputOptions() {
    removeDefaults = document.getElementById('pointRemoveDefaults').checked;
    return {
        color: getPointPropertyValue('color', document.getElementById('pointColor').value),
        strokeColor: getPointPropertyValue('strokeColor', document.getElementById('pointStrokeColor').value),
        blur: getPointPropertyValue('blur', parseFloat(document.getElementById('pointBlur').value)),
        opacity: getPointPropertyValue('opacity', parseFloat(document.getElementById('pointOpacity').value)),
        strokeOpacity: getPointPropertyValue('strokeOpacity', parseFloat(document.getElementById('pointStrokeOpacity').value)),
        strokeWidth: getPointPropertyValue('strokeWidth', parseFloat(document.getElementById('pointStrokeWidth').value)),
        radius: getPointPropertyValue('radius', parseFloat(document.getElementById('pointRadius').value)),
        minZoom: getPointPropertyValue('minZoom', parseFloat(document.getElementById('pointMinZoom').value)),
        maxZoom: getPointPropertyValue('maxZoom', parseFloat(document.getElementById('pointMaxZoom').value)),
        visible: getPointPropertyValue('visible', document.getElementById('pointVisible').checked),
        pitchAlignment: getPointPropertyValue('pitchAlignment', getSelectValue('pointPitchAlignment'))
    };
}

function getPointPropertyValue(propertyName, value) {
    // if (removeDefaults && defaultPointOptions[propertyName] === value) {
    //     return undefined;
    // }
    return value;
}

function openPointTab(elm, tabName) {
    console.log(tabName)
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

/************************************************************************************************************************************
 * 
 *  Simple Layer Design Options
 * 
 *  - updateSimpleLayer()
 *      - Allows the user to update design settings
 *        of polygons
 * 
 *  - getSimpleInputOptions()
 *      - Get the settings from the designer 
 * 
 *  - getSimplePropertyValue()
 *      - Gets the property value of the elements 
 * 
 *  - openSimpleTab()
 *      - Opens the tab within the polygon designer      
 *  
 *    
************************************************************************************************************************************/
function updateSimpleLayer() {
    var options = getSimpleInputOptions();

    //Update all the options in the layer.
    previewlayers[3].setOptions(options);

    document.getElementById('simpleCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getSimpleInputOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    // layer.closePopup();

    return {
        allowExtrusions: getSimplePropertyValue('allowExtrusions', document.getElementById('allowExtrusions').checked),
        enablePopups: getSimplePropertyValue('enablePopups', document.getElementById('enablePopups').checked),
        showPointTitles: getSimplePropertyValue('showPointTitles', document.getElementById('showPointTitles').checked),
        visible: getSimplePropertyValue('visible', document.getElementById('simpleVisible').checked)
    };
}

function getSimplePropertyValue(propertyName, value) {
    // if (removeDefaults && defaultSimpleOptions[propertyName] === value) {
    //     return undefined;
    // }
    return value;
}

function openSimpleTab(elm, tabName) {
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

/************************************************************************************************************************************
 * 
 *  OGC Layer Design Options
 * 
 *  - updateOGCLayer()
 *      - Allows the user to update design settings
 *        of polygons
 * 
 *  - getOGCLayerOptions()
 *      - Get the settings from the designer 
 * 
 *  - getOGCPropertyValue()
 *      - Gets the property value of the elements 
 * 
 *  - openOGCTab()
 *      - Opens the tab within the polygon designer      
 *  
 *    
************************************************************************************************************************************/

function updateOGCLayer() {
    var options = getOGCLayerOptions();

    //Update the options on the layer.
    previewlayers[4].setOptions(options);

    document.getElementById('OGCDesignCodeOutput').value = JSON.stringify(options, null, '\t').replace(/\"([^(\")"]+)\":/g, "$1:");
}

function getOGCLayerOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    return {
        url: document.getElementById('url').value,
        bringIntoView: getOGCPropertyValue('bringIntoView', document.getElementById('bringIntoView').checked),
        debug: getOGCPropertyValue('debug', document.getElementById('debug').checked),
        contrast: getOGCPropertyValue('contrast', parseFloat(document.getElementById('Contrast').value)),
        fadeDuration: getOGCPropertyValue('fadeDuration', parseFloat(document.getElementById('FadeDuration').value)),
        hueRotation: getOGCPropertyValue('hueRotation', parseFloat(document.getElementById('HueRotation').value)),
        maxBrightness: getOGCPropertyValue('maxBrightness', parseFloat(document.getElementById('MaxBrightness').value)),
        minBrightness: getOGCPropertyValue('minBrightness', parseFloat(document.getElementById('MinBrightness').value)),
        opacity: getOGCPropertyValue('opacity', parseFloat(document.getElementById('OGCOpacity').value)),
        saturation: getOGCPropertyValue('saturation', parseFloat(document.getElementById('OGCSaturation').value)),
        minZoom: getOGCPropertyValue('minZoom', parseFloat(document.getElementById('OGCMinZoom').value)),
        maxZoom: getOGCPropertyValue('maxZoom', parseFloat(document.getElementById('OGCMaxZoom').value)),
        visible: getOGCPropertyValue('visible', document.getElementById('OGCVisible').checked)
    };

    // return Object.assign(layerOptions, sourceOptions);
}

function getOGCPropertyValue(propertyName, value) {
    // if (removeDefaults && defaultOGCOptions[propertyName] === value) {
    //     return undefined;
    // }

    return value;
}

function openOGCTab(elm, tabName) {
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


/**********************************************************************************************************************
 * 
 * Jquery Onclick events
 *    
**********************************************************************************************************************/
// Layer Design Selections
$('[name="layerDesignSelections"]').change(function() {
    if ($('[name="layerDesignSelections"]').val() === "Line") {
        // Show the layer design options
        $('.lineDesignOptions').css({
            display: "block"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.OGCDesignOptions').css({
            display: "none"
        });
        $('.simpleDesignOptions').css({
            display: "none"
        });
        $("lineBaseOptionsTab").addClass('active')
    }
    else if($('[name="layerDesignSelections"]').val() === "Polygon"){
        $('.polygonDesignOptions').css({
            display: "block"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.OGCDesignOptions').css({
            display: "none"
        });
        $('.simpleDesignOptions').css({
            display: "none"
        });
        $("polyStyleOptionsTab").addClass('active')

    }
    else if($('[name="layerDesignSelections"]').val() === "Point"){
        $('.pointDesignOptions').css({
            display: "block"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
        $('.OGCDesignOptions').css({
            display: "none"
        });
        $('.simpleDesignOptions').css({
            display: "none"
        });
        $("pointBaseOptionsTab").addClass('active')

    }
    else if($('[name="layerDesignSelections"]').val() === "Simple"){
        $('.simpleDesignOptions').css({
            display: "block"
        });
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
        $('.OGCDesignOptions').css({
            display: "none"
        });
        $("simpleStyleOptionsTab").addClass('active')

    }
    else if($('[name="layerDesignSelections"]').val() === "OGC"){
        $('.OGCDesignOptions').css({
            display: "block"
        });
        $('.pointDesignOptions').css({
            display: "none"
        });
        $('.polygonDesignOptions').css({
            display: "none"
        });
        $('.lineDesignOptions').css({
            display: "none"
        });
        $('.simpleDesignOptions').css({
            display: "none"
        });
        $("OGCStyleOptionsTab").addClass('active')

    }
})