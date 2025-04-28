"use client";

import { createNewTour, fetchUserTokensById, generateTourResponse, getExistingTour, subtractTokens } from "@/utils/action";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";
import TourInfo from "./TourInfo";
const NewTour = () => {
  const { userId } = useAuth();

  const queryClient = useQueryClient();

  const {
    mutate,
    isPending,
    data: tour,
  } = useMutation({
    mutationFn: async (destination: { city: string; country: string }) => {
      const existingTour = await getExistingTour({ ...destination, clerkId: userId ?? "" });
      if (existingTour) return existingTour;
      const currentTokens = await fetchUserTokensById(userId ?? "");

      if (currentTokens && currentTokens < 300) {
        toast.error("متبقي القليل من التوكنز....");
        return;
      }

      const newTour = await generateTourResponse({ ...destination, remaningToken: currentTokens });
      if (!newTour) {
        toast.error("لا يوجد نتيجة مطابقة...");
        return null;
      }

      await createNewTour({ ...newTour?.tour, clerkId: userId });
      queryClient.invalidateQueries({ queryKey: ["tours"] });
      const newTokens = await subtractTokens(userId ?? "", newTour.tokens ?? 0);
      toast.success(`${newTokens} توكنز متبقية...`);
      return newTour.tour;
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destination = Object.fromEntries(formData.entries());
    mutate(destination as { city: string; country: string });
  };

  if (isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <span className="loading loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <h2 className="mb-4">ابحث عن وجهتك</h2>
        <div className="join w-full">
          <input type="text" className="input input-bordered join-item w-full" placeholder="المدينة" name="city" required />
          <input type="text" className="input input-bordered join-item w-full" placeholder="الدولة" name="country" required />
          <button className="btn btn-primary join-item" type="submit">
            انشئ رحلة
          </button>
        </div>
      </form>
      <div className="mt-16">
        <div className="mt-16">{tour ? <TourInfo tour={tour} /> : null}</div>
      </div>
    </>
  );
};

export default NewTour;
