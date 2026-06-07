/******************************************************************************************************************************
 * 
 *  Download Map as an Image  
 * 
 *  - downloadMapImage()
 *      - Download map as an image
 *       
******************************************************************************************************************************/
function downloadMapImage() {
    imageExporter.getBlob().then(function (mapImgBlob) {
        saveAs(mapImgBlob, "mapImage.png");
    }, function (e) {
        alert(e.message);
    });
}

/*******************************************************************************************************************************************************************
 * 
 * JQUERY ONCLICK EVENTS
 *    
*******************************************************************************************************************************************************************/

// simpleChoropleth
$("#downloadMapImg").click(function () {
    if ($(this).is(":checked")) {
        $('.downloadMapImgInfo').css({
            display: "block"
        });

    } else {
        $('.downloadMapImgInfo').css({
            display: "none"
        });
    }
});