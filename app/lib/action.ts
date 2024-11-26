import {db} from '@/app/lib/db';
import { Intervenants } from '@/app/lib/types';

const ITEMS_PER_PAGE = 10;

export async function deleteInterveant(id: number): Promise<void> {
    try {
        const client = await db.connect();
        await client.query('DELETE FROM public.intervenants WHERE id = $1', [id]);
        client.release();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

