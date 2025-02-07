'use client'

import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { addMsg } from "@/store";
import { cn } from "@/lib/utils";
import { mailSender, directoryScanner, fetchAndParseEmails } from "@/lib/tools";
import { useEffect } from "react";

// Helper function: safely parse the JSON string stored in message.content
const parseContent = (contentStr) => {
  try {
    return JSON.parse(contentStr);
  } catch (error) {
    return { content: contentStr };
  }
};

function ChatSection() {
  const dispatch = useDispatch();
  const [msg, setMsg] = React.useState("");
  const [waiting, setWaiting] = React.useState(false); // Added waiting state
  const messages = useSelector((state) => state.messages.value);
  console.log(messages);
  const chatContainerRef = React.useRef(null);

  async function handleActionResponse(chatJson) {
    if (chatJson.type !== "action") return null;

    let observationResult = null;

    if (chatJson.function === "directoryScanner") {
      observationResult = directoryScanner(chatJson.input.name);
    } else if (chatJson.function === "mailSender") {
      observationResult = await mailSender(chatJson.input.content, chatJson.input.receiverEmail);
    } else if (chatJson.function === "mailReader") {
      observationResult = await fetchAndParseEmails(chatJson.input.n);
    }

    return { type: "observation", observation: observationResult };
  }

  async function submitHandler() {
    if (msg.trim() === "") return;

    setWaiting(true); // Disable input while waiting

    const userMsgObj = { type: "user", content: msg };
    const userMsg = { role: "user", content: JSON.stringify(userMsgObj) };

    dispatch(addMsg(userMsg));
    setMsg("");

    let updatedMessages = [...messages, userMsg];

    let attempt = 0;
    const maxAttempts = 5;
    let validResponse = false;

    while (attempt < maxAttempts && !validResponse) {
      attempt++;

      try {
        const response = await fetch("/api/bot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.ok) {
          console.error("Error fetching bot response");
          break;
        }

        let data = await response.json();
        console.log("Bot response:", data);

        if (data) {
          if (data.type === "action") {
            const actionResponse = await handleActionResponse(data);
            if (actionResponse) {
              data = actionResponse;
            }
          }

          const botMsg = { role: "assistant", content: JSON.stringify(data) };
          dispatch(addMsg(botMsg));
          updatedMessages = [...updatedMessages, botMsg];

          // Check if a valid displayable type exists
          if (data.type === "reply" || data.type === "output" || data.type === "end") {
            validResponse = true;
          }
        }
      } catch (error) {
        console.error("Error in auto prompting:", error);
        break;
      }
    }

    setWaiting(false); // Enable input after receiving a valid response
  }

  useEffect(() => {
    if (messages.length === 0) return;

    // Get the last message
    const lastMessage = messages[messages.length - 1];
    const parsed = parseContent(lastMessage.content);

    // Check if the last message is of a displayable type
    const isDisplayable =
      parsed.content ||
      parsed.reply ||
      parsed.output ||
      parsed.end ||
      (parsed.generation &&
        (typeof parsed.generation === "object"
          ? parsed.generation.subject || parsed.generation.body
          : parsed.generation)) ||
      parsed.error ||
      parsed.message;

    if (isDisplayable && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full w-full rounded-lg border">
        {/* Sidebar Panel */}
        <ResizablePanel defaultSize={25}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="font-semibold">Sidebar</span>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Chat Panel */}
        <ResizablePanel defaultSize={75} className="flex flex-col">
          <div className="flex flex-col h-full">
            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-900 rounded-md" ref={chatContainerRef}>
              <span className="font-semibold text-lg">Conversation</span>

              {/* Messages */}
              <div className="flex flex-col space-y-2">
                {messages
                  .map((msgObj, index) => {
                    const parsed = parseContent(msgObj.content);
                    return { ...msgObj, parsed, index };
                  })
                  .filter((msgObj) => msgObj.role === "user" || msgObj.role === "assistant")
                  .map((msgObj) => {
                    const parsed = msgObj.parsed;

                    const displayableContent =
                      parsed.content ||
                      parsed.end ||
                      parsed.reply ||
                      parsed.output ||
                      (parsed.generation &&
                        (typeof parsed.generation === "object"
                          ? `Subject: ${parsed.generation?.subject} Body: ${parsed.generation?.body}`
                          : parsed.generation)) ||
                      parsed.error ||
                      parsed.waiting ||
                      parsed.message;

                    // Skip empty messages to prevent UI glitches
                    if (!displayableContent) return null;

                    return (
                      <div
                        key={msgObj.index}
                        className={cn(
                          "max-w-[75%] p-3 rounded-lg shadow-md",
                          msgObj.role === "user"
                            ? "self-start bg-blue-500 text-white"
                            : "self-end bg-gray-700 text-white"
                        )}
                      >
                        {displayableContent}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-300"></div>

            {/* Input Section */}
            <div className="p-4 bg-gray-100 dark:bg-gray-950 flex gap-2">
              <Textarea
                placeholder="Type your message here."
                className="flex-1 dark:bg-gray-800"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevents new line
                    submitHandler(); // Call the submit function
                  }
                }}
                disabled={waiting} // Disable textarea when waiting
              />
              <Button onClick={submitHandler} disabled={waiting}>
                {waiting ? "Waiting..." : "Send"}
              </Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ChatSection;
