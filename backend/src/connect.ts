import { APIGatewayProxyEvent } from "aws-lambda";
import { saveConnection } from "./lib/connections.js";
import { ok, serverError } from "./lib/response.js";

const sevenDaysInSeconds = 7 * 24 * 60 * 60;

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const connectionId = event.requestContext.connectionId;

    if (!connectionId) {
      return serverError(new Error("Missing connectionId"));
    }

    const authorizer = event.requestContext.authorizer as
      | { userId?: string; username?: string }
      | undefined;
    const roomId = event.queryStringParameters?.roomId || "general";
    const username = event.queryStringParameters?.name || authorizer?.username || "User";
    const userId = authorizer?.userId || connectionId;
    const connectedAt = new Date().toISOString();

    await saveConnection({
      connectionId,
      roomId,
      userId,
      username,
      connectedAt,
      ttl: Math.floor(Date.now() / 1000) + sevenDaysInSeconds
    });

    return ok({ message: "Connected" });
  } catch (error) {
    return serverError(error);
  }
}

