import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from './client';
import type {
  Advisor,
  Deadline,
  Document,
  Entity,
  Asset,
  Liability,
  Meeting,
  Activity,
  NetWorthSnapshot
} from '$lib/types';

// Helper to convert Firestore timestamps to Date
function convertTimestamps<T>(data: DocumentData): Omit<T, 'id'> {
  const result: any = { ...data };
  for (const key in result) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  }
  return result as Omit<T, 'id'>;
}

// ============ FAMILY ============

export async function updateFamily(familyId: string, data: Record<string, any>): Promise<void> {
  const docRef = doc(db, 'families', familyId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function getFamily(familyId: string): Promise<any | null> {
  const docRef = doc(db, 'families', familyId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps(snapshot.data())
  };
}

// ============ ADVISORS ============

export async function getAdvisors(familyId: string): Promise<Advisor[]> {
  const advisorsRef = collection(db, `families/${familyId}/advisors`);
  const q = query(advisorsRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Advisor>(doc.data())
  }));
}

export async function getAdvisor(familyId: string, advisorId: string): Promise<Advisor | null> {
  const docRef = doc(db, `families/${familyId}/advisors`, advisorId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Advisor>(snapshot.data())
  };
}

export async function createAdvisor(
  familyId: string,
  data: Omit<Advisor, 'id' | 'createdAt'>
): Promise<Advisor> {
  const advisorsRef = collection(db, `families/${familyId}/advisors`);

  const docRef = await addDoc(advisorsRef, {
    ...data,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateAdvisor(
  familyId: string,
  advisorId: string,
  data: Partial<Advisor>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/advisors`, advisorId);
  await updateDoc(docRef, data);
}

export async function deleteAdvisor(familyId: string, advisorId: string): Promise<void> {
  const docRef = doc(db, `families/${familyId}/advisors`, advisorId);
  await deleteDoc(docRef);
}

// ============ DEADLINES ============

export async function getDeadlines(familyId: string): Promise<Deadline[]> {
  const deadlinesRef = collection(db, `families/${familyId}/deadlines`);
  const q = query(deadlinesRef, orderBy('dueDate'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Deadline>(doc.data())
  }));
}

export async function getUpcomingDeadlines(
  familyId: string,
  count: number = 5
): Promise<Deadline[]> {
  const deadlinesRef = collection(db, `families/${familyId}/deadlines`);
  const q = query(
    deadlinesRef,
    where('status', '!=', 'completed'),
    orderBy('status'),
    orderBy('dueDate'),
    limit(count)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Deadline>(doc.data())
  }));
}

export async function createDeadline(
  familyId: string,
  data: Omit<Deadline, 'id' | 'createdAt'>
): Promise<Deadline> {
  const deadlinesRef = collection(db, `families/${familyId}/deadlines`);

  const docRef = await addDoc(deadlinesRef, {
    ...data,
    dueDate: Timestamp.fromDate(data.dueDate),
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateDeadline(
  familyId: string,
  deadlineId: string,
  data: Partial<Deadline>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/deadlines`, deadlineId);
  const updateData: any = { ...data };

  if (data.dueDate) {
    updateData.dueDate = Timestamp.fromDate(data.dueDate);
  }
  if (data.completedAt) {
    updateData.completedAt = Timestamp.fromDate(data.completedAt);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteDeadline(familyId: string, deadlineId: string): Promise<void> {
  const docRef = doc(db, `families/${familyId}/deadlines`, deadlineId);
  await deleteDoc(docRef);
}

// ============ DOCUMENTS ============

export async function getDocuments(
  familyId: string,
  folder?: string
): Promise<Document[]> {
  const documentsRef = collection(db, `families/${familyId}/documents`);

  const constraints: QueryConstraint[] = [orderBy('uploadedAt', 'desc')];
  if (folder) {
    constraints.unshift(where('folder', '==', folder));
  }

  const q = query(documentsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Document>(doc.data())
  }));
}

export async function getDocument(
  familyId: string,
  documentId: string
): Promise<Document | null> {
  const docRef = doc(db, `families/${familyId}/documents`, documentId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Document>(snapshot.data())
  };
}

export async function createDocument(
  familyId: string,
  data: Omit<Document, 'id'>
): Promise<Document> {
  const documentsRef = collection(db, `families/${familyId}/documents`);

  const docRef = await addDoc(documentsRef, {
    ...data,
    uploadedAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data
  };
}

export async function updateDocument(
  familyId: string,
  documentId: string,
  data: Partial<Document>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/documents`, documentId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(familyId: string, documentId: string): Promise<void> {
  const docRef = doc(db, `families/${familyId}/documents`, documentId);
  await deleteDoc(docRef);
}

// ============ ENTITIES & WEALTH ============

export async function getEntities(familyId: string): Promise<Entity[]> {
  const entitiesRef = collection(db, `families/${familyId}/entities`);
  const q = query(entitiesRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Entity>(doc.data())
  }));
}

export async function getEntity(familyId: string, entityId: string): Promise<Entity | null> {
  const docRef = doc(db, `families/${familyId}/entities`, entityId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Entity>(snapshot.data())
  };
}

export async function createEntity(
  familyId: string,
  data: Omit<Entity, 'id' | 'createdAt'>
): Promise<Entity> {
  const entitiesRef = collection(db, `families/${familyId}/entities`);

  const docRef = await addDoc(entitiesRef, {
    ...data,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateEntity(
  familyId: string,
  entityId: string,
  data: Partial<Entity>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities`, entityId);
  await updateDoc(docRef, data);
}

export async function deleteEntity(familyId: string, entityId: string): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities`, entityId);
  await deleteDoc(docRef);
}

// Assets
export async function getAssets(familyId: string, entityId: string): Promise<Asset[]> {
  const assetsRef = collection(db, `families/${familyId}/entities/${entityId}/assets`);
  const q = query(assetsRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Asset>(doc.data())
  }));
}

export async function createAsset(
  familyId: string,
  entityId: string,
  data: Omit<Asset, 'id'>
): Promise<Asset> {
  const assetsRef = collection(db, `families/${familyId}/entities/${entityId}/assets`);

  const docRef = await addDoc(assetsRef, {
    ...data,
    lastUpdated: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data
  };
}

export async function updateAsset(
  familyId: string,
  entityId: string,
  assetId: string,
  data: Partial<Asset>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities/${entityId}/assets`, assetId);
  await updateDoc(docRef, {
    ...data,
    lastUpdated: serverTimestamp()
  });
}

