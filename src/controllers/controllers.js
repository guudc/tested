//controllers functions
const config = require('../../data.js')
const wallet = require('../models/models.js').walletDb
const proposal = require('../models/models.js').proposalDb
const data = require('../models/models.js').dataDb
const abi = require('../Abi/abi.js')
const web3 = require('web3')
const id_gen = config.uid //to generate uuid V4
const airDropState = config.airDropState

/* 
     Airdrop controllers
*/               
//to add new wallet address
exports.addwallet = (req, res) => {
    //create new wallet address
    try{
        req = req.body;
        if(web3.utils.isAddress(req.wallet) === true || web3.utils.isAddress(req.wallet) == 'true'){
           if(!isExpired()){
                //try and see if wallet has been added
                getUser(req.wallet, function(e){
                    if(e === false){
                        //has not been added
                        wallet.create(function(e){
                            if(e.status === true){
                                res.send({status:true});
                            }
                        }, {wallet:req.wallet})
                    }
                    else{
                        //still send successfull
                        res.send({status:true});
                    }
                })
            }
            else{
                res.send({status:'error', msg:'Expired'})
            }
        }
        else{res.send({status:'error', msg:'Wallet address not valid'})}
    }
    catch(e){res.send({status:'error', msg:'Internal server error'})}    
} 
//to check the status of the airdrop
exports.state = (req, res) => {
    try{
        if(isExpired()){
            //get if its ongoing
            getAirDropState((_status) => {
                if(_status == 'false' || _status === false){
                    //airdrop is still ongoing
                    res.send({status:'ongoing'})
                }
                else {res.send({status:'completed'})}
            })
        }
        else{res.send({status:'active'})}
    }
    catch(e){res.send({status:'error', msg:'Internal server error'})}    
} 
//to return the end date of the airdrop
exports.enddate = (req, res) => {
    try{
        res.send({status:true, date:config.endTime});
    }
    catch(e){res.send({status:'error', msg:'Internal server error'})}    
} 


/*
// /*
//     Voting controllers
// */
// //to generate new proposal
exports.newproposal = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            title, summary, method, conclusion, action, data 
        */
       if(r.title && r.body) {
            //to create a new proposal, check if the user has enought tokens to do so
            getAllIndBalance(r.wallet, (_amount) => {
                if(_amount >= config.voting_threshold_token_amount) {
                    //create proposal data
                    const _props = {title:r.title,summary:r.body,method:"",conclusion:"",action:r.action,wallet:r.wallet,data:r.data || null}
                    //save new proposal to database
                    proposal.create((rs, id) => {
                        if(rs.status === true){
                            res.send({status:true, proposal_id:id})
                        }
                        else{
                            res.send({status:'false', msg:'Internal server error'})
                        }
                    }, {id:id_gen.v4(), data: _props})
                }
                else{
                    //has reached end of chain id
                    res.send({status:'false', msg:'insufficient amount of IND tokens', msgno:1})
                }
            })
       }
       else{res.send({status:'error', msg:'Some parametres are missing'})}
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    
   
}
//to get proposal details
exports.getproposal = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            id 
        */
       if(r.id) {
            proposal.get(r.id, (rs, data) => {
                if(rs.status === true){
                    data.data.created = data.created
                    data.data.end = data.end
                    let _endDate = (new Date(data.end)).getTime(); 
                    if(isNaN(_endDate)) {_endDate = 0}; 
                    //get proposal details
                    const _web3 = new web3(new web3.providers.HttpProvider(config.rpc[config.voting_default_chainid]))
                    doFuncs({endDate: _endDate, web3:_web3, type:'votes', id:r.id, vote:config.vote_address[config.voting_default_chainid]}, (_res) => {
                        if(_res !== false) {
                                //check if it has ended
                                const _curTime = new Date(Date()).getTime()
                                _endDate = new Date(_endDate).getTime()
                                if(_curTime > _endDate) {
                                    //has ended
                                    if(_res[0] > _res[1]) {
                                        //it was approved by the voting commitee
                                        data.data.status = 'settled'
                                    }
                                    else if(_res[0] < _res[1]){
                                        data.data.status = 'cancelled'
                                    }
                                    else if(_res[0] == _res[1]){
                                        data.data.status = 'undecided'
                                    }
                                    //save the current results
                                    proposal.save({status: data.data.status, id: data.id}, (rs) => {})
                                } 
                        }
                        res.send({status:true, proposal:data.data, id:data.id,}) 
                     })
                    
                }
                else{
                    res.send({status:'error', msg:'Proposal with id not found'})
                }
            })
       }
       else{res.send({status:'error', msg:'Proposal id missing'})}
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    

}
//to modify a proposal
exports.modifyproposal = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            id 
        */
       if(r.id) {
             proposal.save(r, (rs) => {
                if(rs.status === true) {
                    res.send({status:true})
                }
                else{res.send({status:'error', msg:'Proposal with id not found'})}
             })
       }
       else{res.send({status:'error', msg:'Some parametres are missing'})}
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    

}
//to modify a proposal
exports.removeproposal = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            id 
        */
       if(r.id) {
            //first check if this proposal has votes
            proposal.get(r.id, (rs, data) => {
                if(rs.status === true){
                    let _endDate = (new Date(data.end)).getTime(); 
                    if(isNaN(_endDate)) {_endDate = 0};  
                    const _web3 = new web3(new web3.providers.HttpProvider(config.rpc[config.voting_default_chainid]))
                    doFuncs({endDate:_endDate, web3:_web3, type:'votes', id:r.id, vote:config.vote_address[config.voting_default_chainid]}, (_res) => {
                        if(_res !== false) {
                            //has results
                            if(((_res[0]) * 1) > 0 || ((_res[1]) * 1) > 0){
                                //has votes 
                                res.send({status:'error', msg:'Proposal already has votes'})
                            }
                            else {
                                //remove the proposal
                                proposal.delete(r.id, (rs) => {
                                    if(rs.status === true) {
                                        res.send({status:true})
                                    }
                                    else{res.send({status:'error', msg:'Proposal with id not found'})}
                                })
                            }
                        }
                        else{res.send({status:'error', msg:'Can not remove proposal now'})}
                    })
                }
            })
             
       }
       else{res.send({status:'error', msg:'Proposal id not given'})}
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    

}
//to get all proposal
exports.getallproposal = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            id 
        */
        proposal.getAll((rs) => {console.log(rs)
            if(rs.status === true){
                let _res = []
                for(let i=0;i<rs.data.length;i++){
                    _res.push({
                        id:rs.data[i].id, data:JSON.parse(rs.data[i].data), created:new Date(rs.data[i].created)  + "", end:new Date(rs.data[i].end)
                    })
                }
                res.send({status:true, data:_res})
            }
            else{
                res.send({status:'error', msg:'No Proposals found'})
                
            }
        })
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    

}
//to get IND balance across all chains
exports.getindbalance = (req, res) => {
    try{
        const r = req.body;
        //check if the neccessary parametres are available
        /*
            Parametres
            wallet 
        */
       if(r.wallet) {
        getAllIndBalance(r.wallet, (_amt) => {
            res.send({status:true, balance:_amt})
        })
       }
       else{res.send({status:'error', msg:'Wallet address not found'})}
    }
    catch(e){console.log(e);res.send({status:'error', msg:'Internal server error'})}    

}



