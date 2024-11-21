import pool from '@/app/lib/db';

const fetchAll = async () => {
    console.log('fetching data');
    try {
        const client = await pool.connect();
        console.log('connected');

        const result = await client.query('SELECT * FROM public.intervenants');
        const data = result.rows;
        console.log('Données :', data);

        client.release();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }

}

export default fetchAll;