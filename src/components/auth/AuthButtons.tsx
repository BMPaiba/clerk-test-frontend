import { SignInButton, SignOutButton } from '@clerk/nextjs';
import { LogIn, LogOut } from 'lucide-react';

interface AuthButtonsProps {
  isSignedIn: boolean | undefined;
}

export const AuthButtons = ({ isSignedIn }: AuthButtonsProps) => {
  if (isSignedIn) {
    return (
      <SignOutButton>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </SignOutButton>
    );
  }

  return (
    <SignInButton mode="modal">
      <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
        <LogIn size={16} />
        Iniciar Sesión
      </button>
    </SignInButton>
  );
}; 