import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In production, this would fetch from Firestore
// For demo purposes, we return a 404 to trigger client-side demo mode
export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;

  // TODO: Implement Firestore lookup
  // const reportRef = doc(db, 'reports', id);
  // const reportSnap = await getDoc(reportRef);
  // if (reportSnap.exists()) {
  //   const report = { id: reportSnap.id, ...reportSnap.data() };
  //   const clientRef = doc(db, 'clients', report.clientId);
  //   const clientSnap = await getDoc(clientRef);
  //   return json({ report, client: { id: clientSnap.id, ...clientSnap.data() } });
  // }

  throw error(404, 'Report not found');
};
