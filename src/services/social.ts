import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getDocsFromServer,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  CosmeticRarity,
  FriendRequestItem,
  FriendshipItem,
  GiftItem,
  GiftItemCategory,
  PublicLeaderboardEntry,
} from '../types';
import { computeScholarDigitId } from '../utils/storage';
import { fetchPublicLeaderboardPage, stripUndefinedFields } from './leaderboard';

export function normalizeDigitIdInput(raw: string): string {
  return String(raw || '').replace(/\D/g, '').slice(0, 8);
}

export function getSortedFriendshipPair(uid1: string, uid2: string): {
  friendshipId: string;
  userA: string;
  userB: string;
} {
  const [userA, userB] = uid1 < uid2 ? [uid1, uid2] : [uid2, uid1];
  return {
    friendshipId: `${userA}__${userB}`,
    userA,
    userB,
  };
}

export function getRequestDocId(fromUid: string, toUid: string): string {
  return `${fromUid}__${toUid}`;
}

export async function searchScholarByDigitId(
  rawInput: string
): Promise<PublicLeaderboardEntry | null> {
  const cleanDigits = normalizeDigitIdInput(rawInput);
  if (cleanDigits.length !== 8) {
    return null;
  }

  try {
    // 1. Direct indexed query for registered scholars with synced scholarId
    try {
      const q = query(
        collection(db, 'publicLeaderboard'),
        where('isPublic', '==', true),
        where('scholarId', '==', cleanDigits),
        limit(5)
      );
      const snap = await getDocsFromServer(q).catch(() => getDocs(q));
      const directMatch = snap.docs
        .map((d) => d.data() as PublicLeaderboardEntry)
        .find((e) => !e.isGuest);
      if (directMatch) {
        return {
          ...directMatch,
          scholarId: directMatch.scholarId || computeScholarDigitId(directMatch.userId),
        };
      }
    } catch {
      // Composite index may not exist yet; fall through cleanly to public page scan
    }

    // 2. Fallback scan of public standings so existing scholars whose deterministic ID
    // hasn't been written back to their doc yet are still immediately discoverable
    const page = await fetchPublicLeaderboardPage(100, true);
    const matched = page.entries.find(
      (entry) =>
        !entry.isGuest &&
        (entry.scholarId || computeScholarDigitId(entry.userId)) === cleanDigits
    );
    if (!matched) return null;
    return {
      ...matched,
      scholarId: matched.scholarId || computeScholarDigitId(matched.userId),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'publicLeaderboard');
    return null;
  }
}

export async function fetchPublicProfilesByUids(
  uids: string[]
): Promise<Record<string, PublicLeaderboardEntry>> {
  const cleanUids = Array.from(new Set(uids.filter(Boolean)));
  const result: Record<string, PublicLeaderboardEntry> = {};
  if (cleanUids.length === 0) return result;

  await Promise.all(
    cleanUids.map(async (uid) => {
      try {
        const ref = doc(db, 'publicLeaderboard', uid);
        const snap = await getDocFromServer(ref).catch(() => getDoc(ref));
        if (snap.exists()) {
          const data = snap.data() as PublicLeaderboardEntry;
          if (data && !data.isGuest) {
            result[uid] = {
              ...data,
              scholarId: data.scholarId || computeScholarDigitId(data.userId),
            };
          }
        }
      } catch {
        // Ignore unavailable individual profile
      }
    })
  );
  return result;
}

