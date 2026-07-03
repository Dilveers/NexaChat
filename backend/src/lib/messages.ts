import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./dynamodb.js";
import { requireEnv } from "./env.js";
import { ChatMessagePayload, StoredMessage } from "../types.js";

const messagesTable = requireEnv("MESSAGES_TABLE");

export async function saveMessage(message: StoredMessage) {
  await docClient.send(
    new PutCommand({
      TableName: messagesTable,
      Item: message
    })
  );
}

export async function getRecentMessages(roomId: string, limit: number) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: messagesTable,
      KeyConditionExpression: "roomId = :roomId",
      ExpressionAttributeValues: {
        ":roomId": roomId
      },
      ScanIndexForward: false,
      Limit: limit
    })
  );

  return ((result.Items ?? []) as StoredMessage[]).reverse();
}

export function toClientMessage(message: StoredMessage): ChatMessagePayload {
  return {
    id: message.messageId,
    roomId: message.roomId,
    text: message.text,
    userId: message.userId,
    username: message.username,
    createdAt: message.createdAt,
    source: "remote"
  };
}

