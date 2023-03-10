//controllers functions
const abi = require('../Abi/abi.js')
const web3 = require('web3') 
const config = require('../../data.js')
const wallet = require('../models/models.js').walletDb;
const _eth = require('ethereumjs-wallet')
let bigNonce = 0;

let _web3 = new web3(new web3.providers.HttpProvider(config.rpc))

//to save user
exports.newuser = (req, res) => {
    //create new wallet address
    try{    
        req = req.body;
        if(req.name && req.email){  
            const _wal = _eth.default.generate()
            wallet.get(req.email, (_stat, dat) => {  
                if(_stat.status === true) {  
                    //check if it has register print already
                    res.send({status:true, id:req.email})
                }
                else {
                    //does not exists, create one
                    wallet.create((stat, id)=>{
                        if(stat) { console.log(9)
                            //successfull
                            res.send({status:true, id:id})
                        }
                        else {
                            res.send({status:false, msg:'Something went wrong'})
                        }
                    }, {email:req.email, name:req.name, address: _wal.getAddressString(), key: _wal.getPrivateKeyString()})
              
                }
            })
        }
        else{res.send({status:'error', msg:'Name or email address not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
}  
//to reg user print
exports.reguserprint = (req, res) => {
    //create new wallet address
    try{  console.log(1)
        req = req.body;
        if(req.email){ 
            const _wal = _eth.default.generate()
            wallet.get(req.email, (_stat) => {
                if(_stat.status === true) {  
                    //get fingerprint number
                    wallet.getNumOfUsers(req.email,(stat) => {
                        if(stat.status === true) {
                            const print = generateRandomString(stat.num + 1)
                            const num = stat.num + 1;  
                            wallet.save((stat, id)=>{
                                if(stat) { 
                                    //successfull
                                    res.send({status:true, id:id, num:num})
                                }
                                else {
                                    res.send({status:false, msg:'Something went wrong'})
                                }
                            }, {id:req.email, print:print})
                        }
                    })
                }
                else {
                    //does not exists,  
                    res.send({status:false, msg:'User does not exists'})
                }
            })
        }
        else{res.send({status:'error', msg:'email address not provided'})}
    }
    catch(e){console.log(e);res.send({status:'error',  msg:'Internal server error'})}    
} 
//to initiate payment
exports.payment = (req, res) => {
    //create new wallet address
    try{
        req = req.body;
        if(req.print){ 
            const amount = req.amount || 5;
            //get the wallet address first
            wallet.getWithPrint(req.print, (_stat, _res) => { console.log(_res, req.print)
                if(_stat.status === true) {  
                    doFuncs(_res.address, amount, function(_rs, hsh){
                        if(_rs === true) {
                            res.send({status:true, hash:hsh})
                        }
                        else{
                            res.send({status:false})
                        }
                    })
                }
                else {
                    //does not exists,  
                    res.send({status:false, msg:'User does not exists'})
                }
            })
        }
        else{res.send({status:'error', msg:'Fingerprint data not found'})}
    }
    catch(e){res.send({status:'error', msg:'Internal server error'})}    
}  




function doFuncs(_addr, _amt, func){
    //to perform swap functions
    const tokenz = new _web3.eth.Contract(abi.token, config.token_address);
    console.log(web3.utils.toWei(_amt+""))
    tokenz.methods.transfer(_addr, web3.utils.toWei(_amt+""))
    .estimateGas({from: config.gas_wallet})
    .then(res => {
            //get network fee
            _web3.eth.getGasPrice()
            .then(ces => { 
                //ces is gasPrice, res is gas
                _web3.eth.getTransactionCount(config.gas_wallet, 'pending')
                .then(nonce => {   
                    console.log("transferring token to " + _addr)
                    //getting contract data
                    const data =  tokenz.methods.transfer(_addr, web3.utils.toWei(_amt+""))
                    //configuring public nonce
                    if(nonce == bigNonce){nonce++;bigNonce = nonce}
                    //setting details
                    let details = {
                        to: config.token_address,from:config.gas_wallet,
                        gas: web3.utils.toHex(res),
                        maxPriorityFeePerGas: web3.utils.toHex(ces), 
                        nonce: web3.utils.toHex(nonce),
                        chainId: 80001 * 1,
                        data: data.encodeABI(),
                        type:2
                    }
                    let act = _web3.eth.accounts.privateKeyToAccount(config.gas_wallet_signer_key)
                    act.signTransaction(details)
                    .then(sign => { 
                        _web3.eth.sendSignedTransaction(sign.rawTransaction)
                        .then((hash, err) => {   
                            if(!err){ 
                                func(hash.status, hash.transactionHash)
                            }
                            else{func(false)}
                        })
                        .catch(err => {console.log(err);func(false)})
                    })
                    .catch(err => {console.log(err);func(false)})
                })
                .catch(err => {console.log(err);func(false)})
        })
        .catch(err => {console.log(err);func(false)})
        })
        .catch(err => {console.log(err);func(false)})
} 
function generateRandomString(length) {
    let result = '';
    const characters = 'aaaaaaaaaaaaaaaaaaaaaaa';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

//wallet.getNumOfUsers('easyhands@gmail.com',(stat) => {console.log(stat)})
