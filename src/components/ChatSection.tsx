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

function ChatSection() {
  const dispatch = useDispatch();
  const messages = useSelector((state : any) => state.messages.value);
  console.log(messages);
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
            <div className="flex-1 p-6 overflow-auto">
              <span className="font-semibold">Conversation</span>
              {/* Messages will go here */}
              <ul>
                {messages.map((msg : string, index : number) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-300"></div>

            {/* Input Section */}
            <div className="p-4 bg-gray-100 dark:bg-gray-950 flex gap-2">
              <Textarea placeholder="Type your message here." className="flex-1 dark: bg-gray-800" />
              <Button
              onClick={() => {
                dispatch(addMsg("Hello, World!"));
              }}
              >Send</Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ChatSection;
