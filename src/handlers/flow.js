// handlers/flow.js
// Maneja los 3 eventos que manda Meta: INIT, data_exchange, SUBMIT

const {
  getSpecialties,
  getSchedulesBySpecialty,
  getSpecialtyTitle,
} = require("../mock/clinica");

/**
 * INIT — Se dispara cuando el usuario abre el Flow.
 * Aquí devuelves los datos iniciales de la primera pantalla.
 */
function handleInit() {
  const specialties = getSpecialties();

  // Generar fechas disponibles (próximos 14 días hábiles)
  const dates = getAvailableDates(14);

  return {
    screen: "APPOINTMENT",
    data: {
      department: specialties,
      // Location deshabilitado — clínica con una sola sede
      location: [{ id: "1", title: "Sede Principal" }],
      is_location_enabled: false,
      date: dates,
      is_date_enabled: false, // Se habilita cuando eligen especialidad
      time: [],
      is_time_enabled: false, // Se habilita cuando eligen fecha
    },
  };
}

/**
 * data_exchange — Se dispara cuando el usuario interactúa con el Flow
 * (elige una opción con on-select-action).
 * El payload.trigger indica qué campo cambió.
 */
function handleDataExchange(decryptedBody) {
  const { data } = decryptedBody;
  const trigger = data.trigger;

  // Cuando elige especialidad → habilitar fechas
  if (trigger === "department_selected") {
    const dates = getAvailableDates(14);
    return {
      screen: "APPOINTMENT",
      data: {
        department: getSpecialties(),
        location: [{ id: "1", title: "Sede Principal" }],
        is_location_enabled: false,
        date: dates,
        is_date_enabled: true,
        time: [],
        is_time_enabled: false,
      },
    };
  }

  // Cuando elige fecha → habilitar horarios según especialidad
  if (trigger === "date_selected") {
    const specialtyId = data.department;
    const times = getSchedulesBySpecialty(specialtyId);
    const dates = getAvailableDates(14);

    return {
      screen: "APPOINTMENT",
      data: {
        department: getSpecialties(),
        location: [{ id: "1", title: "Sede Principal" }],
        is_location_enabled: false,
        date: dates,
        is_date_enabled: true,
        time: times,
        is_time_enabled: true,
      },
    };
  }

  // Cuando viene del DETAILS screen con todos los datos → ir a SUMMARY
  if (data.name) {
    const specialtyTitle = getSpecialtyTitle(data.department);
    const dateFormatted = formatDate(data.date);

    return {
      screen: "SUMMARY",
      data: {
        appointment: `${specialtyTitle}\n${dateFormatted} a las ${data.time}`,
        details: `Nombre: ${data.name}\nEmail: ${data.email}\nTelefono: ${data.phone}${data.more_details ? "\n\n" + data.more_details : ""}`,
        department: data.department,
        location: data.location,
        date: data.date,
        time: data.time,
        name: data.name,
        email: data.email,
        phone: data.phone,
        more_details: data.more_details || "",
      },
    };
  }

  // Cuando confirman en SUMMARY → guardar cita
  if (trigger === undefined && data.department && data.name) {
    saveCita(data);
    return {
      screen: "SUCCESS",
      data: {},
    };
  }

  return { screen: "APPOINTMENT", data: {} };
}

/**
 * Genera fechas hábiles disponibles a partir de hoy
 */
function getAvailableDates(count) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let current = new Date(today);
  current.setDate(current.getDate() + 1); // Empezar desde mañana

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  while (dates.length < count) {
    const dayOfWeek = current.getDay();
    // Excluir domingos (0)
    if (dayOfWeek !== 0) {
      const id = current.toISOString().split("T")[0];
      const title = `${days[dayOfWeek]} ${current.getDate()} ${months[current.getMonth()]}`;
      dates.push({ id, title });
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
}

/**
 * Aquí guardas la cita — por ahora solo loguea
 * Reemplaza con tu query a la BD cuando tengas el backend
 */
function saveCita(data) {
  console.log("🗓️  Nueva cita agendada:");
  console.log(JSON.stringify(data, null, 2));
  // TODO: INSERT INTO citas ...
}

module.exports = { handleInit, handleDataExchange };
