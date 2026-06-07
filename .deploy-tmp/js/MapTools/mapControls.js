/**********************************************************************************************************************
 * 
 *  Map Control Options
 * 
 *  -mapControls()
 *      - Creates a toolbar that allows the user to:
 *          - Zoom map
 *          - Change compass direction
 *          - Change pitch of the map
 *          - Change base map layer 
 * 
 **********************************************************************************************************************/
function mapControls(){
    //Map control functionality.
    map.controls.add([
        new atlas.control.ZoomControl(),
        new atlas.control.CompassControl(),
        new atlas.control.PitchControl(),
        new atlas.control.StyleControl({
            mapStyles: ['road', 'road_shaded_relief', 'grayscale_light', 'night', 'grayscale_dark', 'satellite', 'satellite_road_labels', 'high_contrast_dark']
        })
    ], {
        position: "top-right"
    });
}