export async function deleteAsset(
  familyId: string,
  entityId: string,
  assetId: string
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities/${entityId}/assets`, assetId);
  await deleteDoc(docRef);
}

// Liabilities
export async function getLiabilities(familyId: string, entityId: string): Promise<Liability[]> {
  const liabilitiesRef = collection(db, `families/${familyId}/entities/${entityId}/liabilities`);
  const q = query(liabilitiesRef, orderBy('name'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Liability>(doc.data())
  }));
}

export async function createLiability(
  familyId: string,
  entityId: string,
  data: Omit<Liability, 'id'>
): Promise<Liability> {
  const liabilitiesRef = collection(db, `families/${familyId}/entities/${entityId}/liabilities`);

  const docRef = await addDoc(liabilitiesRef, {
    ...data,
    lastUpdated: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data
  };
}

export async function updateLiability(
  familyId: string,
  entityId: string,
  liabilityId: string,
  data: Partial<Liability>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities/${entityId}/liabilities`, liabilityId);
  await updateDoc(docRef, {
    ...data,
    lastUpdated: serverTimestamp()
  });
}

export async function deleteLiability(
  familyId: string,
  entityId: string,
  liabilityId: string
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/entities/${entityId}/liabilities`, liabilityId);
  await deleteDoc(docRef);
}

// ============ MEETINGS ============

export async function getMeetings(familyId: string): Promise<Meeting[]> {
  const meetingsRef = collection(db, `families/${familyId}/meetings`);
  const q = query(meetingsRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Meeting>(doc.data())
  }));
}

export async function getMeeting(familyId: string, meetingId: string): Promise<Meeting | null> {
  const docRef = doc(db, `families/${familyId}/meetings`, meetingId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Meeting>(snapshot.data())
  };
}

export async function createMeeting(
  familyId: string,
  data: Omit<Meeting, 'id' | 'createdAt'>
): Promise<Meeting> {
  const meetingsRef = collection(db, `families/${familyId}/meetings`);

  const docRef = await addDoc(meetingsRef, {
    ...data,
    date: Timestamp.fromDate(data.date),
    followUpDate: data.followUpDate ? Timestamp.fromDate(data.followUpDate) : null,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateMeeting(
  familyId: string,
  meetingId: string,
  data: Partial<Meeting>
): Promise<void> {
  const docRef = doc(db, `families/${familyId}/meetings`, meetingId);
  const updateData: any = { ...data };

  if (data.date) {
    updateData.date = Timestamp.fromDate(data.date);
  }
  if (data.followUpDate) {
    updateData.followUpDate = Timestamp.fromDate(data.followUpDate);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteMeeting(familyId: string, meetingId: string): Promise<void> {
  const docRef = doc(db, `families/${familyId}/meetings`, meetingId);
  await deleteDoc(docRef);
}

// ============ ACTIVITY ============

export async function getRecentActivity(
  familyId: string,
  count: number = 10
): Promise<Activity[]> {
  const activityRef = collection(db, `families/${familyId}/activity`);
  const q = query(activityRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Activity>(doc.data())
  }));
}

export async function logActivity(
  familyId: string,
  data: Omit<Activity, 'id' | 'createdAt'>
): Promise<void> {
  const activityRef = collection(db, `families/${familyId}/activity`);

  await addDoc(activityRef, {
    ...data,
    createdAt: serverTimestamp()
  });
}

// ============ SNAPSHOTS ============

export async function getNetWorthSnapshots(
  familyId: string,
  count: number = 12
): Promise<NetWorthSnapshot[]> {
  const snapshotsRef = collection(db, `families/${familyId}/snapshots`);
  const q = query(snapshotsRef, orderBy('date', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<NetWorthSnapshot>(doc.data())
  }));
}

export async function createSnapshot(
  familyId: string,
  data: Omit<NetWorthSnapshot, 'id'>
): Promise<NetWorthSnapshot> {
  const snapshotsRef = collection(db, `families/${familyId}/snapshots`);

  const docRef = await addDoc(snapshotsRef, {
    ...data,
    date: Timestamp.fromDate(data.date)
  });

  return {
    id: docRef.id,
    ...data
  };
}

// ============================================
// AgencyForge.ai Services (SEO/PPC Agency Reports)
// ============================================

import type {
  Agency,
  AgencyBranding,
  ClientProject,
  Report,
  AnalyticsData,
  AgencyActivity
} from '$lib/types';

// ============ AGENCY ============

export async function getAgency(agencyId: string): Promise<Agency | null> {
  const docRef = doc(db, 'agencies', agencyId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Agency>(snapshot.data())
  };
}

export async function updateAgency(agencyId: string, data: Partial<Agency>): Promise<void> {
  const docRef = doc(db, 'agencies', agencyId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function updateAgencyBranding(
  agencyId: string,
  branding: Partial<AgencyBranding>
): Promise<void> {
  const docRef = doc(db, 'agencies', agencyId);
  const agency = await getAgency(agencyId);

  if (!agency) throw new Error('Agency not found');

  await updateDoc(docRef, {
    branding: { ...agency.branding, ...branding },
    updatedAt: serverTimestamp()
  });
}

// ============ CLIENT PROJECTS ============

export async function getClientProjects(agencyId: string): Promise<ClientProject[]> {
  const projectsRef = collection(db, `agencies/${agencyId}/projects`);
  const q = query(projectsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<ClientProject>(doc.data())
  }));
}

export async function getActiveClientProjects(agencyId: string): Promise<ClientProject[]> {
  const projectsRef = collection(db, `agencies/${agencyId}/projects`);
  const q = query(
    projectsRef,
    where('status', '==', 'active'),
    orderBy('clientName')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<ClientProject>(doc.data())
  }));
}

export async function getClientProject(
  agencyId: string,
  projectId: string
): Promise<ClientProject | null> {
  const docRef = doc(db, `agencies/${agencyId}/projects`, projectId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<ClientProject>(snapshot.data())
  };
}

export async function createClientProject(
  agencyId: string,
  data: Omit<ClientProject, 'id' | 'createdAt'>
): Promise<ClientProject> {
  const projectsRef = collection(db, `agencies/${agencyId}/projects`);

  const docRef = await addDoc(projectsRef, {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateClientProject(
  agencyId: string,
  projectId: string,
  data: Partial<ClientProject>
): Promise<void> {
  const docRef = doc(db, `agencies/${agencyId}/projects`, projectId);
  const updateData: any = { ...data };

  if (data.startDate) {
    updateData.startDate = Timestamp.fromDate(data.startDate);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteClientProject(agencyId: string, projectId: string): Promise<void> {
  const docRef = doc(db, `agencies/${agencyId}/projects`, projectId);
  await deleteDoc(docRef);
}

// ============ REPORTS ============

export async function getReports(agencyId: string, projectId?: string): Promise<Report[]> {
  const reportsRef = collection(db, `agencies/${agencyId}/reports`);

  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (projectId) {
    constraints.unshift(where('projectId', '==', projectId));
  }

  const q = query(reportsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Report>(doc.data())
  }));
}

export async function getRecentReports(
  agencyId: string,
  count: number = 10
): Promise<Report[]> {
  const reportsRef = collection(db, `agencies/${agencyId}/reports`);
  const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<Report>(doc.data())
  }));
}

export async function getReport(agencyId: string, reportId: string): Promise<Report | null> {
  const docRef = doc(db, `agencies/${agencyId}/reports`, reportId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<Report>(snapshot.data())
  };
}

export async function createReport(
  agencyId: string,
  data: Omit<Report, 'id' | 'createdAt' | 'viewCount'>
): Promise<Report> {
  const reportsRef = collection(db, `agencies/${agencyId}/reports`);

  const docRef = await addDoc(reportsRef, {
    ...data,
    viewCount: 0,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    viewCount: 0,
    createdAt: new Date()
  };
}

export async function updateReport(
  agencyId: string,
  reportId: string,
  data: Partial<Report>
): Promise<void> {
  const docRef = doc(db, `agencies/${agencyId}/reports`, reportId);
  const updateData: any = { ...data };

  if (data.pdfGeneratedAt) {
    updateData.pdfGeneratedAt = Timestamp.fromDate(data.pdfGeneratedAt);
  }
  if (data.deliveredAt) {
    updateData.deliveredAt = Timestamp.fromDate(data.deliveredAt);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteReport(agencyId: string, reportId: string): Promise<void> {
  const docRef = doc(db, `agencies/${agencyId}/reports`, reportId);
  await deleteDoc(docRef);
}

export async function incrementReportViews(agencyId: string, reportId: string): Promise<void> {
  const report = await getReport(agencyId, reportId);
  if (!report) return;

  const docRef = doc(db, `agencies/${agencyId}/reports`, reportId);
  await updateDoc(docRef, {
    viewCount: (report.viewCount || 0) + 1
  });
}

// ============ ANALYTICS DATA ============

export async function getAnalyticsData(
  agencyId: string,
  projectId: string
): Promise<AnalyticsData[]> {
  const analyticsRef = collection(db, `agencies/${agencyId}/projects/${projectId}/analytics`);
  const q = query(analyticsRef, orderBy('uploadedAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<AnalyticsData>(doc.data())
  }));
}

export async function getLatestAnalytics(
  agencyId: string,
  projectId: string
): Promise<AnalyticsData | null> {
  const analyticsRef = collection(db, `agencies/${agencyId}/projects/${projectId}/analytics`);
  const q = query(analyticsRef, orderBy('uploadedAt', 'desc'), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...convertTimestamps<AnalyticsData>(doc.data())
  };
}

export async function createAnalyticsData(
  agencyId: string,
  projectId: string,
  data: Omit<AnalyticsData, 'id' | 'uploadedAt'>
): Promise<AnalyticsData> {
  const analyticsRef = collection(db, `agencies/${agencyId}/projects/${projectId}/analytics`);

  const docRef = await addDoc(analyticsRef, {
    ...data,
    dateRange: {
      start: Timestamp.fromDate(data.dateRange.start),
      end: Timestamp.fromDate(data.dateRange.end)
    },
    uploadedAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    uploadedAt: new Date()
  };
}

export async function deleteAnalyticsData(
  agencyId: string,
  projectId: string,
  analyticsId: string
): Promise<void> {
  const docRef = doc(db, `agencies/${agencyId}/projects/${projectId}/analytics`, analyticsId);
  await deleteDoc(docRef);
}

// ============ AGENCY ACTIVITY ============

export async function getAgencyActivity(
  agencyId: string,
  count: number = 20
): Promise<AgencyActivity[]> {
  const activityRef = collection(db, `agencies/${agencyId}/activity`);
  const q = query(activityRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<AgencyActivity>(doc.data())
  }));
}

export async function logAgencyActivity(
  agencyId: string,
  data: Omit<AgencyActivity, 'id' | 'createdAt'>
): Promise<void> {
  const activityRef = collection(db, `agencies/${agencyId}/activity`);

  await addDoc(activityRef, {
    ...data,
    createdAt: serverTimestamp()
  });
}

// ============ AGENCY STATS ============

export async function getAgencyStats(agencyId: string): Promise<{
  totalClients: number;
  activeClients: number;
  totalReports: number;
  reportsThisMonth: number;
}> {
  const [projects, reports] = await Promise.all([
    getClientProjects(agencyId),
    getReports(agencyId)
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    totalClients: projects.length,
    activeClients: projects.filter(p => p.status === 'active').length,
    totalReports: reports.length,
    reportsThisMonth: reports.filter(r => r.createdAt >= startOfMonth).length
  };
}

// ============================================
// WealthSync.ai Services - Wealth Advisor Reports
// ============================================

import type {
  WealthAdvisorFirm,
  AdvisorBranding,
  ClientProfile,
  WealthReport,
  WealthAdvisorActivity
} from '$lib/types';

// ============ WEALTH ADVISOR FIRM ============

export async function getWealthAdvisorFirm(firmId: string): Promise<WealthAdvisorFirm | null> {
  const docRef = doc(db, 'wealthAdvisorFirms', firmId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<WealthAdvisorFirm>(snapshot.data())
  };
}

export async function createWealthAdvisorFirm(
  data: Omit<WealthAdvisorFirm, 'id' | 'createdAt'>
): Promise<WealthAdvisorFirm> {
  const firmsRef = collection(db, 'wealthAdvisorFirms');

  const docRef = await addDoc(firmsRef, {
    ...data,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date()
  };
}

export async function updateWealthAdvisorFirm(
  firmId: string,
  data: Partial<WealthAdvisorFirm>
): Promise<void> {
  const docRef = doc(db, 'wealthAdvisorFirms', firmId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function updateWealthAdvisorBranding(
  firmId: string,
  branding: Partial<AdvisorBranding>
): Promise<void> {
  const docRef = doc(db, 'wealthAdvisorFirms', firmId);
  const firm = await getWealthAdvisorFirm(firmId);

  if (!firm) throw new Error('Wealth advisor firm not found');

  await updateDoc(docRef, {
    branding: { ...firm.branding, ...branding },
    updatedAt: serverTimestamp()
  });
}

// ============ CLIENT PROFILES ============

export async function getClientProfiles(firmId: string): Promise<ClientProfile[]> {
  const clientsRef = collection(db, `wealthAdvisorFirms/${firmId}/clients`);
  const q = query(clientsRef, orderBy('clientName'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<ClientProfile>(doc.data())
  }));
}

export async function getActiveClientProfiles(firmId: string): Promise<ClientProfile[]> {
  const clientsRef = collection(db, `wealthAdvisorFirms/${firmId}/clients`);
  const q = query(
    clientsRef,
    where('status', '==', 'active'),
    orderBy('clientName')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<ClientProfile>(doc.data())
  }));
}

export async function getClientProfile(
  firmId: string,
  clientId: string
): Promise<ClientProfile | null> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/clients`, clientId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<ClientProfile>(snapshot.data())
  };
}

