import "server-only";
import { prisma } from "@/lib/prisma";

/** Crea una notificación interna (visible en el panel). No rompe el flujo si falla. */
export async function notify(input: {
  type: "inquiry" | "reservation" | "testimonial";
  title: string;
  message?: string;
  link?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message ?? null,
        link: input.link ?? null,
      },
    });
  } catch {
    // la notificación es secundaria, no debe tumbar la operación
  }
}
