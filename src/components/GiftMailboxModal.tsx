import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Gift,
  Sparkles,
  CheckCircle2,
  Send,
  Inbox,
  PackageOpen,
  Users,
  LogIn,
} from 'lucide-react';
import { CosmeticRarity, GiftItem } from '../types';
import { getStoreBackgroundById, getStoreFrameById, getStoreAvatarById } from '../utils/storage';
import { ProfileBannerBackdrop, ScholarAvatar } from './ScholarCosmetics';

interface GiftMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivedGifts: GiftItem[];
  sentGifts: GiftItem[];
  isGuest: boolean;
  onNavigateToProfile?: () => void;
  onOpenFriends?: () => void;
  onClaimGift: (
    gift: GiftItem,
    equipNow: boolean
  ) => Promise<{ alreadyOwned: boolean; bonusXp: number }>;
}

const CONFETTI_SHARDS: {
  tx: string;
  ty: string;
  rot: string;
  color: string;
  delay: string;
}[] = [
  { tx: '-110px', ty: '-85px', rot: '-210deg', color: '#fbbf24', delay: '0ms' },
  { tx: '-75px', ty: '-120px', rot: '160deg', color: '#38bdf8', delay: '40ms' },
  { tx: '-25px', ty: '-135px', rot: '-140deg', color: '#f472b6', delay: '20ms' },
  { tx: '35px', ty: '-132px', rot: '220deg', color: '#34d399', delay: '60ms' },
  { tx: '88px', ty: '-110px', rot: '-190deg', color: '#fbbf24', delay: '30ms' },
  { tx: '122px', ty: '-72px', rot: '260deg', color: '#a78bfa', delay: '70ms' },
  { tx: '130px', ty: '-12px', rot: '-240deg', color: '#fb7185', delay: '15ms' },
  { tx: '115px', ty: '52px', rot: '185deg', color: '#38bdf8', delay: '55ms' },
  { tx: '64px', ty: '96px', rot: '-170deg', color: '#fbbf24', delay: '25ms' },
  { tx: '-64px', ty: '94px', rot: '205deg', color: '#34d399', delay: '45ms' },
  { tx: '-118px', ty: '48px', rot: '-260deg', color: '#f472b6', delay: '65ms' },
  { tx: '-132px', ty: '-18px', rot: '150deg', color: '#a78bfa', delay: '10ms' },
];

const RARITY_COLOR: Record<CosmeticRarity, string> = {
  Starter: 'text-slate-400',
  Rare: 'text-sky-400',
  Epic: 'text-purple-400',
  Legendary: 'text-amber-400',
  Mythic: 'text-rose-400',
};

function getCategoryLabel(cat: GiftItem['itemCategory']): string {
  if (cat === 'frame') return 'Avatar Frame';
  if (cat === 'background') return 'Profile Background';
  return 'Scholar Emblem';
}

