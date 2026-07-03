import { DeleteCommand, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamodb.js";
import { requireEnv } from "./env.js";
import { ConnectionRecord } from "../types.js";

const connectionsTable = requireEnv("CONNECTIONS_TABLE");

export async function saveConnection(connection: ConnectionRecord) {
  await docClient.send(
    new PutCommand({
      TableName: connectionsTable,
      Item: connection
    })
  );
}

export async function getConnection(connectionId: string) {
  const result = await docClient.send(
    new GetCommand({
      TableName: connectionsTable,
      Key: { connectionId }
    })
  );

  return result.Item as ConnectionRecord | undefined;
}

export async function deleteConnection(connectionId: string) {
  await docClient.send(
    new DeleteCommand({
      TableName: connectionsTable,
      Key: { connectionId }
    })
  );
}

export async function listConnectionsByRoom(roomId: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: connectionsTable,
      IndexName: "roomId-index",
      KeyConditionExpression: "roomId = :roomId",
      ExpressionAttributeValues: {
        ":roomId": roomId
      }
    })
  );

  return (result.Items ?? []) as ConnectionRecord[];
}

