const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();

const users = JSON.parse(fs.readFileSync('users.json'), 'utf-8');

const app = express();

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.5"
      import: ["@key", "@requires", "@external"]
    )

  type User {
    id: ID!
    name: String!
    address: String!
  }

  type Query {
    users: [User!]!
  }
`;

const resolvers = {
  Query: {
    users: () => {
      return users;
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

if (process.env.GQL_TRACING) {
  app.post(server.graphqlPath, bodyParser.json(), (req, res, next) => {
    const query = req.body?.operationName || '';

    // Ignore introspection queries
    if (query === 'IntrospectionQuery') {
      return next();
    }

    console.debug('GQL Request Body', JSON.stringify(req.body, null, 4));
    next();
  });
}

server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = 4002;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}).catch(err => {
  console.error('Error starting the server:', err);
});
