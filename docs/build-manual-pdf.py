# -*- coding: utf-8 -*-
"""Genera un Manual de Usuario en PDF, elegante, para la plataforma Cumbre."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, HRFlowable, NextPageTemplate,
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_JUSTIFY, TA_CENTER

OUT = r"C:\ClaudeCode\expediciones\docs\MANUAL-USUARIO.pdf"

INK      = colors.HexColor("#1c1917")
INK_SOFT = colors.HexColor("#292524")
ACCENT   = colors.HexColor("#ea580c")
ACCENTD  = colors.HexColor("#c2410c")
PAPER    = colors.HexColor("#faf9f7")
STONE    = colors.HexColor("#78716c")
STONE2   = colors.HexColor("#57534e")
LIGHT    = colors.HexColor("#e7e5e4")
ROW      = colors.HexColor("#f5f5f4")

PAGE_W, PAGE_H = A4
LM, RM, TM, BM = 22*mm, 22*mm, 24*mm, 20*mm

# ---------- estilos ----------
def style(name, **kw):
    base = dict(fontName="Helvetica", fontSize=10.3, leading=15.5,
                textColor=INK_SOFT, spaceAfter=6, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    "h1":     style("h1", fontName="Helvetica-Bold", fontSize=17, leading=20,
                    textColor=ACCENT, spaceBefore=6, spaceAfter=2),
    "h1num":  style("h1num", fontName="Helvetica-Bold", fontSize=9, leading=11,
                    textColor=ACCENTD, spaceAfter=0),
    "h2":     style("h2", fontName="Helvetica-Bold", fontSize=12, leading=15,
                    textColor=INK, spaceBefore=12, spaceAfter=3),
    "body":   style("body", alignment=TA_JUSTIFY),
    "bullet": style("bullet", spaceAfter=3, leading=15),
    "small":  style("small", fontSize=8.5, leading=12, textColor=STONE),
    "cell":   style("cell", fontSize=9.2, leading=12.5, spaceAfter=0),
    "cellh":  style("cellh", fontSize=9.2, leading=12.5, spaceAfter=0,
                    fontName="Helvetica-Bold", textColor=colors.white),
    "cellb":  style("cellb", fontSize=9.2, leading=12.5, spaceAfter=0,
                    fontName="Helvetica-Bold", textColor=INK),
    "toc":    style("toc", fontSize=10.5, leading=20, textColor=INK_SOFT, spaceAfter=0),
    "lead":   style("lead", fontSize=11.5, leading=17, textColor=STONE2, spaceAfter=10),
}

def H1(n, text, story):
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"SECCIÓN {n}", S["h1num"]))
    story.append(Paragraph(text, S["h1"]))
    story.append(HRFlowable(width="100%", thickness=2, color=ACCENT,
                            spaceBefore=4, spaceAfter=10, lineCap="round"))

def H2(text, story):
    story.append(Paragraph(text, S["h2"]))

def P(text, story):
    story.append(Paragraph(text, S["body"]))

def UL(items, story):
    lf = ListFlowable(
        [ListItem(Paragraph(t, S["bullet"]), leftIndent=10,
                  value="•", bulletColor=ACCENT) for t in items],
        bulletType="bullet", start="•", leftIndent=12, bulletFontSize=9,
    )
    story.append(lf)
    story.append(Spacer(1, 5))

def TBL(rows, widths, story, header=True):
    data = []
    for r_i, row in enumerate(rows):
        st = S["cellh"] if (header and r_i == 0) else S["cell"]
        data.append([Paragraph(str(c), st) for c in row])
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    cmds = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, LIGHT),
    ]
    if header:
        cmds += [("BACKGROUND", (0, 0), (-1, 0), INK),
                 ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, ROW])]
    else:
        cmds += [("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, ROW])]
    t.setStyle(TableStyle(cmds))
    story.append(t)
    story.append(Spacer(1, 8))

def CALLOUT(text, story):
    t = Table([[Paragraph(text, S["cell"])]], colWidths=[PAGE_W-LM-RM])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fff7ed")),
        ("LINEBEFORE", (0, 0), (0, -1), 3, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

# ---------- portada y pie ----------
def cover(c, doc):
    c.saveState()
    c.setFillColor(INK)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(0, PAGE_H-14*mm, PAGE_W, 14*mm, fill=1, stroke=0)
    c.rect(LM, PAGE_H*0.52, 40*mm, 2.2*mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(LM, PAGE_H-9.7*mm, "CUMBRE")
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#fed7aa"))
    c.drawRightString(PAGE_W-RM, PAGE_H-9.3*mm, "Plataforma de Expediciones")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 40)
    c.drawString(LM, PAGE_H*0.40, "Manual de")
    c.drawString(LM, PAGE_H*0.40-16*mm, "Usuario")
    c.setFillColor(colors.HexColor("#d6d3d1"))
    c.setFont("Helvetica", 13)
    c.drawString(LM, PAGE_H*0.52+8*mm,
                 "Guía completa para operar el panel de administración")
    c.setFont("Helvetica", 10)
    c.setFillColor(STONE)
    c.drawString(LM, 20*mm, "Expediciones · Montañismo · Trekking · Fotografía de naturaleza")
    c.drawString(LM, 14*mm, "No requiere conocimientos técnicos")
    c.restoreState()

def footer(c, doc):
    c.saveState()
    c.setStrokeColor(LIGHT)
    c.setLineWidth(0.6)
    c.line(LM, 14*mm, PAGE_W-RM, 14*mm)
    c.setFont("Helvetica", 8)
    c.setFillColor(STONE)
    c.drawString(LM, 9*mm, "Manual de Usuario · Plataforma Cumbre")
    c.drawRightString(PAGE_W-RM, 9*mm, f"Página {doc.page-1}")
    c.restoreState()

# ---------- contenido ----------
story = [NextPageTemplate("content"), PageBreak()]

# Intro + TOC
story.append(Paragraph("Bienvenida", S["h1"]))
story.append(HRFlowable(width="100%", thickness=2, color=ACCENT, spaceBefore=4, spaceAfter=10))
P("Esta guía es para el <b>administrador del sitio</b> (el dueño o el equipo). "
  "No necesitás saber programar, ni HTML, ni bases de datos: todo se hace desde "
  "pantallas. La idea central de la plataforma es simple —", story)
CALLOUT("Vos cargás una expedición desde el panel y <b>la página pública se crea sola</b>. "
        "No hay que armar cada página a mano.", story)
story.append(Spacer(1, 6))
H2("Contenido", story)
toc = [
    "1. Conceptos básicos", "2. Cómo entrar al panel", "3. El panel por dentro (Dashboard)",
    "4. Expediciones", "5. Destinos", "6. Guías", "7. Consultas / CRM",
    "8. Imágenes, videos y multimedia", "9. WhatsApp y contacto",
    "10. Usuarios, roles y permisos", "11. Cómo se ve el sitio público",
    "12. Preguntas frecuentes", "13. Glosario",
]
for t in toc:
    story.append(Paragraph(t, S["toc"]))
story.append(PageBreak())

# 1
H1(1, "Conceptos básicos", story)
P("La plataforma tiene <b>dos caras</b>:", story)
TBL([["", "Quién la usa", "Para qué"],
     ["Sitio público", "Los visitantes", "Descubrir expediciones, ver fotos, consultar, contactar por WhatsApp"],
     ["Panel de administración", "Vos y tu equipo", "Cargar y administrar todo el contenido"]],
    [42*mm, 40*mm, PAGE_W-LM-RM-82*mm], story)
CALLOUT("<b>Regla de oro:</b> los visitantes nunca modifican el sitio. Todo lo que envía un "
        "visitante (una consulta, una inscripción) entra como <b>«Pendiente»</b> y no se publica "
        "hasta que el equipo lo revise.", story)

# 2
H1(2, "Cómo entrar al panel", story)
UL(["Entrá a la dirección del sitio y agregá <b>/admin</b> al final "
    "(por ejemplo <font face='Courier'>tu-dominio.com/admin</font>).",
    "Escribí tu <b>email</b> y <b>contraseña</b> y tocá <b>Ingresar</b>.",
    "Si es correcto, entrás al Dashboard. Para salir: botón <b>Salir</b>, arriba a la derecha."],
   story)
P("<b>¿Olvidaste la contraseña?</b> Por ahora la cambia un administrador. La recuperación por "
  "email se agrega en una etapa posterior.", story)

# 3
H1(3, "El panel por dentro (Dashboard)", story)
P("Al entrar ves el <b>resumen de la plataforma</b>: cantidad de expediciones y publicadas, "
  "próximas salidas, borradores, consultas pendientes y la actividad reciente (auditoría de "
  "quién hizo qué y cuándo).", story)
P("A la izquierda (o arriba en el celular) está el menú: <b>Dashboard, Expediciones, Destinos, "
  "Guías, Reservas, Testimonios, Estadísticas, CRM, Consultas y Configuración</b>. Arriba, "
  "<b>Ver sitio</b> abre el sitio público en otra pestaña.", story)
P("En <b>Estadísticas</b> ves las <b>visitas</b> a cada expedición (solo de visitantes, no del "
  "equipo), cuántas <b>consultas</b> e <b>inscripciones</b> generó y la <b>conversión</b> "
  "(inscripciones ÷ visitas). Sirve para saber qué expediciones atraen más.", story)

# 4
story.append(PageBreak())
H1(4, "Expediciones", story)
P("Es el módulo principal. Desde acá creás, editás y publicás cada expedición, y el sistema "
  "genera su página pública automáticamente.", story)
H2("Crear una expedición, paso a paso", story)
P("Tocá <b>+ Nueva expedición</b>. Solo el <b>nombre es obligatorio</b>; el resto se puede "
  "completar después. El formulario está dividido en secciones:", story)
UL(["<b>General:</b> nombre, slug (la URL — si lo dejás vacío se genera solo), subtítulo, "
    "actividad, dificultad, template y si es «destacada» en la home.",
    "<b>Ubicación:</b> destino, país, región y guía principal.",
    "<b>Fechas y logística:</b> inicio, fin, duración, distancia, desnivel, altitud, edad "
    "mínima y cupos.",
    "<b>Precio y reserva:</b> precio, moneda y seña.",
    "<b>Descripciones:</b> corta, completa y recomendaciones.",
    "<b>Multimedia:</b> imagen de portada, video (YouTube/Vimeo) y galería.",
    "<b>Qué incluye:</b> incluye, no incluye, requisitos y equipamiento (una línea por ítem).",
    "<b>Itinerario:</b> día a día, con «+ Agregar día».",
    "<b>SEO y contacto:</b> título y descripción para Google, y el mensaje de WhatsApp.",
    "<b>Publicación:</b> el estado (Borrador para seguir trabajando, o uno público)."],
   story)
CALLOUT("Al tocar <b>Guardar</b>, el sistema guarda la expedición, <b>crea su página pública</b> "
        "en <font face='Courier'>/expediciones/el-slug</font> y te lleva a la edición.", story)
H2("Los estados de una expedición", story)
TBL([["Estado", "¿Se ve en el sitio?", "Significado"],
     ["Borrador", "No", "La estás armando"],
     ["Programada", "No (hasta la fecha)", "Lista, todavía no visible"],
     ["Abierta", "Sí", "Publicada, inscripción abierta"],
     ["Cupos limitados", "Sí", "Publicada, quedan pocos lugares"],
     ["Completa", "Sí", "Publicada, sin cupos"],
     ["Finalizada", "Sí", "Ya ocurrió"],
     ["Cancelada", "No", "Se dio de baja"],
     ["Archivada", "No", "Guardada, fuera de vista"]],
    [34*mm, 40*mm, PAGE_W-LM-RM-74*mm], story)
H2("Publicar, previsualizar y eliminar", story)
UL(["<b>Publicar</b> la pone Abierta al instante; <b>Despublicar</b> la vuelve a Borrador; "
    "<b>Archivar</b> la saca de vista sin borrarla.",
    "<b>Ver / previsualizar</b> abre la página pública; si no está publicada, la ves con un "
    "cartel «Vista previa».",
    "<b>Eliminar</b> (Zona de peligro) es permanente. Casi siempre conviene <b>Archivar</b>."],
   story)
CALLOUT("<b>Permisos:</b> publicar requiere permiso. Si tu usuario no puede publicar, aunque "
        "elijas un estado público la expedición se guarda como Borrador (el sistema te avisa).", story)
H2("Ficha técnica y código QR", story)
P("Cada expedición publicada tiene una <b>ficha técnica lista para imprimir o guardar como "
  "PDF</b> y un <b>código QR</b> que lleva a su página. La abrís desde el botón "
  "<b>Descargar ficha técnica</b> en el sitio, o desde <b>Ficha técnica / código QR</b> en la "
  "edición. En la ficha, tocá <b>Imprimir / Guardar como PDF</b>; también podés descargar el "
  "QR en PNG o SVG para folletos y afiches.", story)

# 5
H1(5, "Destinos", story)
P("Los lugares donde operás. Agrupan expediciones y permiten a los visitantes filtrar por "
  "lugar. En <b>+ Nuevo destino</b> cargás nombre y país (obligatorios), y opcionalmente región, "
  "descripción, portada, galería y coordenadas. Cada destino tiene su página en "
  "<font face='Courier'>/destinos/el-slug</font> con sus expediciones publicadas.", story)
P("<b>Eliminar un destino</b> no borra sus expediciones: quedan sin destino asignado.", story)

# 6
H1(6, "Guías", story)
P("El perfil profesional de cada guía: foto, biografía, experiencia, certificaciones, "
  "especialidades, idiomas y redes. Cada guía tiene su página en "
  "<font face='Courier'>/guias/el-slug</font> con las expediciones que lidera o acompaña.", story)

# 7
story.append(PageBreak())
H1(7, "Consultas, Reservas y CRM", story)
P("Todo lo que un visitante envía entra acá, <b>privado para tu equipo</b> — nunca se publica "
  "en el sitio.", story)
H2("Consultas", story)
P("Cuando alguien completa el formulario de consulta, llega a <b>Consultas</b> y avanza por "
  "estados: Pendiente, Contactado, Info enviada, Cerrada (o Spam). Para avanzarla, elegí el "
  "estado y tocá <b>Actualizar</b>.", story)
H2("Reservas / Inscripciones", story)
P("En cada expedición publicada el visitante puede <b>Inscribirse</b>. Si está completa, entra "
  "a <b>lista de espera</b>. Las inscripciones llegan a <b>Reservas</b>:", story)
TBL([["Estado", "Significado"],
     ["Preinscripción", "Se anotó, falta gestionar"],
     ["Lista de espera", "La expedición estaba completa"],
     ["Confirmada", "Lugar confirmado"],
     ["Cancelada", "Dada de baja"]],
    [45*mm, PAGE_W-LM-RM-45*mm], story)
P("La inscripción es una <b>preinscripción, no un pago</b>: el equipo la revisa y confirma.", story)
H2("CRM · Contactos", story)
P("El CRM reúne a todas las personas: cada consulta e inscripción <b>crea o actualiza una ficha "
  "de contacto</b> (por email), con todo su historial junto. Cada contacto tiene una etapa del "
  "embudo comercial (Nuevo → Contactado → Info enviada → Preinscripto → Reservado → Confirmado "
  "→ Participó → Recurrente). En la ficha podés cambiar la etapa, agregar etiquetas y notas "
  "internas, y ver el historial completo. Al inscribirse, el contacto avanza solo a «Preinscripto».", story)
H2("Testimonios", story)
P("En cada expedición publicada, un visitante puede <b>dejar su testimonio</b> (nombre, "
  "valoración en estrellas y su experiencia). Entra como <b>Pendiente</b> y no se publica solo. "
  "En <b>Testimonios</b> (menú del panel) lo <b>Aprobás</b> (aparece en la expedición), lo "
  "<b>Rechazás</b> o lo <b>Archivás</b>. Solo los aprobados se muestran en el sitio.", story)

# 8
H1(8, "Imágenes, videos y multimedia", story)
P("Hoy las imágenes se cargan <b>pegando su URL</b> (la dirección web de la foto, que termine "
  "en .jpg, .png o .webp y sea pública). Los videos: pegás el enlace de YouTube o Vimeo y se "
  "muestran reproducibles. La galería admite una URL por línea.", story)
CALLOUT("La <b>subida directa de archivos</b> está preparada para Supabase Storage y se habilita "
        "cargando sus credenciales. Ahí vas a poder subir fotos desde tu computadora sin pegar URLs.", story)
P("<b>Consejo:</b> usá fotos grandes y de buena calidad (1600 px de ancho o más) para que los "
  "encabezados se vean bien.", story)

# 9
H1(9, "Configuración del sitio", story)
P("En <b>Configuración</b> (menú del panel) editás la información global del sitio, <b>sin "
  "depender de nadie</b>. Los cambios se ven al instante en el sitio público.", story)
H2("Identidad", story)
UL(["<b>Nombre del sitio</b> y <b>frase / tagline</b>.",
    "<b>Logo (URL):</b> si lo cargás, reemplaza al nombre en el encabezado; vacío muestra el nombre.",
    "<b>Color de acento:</b> el color de botones y detalles (hex, ej. #ea580c). Todo el sitio lo adopta."], story)
H2("Contacto y redes", story)
P("<b>WhatsApp</b> (formato internacional, solo números), <b>Email</b> y <b>Teléfono</b> "
  "aparecen en el pie y en la página de Contacto. Cargás también las <b>redes sociales</b> "
  "(Instagram, YouTube, Facebook, TikTok, LinkedIn, X, Vimeo). Además, cada expedición puede "
  "tener su propio <b>Mensaje de WhatsApp</b>, que se abre pre-escrito al consultar.", story)

# 10
H1(10, "Usuarios, roles y permisos", story)
P("Cada persona tiene un <b>rol</b> que define qué puede hacer. La plataforma valida los "
  "permisos <b>en el servidor</b>: no alcanza con esconder un botón, el sistema realmente "
  "impide la acción si no corresponde.", story)
TBL([["Rol", "Qué puede hacer"],
     ["Súper Admin", "Todo, sin restricciones"],
     ["Admin", "Administración general"],
     ["Editor", "Crear, editar y publicar contenido"],
     ["Moderador", "Revisar y aprobar contenido; ver consultas"],
     ["Guía", "Ver la información de sus expediciones"],
     ["Comercial", "Gestionar consultas, reservas y el embudo (CRM)"]],
    [38*mm, PAGE_W-LM-RM-38*mm], story)

# 11
story.append(PageBreak())
H1(11, "Cómo se ve el sitio público", story)
UL(["<b>Inicio:</b> portada con la expedición destacada, próximas expediciones y destinos.",
    "<b>Expediciones:</b> todas las publicadas, con filtros por actividad, dificultad, destino "
    "y buscador.",
    "<b>Detalle de expedición:</b> la página completa (portada, datos, itinerario, galería, "
    "video, incluye/no incluye, requisitos, equipamiento, guías, FAQ, precio, cupos y consulta).",
    "<b>Destinos</b> y <b>Guías:</b> listados y perfiles.",
    "<b>Contacto:</b> formulario de consulta y WhatsApp.",
    "<b>Tus páginas propias</b> (ej. /nosotros, /faq): las que crees en Páginas."], story)
P("Todo esto se arma <b>solo</b>, a partir de lo que cargás en el panel.", story)
H2("Páginas propias (Nosotros, FAQ, Filosofía…)", story)
P("En <b>Páginas</b> (menú del panel) creás páginas de contenido con su <b>propia URL</b>. "
  "Cargás título y slug (algunos nombres están reservados por el sistema), subtítulo, portada "
  "y contenido (se respetan párrafos y saltos de línea). Marcá <b>Publicada</b> para que se vea, "
  "y <b>Mostrar en el menú</b> (con un orden) para que aparezca en la navegación del sitio. "
  "Así tenés tu Nosotros o FAQ sin tocar código.", story)

# 12
H1(12, "Preguntas frecuentes", story)
faq = [
    ("Cargué una expedición pero no la veo en el sitio.",
     "Revisá su estado. Si está en Borrador, Programada, Cancelada o Archivada no se muestra. "
     "Ponela en Abierta (botón Publicar)."),
    ("¿Cómo cambio la dirección (URL) de una expedición?",
     "Editá el campo Slug. Si lo cambiás, el enlace anterior deja de funcionar."),
    ("¿Puedo trabajar una expedición sin que se vea?",
     "Sí. Dejala en Borrador y usá Ver / previsualizar."),
    ("Subí una foto y no aparece.",
     "Verificá que pegaste la URL directa de la imagen y que el enlace sea público."),
    ("¿Qué pasa con las consultas de los visitantes?",
     "Llegan a Consultas / CRM como Pendiente. Nunca se publican."),
    ("Borré algo por error.",
     "Para expediciones conviene Archivar en vez de eliminar. Hay registro de actividad y respaldos."),
]
for q, a in faq:
    story.append(Paragraph(f"<b>{q}</b>", S["h2"]))
    P(a, story)

# 13
H1(13, "Glosario", story)
gloss = [
    ("Slug", "la parte final de la dirección web (travesia-del-glaciar)."),
    ("Estado", "la situación de una expedición (Borrador, Abierta, etc.)."),
    ("Publicar", "hacer que algo se vea en el sitio público."),
    ("Destacada", "aparece primero en la portada."),
    ("CRM", "el módulo donde se gestionan consultas y reservas y su seguimiento comercial."),
    ("SEO", "cómo aparece una página en Google y al compartir el enlace."),
    ("Template", "el estilo visual de la página de una expedición."),
    ("Moderación", "revisar contenido de visitantes antes de que se vea."),
]
TBL([[f"<b>{t}</b>", d] for t, d in gloss], [32*mm, PAGE_W-LM-RM-32*mm], story, header=False)

story.append(Spacer(1, 10))
story.append(Paragraph("Cualquier duda que no esté cubierta acá, anotala y la sumamos a este manual.",
                       S["small"]))

# ---------- build ----------
doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=LM, rightMargin=RM,
                      topMargin=TM, bottomMargin=BM, title="Manual de Usuario — Cumbre",
                      author="Plataforma Cumbre")
content_frame = Frame(LM, BM, PAGE_W-LM-RM, PAGE_H-TM-BM, id="main")
cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id="cover")  # página completa (no se usa para flujo)
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[cover_frame], onPage=cover),
    PageTemplate(id="content", frames=[content_frame], onPage=footer),
])
doc.build(story)
print("OK ->", OUT)
