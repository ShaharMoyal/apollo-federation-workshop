# Apollo Federation Example

Start Federation using @graphql-tools/federation:

```bash
npm start
```

Then, visit `http://localhost:4000`
Service runs on `http://localhost:4001`
Service2 runs on `http://localhost:4002`

Run the following GQL query:
```graphql
    query {
        someResolver {
            disappearingField {
                id
            }
        }
    }
```

If will fail with the following error even though the field `disappearingField` exists in the schema ([here](https://github.com/adijesori/apollo-federation/blob/86939bbb0515cc4aa5c571270f92a4086bd2d7ed/service2/server.js#L23)):
```json
{
  "errors": [
    {
      "message": "Cannot query field \"disappearingField\" on type \"SomeTypeWithDisappearingField\".",
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED",
        "exception": {
          "stacktrace": [
            "GraphQLError: Cannot query field \"disappearingField\" on type \"SomeTypeWithDisappearingField\".",
            "    at Object.Field (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/graphql/validation/rules/FieldsOnCorrectTypeRule.js:51:13)",
            "    at Object.enter (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/graphql/language/visitor.js:301:32)",
            "    at Object.enter (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/graphql/utilities/TypeInfo.js:391:27)",
            "    at visit (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/graphql/language/visitor.js:197:21)",
            "    at validate (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/graphql/validation/validate.js:91:24)",
            "    at validate (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/apollo-server-core/dist/requestPipeline.js:188:39)",
            "    at processGraphQLRequest (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/apollo-server-core/dist/requestPipeline.js:99:38)",
            "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
            "    at async processHTTPRequest (/Users/ori/WebstormProjects/apollo-federation/gateway/node_modules/apollo-server-core/dist/runHttpQuery.js:222:30)"
          ]
        }
      }
    }
  ]
}
```

Start Federation using ApolloGateway:

```bash
npm run start:apollo
```

Run the same query above. It will work and return the following:
```json
{
  "data": {
    "someResolver": null
  }
}
```
