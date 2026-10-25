import { CommandInteraction, InteractionContextType, SlashCommandBuilder } from "discord.js";

import { commandName } from "../config";

export const name = commandName("flip_coin");

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Flips a coin and returns the result")
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction: CommandInteraction) {
  console.log(`Running flip_coin for guild ${interaction.guildId ?? "DM"}`);
  const result = Math.random() < 0.5 ? "Heads" : "Tails";
  await interaction.reply({
    content: `The coin landed on **${result}**.`,
  });
}