export async function createClientProfile(
  firmId: string,
  data: Omit<ClientProfile, 'id' | 'createdAt' | 'lastUpdated'>
): Promise<ClientProfile> {
  const clientsRef = collection(db, `wealthAdvisorFirms/${firmId}/clients`);

  const clientData = {
    ...data,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  };

  // Convert dates if present
  if (data.dateOfBirth) {
    (clientData as any).dateOfBirth = Timestamp.fromDate(data.dateOfBirth);
  }
  if (data.spouseDateOfBirth) {
    (clientData as any).spouseDateOfBirth = Timestamp.fromDate(data.spouseDateOfBirth);
  }

  const docRef = await addDoc(clientsRef, clientData);

  return {
    id: docRef.id,
    ...data,
    createdAt: new Date(),
    lastUpdated: new Date()
  };
}

export async function updateClientProfile(
  firmId: string,
  clientId: string,
  data: Partial<ClientProfile>
): Promise<void> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/clients`, clientId);
  const updateData: any = { ...data, lastUpdated: serverTimestamp() };

  // Convert dates if present
  if (data.dateOfBirth) {
    updateData.dateOfBirth = Timestamp.fromDate(data.dateOfBirth);
  }
  if (data.spouseDateOfBirth) {
    updateData.spouseDateOfBirth = Timestamp.fromDate(data.spouseDateOfBirth);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteClientProfile(firmId: string, clientId: string): Promise<void> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/clients`, clientId);
  await deleteDoc(docRef);
}

