import {db} from '@/app/lib/db';
import {Intervenant, Books} from '@/app/lib/types';

const ITEMS_PER_PAGE = 10;

export default async function fetchBooks(): Promise<Books[]> {
    try {
        const client = await db.connect();
        const result = await client.query('SELECT * FROM public.books ORDER BY id DESC');
        const data = result.rows as Books[];
        client.release();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }

}

export async function fetchFilteredBooks(query: string, currentPage: number): Promise<Books[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT *
      FROM public.books
      WHERE
        title ILIKE $1 OR
        author ILIKE $1
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);
    const data = result.rows as Books[];
    client.release();
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Erreur lors de la récupération des livres.');
  }
}

export async function fetchBookPages(query: string): Promise<number> {
    try {
      const client = await db.connect();
      const result = await client.query(`
        SELECT COUNT(*)
        FROM public.books
        WHERE
          title ILIKE $1 OR
          author ILIKE $1
      `, [`%${query}%`]);
      client.release();
      const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Erreur lors de la récupération des livres.');
    }
  }

  export async function fetchBookById(id: string) {
    try {
      const client = await db.connect();
      const result = await client.query('SELECT * FROM public.books WHERE id = $1', [id]);
      const data = result.rows[0] as Books;
      client.release();
      console.log(data);
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Erreur lors de la récupération du livre.');
    }
  }

//   export async function fetchIntervenantByKey(key:string) {
//     try {
//       const client = await db.connect();
//       const result = await client.query('SELECT * FROM public.intervenants WHERE key = $1', [key]);
//       const data = result.rows[0] as Intervenant;
//       client.release();
//       return data;
//     } catch (err) {
//       console.error('Database Error:', err);
//       throw new Error('Erreur lors de la récupération de l\'intervenant.');
//     }
//   }

