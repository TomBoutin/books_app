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

  export type IntervenantField = {
    id: string;
    name: string;
  };

  export type IntervenantForm = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    enddate: string;
  };