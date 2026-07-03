import {
  ApiGatewayManagementApiClient,
  GoneException,
  PostToConnectionCommand
} from "@aws-sdk/client-apigatewaymanagementapi";
import { deleteConnection } from "./connections.js";
import { requireEnv } from "./env.js";

const endpoint = requireEnv("WS_ENDPOINT");
const api = new ApiGatewayManagementApiClient({ endpoint });

export async function postToConnection(connectionId: string, payload: unknown) {
  try {
    await api.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify(payload))
      })
    );
  } catch (error) {
    if (error instanceof GoneException) {
      await deleteConnection(connectionId);
      return;
    }

    throw error;
  }
}

