import fs from 'fs/promises';
import path from 'path';
import fg from 'fast-glob';
import { fileTypeFromFile } from 'file-type';
import mime from 'mime-types';
import exifr from 'exifr';
import * as mm from 'music-metadata';
import pdfParse from 'pdf-parse';

const isImage = (mt) => (mt || '').startsWith('image/');
const isAudio = (mt) => (mt || '').startsWith('audio/');
const isPdf   = (mt) => (mt || '') === 'application/pdf';

export async function listFiles(root) {
  const patterns = [`${root.replace(/\\/g,'/')}/**/*`];
  const entries = await fg(patterns, { onlyFiles: true, dot: false });
  return entries;
}

async function baseStat(fp) {
  const s = await fs.stat(fp);
  return {
    filename: path.basename(fp),
    path: fp,
    size: s.size,
    createdAt: s.birthtime ? s.birthtime : null,
    modifiedAt: s.mtime ? s.mtime : null
  };
}

async function detectMime(fp) {
  // Försök magic-bytes först, fallback till filändelse
  const ft = await fileTypeFromFile(fp).catch(() => null);
  if (ft?.mime) return ft.mime;
  const ext = path.extname(fp);
  return mime.lookup(ext) || null;
}

// Extrahera extra metadata per typ (EXIF, audio tags, PDF-info)
async function extraMeta(fp, mimeType) {
  try {
    if (isImage(mimeType)) {
      const exif = await exifr.parse(fp, { gps: true }).catch(() => null);
      if (!exif) return {};
      const lat = exif.latitude ?? null;
      const lon = exif.longitude ?? null;
      return { latitude: lat, longitude: lon, exif };
    }
    if (isAudio(mimeType)) {
      const info = await mm.parseFile(fp).catch(() => null);
      if (!info) return {};
      return { audio: { format: info.format, common: info.common } };
    }
    if (isPdf(mimeType)) {
      const buf = await fs.readFile(fp);
      const pdf = await pdfParse(buf).catch(() => null);
      if (!pdf) return {};
      return { pdf: { info: pdf.info || {}, numPages: pdf.numPages || pdf.numpages || 0 } };
    }
  } catch {
    // svälj fel per fil
  }
  return {};
}

export async function extractOne(fp) {
  const base = await baseStat(fp);
  const mimeType = await detectMime(fp);
  const extra = await extraMeta(fp, mimeType);
  return { ...base, mimeType, ...extra };
}

export async function extractAll(root) {
  const files = await listFiles(root);
  const results = [];
  for (const fp of files) {
    try {
      const rec = await extractOne(fp);
      results.push(rec);
    } catch (e) {
      // fortsätt med nästa fil
    }
  }
  return results;
}
