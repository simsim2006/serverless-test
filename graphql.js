'use strict';

const { ApolloServer, gql } = require('apollo-server-lambda');
const {list, view, register} = require('./resolvers.js');

const typeDefs = gql`
  type CandidateType {
    id: String!
    fullname: String!
    email: String!
    experience: Int!
    submittedAt: DateTime!
    updatedAt: DateTime!
  }

  scalar DateTime

  type Mutation {
    registerCandidate(
      fullname: String!
      email: String!
      experience: Int!
    ): CandidateType
  }

  type Query {
    candidates: [CandidateType]
    candidate(id: ID!): CandidateType
  }
`;

const resolvers = {
  Query: {
    candidates: list,
    candidate: view
  },
  Mutation: {
    registerCandidate: register
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

module.exports.graphqlHandler = server.createHandler();
