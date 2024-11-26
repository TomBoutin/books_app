import {db} from '@/app/lib/db';
import {Intervenant} from '@/app/lib/types';

const ITEMS_PER_PAGE = 10;

export default async function fetchAllIntervenant(): Promise<Intervenant[]> {
    console.log('fetching data');
    try {
        const client = await db.connect();
        console.log('connected');

        const result = await client.query('SELECT * FROM public.intervenants ORDER BY id DESC');
        const data = result.rows as Intervenant[];
        console.log('Données :', data);

        client.release();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }

}

export async function fetchFilteredIntervenant(query: string, currentPage: number): Promise<Intervenant[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT *
      FROM public.intervenants
      WHERE
        firstname ILIKE $1 OR
        lastname ILIKE $1 OR
        email ILIKE $1
      ORDER BY id DESC
      LIMIT $2 OFFSET $3
    `, [`%${query}%`, ITEMS_PER_PAGE, offset]);
    const data = result.rows as Intervenant[];
    client.release();
    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Erreur lors de la récupération des intervenants.');
  }
}


export async function fetchIntervenantPages(query: string): Promise<number> {
    try {
      const client = await db.connect();
      const result = await client.query(`
        SELECT COUNT(*)
        FROM public.intervenants
        WHERE
          firstname ILIKE $1 OR
          lastname ILIKE $1 OR
          email ILIKE $1
      `, [`%${query}%`]);
      client.release();
      const totalPages = Math.ceil(Number(result.rows[0].count) / ITEMS_PER_PAGE);
      return totalPages;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Erreur lors de la récupération des intervenants.');
    }
  }

  export async function fetchIntervenantById(id: string) {
    try {
      const client = await db.connect();
      const result = await client.query('SELECT * FROM public.intervenants WHERE id = $1', [id]);
      const data = result.rows[0] as Intervenant;
      client.release();
      return data;
    } catch (err) {
      console.error('Database Error:', err);
      throw new Error('Erreur lors de la récupération de l\'intervenant.');
    }
  }