// ============ WEALTH REPORTS ============

export async function getWealthReports(firmId: string, clientId?: string): Promise<WealthReport[]> {
  const reportsRef = collection(db, `wealthAdvisorFirms/${firmId}/reports`);

  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (clientId) {
    constraints.unshift(where('clientId', '==', clientId));
  }

  const q = query(reportsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<WealthReport>(doc.data())
  }));
}

export async function getRecentWealthReports(
  firmId: string,
  count: number = 10
): Promise<WealthReport[]> {
  const reportsRef = collection(db, `wealthAdvisorFirms/${firmId}/reports`);
  const q = query(reportsRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<WealthReport>(doc.data())
  }));
}

export async function getWealthReport(
  firmId: string,
  reportId: string
): Promise<WealthReport | null> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/reports`, reportId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...convertTimestamps<WealthReport>(snapshot.data())
  };
}

export async function createWealthReport(
  firmId: string,
  data: Omit<WealthReport, 'id' | 'createdAt' | 'viewCount'>
): Promise<WealthReport> {
  const reportsRef = collection(db, `wealthAdvisorFirms/${firmId}/reports`);

  const reportData: any = {
    ...data,
    viewCount: 0,
    createdAt: serverTimestamp()
  };

  // Convert dates
  if (data.reportDate) {
    reportData.reportDate = Timestamp.fromDate(data.reportDate);
  }
  if (data.periodStart) {
    reportData.periodStart = Timestamp.fromDate(data.periodStart);
  }
  if (data.periodEnd) {
    reportData.periodEnd = Timestamp.fromDate(data.periodEnd);
  }

  const docRef = await addDoc(reportsRef, reportData);

  return {
    id: docRef.id,
    ...data,
    viewCount: 0,
    createdAt: new Date()
  };
}

export async function updateWealthReport(
  firmId: string,
  reportId: string,
  data: Partial<WealthReport>
): Promise<void> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/reports`, reportId);
  const updateData: any = { ...data };

  if (data.pdfGeneratedAt) {
    updateData.pdfGeneratedAt = Timestamp.fromDate(data.pdfGeneratedAt);
  }
  if (data.deliveredAt) {
    updateData.deliveredAt = Timestamp.fromDate(data.deliveredAt);
  }
  if (data.reportDate) {
    updateData.reportDate = Timestamp.fromDate(data.reportDate);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteWealthReport(firmId: string, reportId: string): Promise<void> {
  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/reports`, reportId);
  await deleteDoc(docRef);
}

export async function incrementWealthReportViews(firmId: string, reportId: string): Promise<void> {
  const report = await getWealthReport(firmId, reportId);
  if (!report) return;

  const docRef = doc(db, `wealthAdvisorFirms/${firmId}/reports`, reportId);
  await updateDoc(docRef, {
    viewCount: (report.viewCount || 0) + 1
  });
}

// ============ WEALTH ADVISOR ACTIVITY ============

export async function getWealthAdvisorActivity(
  firmId: string,
  count: number = 20
): Promise<WealthAdvisorActivity[]> {
  const activityRef = collection(db, `wealthAdvisorFirms/${firmId}/activity`);
  const q = query(activityRef, orderBy('createdAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps<WealthAdvisorActivity>(doc.data())
  }));
}

export async function logWealthAdvisorActivity(
  firmId: string,
  data: Omit<WealthAdvisorActivity, 'id' | 'createdAt'>
): Promise<void> {
  const activityRef = collection(db, `wealthAdvisorFirms/${firmId}/activity`);

  await addDoc(activityRef, {
    ...data,
    createdAt: serverTimestamp()
  });
}

// ============ WEALTH ADVISOR STATS ============

export async function getWealthAdvisorStats(firmId: string): Promise<{
  totalClients: number;
  activeClients: number;
  totalReports: number;
  reportsThisMonth: number;
  totalAUM: number;
}> {
  const [clients, reports] = await Promise.all([
    getClientProfiles(firmId),
    getWealthReports(firmId)
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeClients = clients.filter(c => c.status === 'active');
  const totalAUM = activeClients.reduce((sum, c) => sum + (c.estimatedNetWorth || 0), 0);

  return {
    totalClients: clients.length,
    activeClients: activeClients.length,
    totalReports: reports.length,
    reportsThisMonth: reports.filter(r => r.createdAt >= startOfMonth).length,
    totalAUM
  };
}
