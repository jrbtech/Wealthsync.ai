import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './client';
import type { User, Family, PlanType } from '$lib/types';
import { v4 as uuidv4 } from 'uuid';

const googleProvider = new GoogleAuthProvider();

export async function signUp(
  email: string,
  password: string,
  name: string,
  familyName: string
): Promise<{ user: User; family: Family }> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName: name });

  const familyId = uuidv4();
  const userId = credential.user.uid;

  // Create family document
  const family: Omit<Family, 'id'> = {
    name: familyName,
    primaryUserId: userId,
    plan: 'foundation' as PlanType,
    createdAt: new Date()
  };

  await setDoc(doc(db, 'families', familyId), {
    ...family,
    createdAt: serverTimestamp()
  });

  // Create user document
  const user: Omit<User, 'id'> = {
    email,
    name,
    role: 'primary',
    familyId,
    createdAt: new Date(),
    lastLogin: new Date()
  };

  await setDoc(doc(db, 'users', userId), {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });

  return {
    user: { ...user, id: userId },
    family: { ...family, id: familyId }
  };
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }

  // Update last login
  await setDoc(doc(db, 'users', credential.user.uid), {
    lastLogin: serverTimestamp()
  }, { merge: true });

  const userData = userDoc.data();
  return {
    id: credential.user.uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    familyId: userData.familyId,
    avatarUrl: userData.avatarUrl,
    createdAt: userData.createdAt?.toDate() || new Date(),
    lastLogin: new Date()
  };
}

export async function signInWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);

  const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

  if (userDoc.exists()) {
    // Existing user
    await setDoc(doc(db, 'users', credential.user.uid), {
      lastLogin: serverTimestamp()
    }, { merge: true });

    const userData = userDoc.data();
    return {
      id: credential.user.uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      familyId: userData.familyId,
      avatarUrl: userData.avatarUrl,
      createdAt: userData.createdAt?.toDate() || new Date(),
      lastLogin: new Date()
    };
  }

  // New user via Google - redirect to complete signup
  throw new Error('GOOGLE_NEW_USER');
}

export async function completeGoogleSignUp(
  familyName: string
): Promise<{ user: User; family: Family }> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No authenticated user');
  }

  const familyId = uuidv4();
  const userId = currentUser.uid;

  // Create family document
  const family: Omit<Family, 'id'> = {
    name: familyName,
    primaryUserId: userId,
    plan: 'foundation' as PlanType,
    createdAt: new Date()
  };

  await setDoc(doc(db, 'families', familyId), {
    ...family,
    createdAt: serverTimestamp()
  });

  // Create user document
  const user: Omit<User, 'id'> = {
    email: currentUser.email || '',
    name: currentUser.displayName || 'User',
    role: 'primary',
    familyId,
    avatarUrl: currentUser.photoURL || undefined,
    createdAt: new Date(),
    lastLogin: new Date()
  };

  await setDoc(doc(db, 'users', userId), {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });

  return {
    user: { ...user, id: userId },
    family: { ...family, id: familyId }
  };
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getCurrentUser(): Promise<User | null> {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

  if (!userDoc.exists()) {
    return null;
  }

  const userData = userDoc.data();
  return {
    id: currentUser.uid,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    familyId: userData.familyId,
    avatarUrl: userData.avatarUrl,
    createdAt: userData.createdAt?.toDate() || new Date(),
    lastLogin: userData.lastLogin?.toDate() || new Date()
  };
}

export async function inviteFamilyMember(
  email: string,
  name: string,
  familyId: string,
  invitedBy: string
): Promise<string> {
  const inviteId = uuidv4();

  await setDoc(doc(db, 'invites', inviteId), {
    email,
    name,
    familyId,
    invitedBy,
    status: 'pending',
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  return inviteId;
}

export async function acceptInvite(
  inviteId: string,
  password: string
): Promise<User> {
  const inviteDoc = await getDoc(doc(db, 'invites', inviteId));

  if (!inviteDoc.exists()) {
    throw new Error('Invite not found');
  }

  const invite = inviteDoc.data();

  if (invite.status !== 'pending') {
    throw new Error('Invite already used');
  }

  if (new Date(invite.expiresAt.toDate()) < new Date()) {
    throw new Error('Invite expired');
  }

  // Create user account
  const credential = await createUserWithEmailAndPassword(auth, invite.email, password);
  await updateProfile(credential.user, { displayName: invite.name });

  const userId = credential.user.uid;

  // Create user document
  const user: Omit<User, 'id'> = {
    email: invite.email,
    name: invite.name,
    role: 'family',
    familyId: invite.familyId,
    createdAt: new Date(),
    lastLogin: new Date()
  };

  await setDoc(doc(db, 'users', userId), {
    ...user,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });

  // Update invite status
  await setDoc(doc(db, 'invites', inviteId), {
    status: 'accepted',
    acceptedAt: serverTimestamp()
  }, { merge: true });

  return { ...user, id: userId };
}
