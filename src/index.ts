import { Client, GatewayIntentBits } from "discord.js";

import { commands } from "./commands";
import { config } from "./config";
import { deployCommands } from "./deploy-commands";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

const seenGuilds = new Set();

client.once("clientReady", () => {
  console.log(`Discord bot is ready as ${client.user?.tag}`);
});

client.on("guildCreate", async (guild) => {
  console.log(`Joined guild ${guild.name} (${guild.id})`);
  await deployCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    console.log(`Ignoring non-command interaction ${interaction.id}`);
    return;
  }

  const guildId = interaction.guildId;
  console.log(
    `Received command "${interaction.commandName}" (interaction ${interaction.id}) in guild ${guildId ?? "DM"}`,
  );

  if (!!guildId && !seenGuilds.has(guildId)) {
    seenGuilds.add(guildId);
    console.log(`Deploying commands on first interaction with guild ${guildId}`);
    await deployCommands({ guildId });
  }

  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    try {
      await commands[commandName as keyof typeof commands].execute(interaction);
      console.log(`Command "${commandName}" completed (interaction ${interaction.id})`);
    } catch (error) {
      console.error(`Command "${commandName}" failed (interaction ${interaction.id}):`, error);
    }
  } else {
    console.warn(`No handler found for command "${commandName}"`);
  }
});

async function shutdown(signal: string) {
  console.log(`Received ${signal}; disconnecting from Discord`);
  try {
    await client.destroy();
  } catch (error) {
    console.error("Failed to disconnect from Discord:", error);
    process.exitCode = 1;
  }
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));

try {
  console.log("Logging in to Discord");
  await client.login(config.DISCORD_TOKEN);
} catch (error) {
  console.error("Failed to log in to Discord:", error);
  await client.destroy();
  process.exitCode = 1;
}
