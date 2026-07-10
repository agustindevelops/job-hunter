import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import { PROFILE_PATH } from "@/lib/site";

export default function Header() {
  return (
    <AppHeader cta={<Button href={PROFILE_PATH}>Let&apos;s Get That Bread!</Button>} />
  );
}
