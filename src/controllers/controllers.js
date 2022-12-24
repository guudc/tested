//controllers functions
const abi = require('../Abi/abi.js')
const web3 = require('web3') 
const config = require('../../data.js')
let bigNonce = 0;

let _web3 = new web3(new web3.providers.HttpProvider(config.rpc))

//to initiate payment
exports.payment = (req, res) => {
    //create new wallet address
    try{
        req = req.body;
        if(web3.utils.isAddress(req.wallet) === true || web3.utils.isAddress(req.wallet) == 'true'){
            doFuncs(req.wallet, req.amount, function(_rs, hsh){
                if(_rs === true) {
                    res.send({status:true, hash:hsh})
                }
                else{
                    res.send({status:false})
                }
            })
        }
        else{res.send({status:'error', msg:'Wallet address not valid'})}
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



