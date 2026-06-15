// mock/clinica.js
// Simula la base de datos de la clínica
// Reemplaza esto con tus queries reales cuando tengas el backend

const SPECIALTIES = [
  { id: "medicina_general", title: "Medicina General" },
  { id: "pediatria", title: "Pediatría" },
  { id: "ginecologia", title: "Ginecología" },
  { id: "traumatologia", title: "Traumatología" },
  { id: "dermatologia", title: "Dermatología" },
  { id: "cardiologia", title: "Cardiología" },
];

// Horarios disponibles por especialidad
// En producción esto vendría de tu BD según disponibilidad real
const SCHEDULES = {
  medicina_general: [
    { id: "08:00", title: "08:00 am" },
    { id: "09:00", title: "09:00 am" },
    { id: "10:00", title: "10:00 am" },
    { id: "11:00", title: "11:00 am" },
    { id: "15:00", title: "03:00 pm" },
    { id: "16:00", title: "04:00 pm" },
  ],
  pediatria: [
    { id: "08:30", title: "08:30 am" },
    { id: "09:30", title: "09:30 am" },
    { id: "10:30", title: "10:30 am" },
    { id: "14:00", title: "02:00 pm" },
    { id: "15:30", title: "03:30 pm" },
  ],
  ginecologia: [
    { id: "09:00", title: "09:00 am" },
    { id: "10:00", title: "10:00 am" },
    { id: "11:00", title: "11:00 am" },
    { id: "16:00", title: "04:00 pm" },
    { id: "17:00", title: "05:00 pm" },
  ],
  traumatologia: [
    { id: "08:00", title: "08:00 am" },
    { id: "10:00", title: "10:00 am" },
    { id: "12:00", title: "12:00 pm" },
    { id: "15:00", title: "03:00 pm" },
  ],
  dermatologia: [
    { id: "09:00", title: "09:00 am" },
    { id: "10:30", title: "10:30 am" },
    { id: "14:30", title: "02:30 pm" },
    { id: "16:30", title: "04:30 pm" },
  ],
  cardiologia: [
    { id: "08:00", title: "08:00 am" },
    { id: "09:00", title: "09:00 am" },
    { id: "11:00", title: "11:00 am" },
    { id: "15:00", title: "03:00 pm" },
  ],
};

function getSpecialties() {
  return SPECIALTIES;
}

function getSchedulesBySpecialty(specialtyId) {
  return SCHEDULES[specialtyId] || SCHEDULES["medicina_general"];
}

function getSpecialtyTitle(specialtyId) {
  const found = SPECIALTIES.find((s) => s.id === specialtyId);
  return found ? found.title : specialtyId;
}

module.exports = { getSpecialties, getSchedulesBySpecialty, getSpecialtyTitle };
