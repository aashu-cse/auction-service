import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from "../lib/commonMiddleware";
import createError from 'http-errors'
import { auctionById } from "./getAuctionsById";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters
  const { amount } = event.body;
  const auction = await auctionById(id)
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(`Your bid must be higher then ${auction.highestBid.amount}`)
  }
  const params = {
    TableName: process.env.AUCTIONS_TABLE,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount
    },
    ReturnValues: 'ALL_NEW'
  };

  let updatedAuction;
  try {
    const result = await dynamodb.update(params).promise()
    updatedAuction = result.Attributes;
  } catch (error) {
    console.log(error)
    throw new createError.InternalServerError(error)
  }
  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid)
