import React, { useMemo, useState } from 'react';
import {
  X,
  Gift,
  Coins,
  Frame,
  Image as ImageIcon,
  Award,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ChronosWallet,
  CosmeticRarity,
  GiftItemCategory,
  PublicLeaderboardEntry,
} from '../types';
import {
  STORE_AVATARS_CATALOG,
  STORE_BACKGROUNDS_CATALOG,
  STORE_FRAMES_CATALOG,
  computeScholarDigitId,
} from '../utils/storage';
import { ProfileBannerBackdrop, RankTierBadge, ScholarAvatar } from './ScholarCosmetics';

interface SendGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Partial<PublicLeaderboardEntry> & {
    userId: string;
    displayName: string;
  } | null;
  wallet: ChronosWallet;
  onSendGift: (payload: {
    recipient: { userId: string; displayName: string; scholarId?: string };
    category: GiftItemCategory;
    itemId: string;
    itemName: string;
    itemRarity: CosmeticRarity;
    costPoints: number;
    message: string;
  }) => Promise<void>;
}

const GIFT_NOTES_PRESETS = [
  'Keep crushing your deep work sprints!',
  'Gift from a fellow Chronos scholar.',
  'Celebrate your study streak milestone!',
];

const RARITY_COLOR: Record<CosmeticRarity, string> = {
  Starter: 'text-slate-400',
  Rare: 'text-sky-500 dark:text-sky-400',
  Epic: 'text-purple-500 dark:text-purple-400',
  Legendary: 'text-amber-500 dark:text-amber-400',
  Mythic: 'text-rose-500 dark:text-rose-400',
};

