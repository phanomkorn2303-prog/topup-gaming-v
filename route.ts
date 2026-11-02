import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  packageId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10).default(1),
  playerData: z.record(z.string(), z.string().min(1)),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().optional()
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลคำสั่งซื้อไม่ถูกต้อง" }, { status: 400 });

  const pkg = await prisma.package.findFirst({
    where: { id: parsed.data.packageId, isActive: true, game: { isActive: true } },
    include: { game: true }
  });
  if (!pkg) return NextResponse.json({ error: "ไม่พบแพ็กเกจหรือปิดจำหน่ายแล้ว" }, { status: 404 });

  const total = Number(pkg.amount) * parsed.data.quantity;
  const orderNumber = `TGV-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber, totalAmount: total,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      items: { create: [{
        packageId: pkg.id, gameName: pkg.game.name, packageName: pkg.name,
        quantity: parsed.data.quantity, unitPrice: pkg.amount,
        playerData: parsed.data.playerData
      }] }
    },
    select: { id: true, orderNumber: true, totalAmount: true, status: true }
  });

  return NextResponse.json(order, { status: 201 });
}
