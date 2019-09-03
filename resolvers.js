'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();


module.exports.list = () => {
  const params = {
     TableName: process.env.CANDIDATE_TABLE,
   };

  return dynamoDb.scan(params).promise().then(data => {
    return data.Items.map(item => ({
        ...item,
        submittedAt: new Date(item.submittedAt),
        updatedAt: new Date(item.updatedAt)
      }));
  });
}

module.exports.view = (parent, args, context, info) => {
  const params = {
     TableName: process.env.CANDIDATE_TABLE,
     Key: { id: args.id },
   };

   return dynamoDb.get(params).promise().then(result => {

     if(!result.Item) {
       return null;
     }

     return {
       ...result.Item,
       submittedAt: new Date(result.Item.submittedAt),
       updatedAt: new Date(result.Item.updatedAt),
     };
   });
}

module.exports.register = (parent, args, context, info) => {
  const candidate = candidateInfo(args.fullname, args.email, args.experience);
  const params = {
    TableName: process.env.CANDIDATE_TABLE,
    Item: candidate,
  };
  return dynamoDb.put(params).promise()
    .then(res => ({
      ...candidate,
      submittedAt: new Date(candidate.submittedAt),
      updatedAt: new Date(candidate.updatedAt),
    }));
}

const candidateInfo = (fullname, email, experience) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    fullname: fullname,
    email: email,
    experience: experience,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};
