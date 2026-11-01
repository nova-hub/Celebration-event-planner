import confetti from 'canvas-confetti';

// Trigger celebratory fireworks or confetti
export function triggerCelebrationConfetti() {
  try {
    const end = Date.now() + 1000;
    const colors = ['#a855f7', '#ec4899', '#f472b6', '#c084fc', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    // Canvas confetti gracefully falls back if not supported
  }
}

export function triggerTaskDoneConfetti() {
  try {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#38bdf8']
    });
  } catch (e) {}
}

// Format Currency
export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(num);
}

// Format readable date
export function formatDate(dateString, formatStr = 'MMM d, yyyy') {
  if (!dateString) return 'Date TBD';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    return dateString;
  }
}

// Format readable time
export function formatTime(timeString) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  if (!hours) return timeString;
  const h = parseInt(hours, 10);
  const m = minutes || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 || 12;
  return `${displayHours}:${m} ${ampm}`;
}

// Category Configuration & Colors
export const EVENT_CATEGORIES = {
  birthday: {
    id: 'birthday',
    label: 'Birthday',
    icon: '🎂',
    gradient: 'from-purple-500/20 via-pink-500/20 to-purple-600/20',
    border: 'border-purple-500/40',
    text: 'text-purple-300',
    badgeBg: 'bg-purple-950/60 border border-purple-500/40 text-purple-200',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    accent: '#a855f7'
  },
  wedding: {
    id: 'wedding',
    label: 'Wedding',
    icon: '💍',
    gradient: 'from-pink-500/20 via-rose-500/20 to-purple-500/20',
    border: 'border-pink-500/40',
    text: 'text-pink-300',
    badgeBg: 'bg-pink-950/60 border border-pink-500/40 text-pink-200',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    accent: '#ec4899'
  },
  anniversary: {
    id: 'anniversary',
    label: 'Anniversary',
    icon: '🥂',
    gradient: 'from-fuchsia-500/20 via-pink-400/20 to-amber-500/20',
    border: 'border-fuchsia-500/40',
    text: 'text-fuchsia-300',
    badgeBg: 'bg-fuchsia-950/60 border border-fuchsia-500/40 text-fuchsia-200',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    accent: '#f472b6'
  },
  party: {
    id: 'party',
    label: 'Party',
    icon: '🎉',
    gradient: 'from-violet-500/20 via-purple-500/20 to-pink-500/20',
    border: 'border-violet-500/40',
    text: 'text-violet-300',
    badgeBg: 'bg-violet-950/60 border border-violet-500/40 text-violet-200',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    accent: '#8b5cf6'
  }
};

export function getCategoryMeta(category) {
  const key = (category || 'party').toLowerCase();
  return EVENT_CATEGORIES[key] || EVENT_CATEGORIES.party;
}
