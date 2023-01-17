import { isDynamoExist, isEventMappingExist, isIAMRoleExist, isLambdaExist, isS3bucketExist, isSQSExist } from "./checkAWSServicesExist.js";
import { createDynamoTable, createEventMapping, createLambdaFunction, createRole, createS3Bucket, createSQSQueue } from "./createAWSServices.js";
import { deleteDynamoTable, deleteEventMapping, deleteLambdaFunction, deleteRole, deleteS3Bucket, deleteSQSQueue } from "./removeAWSServices.js";
import Init from "./init.js";

export async function setup () {
    const results = []

    const roleExist = await isIAMRoleExist()
    if (!roleExist) {
        const s3Data = await createRole()
        results.push(s3Data)
    } else {
        results.push({ msg: 'role created', status: 200 })
    }

    const s3Exist = await isS3bucketExist()
    if (!s3Exist) {
        const s3Data = await createS3Bucket()
        results.push(s3Data)
    } else {
        results.push({ msg: 's3 bucket created', status: 200 })
    }

    const sqsExist = await isSQSExist()
    if (!sqsExist) {
        const sqsData = await createSQSQueue()
        results.push(sqsData)
    } else {
        results.push({ msg: 'sqs queue created', status: 200 })
    }

    const lambdaExist = await isLambdaExist()
    if (!lambdaExist) {
        const lambdaData = await createLambdaFunction()
        results.push(lambdaData)
    } else {
        results.push({ msg: 'lambda function created', status: 200 })
    }

    const dynamoExist = await isDynamoExist()
    if (!dynamoExist) {
        const dynamoData = await createDynamoTable()
        results.push(dynamoData)
    } else {
        results.push({ msg: 'dynamo table created', status: 200 })
    }

    const eventMappingExist = await isEventMappingExist()
    if (!eventMappingExist) {
        const eventSourceData = await createEventMapping()
        results.push(eventSourceData)
    } else {
        results.push({ msg: 'lambda event source created', status: 200 })
    }

    Init.servicesCleaned = false
    return results
}

export async function clean () {
    const results = []

    const eventMappingExist = await isEventMappingExist()
    if (eventMappingExist) {
        const eventSourceData = await deleteEventMapping(eventMappingExist)
        results.push(eventSourceData)
        console.log('EVENT DELET UUD', eventMappingExist)
    } else {
        results.push({ msg: 'lambda event source created', status: 200 })
    }

    const dynamoExist = await isDynamoExist()
    if (dynamoExist) {
        const dynamoData = await deleteDynamoTable()
        results.push(dynamoData)
    } else {
        results.push({ msg: 'dynamo table created', status: 200 })
    }

    const s3Exist = await isS3bucketExist()
    if (s3Exist) {
        const s3Data = await deleteS3Bucket()
        results.push(s3Data)
    } else {
        results.push({ msg: 's3 bucket created', status: 200 })
    }

    const lambdaExist = await isLambdaExist()
    if (lambdaExist) {
        const lambdaData = await deleteLambdaFunction()
        results.push(lambdaData)
    } else {
        results.push({ msg: 'lambda function created', status: 200 })
    }

    const sqsExist = await isSQSExist()
    if (sqsExist) {
        const sqsData = await deleteSQSQueue()
        results.push(sqsData)
    } else {
        results.push({ msg: 'sqs queue created', status: 200 })
    }

    const roleExist = await isIAMRoleExist()
    if (roleExist) {
        const s3Data = await deleteRole()
        results.push(s3Data)
    } else {
        results.push({ msg: 'role created', status: 200 })
    }

    Init.servicesCleaned = true
    return results
}
