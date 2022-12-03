import { DeleteFunctionCommand, DeleteEventSourceMappingCommand } from "@aws-sdk/client-lambda";
import { DeleteBucketCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DeleteRoleCommand, DetachRolePolicyCommand } from "@aws-sdk/client-iam";
import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { DeleteQueueCommand } from "@aws-sdk/client-sqs";

import Init from "./init.js";

export const deleteS3Bucket = async () => {
    // creating a new s3 bucket
    try {
        await Init.s3.send(
            new DeleteObjectCommand({
                Bucket: Init.bucketName, 
                Key: Init.s3ObjectKey
            })
        )

        await Init.s3.send(
            new DeleteBucketCommand({ Bucket: Init.bucketName })
        )

        console.log("!!!!!!!!!!!! DELETE BUCKET WORKS !!!!!!!!!!!!!!!")
        return { 
            msg: 's3 bucket deleted',
            serviceName: Init.bucketName, 
            status: 200 
        }
    } catch (error) {
        console.log("********* FAILED TO DELETE BUCKET **********\n", error)
        return { 
            msg: 's3 bucket failed to delete',
            serviceName: Init.bucketName, 
            status: 500 
        }
    }
}

export const deleteDynamoTable = async () => {
    // creating a dynamo table
    try {
        await Init.dynamo.send(new DeleteTableCommand({ TableName: Init.dynamoTableName }));
        console.log("!!!!!!!!!!!!! DELETE DYNAMO TABLE WORKS !!!!!!!!!!!!!")
        return { 
            msg: 'dynamo table deleted',
            serviceName: Init.dynamoTableName,  
            status: 200 
        }
    } catch (error) {
        console.log("************ FAILED TO DELETE DYNAMO TABLE **********\n", error)
        return { 
            msg: 'dynamo table failed to delete', 
            serviceName: Init.dynamoTableName, 
            status: 500 
        }
    }
}

export const deleteEventMapping = async (uuid) => {
    try {
        await Init.lambda.send(new DeleteEventSourceMappingCommand({ UUID: uuid }))
        console.log("!!!!!!!!!!!!!! DELETE LAMBDA EVENT SOURCE MAPPING WORKS !!!!!!!!!!!!")
        return { 
            msg: 'lambda event source deleted',
            serviceName: uuid,  
            status: 200 
        }
    } catch (error) {
        console.log("*********** FAILED TO DELETE LAMBDA EVENT MAPPING ********\n", error)
        return { 
            msg: 'lambda event source failed to delete', 
            serviceName: uuid, 
            status: 500 
        }
    }
}

export const deleteLambdaFunction = async () => {
    // uploading lambda function
    try {
        await Init.lambda.send(new DeleteFunctionCommand({ FunctionName: Init.lambdaFuncName }));
        console.log("!!!!!!!!!!!! DELETING LAMBDA FUNCTION WORKS !!!!!!!!!!!!!!")
        return { 
            msg: 'lambda function deleted',
            serviceName: Init.lambdaFuncName,  
            status: 200 
        }
    } catch (error) {
        console.log("************ FAILED TO DELETE LAMBDA FUNCTION **********\n", error)
        return { 
            msg: 'lambda function failed to delete', 
            serviceName: Init.lambdaFuncName, 
            status: 500 
        }
    }
}

export const deleteSQSQueue = async () => {
    try {
        await Init.sqs.send(new DeleteQueueCommand({ QueueUrl: Init.sqsURL }));
        console.log("!!!!!!!!!!!!!! DELETING SQS WORKS !!!!!!!!!!")
        return { 
            msg: 'sqs queue deleted',
            serviceName: Init.sqsName,  
            status: 200 
        }
    } catch (error) {
        console.log("************* FAILED TO DELETE SQS QUEUE *********\n", error)
        return { 
            msg: 'sqs queue failed to delete', 
            serviceName: Init.sqsName, 
            status: 500 
        }
    }
}

export const deleteRole = async () => {
    try {
        

        const rolePoliciePermissions = [
            'arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess',
            'arn:aws:iam::aws:policy/AmazonSQSFullAccess'
        ]
    
        for (let policy of rolePoliciePermissions) {
            await Init.iam.send(new DetachRolePolicyCommand({
                PolicyArn: policy,
                RoleName: Init.roleName
            }))
        }

        await Init.iam.send(new DeleteRoleCommand({ RoleName: Init.roleName }))

        console.log('!!!!!!!!!! ROLE DELETED !!!!!!!!!!')
        return { 
            msg: 'role deleted',
            serviceName: Init.roleName,  
            status: 200 
        }
    } catch (error) {
        console.log('********** DELETING ROLE FAILED *******', error)
        return { 
            msg: 'failed to delete role', 
            serviceName: Init.roleName, 
            status: 500 
        }
    }
}
