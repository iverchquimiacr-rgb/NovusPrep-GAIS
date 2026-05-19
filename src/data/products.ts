export interface Product {
  id: number;
  nombre: string;
  precio: number;
  link: string;
  descripcion: string;
  vendible: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    nombre: "General",
    precio: 50,
    link: "https://drive.google.com/drive/folders/1o5hadWv2pt8ZHETlTOHH1gYXzZaItKMz?usp=sharing",
    descripcion: "Conjunto de todas las demás carpetas con todo lo que contienen. Ideal para tener todo listo para estudiar.",
    vendible: true
  },
  {
    id: 2,
    nombre: "Anual",
    precio: 15,
    link: "https://drive.google.com/drive/folders/1_5aho-R87aDUrysHZyXKhcXJeXLqOMnP?usp=sharing",
    descripcion: "Lo mejor si buscas una base amplia en la mayoría de cursos. Ideal para tener teoría y luego pasarte a la práctica.",
    vendible: true
  },
  {
    id: 3,
    nombre: "Ciclo repaso",
    precio: 8,
    link: "https://drive.google.com/drive/folders/11yW7_PkDaDH0wgnuQO3Yh9p7iU9DSNGi?usp=sharing",
    descripcion: "Prácticas de diferentes cursos. Ideal si lo que buscas es prácticas, no teoría. Funciona bien en conjunto con el Ciclo Ceprunsa Quintos.",
    vendible: true
  },
  {
    id: 4,
    nombre: "Ciclo verano",
    precio: 9,
    link: "https://drive.google.com/drive/folders/1EEfTK6QUryhapcsQoki1KKRRCgHGDJXp?usp=sharing",
    descripcion: "Fotos de las 3 áreas del ciclo de verano. Ideal si quieres tener una base de lo importante en todos los cursos, aunque no hay tanta teoría como en el anual.",
    vendible: true
  },
  {
    id: 5,
    nombre: "Exámenes de admisión",
    precio: 7,
    link: "https://drive.google.com/drive/folders/15ZXP88JEOd_OaYkEiZJvpcS32AATfAN3",
    descripcion: "Exámenes de diferentes universidades. Algunos cuentan con resolución. Ideal para ponerte a prueba y comprobar qué temas son los que más vienen.",
    vendible: true
  },
  {
    id: 6,
    nombre: "Libros",
    precio: 15,
    link: "https://drive.google.com/drive/folders/1Y5-enVuNpStITufwUxZj4GIfIVrR3jGG",
    descripcion: "Libros en PDF para aprender. Sus autores los desarrollaron con la información clave y directa para asegurar tu ingreso.",
    vendible: true
  },
  {
    id: 7,
    nombre: "Tomos ceprunsa",
    precio: 5,
    link: "https://drive.google.com/drive/folders/10Lcb4bobnUeJGLNBJ1eevXKkDQHj9LX9",
    descripcion: "Tomos de la UNSA para sacar buena base con la información que da la misma universidad. Ideal si te preparas para un ceprunsa o un ceprequintos.",
    vendible: true
  },
  {
    id: 8,
    nombre: "Resúmenes",
    precio: 8,
    link: "", // You'll need to set the actual link later
    descripcion: "(Aún en construcción) Resúmenes de diferentes cursos. Ideal para ver los trucos de algunos profesores.",
    vendible: true
  },
  {
    id: 9,
    nombre: "Ciclo ceprequintos",
    precio: 8,
    link: "https://drive.google.com/drive/folders/1RcT3AD1x5y-bU5fPvpkOdej5d8-4IX1F?usp=sharing",
    descripcion: "Lo mejor para tener una buena base que va directamente a lo importante. Se complementa con las prácticas del Ciclo repaso.",
    vendible: true
  }
];

export interface Plan {
  id: 'Semanal' | 'Mensual' | 'General' | 'Personalizado';
  name: string;
  price: number;
  features: string[];
}

export const PLANS: Plan[] = [
  { 
    id: 'Semanal', 
    name: 'Plan Semanal', 
    price: 2.00, 
    features: ['Acceso a todas las carpetas', 'Duración de 7 días', 'Actualizaciones en tiempo real'] 
  },
  { 
    id: 'Mensual', 
    name: 'Plan Mensual', 
    price: 6.00, 
    features: ['Acceso a todas las carpetas', 'Duración de 30 días', 'Actualizaciones en tiempo real'] 
  },
  { 
    id: 'General', 
    name: 'Plan General', 
    price: 50.00, 
    features: ['Acceso de por vida a todas las carpetas', 'Pago único', 'Ahorro un 33%'] 
  },
  { 
    id: 'Personalizado', 
    name: 'Pago Único (Por Carpetas)', 
    price: 0, 
    features: ['Elige de 1 a 4 carpetas específicas', 'Acceso de por vida', 'Pago único'] 
  }
];
