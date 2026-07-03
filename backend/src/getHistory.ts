import { APIGatewayProxyEvent } from "aws-lambda";
import { getConnection } from "./lib/connections.js";
import { getRecentMessages, toClientMessage } from "./lib/messages.js";
import { badRequest, ok, serverError } from "./lib/response.js";
import { postToConnection } from "./lib/websocket.js";
import { GetHistoryRequest } from "./types.js";

function parseBody(body: string | null): GetHistoryRequest {
  if (!body) {
    return {};
  }

  return JSON.parse(body) as GetHistoryRequest;
}

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const connectionId = event.requestContext.connectionId;

    if (!connectionId) {
      return badRequest("Missing connection id.");
    }

    const connection = await getConnection(connectionId);

    if (!connection) {
      return badRequest("Connection is not registered.");
    }

    const body = parseBody(event.body);
    const roomId = body.roomId || connection.roomId;
    const limit = Math.max(1, Math.min(Number(body.limit ?? 30), 50));
    const messages = await getRecentMessages(roomId, limit);

    await postToConnection(connectionId, {
      type: "history",
      messages: messages.map(toClientMessage)
    });

    return ok({ message: "History sent" });
  } catch (error) {
    return serverError(error);
  }
}

