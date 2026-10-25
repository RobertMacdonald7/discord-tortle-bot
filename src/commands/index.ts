import * as randomRoles from "./random-roles";
import * as flipCoin from "./flip-coin";

export const commands = {
  [randomRoles.name]: randomRoles,
  [flipCoin.name]: flipCoin,
};

export function getCommandDisplayNames() {
  return Object.keys(commands)
    .map((name) => `'${name}'`)
    .join(", ");
}
