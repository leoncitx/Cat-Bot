const countryCodes = {
  '+54': { country: 'Argentina', timeZone: 'America/Argentina/Buenos_Aires' },
  '+591': { country: 'Bolivia', timeZone: 'America/La_Paz' },
  '+56': { country: 'Chile', timeZone: 'America/Santiago' },
  '+57': { country: 'Colombia', timeZone: 'America/Bogota' },
  '+506': { country: 'Costa Rica', timeZone: 'America/Costa_Rica' },
  '+53': { country: 'Cuba', timeZone: 'America/Havana' },
  '+593': { country: 'Ecuador', timeZone: 'America/Guayaquil' },
  '+503': { country: 'El Salvador', timeZone: 'America/El_Salvador' },
  '+34': { country: 'España', timeZone: 'Europe/Madrid' },
  '+502': { country: 'Guatemala', timeZone: 'America/Guatemala' },
  '+504': { country: 'Honduras', timeZone: 'America/Tegucigalpa' },
  '+52': { country: 'México', timeZone: 'America/Mexico_City' },
  '+505': { country: 'Nicaragua', timeZone: 'America/Managua' },
  '+507': { country: 'Panamá', timeZone: 'America/Panama' },
  '+595': { country: 'Paraguay', timeZone: 'America/Asuncion' },
  '+51': { country: 'Perú', timeZone: 'America/Lima' },
  '+1': { country: 'Puerto Rico', timeZone: 'America/Puerto_Rico' },
  '+1-809': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+1-829': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+1-849': { country: 'República Dominicana', timeZone: 'America/Santo_Domingo' },
  '+598': { country: 'Uruguay', timeZone: 'America/Montevideo' },
  '+58': { country: 'Venezuela', timeZone: 'America/Caracas' }
};

const getGreeting = (hour) => {
  return hour < 12 ? 'Buenos días 🌅' : hour < 18 ? 'Buenas tardes 🌄' : 'Buenas noches 🌃';
};