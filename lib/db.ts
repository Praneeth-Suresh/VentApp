import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  deleteDoc,
  getDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Submission, AdminComment, Analytics } from "./types"

// Submissions
export async function addSubmission(content: string): Promise<string> {
  const docRef = await addDoc(collection(db, "submissions"), {
    content,
    timestamp: Date.now(),
    status: "pending",
  })
  return docRef.id
}

export async function getSubmissions(status?: string): Promise<Submission[]> {
  let q = query(collection(db, "submissions"), orderBy("timestamp", "desc"))

  if (status) {
    q = query(collection(db, "submissions"), where("status", "==", status), orderBy("timestamp", "desc"))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as Submission,
  )
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const docRef = doc(db, "submissions", id)
  const docSnap = await getDoc(docRef)
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Submission) : null
}

export async function updateSubmission(id: string, updates: Partial<Submission>): Promise<void> {
  const docRef = doc(db, "submissions", id)
  await updateDoc(docRef, updates)
}

export async function deleteSubmission(id: string): Promise<void> {
  const docRef = doc(db, "submissions", id)
  await deleteDoc(docRef)
}

export async function getPendingSubmissionsCount(): Promise<number> {
  const q = query(collection(db, "submissions"), where("status", "==", "pending"))
  const snapshot = await getDocs(q)
  return snapshot.size
}

// Admin Comments
export async function addAdminComment(submission_id: string, comment: string): Promise<void> {
  await addDoc(collection(db, "admin_comments"), {
    submission_id,
    comment,
    timestamp: Date.now(),
  })
}

export async function getAdminComments(submission_id: string): Promise<AdminComment[]> {
  const q = query(collection(db, "admin_comments"), where("submission_id", "==", submission_id))
  const snapshot = await getDocs(q)
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as AdminComment,
  )
}

// Analytics
export async function getLatestAnalytics(): Promise<Analytics | null> {
  const q = query(collection(db, "analytics"), orderBy("date", "desc"))
  const snapshot = await getDocs(q)
  return snapshot.size > 0 ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Analytics) : null
}

export async function saveAnalytics(analytics: Omit<Analytics, "id">): Promise<void> {
  await addDoc(collection(db, "analytics"), analytics)
}

export async function getAnalyticsByDate(date: string): Promise<Analytics | null> {
  const q = query(collection(db, "analytics"), where("date", "==", date))
  const snapshot = await getDocs(q)
  return snapshot.size > 0 ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Analytics) : null
}
