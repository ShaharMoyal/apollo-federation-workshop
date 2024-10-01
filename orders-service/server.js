const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const express = require('express');
const bodyParser = require('body-parser');
const {
  mapResolver,
} = require('@ww/gql-base-service/lib/helpers/apollo-federation.helper');

const orders = require('./orders.json');

require('dotenv').config();

const app = express();

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.5", import: ["@key"])

  type User @key(fields: "id", resolvable: false) {
    id: ID!
  }

  type Order {
    id: ID!
    date: String!
    userId: ID!
    productIds: [ID!]!
    user: User
  }

  type Query {
    orders: [Order!]!
  }
`;

const resolvers = {
  Order: {
    user: mapResolver('userId'),
  },
  Query: {
    orders() {
      return orders;
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

if (process.env.GQL_TRACING === 'true') {
  app.post(server.graphqlPath, bodyParser.json(), (req, res, next) => {
    const query = req.body?.operationName || '';

    // Ignore introspection queries
    if (query === 'IntrospectionQuery') {
      return next();
    }

    console.debug('***Orders Subgraph*** GQL Request Body', JSON.stringify(req.body, null, 4));
    next();
  });
}

server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = 4001;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}).catch(err => {
  console.error('Error starting the server:', err);
});
