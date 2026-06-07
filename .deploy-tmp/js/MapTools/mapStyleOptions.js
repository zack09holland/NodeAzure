/******************************************************************************************************************************
 * 
 *  Line Layer Design Options  
 * 
 *  - mapStyleOptions()
 *      - Update the map with the options in the input fields.
 * 
 *  - updateStyles()
 *      - Update the maps style options.
 * 
 *  - getMapStyleInputOptions()
 *      - Gets the inputted settings from the user
 * 
 *  - getMapPropertyValue
 *      - Gets the property value of the elements
 * 
 *  - getMapStyleSelectValue()
 *      - Gets the selected value from the drop downs
 *       
******************************************************************************************************************************/
var defaultOptions;
function mapStyleOptions(){
    defaultOptions = map.getStyle();

    //Update the map with the options in the input fields.
    updateStyles();
}

function updateStyles() {
    var options = getMapStyleInputOptions();

    //Update the maps style options.
    map.setStyle(options);
}

function getMapStyleInputOptions() {
    removeDefaults = document.getElementById('RemoveDefaults').checked;

    return {
        // autoResize: getMapPropertyValue('autoResize', document.getElementById('autoResize').checked),
        renderWorldCopies: getMapPropertyValue('renderWorldCopies', document.getElementById('renderWorldCopies').checked),
        showBuildingModels: getMapPropertyValue('showBuildingModels', document.getElementById('showBuildingModels').checked),
        // showFeedbackLink: getMapPropertyValue('showFeedbackLink', document.getElementById('showFeedbackLink').checked),
        // showLogo: getMapPropertyValue('showLogo', document.getElementById('showLogo').checked),
        showTileBoundaries: getMapPropertyValue('showTileBoundaries', document.getElementById('showTileBoundaries').checked),
    };
}

function getMapPropertyValue(propertyName, value) {

    if (removeDefaults) {
        if (propertyName.indexOf('.') > -1) {
            var p = propertyName.split('.');
            var val = defaultOptions;
            for (var i = 0; i < p.length; i++) {
                val = val[p[i]];
            }

            if (val === value) {
                return undefined;
            }
        } else if (defaultOptions[propertyName] === value) {
            return undefined;
        }
    }
    return value;
}

function getMapStyleSelectValue(id) {
    var elm = document.getElementById(id);
    return elm.options[elm.selectedIndex].value;
}


/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/
// mapStyleOptions
$("#mapStyleOptions").click(function () {
    if ($(this).is(":checked")) {
        $('.mapStyleOptionsInfo').css({
            display: "block"
        });
        
    } else {
        $('.mapStyleOptionsInfo').css({
            display: "none"
        });
    }
});