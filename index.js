// import { SQSClient, AddPermissionCommand, SQS, SQSClientConfig,  GetQueueUrlCommand, CreateQueueCommand,  } from "@aws-sdk/client-sqs";
// import { LambdaClient, CreateEventSourceMappingCommand, AddLayerVersionPermissionCommand, Lambda, CreateEventSourceMappingCommand, ListEventSourceMappingsCommand, ListFunctionsCommand, CreateFunctionCommand } from "@aws-sdk/client-lambda";
// import { S3Client, S3, UploadPartCommand } from '@aws-sdk/client-s3'
// // const sqsClient = new SQSClient({ region: "REGION",  });
// // const config = SQSClientConfig
// // const sqs = new SQS({ 
// //     region: "REGION", 
// //     credentials: {
// //         accessKeyId: 'YOUR_ACCESS_KEY_HERE',
// //         secretAccessKey: 'YOUR_SECRET_KEY_HERE',
// //     //   expiration: 'OPTIONAL',
// //     //   sessionToken: 'OPTIONAL'
// //     }  
// // })

// // const param = {
    
// // }

// // StoreName: {
// //     DataType: "String",
// //     StringValue: storeName,
// //   },
// //   StoreImage: {
// //     DataType: "String",
// //     StringValue: storeImage,
// //   },
// //   StoreRating: {
// //     DataType: "Number",
// //     StringValue: storeRating,
// //   },
// //   StoreComment: {
// //     DataType: "String",
// //     StringValue: StoreComment,
// //   },
// const s3 = new S3({
//   region: region,
//   credentials: credentials
// })

// s3.uploadPart({})
// const handler = async function(event, context) {
//   event.Records.forEach(record => {
//     const { body } = record;
//     console.log(body);
//   });
//   return {};
// }

// // const command = new AddPermissionCommand(param);
// const lambda = new Lambda({ 
//     region: "us-east-1", 
//     credentials: {
//         accessKeyId: 'AKIAVJRL22YOTWQTENO3',
//         secretAccessKey: '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',
//     }
// })
// // Set the parameters.
// const params = {
//   Code: {
//     S3Bucket: "josueportfolioimages", // BUCKET_NAME
//     S3Key: "ZIP_FILE_NAME", // ZIP_FILE_NAME
//   },
//   FunctionName: "TestLambda",
//   Handler: "index.handler",
//   Role: "arn:aws:iam::364090414621:role/lambda-sqs-role", // IAM_ROLE_ARN; e.g., arn:aws:iam::650138640062:role/v3-lambda-tutorial-lambda-role
//   Runtime: "nodejs12.x",
//   Description: "testing lambda function",
// };
// // sqs.addPermission()
// // sqs.createQueue()
// const lambdacmd =  new CreateFunctionCommand(params)
// lambda.send(lambdacmd)
// .then((data) => console.log('Hello there', data)).catch(err => console.log(err))
// lambda.createEventSourceMapping({
//   Enabled: true,
//   FunctionName: "",
//   BatchSize: 10,
//   EventSourceArn: "arn:aws:sqs:us-east-2:123456789012:my-queue"
// })

// // create initialization for all the services needed.
// const sqs = new SQSClient({
//   region: "RE"
// })

// const sqsparams = {
//   QueueName: "SQS_QUEUE_NAME", //SQS_QUEUE_URL
//   Attributes: {
//     DelaySeconds: "60", // Number of seconds delay.
//     MessageRetentionPeriod: "86400", // Number of seconds delay.
//   },
// };
// sqs.send()
// const data = await sqs.send(new CreateQueueCommand(sqsparams));
// data.QueueUrl // I can use the queueUrl to build up the event source arn

// // s3.uploadPart({
// //     Bucket: bucketName,
// //     Key: objectKey,
// //     Body: fileStream,
// // })

// const region = 'us-east-1'

// `https://static01.nyt.com/images/2022/10/14/arts/13till-review/merlin_214440696_9ae2e84d-c950-4f84-b7ab-625d74a257d0-videoSixteenByNine3000.jpg`,
// 'Starbucks',
// 3,
// 'it is alright'