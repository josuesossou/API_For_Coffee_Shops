import { GetItemCommand, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import Init from "./init.js";

export const dynamoParams = {
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
};

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

export const getData = async () => {
    const params = {
        TableName: Init.dynamoTableName, //TABLE_NAME
        Key: {
          KEY_NAME: { N: "KEY_VALUE" },
        },
        ProjectionExpression: "ATTRIBUTE_NAME",
    };
    try {
        const data = await Init.dynamo.send(new GetItemCommand(params));
        console.log(data);
        return data;
    } catch (err) {
        console.error(err);
    }
};