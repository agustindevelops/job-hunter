import { Circle, Path, Rect, Svg } from "@react-pdf/renderer";

const SIZE = 10;

type IconProps = {
  color?: string;
};

/** LinkedIn “in” mark on a rounded square (defaults to LinkedIn brand blue). */
export function LinkedInIcon({ color = "#0A66C2" }: IconProps) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Rect x="1" y="1" width="22" height="22" rx="3" fill={color} />
      <Path
        d="M7.2 9.6H4.9V19h2.3V9.6zm.15-3.1c0-.75-.6-1.35-1.4-1.35S4.6 5.75 4.6 6.5s.6 1.35 1.35 1.35 1.4-.6 1.4-1.35zM19.1 13.2c0-2.6-1.4-3.8-3.25-3.8-1.5 0-2.15.8-2.55 1.4V9.6H11v9.4h2.3v-5.05c0-1.35.25-2.65 1.9-2.65s1.65 1.45 1.65 2.75V19H19.1v-5.8z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

/** Simplified GitHub mark. */
export function GitHubIcon({ color = "#181717" }: IconProps) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.32.1-2.75 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 7.5c.85 0 1.71.12 2.51.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.43.2 2.49.1 2.75.64.72 1.03 1.64 1.03 2.76 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.81 0 .27.18.59.69.48A10.28 10.28 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"
        fill={color}
      />
    </Svg>
  );
}

/** Simple globe for portfolio / personal site. */
export function PortfolioIcon({ color = "#0F766E" }: IconProps) {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={1.75}
        fill="none"
      />
      <Path
        d="M3.5 12h17M12 3.5c2.5 2.8 3.8 5.7 3.8 8.5s-1.3 5.7-3.8 8.5c-2.5-2.8-3.8-5.7-3.8-8.5S9.5 6.3 12 3.5z"
        stroke={color}
        strokeWidth={1.5}
        fill="none"
      />
    </Svg>
  );
}
