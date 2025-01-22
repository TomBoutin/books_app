"use server";

import { db } from '@/app/lib/db';
import { Intervenant, Books } from '@/app/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcrypt';
import { title } from 'process';

const ITEMS_PER_PAGE = 10;

const CreateFormSchema = z.object({
    title: z.string(),
    author: z.string(),
    publication_year: z.number(),
    genre: z.string(),
    price: z.number(),
});

const UpdateFormSchema = z.object({
    title: z.string(),
    author: z.string(),
    publication_year: z.number(),
    genre: z.string(),
    price: z.number(),
});

// const CreateIntervenant = CreateFormSchema.omit({email: true})
const CreateBook = CreateFormSchema;

const UpdateBook = UpdateFormSchema;


export type CreateState = {
    errors?: {
        title?: string[];
        author?: string[];
        publication_year?: string[];
        genre?: string[];
        price?: string[];
        
    };
    message?: string | null;
};

export type UpdateState = {
    errors?: {
        title?: string[];
        author?: string[];
        publication_year?: string[];
        genre?: string[];
        price?: string[];
    };
    message?: string | null;
};


export async function createBook(prevState: CreateState, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateBook.safeParse({
        title: formData.get('title'),
        author: formData.get('author'),
        publication_year: Number(formData.get('publication_year')),
        genre: formData.get('genre'),
        price: Number(formData.get('price'))
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs invalides. Erreur lors de la création du livre.',
        };
    }

    // Prepare data for insertion into the database
    const { title, author, publication_year, genre, price } = validatedFields.data;

    // Insert data into the database
    try {
        const client = await db.connect();
        await client.query('INSERT INTO public.books (title, author, publication_year, genre, price) VALUES ($1, $2, $3, $4, $5)', [title, author, publication_year, genre, price]);
        client.release();
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Erreur lors de la création du livre.',
        };
    }

    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/books');
    redirect('/dashboard/books');
}


export async function updateBook(
    id: string,
    prevState: UpdateState,
    formData: FormData,
  ) {
    const validatedFields = UpdateBook.safeParse({
      title: formData.get('title'),
      author: formData.get('author'),
      publication_year: Number(formData.get('publication_year')),
      genre: formData.get('genre'),
      price: Number(formData.get('price'))
    });
   
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Champs invalides. Erreur lors de la modification du livre.',
        };
    }
   
    const { title, author, publication_year, genre, price } = validatedFields.data;
   
    try {
        const client = await db.connect();
        await client.query('UPDATE public.books SET title = $1, author = $2, publication_year = $3, genre = $4, price = $5 WHERE id = $6', [title, author, publication_year, genre, price, id]);
        client.release();
    } catch (error) {
        console.error('Database Error:', error);
        return {
            message: 'Erreur lors de la modification du livre.',
        };
}
   
    revalidatePath('/dashboard/books');
    redirect('/dashboard/books');
  }


export async function deleteBook(id: number): Promise<void> {
    try {
        const client = await db.connect();
        await client.query('DELETE FROM public.books WHERE id = $1', [id]);
        revalidatePath('/dashboard/books');
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

  
// export async function createBook(book: Books): Promise<void> {
//     try {
//       const client = await db.connect();
//       await client.query(
//         'INSERT INTO public.books (title, author, publication_year, genre, price) VALUES ($1, $2, $3, $4, $5)',
//         [book.title, book.author, book.publication_year, book.genre, book.price]
//       );
//       client.release();
//       revalidatePath('/dashboard/books');
//       redirect('/dashboard/books');
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   }
  
//   export async function updateBook(book: Books): Promise<void> {
//     try {
//       const client = await db.connect();
//       await client.query(
//         'UPDATE public.books SET title = $1, author = $2, publication_year = $3, genre = $4, price = $5 WHERE id = $6',
//         [book.title, book.author, book.publication_year, book.genre, book.price, book.id]
//       );
//       client.release();
//       revalidatePath('/dashboard/books');
//       redirect('/dashboard/books');

//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   }
  
//   export async function deleteBook(id: number): Promise<void> {
//     try {
//       const client = await db.connect();
//       await client.query('DELETE FROM public.books WHERE id = $1', [id]);
//       client.release();
//       revalidatePath('/dashboard/books');
//       redirect('/dashboard/books');
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   }