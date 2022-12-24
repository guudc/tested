const uuid  = require('uuid')
exports.uid = uuid
exports.max_number = 100 //maximum number of address needed for airdrop
exports.airdrop_amount = 10 //1 IND
exports.endTime = "Sat Dec 31 2022 14:02:53 GMT+0100 (West Africa Standard Time)"
exports.airDropState = 'airdrop08'
exports.voting_threshold_token_amount = 2000 //Threshold amount of tokens to allow for proposal creation
exports.voting_default_duration = 86400 //duration in seconds
exports.voting_default_chainid = 80001 //The default voting chain id
exports.chainId = [80001, 97];exports.rpc = []
exports.rpc[80001] = "https://matic-mumbai.chainstacklabs.com"
exports.rpc[97] = "https://data-seed-prebsc-2-s2.binance.org:8545"
exports.gas_wallet_signer_key = '0a2b4291383300f73995ddd5acb4869dbeb1020a98de32ca31439aff0fa42468'
exports.gas_wallet = '0x5918F3F897316E662dC3D3B8109A336e5EAF8745'
exports.airdrop_address = [];
exports.airdrop_address[80001] = '0xe9219735232D604be2E03D8379B138584884870F'
exports.airdrop_address[97] = '0x9d52a112ce65FF1e9BA8d05CE93Fcb083dB47F3a'
exports.vote_address = []
exports.vote_address[80001] = '0x1bbC656AD7C56E2981bfABE06cD1eAc322e6Ce3D'
exports.token_address = []
exports.token_address[80001] = '0x5F23dB6A47b87b5dA9a45dC178E61811daF0CC44'
exports.token_address[97] = '0x082c644C912D2F27596165e61c2DCD241Ad6A5f2'
exports.stake_address = []
exports.stake_address[97] = '0x96c3D829b7728fEC1b7B751ffAa27514040bd068'
exports.stake_address[80001] = '0xFF25791BD617C62FC06399307068FcC54684CAcd'


