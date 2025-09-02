// Normalisera till en enhetlig modell
export function toModel(rec) {
  const iso = (d) => (d ? new Date(d).toISOString().slice(0, 19).replace('T',' ') : null);
  const model = {
    filename: rec.filename,
    path: rec.path,
    mimeType: rec.mimeType || null,
    size_bytes: rec.size ?? null,
    createdAt: iso(rec.createdAt),
    modifiedAt: iso(rec.modifiedAt),
    latitude: rec.latitude ?? null,
    longitude: rec.longitude ?? null,
    // Lägg “övrigt” i JSON-fältet
    meta: {}
  };

  // Plocka in exif/audio/pdf (utan att spränga kolumnerna)
  if (rec.exif) model.meta.exif = rec.exif;
  if (rec.audio) model.meta.audio = rec.audio;
  if (rec.pdf)   model.meta.pdf = rec.pdf;

  return model;
}

export function transformAll(records) {
  return records.map(toModel);
}
