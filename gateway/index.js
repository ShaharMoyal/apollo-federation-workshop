const { ApolloServer } = require('apollo-server-express');
const {
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} = require('@apollo/gateway');
const {
  getStitchedSchemaFromSupergraphSdl,
} = require('@graphql-tools/federation');
const express = require('express');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

const serviceList = [
  { name: 'Orders', url: 'http://localhost:4001/graphql' },
  { name: 'Users', url: 'http://localhost:4002/graphql' },
  { name: 'Products', url: 'http://localhost:4003/graphql' },
];

(async () => {
  const { supergraphSdl } = await new IntrospectAndCompose({
    subgraphs: serviceList,
  }).initialize({ getDataSource: (s) => new RemoteGraphQLDataSource(s) });

  const schema = getStitchedSchemaFromSupergraphSdl({
    supergraphSdl,
  });

  const server = new ApolloServer({
    schema,
  });

  if (process.env.GQL_TRACING === 'true') {
    app.post(server.graphqlPath, bodyParser.json(), (req, res, next) => {
      const query = req.body?.operationName || '';

      // Ignore introspection queries
      if (query === 'IntrospectionQuery') {
        return next();
      }

      console.debug('***Gateway*** GQL Request Body', JSON.stringify(req.body, null, 4));
      next();
    });
  }

  server.start().then(() => {
    server.applyMiddleware({ app });

    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  }).catch(err => {
    console.error('Error starting the server:', err);
  });
})();
