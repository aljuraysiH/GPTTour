import { Tour } from "@prisma/client";
import TourCard from "./TourCard";

const ToursList = ({ tours }: { tours?: Tour[] }) => {
  if (tours?.length === 0) return <h4 className="text-lg ">لا توجد رحلات...</h4>;

  return (
    <div className="grid sm:grid-cols-2  lg:grid-cols-4 gap-8">
      {tours?.map(tour => {
        return <TourCard key={tour.id} tour={tour} />;
      })}
    </div>
  );
};

export default ToursList;
