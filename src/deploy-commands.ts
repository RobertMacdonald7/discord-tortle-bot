import { REST, Routes } from "discord.js";

import { commands } from "./commands";
import { config } from "./config";

const commandsData = Object.values(commands).map((command) => command.data);
const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    console.log("Deploying commands to guild:", guildId);

    await rest.put(Routes.applicationGuildCommands(config.APP_ID, guildId), {
      body: commandsData,
    });
    console.log(`Deployed ${commandsData.length} command(s) to guild ${guildId}`);
  } catch (error) {
    console.error(`Error deploying commands to guild ${guildId}:`, error);
  }
}
