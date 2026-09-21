"use server";

import { revalidatePath } from "next/cache";
import type { TestimonialStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { testimonialInputSchema } from "@/lib/validations/testimonial";

export type TestimonialFormState = {
  ok: boolean;
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

const VALID_STATUS: TestimonialStatus[] = ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"];

export async function submitTestimonial(
  _prev: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  if (formData.get("website")) {
    return { ok: true, success: true }; // honeypot
  }

  const parsed = testimonialInputSchema.safeParse({
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    text: formData.get("text"),
    rating: formData.get("rating"),
    expeditionId: formData.get("expeditionId"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Revisá los datos del formulario.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const d = parsed.data;

  let expeditionId: string | null = null;
  if (d.expeditionId) {
    const e = await prisma.expedition.findUnique({
      where: { id: d.expeditionId },
      select: { id: true },
    });
    expeditionId = e?.id ?? null;
  }

  await prisma.testimonial.create({
    data: {
      authorName: d.authorName,
      authorEmail: d.authorEmail ?? null,
      text: d.text,
      rating: d.rating ?? null,
      status: "PENDING",
      expeditionId,
    },
  });

  revalidatePath("/admin/testimonios");
  revalidatePath("/admin/dashboard");
  return { ok: true, success: true };
}

export async function moderateTestimonial(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const id = formData.get("id")?.toString();
  const status = formData.get("status")?.toString() as TestimonialStatus | undefined;
  if (!id || !status || !VALID_STATUS.includes(status)) return;

  const updated = await prisma.testimonial.update({
    where: { id },
    data: { status, moderatedById: user.id, moderatedAt: new Date() },
    select: { expedition: { select: { slug: true } } },
  });

  await logActivity({
    userId: user.id,
    action: status === "APPROVED" ? "approve" : "moderate",
    entityType: "Testimonial",
    entityId: id,
    summary: `Moderó un testimonio a ${status}`,
  });

  revalidatePath("/admin/testimonios");
  if (updated.expedition?.slug) {
    revalidatePath(`/expediciones/${updated.expedition.slug}`);
  }
}
