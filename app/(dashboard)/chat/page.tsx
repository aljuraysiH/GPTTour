import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import Chat from "./_components/Chat";

const ChatPage = () => {
  const queryClient = new QueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Chat />
    </HydrationBoundary>
  );
};

export default ChatPage;
