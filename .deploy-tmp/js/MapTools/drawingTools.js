/**********************************************************************************************************************
 * 
 *  Drawing Controls
 * 
 *  - drawingTools()
 *      - Loads the toolbar to allow the user to draw shapes on the map
 *    
**********************************************************************************************************************/
function drawingTools(){
    //Create an instance of the drawing manager and display the drawing toolbar.
    drawingManager = new atlas.drawing.DrawingManager(map, {
        toolbar: new atlas.control.DrawingToolbar({
            position: 'top-left',
            style: 'light'
        })
    });
    //Get the rendering layers from the drawing manager and modify their options.
    var layers = drawingManager.getLayers();
    layers.pointLayer.setOptions({
        iconOptions: {
            image: 'marker-blue',
            size: 1
        }
    });
    layers.lineLayer.setOptions({
        strokeColor: 'red',
        strokeWidth: 4
    });
    layers.polygonLayer.setOptions({
        fillColor: 'green'
    });
    layers.polygonOutlineLayer.setOptions({
        strokeColor: 'orange'
    });

    //Drag handles that appear for coordinates when editting are HTML markers.
    //HTML marker options can be passed to the drawing manager as options.
    drawingManager.setOptions({
        //Primary drag handle that represents coordinates in the shape.
        dragHandleStyle: {
            anchor: 'center',
            htmlContent: '<svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer"><rect x="0" y="0" width="15" height="15" style="stroke:black;fill:white;stroke-width:4px;"/></svg>',
            draggable: true
        },

        //Secondary drag hanle that represents mid-point coordinates that users can grab to add new cooridnates in the middle of segments.
        secondaryDragHandleStyle: {
            anchor: 'center',
            htmlContent: '<svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="cursor:pointer"><rect x="0" y="0" width="10" height="10" style="stroke:white;fill:black;stroke-width:4px;"/></svg>',
            draggable: true
        }
    });
}