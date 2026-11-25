# Chronos Firestore Security Specification (Phase 0 & Eight Pillars)

## 1. Data Invariants
1. **Default Deny**: Every unmatched path is denied (`match /{document=**} { allow read, write: if false; }`).
2. **PII Isolation**: `/users/{userId}` and its subcollections (`sessions`, `alarms`, `tasks`) are strictly owner-only (`request.auth.uid == userId`). Zero PII (`email`, personal tasks, private logs) exists in `/publicLeaderboard`, `/friendRequests`, `/friendships`, or `/gifts`.
3. **Registered User Identity**: Anonymous guest sessions cannot mutate `/publicLeaderboard`, `/friendRequests`, `/friendships`, or `/gifts`.
4. **FriendRequest Determinism & Terminal Lock**: A friend request ID MUST equal `{fromUid}__{toUid}`, `fromUid == request.auth.uid`, `toUid != fromUid`, and `toUid` must exist in `/publicLeaderboard`. Only `toUid` can transition `status` from `'pending'` to `'accepted'` or `'declined'` (terminal state locking prevents reopening).
5. **Atomic Friendship Creation (Pillar 7)**: A `/friendships/{userA}__{userB}` document (`userA < userB`) can only be created when `memberUids == [userA, userB]`, caller is in `memberUids`, and `getAfter(/databases/$(database)/documents/friendRequests/$(requestId))` verifies the recipient (`request.auth.uid == toUid`) atomically transitioned that matching request to `'accepted'`.
6. **Gift Integrity & Terminal Claim Lock**: A `/gifts/{giftId}` parcel can only be created by `fromUid == request.auth.uid`, targeting an existing registered scholar `toUid != fromUid`, with `status == 'unclaimed'`, no `claimedAt`, `costPoints > 0`, and `createdAt == request.time`. Only `toUid` can transition `'unclaimed'` -> `'claimed'` with `claimedAt == request.time`, updating only `['status', 'claimedAt']`.

## 2. Adversarial "Dirty Dozen" Attack Payloads (All Must Fail PERMISSION_DENIED)
1. **Shadow Field Injection on Public Leaderboard**: `{ ..., isAdmin: true }` -> Blocked by `keys().hasOnly(...)`.
2. **Oversized ID Poisoning**: Creating `/gifts/${'a'.repeat(300)}` -> Blocked by `isValidId()`.
3. **Friend Request Impersonation**: Caller `uidB` creating `/friendRequests/uidA__uidC` with `fromUid: 'uidA'` -> Blocked by `incoming().fromUid == request.auth.uid`.
4. **Self-Friending Bypass**: Creating `/friendRequests/uidA__uidA` -> Blocked by `fromUid != toUid`.
5. **Sender Self-Accepting Own Friend Request**: `uidA` updating `/friendRequests/uidA__uidB` to `status: 'accepted'` -> Blocked by `existing().toUid == request.auth.uid`.
6. **Terminal Request Re-opening**: Updating an `'accepted'` or `'declined'` request back to `'pending'` -> Blocked by `existing().status == 'pending'`.
7. **Forged Friendship Without Accepted Request**: `uidA` directly calling `setDoc` on `/friendships/uidA__uidB` without batch-accepting a request addressed to `request.auth.uid` -> Blocked by `getAfter(...)` Gate.
8. **Member Array Spoofing / Unbounded Array**: Creating `/friendships/...` with `memberUids: ['uidA', 'uidB', 'uidC']` or `userB < userA` -> Blocked by `memberUids.size() == 2` and `userA < userB`.
9. **Gift Re-claiming Attack**: Recipient updating an already `'claimed'` gift to `'claimed'` or `'unclaimed'` -> Blocked by `existing().status == 'unclaimed'`.
10. **Gift Tampering During Claim**: Recipient updating `costPoints` or `itemId` while claiming -> Blocked by `affectedKeys().hasOnly(['status', 'claimedAt'])`.
11. **Timestamp Forgery**: Client writing explicit ISO/custom Date on `createdAt` or `claimedAt` instead of `serverTimestamp()` -> Blocked by `== request.time`.
12. **Blanket Query Scraping on Social Collections**: Any third party `uidC` listing `/friendRequests`, `/friendships`, or `/gifts` -> Blocked by `allow list` checking `request.auth.uid` against `resource.data`.
