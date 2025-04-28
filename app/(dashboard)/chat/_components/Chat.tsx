/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { fetchUserTokensById, generateChatResponse, subtractTokens } from "@/utils/action";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const Chat = () => {
  const { userId } = useAuth();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async query => {
      const currentTokens = await fetchUserTokensById(userId ?? "");

      if (currentTokens && currentTokens < 100) {
        // Signal that we need to revert the message
        throw new Error("TOKEN_BALANCE_LOW");
      }

      const response = await generateChatResponse([...messages, query]);

      if (!response) {
        toast.error("حدث خطأ ما...");
        throw new Error("Failed to generate response");
      }

      return response;
    },
    onSuccess: response => {
      // This runs after the mutation is marked as successful (isPending becomes false)
      setMessages(prev => [...prev, response?.message]);

      // Handle token subtraction separately after the UI is updated
      subtractTokens(userId ?? "", response.tokens ?? 0)
        .then(newTokens => {
          toast.success(`${newTokens} توكنز متبقية...`);
        })
        .catch(err => {
          toast.error("حدث خطأ أثناء تحديث التوكنز");
          console.error(err);
        });
    },
    onError: (error: Error) => {
      // Check if this is our token balance error
      if (error.message === "TOKEN_BALANCE_LOW") {
        toast.error("متبقي القليل من التوكنز....");

        // Remove the last message (the user's message we just added)
        setMessages(prev => {
          const newMessages = [...prev];
          // Get the last message before removing it
          const lastMessage = newMessages.pop();
          // Put the content back in the text input
          if (lastMessage && lastMessage.role === "user") {
            setText(lastMessage.content);
          }
          return newMessages;
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    const query = { role: "user", content: text };

    // إضافة الرسالة إلى المحادثة أولاً
    setMessages(prev => [...prev, query]);
    setText("");

    // استخدام setTimeout لضمان تحديث واجهة المستخدم قبل التمرير
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    // إرسال الرسالة للمعالجة
    mutate(query as any);
  };

  // Helper function to detect if the text is RTL
  const isRTL = (text: string) => {
    // RTL characters mainly fall in the Arabic and Hebrew Unicode ranges
    const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    // Check the first actual character (not whitespace)
    const firstChar = text.trim()[0];
    return firstChar && rtlChars.test(firstChar);
  };

  // Effect to handle the typing animation for the last AI message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only proceed if the last message is from the AI and is in typing state
    if (!lastMessage || lastMessage.role !== "assistant" || !lastMessage.isTyping) {
      return;
    }

    const fullContent = lastMessage.content;
    const displayedContent = lastMessage.displayedContent || "";

    // If we haven't finished typing the full content
    if (displayedContent.length < fullContent.length) {
      // Set a timeout to add the next character
      const timeoutId = setTimeout(() => {
        const nextChar = fullContent.charAt(displayedContent.length);
        const newDisplayedContent = displayedContent + nextChar;

        setMessages(prev =>
          prev.map((msg, idx) =>
            idx === prev.length - 1
              ? {
                  ...msg,
                  displayedContent: newDisplayedContent,
                  // Mark as not typing when we reach the end
                  isTyping: newDisplayedContent.length < fullContent.length,
                }
              : msg
          )
        );
      }, 15); // Adjust typing speed here (lower = faster)

      return () => clearTimeout(timeoutId);
    }

    // Scroll to bottom after typing finishes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, [messages]);

  // تحسين التمرير عند تحديث الرسائل
  useEffect(() => {
    // تأخير قصير لضمان أن DOM قد تم تحديثه
    const scrollTimeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages]);

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex w-full mt-4 mb-2">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">🤖</div>
      <div className="flex max-w-xs p-3 rounded-lg rounded-bl-none bg-gray-200">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] relative">
      {/* Chat messages area with scroll and padding at bottom to prevent messages from being hidden behind input (only on small screens) */}
      <div className="flex-1 overflow-y-auto mb-4 lg:pb-4 pb-16 pt-4 lg:pt-0">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((message, index) => {
            const { role, content } = message;
            const isUser = role === "user";
            const contentIsRTL = isRTL(content);

            // For AI messages, use the displayedContent if it's typing
            const displayContent = role === "assistant" && message.isTyping ? message.displayedContent : content;

            return (
              <div key={index} className={`flex w-full ${isUser ? "justify-start" : "justify-end"}`}>
                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary-focus text-primary-content flex items-center justify-center self-end">👤</div>
                )}

                <div
                  className={`max-w-lg 2xl:max-w-4xl p-3 rounded-lg ${
                    isUser ? "bg-primary text-primary-content rounded-br-none mr-2" : "bg-base-100 rounded-bl-none"
                  }`}>
                  <p dir={contentIsRTL ? "rtl" : "ltr"}>{displayContent}</p>
                  {/* Show typing indicator inside the message as dots */}
                  {role === "assistant" && message.isTyping && (
                    <div className="mt-2 flex">
                      <span className="loading loading-dots loading-xs"></span>
                    </div>
                  )}
                </div>
                {!isUser && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center self-end mr-2">🤖</div>}
              </div>
            );
          })}

          {/* Show typing indicator when waiting for response */}
          {isPending && <TypingIndicator />}

          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Input area at bottom - fixed position only on small screens */}
      <div className="lg:border-t lg:border-base-300 lg:pt-4 lg:static fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 pt-4 lg:pb-0 lg:px-0 pb-4 px-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="اكتب رسالة..."
            className="flex-1 input input-bordered focus:outline-none focus:border-primary px-2"
            value={text}
            onChange={e => setText(e.target.value)}
            dir="rtl"
          />
          <button className="btn btn-primary" type="submit" disabled={isPending || messages.some(m => m.isTyping) || !text.trim()}>
            {isPending ? <span className="loading loading-spinner loading-sm"></span> : <span>إرسال</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
