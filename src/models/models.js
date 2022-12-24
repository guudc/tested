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
const mongoDB = 'mongodb://127.0.0.1:27017/myapp';
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
        this.model = mongoose.model('wallet', (new schema({
            id:String, address:String, status:String})))
    }

    create(func, params){
      /*
        This functions create a new wallet
        data and store in the database
        It returns the wallet Id
      */
       //create id
       let _id = uuid.v4();let _wallet;
       _wallet = params.wallet
       let mData = {id:_id, address:_wallet, status:'empty'}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, _id) 
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
            this.model.find({'address':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id,address:res.address, status:res.status
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
    
}
class _Proposal{
    /*
        This class controls the proposal
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('proposal', (new schema({
            id:String, data:String, created:Number, end: Number})))
    }

    create(func, params){
       
       //create id
       params.data.status = 'active'
       let mData = {id:params.id, data:JSON.stringify(params.data), created:(new Date(Date())).getTime(), end:(new Date(Date())).getTime() + (config.voting_default_duration * 1000)}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.id) 
       })
     }
    get(id, func){
      
          if(id){
           //find the proposal dat
            this.model.find({'id':id},(err, res) =>{
                if(err){func({status:'error',msg:'Internal database error'})}
                else if(res != null){
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id, data:JSON.parse(res.data), created:new Date(res.created)  + "", end: new Date(res.end)
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No id found'})}
                }
                else{func({status:'error',msg:'No id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No id found'})
       }
    }
    getAll(func){
        /*
          This functions get list of wallet taht have not been airdrop
          data and store in the database
          It returns the wallet Json data
        */
        this.model.find({}, (err, res) =>{
                  if(err){ func({status:'error',msg:'Internal database error'})}
                  else if(res != null){   
                       if(res.length > 0){
                          func({status:true, data:res})
                       }
                      else{func({status:'error',msg:'Nothing found'})}
                  }
                  else{func({status:'error',msg:'Nothing found'})}
        }).sort({'created':-1})
      }
    delete(id, func){
      
        if(id){
         //find the proposal dat
          this.model.deleteOne({'id':id},(err, res) =>{
              if(err) func({status:'error',msg:'Internal database error'})
              if(res != null) {
                if(res.deletedCount >= 1){
                    func({status:true})
                }else{func({status:true})}
            }
         })
         
     }
     else{
         //no request id found
         func({status:'error',msg:'No id found'})
     }
    }
    save(params, func){
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
                if(res != null){
                     if(res.length > 0){
                        res = JSON.parse(res[0].data)
                        if(params.status && res.status){
                            res.status = params.status.toLowerCase()
                        }
                        if(params.title && res.title){
                            res.title = params.title 
                        }
                        if(params.method && res.method){
                            res.method = params.method 
                        }
                        if(params.summary && res.summary){
                            res.summary = params.summary 
                        }
                        if(params.conclusion && res.conclusion){
                            res.conclusion = params.conclusion 
                        }
                        if(params.action && res.action){
                            res.action = params.action 
                        }
                        if(params.data && res.data){
                            res.data = params.data 
                        }
                        const p = {data:JSON.stringify(res)}
                        this.model.findOneAndUpdate({'id':params.id}, p,{new:true}, (err, res) =>{
                            if(err) func({status:'error',msg:'Internal database error'})
                            if(res != null){
                                func({status:true})
                            }                         
                       })
                     }
                    else{func({status:'error',msg:'No proposal with id found'})}
                }
                else{func({status:'error',msg:'No Proposal with id found'})}
           })
            
        }
        else{
            //no request id found
            func({status:'error',msg:'No Proposal id found'})
        }
     }
     
   
    
}
class _Data{
    /*
        This class controls the data
        model database connection
    */
    model = null;
    constructor(){
        //initialize database schema
        this.model = mongoose.model('data', (new schema({
            id:String, status:String})))
    }

    create(func, params){
       
       //create id
       let mData = {id:params.id, status:params.status}
       new this.model(mData)
       .save((err) =>{
           if(err) func({status:'error',msg:'Internal database error'})
           func({status:true}, params.id) 
       })
     }
    get(id, func){
      
          if(id){
           //find the request dat
            this.model.find({'id':id},(err, res) =>{
                if(err) func({status:'error',msg:'Internal database error'})
                if(res != null){
                     if(res.length > 0){
                        res = res[0]
                        let p = {
                            id:res.id, status:res.status
                        }
                        func({status:true}, p)
                     }
                    else{func({status:'error',msg:'No id found'})}
                }
                else{func({status:'error',msg:'No id found'})}
           })
           
       }
       else{
           //no request id found
           func({status:'error',msg:'No id found'})
       }
    }
    
   
    
}

//exports modules
exports.walletDb =  new _Wallet();
exports.dataDb =  new _Data();
exports.proposalDb =  new _Proposal();