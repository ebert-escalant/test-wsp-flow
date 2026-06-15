# WhatsApp Flow — Clínica 🏥

Endpoint para agendamiento de citas médicas vía WhatsApp Flows.

## Estructura

```
src/
├── index.js          # Servidor Express + router de acciones
├── crypto/
│   └── flow.js       # Descifrado/cifrado AES+RSA de Meta
├── handlers/
│   └── flow.js       # Lógica: INIT, data_exchange
└── mock/
    └── clinica.js    # Datos mock — reemplazar con BD real
flow.json             # JSON del Flow para subir a WhatsApp Manager
```

---

## Deploy en Render

### 1. Crear repo en GitHub
Sube este proyecto a un repositorio GitHub.

### 2. Crear Web Service en Render
- New → Web Service
- Conecta tu repo
- **Runtime:** Node
- **Build command:** `npm install`
- **Start command:** `npm start`

### 3. Generar par de claves RSA
Corre esto en tu terminal:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 4. Configurar variable de entorno en Render
- En tu servicio Render → Environment → Add Environment Variable
- Key: `PRIVATE_KEY`
- Value: el contenido de `private.pem` (copia todo incluyendo `-----BEGIN...-----END-----`)

### 5. Subir clave pública a WhatsApp Manager
- WhatsApp Manager → Account Tools → WhatsApp Flows
- Selecciona tu Flow → Settings → Upload Public Key
- Sube el archivo `public.pem`

---

## Configurar el Flow en WhatsApp Manager

### 1. Crear el Flow
- WhatsApp Manager → Flows → Create Flow
- Nombre: "Agendar Cita"
- Categoría: Appointment Booking
- Pega el contenido de `flow.json`

### 2. Configurar el endpoint
- En tu Flow → Edit → Endpoint URL
- Pon: `https://TU-SERVICIO.onrender.com/flow`

### 3. Publicar
- Save → Publish

---

## Flujo de acciones

| Action | Cuándo ocurre | Qué devuelves |
|--------|--------------|---------------|
| `INIT` | Usuario abre el Flow | Especialidades + fechas disponibles |
| `data_exchange` (trigger: department_selected) | Elige especialidad | Habilita fechas |
| `data_exchange` (trigger: date_selected) | Elige fecha | Habilita horarios según especialidad |
| `data_exchange` (con datos de paciente) | Llena sus datos y da "Ver resumen" | Pantalla SUMMARY con resumen |
| `complete` | Confirma la cita | — (webhook de tu WABA) |

---

## Próximos pasos

- [ ] Reemplazar `src/mock/clinica.js` con queries reales a tu BD
- [ ] En `saveCita()` del handler, hacer INSERT a la tabla de citas
- [ ] Enviar mensaje de confirmación al paciente vía API de WhatsApp tras el `complete`
