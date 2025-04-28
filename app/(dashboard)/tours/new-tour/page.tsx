import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import NewTour from "../_components/NewTour";

const NewTourPage = () => {
  const queryClient = new QueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NewTour />
    </HydrationBoundary>
  );
};

export default NewTourPage;