export async function sendFriendRequest(params: {
  fromUid: string;
  fromName: string;
  fromFrame?: string;
  fromAvatar?: string;
  fromPrimarySubject?: string;
  fromRankTier?: string;
  target: PublicLeaderboardEntry;
}): Promise<void> {
  const { fromUid, target } = params;
  if (!fromUid || !target?.userId || fromUid === target.userId || target.isGuest) {
    throw new Error('Cannot send friend request to this scholar.');
  }

  const requestId = getRequestDocId(fromUid, target.userId);
  const reqRef = doc(db, 'friendRequests', requestId);

  try {
    // Check if an older non-pending request exists (e.g., declined or post-unfriend) and clear it
    const existingSnap = await getDoc(reqRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data() as FriendRequestItem;
      if (existingData.status === 'pending') {
        return; // Already pending
      }
      await deleteDoc(reqRef);
    }

    const payload = stripUndefinedFields<Record<string, unknown>>({
      requestId,
      fromUid,
      toUid: target.userId,
      fromName: params.fromName.trim().slice(0, 60) || 'Study Scholar',
      toName: (target.displayName || 'Study Scholar').trim().slice(0, 60),
      fromScholarId: computeScholarDigitId(fromUid),
      toScholarId: target.scholarId || computeScholarDigitId(target.userId),
      fromFrame: (params.fromFrame || 'default').slice(0, 40),
      fromAvatar: (params.fromAvatar || 'default').slice(0, 40),
      fromPrimarySubject: (params.fromPrimarySubject || 'General').slice(0, 50),
      fromRankTier: (params.fromRankTier || 'Bronze V').slice(0, 20),
      toFrame: (target.equippedFrame || 'default').slice(0, 40),
      toAvatar: (target.equippedAvatar || 'default').slice(0, 40),
      toPrimarySubject: (target.primarySubject || 'General').slice(0, 50),
      toRankTier: (target.rankTier || 'Bronze V').slice(0, 20),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(reqRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `friendRequests/${requestId}`);
  }
}

export async function acceptFriendRequest(request: FriendRequestItem): Promise<void> {
  const { friendshipId, userA, userB } = getSortedFriendshipPair(
    request.fromUid,
    request.toUid
  );
  const userAIsFrom = userA === request.fromUid;

  const batch = writeBatch(db);
  const reqRef = doc(db, 'friendRequests', request.requestId);
  const friendshipRef = doc(db, 'friendships', friendshipId);

  batch.update(reqRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });

  batch.set(
    friendshipRef,
    stripUndefinedFields({
      friendshipId,
      userA,
      userB,
      memberUids: [userA, userB],
      requestId: request.requestId,
      userAName: (userAIsFrom ? request.fromName : request.toName).slice(0, 60),
      userBName: (userAIsFrom ? request.toName : request.fromName).slice(0, 60),
      userAScholarId: userAIsFrom ? request.fromScholarId : request.toScholarId,
      userBScholarId: userAIsFrom ? request.toScholarId : request.fromScholarId,
      createdAt: serverTimestamp(),
    })
  );

  try {
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `friendships/${friendshipId}`);
  }
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'friendRequests', requestId), {
      status: 'declined',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `friendRequests/${requestId}`);
  }
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'friendRequests', requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `friendRequests/${requestId}`);
  }
}

