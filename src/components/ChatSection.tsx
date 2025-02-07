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
import { content } from "googleapis/build/src/apis/content";

// Helper function: safely parse the JSON string stored in message.content
const parseContent = (contentStr) => {
  try {
    return JSON.parse(contentStr);
  } catch (error) {
    return { content: contentStr };
  }
};

const renderObject = (data) => {
  if (typeof data !== "object" || data === null) {
    return <p>{String(data)}</p>; // If it's a primitive, display it directly
  }

  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-4">
        {data.map((item, index) => (
          <li key={index}>{renderObject(item)}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="p-2 bg-gray-800 text-white rounded-md">
      {Object.entries(data).map(([key, value], index) => (
        <div key={index} className="mb-1">
          <strong className="capitalize">{key}:</strong> {renderObject(value)}
        </div>
      ))}
    </div>
  );
};




function ChatSection() {
  const dispatch = useDispatch();
  const [msg, setMsg] = React.useState("");
  // Each message is now an object: { role: string, content: string }
  const messages = useSelector((state: any) => state.messages.value);

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

    // Create a user message object; note the content is stringified
    const userMsgObj = { type: "user", content: msg };
    const userMsg = {
      role: "user",
      content: JSON.stringify(userMsgObj),
    };

    // Dispatch the user message to the store
    dispatch(addMsg(userMsg));
    setMsg("");

    // Prepare the messages array to send to the API.
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
          // Create a new message object for the assistant

          if(data.type === "action") {
            const actionResponse = await handleActionResponse(data);
            if(actionResponse) {
              data = actionResponse;
            }
          }
          const botMsg = {
            role: "assistant",
            content: JSON.stringify(data),
          };

          dispatch(addMsg(botMsg));
          updatedMessages = [...updatedMessages, botMsg];

          if (data.type === "reply" || data.type === "output" || data.type == 'end') {
            validResponse = true;
          }
        }
      } catch (error) {
        console.error("Error in auto prompting:", error);
        break;
      }
    }
  }
  
  
  

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full w-full rounded-lg border"
      >
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
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-900 rounded-md">
              <span className="font-semibold text-lg">Conversation</span>

              {/* Messages */}
              <div className="flex flex-col space-y-2">
                {messages
                  .map((msgObj, index) => {
                    const parsed = parseContent(msgObj.content);
                    return { ...msgObj, parsed, index };
                  })
                  // Filter: always show user messages, and show all bot messages
                  .filter((msgObj) => msgObj.role === "user" || msgObj.role === "assistant")
                  .map((msgObj) => (
                    <div
                      key={msgObj.index}
                      className={cn(
                        "max-w-[75%] p-3 rounded-lg shadow-md",
                        msgObj.role === "user"
                          ? "self-start bg-blue-500 text-white"
                          : "self-end bg-gray-700 text-white"
                      )}
                    >
                      {msgObj.parsed.reply || msgObj.parsed.output || msgObj.parsed.content || msgObj.parsed.generation && (typeof(msgObj.parsed.generation) == "object" ? (`Subject : ${msgObj.parsed?.generation?.subject} Body : ${msgObj.parsed?.generation?.body}`) : (msgObj.parsed.generation)) || msgObj.parsed.error || msgObj.parsed.waiting || msgObj.parsed.message}
                    </div>
                  ))}
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
              />
              <Button onClick={submitHandler}>Send</Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <button
      onClick={() => {
          fetchAndParseEmails(2).then((data) => console.log(data))
      }}
      >
        Click me
      </button>
    </div>
  );
}

export default ChatSection;
