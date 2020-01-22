const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: weights
    height: heights
    fleeRate: Float
    evolutionRequirements: evolutionRequirements
    evolutions: [evolutions]
  }
  type evolutions{
    id: Int
    name: String
  }
  type weights {
    minimum: String
    maximum: String
  }
  type heights {
    minimum: String
    maximum: String
  }
  type evolutionRequirements{
    amount: Int
    name: String
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: String, type: String): Pokemon
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    if (request.name) {
      return data.pokemon.find((pokemon) => pokemon.name === request.name);
    }
    if (request.id) {
      return data.pokemon.find((pokemon) => pokemon.id === request.id);
    }
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
