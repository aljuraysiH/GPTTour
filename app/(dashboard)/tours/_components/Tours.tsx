"use client";

import { getAllTours } from "@/utils/action";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ToursList from "./ToursList";
const Tours = () => {
  const [searchValue, setSearchValue] = useState("");
  const { userId } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["tours", searchValue],
    queryFn: () => getAllTours(searchValue, userId ?? ""),
  });

  return (
    <>
      <form className="max-w-lg mb-12 mt-4 lg:mt-0" onSubmit={e => e.preventDefault()}>
        <div className="join w-full">
          <input
            type="text"
            placeholder="ابحث عن مدينة أو دولة"
            className="input input-bordered join-item w-full"
            name="search"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            required
          />
          <button className="btn btn-primary join-item" type="button" disabled={isPending} onClick={() => setSearchValue("")}>
            {isPending ? "الرجاء الانتظار" : "اعادة تعيين"}
          </button>
        </div>
      </form>
      {isPending ? <span className=" loading"></span> : <ToursList tours={data} />}
    </>
  );
};

export default Tours;
