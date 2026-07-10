import AppHeader from "@/components/AppHeader";
import Button from "@/components/Button";
import { PROFILE_PATH } from "@/lib/site";

export default function JobsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-100">
      <AppHeader
        cta={<Button href={PROFILE_PATH}>Edit profile</Button>}
      />
    </div>
  );
}
