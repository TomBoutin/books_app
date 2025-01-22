export interface Intervenant {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    key: string;
    creationdate: string;
    enddate: string;
    availability: string | null;
  }
  export interface User {
    id: number;
    email: string;
    password: string;
    name?: string; // Ajoutez d'autres champs si nécessaire
  }
  

  export type BookField = {
    id : number;
    title: string;
  };

  export type BookForm = {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    price: number;
  };


  export interface Books {
    id: number;
    title: string;
    author: string;
    publication_year: number;
    genre: string;
    price: number;
  }