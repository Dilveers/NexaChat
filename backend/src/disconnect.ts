import { APIGatewayProxyEvent } from "aws-lambda";
import { deleteConnection } from "./lib/connections.js";
import { ok, serverError } from "./lib/response.js";

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const connectionId = event.requestContext.connectionId;

    if (connectionId) {
      await deleteConnection(connectionId);
    }

    return ok({ message: "Disconnected" });
  } catch (error) {
    return serverError(error);
  }
}

