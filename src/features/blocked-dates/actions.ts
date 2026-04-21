"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { blockedDates } from "@/db/schema";
import { requireAdmin } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";

async function ensureAdmin() {
  const { isAdmin } = await requireAdmin();
  if (!isAdmin) throw new Error("Not authorized");
}

export async function addManualBlock(date: string) {
  await ensureAdmin();
  if (!isIsoDate(date)) throw new Error("Invalid date");
  await db
    .insert(blockedDates)
    .values({ date, reason: "manual" })
    .onConflictDoNothing();
  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
}

export async function removeManualBlock(date: string) {
  await ensureAdmin();
  if (!isIsoDate(date)) throw new Error("Invalid date");
  await db
    .delete(blockedDates)
    .where(and(eq(blockedDates.date, date), eq(blockedDates.reason, "manual")));
  revalidateTag("blocked_dates");
  revalidatePath("/");
  revalidatePath("/admin/calendario");
}
