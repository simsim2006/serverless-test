'use strict';

const {graphql, GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLString, GraphQLInt, GraphQLID} = require("graphql");
const {GraphQLDateTime} = require('graphql-iso-date');
const {list, view, register} = require('./resolvers.js');

const candidateType = new GraphQLObjectType({
  name: "CandidateType",
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    fullname: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    experience: {type: new GraphQLNonNull(GraphQLInt)},
    submittedAt: { type: new GraphQLNonNull(GraphQLDateTime) },
    updatedAt: { type: new GraphQLNonNull(GraphQLDateTime) },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      candidates: {
        type: new GraphQLList(candidateType),
        resolve: (parent) => {
          return list();
        },
      },
      candidate: {
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        type: candidateType,
        resolve: (parent, args) => {
          console.log(view(args.id));
          return view(args.id);
        }
      }
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      registerCandidate: {
        args: {
          fullname: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          experience: { type: new GraphQLNonNull(GraphQLInt) },
        },
        type: candidateType,
        resolve: (parent, args) => {

          const fullname = args.fullname;
          const email = args.email;
          const experience = args.experience;

          if (typeof fullname !== 'string' || typeof email !== 'string' || typeof experience !== 'number') {
            console.error('Validation Failed');
            return new Error('Couldn\'t submit candidate because of validation errors.');
          }

          return register(fullname, email, experience);
        },
      }
    },
  })
});

module.exports.graphql = async (event, context, callback) => {
  const parsedRequestBody = (event && event.body) ? JSON.parse(event.body) : {};

  try {
    const graphQLResult = await graphql(schema,
    parsedRequestBody.query,
    null,
    null,
    parsedRequestBody.variables,
    parsedRequestBody.operationName);

    // console.log(parsedRequestBody.query, graphQLResult);
    return { statusCode: 200, body: JSON.stringify(graphQLResult) };
  } catch (error) {
    throw error;
  }
}
