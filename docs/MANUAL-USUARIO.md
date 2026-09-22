# Manual de Usuario — Plataforma Cumbre

Guía completa para operar la plataforma de expediciones desde el panel de administración.
Está escrita para el **administrador del sitio** (el dueño o el equipo): no necesitás saber
programar, HTML ni bases de datos. Todo se hace desde pantallas.

> **Idea central:** vos cargás una expedición desde el panel y **la página pública se crea
> sola**. No hay que "armar" cada página a mano.

---

## Índice

1. [Conceptos básicos](#1-conceptos-básicos)
2. [Cómo entrar al panel](#2-cómo-entrar-al-panel)
3. [El panel por dentro (Dashboard)](#3-el-panel-por-dentro-dashboard)
4. [Expediciones](#4-expediciones)
   - [Crear una expedición paso a paso](#41-crear-una-expedición-paso-a-paso)
   - [Los estados de una expedición](#42-los-estados-de-una-expedición)
   - [Publicar, despublicar y archivar](#43-publicar-despublicar-y-archivar)
   - [Editar y previsualizar](#44-editar-y-previsualizar)
   - [Eliminar](#45-eliminar)
5. [Destinos](#5-destinos)
6. [Guías](#6-guías)
7. [Consultas, Reservas y CRM](#7-consultas-reservas-y-crm)
8. [Imágenes, videos y multimedia](#8-imágenes-videos-y-multimedia)
9. [Configuración del sitio](#9-configuración-del-sitio-whatsapp-marca-y-contacto)
10. [Usuarios, roles y permisos](#10-usuarios-roles-y-permisos)
11. [Cómo se ve el sitio público](#11-cómo-se-ve-el-sitio-público)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)
13. [Glosario](#13-glosario)

---

## 1. Conceptos básicos

La plataforma tiene **dos caras**:

| | Quién la usa | Para qué |
|---|---|---|
| **Sitio público** (`/`) | Los visitantes | Descubrir expediciones, ver fotos, consultar, contactar por WhatsApp |
| **Panel de administración** (`/admin`) | Vos y tu equipo | Cargar y administrar todo el contenido |

**Regla de oro:** los visitantes **nunca** pueden modificar el sitio. Todo lo que un
visitante envía (una consulta, por ejemplo) entra en estado **"Pendiente"** y no aparece
publicado hasta que alguien del equipo lo revise. Todos los cambios reales pasan por el panel.

---

## 2. Cómo entrar al panel

1. Entrá a la dirección del sitio y agregá **`/admin`** al final
   (por ejemplo `https://tu-dominio.com/admin`).
2. Vas a ver la pantalla de **ingreso**. Escribí tu **email** y **contraseña**.
3. Tocá **Ingresar**.

Si las credenciales son correctas, entrás al **Dashboard**. Si te equivocás, el sistema
avisa "Email o contraseña incorrectos".

> **Cerrar sesión:** arriba a la derecha, botón **Salir**.

> **¿Olvidaste la contraseña?** Por ahora la cambia un administrador desde la base de
> usuarios. (La recuperación por email se agrega en una etapa posterior.)

---

## 3. El panel por dentro (Dashboard)

Al entrar ves el **resumen de la plataforma**:

- **Expediciones**: cuántas hay en total y cuántas están publicadas.
- **Próximas salidas**: expediciones publicadas con fecha futura.
- **Borradores**: expediciones que todavía no publicaste.
- **Consultas pendientes**: mensajes de visitantes sin atender.
- **Actividad reciente**: quién hizo qué y cuándo (auditoría).

A la izquierda (o arriba en el celular) está el **menú**:

- **Dashboard** — este resumen
- **Notificaciones** — avisos internos de consultas, inscripciones y testimonios
- **Expediciones** — el corazón del sistema
- **Calendario** — tus expediciones por fecha
- **Destinos** y **Guías** — lugares y equipo
- **Páginas** — Nosotros, FAQ y otras páginas propias
- **Reservas** — inscripciones de visitantes
- **Testimonios** — moderación de opiniones
- **Estadísticas** — rendimiento del sitio
- **CRM · Contactos** y **Consultas** — el módulo comercial
- **Usuarios** — tu equipo y sus roles
- **Textos del sitio** — todos los textos de las páginas
- **Configuración** — la identidad del sitio

Arriba de todo, **Ver sitio ↗** abre el sitio público en otra pestaña.

**Estadísticas:** en la pantalla de **Estadísticas** ves las **visitas** a cada expedición
(solo de visitantes, no del equipo), cuántas **consultas** e **inscripciones** generó, y la
**conversión** (inscripciones ÷ visitas). Sirve para saber qué expediciones atraen más.

---

## 4. Expediciones

Es el módulo principal. Desde acá creás, editás y publicás cada expedición, y el sistema
genera su página pública automáticamente.

En **Expediciones** ves una tabla con todas: nombre, **estado** (con un color), actividad,
fecha y cupos. Hacé clic en cualquiera para editarla, o en **+ Nueva expedición** para crear.

### 4.1 Crear una expedición paso a paso

Tocá **+ Nueva expedición**. Vas a ver un formulario largo dividido en secciones. **Solo el
nombre es obligatorio** — todo lo demás lo podés completar ahora o más tarde.

**General**
- **Nombre** *(obligatorio)*: el nombre de la expedición.
- **Slug (URL)**: la dirección web. Si lo dejás vacío, **se genera solo** a partir del nombre
  (por ejemplo "Travesía del Glaciar" → `travesia-del-glaciar`).
- **Subtítulo**: una frase corta que aparece bajo el título.
- **Actividad**: Trekking, Montañismo, Expedición, Fotográfica, Escalada, Travesía o Naturaleza.
- **Dificultad**: Fácil, Moderada, Difícil, Técnica o Extrema.
- **Template**: el estilo de la página pública (Cinematográfico, Editorial o Extreme).
- **Destacada en la home**: si la marcás, aparece primero en la portada del sitio.

**Ubicación**
- **Destino**: elegís uno de tus destinos (ver [sección 5](#5-destinos)).
- **País** y **Región**.
- **Guía principal**: elegís uno de tus guías (ver [sección 6](#6-guías)).

**Fechas y logística**
- **Inicio**, **Fin** y **Cierre de inscripción** (calendarios).
- **Duración** (días), **Distancia** (km), **Desnivel** (m), **Altitud máxima** (m),
  **Edad mínima**, **Cupos totales**.

**Precio y reserva**
- **Precio**, **Moneda** (USD / ARS / EUR) y **Seña / reserva**.

**Descripciones**
- **Descripción corta**: un resumen (aparece en tarjetas y buscadores).
- **Descripción completa**: el texto largo de la expedición.
- **Recomendaciones**.

**Multimedia**
- **Imagen de portada (URL)**: la foto grande del encabezado.
- **Video (YouTube / Vimeo)**: pegás el enlace y se muestra reproducible.
- **Galería**: una URL de imagen por línea.

  > Ver [sección 8](#8-imágenes-videos-y-multimedia) para saber cómo obtener las URLs.

**Qué incluye** (una línea por ítem)
- **Incluye**, **No incluye**, **Requisitos**, **Equipamiento**.

**Itinerario** (día a día)
- Tocá **+ Agregar día**. Por cada día cargás título, descripción, distancia, desnivel,
  altitud y alojamiento. Podés reordenar quitando y volviendo a agregar. Los días se numeran
  solos (Día 1, Día 2…).

**SEO y contacto**
- **Título SEO** y **Meta descripción**: cómo aparece en Google y al compartir el link.
- **Mensaje de WhatsApp**: el texto que se pre-carga cuando alguien consulta por WhatsApp.

**Publicación**
- **Estado**: dejalo en **Borrador** para seguir trabajando, o elegí uno público para que
  se vea (ver estados abajo).

Cuando termines, tocá **Guardar** (abajo a la derecha). El sistema:
1. Guarda la expedición.
2. **Crea su página pública** en `/expediciones/el-slug`.
3. Te lleva a la pantalla de edición, con el aviso "Cambios guardados".

### 4.2 Los estados de una expedición

El **estado** define si la expedición se ve en el sitio y cómo:

| Estado | ¿Se ve en el sitio? | Significado |
|---|---|---|
| **Borrador** | No | La estás armando |
| **Programada** | No (hasta la fecha) | Lista, pero todavía no visible |
| **Abierta** | **Sí** | Publicada, con inscripción abierta |
| **Cupos limitados** | **Sí** | Publicada, quedan pocos lugares |
| **Completa** | **Sí** | Publicada, sin cupos |
| **Finalizada** | **Sí** | Ya ocurrió |
| **Cancelada** | No | Se dio de baja |
| **Archivada** | No | Guardada, fuera de vista |

> Solo los estados **Abierta, Cupos limitados, Completa y Finalizada** aparecen en el sitio público.

### 4.3 Publicar, despublicar y archivar

En la pantalla de edición de una expedición, arriba, tenés botones rápidos:

- **Publicar** — la pone **Abierta** y la hace visible al instante.
- **Despublicar** — la vuelve a **Borrador** (deja de verse).
- **Archivar** — la saca de vista sin borrarla.

> **Permisos:** publicar requiere permiso. Si tu usuario no puede publicar, aunque elijas un
> estado público, la expedición se guarda como **Borrador** (el sistema te avisa). Ver
> [sección 10](#10-usuarios-roles-y-permisos).

### 4.4 Editar y previsualizar

- Para editar, entrá a la expedición desde la lista y cambiá lo que quieras. **Guardar**.
- **Ver / previsualizar ↗** (abajo, en el formulario) abre la página pública en otra pestaña.
  Si la expedición todavía **no está publicada**, igual la ves como staff, con un cartel
  amarillo **"Vista previa · esta expedición no está publicada"**. Así revisás cómo va a
  quedar antes de mostrarla.

### 4.5 Eliminar

Al final de la pantalla de edición hay una **Zona de peligro** (solo para usuarios con
permiso de eliminación). Eliminar es **permanente**. En la mayoría de los casos conviene
**Archivar** en lugar de eliminar.

### 4.6 Ficha técnica y código QR

Cada expedición publicada tiene una **ficha técnica lista para imprimir o guardar como PDF**,
y un **código QR** que lleva a su página. La encontrás:

- En el **sitio público**: botón *Descargar ficha técnica (PDF)* en la página de la expedición.
- En el **panel**: dentro de la edición de la expedición, enlace *Ficha técnica / código QR*.

En la ficha, tocá **Imprimir / Guardar como PDF** (en el diálogo de impresión, elegí "Guardar
como PDF"). También podés **descargar el QR** en PNG o SVG para folletos y afiches.

### 4.7 Calendario

En **Calendario** (menú del panel) ves tus expediciones en el calendario, mes a mes:

- Cada expedición aparece **a lo largo de todos sus días** (de la fecha de inicio a la de fin),
  con una etiqueta de color según su estado. **Tocala para editarla.**
- **Filtros** por actividad y estado, y navegación **← / Hoy / →** entre meses.
- Una **leyenda** de colores por estado.
- Debajo, la **Agenda del mes**: la lista de salidas ordenadas por fecha, con cupos y estado.

Es la vista ideal para planificar la temporada.

---

## 5. Destinos

Los destinos son los lugares donde operás (Patagonia, Andes, etc.). Sirven para agrupar
expediciones y para que los visitantes filtren y naveguen por lugar.

En **Destinos** ves la lista con cuántas expediciones tiene cada uno. Con **+ Nuevo destino**
cargás:

- **Nombre** *(obligatorio)* y **País** *(obligatorio)*.
- **Slug** (se genera solo si lo dejás vacío).
- **Región**, **Descripción**, **Imagen de portada (URL)**, **Galería** y **Coordenadas**
  (latitud/longitud).

Cada destino tiene su propia página pública en `/destinos/el-slug`, que muestra su
descripción, galería y **todas sus expediciones publicadas**.

> **Eliminar un destino** no borra sus expediciones: quedan sin destino asignado.

---

## 6. Guías

El perfil profesional de cada guía de tu equipo.

En **Guías**, con **+ Nuevo guía** cargás:

- **Nombre** *(obligatorio)*.
- **Foto (URL)**, **Biografía**, **Experiencia**.
- **Certificaciones** (una por línea).
- **Especialidades** e **Idiomas** (separados por coma).
- **Redes**: Instagram, YouTube, Facebook, Sitio web.

Cada guía tiene su página pública en `/guias/el-slug` con su perfil y **las expediciones que
lidera o acompaña**. En la ficha de cada expedición aparece el guía asignado.

> **Eliminar un guía** no borra sus expediciones: quedan sin ese guía asignado.

---

## 7. Consultas, Reservas y CRM

Todo lo que un visitante envía entra acá, **privado para tu equipo** — nunca se publica en el sitio.

### 7.1 Consultas

Cuando alguien completa el formulario de **consulta** (en una expedición o en Contacto), el
mensaje llega a **Consultas**. Cada una avanza por estados: **Pendiente → Contactado → Info
enviada → Cerrada** (o **Spam**). Para avanzarla: elegí el nuevo estado y tocá **Actualizar**.

### 7.2 Reservas / Inscripciones

En la página de cada expedición publicada, el visitante puede **Inscribirse**. Si la expedición
está **completa**, la inscripción entra a **lista de espera**. Las inscripciones llegan a
**Reservas** con estos estados:

| Estado | Significado |
|---|---|
| **Preinscripción** | Se anotó, falta gestionar |
| **Lista de espera** | La expedición estaba completa |
| **Confirmada** | Lugar confirmado |
| **Cancelada** | Dada de baja |

Cada inscripción trae nombre, contacto, país/ciudad, contacto de emergencia, experiencia y
observaciones. La inscripción es una **preinscripción, no un pago**: el equipo la revisa y
confirma.

### 7.3 CRM · Contactos

El módulo **CRM** reúne automáticamente a todas las personas: cada consulta e inscripción
**crea o actualiza una ficha de contacto** (identificada por email). Así ves a cada persona
una sola vez, con todo su historial junto.

Cada contacto tiene una **etapa del embudo comercial**:

| Etapa | Significado |
|---|---|
| **Nuevo** | Interesado que recién apareció |
| **Contactado** | Ya te comunicaste |
| **Info enviada** | Le mandaste la información |
| **Preinscripto** | Se inscribió a una expedición |
| **Reservado** | Reserva en curso |
| **Confirmado** | Confirmó su lugar |
| **Participó** | Ya hizo una expedición |
| **Recurrente** | Cliente que vuelve |
| **Perdido** | Descartado |

En la **ficha de un contacto** podés: cambiar su etapa, agregar **etiquetas** y **notas
internas**, y ver su **historial** completo (consultas, inscripciones y notas, en orden). Al
inscribirse, el contacto avanza solo a «Preinscripto».

### 7.4 Testimonios

En cada expedición publicada, un visitante puede **dejar su testimonio** (nombre, valoración
en estrellas y su experiencia). Entra siempre como **Pendiente** y **no se publica solo**.

En **Testimonios** (menú del panel) los revisás y decidís: **Aprobar** (aparece en la página de
la expedición), **Rechazar** o **Archivar**. Solo los aprobados se muestran en el sitio.

> El Dashboard te muestra los contadores de **Consultas pendientes**, **Inscripciones
> pendientes**, **Testimonios a revisar** y **Contactos** para saber qué falta atender.

### 7.5 Notificaciones internas (Avisos)

Cada vez que un visitante **manda una consulta**, se **inscribe** a una expedición o **deja un
testimonio**, se genera un **aviso interno** que queda guardado **dentro de la plataforma**. No
depende de ningún correo ni servicio externo: todo se ve desde el panel.

- En la **campana** (arriba a la derecha del panel) aparece un **número rojo** con la cantidad
  de avisos **sin leer**.
- Tocando la campana, o desde **Notificaciones** en el menú, entrás al listado completo.
- Cada aviso indica el **tipo** (Consulta, Inscripción o Testimonio), un texto corto y la
  **fecha y hora**. Con **«Ver detalle →»** vas directo a la consulta/reserva/testimonio.
- Podés **marcar una como leída** o **«Marcar todas como leídas»** de una sola vez.

> Los avisos son un recordatorio. La gestión real (responder, cambiar estado, moderar) se sigue
> haciendo en **Consultas**, **Reservas** y **Testimonios**.

---

## 8. Imágenes, videos y multimedia

La **galería** de cada expedición (y de cada destino) **mezcla fotos y videos**, y todo se ve
**en pantalla completa**: el visitante toca una foto o video y se abre grande, con flechas para
pasar al siguiente.

Tenés **tres formas** de agregar contenido a la galería:

- **Subir una foto desde tu computadora**: con el botón **Subir foto** (debajo del campo
  Galería). Se sube sola y su link queda agregado. Podés subir varias a la vez.
- **Link de fotos en la nube**: pegá la dirección directa de una imagen (que termine en `.jpg`,
  `.png`, `.webp`) de Google Drive (enlace público), Cloudinary, etc.
- **Video o Reel de YouTube / Vimeo**: pegá el enlace del video
  (`https://youtube.com/watch?v=...`) y aparece con un botón de play; al tocarlo se reproduce en
  pantalla completa.

En el campo **Galería** va **una URL por línea**, y podés **mezclar** fotos y videos en el
orden que quieras.

**Consejo:** usá fotos grandes y de buena calidad (idealmente 1600 px de ancho o más) para
que se vean bien en pantalla completa.

---

## 9. Configuración del sitio (WhatsApp, marca y contacto)

En **Configuración** (en el menú del panel) editás la información global del sitio, **sin
depender de nadie**. Los cambios se ven al instante en el sitio público.

**Identidad**
- **Nombre del sitio** y **frase / tagline**.
- **Logo (URL)**: si lo cargás, reemplaza al nombre en el encabezado; si lo dejás vacío, se
  muestra el nombre.
- **Color de acento**: el color de los botones y detalles (en formato hex, ej. `#ea580c`).
  Al guardarlo, todo el sitio adopta ese color.
- **Tipografía de los títulos**: elegís entre **4 estilos** para todos los títulos del sitio —
  *Editorial* (serif elegante), *Aventura* (condensada deportiva), *Impacto* (títulos grandes
  tipo poster) y *Moderna* (geométrica limpia). Cambiás y ves el resultado al instante.

**Contacto** (aparece en el pie y en la página de Contacto)
- **WhatsApp** en formato internacional, solo números (ej. `5491100000000`).
- **Email** y **Teléfono**.

**Redes sociales**
- Instagram, YouTube, Facebook, TikTok, LinkedIn, X y Vimeo: pegás la URL de las que uses y
  aparecen en el pie del sitio.

**Textos de la home**
- El **título** y **subtítulo** de la sección de expediciones de la portada.
- El **título, texto y botón** del llamado a la acción del final de la home.
- Si dejás un texto vacío, se usa el que viene por defecto.

**Diferenciales y reseñas (home)**
- Una banda **«por qué elegirnos»** con un título y una lista de diferenciales (uno por línea,
  ej. *Guías profesionales*, *+8 años en montaña*). Aparece en la home solo si la cargás.
- Un **sello de reseñas** para el hero (ej. *★ 5.0 · +140 reseñas en Google*), con un link opcional.

**WhatsApp flotante**
- Si cargaste el **número de WhatsApp**, aparece un **botón verde flotante** en todo el sitio para
  que el visitante te escriba con un toque.

**Textos del sitio** (menú **Textos del sitio**)
- Ahí editás **todos los demás textos** de las páginas: los títulos y subtítulos de
  **Expediciones, Destinos, Guías, Comunidad y Contacto**, y hasta los **rótulos de las
  secciones** de la ficha de una expedición (Itinerario, Galería, Incluye, Requisitos,
  Testimonios, etc.).
- Cada campo muestra el texto por defecto como sugerencia; si lo dejás vacío, se usa ese.

> **Todo se edita sin tocar código.** Además, en cada expedición podés definir su propio
> **Mensaje de WhatsApp**: cuando un visitante toca *Consultar por WhatsApp*, se abre con ese
> texto ya escrito, identificando la expedición.

---

## 10. Usuarios, roles y permisos

Cada persona del equipo tiene un **rol** que define qué puede hacer. La plataforma valida los
permisos **en el servidor**: no alcanza con esconder un botón, el sistema realmente impide la
acción si no corresponde.

| Rol | Qué puede hacer |
|---|---|
| **Súper Admin** | Todo, sin restricciones |
| **Admin** | Administración general |
| **Editor** | Crear, editar y publicar contenido (expediciones, destinos, guías) |
| **Moderador** | Revisar y aprobar contenido; ver consultas |
| **Guía** | Ver la información de sus expediciones |
| **Comercial** | Gestionar consultas y el embudo (CRM) |

Además de los roles, se pueden dar **permisos puntuales** a un usuario específico.

### 10.1 Gestión de usuarios

En **Usuarios** (menú del panel, solo para administradores) das de alta a tu equipo:

- **+ Nuevo usuario**: email, nombre, **rol** y una **contraseña inicial** (mínimo 8
  caracteres) que le pasás a la persona.
- En cada usuario podés **cambiar su rol**, **activarlo/desactivarlo** (un usuario inactivo no
  puede ingresar) y **cambiarle la contraseña**.
- Por seguridad, **no podés cambiar tu propio rol ni desactivarte** a vos mismo (para no quedar
  afuera del sistema).

---

## 11. Cómo se ve el sitio público

Lo que ve un visitante:

- **Inicio** (`/`): portada con la expedición destacada, próximas expediciones y destinos.
- **Expediciones** (`/expediciones`): todas las publicadas, con **filtros** por actividad,
  dificultad, destino y **buscador**.
- **Fechas** (`/fechas`): las próximas salidas **agrupadas por mes**, con fecha, dificultad,
  cupos y botón de inscripción. Se arma sola con las expediciones publicadas que tengan fecha.
- **Detalle de expedición** (`/expediciones/slug`): la página completa (portada, datos, itinerario, galería, video, incluye/no incluye, requisitos, equipamiento, guías, preguntas frecuentes, precio, cupos y formulario de consulta).
- **Destinos** (`/destinos`) y **Guías** (`/guias`): listados y perfiles.
- **Comunidad** (`/comunidad`): un muro con **todos los testimonios aprobados** de todas las
  expediciones (prueba social). Se llena solo a medida que aprobás testimonios en el panel.
- **Contacto** (`/contacto`): formulario de consulta y WhatsApp.
- **Tus páginas propias** (ej. `/nosotros`, `/faq`): las que crees en **Páginas**.

Todo esto se arma **solo**, a partir de lo que cargás en el panel.

### 11.1 Páginas propias (Nosotros, FAQ, Filosofía…)

En **Páginas** (menú del panel) creás páginas de contenido con su **propia URL**. Con
**+ Nueva página** cargás:

- **Título** *(obligatorio)* y **Slug** (la URL; si lo dejás vacío se genera solo). Algunos
  nombres están reservados por el sistema (expediciones, destinos, guías, contacto) y no se
  pueden usar.
- **Subtítulo**, **imagen de portada** y **contenido** (los párrafos y saltos de línea se
  respetan).
- **Publicada**: si no la marcás, queda como borrador (no se ve).
- **Mostrar en el menú** y **Orden**: si la marcás, aparece en el menú del sitio en la posición
  que indiques.
- **SEO**: título y descripción para Google.

Así podés tener tu página **Nosotros**, **FAQ** o la que quieras, sin tocar código.

---

## 12. Preguntas frecuentes

**Cargué una expedición pero no la veo en el sitio.**
Revisá su **estado**. Si está en *Borrador*, *Programada*, *Cancelada* o *Archivada*, no se
muestra. Ponela en **Abierta** (botón **Publicar**).

**¿Cómo cambio la dirección (URL) de una expedición?**
Editá el campo **Slug**. Si lo cambiás, el enlace anterior deja de funcionar; avisá si ya lo
habías compartido.

**¿Puedo trabajar una expedición sin que se vea?**
Sí. Dejala en **Borrador** y usá **Ver / previsualizar** para revisarla.

**Subí una foto y no aparece.**
Verificá que pegaste la **URL directa** de la imagen (que termine en `.jpg`, `.png`, `.webp`)
y que el enlace sea público.

**¿Qué pasa con las consultas de los visitantes?**
Llegan a **Consultas / CRM** como *Pendiente*. Nunca se publican. Vos las gestionás desde ahí.

**Borré algo por error.**
Para expediciones conviene **Archivar** en vez de eliminar. Si eliminaste algo importante,
consultá con el equipo técnico (hay registro de actividad y respaldos).

---

## 13. Glosario

- **Slug**: la parte final de la dirección web (`travesia-del-glaciar`).
- **Estado**: la situación de una expedición (Borrador, Abierta, etc.).
- **Publicar**: hacer que algo se vea en el sitio público.
- **Borrador**: contenido guardado pero no visible.
- **Destacada**: aparece primero en la portada.
- **CRM**: el módulo donde se gestionan las consultas y su seguimiento comercial.
- **SEO**: cómo aparece una página en Google y al compartir el enlace.
- **Template**: el estilo visual de la página de una expedición.
- **Moderación**: revisar contenido de visitantes antes de que se vea.

---

*Cualquier duda que no esté cubierta acá, anotala y la sumamos a este manual.*
