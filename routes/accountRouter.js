import express from "express";
import { accountModel } from "./models/accountModel.js";
const app = express();

app.get("/account", async (req, res) => {
  try {
    const data = await accountModel.find({});
    console.log(data);
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

/*4) Crie um endpoint para registrar um depósito em uma conta. Este endpoint deverá receber
 como parâmetros a “agencia”, o número da “conta” e o valor do depósito. Ele deverá atualizar
 o “balance” da conta, incrementando-o com o valor recebido como parâmetro. O endpoint deverá
  validar se a conta informada existe, caso não exista deverá retornar um erro, caso exista 
  retornar o saldo atual da conta.*/

app.post("/account/deposito", async (req, res) => {
  try {
    const account = await accountModel.findOne({ conta: req.body.conta });

    let newBalance = req.body.deposito + account.balance;
    console.log(newBalance);

    let filter = { conta: req.body.conta };
    let update = { balance: newBalance };
    let newTrue = { new: true };

    const atualizar = await accountModel.findOneAndUpdate(
      filter,
      update,
      newTrue
    );

    res.send(atualizar);
  } catch (error) {
    res.status(500).send(error);
  }
});

/*5) Crie um endpoint para registrar um saque em uma conta. Este endpoint deverá receber
 como parâmetros a “agência”, o número da “conta” e o valor do saque. Ele deverá atualizar 
 o “balance” da conta, decrementando-o com o valor recebido com parâmetro e cobrando uma
  tarifa de saque de (1). O endpoint deverá validar se a conta informada existe, caso não
   exista deverá retornar um erro, caso exista retornar o saldo atual da conta. Também 
   deverá validar se a conta possui saldo suficiente para aquele saque, se não tiver deverá
    retornar um erro, não permitindo assim que o saque fique negativo.*/

app.post("/account/saque", async (req, res) => {
  try {
    const { saque, agencia, conta } = req.body;

    const tarifa = 1;
    const account = await accountModel.findOne({ conta: conta });

    let newBalance = account.balance - saque - tarifa;

    let filter = { conta: conta };
    let update = { balance: newBalance };
    let newTrue = { new: true };

    const atualizar = await accountModel.findOneAndUpdate(
      filter,
      update,
      newTrue
    );

    res.send(atualizar);
  } catch (error) {
    res.status(500).send(error);
  }
});

/*6) Crie um endpoint para consultar o saldo da conta. Este endpoint deverá receber
   como parâmetro a “agência” e o número da “conta”, e deverá retornar seu “balance”.
    Caso a conta informada não exista, retornar um erro.*/

app.post("/account/consulta", async (req, res) => {
  try {
    const { agencia, conta } = req.body;

    const account = await accountModel.findOne({
      conta: conta,
      agencia: agencia,
    });
    console.log(account);

    if (account != null) {
      res.send(account);
    } else {
      res.send({ erro: "Conta não encontrada" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/*7. Crie um endpoint para excluir uma conta. Este endpoint deverá receber como parâmetro a “agência”
 e o número da “conta” da conta e retornar o número de contas ativas para esta agência.*/

 app.delete("/account/remover", async (req, res) => {
  try {
  
    const { agencia, conta } = req.body;
   
  
    const account = await accountModel.deleteOne({
      conta: conta,
      
    });

    const accounts = await accountModel.count({
      agencia: agencia,
    });
    

    
      res.send({accounts});
    
  } catch (error) {
    res.status(500).send(error);
  }
});

/*8. Crie um endpoint para realizar transferências entre contas. Este endpoint deverá receber
   como parâmetro o número da “conta” origem, o número da “conta” destino e o valor de transferência.
    Este endpoint deve validar se as contas são da mesma agência para realizar a transferência, caso 
    seja de agências distintas o valor de tarifa de transferencia (8) deve ser debitado na “conta” origem.
     O endpoint deverá retornar o saldo da conta origem.*/

app.post("/account/transferencia", async (req, res) => {
  try {
    let newTrue = { new: true };

    const { contaOrigem, contaDestino, value } = req.body;

    const accountOrigem = await accountModel.findOne({ conta: contaOrigem });
    const accountDestino = await accountModel.findOne({ conta: contaDestino });

    /**************************ORIGEM**************************/

    const tarifa = 8;
    let newBalanceOrigem = 0;

    if (accountDestino.agencia != accountOrigem.agencia) {
      newBalanceOrigem = accountOrigem.balance - value - tarifa;
    } else {
      newBalanceOrigem = accountOrigem.balance - value;
    }
    
    let filterOrigem = { conta: contaOrigem };
    let updateOrigem = { balance: newBalanceOrigem };

    const atualizarOrigem = await accountModel.findOneAndUpdate(
      filterOrigem,
      updateOrigem,
      newTrue
    );

    /**************************DESTINO**************************/

    let newBalanceDestino = accountDestino.balance + value;
    let filterDestino = { conta: contaDestino };
    let updateDestino = { balance: newBalanceDestino };

    const atualizarDestino = await accountModel.findOneAndUpdate(
      filterDestino,
      updateDestino,
      newTrue
    );

    res.send(atualizarOrigem);
  } catch (error) {
    res.status(500).send(error);
  }
});


/*9. Crie um endpoint para consultar a média do saldo dos clientes de determinada agência. 
  O endpoint deverá receber como parametro a “agência” e deverá retornar o balance médio da conta.*/
app.post("/account/media", async (req, res) => {
  try {
    const { agencia } = req.body;

    const media = await accountModel.aggregate([
      { $match: { agencia: agencia } },
      { $group: { _id: null, total: { $avg: "$balance" } } },
    ]);
    console.log(media);

    if (media.length > 0) {
      res.send(media);
    } else {
      res.send({ erro: "Contas não encontradas" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

/*10. Crie um endpoint para consultar os clientes com o menor saldo em conta.
 O endpoint devera receber como parâmetro um valor numérico para determinar a 
 quantidade de clientes a serem listados, e o endpoint deverá retornar em ordem
  crescente pelo saldo a lista dos clientes (agência, conta, saldo).*/

app.post("/account/menores_saldos", async (req, res) => {
  try {
    const { quantidade } = req.body;
    const menores_saldos = await accountModel
      .find({}, { _id: 0, name: 0 })
      .sort({ balance: 1 })
      .limit(quantidade);

    res.send(menores_saldos);
  } catch (error) {
    res.status(500).send(error);
  }
});

/*11. Crie um endpoint para consultar os clientes mais ricos do banco. O endpoint deverá receber
 como parâmetro um valor numérico para determinar a quantidade de clientes a serem listados, e o
  endpoint deverá retornar em ordem decrescente pelo saldo, crescente pelo nome, a lista dos clientes 
  (agência, conta, nome e saldo).*/

  app.post("/account/maiores_saldos", async (req, res) => {
    try {
      const { quantidade } = req.body;
      const maiores_saldos = await accountModel
        .find({}, { _id: 0, name: 0 })
        .sort({ balance: -1 })
        .limit(quantidade);
  
      res.send(maiores_saldos);
    } catch (error) {
      res.status(500).send(error);
    }
  });

/*12. Crie um endpoint que irá transferir o cliente com maior saldo em conta de cada agência para
a agência private agencia=99. O endpoint deverá retornar a lista dos clientes da agencia private.*/

app.post("/account/vips", async (req, res) => {
  try {

    const agencias = await accountModel.find({}, {name:1, agencia:1}).distinct("agencia");
  

    for(let i=0; i< agencias.length; i++){
      const vips = await accountModel.find({}, { _id: 0, name: 1 }).sort({ balance: 1 });
      console.log("Agenia: "+vips);


   }
    //res.status(agencias);
    res.send(agencias);
    
  } catch (error) {
    res.status(500).send(error);
  }
});

export { app as accountsRouter };
