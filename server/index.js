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
    maxCP: Int
    maxHP: Int
    attacks: attacks
  }
  type attacks{
    fast: [fast]
    special: [special]
  }
  type fast{
    name: String
    type: String
    damage: Int
  }
  type special{
    name: String
    type: String
    damage: Int
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
  type newPokemon {
    Pokemon: [Pokemon]
  }
  type pokemonAttacks {
    name: String
    type: String
    damage: Int
    Pokemon: [Pokemon]
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: String, type: String): [Pokemon]
    types: [String]
    type(type: String): newPokemon
    attacks(class: String): attacks
    attack(name: String!): pokemonAttacks
  }

  
  
  `);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    if (request.name) {
      return [data.pokemon.find((pokemon) => pokemon.name === request.name)];
    }
    if (request.id) {
      return [data.pokemon.find((pokemon) => pokemon.id === request.id)];
    }
    if (request.type) {
      return data.pokemon.filter((pokemon) => {
        return pokemon.types.includes(request.type);
      });
    }
  },
  types: () => {
    return data.types;
  },
  type: (request) => {
    if (request.type) {
      return {
        Pokemon: data.pokemon.filter((pokemon) => {
          return pokemon.types.includes(request.type);
        }),
      };
    }
  },
  attacks: (request) => {
    if (!request) return data.attacks;
    if (request.class === "fast") {
      return { fast: data.attacks.fast };
    }
    return { special: data.attacks.special };
  },
  attack: (request) => {
    const result = {};
    result.name = request.name;
    let attackClass;
    // eslint-disable-next-line array-callback-return
    data.attacks.fast.find((attack) => {
      if (attack.name === request.name) {
        result.type = attack.type;
        result.damage = attack.damage;
        attackClass = "fast";
      }
    });
    if (!attackClass) {
      // eslint-disable-next-line array-callback-return
      data.attacks.special.find((attack) => {
        if (attack.name === request.name) {
          result.type = attack.type;
          result.damage = attack.damage;
          attackClass = "special";
        }
      });
    }
    const selected = data.pokemon.filter((pokemon) => {
      return pokemon.attacks.special.find((attack) => {
        return attack.name === request.name;
      });
    });
    result.Pokemon = selected;
    return result;
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
