const { ApolloServer } = require('apollo-server');
const {
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
} = require('@apollo/gateway');
const {
  getStitchedSchemaFromSupergraphSdl,
} = require('@graphql-tools/federation');

const serviceList = [
  { name: 'Orders', url: 'http://localhost:4001' },
  { name: 'Users', url: 'http://localhost:4002' },
  { name: 'Products', url: 'http://localhost:4003' },
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

  server.listen(4000).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
