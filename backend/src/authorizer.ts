import { CognitoJwtVerifier } from "aws-jwt-verify";
import { requireEnv } from "./lib/env.js";

const verifier = CognitoJwtVerifier.create({
  userPoolId: requireEnv("USER_POOL_ID"),
  tokenUse: "id",
  clientId: requireEnv("USER_POOL_CLIENT_ID")
});

function policy(effect: "Allow" | "Deny", resource: string, principalId = "unknown", context = {}) {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource
        }
      ]
    },
    context
  };
}

function getToken(event: any) {
  const queryToken = event.queryStringParameters?.token;
  const header = event.headers?.authorization ?? event.headers?.Authorization;
  const bearerToken =
    typeof header === "string" && header.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;

  return queryToken ?? bearerToken;
}

export async function handler(event: any) {
  const token = getToken(event);

  if (!token) {
    return policy("Deny", event.methodArn);
  }

  try {
    const claims = await verifier.verify(token);
    const username =
      String(claims["cognito:username"] ?? claims.email ?? claims.sub ?? "User");

    return policy("Allow", event.methodArn, String(claims.sub), {
      userId: String(claims.sub),
      username
    });
  } catch (error) {
    console.warn("Authorization failed", error);
    return policy("Deny", event.methodArn);
  }
}

