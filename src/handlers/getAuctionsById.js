import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';
import commonMiddleware from "../lib/commonMiddleware";
import createError from 'http-errors'

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function auctionById(id) {
  let auction;
  try {
    const result = await dynamodb.get({
      TableName: process.env.AUCTIONS_TABLE,
      Key:{id}
    }).promise();
    auction = result.Item
  } catch (error) {
    console.log(error)
    throw new createError.InternalServerError(error)
  }

  if(!auction){
    throw new createError.NotFound('No record found');
  }
  return auction
}

async function getAuctionsById(event, context) {
  let auction;
  const { id } = event.pathParameters
  auction = await auctionById(id)
  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuctionsById)