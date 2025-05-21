import { User } from 'lucide-react';

interface UserInfoProps {
  user: {
    primaryEmailAddress?: {
      emailAddress?: string;
    } | null;
  } | null | undefined;
  userRole: string | null;
}

export const UserInfo = ({ user, userRole }: UserInfoProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200">
    <div className="flex items-center gap-3 mb-2">
      <User size={20} className="text-gray-600" />
      <h2 className="text-lg font-semibold text-gray-800">Información del Usuario</h2>
    </div>
    <div className="pl-8">
      <p className="text-gray-600">
        <span className="font-medium">Email:</span>{' '}
        <span className="text-gray-800">{user?.primaryEmailAddress?.emailAddress}</span>
      </p>
      <p className="text-gray-600 mt-2">
        <span className="font-medium">Rol:</span>{' '}
        {userRole ? (
          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {userRole}
          </span>
        ) : (
          <span className="text-gray-400 italic">No asignado</span>
        )}
      </p>
    </div>
  </div>
); 