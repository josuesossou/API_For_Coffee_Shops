const AWS = require('aws-sdk');
const { randomUUID } = require('crypto')

const docClient = new AWS.DynamoDB.DocumentClient();

async function createItem(data) {
  const params = {
    TableName : 'Coffee-shop-app-table-test',
    /* Item properties will depend on your application concerns */
    Item: {
      StoreID: randomUUID(),
      StoreData: data,
    }
  }

  try {
    await docClient.put(params).promise();
    console.log('!!!Uploaded to dynamoDB!!!')
  } catch (err) {
    console.log('***FAILED TO UPLOAD TO DYNAMO****', err)
    return err;
  }
}

exports.handler = async (event) => {
  for (let record of event.Records) {
    try {
      await createItem(record.body)
      console.log('!!!SUCCESS!!!', record.body)
    } catch (error) {
      console.log("**FAILED**", error)
    }
  }
};