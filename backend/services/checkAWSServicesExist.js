import { GetFunctionCommand, ListEventSourceMappingsCommand } from "@aws-sdk/client-lambda";
import { GetRoleCommand } from "@aws-sdk/client-iam";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { GetQueueUrlCommand } from  "@aws-sdk/client-sqs";

import Init from "./init.js";

export const isS3bucketExist = async () => {
    const params = {
        Bucket: Init.bucketName,
        Key: Init.s3ObjectKey
    }

    try {
        await Init.s3.send(new GetObjectCommand(params))
        console.log('!!!!!!!!! s3 already exist !!!!!!!!!!!!')
        return true
    } catch (error) {
        console.log('*********** CHECK S3 ERROR **********', error)
        return false
    }
}

export const isLambdaExist = async () => {
    const params = {
        FunctionName: Init.lambdaFuncName,
    }

    try {
        await Init.lambda.send(new GetFunctionCommand(params))
        console.log('!!!!!!!!! lambda already exist !!!!!!!!!!!!')
        return true
    } catch (error) {
        console.log('*********** CHECK LAMBDA ERROR **********', error)
        return false
    }
}

export const isDynamoExist = async () => {
    const params = {}

    try {
        const data = await Init.dynamo.send(new ListTablesCommand(params))
        if (data.TableNames.includes(Init.dynamoTableName)) {
            console.log('!!!!!!!!! dynamo already exist !!!!!!!!!!!!')
            return true
        }
        return false
    } catch (error) {
        console.log('*********** CHECK DYNAMO ERROR **********', error)
        return false
    }
}

export const isEventMappingExist = async () => {
    const params = {
        EventSourceArn: Init.eventArn,
        FunctionName: Init.lambdaFuncName
    }

    try {
        const data = await Init.lambda.send(new ListEventSourceMappingsCommand(params))
        const eventMappings = data.EventSourceMappings
        let uuid = false

        console.log('Event ARN', Init.eventArn)
        for (let event of eventMappings) {
            if (event.EventSourceArn === Init.eventArn) {
                uuid = event.UUID
                break
            }
        }
        console.log('!!!!!!!!! event mapping already exist !!!!!!!!!!!!', data.EventSourceMappings)
        return uuid
    } catch (error) {
        console.log('*********** CHECK EVENT MAPPING ERROR **********', error)
        return false
    }
}

export const isSQSExist = async () => {
    var params = {
      QueueName: Init.sqsName
    };
  
    try {
      const data = await Init.sqs.send(new GetQueueUrlCommand(params));
      const arnparts = data.QueueUrl.split('//')[1].split('/')
      Init.sqsURL = data.QueueUrl
      Init.eventArn = `arn:aws:sqs:${Init.region}:${arnparts[1]}:${arnparts[2]}`
      return true
    } catch (error) {
      console.log('****** ERROR CHECK SQS ******', error)
      return false
    }
  }

export const isIAMRoleExist = async () => {
    const param = {
        RoleName: Init.roleName /* required */
    }

    try {
        const data = await Init.iam.send(new GetRoleCommand(param));
        Init.roleArn = data.Role.Arn
        console.log('!!!!!!!!! GOT ROLE ARN !!!!!!!!!!', Init.roleArn)
        return true
    } catch (error) {
        console.log('!!!!!!!!! FAILED TO GET ROLE ARN !!!!!!!!!!', error)
        return false
    }
}