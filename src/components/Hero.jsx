import React from "react";
import Typer from "./ui/Typer";
import GetStarted from "./ui/GetStarted";

function Hero() {
return (
    <div>
        <section className="bg-gray-900 text-white">
            <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
                <div className="mx-auto max-w-3xl text-center">
                    <h1>
                        <span className="text-4xl font-extrabold">Welcome to</span>
                        <span className="block text-5xl font-extrabold">Mailbot, the bot ofc and... </span>
                    </h1>

                    <Typer
                    contents={
                            [
                                    "Write mails like a pro",
                                    "Handle your emails like a boss",
                                    "Get rid of the spam",
                                    "Focus on what matters."
                            ]
                    }
                    className={"bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl"}
                    />

                    <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
                        Yes, only Google Authentication is active right now, but hey.... stay tuned 🔥

                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <GetStarted/>

                        <a
                            className="block w-full rounded border border-blue-600 px-12 py-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
                            href="#"
                        >
                            Learn More 📚
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </div>
);
}

export default Hero;
