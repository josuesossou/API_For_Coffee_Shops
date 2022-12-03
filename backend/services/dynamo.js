import { GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import Init from "./init.js";
export const sendData = async () => {
    const params = {
        TableName: Init.dynamoTableName,
        Item: {
          CUSTOMER_ID: { N: "001" },
          CUSTOMER_NAME: { S: "Richard Roe" },
        },
    };
    try {
        const data = await Init.dynamo.send(new PutItemCommand(params));
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
};

export const getShopsData = async () => {
    const params = {
        TableName: Init.dynamoTableName, //TABLE_NAME
        // Key: {
        //   KEY_NAME: { N: "KEY_VALUE" },
        // },
        // ProjectionExpression: "ATTRIBUTE_NAME",
    };

    try {
        const data = await Init.dynamo.send(new ScanCommand(params));
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
        return 'error'
    }
};