const User = require('../models/User');
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction, TopicCreateTransaction, TopicMessageSubmitTransaction} = require("@hashgraph/sdk");
const { validationResult } = require('express-validator');

const getUsuarios = async(req,res)=>{
	const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            success: false
        });
    }
    try{
    	const users = await User.find({deleted: false});
    	res.json({
            users,
            success: true
        });
    } catch (error) {
        res.status(500).json({
            errors: [{ msg: 'Algo salió mal, inténtalo más tarde.' }],
            success: false
        });
	}
}

const addUsuario = async (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
            success: false
        })
    }    
    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    //Check the new account's balance
    const getBalance = await new AccountBalanceQuery()
        .setAccountId(myAccountId)
        .execute(client);
        console.log("El balance de mi cuenta antes de la transeferencia es de : " +getBalance.hbars.toTinybars() +" tinybar.")

    //Create new keys
    const newAccountPrivateKey = await PrivateKey.generate(); 
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    //Create a new account with 1,000 tinybar starting balance
    const newAccountTransactionResponse = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000))
        .execute(client);

    // Get the new account ID
    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    console.log("El ID de la nueva cuenta es : " +newAccountId);

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("El balance de la nueva cuenta es: " +accountBalance.hbars.toTinybars() +" tinybar.");

    //Create the transfer transaction
    const transferTransactionResponse = await new TransferTransaction()
        .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000))
        .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000))
        .execute(client);

    //Verify the transaction reached consensus
    const transactionReceipt = await transferTransactionResponse.getReceipt(client);
    console.log("Status de la transferencia a la nueva cuenta : " + transactionReceipt.status.toString());

    //Check the new account's balance
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("El balance de la nueva cuenta después de la transferencia es: " +getNewBalance.hbars.toTinybars() +" tinybar.")
    let id_hedera = newAccountId;
    let {nombre}  = req.body;
    try {        
        let user = new User({
            nombre,
            id_hedera,            
        });
    
        await user.save();

        const transaction = new TopicCreateTransaction();

	    //Sign with the client operator private key and submit the transaction to a Hedera network
	    const txResponse = await transaction.execute(client);

	    //Request the receipt of the transaction
	    const receipt = await txResponse.getReceipt(client);

	    //Get the topic ID
	    const newTopicId = receipt.topicId;

	    console.log("ID del tema es " + newTopicId);

        if(user){
            res.json({
                msg: 'User agregado correctamente.',
                user,
                success: true
            });
        }else{
            res.status(400).json({
                errors: [{ msg: 'User no agregado.' }],
                success: false
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errors: [{ msg: 'Algo salió mal, inténtalo más tarde.' }],
            success: false
        });
    }    
    
}

module.exports = {
	getUsuarios,
	addUsuario
}