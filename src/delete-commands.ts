import { REST, Routes } from "discord.js";
import { config } from "./config.js";

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

const GUILD_ID = "";
const COMMAND_ID = "";

export async function removeCommands(guildId?: string, commandId?: string) {
  if (commandId && guildId) {
    try {
      console.log(`Deleting command ${commandId} from guild:`, guildId);
      await rest.delete(Routes.applicationGuildCommand(config.APP_ID, guildId, commandId));
      console.log(`Deleted command ${commandId} from guild ${guildId}`);
    } catch (error) {
      console.error(`Error deleting command ${commandId} from guild ${guildId}:`, error);
    }
    return;
  }

  if (guildId && !commandId) {
    try {
      console.log("Deleting all commands from guild:", guildId);

      await rest.put(Routes.applicationGuildCommands(config.APP_ID, guildId), {
        body: [],
      });
      console.log(`Deleted all commands from guild ${guildId}`);
    } catch (error) {
      console.error(`Error deleting all commands from guild ${guildId}:`, error);
    }

    return;
  }

  if (!guildId && commandId) {
    try {
      console.log("Deleting global commands");

      await rest.delete(Routes.applicationCommand(config.APP_ID, commandId));
      console.log("Deleted global command");
    } catch (error) {
      console.error("Error deleting global command:", error);
    }
    return;
  }

  if (!guildId && !commandId) {
    try {
      console.log("Deleting all global commands");

      await rest.put(Routes.applicationCommands(config.APP_ID), {
        body: [],
      });
      console.log("Deleted all global commands");
    } catch (error) {
      console.error("Error deleting all global commands:", error);
    }
  }
}

removeCommands(GUILD_ID, COMMAND_ID);
