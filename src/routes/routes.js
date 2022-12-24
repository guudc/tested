/* 
    This is a route function
    containing route to main components
    of the payment system
*/
const express = require("express")
const router = express.Router()
const controller = require('../controllers/controllers.js')
const dataParser = require('body-parser')
const fs = require('fs')
router.use(dataParser.json({extended:true}))
const path = __dirname.substring(0, __dirname.indexOf("src")) + "/test/"
router.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

//creating main routing functions
//using POST for main functions
//to add new user wallet
router.post('/addwallet', controller.addwallet)
//to check if the airdrop is still going on
router.get('/state', controller.state)
//to get the end date of the airdrop
router.get('/end', controller.enddate)
//creating routing functions for the voting
//to create new proposal
router.post('/newproposal', controller.newproposal)
//to get proposal details
router.post('/getproposal', controller.getproposal)
//to get all proposal details
router.get('/allproposal', controller.getallproposal)
//to modify proposal details
router.post('/modifyproposal', controller.modifyproposal)
//to delete proposal
router.post('/removeproposal', controller.removeproposal)
//to get IND balance across all chain
router.post('/getallbalance', controller.getindbalance)

//listen to 404 request
router.get("*", (req, res) =>{
    let tm = req.url
    if(fs.existsSync(path + tm)){
        res.sendFile(path + tm)
    }
    else{
        res.status(404).json({
            success: false,
            message: "Page not found",
            error: {
                statusCode: 404,
                message:
                    "You are trying to access a route that is not defined on this server."
            }
        })
    }
})

//exports router
module.exports = router
    
