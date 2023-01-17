import express from 'express'
import cors from 'cors'
import path, { dirname } from 'path'
import { initialise } from './services/init.js'
import { sendData } from './services/sqs.js'
import { checkInitStatus, cleanServicesBeforeExist } from './services/helpers.js'
import { deleteShopsData, getShopsData } from './services/dynamo.js'
import { clean, setup } from './services/actions.js'

const __dirname = dirname('./')

const app = express()
const PORT = process.env.NODE_ENV === 'production'? 80 : 3000

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))
app.use(express.json())  // for parsing application/json
app.use('/static', express.static(path.join(__dirname, 'public'))),



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

app.post('/add-coffee-shop', (req, res) => {
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
    res.json({ msg: `Uploaded ${name} to the queue`, status: 200 })
  }).catch(msg => {
    res.json({ msg, status: 500 })
  })
})

app.delete('/delete-coffee-shop', (req, res) => {
  let { storeID } = req.body
  
  deleteShopsData(storeID)
  .then(msg => {
    res.json({ msg })
  }).catch(msg => {
    res.json({ msg })
  })
})

app.get('/init-status', (req, res) => {
  res.json({ initStatus: checkInitStatus() })
})

app.get('/get-shops', (req, res) => {
  getShopsData()
  .then(data => {
    res.json({ data })
  })
  .catch(err => {
    res.json(err)
  })
})

app.get('/', function (req, res) {
  res.redirect(__dirname + '/static')
})

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port ' + PORT)
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