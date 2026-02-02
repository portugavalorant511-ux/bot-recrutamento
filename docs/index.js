require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const { salvarRegistro } = require("./utils/historico");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const MIN_IDADE = parseInt(process.env.MIN_IDADE || "13");

client.once("ready", () => {
  console.log(`✅ Bot ligado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {

    // /setup
    if (interaction.isChatInputCommand() && interaction.commandName === "setup") {

      if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ Sem permissão.", ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setTitle("🎮 Recrutamento Clan MAC")
        .setDescription("Clique para se candidatar ao clan!")
        .setColor("Green");

      const btn = new ButtonBuilder()
        .setCustomId("recrutar")
        .setLabel("📋 Candidatar-se")
        .setStyle(ButtonStyle.Success);

      await interaction.channel.send({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(btn)],
      });

      return interaction.reply({ content: "✅ Painel enviado!", ephemeral: true });
    }

    // Botão
    if (interaction.isButton() && interaction.customId === "recrutar") {

      const modal = new ModalBuilder()
        .setCustomId("form")
        .setTitle("Recrutamento Clan");

      const nick = new TextInputBuilder()
        .setCustomId("nick")
        .setLabel("Nick no Minecraft")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const idade = new TextInputBuilder()
        .setCustomId("idade")
        .setLabel("Idade")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const mic = new TextInputBuilder()
        .setCustomId("mic")
        .setLabel("Possui microfone? (sim/não)")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const tempo = new TextInputBuilder()
        .setCustomId("tempo")
        .setLabel("Há quanto tempo joga Minecraft?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const motivo = new TextInputBuilder()
        .setCustomId("motivo")
        .setLabel("Por que quer entrar no clan?")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nick),
        new ActionRowBuilder().addComponents(idade),
        new ActionRowBuilder().addComponents(mic),
        new ActionRowBuilder().addComponents(tempo),
        new ActionRowBuilder().addComponents(motivo)
      );

      return interaction.showModal(modal);
    }

    // Envio do formulário
    if (interaction.isModalSubmit() && interaction.customId === "form") {

      const nick = interaction.fields.getTextInputValue("nick");
      const idade = parseInt(interaction.fields.getTextInputValue("idade"));
      const mic = interaction.fields.getTextInputValue("mic");
      const tempo = interaction.fields.getTextInputValue("tempo");
      const motivo = interaction.fields.getTextInputValue("motivo");

      if (isNaN(idade) || idade < MIN_IDADE) {
        return interaction.reply({
          content: `❌ Idade mínima: ${MIN_IDADE} anos.`,
          ephemeral: true,
        });
      }

      const canal = await interaction.guild.channels.create({
        name: `recrut-${nick.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: process.env.TICKET_CATEGORY_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: ["ViewChannel"] },
          { id: interaction.user.id, allow: ["ViewChannel", "SendMessages"] },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle("📋 Novo Recrutamento")
        .addFields(
          { name: "🎮 Nick", value: nick },
          { name: "🎂 Idade", value: idade.toString() },
          { name: "🎤 Microfone", value: mic },
          { name: "⏳ Experiência", value: tempo },
          { name: "💬 Motivo", value: motivo }
        )
        .setColor("Green");

      await canal.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });

      // Cargo automático
      const role = interaction.guild.roles.cache.get(process.env.CLAN_ROLE_ID);
      if (role) await interaction.member.roles.add(role);

      // Histórico
      salvarRegistro({
        usuario: interaction.user.tag,
        userId: interaction.user.id,
        nick,
        idade,
        microfone: mic,
        experiencia: tempo,
        status: "aprovado",
      });

      // Logs
      const logChannel = interaction.guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
      if (logChannel) logChannel.send({ embeds: [embed] });

      return interaction.reply({
        content: "✅ Você foi aprovado automaticamente e entrou no clan!",
        ephemeral: true,
      });
    }

  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.TOKEN);
