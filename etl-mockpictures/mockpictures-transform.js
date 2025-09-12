// Rensar och formaterar varje fält
export function transformAll(records) {
    return records.map(rec => {
      return {
        filename: rec.filename.trim().replace(/"/g, ''),
        url: rec.url.trim().replace(/"/g, ''),
        filesize: Number(rec.filesize),
        picture_width: Number(rec.picture_size.trim().split('x')[0]),
        picture_height: Number(rec.picture_size.trim().split('x')[1]),
        creation_date: new Date(rec.creation_date.trim()).toISOString().split('T')[0],
        modified_date: new Date(rec.modified_date.trim()).toISOString().split('T')[0],
        gps_latitude: parseFloat(rec.gps_latitude),
        gps_longitude: parseFloat(rec.gps_longitude),
        camera_source: rec.camera_source.trim().replace(/\s+/g, ' ')
      };
    });
  }
  