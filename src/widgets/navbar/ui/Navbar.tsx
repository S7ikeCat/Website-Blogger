"use client"

import Logo from "@/shared/assets/logo.png"
import Image from "next/image"
import Arrow from "@/shared/assets/arrow.png"

export function Navbar() {

  return (
    <div>
    {/* Navbar */}
    <div className="m-6">
    <div className="flex items-center justify-between w-full gap-6">
  {/* Logo */}
  <Image
    src={Logo}
    alt="Logo"
    width={150}
    height={70}
  />
  {/* Button wrapper */}
  <div className="relative inline-block">
    <div className="absolute -left-2.5 top-2.5 h-full w-full bg-black" />
    <button
      className="
        relative
        inline-flex items-center gap-3
        border-2 border-black
        bg-white
        px-6 py-3
        font-semibold text-black
        transition-transform
        active:-translate-x-0.5
        active:translate-y-0.5
      "
    >
      <span>Get started</span>

      <Image
        src={Arrow}
        alt=""
        width={20}
        height={20}
      />
    </button>
  </div>
</div>
</div>

  

</div>
  )
}

export default Navbar