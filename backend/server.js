import express from 'express'
import cors from 'cors'
import { initialise } from './services/init.js'
import { sendData } from './services/sqs.js'
import { checkInitStatus, cleanServicesBeforeExist } from './services/helpers.js'
import { getShopsData } from './services/dynamo.js'
import { clean, setup } from './services/actions.js'

const app = express()
const PORT = 3000

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(express.json())  // for parsing application/json

// app.get('/products/:id', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

app.post('/init', (req, res) => {
  const { region, credential } = req.body

  if (!checkInitStatus()) {
    initialise(credential, region, res)
  }

  res.json({ 
    initStatus: checkInitStatus(),
    msg: 'Successfully Initialized' 
  })
})

app.post('/setup', (req, res) => {
  setup()
  .then(statuses => {
    res.json(statuses)
  })
})

app.post('/cleanup', (req, res) => {
  clean()
  .then(statuses => {
    res.json(statuses)
  })
})

app.post('/addcoffeeshop', (req, res) => {
  let { storeImage, storeName, storeRating, storeComment } = req.body
  if (!storeImage) {
    storeImage = ''
  }
  
  sendData({
    storeImage,
    storeName,
    storeRating,
    storeComment
  }).then(name => {
    res.json({ msg: `Uploaded ${name} to the queue` })
  }).catch(msg => {
    res.json({ msg })
  })
})

app.get('/init-status', (req, res) => {
  res.json({ initStatus: checkInitStatus() })
})

app.get('/get-shops', (req, res) => {
  getShopsData().then(data => {
    res.json({ data })
  })
})

app.get('/', function (req, res) {
  res.json({ msg: 'This is CORS-enabled for all origins!' })
})

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 3000')
  runBeforeExiting()
})

// checking when server is being closed or shutdown
const runBeforeExiting = () => {
  const exitSignals = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException'];

  for (const signal of exitSignals) {
    process.on(signal, async () => {
      console.log(' Deleting AWS Services That Were Used ...');
      await cleanServicesBeforeExist()
      console.log(' Evironment Cleaned ...');
      process.exit();
    });
  }
}