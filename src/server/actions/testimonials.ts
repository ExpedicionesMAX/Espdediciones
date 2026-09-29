"use server";

import { revalidatePath } from "next/cache";
import type { TestimonialStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "@/lib/audit";
import { notify } from "@/lib/notifications";
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

  await notify({
    type: "testimonial",
    title: "Nuevo testimonio",
    message: `De ${d.authorName}`,
    link: "/admin/testimonios",
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
  revalidatePath("/");
  if (updated.expedition?.slug) {
    revalidatePath(`/expediciones/${updated.expedition.slug}`);
  }
}

function reviewFields(fd: FormData) {
  const authorName = fd.get("authorName")?.toString().trim() ?? "";
  const text = fd.get("text")?.toString().trim() ?? "";
  const ratingRaw = fd.get("rating")?.toString();
  const rating = ratingRaw ? Number(ratingRaw) : null;
  const photo = fd.get("photo")?.toString().trim() || null;
  const expeditionId = fd.get("expeditionId")?.toString() || null;
  const orderRaw = fd.get("order")?.toString();
  const order = orderRaw ? Number(orderRaw) : 0;
  return {
    authorName,
    text,
    rating: rating && rating >= 1 && rating <= 5 ? rating : null,
    photo,
    expeditionId,
    order: Number.isFinite(order) ? order : 0,
  };
}

/** Reseña creada por el admin: se publica directo (APPROVED + activa). */
export async function createReview(formData: FormData): Promise<void> {
  const user = await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const d = reviewFields(formData);
  if (!d.authorName || !d.text) return;

  await prisma.testimonial.create({
    data: {
      authorName: d.authorName,
      text: d.text,
      rating: d.rating,
      photo: d.photo,
      order: d.order,
      active: true,
      status: "APPROVED",
      expeditionId: d.expeditionId,
      moderatedById: user.id,
      moderatedAt: new Date(),
    },
  });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function updateReview(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const id = formData.get("id")?.toString();
  if (!id) return;
  const d = reviewFields(formData);
  if (!d.authorName || !d.text) return;

  await prisma.testimonial.update({
    where: { id },
    data: {
      authorName: d.authorName,
      text: d.text,
      rating: d.rating,
      photo: d.photo,
      order: d.order,
      expeditionId: d.expeditionId,
    },
  });

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function toggleTestimonialActive(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const id = formData.get("id")?.toString();
  const active = formData.get("active")?.toString() === "true";
  if (!id) return;
  await prisma.testimonial.update({ where: { id }, data: { active } });
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function deleteTestimonial(formData: FormData): Promise<void> {
  await requirePermission(PERMISSIONS.CONTENT_MODERATE);
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}