export async function removeFriendship(uid1: string, uid2: string): Promise<void> {
  const { friendshipId } = getSortedFriendshipPair(uid1, uid2);
  try {
    await deleteDoc(doc(db, 'friendships', friendshipId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `friendships/${friendshipId}`);
  }
}

export async function sendGiftToScholar(params: {
  fromUid: string;
  fromName: string;
  fromFrame?: string;
  fromAvatar?: string;
  recipient: {
    userId: string;
    displayName: string;
    scholarId?: string;
  };
  itemCategory: GiftItemCategory;
  itemId: string;
  itemName: string;
  itemRarity: CosmeticRarity;
  costPoints: number;
  message: string;
}): Promise<GiftItem> {
  const { fromUid, recipient } = params;
  if (!fromUid || !recipient.userId || fromUid === recipient.userId) {
    throw new Error('Cannot send a gift to yourself.');
  }
  const safeCost = Math.max(1, Math.round(params.costPoints));
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const giftId = `gift_${Date.now()}_${randomSuffix}`;
  const path = `gifts/${giftId}`;

  const docPayload = stripUndefinedFields<Record<string, unknown>>({
    giftId,
    fromUid,
    toUid: recipient.userId,
    fromName: params.fromName.trim().slice(0, 60) || 'Study Scholar',
    toName: (recipient.displayName || 'Study Scholar').trim().slice(0, 60),
    fromScholarId: computeScholarDigitId(fromUid),
    toScholarId: recipient.scholarId || computeScholarDigitId(recipient.userId),
    fromFrame: (params.fromFrame || 'default').slice(0, 40),
    fromAvatar: (params.fromAvatar || 'default').slice(0, 40),
    itemCategory: params.itemCategory,
    itemId: params.itemId.slice(0, 40),
    itemName: params.itemName.slice(0, 80),
    itemRarity: params.itemRarity,
    costPoints: safeCost,
    message: params.message.trim().slice(0, 160),
    status: 'unclaimed',
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'gifts', giftId), docPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }

  return {
    giftId,
    fromUid,
    toUid: recipient.userId,
    fromName: params.fromName.trim().slice(0, 60) || 'Study Scholar',
    toName: (recipient.displayName || 'Study Scholar').trim().slice(0, 60),
    fromScholarId: computeScholarDigitId(fromUid),
    toScholarId: recipient.scholarId || computeScholarDigitId(recipient.userId),
    fromFrame: params.fromFrame || 'default',
    fromAvatar: params.fromAvatar || 'default',
    itemCategory: params.itemCategory,
    itemId: params.itemId,
    itemName: params.itemName,
    itemRarity: params.itemRarity,
    costPoints: safeCost,
    message: params.message.trim().slice(0, 160),
    status: 'unclaimed',
  };
}

export async function markGiftClaimed(giftId: string): Promise<void> {
  const path = `gifts/${giftId}`;
  try {
    await updateDoc(doc(db, 'gifts', giftId), {
      status: 'claimed',
      claimedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

function toTimestampMs(val: unknown): number {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'object' && val !== null && 'toMillis' in val) {
    const fn = (val as { toMillis?: () => number }).toMillis;
    if (typeof fn === 'function') return fn();
  }
  return 0;
}

export function subscribeIncomingFriendRequests(
  uid: string,
  onUpdate: (items: FriendRequestItem[]) => void
): () => void {
  const path = 'friendRequests';
  const q = query(collection(db, path), where('toUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as FriendRequestItem)
        .filter((r) => r.status === 'pending')
        .sort((a, b) => toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt));
      onUpdate(items);
    },
    (err) => {
      console.warn('Incoming friend requests subscription notice:', err);
    }
  );
}

export function subscribeOutgoingFriendRequests(
  uid: string,
  onUpdate: (items: FriendRequestItem[]) => void
): () => void {
  const path = 'friendRequests';
  const q = query(collection(db, path), where('fromUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as FriendRequestItem)
        .filter((r) => r.status === 'pending')
        .sort((a, b) => toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt));
      onUpdate(items);
    },
    (err) => {
      console.warn('Outgoing friend requests subscription notice:', err);
    }
  );
}

export function subscribeFriendships(
  uid: string,
  onUpdate: (items: FriendshipItem[]) => void
): () => void {
  const path = 'friendships';
  const q = query(collection(db, path), where('memberUids', 'array-contains', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as FriendshipItem)
        .sort((a, b) => toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt));
      onUpdate(items);
    },
    (err) => {
      console.warn('Friendships subscription notice:', err);
    }
  );
}

export function subscribeReceivedGifts(
  uid: string,
  onUpdate: (items: GiftItem[]) => void
): () => void {
  const path = 'gifts';
  const q = query(collection(db, path), where('toUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as GiftItem)
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === 'unclaimed' ? -1 : 1;
          return toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt);
        });
      onUpdate(items);
    },
    (err) => {
      console.warn('Received gifts subscription notice:', err);
    }
  );
}

export function subscribeSentGifts(
  uid: string,
  onUpdate: (items: GiftItem[]) => void
): () => void {
  const path = 'gifts';
  const q = query(collection(db, path), where('fromUid', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => d.data() as GiftItem)
        .sort((a, b) => toTimestampMs(b.createdAt) - toTimestampMs(a.createdAt));
      onUpdate(items);
    },
    (err) => {
      console.warn('Sent gifts subscription notice:', err);
    }
  );
}
