import mongoose from 'mongoose';


const accountsSchema = mongoose.Schema({

    name:{
        type: String,
        required: true

    },
    balance: {
        
       type: Number,
       required: true,
       validate(balance){
        if(balance < 0 ) throw new Error("Valor negativo para balance");
        }
    },
    
    agencia:{
        type: Number,
        required: true
    },

    conta:{
        type: Number,
        required: true
    }, 
});

const accountModel = mongoose.model('contas', accountsSchema, 'contas');

export {accountModel};