/**********************************************************************************************************************
 * 
 *  Remove Layer
 *  
 *  - removeLayer(input)
 *      - Takes in a layer object and removes it from the map via its id
 *    
**********************************************************************************************************************/
function removeLayer(input) {
    // console.log(input)
    map.layers.remove(input.id)
}
