// Simple localStorage-based authentication for local development
// Credentials are stored encrypted in the browser

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface StoredCredential {
  email: string;
  passwordHash: string;
  displayName: string;
  createdAt: number;
}

function generateUid(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getCurrentUser(): User | null {
  const userData = localStorage.getItem('currentUser');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

export async function signUp(email: string, password: string): Promise<{ user: User; error?: string }> {
  const credentialsKey = 'userCredentials';
  const existingCredentials = localStorage.getItem(credentialsKey);
  const credentialsMap: Record<string, StoredCredential> = existingCredentials ? JSON.parse(existingCredentials) : {};

  if (credentialsMap[email]) {
    return { user: {} as User, error: 'An account with this email already exists.' };
  }

  if (password.length < 6) {
    return { user: {} as User, error: 'Password should be at least 6 characters.' };
  }

  const passwordHash = await hashPassword(password);
  const uid = generateUid();

  credentialsMap[email] = {
    email,
    passwordHash,
    displayName: email.split('@')[0],
    createdAt: Date.now(),
  };

  localStorage.setItem(credentialsKey, JSON.stringify(credentialsMap));

  const user: User = {
    uid,
    email,
    displayName: credentialsMap[email].displayName,
  };

  localStorage.setItem('currentUser', JSON.stringify(user));

  // Trigger auth state change for same-tab listeners
  notifyAuthChange();

  return { user };
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error?: string }> {
  const credentialsKey = 'userCredentials';
  const existingCredentials = localStorage.getItem(credentialsKey);

  if (!existingCredentials) {
    return { user: null, error: 'No accounts registered. Please create an account first.' };
  }

  const credentialsMap: Record<string, StoredCredential> = JSON.parse(existingCredentials);
  const credential = credentialsMap[email];

  if (!credential) {
    return { user: null, error: 'Invalid email or password.' };
  }

  const passwordHash = await hashPassword(password);

  if (passwordHash !== credential.passwordHash) {
    return { user: null, error: 'Invalid email or password.' };
  }

  const user: User = {
    uid: `user_${email}`,
    email,
    displayName: credential.displayName,
  };

  localStorage.setItem('currentUser', JSON.stringify(user));

  // Trigger auth state change for same-tab listeners
  notifyAuthChange();

  return { user };
}

export function signOut(): void {
  localStorage.removeItem('currentUser');
  notifyAuthChange();
}

// Global callbacks for auth state changes within the same tab
let authChangeCallbacks: Array<(user: User | null) => void> = [];

function notifyAuthChange() {
  const user = getCurrentUser();
  authChangeCallbacks.forEach(cb => cb(user));
}

export type Unsubscribe = () => void;

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
  // Call immediately with current state
  callback(getCurrentUser());

  // Add to global callbacks list
  authChangeCallbacks.push(callback);

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'currentUser') {
      notifyAuthChange();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  return () => {
    authChangeCallbacks = authChangeCallbacks.filter(cb => cb !== callback);
    window.removeEventListener('storage', handleStorageChange);
  };
}

// Helper to trigger auth state change after login/logout
export function triggerAuthStateChange(): void {
  notifyAuthChange();
}
