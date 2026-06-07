// ===============================================================================
// DEPENDENCIES
// We need to include the path package to get the correct file path for our html
// ===============================================================================
var path = require("path");
// var cors=require('../../cors');
const dotenv = require('dotenv');
dotenv.config();    
// ===============================================================================
// ROUTING
// ===============================================================================
module.exports = function(app) {
  
  // HTML GET Requests
  // Below code handles when users "visit" a page.
  // In each of the below cases the user is shown an HTML page of content
  // ---------------------------------------------------------------------------
  // app.use(cors.permission)
  // app.use(function(req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  //   console.log(res.headersSent); // false
  //   res.send('OK');
  //   console.log(res.headersSent); // true
  //   next();
  // });
  app.get('/', function(req, res) {
    console.log(res)
    res.render('index.html');
  });

};
