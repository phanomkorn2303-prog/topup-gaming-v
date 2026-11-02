import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const games = [
    ["free-fire", "Free Fire", ["player_uid"]],
    ["roblox", "Roblox", ["roblox_username"]],
    ["genshin-impact", "Genshin Impact", ["player_uid", "server"]],
    ["mobile-legends", "Mobile Legends", ["user_id", "zone_id"]],
    ["rov", "ROV", ["player_id"]],
    ["pubg-mobile", "PUBG Mobile", ["character_id"]]
  ] as const;

  for (const [slug, name, fields] of games) {
    const game = await prisma.game.upsert({
      where: { slug }, update: { name },
      create: { slug, name }
    });
    for (const key of fields) {
      await prisma.gameInputField.upsert({
        where: { gameId_fieldKey: { gameId: game.id, fieldKey: key } },
        update: {},
        create: { gameId: game.id, fieldKey: key, label: key.replaceAll("_", " ") }
      });
    }
  }
}
main().finally(() => prisma.$disconnect());
