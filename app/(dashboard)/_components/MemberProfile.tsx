import { fetchOrGenerateTokens } from "@/utils/action";
import { auth, currentUser, UserButton } from "@clerk/nextjs";

const MemberProfile = async () => {
  const user = await currentUser();
  const { userId } = auth();
  const tokens = await fetchOrGenerateTokens(userId ?? "");
  return (
    <div className="px-4 flex items-center gap-2">
      <UserButton afterSignOutUrl="/" />
      <div className="flex flex-col">
        <p>{user?.emailAddresses[0].emailAddress}</p>
        <span className="text-xs text-primary">{tokens} توكن</span>
      </div>
    </div>
  );
};

export default MemberProfile;