export const GiftMailboxModal: React.FC<GiftMailboxModalProps> = ({
  isOpen,
  onClose,
  receivedGifts,
  sentGifts,
  isGuest,
  onNavigateToProfile,
  onOpenFriends,
  onClaimGift,
}) => {
  const [mailboxTab, setMailboxTab] = useState<'inbox' | 'sent'>('inbox');
  const [unboxingGift, setUnboxingGift] = useState<GiftItem | null>(null);
  const [unboxPhase, setUnboxPhase] = useState<'shaking' | 'revealed'>('shaking');
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimResult, setClaimResult] = useState<{
    giftName: string;
    alreadyOwned: boolean;
    bonusXp: number;
    equipped: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setUnboxingGift(null);
      setClaimResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!unboxingGift || unboxPhase !== 'shaking') return;
    const timer = window.setTimeout(() => {
      setUnboxPhase('revealed');
    }, 920);
    return () => window.clearTimeout(timer);
  }, [unboxingGift, unboxPhase]);

  if (!isOpen) return null;

  const unclaimedGifts = receivedGifts.filter((g) => g.status === 'unclaimed');
  const claimedGifts = receivedGifts.filter((g) => g.status === 'claimed');

  const handleOpenParcel = (gift: GiftItem) => {
    setClaimResult(null);
    setUnboxingGift(gift);
    setUnboxPhase('shaking');
  };

  const handleClaimAction = async (equipNow: boolean) => {
    if (!unboxingGift || claiming) return;
    setClaiming(true);
    try {
      const res = await onClaimGift(unboxingGift, equipNow);
      setClaimResult({
        giftName: unboxingGift.itemName,
        alreadyOwned: res.alreadyOwned,
        bonusXp: res.bonusXp,
        equipped: equipNow,
      });
      setUnboxingGift(null);
    } finally {
      setClaiming(false);
    }
  };

  const renderGiftItemThumb = (gift: GiftItem) => {
    if (gift.itemCategory === 'background') {
      const bgMeta = getStoreBackgroundById(gift.itemId);
      return (
        <div className="relative w-14 h-11 rounded-xl overflow-hidden border border-white/15 bg-[#090b10] shrink-0 flex items-center justify-center">
          <ProfileBannerBackdrop
            backgroundId={bgMeta.id}
            scrimClassName="absolute inset-0 bg-black/20"
          />
        </div>
      );
    }
    if (gift.itemCategory === 'frame') {
      const frameMeta = getStoreFrameById(gift.itemId);
      return (
        <ScholarAvatar
          displayName={gift.toName}
          frameId={frameMeta.id}
          avatarId="default"
          size="sm"
        />
      );
    }
    const avatarMeta = getStoreAvatarById(gift.itemId);
    return (
      <ScholarAvatar
        displayName={gift.toName}
        frameId="default"
        avatarId={avatarMeta.id}
        size="sm"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl ch-glass-modal rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b ch-border ch-glass-subtle flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl ch-accent-soft flex items-center justify-center shrink-0 relative">
              <Mail className="w-4.5 h-4.5 ch-text-accent" />
              {unclaimedGifts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {unclaimedGifts.length}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold ch-text truncate">
                Scholar Gift Mailbox
              </h3>
              <p className="text-[11px] ch-text-muted truncate">
                Unbox incoming cosmetic parcels &amp; view gifts you have sent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFriends && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFriends();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 ch-text-accent" />
                <span>Friends</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Gift Mailbox"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guest Prompt */}
        {isGuest ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl ch-accent-soft mx-auto flex items-center justify-center">
              <Gift className="w-7 h-7 ch-text-accent" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold ch-text">
                Sign In to Unlock Gift Mailbox
              </h4>
              <p className="text-xs ch-text-muted max-w-sm mx-auto leading-relaxed">
                Your 8-digit Scholar ID, Friend List, and Gift Mailbox sync directly to your signed-in account.
              </p>
            </div>
            {onNavigateToProfile && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToProfile();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold ch-btn-primary rounded-xl cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In in Profile</span>
              </button>
            )}
          </div>
        ) : unboxingGift ? (
          /* =====================================================================
             DYNAMIC INTERACTIVE GIFT UNBOXING STAGE
             ===================================================================== */
          <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            {unboxPhase === 'shaking' ? (
              <div className="space-y-5 py-6">
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-65 ch-anim-pulse"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(244,114,182,0.18) 60%, transparent 100%)',
                    }}
                  />
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-0.5 shadow-2xl ch-gift-shake">
                    <div className="w-full h-full rounded-[22px] bg-[#0b0e16]/90 flex flex-col items-center justify-center gap-1 border border-amber-300/40">
                      <Gift className="w-10 h-10 text-amber-300" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-200">
                        Unboxing
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold ch-text">
                    Opening Gift from {unboxingGift.fromName}...
                  </div>
                  <div className="text-xs ch-text-muted font-mono">
                    ID #{unboxingGift.fromScholarId} · Breaking Wax Seal
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md space-y-5 relative py-2">
                {/* Expanding Shockwave Halo + Radial Confetti Burst */}
                <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
                  <div
                    className="absolute inset-2 rounded-full border-2 border-amber-400/75 ch-gift-burst-ring pointer-events-none"
                  />
                  <div
                    className="absolute inset-4 rounded-full border border-sky-400/60 ch-gift-burst-ring pointer-events-none"
                    style={{ animationDelay: '120ms' }}
                  />
                  {CONFETTI_SHARDS.map((shard, idx) => (
                    <span
                      key={idx}
                      className="absolute w-2.5 h-2.5 rounded-sm ch-gift-confetti pointer-events-none"
                      style={
                        {
                          backgroundColor: shard.color,
                          animationDelay: shard.delay,
                          '--tx': shard.tx,
                          '--ty': shard.ty,
                          '--rot': shard.rot,
                        } as React.CSSProperties
                      }
                    />
                  ))}

                  {/* Revealed Live Cosmetic Showcase */}
                  <div className="relative z-10 ch-gift-reveal">
                    {unboxingGift.itemCategory === 'background' ? (
                      <div className="relative w-48 h-28 rounded-2xl overflow-hidden border-2 border-amber-400/70 shadow-2xl bg-[#090b10]">
                        <ProfileBannerBackdrop backgroundId={unboxingGift.itemId} />
                        <div className="relative z-10 h-full flex items-end p-2.5">
                          <span className="text-[10px] font-mono font-bold text-amber-300 drop-shadow">
                            PROFILE BACKGROUND
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2">
                        <ScholarAvatar
                          displayName={unboxingGift.toName}
                          frameId={
                            unboxingGift.itemCategory === 'frame'
                              ? unboxingGift.itemId
                              : 'default'
                          }
                          avatarId={
                            unboxingGift.itemCategory === 'avatar'
                              ? unboxingGift.itemId
                              : 'default'
                          }
                          size="lg"
                          showFrameBadge
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Revealed Item Metadata */}
                <div className="space-y-1.5 ch-gift-reveal">
                  <div className="text-[11px] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 ch-text-accent" />
                    <span className={`font-bold ${RARITY_COLOR[unboxingGift.itemRarity]}`}>
                      {unboxingGift.itemRarity}
                    </span>
                    <span className="ch-text-muted">·</span>
                    <span className="ch-text-secondary">
                      {getCategoryLabel(unboxingGift.itemCategory)}
                    </span>
                  </div>
                  <h4 className="text-xl font-extrabold ch-text">
                    {unboxingGift.itemName}
                  </h4>
                  <p className="text-xs ch-text-muted">
                    Gifted by <strong className="ch-text">{unboxingGift.fromName}</strong> (ID #
                    {unboxingGift.fromScholarId}) · Worth{' '}
                    <span className="font-mono ch-text-accent font-bold">
                      {unboxingGift.costPoints.toLocaleString()} XP
                    </span>
                  </p>
                </div>

                {unboxingGift.message && (
                  <div className="p-3.5 rounded-2xl ch-glass-subtle border ch-border text-xs italic ch-text-secondary ch-gift-reveal">
                    &ldquo;{unboxingGift.message}&rdquo;
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2 ch-gift-reveal">
                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => void handleClaimAction(true)}
                    className="flex-1 py-2.5 px-4 ch-btn-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{claiming ? 'Claiming...' : 'Claim & Equip Now'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => void handleClaimAction(false)}
                    className="flex-1 py-2.5 px-4 ch-btn-secondary rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Claim to Collection
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setUnboxingGift(null)}
                  className="text-[11px] ch-text-muted hover:ch-text cursor-pointer"
                >
                  Back to Mailbox
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =====================================================================
             MAILBOX INBOX & SENT TABS
             ===================================================================== */
          <>
            <div className="px-5 py-2.5 border-b ch-border flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMailboxTab('inbox')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  mailboxTab === 'inbox' ? 'ch-btn-primary' : 'ch-btn-secondary'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Inbox ({receivedGifts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMailboxTab('sent')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  mailboxTab === 'sent' ? 'ch-btn-primary' : 'ch-btn-secondary'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sent ({sentGifts.length})</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
              {claimResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="text-xs min-w-0">
                      <div className="font-bold ch-text truncate">
                        Unlocked {claimResult.giftName}
                        {claimResult.equipped ? ' & Equipped!' : '!'}
                      </div>
                      {claimResult.alreadyOwned && (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-300">
                          Already owned — converted into +{claimResult.bonusXp} Appreciation XP!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {mailboxTab === 'inbox' ? (
                receivedGifts.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Mail className="w-10 h-10 ch-text-muted mx-auto opacity-60" />
                    <div className="text-sm font-bold ch-text">Your Mailbox is Empty</div>
                    <p className="text-xs ch-text-muted max-w-sm mx-auto">
                      When friends or leaderboard scholars send you Store cosmetics, wrapped gift parcels appear right here for unboxing.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {unclaimedGifts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider ch-text-accent flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5" />
                          <span>Ready to Unbox ({unclaimedGifts.length})</span>
                        </div>
                        {unclaimedGifts.map((gift) => (
                          <div
                            key={gift.giftId}
                            className="p-4 rounded-2xl ch-accent-soft flex flex-wrap items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                                <PackageOpen className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-bold ch-text truncate">
                                  Mystery {getCategoryLabel(gift.itemCategory)} Parcel
                                </div>
                                <div className="text-[11px] ch-text-secondary truncate mt-0.5">
                                  From <strong className="ch-text">{gift.fromName}</strong> · ID #
                                  {gift.fromScholarId}
                                </div>
                                {gift.message && (
                                  <div className="text-[11px] italic ch-text-muted truncate mt-0.5">
                                    &ldquo;{gift.message}&rdquo;
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenParcel(gift)}
                              className="px-4 py-2 text-xs font-bold ch-btn-primary rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Open Gift</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {claimedGifts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold uppercase tracking-wider ch-text-muted">
                          Claimed Gifts ({claimedGifts.length})
                        </div>
                        {claimedGifts.map((gift) => (
                          <div
                            key={gift.giftId}
                            className="p-3.5 rounded-2xl ch-glass-subtle flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {renderGiftItemThumb(gift)}
                              <div className="min-w-0">
                                <div className="text-xs font-bold ch-text truncate">
                                  {gift.itemName}
                                </div>
                                <div className="text-[11px] ch-text-muted truncate">
                                  From {gift.fromName} · {getCategoryLabel(gift.itemCategory)} ·{' '}
                                  {gift.costPoints.toLocaleString()} XP
                                </div>
                                {gift.message && (
                                  <div className="text-[10px] italic ch-text-muted truncate mt-0.5">
                                    &ldquo;{gift.message}&rdquo;
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Claimed
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : sentGifts.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Send className="w-10 h-10 ch-text-muted mx-auto opacity-60" />
                  <div className="text-sm font-bold ch-text">No Gifts Sent Yet</div>
                  <p className="text-xs ch-text-muted max-w-sm mx-auto">
                    Open any friend or leaderboard scholar&apos;s profile to gift them a Store cosmetic using your Focus XP.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sentGifts.map((gift) => (
                    <div
                      key={gift.giftId}
                      className="p-3.5 rounded-2xl ch-glass-subtle flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {renderGiftItemThumb(gift)}
                        <div className="min-w-0">
                          <div className="text-xs font-bold ch-text truncate">
                            {gift.itemName} → {gift.toName}
                          </div>
                          <div className="text-[11px] ch-text-muted font-mono tabular-nums">
                            To ID #{gift.toScholarId} · {gift.costPoints.toLocaleString()} XP
                          </div>
                          {gift.message && (
                            <div className="text-[10px] italic ch-text-muted truncate mt-0.5">
                              &ldquo;{gift.message}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold shrink-0 ${
                          gift.status === 'claimed'
                            ? 'text-emerald-500'
                            : 'ch-text-accent'
                        }`}
                      >
                        {gift.status === 'claimed' ? 'Opened' : 'Unopened'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
