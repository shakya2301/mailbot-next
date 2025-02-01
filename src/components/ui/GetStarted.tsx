"use client";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import React from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function GetStarted() {
  const { data: session, status } = useSession();
  const unauth = status === "unauthenticated";
  return unauth ? (
    <AlertDialog>
      <AlertDialogTrigger>
        <div>
          <button className="block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto dark:hover: transition-colors">
            Get Started 🚀
          </button>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle>You haven't logged in yet.</AlertDialogTitle>
          <AlertDialogDescription>
            You need to log in to start chatting with us. Do you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
          onClick={() => signIn("google")}
          >
            Continue
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <div>
      <Link href="/chat">
        <button className="block w-full rounded border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto dark:hover: transition-colors">
          Get Started 🚀
        </button>
      </Link>
    </div>
  );
}

export default GetStarted;
