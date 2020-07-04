import express  from "express";
import mongoose from 'mongoose';
import {accountsRouter} from "./routes/accountRouter.js";





(
  async () => {
    try{
    await mongoose.connect(
      "mongodb+srv://root:1q2w3e4r@cluster0-tdhq5.mongodb.net/accounts?retryWrites=true&w=majority",
       {
           useNewUrlParser: true,
           useUnifiedTopology:true
           }
    );
  }catch(error){
    console.log("Erro ao conectar"+error);
  }
  })();

  const app = express();

app.use(express.json());
app.use(accountsRouter);

  app.listen(3000, () => console.log('API Startada, porta 3000'));








