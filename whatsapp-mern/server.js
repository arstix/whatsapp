// importing
import express from "express"
import mongoose from "mongoose"
import Messages from './dbMessages.js'
import Pusher from "pusher"
import Cors from "cors"

// app config
const app = express()
const port = process.env.PORT || 8080
const url = "mongodb+srv://user:eShG7kYBwdHvLlVU@cluster0.7gvab.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const pusher = new Pusher({
  appId: "1194061",
  key: "18cb7cbe146a85782a41",
  secret: "ace59e3e5f4786289b78",
  cluster: "eu",
  useTLS: true
});

// middlewares
app.use(express.json())
app.use(Cors())
// DB config
mongoose.connect(url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.once("open", () => {
  console.log("DB connected");

  const msgCollection = db.collection("whatsapps")
  const changeStream = msgCollection.watch()
  console.log(msgCollection)

  changeStream.on('change', (change) => {
    console.log(change)

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger('messages', 'inserted',
      {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
        received: messageDetails.received,
      })
    } else {
      console.log('Error triggering Pusher')
    }

  })
})

// Api routes
app.get('/', (req, res) => res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(200).send(data)
    }
  })
})

app.post('/messages/new', (req, res) => {
  const dbMessage = req.body

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err)
    } else {
      res.status(201).send(data)
    }
  })
})
//listen
app.listen(port, () => console.log(`listening on localhost ${port}`));
