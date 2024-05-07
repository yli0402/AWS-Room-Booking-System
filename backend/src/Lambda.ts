import {APIGatewayEvent, APIGatewayProxyHandler, Context} from "aws-lambda";
import awsServerlessExpress from "aws-serverless-express";
import app from "./App";

const server = awsServerlessExpress.createServer(app);

export const handler: APIGatewayProxyHandler = (event: APIGatewayEvent, context: Context) => {
    return awsServerlessExpress.proxy(server, event, context, "PROMISE").promise;
};
