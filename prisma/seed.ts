import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Imágenes demo (Unsplash). Son placeholders: el admin las reemplaza desde el panel.
const IMG = {
  patagonia: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=1600&q=80&auto=format&fit=crop",
  aconcagua: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format&fit=crop",
  volcan: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80&auto=format&fit=crop",
  bosque: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80&auto=format&fit=crop",
  lago: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&auto=format&fit=crop",
  cumbre: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80&auto=format&fit=crop",
  ruta: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=1600&q=80&auto=format&fit=crop",
  noche: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1600&q=80&auto=format&fit=crop",
  guideM: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&auto=format&fit=crop",
  guideF: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop",
  guideM2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop",
};

async function main() {
  console.log("→ Seed: limpiando contenido demo…");
  await prisma.itineraryDay.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.expedition.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.destination.deleteMany();

  // ── Configuración del sitio ──────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Cumbre",
      tagline: "Expediciones, montañismo y fotografía de naturaleza",
      whatsappNumber: "5491100000000",
      contactEmail: "hola@cumbre.exp",
      contactPhone: "+54 9 11 0000 0000",
      social: {
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
        facebook: "https://facebook.com",
      },
      primaryColor: "#1c1917",
      accentColor: "#ea580c",
      theme: "cinematic",
    },
  });

  // ── Usuario administrador ────────────────────────────────
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@expediciones.com").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Cambiar123!";
  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "SUPER_ADMIN", active: true },
    create: {
      email: adminEmail,
      name: process.env.SEED_ADMIN_NAME ?? "Administrador",
      hashedPassword: hashed,
      role: "SUPER_ADMIN",
      active: true,
    },
  });
  console.log(`→ Admin: ${adminEmail} / ${adminPassword}`);

  // ── Guías ────────────────────────────────────────────────
  const [nadia, martin, sofia] = await Promise.all([
    prisma.guide.create({
      data: {
        slug: "nadia-suarez",
        name: "Nadia Suárez",
        photo: IMG.guideF,
        bio: "Guía de alta montaña con 12 años de experiencia en los Andes.",
        experience: "Más de 40 ascensiones a cumbres de 6.000 m.",
        certifications: ["AAGM", "Wilderness First Responder"],
        specialties: ["Alta montaña", "Aclimatación"],
        languages: ["Español", "Inglés"],
      },
    }),
    prisma.guide.create({
      data: {
        slug: "martin-oliva",
        name: "Martín Oliva",
        photo: IMG.guideM,
        bio: "Fotógrafo de naturaleza y guía de trekking.",
        experience: "Expediciones fotográficas en Patagonia y Puna.",
        certifications: ["Guía de trekking", "RCP"],
        specialties: ["Fotografía", "Trekking"],
        languages: ["Español", "Portugués"],
      },
    }),
    prisma.guide.create({
      data: {
        slug: "sofia-reyes",
        name: "Sofía Reyes",
        photo: IMG.guideM2,
        bio: "Especialista en travesías y escalada en roca.",
        experience: "Instructora de escalada y líder de travesías glaciares.",
        certifications: ["Escalada deportiva", "Rescate en grietas"],
        specialties: ["Escalada", "Travesías"],
        languages: ["Español", "Inglés", "Francés"],
      },
    }),
  ]);

  // ── Destinos ─────────────────────────────────────────────
  const [patagonia, andes, puna] = await Promise.all([
    prisma.destination.create({
      data: {
        slug: "patagonia",
        name: "Patagonia",
        country: "Argentina",
        region: "Santa Cruz",
        description: "Estepa, glaciares y granito. El sur del mundo.",
        coverImage: IMG.patagonia,
        latitude: -50.33,
        longitude: -72.9,
      },
    }),
    prisma.destination.create({
      data: {
        slug: "andes-centrales",
        name: "Andes Centrales",
        country: "Argentina",
        region: "Mendoza",
        description: "El techo de América y sus gigantes de roca y hielo.",
        coverImage: IMG.aconcagua,
        latitude: -32.65,
        longitude: -70.01,
      },
    }),
    prisma.destination.create({
      data: {
        slug: "puna",
        name: "Puna de Atacama",
        country: "Argentina",
        region: "Catamarca",
        description: "Volcanes de más de 6.000 m sobre el altiplano.",
        coverImage: IMG.volcan,
        latitude: -27.1,
        longitude: -68.5,
      },
    }),
  ]);

  // ── Expediciones ─────────────────────────────────────────
  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

  await prisma.expedition.create({
    data: {
      slug: "travesia-glaciar-patagonia",
      name: "Travesía del Glaciar Patagónico",
      title: "Travesía del Glaciar Patagónico",
      subtitle: "7 días sobre el hielo continental",
      shortDescription:
        "Una travesía guiada sobre el campo de hielo, entre seracs y ventisqueros.",
      fullDescription:
        "Recorreremos el corazón del hielo continental patagónico en una travesía de siete días. Cada jornada combina progresión sobre glaciar, técnica de cuerda y campamentos sobre la nieve, con la Patagonia salvaje en cada horizonte.",
      coverImage: IMG.patagonia,
      gallery: [IMG.lago, IMG.bosque, IMG.noche, IMG.cumbre],
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      destinationId: patagonia.id,
      country: "Argentina",
      region: "Santa Cruz",
      latitude: -50.33,
      longitude: -72.9,
      startDate: inDays(45),
      endDate: inDays(52),
      durationDays: 7,
      distanceKm: 65,
      elevationGain: 2100,
      maxAltitude: 2200,
      difficulty: "HARD",
      activityType: "TRAVESIA",
      minAge: 18,
      capacity: 10,
      spotsTaken: 4,
      price: 2400,
      currency: "USD",
      depositPrice: 600,
      registrationDeadline: inDays(30),
      includes: ["Guías certificados", "Equipo técnico grupal", "Comidas en montaña", "Traslados internos"],
      excludes: ["Vuelos", "Seguro de viaje", "Equipo personal"],
      requirements: ["Buen estado físico", "Experiencia previa en trekking de varios días"],
      equipment: ["Botas rígidas", "Crampones", "Arnés", "Bolsa de dormir -15°C"],
      recommendations: "Recomendamos llegar dos días antes para aclimatar y revisar equipo.",
      faqs: [
        { q: "¿Necesito experiencia en glaciar?", a: "No es excluyente; enseñamos la técnica en el primer día." },
        { q: "¿Qué pasa si hay mal tiempo?", a: "Contamos con días de margen y planes alternativos." },
      ],
      status: "OPEN",
      template: "CINEMATIC",
      featured: true,
      publishedAt: now,
      seoTitle: "Travesía del Glaciar Patagónico — 7 días",
      seoDescription: "Travesía guiada sobre el hielo continental patagónico.",
      whatsappMessage: "Hola, quiero información sobre la Travesía del Glaciar Patagónico.",
      leadGuideId: nadia.id,
      guides: { connect: [{ id: martin.id }] },
      itinerary: {
        create: [
          { dayNumber: 1, title: "Aproximación y campo base", description: "Ingreso al valle y montaje del primer campamento.", distanceKm: 12, elevationGain: 600, altitude: 1200, accommodation: "Campamento" },
          { dayNumber: 2, title: "Escuela de glaciar", description: "Técnica de crampones, cuerda y autodetención.", distanceKm: 6, elevationGain: 400, altitude: 1600, accommodation: "Campamento" },
          { dayNumber: 3, title: "Ingreso al hielo continental", description: "Primera jornada completa sobre el glaciar.", distanceKm: 14, elevationGain: 500, altitude: 1900, accommodation: "Campamento en nieve" },
          { dayNumber: 4, title: "Travesía central", description: "El corazón del campo de hielo.", distanceKm: 16, elevationGain: 300, altitude: 2000, accommodation: "Campamento en nieve" },
          { dayNumber: 5, title: "Miradores de seracs", description: "Progresión entre grietas y seracs.", distanceKm: 10, altitude: 2200, accommodation: "Campamento en nieve" },
          { dayNumber: 6, title: "Descenso al valle", description: "Salida del hielo y descenso.", distanceKm: 15, altitude: 1300, accommodation: "Campamento" },
          { dayNumber: 7, title: "Regreso", description: "Cierre y traslado.", distanceKm: 8 },
        ],
      },
    },
  });

  await prisma.expedition.create({
    data: {
      slug: "ascension-volcan-6000",
      name: "Ascensión a un 6.000 de la Puna",
      subtitle: "Aclimatación progresiva a la cumbre",
      shortDescription: "Programa de ascensión a un volcán de más de 6.000 m con aclimatación gradual.",
      fullDescription:
        "Una expedición clásica de altura en la Puna de Atacama. Trabajamos la aclimatación paso a paso hasta el día de cumbre, sobre uno de los volcanes más altos del planeta.",
      coverImage: IMG.volcan,
      gallery: [IMG.cumbre, IMG.ruta, IMG.noche],
      destinationId: puna.id,
      country: "Argentina",
      region: "Catamarca",
      startDate: inDays(90),
      endDate: inDays(102),
      durationDays: 12,
      distanceKm: 40,
      elevationGain: 3200,
      maxAltitude: 6100,
      difficulty: "TECHNICAL",
      activityType: "MOUNTAINEERING",
      minAge: 21,
      capacity: 8,
      spotsTaken: 6,
      price: 3600,
      currency: "USD",
      depositPrice: 900,
      includes: ["Guías de alta montaña", "Logística 4x4", "Oxígeno de emergencia", "Comidas"],
      excludes: ["Vuelos internacionales", "Equipo personal de altura"],
      requirements: ["Experiencia previa en 5.000 m", "Excelente estado físico"],
      equipment: ["Botas dobles", "Crampones", "Piolet", "Bolsa -25°C"],
      status: "LIMITED",
      template: "EXTREME",
      featured: true,
      publishedAt: now,
      whatsappMessage: "Hola, quiero información sobre la Ascensión a un 6.000 de la Puna.",
      leadGuideId: nadia.id,
      itinerary: {
        create: [
          { dayNumber: 1, title: "Llegada y logística", altitude: 3000, accommodation: "Refugio" },
          { dayNumber: 2, title: "Trekking de aclimatación", altitude: 4200, accommodation: "Campamento" },
          { dayNumber: 3, title: "Campo base", altitude: 4800, accommodation: "Campamento" },
          { dayNumber: 4, title: "Porteo campo 1", altitude: 5300, accommodation: "Campo base" },
          { dayNumber: 5, title: "Día de descanso", altitude: 4800, accommodation: "Campo base" },
          { dayNumber: 6, title: "Ascenso a campo 1", altitude: 5300, accommodation: "Campo 1" },
          { dayNumber: 7, title: "Cumbre", description: "Intento de cumbre y regreso a campo base.", altitude: 6100, accommodation: "Campo base" },
        ],
      },
    },
  });

  await prisma.expedition.create({
    data: {
      slug: "expedicion-fotografica-patagonia",
      name: "Expedición Fotográfica de Otoño",
      subtitle: "Luz, color y montaña",
      shortDescription: "Cinco días persiguiendo la luz del otoño patagónico, cámara en mano.",
      fullDescription:
        "Una salida pensada para fotógrafos: madrugadas de luz dorada, lagos espejados y bosques encendidos. Ritmo tranquilo, foco en la imagen.",
      coverImage: IMG.bosque,
      gallery: [IMG.lago, IMG.ruta, IMG.patagonia],
      destinationId: patagonia.id,
      country: "Argentina",
      region: "Santa Cruz",
      startDate: inDays(120),
      endDate: inDays(125),
      durationDays: 5,
      distanceKm: 30,
      difficulty: "MODERATE",
      activityType: "PHOTOGRAPHY",
      capacity: 12,
      spotsTaken: 3,
      price: 1500,
      currency: "USD",
      includes: ["Guía fotográfico", "Alojamiento", "Traslados"],
      excludes: ["Equipo fotográfico", "Comidas no indicadas"],
      requirements: ["Cámara propia", "Estado físico básico"],
      equipment: ["Trípode", "Ropa de abrigo", "Filtros ND"],
      status: "OPEN",
      template: "EDITORIAL",
      publishedAt: now,
      whatsappMessage: "Hola, quiero información sobre la Expedición Fotográfica de Otoño.",
      leadGuideId: martin.id,
      itinerary: {
        create: [
          { dayNumber: 1, title: "Llegada y primera luz", accommodation: "Hostería" },
          { dayNumber: 2, title: "Lagos y reflejos", distanceKm: 8, accommodation: "Hostería" },
          { dayNumber: 3, title: "Bosques de lenga", distanceKm: 10, accommodation: "Refugio" },
          { dayNumber: 4, title: "Amanecer en el mirador", distanceKm: 6, accommodation: "Hostería" },
          { dayNumber: 5, title: "Cierre y revisión de material" },
        ],
      },
    },
  });

  // Un borrador (no debe verse en el público)
  await prisma.expedition.create({
    data: {
      slug: "ascension-andes-invierno",
      name: "Ascensión de Invierno (en preparación)",
      shortDescription: "Programa en armado para la próxima temporada.",
      coverImage: IMG.noche,
      destinationId: andes.id,
      country: "Argentina",
      region: "Mendoza",
      difficulty: "EXTREME",
      activityType: "MOUNTAINEERING",
      capacity: 6,
      price: 2900,
      currency: "USD",
      status: "DRAFT",
      template: "CINEMATIC",
      leadGuideId: sofia.id,
    },
  });

  // ── Consultas demo (embudo CRM) ──────────────────────────
  const firstExp = await prisma.expedition.findUnique({
    where: { slug: "travesia-glaciar-patagonia" },
  });
  if (firstExp) {
    await prisma.contactInquiry.createMany({
      data: [
        { name: "Lucía Fernández", email: "lucia@example.com", phone: "+54 9 11 5555 1111", message: "Hola, ¿quedan cupos para la travesía?", status: "PENDING", source: "expedition", expeditionId: firstExp.id },
        { name: "Diego Paz", email: "diego@example.com", message: "Quiero saber el nivel requerido.", status: "CONTACTED", source: "expedition", expeditionId: firstExp.id },
      ],
    });
    await prisma.expedition.update({
      where: { id: firstExp.id },
      data: { inquiryCount: 2 },
    });
  }

  console.log("✓ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
