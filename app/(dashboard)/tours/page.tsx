import { getAllTours } from "@/utils/action";
import { auth } from "@clerk/nextjs";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import Tours from "./_components/Tours";

const ToursPage = async () => {
  const queryClient = new QueryClient();
  const { userId } = auth();
  await queryClient.prefetchQuery({
    queryKey: ["tours", ""],
    queryFn: () => getAllTours("", userId ?? ""),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Tours />
    </HydrationBoundary>
  );
};

export default ToursPage;
