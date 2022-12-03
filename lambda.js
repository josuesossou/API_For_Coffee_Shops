import { CreateFunctionCommand, CreateEventSourceMappingCommand, UpdateEventSourceMappingCommand } from "@aws-sdk/client-lambda";
import { CreateBucketCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { dynamoParams } from "./dynamo.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Init from "./init.js";
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setLambda = async () => {
    const s3 = Init.s3
    const lambda = Init.lambda
    const sqs = Init.sqs
    const dynamo = Init.dynamo
    const bucketName = Init.bucketName
    const sqsName = Init.sqsName
    const lambdaFuncName = Init.lambdaFuncName
    const region = Init.region
    const role_arn = Init.role_arn
    let event_arn

    const objectKey = "coffeelambdafunc.zip"

    const status = []

    const bucketParams = { Bucket: bucketName }
    const sqsparams = {
        QueueName: sqsName, //SQS_QUEUE_URL
        Attributes: {
          DelaySeconds: "60", // Number of seconds delay.
          MessageRetentionPeriod: "86400", // Number of seconds delay.
        },
    };

    // creating a new s3 bucket
    try {
        await s3.send(
            new CreateBucketCommand(bucketParams)
        )

        console.log("CREATE BUCKET WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        status.push({ msg: 's3 bucket created', status: 200 })
    } catch (error) {
        console.log("FAILED CREATING A BUCKET**********************", error)
        status.push({ msg: 's3 bucket failed', status: 500 })
    }

    // uploading zip file to s3 bucket
    try {
        const fileStream = fs.createReadStream(__dirname + "/coffeelambdafunc.zip");

        await s3.send(
            new UploadPartCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: fileStream,
            })
        )
        console.log("UPLOADING ZIP TO A BUCKET WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        status.push({ msg: 'function zip uploaded', status: 200 })
    } catch (error) {
        console.log("FAILED UPLOADING A FILE TO A BUCKET**********************\n", error)
        status.push({ msg: 'function zip file upload failed', status: 500 })
    }

    // uploading lambda function
    try {
        const lambdFuncParams = {
            Code: {
              S3Bucket: bucketName, // BUCKET_NAME
              S3Key: objectKey, // ZIP_FILE_NAME
            },
            FunctionName: lambdaFuncName,
            Handler: "index.handler",
            Role: Init.role_arn, // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
            Runtime: "nodejs16.x",
            Description: "gets sqs records and put them in dynamodb",
        }

        await lambda.send(new CreateFunctionCommand(lambdFuncParams));
        console.log("UPLOADING LAMBDA FUNCTION WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        status.push({ msg: 'lambda function created', status: 200 })
    } catch (error) {
        console.log("FAILED CREATING LAMBDA FUNCTION**********************\n", error)
        if (error instanceof ResourceConflictException) {
            console.log('************ YAY ResourceConflictException ***********\n')
        }
        status.push({ msg: 'lambda function failed', status: 500 })
    }

    // creating a dynamo table
    try {
        await dynamo.send(new CreateTableCommand(dynamoParams));
        console.log("!!!!!!!!!!!!! CREATING DYNAMO TABLE WORKS !!!!!!!!!!!!!")
        status.push({ msg: 'dynamo table created', status: 200 })
    } catch (error) {
        console.log("FAILED CREATING A DYNAMO TABLE **********************\n", error)
        status.push({ msg: 'dynamo table failed', status: 500 })
    }

    try {
        const sqsData = await sqs.send(new CreateQueueCommand(sqsparams));
       
        const arnparts = sqsData.QueueUrl.split('//')[1].split('/')
        event_arn = `arn:aws:sqs:${region}:${arnparts[1]}:${arnparts[2]}`
        Init.eventArn = event_arn
        Init.sqsURL = sqsData.QueueUrl

        console.log("CREATING SQS WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        status.push({ msg: 'sqs queue created', status: 200 })
    } catch (error) {
        console.log("FAILED CREATING SQS QUEUE **********************\n", error)
        status.push({ msg: 'sqs queue failed', status: 500 })
    }

    try {
        const sourceMapParams = {
            FunctionName: lambdaFuncName,
            BatchSize: 10,
            EventSourceArn: event_arn,
            Enabled: true,
        }
        await lambda.send(new CreateEventSourceMappingCommand(sourceMapParams))
        console.log("LAMBDA EVENT SOURCE MAPPING WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        status.push({ msg: 'lambda event source created', status: 200 })
    } catch (error) {
        console.log("FAILED TO SET UP LAMBDA EVENT MAPPING**********************\n", error)
        status.push({ msg: 'lambda event source failed', status: 500 }) // can't delete this once created, unless you change ARN
    }

    return status
}

export default setLambda
// SQS_QUEUE_URL; e.g., 'https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME'
// "arn:aws:sqs:us-east-2:123456789012:my-queue"