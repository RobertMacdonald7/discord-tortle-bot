import * as randomRoles from "./random-roles.js";
import * as flipCoin from "./flip-coin.js";

export const commands = {
  [randomRoles.name]: randomRoles,
  [flipCoin.name]: flipCoin,
};
