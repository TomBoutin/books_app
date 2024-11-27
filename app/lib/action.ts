"use server";

import { db } from '@/app/lib/db';
import { Intervenant } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';

const ITEMS_PER_PAGE = 10;

const CreateFormSchema = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
});

const UpdateFormSchema = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    enddate: z.string(),
});

// const CreateIntervenant = CreateFormSchema.omit({email: true})
const CreateIntervenant = CreateFormSchema;

const UpdateIntervenant = UpdateFormSchema;


export type CreateState = {
    errors?: {
        email?: string[];
        firstname?: string[];
        lastname?: string[];
        
    };
    message?: string | null;
};

export type UpdateState = {
    errors?: {
        email?: string[];
        firstname?: string[];
        lastname?: string[];
        enddate?: string[];
    };
    message?: string | null;
};


export async function createIntervenant(prevState: CreateState, formData: FormData) {
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
    const key = uuidv4();
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
        if ((error as any).code == '23505') { // PostgreSQL unique violation error code
            return {
                errors: { email: ['Cet email est déjà utilisé.'] },
                message: 'Erreur lors de la création de l\'intervenant.',
            };
        }
        return {
            message: 'Erreur lors de la création de l\'intervenant.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/intervenants');
    redirect('/dashboard/intervenants');
}


export async function updateIntervenant(
    id: string,
    prevState: UpdateState,
    formData: FormData,
  ) {
    const validatedFields = UpdateIntervenant.safeParse({
        email: formData.get('email'),
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        enddate: formData.get('enddate'),
    });
   
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs invalides. Erreur lors de la modification de l\'intervenant.',
        };
    }
   
    const { email, firstname, lastname, enddate } = validatedFields.data;
   
    try {
        const client = await db.connect();
        await client.query('UPDATE public.intervenants SET email = $1, firstname = $2, lastname = $3, enddate = $4 WHERE id = $5', [email, firstname, lastname, enddate, id]);
        client.release();
    } catch (error) {
        console.error('Database Error:', error);
        if ((error as any).code == '23505') { // PostgreSQL unique violation error code
            return {
                errors: { email: ['Cet email est déjà utilisé.'] },
                message: 'Erreur lors de la modification de l\'intervenant.',
            };
        }
        return {
            message: 'Erreur lors de la modification de l\'intervenant.',
        };
}
   
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

export async function regenerateKey(id: number): Promise<void> {
    const key = uuidv4();
    const date = new Date().toISOString().split('T')[0];
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);
    const enddateString = enddate.toISOString().split('T')[0];
    try {
        const client = await db.connect();
        await client.query('UPDATE public.intervenants SET key = $1, creationdate = $2, enddate = $3 WHERE id = $4', [key, date, enddateString, id]);
        revalidatePath('/dashboard/intervenants');
        client.release();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function regenerateAllKeys(): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const enddate = new Date();
    enddate.setMonth(enddate.getMonth() + 2);
    const enddateString = enddate.toISOString().split('T')[0];
    try {
        const client = await db.connect();
        const result = await client.query('SELECT id FROM public.intervenants');
        const intervenants = result.rows;

        for (const intervenant of intervenants) {
            const key = uuidv4();
            await client.query('UPDATE public.intervenants SET key = $1, creationdate = $2, enddate = $3 WHERE id = $4', [key, date, enddateString, intervenant.id]);
        }

        revalidatePath('/dashboard/intervenants');
        client.release();
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Email ou mot de passe incorrect.';
          default:
            return 'Une erreur est survenue.';
        }
      }
      throw error;
    }
  }
//   export async function createUser(email: string, password: string, name?: string): Promise<void> {
//     const hashedPassword = await bcrypt.hash(password, 10); // Chiffre le mot de passe avec un coût de 10
//     try {
//       const client = await db.connect();
//       await client.query(
//         'INSERT INTO public.users (email, password) VALUES ($1, $2)',
//         [email, hashedPassword]
//       );
//       client.release();
//     } catch (error) {
//       console.error('Failed to create user:', error);
//       throw new Error('Failed to create user.');
//     }
//   }