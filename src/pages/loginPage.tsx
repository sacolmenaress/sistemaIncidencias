import React, { useState, type FormEvent, type ChangeEvent } from "react"; // ¡Tipos añadidos!
import { TEInput, TERipple } from "tw-elements-react";
import { useAuth } from "../../context/authContext";
export function LoginPage() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // ¡Tipo añadido!

  const handleSubmit = async (e: FormEvent) => { // ¡Tipo añadido!
    e.preventDefault(); 
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); 
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tu JSX (¡está perfecto!) ---
  return (
    <section className="min-h-screen bg-neutral-200 dark:bg-neutral-700">
      <div className="container mx-auto p-10">
        <div className="flex flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
          <div className="w-full">
            <div className="rounded-lg bg-white shadow-lg dark:bg-neutral-800">
              <div className="lg:flex">
                
                {/* --- Columna izquierda (Formulario) --- */}
                <div className="px-6 py-10 lg:w-6/12">
                  <div className="text-center mb-8">
                    <img
                      className="mx-auto w-60"
                      src="/images/logo.svg" 
                      alt="logo"
                    />
                    <h4 className="mt-4 text-2xl font-semibold">LC Consultores</h4>
                    <p className="text-sm text-gray-600">
                      Cada incidencia, registrada y resuelta.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <TEInput 
                      type="email" 
                      label="Email" 
                      className="mb-4"
                      value={email}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // ¡Tipo añadido!
                      required
                    />
                    
                    <TEInput 
                      type="password" 
                      label="Contraseña" 
                      className="mb-4"
                      value={password}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} // ¡Tipo añadido!
                      required
                    />

                    <div className="text-center mb-8">
                      <TERipple rippleColor="light" className="w-full">
                        <button
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full rounded-md px-6 py-2.5 text-xs font-medium uppercase text-white shadow-md transition duration-150 ease-in-out disabled:opacity-50"
                          style={{
                            background:
                              "linear-gradient(to right, #F9F5EB, #E6D6B8, #D0A05A, #B8860B)",
                          }}
                        >
                          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                      </TERipple>

                      <a href="#!" className="text-sm mt-3 block">
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                  </form>
                </div>

                {/* --- Columna derecha (Decorativa) --- */}
                <div
                  className="flex items-center justify-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                  style={{
                    backgroundImage: "url('/images/fondoLogin.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <h1 className="font-serif font-bold italic text-3xl lg:text-4xl text-white drop-shadow-md">
                      Orientados a la excelencia
                    </h1>
                    <p className="font-serif font-semibold text-lg lg:text-xl text-white drop-shadow-sm mt-2">
                      Reporta, resuelve, avanza
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}