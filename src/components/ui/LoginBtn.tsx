"use client";
import { useSession, getSession } from "next-auth/react"; // usesession is a react hook which rereners the component when the session changes
import React from "react";
import { signIn, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


function LoginBtn() {
  const { data: session, status } = useSession();
  console.log("session in sign in", session);
  const imageLink = session?.picture;
  const namearray = session?.user?.name.split(" ") || ["O", "O"];
  const fallback = namearray[0][0] + namearray[1][0];
  console.log("img link " ,imageLink);
  
  return !session ? (
    <div>
      <button onClick={() => signIn("google")}>
        <a className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black shadow dark:hover:bg-teal-500 dark:hover:transition-colors ">
          Login
        </a>
      </button>
    </div>
  ) : (
    <div className="flex flex-row">
      <DropdownMenu>
        <DropdownMenuTrigger>
        <div className="m-4">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={imageLink}
              alt={session?.user?.name  ?? ""}
            />

            {/* <img src={session.user.image} alt={session.user.name ?? ""} className="w-8 h-8 rounded-full" /> */}
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
            <DropdownMenuLabel>
                {
                    session?.user?.name
                }
            </DropdownMenuLabel>

            <DropdownMenuSeparator/>

            <DropdownMenuItem>
                {
                    `Email : ${session?.user?.email}`
                }
            </DropdownMenuItem>
            <DropdownMenuItem>
                {
                    `Plan : Free Plan`
                }
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button onClick={() => signOut()}>
        <a className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow dark:hover:bg-white dark:hover:text-black dark:hover:transition-colors ">
          Sign Out
        </a>
      </button>
    </div>
  );
}

export default LoginBtn;
