/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import prisma from "./db";

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = async (chatMessages: any) => {
  try {
    const res = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "you are very helpful assistant",
        },
        ...chatMessages,
      ],
      model: "gpt-4.1-mini",
      temperature: 0,
    });

    return { message: res?.choices?.[0]?.message, tokens: res?.usage?.total_tokens };
  } catch {
    return null;
  }
};

export const getExistingTour = async ({ city, country, clerkId }: { city: string; country: string; clerkId: string }) => {
  return prisma.tour.findFirst({
    where: {
      AND: [{ city: { equals: city, mode: "insensitive" } }, { country: { equals: country, mode: "insensitive" } }, { clerkId: { equals: clerkId } }],
    },
  });
};

export const createNewTour = async (tour: any) => {
  return prisma.tour.create({
    data: tour,
  });
};

export const generateTourResponse = async ({ city, country, remaningToken = 0 }: { city?: string; country?: string; remaningToken?: number }) => {
  const query = `Find a ${city} in this ${country}.
If ${city} in this ${country} exists, create a list of things families can do in this ${city},${country}. 
Once you have a list, create a one-day tour. Response should be Arabic and in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "cityEn":"cityEnglish"
    "country": "${country}",
    "title": "title of the tour",
    "description": "description of the city and tour",
    "stops": ["stop 1","stop 2", "stop 3"]
  }
}
If you can't find info on exact ${city}, or ${city} does not exist, or it's population is less than 1, or it is not located in the following ${country} return { "tour": null }, with no additional characters.`;

  try {
    const response = await openAI.chat.completions.create({
      messages: [
        { role: "system", content: "you are a tour guide" },
        { role: "user", content: query },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: remaningToken < 500 ? remaningToken : 500,
    });
    // potentially returns a text with error message
    const tourData = JSON.parse(response?.choices[0]?.message?.content ?? "");

    if (!tourData.tour) {
      return null;
    }

    return { tour: tourData.tour, tokens: response.usage?.total_tokens };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllTours = async (searchTerm?: string, clerkId: string = "") => {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      where: {
        clerkId: clerkId,
      },
      orderBy: {
        city: "asc",
      },
    });

    return tours;
  }

  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
        },
        {
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      city: "asc",
    },
  });
  return tours;
};

export const getSingleTour = async (id: string) => {
  return prisma.tour.findUnique({
    where: {
      id: id,
    },
  });
};

export const fetchUserTokensById = async (clerkId: string) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });

  return result?.tokens;
};

export const generateUserTokensForId = async (clerkId: string) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });
  return result?.tokens;
};

export const fetchOrGenerateTokens = async (clerkId: string) => {
  const result = await fetchUserTokensById(clerkId);
  if (result) {
    return result;
  }
  return await generateUserTokensForId(clerkId);
};

export const subtractTokens = async (clerkId: string, tokens: number) => {
  const result = await prisma.token.update({
    where: {
      clerkId,
    },
    data: {
      tokens: {
        decrement: tokens,
      },
    },
  });
  revalidatePath("/profile");
  // Return the new token value
  return result.tokens;
};
