// util untuk menangani "hari" berdasarkan timezone Asia/Jakarta (UTC+7).
export function toJakartaDateIso(date = new Date()) {
  // returns YYYY-MM-DD in Asia/Jakarta
  const d = new Date(date);
  // offset in minutes for UTC+7
  const offsetMinutes = 7 * 60;
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const local = new Date(utc + offsetMinutes * 60000);
  return local.toISOString();
}

export function isSameJakartaDay(isoA, isoB) {
  if (!isoA || !isoB) return false;
  const dA = new Date(isoA);
  const dB = new Date(isoB);
  const a = toJakartaDateString(dA);
  const b = toJakartaDateString(dB);
  return a === b;
}

export function toJakartaDateString(date = new Date()) {
  const iso = toJakartaDateIso(date);
  return iso.slice(0, 10); // YYYY-MM-DD
}

export function isYesterdayJakarta(iso) {
  if (!iso) return false;
  const targetDay = new Date(iso);
  // get Jakarta day for target and for now
  const todayStr = toJakartaDateString(new Date());
  const targetStr = toJakartaDateString(targetDay);

  const today = new Date(toJakartaDateIso());
  const yesterday = new Date(toJakartaDateIso());
  yesterday.setDate(yesterday.getDate() - 1);

  return targetStr === toJakartaDateString(yesterday);
}
