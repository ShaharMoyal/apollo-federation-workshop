const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fs = require('fs');
const {
  mapResolver,
} = require('@ww/gql-base-service/lib/helpers/apollo-federation.helper');

const orders = JSON.parse(fs.readFileSync('orders.json'), 'utf-8');

const typeDefs = gql`
  extend schema
    @link(
      url: "https://specs.apollo.dev/federation/v2.5"
      import: ["@key", "@requires", "@external"]
    )

  type User @key(fields: "id") {
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
    user: mapResolver("userId"),
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

server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
