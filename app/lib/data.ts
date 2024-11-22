import {db} from '@/app/lib/db';
import {Intervenants} from '@/app/lib/types';


export default async function fetchAll(): Promise<Intervenants[]> {
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