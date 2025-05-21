import { SignInButton } from '@clerk/nextjs';
import { LogIn } from 'lucide-react';

export const LoginMessage = () => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
    <p className="text-yellow-800 mb-4">Necesitas iniciar sesión para ver tu token JWT</p>
    <SignInButton mode="modal">
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
        <LogIn size={16} />
        Iniciar Sesión
      </button>
    </SignInButton>
  </div>
); 