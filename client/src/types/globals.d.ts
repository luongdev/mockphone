// types/global.d.ts

declare namespace Store {
  const registered: boolean;
  interface Agent {
    extension: string;
    domain: string;
    password: string;
    proxy: string;
  }
}

export {};
