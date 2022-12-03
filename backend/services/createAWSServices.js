import { CreateFunctionCommand, CreateEventSourceMappingCommand } from "@aws-sdk/client-lambda";
import { CreateRoleCommand, AttachRolePolicyCommand } from "@aws-sdk/client-iam";
import { CreateBucketCommand, UploadPartCommand } from "@aws-sdk/client-s3";
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { CreateQueueCommand } from "@aws-sdk/client-sqs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { delay } from "./helpers.js";

import Init from "./init.js";
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createS3Bucket = async () => {
    // creating a new s3 bucket
    try {
        await Init.s3.send(
            new CreateBucketCommand({ Bucket: Init.bucketName })
        )

        const fileStream = fs.createReadStream(__dirname + "/coffeelambdafunc.zip");

        await Init.s3.send(
            new UploadPartCommand({
                Bucket: Init.bucketName,
                Key: Init.s3ObjectKey,
                Body: fileStream,
            })
        )

        console.log("!!!!!!!!!!!! CREATE AND UPLOAD TO BUCKET WORKS !!!!!!!!!!!!!!!")
        return { 
            msg: 's3 bucket created', 
            serviceName: Init.bucketName,  
            status: 200 
        }
    } catch (error) {
        console.log("********* FAILED CREATING AND UPLOADING TO BUCKET **********\n", error)
        return { 
            msg: 's3 bucket failed', 
            serviceName: Init.bucketName,  
            status: 500 
        }
    }
}

export const createLambdaFunction = async () => {
    // uploading lambda function
    try {
        const lambdFuncParams = {
            Code: {
                S3Bucket: Init.bucketName, // BUCKET_NAME
                S3Key: Init.s3ObjectKey, // ZIP_FILE_NAME
            },
            FunctionName: Init.lambdaFuncName,
            Handler: "index.handler",
            Role: Init.roleArn, // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
            Runtime: "nodejs16.x",
            Description: "gets sqs records and put them in dynamodb",
        }

        await Init.lambda.send(new CreateFunctionCommand(lambdFuncParams));
        console.log("!!!!!!!!!!!! UPLOADING LAMBDA FUNCTION WORKS !!!!!!!!!!!!!!")
        return { 
            msg: 'lambda function created',
            serviceName: Init.lambdaFuncName,   
            status: 200 
        }
    } catch (error) {
        console.log("************ FAILED CREATING LAMBDA FUNCTION **********\n", error)
        return { 
            msg: 'lambda function failed', 
            serviceName: Init.lambdaFuncName,  
            status: 500 
        }
    }
}

export const createSQSQueue = async () => {
    const sqsparams = {
        QueueName: Init.sqsName, //SQS_QUEUE_URL
        Attributes: {
          DelaySeconds: "60", // Number of seconds delay.
          MessageRetentionPeriod: "86400", // Number of seconds delay.
        },
    };

    try {
        const sqsData = await Init.sqs.send(new CreateQueueCommand(sqsparams));
        const arnparts = sqsData.QueueUrl.split('//')[1].split('/')

        Init.sqsURL = sqsData.QueueUrl
        Init.eventArn = `arn:aws:sqs:${region}:${arnparts[1]}:${arnparts[2]}`
   
        console.log("!!!!!!!!!!!!!! CREATING SQS WORKS !!!!!!!!!!")
        return { 
            msg: 'sqs queue created', 
            serviceName: Init.sqsName,  
            status: 200 
        }
    } catch (error) {
        console.log("************* FAILED CREATING SQS QUEUE *********\n", error)
        return { 
            msg: 'sqs queue failed', 
            serviceName: Init.sqsName,  
            status: 500 
        }
    }
}

export const createEventMapping = async () => {
    try {
        const sourceMapParams = {
            FunctionName: Init.lambdaFuncName,
            BatchSize: 10,
            EventSourceArn: Init.eventArn,
            Enabled: true,
        }
        const data = await Init.lambda.send(new CreateEventSourceMappingCommand(sourceMapParams))
        console.log("!!!!!!!!!!!!!! LAMBDA EVENT SOURCE MAPPING WORKS !!!!!!!!!!!!", data)
        return { 
            msg: 'lambda event source created', 
            serviceName: Init.lambdaFuncName,  
            status: 200 
        }
    } catch (error) {
        console.log("*********** FAILED TO SET UP LAMBDA EVENT MAPPING ********\n", error)
        return { msg: 'lambda event source failed', status: 500 } // can't delete this once created, unless you change ARN
    }
}

export const createDynamoTable = async () => {
    const dynamoParams = {
        AttributeDefinitions: [
            {
                AttributeName: "StoreID", //ATTRIBUTE_NAME_1
                AttributeType: "S", //ATTRIBUTE_TYPE
            },
            {
                AttributeName: "StoreData", //ATTRIBUTE_NAME_1
                AttributeType: "S", //ATTRIBUTE_TYPE
            }
        ],
        KeySchema: [
            {
                AttributeName: "StoreID", //ATTRIBUTE_NAME_1
                KeyType: "HASH",
            },
            {
                AttributeName: "StoreData", //ATTRIBUTE_NAME_2
                KeyType: "RANGE",
            },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
        },
        TableName: Init.dynamoTableName, //TABLE_NAME
        StreamSpecification: {
            StreamEnabled: false,
        },
    }
    
    // creating a dynamo table
    try {
        await Init.dynamo.send(new CreateTableCommand(dynamoParams));
        console.log("!!!!!!!!!!!!! CREATING DYNAMO TABLE WORKS !!!!!!!!!!!!!")
        return { 
            msg: 'dynamo table created',
            serviceName: Init.dynamoTableName,   
            status: 200 
        }
    } catch (error) {
        console.log("************ FAILED CREATING A DYNAMO TABLE **********\n", error)
        return { 
            msg: 'dynamo table failed', 
            serviceName: Init.dynamoTableName,  
            status: 500 
        }
    }
}

export const createRole = async () => {
    const rolePolicy = {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Principal": {
                "Service": [
                    "lambda.amazonaws.com",
                    "dynamodb.amazonaws.com"
                ]
            },
            "Action": "sts:AssumeRole"
          }
        ]
    }
    const createRoleParam = {
        AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
        Path: "/",
        RoleName: Init.roleName
    }
    const rolePoliciePermissions = [
        'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
        'arn:aws:iam::aws:policy/AmazonSQSFullAccess'
    ]

    try {
        const data = await Init.iam.send(new CreateRoleCommand(createRoleParam))

        for (let policy of rolePoliciePermissions) {
            const param = {
                PolicyArn: policy,
                RoleName: Init.roleName
            }

            await Init.iam.send(new AttachRolePolicyCommand(param))
        }
        Init.roleArn = data.Role.Arn

        await delay(6000)
        console.log('!!!!!!!!!! ROLE CREATED !!!!!!!!!!', data.Role.Arn)
        return { 
            msg: 'role created', 
            serviceName: Init.roleName,  
            status: 200 
        }
    } catch (error) {
        console.log('********** CREATING ROLE FAILED *******', error)
        return { 
            msg: 'role failed to create', 
            serviceName: Init.roleName,  
            status: 500 
        }
    }
}
