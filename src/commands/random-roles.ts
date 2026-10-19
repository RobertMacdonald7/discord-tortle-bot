import { InteractionContextType, SlashCommandBuilder, GuildMember, Interaction, ChatInputCommandInteraction, User } from "discord.js";

export const name = "random_roles";

export const data = new SlashCommandBuilder()
  .setName(name)
  .setDescription("Assigns random raid roles to members of 'Raid Group'")
  .addUserOption(option =>
    option.setName('exclude_user_1')
      .setDescription('Select a user to exclude from role assignment')
      .setRequired(false)
  )
  .addUserOption(option =>
    option.setName('exclude_user_2')
      .setDescription('Select a user to exclude from role assignment')
      .setRequired(false)
  )
  .setContexts(InteractionContextType.Guild);

export async function execute(interaction: Interaction) {
  console.log(`Running random_roles for guild ${interaction.guildId ?? "DM"}`);

  if (!interaction.isChatInputCommand()) {
    console.warn("Interaction is not a ChatInputCommand");
    return;
  }

  const excludedUsers = getExcludedUsers(interaction);
  const raidGroupUsers = await getRaidGroup(interaction);
  const eligibleUsers = raidGroupUsers.difference(excludedUsers);

  if (eligibleUsers.size < 4) {
    await interaction.reply({
      content: `At least four eligible members of 'Raid Group' are needed to assign random roles (found ${eligibleUsers.size}).`,
      ephemeral: true,
    });
    console.log("Sent insufficient Raid Group members response");
    return;
  }

  await interaction.reply({
    content: assignRandomRoles(eligibleUsers),
  });
  console.log("Sent randomized role assignments");
}

const raidGroup: Set<User> = new Set();

async function getRaidGroup(interaction: Interaction): Promise<Set<User>> {
  if (raidGroup.size > 0) {
    console.log(`Using cached Raid Group members (${raidGroup.size})`);
    return raidGroup;
  }

  const guild = interaction.guild;
  if (!guild) {
    console.warn("Cannot fetch Raid Group members outside a guild");
    return raidGroup;
  }

  console.log(`Fetching role members for guild ${guild.id}`);
  await guild?.members.fetch();
  const role = guild?.roles.cache.find((r) => r.name === "Raid Group");

  if (!role) {
    console.warn(`Role "Raid Group" was not found in guild ${guild.id}`);
    return raidGroup;
  }

  for (const member of role.members.values()) {
    raidGroup.add(member.user);
  }
  console.log(`Found ${raidGroup.size} Raid Group member(s)`);

  return raidGroup;
}

function assignRandomRoles(users: Set<User>): string {
  const shuffledUsers = [...users];
  for (let i = shuffledUsers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
  }

  const [healBoon1, dpsBoon1, healBoon2, dpsBoon2] = shuffledUsers;
  return [
    "Random Roles",
    "",
    `Heal Boon1: <@${healBoon1.id}>`,
    `DPS Boon1: <@${dpsBoon1.id}>`,
    "",
    `Heal Boon2: <@${healBoon2.id}>`,
    `DPS Boon2: <@${dpsBoon2.id}>`,
  ].join("\n");
}

function getExcludedUsers(interaction: ChatInputCommandInteraction): Set<User> {
  const excludedUsers: Set<User> = new Set();
  const excludeUser1 = interaction.options.getUser('exclude_user_1');
  const excludeUser2 = interaction.options.getUser('exclude_user_2');
  if (excludeUser1) excludedUsers.add(excludeUser1);
  if (excludeUser2) excludedUsers.add(excludeUser2);

  return excludedUsers;
}