function getUser(wallet_address, func){
        wallet.get(wallet_address, function(e, stat){
            if(e.status !== 'error'){
                 func(stat)
             }
            else{func(false)}
        })
}
//to know if the airdrop has expired
function isExpired() {
    let timeNow = (new Date(Date())).getTime();
        if(timeNow > (new Date(config.endTime)).getTime()){
            return true
        }
        else{return false}
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
function doFuncs(type, func){
    //to perform swap functions
    const _web3 = type.web3
    if(type.type == 'balance'){
        //to check the balance of a user tokens
        const tokenz = new _web3.eth.Contract(abi.token, type.token);
        tokenz.methods.balanceOf(type.address)
        .call().then(amt => {
            func(amt)
        })
        .catch(err => {func(false)})
    }
    else if(type.type == 'stakebalance'){
        //to check the stake balance of a user tokens
        const tokenz = new _web3.eth.Contract(abi.stake, type.stake);
        tokenz.methods._amount(type.address)
        .call().then(amt => {
            func(amt)
        })
        .catch(err => {func(false)})
    }
    else if(type.type == "votes") {   
        //to get the number of votes
        const tokenz = new _web3.eth.Contract(abi.vote, type.vote);
        tokenz.methods.getProposal(type.id, type.endDate/1000)
        .call().then(_res => {
            func(_res)
        })
        .catch(err => {console.log(err);func(false)})
    }
} 
function getAllIndBalance(_wallet, func){
    let _started = false; let _count = 0;
    let totalAmount = 0;
    config.chainId.forEach((id) => {
                const _web3 = new web3(new web3.providers.HttpProvider(config.rpc[id]))
                doFuncs({type:'balance', token:config.token_address[id], address:_wallet, web3:_web3},
                (_amount) => { 
                    _count++; 
                    if(_amount !== false){
                        totalAmount += (_amount / 1E18)
                    }
                    if(_count >= config.chainId.length) {
                        //has reached end of chain id
                        func(totalAmount)
                    }
                })
    })
}



