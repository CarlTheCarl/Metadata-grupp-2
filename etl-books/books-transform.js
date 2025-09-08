// Gör om varje rad till rätt format och rätt datatyper
export function transformAll(records) {
    return records.map(rec => ({
      id: Number(rec.id),
      book_title: rec.book_title,
      author_first_name: rec.author_first_name,
      author_last_name: rec.author_last_name,
      isbn: rec.isbn,
      type: rec.type,
      number_of_pages: Number(rec.number_of_pages),
      revision_number: Number(rec.revision_number),
      number_of_lends: Number(rec.number_of_lends),
      release_date: new Date(rec.release_date).toISOString().split('T')[0],
      genre: rec.genre
    }));
  }