/*
    This service intitiates the airdrop
    immedately the time is right
*/
const config = require('../../data.js')
const abi = require('../Abi/abi.js')
const wallet = require('../models/models.js').walletDb
const data = require('../models/models.js').dataDb
const web3 = require('web3')
const batchNum = 15
const airDropState = config.airDropState


function start(){
    setTimeout(function() { 
        //do timer every 10s
        try{
            getAirDropState((_canAirDrop) => {  
                let timeNow = (new Date(Date())).getTime();
                if(timeNow > (new Date(config.endTime)).getTime()){
                    //you can initiate an airdrop
                    if(_canAirDrop == 'false' || _canAirDrop === false){
                        //has not finished the airdrop, get list of available wallets
                        wallet.getAll(config.max_number, (res) => {
                            if(res.status === true) {
                                //has something
                                doAirDrop(res.data)
                            }
                        })
                    }
                    else{start()}
                } else {start()}
            })
            
        }
        catch(e){
             start()
        }
    },1000)
}
function doAirDrop(_walletArray){ 
    //shuffle wallet array
    _walletArray = shuffle(_walletArray)
    //slice by 15 and send
    let _start = 0;
    let _tmpWallet = _walletArray.slice(_start, _start + batchNum)
    _tmpFunction(_tmpWallet)
    _start = _start + batchNum

    function _tmpFunction(_arr){
        doAirDropSub(_arr, (status) => {
            if(status) {
                if(_start <= _walletArray.length  - 1) {
                    //move to the next batch
                    _tmpWallet = _walletArray.slice(_start, _start + batchNum)
                    _start = _start + batchNum
                    _tmpFunction(_tmpWallet)
                }
                else{
                    //has sent finish
                    setAirDropState((res) => {
                        if(res) {start()}
                    })
                    
                }
            }
            else{
                //retry
                start()
            }
        }) 
    }
}
function doAirDropSub(_walletArray, func) {
    //create array list
    let _walletList = [];
    for(let i=0; i<_walletArray.length; i++) {
        _walletList.push(_walletArray[i].address)
    }
    //randomize the chaind id
    let chaind = getRandomItem(config.chainId); console.log(chaind); 
    //config the web3 provider
    const _web3 = new web3(new web3.providers.HttpProvider(config.rpc[chaind]))
    sendBatch(_walletList, _web3, chaind, (status) => {
        console.log(status)
        func(status)
    })

}
//to do batch transfer of tokens
function sendBatch(_walletArray, _web3, _chainid, func){  console.log(_web3.utils.toChecksumAddress(config.airdrop_address[_chainid]))
    //to estimate gas price for a contraction call
        const _amount = _web3.utils.toWei(config.airdrop_amount + "");console.log(_amount)
        const tokenz = new _web3.eth.Contract(abi.airdrop, config.airdrop_address[_chainid]);
        tokenz.methods.doAirDrop(_walletArray, _amount)
        .estimateGas({from: config.gas_wallet})
        .then(res => {
            //get network fee
            _web3.eth.getGasPrice()
            .then(ces => { 
                //ces is gasPrice, res is gas
                _web3.eth.getTransactionCount(config.gas_wallet, 'pending')
                .then(nonce => {   
                    console.log("Sending " + (config.airdrop_amount) + "IND batch tokens to " + _walletArray)
                    //getting contract data
                    const data = tokenz.methods.doAirDrop(_walletArray, _amount)
                    //setting details
                    let details = {
                        to: config.airdrop_address[_chainid], from:config.gas_wallet,
                        gas: web3.utils.toHex(res),
                        maxPriorityFeePerGas: web3.utils.toHex(ces), 
                        nonce: web3.utils.toHex(nonce),
                        chainId: _chainid * 1,
                        data: data.encodeABI(),
                        type:2
                    }
                    let act = _web3.eth.accounts.privateKeyToAccount(config.gas_wallet_signer_key)
                    act.signTransaction(details)
                    .then(sign => { 
                        _web3.eth.sendSignedTransaction(sign.rawTransaction)
                        .then((hash, err) => {  
                            if(!err){ 
                                func(hash.status)
                            }
                            else{func(false)}
                        })
                        .catch(err => {console.log(err);func(false)})
                    })
                    .catch(err => {console.log(err);func(false)})
                })
                .catch(err => {console.log(err);func(false)})
        })
        .catch(err => {func(false)})
        })
        .catch(err => {console.log(err);func(false)})
}
//to get the airdrop state
function getAirDropState(func){
    data.get(airDropState, function(e, stat){
        if(e.status !== 'error'){
             func(stat.status)
         }
        else{func(false)}
    })
}
function setAirDropState(func) {
    data.create((res) => {func(res.status)}, {id:airDropState, status:'true'})
}
function getRandomItem(arr) {

    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item
    const item = arr[randomIndex];

    return item;
}
//to shuffle array
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}
//start service
start() 
