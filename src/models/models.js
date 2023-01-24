/* 
    This is a model function
    containing models to main components
    of the nptr payment system
*/

//Import the mongoose module
const mongoose = require('mongoose');
const schema = mongoose.Schema
const uuid = require('uuid')
const config = require("../../data")

//Set up default mongoose connection
const mongoDB = 'mongodb+srv://Indo:Loveesther567.@cluster0.1o3kiu8.mongodb.net/test';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log("Connected")

//Get the default connection
const db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//creating Wallet database class
class _Wallet{
    /*
        This class controls the wallet
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('user1', (new schema({
            id:String, address:String, key:String, name:String, print:String})))
    }

    create(func, params){
      /*
        This functions create a new wallet
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let mData = {id:params.email, print:"", address:params.address, key:params.key, name: params.name}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.email) 
       })
     }
    get(id, func){
      /*
        This functions get a wallet
        data and store in the database
        It returns the wallet Json data
      */
          if(id){
           //find the request dat
            this.model.find({'id':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){  
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,address:res.address, key:res.key, name:res.name, print: res.print
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    getWithPrint(id, func){
      /*
        This functions get a wallet
        data and store in the database
        It returns the wallet Json data
      */
          if(id){
           //find the request dat
            this.model.find({'print':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){ 
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,address:res.address, key:res.key, name:res.name, print:res.print
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No wallet id found'})
       }
    }
    getNumOfUsers(id,func) {
        /*
            This function returns the number of registered users
        */
        this.model.find({}, (err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){   
                     if(res.length > 0){
                        func({status:true, num:res.findIndex((x) => {return x.id === id})})
                     }
                    else{func({status:'error',msg:'No wallet id found'})}
                }
                else{func({status:'error',msg:'No wallet id found'})}
        })
    }
    getAll(num,func){
        /*
          This functions get list of wallet taht have not been airdrop
          data and store in the database
          It returns the wallet Json data
        */
        this.model.find({'status':'empty'}, (err, res) =>{
                  if(err) func({status:'error',msg:'Internal database error'})
                  if(res != null){  
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'No wallet id found'})}
                  }
                  else{func({status:'error',msg:'No wallet id found'})}
        }).limit(num)
      }
    save(func, params){
        /*
         This functions saves or modify a proposal
         data and store in the database
         It returns either true|false|null
       */ 
        //get the specified request from database
        if(params.id != undefined && params.id != null){
             //first find the proposal
            this.model.find({'id':params.id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){//console.log(res)
                     if(res.length > 0){ 
                        res = res[0]
                        if(params.print || res.print){
                            res.print = params.print 
                        }
                        if(params.name || res.name){
                            res.name = params.name 
                        }
                        const p = res; //console.log(params)
                        this.model.findOneAndUpdate({'id':params.id}, p,{new:true}, (err, res) =>{
                            if(err) func({status:'error',msg:'Internal database error'})
                            if(res != null){
                                func({status:true})
                            }                         
                       })
                     }
                    else{func({status:'error',msg:'No wallet with id found'})}
                }
                else{func({status:'error',msg:'No wallet with id found'})}
           })
            
        }
        else{
            //no request id found
            func({status:'error',msg:'No wallet id found'})
        }
     }
    
}

//exports modules
exports.walletDb =  new _Wallet();