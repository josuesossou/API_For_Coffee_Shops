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
    const s3c = Init.s3Client
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

    const bucketParams = { Bucket: bucketName }
    const sqsparams = {
        QueueName: sqsName, //SQS_QUEUE_URL
        Attributes: {
          DelaySeconds: "60", // Number of seconds delay.
          MessageRetentionPeriod: "86400", // Number of seconds delay.
        },
    };
    const lambdFuncParams = {
        Code: {
          S3Bucket: bucketName, // BUCKET_NAME
          S3Key: objectKey, // ZIP_FILE_NAME
        },
        FunctionName: lambdaFuncName,
        Handler: "index.handler",
        Role: role_arn, // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
        Runtime: "nodejs16.x",
        Description: "gets sqs records and put them in dynamodb",
    }
    

    // creating a new s3 bucket
    try {
        await s3c.send(
            new CreateBucketCommand(bucketParams)
        )

        console.log("CREATE BUCKET WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
    } catch (error) {
        console.log("FAILED CREATING A BUCKET**********************", error)
        // return Promise.reject(error)
    }

    // uploading zip file to s3 bucket
    try {
        const fileStream = fs.createReadStream(__dirname + "/coffeelambdafunc.zip");

        await s3c.send(
            new UploadPartCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: fileStream,
            })
        )
        console.log("UPLOADING ZIP TO A BUCKET WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
        
    } catch (error) {
        console.log("FAILED UPLOADING A FILE TO A BUCKET**********************", error)
        // return Promise.reject(error)
    }

    // uploading lambda function
    try {
        await lambda.send(new CreateFunctionCommand(lambdFuncParams));
        console.log("UPLOADING LAMBDA FUNCTION WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
    } catch (error) {
        console.log("FAILED CREATING A LAMBDA FUNCTION**********************", error)
        // return Promise.reject(error)
    }

    // creating a dynamo table
    try {
        await dynamo.send(new CreateTableCommand(dynamoParams));
        console.log("CREATING DYNAMO TABLE WORKS !!!!!!!!!!!!!!!!!!!!!!!!!!")
    } catch (error) {
        console.log("FAILED CREATING A DYNAMO TABLE **********************", error)
        // return Promise.reject(error)
    }

    try {
        const sqsData = await sqs.send(new CreateQueueCommand(sqsparams));
       
        const arnparts = sqsData.QueueUrl.split('//')[1].split('/')
        event_arn = `arn:aws:sqs:${region}:${arnparts[1]}:${arnparts[2]}`
        Init.eventArn = event_arn
        Init.sqsURL = sqsData.QueueUrl

        console.log("CREATING SQS WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
    } catch (error) {
        console.log("FAILED CREATING SQS QUEUE **********************", error)
        // return Promise.reject(error)
    }

    try {
        const sourceMapParams = {
            FunctionName: lambdaFuncName,
            BatchSize: 10,
            EventSourceArn: event_arn,
            Enabled: true,
        }
        await lambda.send(new CreateEventSourceMappingCommand(sourceMapParams))
        console.log("LAMBDA EVEN SOURCE MAPPING WORKS!!!!!!!!!!!!!!!!!!!!!!!!!!")
    } catch (error) {
        console.log("FAILED TO SET UP LAMBDA EVENT MAPPING**********************", error)
        // return Promise.reject(error)
    }
}

export default setLambda
// SQS_QUEUE_URL; e.g., 'https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME'
// "arn:aws:sqs:us-east-2:123456789012:my-queue"