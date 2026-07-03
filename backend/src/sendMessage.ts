import { APIGatewayProxyEvent } from "aws-lambda";
import { getConnection, listConnectionsByRoom } from "./lib/connections.js";
import { saveMessage, toClientMessage } from "./lib/messages.js";
import { badRequest, ok, serverError } from "./lib/response.js";
import { postToConnection } from "./lib/websocket.js";
import { SendMessageRequest, StoredMessage } from "./types.js";

function parseBody(body: string | null): SendMessageRequest {
  if (!body) {
    return {};
  }

  return JSON.parse(body) as SendMessageRequest;
}

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const connectionId = event.requestContext.connectionId;

    if (!connectionId) {
      return badRequest("Missing connection id.");
    }

    const sender = await getConnection(connectionId);

    if (!sender) {
      return badRequest("Connection is not registered.");
    }

    const body = parseBody(event.body);
    const text = body.text?.trim();

    if (!text) {
      return badRequest("Message text is required.");
    }

    const roomId = body.roomId || sender.roomId;
    const now = new Date().toISOString();
    const message: StoredMessage = {
      roomId,
      messageId: `${now}#${crypto.randomUUID()}`,
      createdAt: now,
      text: text.slice(0, 1000),
      userId: sender.userId,
      username: sender.username
    };

    await saveMessage(message);

    const connections = await listConnectionsByRoom(roomId);
    const payload = {
      type: "message",
      message: toClientMessage(message)
    };

    await Promise.all(
      connections.map((connection) => postToConnection(connection.connectionId, payload))
    );

    return ok({ message: "Sent" });
  } catch (error) {
    return serverError(error);
  }
}

