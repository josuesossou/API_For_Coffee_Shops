import { LambdaClient} from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient  } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { IAMClient } from "@aws-sdk/client-iam";
import { setS3GlobalName } from "./helpers.js";

export default class Init {
    constructor(iamCredentials, region) {
        if (Init._instance) {
            return Init._instance
        }

        Init.region = region
        Init.credentials = iamCredentials

        this.initLambda(iamCredentials, region)
        this.initSqs(iamCredentials, region)
        this.initS3Client(iamCredentials, region)
        this.initDynamo(iamCredentials, region)
        this.initRole(iamCredentials, region)
    }

    static inited = false
    static servicesCleaned = false
    // dynamically set global variables
    static lambda
    static s3
    static sqs
    static iam
    static dynamo
    static region
    static roleArn
    static eventArn
    static sqsURL
    static credentials
    static bucketName

    // Manually set global variables
    static sqsName = "coffee-shop-app-sqs-test" 
    static lambdaFuncName = "coffee-shop-app-func-test" 
    static dynamoTableName = 'Coffee-shop-app-table-test'
    static roleName = 'CoffeeShopAppRole'
    static s3ObjectKey = "coffeelambdafunc.zip"


    setIsInited () {
        Init.inited = true
    }

    setEventARN (arn) {
        Init.eventArn = arn
    }

    setSqsURL (url) {
        if (url) {
            const arnparts = url.split('//')[1].split('/')
            Init.eventArn = `arn:aws:sqs:${Init.region}:${arnparts[1]}:${arnparts[2]}`
        }
       
        Init.sqsURL = url
    }

    initLambda (credentials, region) {
        Init.lambda = new LambdaClient({
            region: region,
            credentials: credentials
        })
    } 

    initS3Client (credentials, region) {
        Init.s3 = new S3Client({
            region: region,
            credentials: credentials
        })
    }

    initSqs (credentials, region) {
        Init.sqs = new SQSClient({
            region: region,
            credentials: credentials
        })
    }

    initDynamo (credentials, region) {
        Init.dynamo = new DynamoDBClient({
            region: region,
            credentials: credentials
        })
    }

    initRole (credentials, region) {
        Init.iam = new IAMClient({
            region,
            credentials
        })
    }
}


export const initialise = (iamCredentials, region) => { 
    new Init(iamCredentials, region) 

    setS3GlobalName()
    Init.inited = true

    // const gotRole = await getIAMRole()
    // const url = await isSQSExist()

    // instance.setSqsURL(url)

    // if (!gotRole) {
    //     const roleArn = await createRole()
    //     instance.setIsInited(roleArn)

    // } else {
    //     instance.setIsInited(gotRole)
    //     res.json({ 
    //         initStatus: Init.inited,
    //         msg: 'Successfully Initialized' 
    //     })
    // }
}

// const getIAMRole = async () => {
//     const param = {
//         RoleName: Init.roleName /* required */
//     }

//     try {
//         const data = await Init.iam.send(new GetRoleCommand(param));
        
//         console.log('!!!!!!!!! GOT ROLE ARN !!!!!!!!!!', data.Role.Arn)
//         return data.Role.Arn
//     } catch (error) {
//         console.log('!!!!!!!!! FAILED TO GET ROLE ARN !!!!!!!!!!', error)
//         return false
//     }
// }

// const createRole = async () => {
//     const rolePolicy = {
//         "Version": "2012-10-17",
//         "Statement": [
//           {
//             "Effect": "Allow",
//             "Principal": {
//                 "Service": [
//                     "lambda.amazonaws.com",
//                     "dynamodb.amazonaws.com"
//                 ]
//             },
//             "Action": "sts:AssumeRole"
//           }
//         ]
//     }
//     const createRoleParam = {
//         AssumeRolePolicyDocument: JSON.stringify(rolePolicy),
//         Path: "/",
//         RoleName: Init.roleName
//     }
//     const rolePoliciePermissions = [
//         'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
//         'arn:aws:iam::aws:policy/AmazonSQSFullAccess'
//     ]

//     try {
//         const data = await Init.iam.send(new CreateRoleCommand(createRoleParam))

//         for (let policy of rolePoliciePermissions) {
//             const param = {
//                 PolicyArn: policy,
//                 RoleName: Init.roleName
//             }

//             await Init.iam.send(new AttachRolePolicyCommand(param))
//         }

//         await delay(10000)
//         console.log('!!!!!!!!!! ROLE CREATED !!!!!!!!!!', data.Role.Arn)
//         return data.Role.Arn
//     } catch (error) {
//         console.log('********** CREATING ROLE FAILED *******', error)
//         return ''
//     }
// }
