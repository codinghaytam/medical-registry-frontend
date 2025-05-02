// Role types
export type UserRole = 'ADMIN' | 'MEDECIN' | 'ETUDIANT';

// Get user role from localStorage
export const getUserRole = (): UserRole => {
  const role =(localStorage.getItem('user')===null)? "ETUDIANT":(JSON.parse(localStorage.getItem("user") ||'').user.role);
  if (role === 'ADMIN' || role === 'MEDECIN' || role === 'ETUDIANT') {
    return role as UserRole;
  }
  return 'ETUDIANT'; // Default to lowest privilege if role not found or invalid
};

// Check if user has specified access level
export const hasAccess = (requiredRole: UserRole | UserRole[]): boolean => {
  const userRole = getUserRole();
  
  // Admin has access to everything
  if (userRole === 'ADMIN') return true;
  
  // Check against array of roles
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  // Check against single role
  return userRole === requiredRole;
};

// Check if user can edit content
export const canEdit = (): boolean => {
  const role = getUserRole();
  return role === 'ADMIN' || role === 'MEDECIN';
};

// Check if user can only view content
export const canOnlyView = (): boolean => {
  return getUserRole() === 'ETUDIANT';
};

// Check if user has full access
export const hasFullAccess = (): boolean => {
  return getUserRole() === 'ADMIN';
};