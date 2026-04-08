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
    descripcion: "Drive completo (conjunto de todas las demás carpetas) con todas las fotos y material adicional. Ideal para tener todo listo para estudiar.",
    vendible: true
  },
  {
    id: 2,
    nombre: "Anual",
    precio: 15,
    link: "https://drive.google.com/drive/folders/1_5aho-R87aDUrysHZyXKhcXJeXLqOMnP?usp=sharing",
    descripcion: "Fotos del anual turno tarde y prácticas físicas. Ideal para sacar una buena base en todos los cursos.",
    vendible: true
  },
  {
    id: 3,
    nombre: "Ciclo repaso",
    precio: 7,
    link: "https://drive.google.com/drive/folders/11yW7_PkDaDH0wgnuQO3Yh9p7iU9DSNGi?usp=sharing",
    descripcion: "Prácticas de diferentes cursos. Ideal si lo que buscas prácticas, no teoría.",
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
    precio: 8,
    link: "https://drive.google.com/drive/folders/15ZXP88JEOd_OaYkEiZJvpcS32AATfAN3",
    descripcion: "Exámenes de admisión. Algunos cuentan con resolución. Ideal para hacer simulacros y ver qué temas son los que más vienen usualmente.",
    vendible: true
  },
  {
    id: 6,
    nombre: "Libros",
    precio: 15,
    link: "https://drive.google.com/drive/folders/1Y5-enVuNpStITufwUxZj4GIfIVrR3jGG",
    descripcion: "Libros en PDF para aprender. Algunos son libros hechos por profesores de academia por lo que van directo al grano y con lo que necesitas para ingresar.",
    vendible: true
  },
  {
    id: 7,
    nombre: "Tomos ceprunsa",
    precio: 4,
    link: "https://drive.google.com/drive/folders/10Lcb4bobnUeJGLNBJ1eevXKkDQHj9LX9",
    descripcion: "Tomos ceprunsa para sacar buena base con la información que da la misma universidad.",
    vendible: true
  },
  {
    id: 9,
    nombre: "Ciclo ceprequintos",
    precio: 7,
    link: "https://drive.google.com/drive/folders/1RcT3AD1x5y-bU5fPvpkOdej5d8-4IX1F?usp=sharing",
    descripcion: "Pizarras de clases de todo el ciclo ceprequintos turno tarde que contiene los temas del temario actualizado de los cursos que hay en la carpeta. Ideal para estudiar basándose en los tomos. Se complementa con las prácticas del Ciclo repaso.",
    vendible: true
  },
  {
    id: 8,
    nombre: "Resumen",
    precio: 0,
    link: "https://drive.google.com/drive/folders/15wlr7KL04JqTVvMEF4xCChG7Z6eIfPrH?usp=sharing",
    descripcion: "Resumen general y GRATIS de todo el contenido disponible en el drive. Ideal para hacerte una idea de qué es lo que estás comprando.",
    vendible: false
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
    price: 1.50, 
    features: ['Acceso a todas las carpetas', 'Duración de 7 días', 'Actualizaciones en tiempo real'] 
  },
  { 
    id: 'Mensual', 
    name: 'Plan Mensual', 
    price: 5.00, 
    features: ['Acceso a todas las carpetas', 'Duración de 30 días', 'Actualizaciones en tiempo real'] 
  },
  { 
    id: 'General', 
    name: 'Plan General', 
    price: 50.00, 
    features: ['Acceso de por vida a todas las carpetas', 'Pago único', 'Ahorro de S/. 15.00'] 
  },
  { 
    id: 'Personalizado', 
    name: 'Pago Único (Por Carpetas)', 
    price: 0, 
    features: ['Elige de 1 a 4 carpetas específicas', 'Acceso de por vida', 'Pago único'] 
  }
];
