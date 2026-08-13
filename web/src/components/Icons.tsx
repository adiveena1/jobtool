/**
 * One icon family, drawn on a 24px grid at 1.6 stroke. Line-only and geometric
 * so nothing in the interface competes with the data.
 */

type P = { size?: number; className?: string; style?: React.CSSProperties };

function S({ size = 18, className, style, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: P) => <S {...p}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></S>;
export const IconDiscover = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-3.6-3.6" /></S>;
export const IconSpark = (p: P) => <S {...p}><path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" /><path d="M18.5 3.5v3M20 5h-3" /></S>;
export const IconStack = (p: P) => <S {...p}><path d="M4 8h16M4 12h16M4 16h16" /></S>;
export const IconDoc = (p: P) => <S {...p}><path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M13 3v5h5M8.5 13h7M8.5 17h5" /></S>;
export const IconMic = (p: P) => <S {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /></S>;
export const IconChart = (p: P) => <S {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></S>;
export const IconBuilding = (p: P) => <S {...p}><path d="M4 20V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v14M13 20V10h6a1 1 0 0 1 1 1v9M2 20h20M7 9h2M7 13h2M16 14h1" /></S>;
export const IconChat = (p: P) => <S {...p}><path d="M20 15a2 2 0 0 1-2 2H9l-4 3V6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2z" /></S>;
export const IconBell = (p: P) => <S {...p}><path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5zM10.3 19a2 2 0 0 0 3.4 0" /></S>;
export const IconGear = (p: P) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></S>;
export const IconUser = (p: P) => <S {...p}><circle cx="12" cy="8" r="3.6" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></S>;
export const IconArrow = (p: P) => <S {...p}><path d="M5 12h13M13 6l6 6-6 6" /></S>;
export const IconCheck = (p: P) => <S {...p}><path d="M4.5 12.5 9.5 17.5 19.5 6.5" /></S>;
export const IconAlert = (p: P) => <S {...p}><path d="M12 4.5 21 19.5H3zM12 10v4M12 17h.01" /></S>;
export const IconPlus = (p: P) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;
export const IconChevron = (p: P) => <S {...p}><path d="M9 5l7 7-7 7" /></S>;
export const IconSun = (p: P) => <S {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></S>;
export const IconMoon = (p: P) => <S {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></S>;
export const IconClose = (p: P) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>;
export const IconBolt = (p: P) => <S {...p}><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z" /></S>;
export const IconTarget = (p: P) => <S {...p}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></S>;
export const IconPlay = (p: P) => <S {...p}><path d="M7 4.5v15l13-7.5z" /></S>;
export const IconUpload = (p: P) => <S {...p}><path d="M12 16V4M12 4 7.5 8.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" /></S>;
export const IconLink = (p: P) => <S {...p}><path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11.7 6.6" /><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.4-1.4" /></S>;
export const IconGrid = (p: P) => <S {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></S>;
export const IconFlag = (p: P) => <S {...p}><path d="M5.5 21V4.5M5.5 5h10l-1.6 3.4L15.5 12h-10" /></S>;
