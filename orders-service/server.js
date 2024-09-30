const { ApolloServer, gql } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

// TODO - figure out how to use the logger
// const logger = require('@ww/gql-base-service').logger.withContext(__filename);

require('dotenv').config();

const orders = JSON.parse(fs.readFileSync('orders.json'), 'utf-8');

const app = express();

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.5"
      import: ["@key", "@requires", "@external"]
    )

  type Order {
    id: ID!
    date: String!
    userId: ID!
    productIds: [ID!]!
  }

  type Query {
    orders: [Order!]!
  }
`;

const resolvers = {
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

// Apply middleware conditionally based on GQL_TRACING environment variable
if (process.env.GQL_TRACING) {
  app.use(bodyParser.json(), (req, res, next) => {
    // logger.debug('GQL Request Body', JSON.stringify(req.body, null, 4));
    const query = req.body?.operationName || '';

    // Ignore introspection queries
    if (query === 'IntrospectionQuery') {
      return next(); // Skip logging for introspection queries
    }

    console.debug('GQL Request Body', JSON.stringify(req.body, null, 4));
    next();
  });
}

// Start the Apollo server and integrate it with Express
server.start().then(() => {
  server.applyMiddleware({ app });

  const PORT = 4001;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}).catch(err => {
  console.error('Error starting the server:', err);
});