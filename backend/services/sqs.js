// Import required AWS SDK clients and commands for Node.js
import { SendMessageCommand } from  "@aws-sdk/client-sqs";
import Init from "./init.js";

export const sendData = async ({storeName, storeImage, storeRating, storeComment}) => {
  // Set the parameters
  const params = {
    DelaySeconds: 5,
    MessageAttributes: {
      StoreName: {
        DataType: "String",
        StringValue: storeName,
      },
      StoreImage: {
        DataType: "String",
        StringValue: storeImage || 'no image',
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
    const data = await Init.sqs.send(new SendMessageCommand(params));
    console.log("Success, message sent. MessageID:", data.MessageId);
    return Promise.resolve(storeName); // For unit tests.
  } catch (err) {
    console.log("Error", err);
    return Promise.reject('Failed to send data')
  }
}