export const SendGiftModal: React.FC<SendGiftModalProps> = ({
  isOpen,
  onClose,
  recipient,
  wallet,
  onSendGift,
}) => {
  const [category, setCategory] = useState<GiftItemCategory>('frame');
  const [selectedId, setSelectedId] = useState<string>('');
  const [message, setMessage] = useState<string>('Keep crushing your deep work sprints!');
  const [sending, setSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sentDone, setSentDone] = useState<boolean>(false);

  const giftableFrames = useMemo(
    () => STORE_FRAMES_CATALOG.filter((f) => f.costPoints > 0),
    []
  );
  const giftableBackgrounds = useMemo(
    () => STORE_BACKGROUNDS_CATALOG.filter((b) => b.costPoints > 0),
    []
  );
  const giftableAvatars = useMemo(
    () => STORE_AVATARS_CATALOG.filter((a) => a.costPoints > 0),
    []
  );

  const currentCatalog = useMemo(() => {
    if (category === 'frame') return giftableFrames;
    if (category === 'background') return giftableBackgrounds;
    return giftableAvatars;
  }, [category, giftableFrames, giftableBackgrounds, giftableAvatars]);

  const activeItem = useMemo(() => {
    return (
      currentCatalog.find((item) => item.id === selectedId) || currentCatalog[0]
    );
  }, [currentCatalog, selectedId]);

  if (!isOpen || !recipient) return null;

  const recipientDigitId =
    recipient.scholarId || computeScholarDigitId(recipient.userId);
  const canAfford = activeItem ? wallet.points >= activeItem.costPoints : false;
  const remainingPoints = activeItem
    ? Math.max(0, wallet.points - activeItem.costPoints)
    : wallet.points;

  const handleConfirmSend = async () => {
    if (!activeItem || !canAfford || sending) return;
    setErrorMsg(null);
    setSending(true);
    try {
      await onSendGift({
        recipient: {
          userId: recipient.userId,
          displayName: recipient.displayName,
          scholarId: recipientDigitId,
        },
        category,
        itemId: activeItem.id,
        itemName: activeItem.name,
        itemRarity: activeItem.rarity,
        costPoints: activeItem.costPoints,
        message: message.trim() || 'A special Chronos cosmetic gift for you!',
      });
      setSentDone(true);
      window.setTimeout(() => {
        setSentDone(false);
        onClose();
      }, 1250);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Unable to deliver gift right now.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-3xl ch-glass-modal rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[93dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b ch-border ch-glass-subtle flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl ch-accent-soft flex items-center justify-center shrink-0">
              <Gift className="w-4.5 h-4.5 ch-text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold ch-text truncate">
                Send Cosmetic Gift
              </h3>
              <p className="text-[11px] ch-text-muted truncate">
                Spend your own XP to gift a Store Frame, Background, or Emblem
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ch-accent-soft text-xs font-mono font-bold tabular-nums">
              <Coins className="w-3.5 h-3.5" />
              <span>{wallet.points.toLocaleString()} XP</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl ch-text-muted hover:ch-text hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Send Gift"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sentDone ? (
          <div className="p-10 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold ch-text">Gift Parcel Dispatched!</h4>
            <p className="text-xs ch-text-secondary max-w-md mx-auto">
              <span className="font-bold ch-text">{activeItem?.name}</span> has been delivered to{' '}
              <span className="font-bold ch-text">{recipient.displayName}</span>&apos;s Gift
              Mailbox.
            </p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Recipient Summary Strip */}
              <div className="p-3.5 rounded-2xl ch-glass-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ScholarAvatar
                    displayName={recipient.displayName}
                    photoURL={recipient.photoURL}
                    frameId={recipient.equippedFrame}
                    avatarId={recipient.equippedAvatar}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold ch-text truncate">
                        To: {recipient.displayName}
                      </span>
                      {typeof recipient.totalPointsEarned === 'number' && (
                        <RankTierBadge
                          totalPointsEarned={recipient.totalPointsEarned}
                          rankTierOverride={recipient.rankTier}
                          compact
                          showLevel={false}
                        />
                      )}
                    </div>
                    <div className="text-[11px] ch-text-muted font-mono tabular-nums mt-0.5">
                      ID #{recipientDigitId} · {recipient.primarySubject || 'Scholar'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Switcher */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'frame', label: 'Frames', icon: Frame },
                    { id: 'background', label: 'Backgrounds', icon: ImageIcon },
                    { id: 'avatar', label: 'Emblems', icon: Award },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = category === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setCategory(tab.id);
                        setSelectedId('');
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        active ? 'ch-btn-primary shadow-sm' : 'ch-btn-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Item Catalog Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {currentCatalog.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  const affordable = wallet.points >= item.costPoints;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        isSelected
                          ? 'ch-accent-soft ring-1 ring-[var(--ch-accent)]'
                          : 'ch-glass-subtle hover:border-[var(--ch-border-strong)]'
                      } ${!affordable ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        {category === 'background' ? (
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-white/15 bg-[#090b10] shrink-0">
                            <ProfileBannerBackdrop
                              backgroundId={item.id}
                              scrimClassName="absolute inset-0 bg-black/20"
                            />
                          </div>
                        ) : (
                          <ScholarAvatar
                            displayName={recipient.displayName}
                            frameId={category === 'frame' ? item.id : 'default'}
                            avatarId={category === 'avatar' ? item.id : 'default'}
                            size="xs"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold ch-text truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5">
                            <span className={`font-bold ${RARITY_COLOR[item.rarity]}`}>
                              {item.rarity}
                            </span>
                            {item.isAnimated && (
                              <span className="ch-text-accent">· Animated</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono tabular-nums pt-1 border-t ch-border">
                        <span
                          className={`font-bold ${
                            affordable ? 'ch-text-accent' : 'text-rose-500 dark:text-rose-400'
                          }`}
                        >
                          {item.costPoints.toLocaleString()} XP
                        </span>
                        <span className="text-[10px] ch-text-muted">
                          {isSelected ? 'Selected' : affordable ? 'Giftable' : 'Low XP'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Personal Gift Note */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold ch-text-muted">
                  <span>Personal Gift Note (optional)</span>
                  <span className="font-mono tabular-nums">{message.length}/160</span>
                </div>
                <input
                  type="text"
                  maxLength={160}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write an encouraging message for your friend..."
                  className="w-full px-3.5 py-2.5 text-xs ch-input rounded-xl"
                />
                <div className="flex flex-wrap gap-1.5">
                  {GIFT_NOTES_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMessage(preset)}
                      className="text-[10px] px-2.5 py-1 rounded-lg ch-btn-secondary cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-xs text-rose-500 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Footer Confirmation */}
            {activeItem && (
              <div className="px-5 py-4 border-t ch-border ch-glass-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="min-w-0 text-xs">
                  <div className="font-bold ch-text flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 ch-text-accent shrink-0" />
                    <span className="truncate">Gift: {activeItem.name}</span>
                  </div>
                  <div className="text-[11px] ch-text-muted font-mono tabular-nums mt-0.5">
                    Cost: {activeItem.costPoints.toLocaleString()} XP ·{' '}
                    {canAfford
                      ? `Balance after gift: ${remainingPoints.toLocaleString()} XP`
                      : `Need ${(activeItem.costPoints - wallet.points).toLocaleString()} more XP`}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold ch-btn-secondary rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSend}
                    disabled={!canAfford || sending}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold ch-btn-primary rounded-xl disabled:opacity-45 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {sending
                        ? 'Sending...'
                        : `Send Gift (${activeItem.costPoints.toLocaleString()} XP)`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
