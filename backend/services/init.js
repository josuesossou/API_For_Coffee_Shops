import { LambdaClient} from "@aws-sdk/client-lambda";
import { S3Client, S3 } from "@aws-sdk/client-s3";
import { SQSClient  } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { checkSQS } from "./sqs";

export default class Init {
    constructor(iamCredentials, region, role_arn) {
        if (Init._instance) {
            return Init._instance
        }

        this.initLambda(iamCredentials, region)
        this.initS3(iamCredentials, region)
        this.initSqs(iamCredentials, region)
        this.initS3Client(iamCredentials, region)
        this.initDynamo(iamCredentials, region)

        Init.inited = true
        Init.region = region
        Init.credentials = iamCredentials
        Init.role_arn = role_arn
    }

    static inited = false
    static lambda
    static s3
    static s3Client
    static sqs
    static dynamo
    static region
    static role_arn
    static credentials

    static bucketName = "coffee-shop-app-bucket" // not changing
    static sqsName = "coffee-shop-app-sqs" // not changing
    static lambdaFuncName = "coffee-shop-app-func" // not changing
    static dynamoTableName = 'Coffee-shop-app-table' // not changing

    static eventArn = "" //dynamic set in set up
    static sqsURL = ""

    setEventARN (arn) {
        Init.eventArn = arn
    }

    setSqsURL (url) {
        Init.sqsURL = url
    }

    initLambda (credentials, region) {
        Init.lambda = new LambdaClient({
            region: region,
            credentials: credentials
        })
    } 

    initS3Client (credentials, region) {
        Init.s3Client = new S3Client({
            region: region,
            credentials: credentials
        })
    }

    initS3 (credentials, region) {
        Init.s3 = new S3({
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
}


export const initialise = (iamCredentials, region, role_arn) => { 
    const instance = new Init(iamCredentials, region, role_arn) 
    checkSQS().then(url => {
        if (url) {
            instance.setSqsURL(url)
        }
    })
}
