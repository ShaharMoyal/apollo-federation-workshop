const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const fs = require('fs');

const users = JSON.parse(fs.readFileSync('users.json'), 'utf-8');

const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.5", import: ["@key"])

  type User @key(fields: "id") {
    id: ID!
    name: String!
    address: String!
  }

  type Query {
    users: [User!]!
  }
`;

const resolvers = {
  User: {
    __resolveReference({ id }) {
      return users.find(({ id: userId }) => id === userId);
    },
  },
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

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
