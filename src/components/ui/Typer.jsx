"use client";

import React from "react";
import { TypeAnimation } from "react-type-animation";

function Typer({ contents = ["Sample Content"], speed =50, time= 2000, className }) {
  // Flatten the sequence with delays
  const sequence = contents.flatMap((content) => [content, time]);

  return (
    <TypeAnimation
      sequence={sequence}
      wrapper="span"
      speed={speed}
      className={`${className}`}
      repeat={Infinity}
    />
  );
}

export default Typer;
