import express from 'express'
import cors from 'cors'
import { initialise } from './services/init.js'
import setLambda from './services/lambda.js'
import { sendData } from './services/sqs.js'
import { credential } from './index.js'
// var express = require('express')
// var cors = require('cors')

const app = express()
const PORT = 3000

var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions))

// app.get('/products/:id', function (req, res, next) {
//   res.json({msg: 'This is CORS-enabled for all origins!'})
// })

app.post('/init', (req, res,) => {
  // const { region, role_arn, credential } = req.body
  const role_arn = 'arn:aws:iam::364090414621:role/Lambda_Role_Test_CofeeApp'
  const region = 'us-east-1'

  initialise(credential, region, role_arn)
  res.json({ msg: 'Services are ready to be used. If it is your first time, make sure to run the setup' })
})

app.post('/setup', (req, res) => {
  setLambda(res)
})

app.post('/addcoffeeshop', (req, res) => {
  sendData({
    storeImage:  `https://static01.nyt.com/images/2022/10/14/arts/13till-review/merlin_214440696_9ae2e84d-c950-4f84-b7ab-625d74a257d0-videoSixteenByNine3000.jpg`,
    storeName: 'Starbucks',
    storeRating: 3,
    storeComment: 'it is alright'
  })
  res.json({ msg: 'uploaded data to the queue' })
})

app.get('/', function (req, res, next) {
  res.json({ msg: 'This is CORS-enabled for all origins!' })
})

app.listen(PORT, function () {
  console.log('CORS-enabled web server listening on port 3000')
})
