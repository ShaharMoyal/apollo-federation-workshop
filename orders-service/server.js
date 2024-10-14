const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { mapArrayResolver } = require('@ww/gql-base-service/lib/helpers/apollo-federation.helper');
const express = require('express');
const bodyParser = require('body-parser');
const orders = require('./orders.json');

require('dotenv').config();

const app = express();

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.5", import: ["@key"])

  type Product @key(fields: "id") {
    id: ID!
    productOrderCount: Int
  }

  type Order @key(fields: "id") {
    id: ID!
    date: String!
    userId: ID!
    productIds: [ID!]!
    products: [Product]
  }

  type Query {
    orders: [Order!]!
  }
`;

const resolvers = {
  Product: {
    productOrderCount({ id }) {
      return orders.filter((order) => order.productIds.includes(id)).length;
    },
  },
  Order: {
    products: mapArrayResolver('productIds'),
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
