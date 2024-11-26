import {db} from '@/app/lib/db';
import {Intervenants} from '@/app/lib/types';

const ITEMS_PER_PAGE = 10;

export default async function fetchAllIntervenants(): Promise<Intervenants[]> {
    console.log('fetching data');
    try {
        const client = await db.connect();
        console.log('connected');

        const result = await client.query('SELECT * FROM public.intervenants');
        const data = result.rows as Intervenants[];
        console.log('Données :', data);

        client.release();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }

}

export async function fetchFilteredIntervenants(query: string, currentPage: number): Promise<Intervenants[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT *
      FROM public.intervenants
      WHERE
        firstname ILIKE $1 OR
        lastname ILIKE $1 OR
        email ILIKE $1 OR
        key ILIKE $1
      ORDER BY creationdate DESC
      LIMIT $2 OFFSET $3
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);
    const data = result.rows as Intervenants[];
    client.release();
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch intervenants.');
  }
}


export async function fetchIntervenantsPages(query: string): Promise<number> {
    try {
      const client = await db.connect();
      const result = await client.query(`
        SELECT COUNT(*)
        FROM public.intervenants
        WHERE
          firstname ILIKE $1 OR
          lastname ILIKE $1 OR
          email ILIKE $1 OR
          key ILIKE $1
      `, [`%${query}%`]);
      client.release();
      const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Failed to fetch total number of intervenants.');
    }
  }