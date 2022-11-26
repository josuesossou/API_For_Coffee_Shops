// Import required AWS SDK clients and commands for Node.js
import { SendMessageCommand } from  "@aws-sdk/client-sqs";
import Init from "./init.js";
// import { sqsClient } from  "./libs/sqsClient.js";

export const sendData = async ({storeName, storeImage, storeRating, storeComment}) => {
  // Set the parameters
  const params = {
    DelaySeconds: 10,
    MessageAttributes: {
      StoreID: {
        DataType: "String",
        StringValue: storeName,
      },
      StoreName: {
        DataType: "String",
        StringValue: storeName,
      },
      StoreImage: {
        DataType: "String",
        StringValue: storeImage,
      },
      StoreRating: {
        DataType: "Number",
        StringValue: storeRating,
      },
      StoreComment: {
        DataType: "String",
        StringValue: storeComment,
      },
    },

    MessageBody: JSON.stringify({storeName, storeImage, storeRating, storeComment}),
    // MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
    // MessageGroupId: "Group1",  // Required for FIFO queues
    QueueUrl: Init.sqsURL //SQS_QUEUE_URL; e.g., 'https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME'
  };

  try {
    console.log(Init.sqsURL, "URLLL*********")
    const data = await Init.sqs.send(new SendMessageCommand(params));
    console.log("Success, message sent. MessageID:", data.MessageId);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

// var params = {
//   QueueName: 'SQS_QUEUE_NAME'
// };

// sqs.getQueueUrl(params, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data.QueueUrl);
//   }
// });