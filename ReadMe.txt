Routes
Post /addwallet
  data to send  {
        wallet:<Wallet address>
    }
returns {status:true}  

Get /state
    returns {status:'active'|'expired'}

Get /end
    returns {status:true, date:<Date string>}

Error return
        {status:'error'|'false', msg:<Error string>}
