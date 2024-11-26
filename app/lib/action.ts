"use server";

import { db } from '@/app/lib/db';
import { Intervenant } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const ITEMS_PER_PAGE = 10;

const FormSchema = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
});

// const CreateIntervenant = FormSchema.omit({email: true})
const CreateIntervenant = FormSchema;


export type State = {
    errors?: {
        email?: string[];
        firstname?: string[];
        lastname?: string[];
    };
    message?: string | null;
};


export async function createIntervenant(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateIntervenant.safeParse({
        email: formData.get('email'),
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs invalides. Erreur lors de la création de l\'intervenant.',
        };
    }

    // Prepare data for insertion into the database
    const { email, firstname, lastname } = validatedFields.data;
    const key = Math.random().toString(36).substring(7);
    const date = new Date().toISOString().split('T')[0];
    
    // enddate = date + 2 mois
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);
    const enddateString = enddate.toISOString().split('T')[0];

    console.log('data', email, firstname, lastname, key, date, enddateString);

    // Insert data into the database
    try {
        const client = await db.connect();
        await client.query('INSERT INTO public.intervenants(email, firstname, lastname, key, creationdate, enddate) VALUES ($1, $2, $3, $4, $5, $6)', [email, firstname, lastname, key, date, enddateString]);
        client.release();
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Erreur lors de la création de l\'intervenant.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/intervenants');
    redirect('/dashboard/intervenants');
}

export async function deleteIntervenant(id: number): Promise<void> {
    try {
        const client = await db.connect();
        await client.query('DELETE FROM public.intervenants WHERE id = $1', [id]);
        revalidatePath('/dashboard/intervenants');
        client.release();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

