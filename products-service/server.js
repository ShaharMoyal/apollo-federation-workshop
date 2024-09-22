const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const express = require('express');
const bodyParser = require('body-parser');
const products = require('./products.json');

require('dotenv').config();


const app = express();

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.5"
      import: ["@key", "@requires", "@external"]
    )

  type Order @key(fields: "id") {
    id: ID!
    productIds: [ID!]! @external
    totalOrderPrice: Float! @requires(fields: "productIds")
  }

  type Product @key(fields: "id") {
    id: ID!
    name: String!
    price: Float!
  }

  type Query {
    products: [Product!]!
  }
`;

const resolvers = {
  Order: {
    Product: {
      __resolveReference({ id }) {
        return products.filter(({ id: productId }) => productId === id);
      },
    },
    totalOrderPrice({ productIds }) {
      return products
        .filter(({ id }) => productIds.includes(id))
        .reduce((acc, { price }) => {
          return (acc += price);
        }, 0);
    },
  },
  Query: {
    products() {
      return products;
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

    console.debug('***Products Subgraph*** GQL Request Body', JSON.stringify(req.body, null, 4));
    next();
  });
}

server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = 4003;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}).catch(err => {
  console.error('Error starting the server:', err);
});
