"use client";

import { useId } from "react";

export function JarGlass({ lid = false, className }: { lid?: boolean; className?: string }) {
  const id = useId();
  return lid ? <g className={className}>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#dbe9dd" /><stop offset="1" stopColor="#b3cab7" /></linearGradient></defs>
    <rect x="129" y="126" width="182" height="10" fill="#b3cab7" />
    <rect x="117" y="98" width="206" height="34" rx="17" fill={`url(#${id})`} />
    <rect x="129" y="104" width="92.7" height="5" rx="2.5" fill="white" opacity=".7" />
  </g> : <g className={className}>
    <defs><linearGradient id={id}><stop stopColor="#e6f0e6" /><stop offset=".22" stopColor="#fdfcf8" /><stop offset=".8" stopColor="#fdfcf8" /><stop offset="1" stopColor="#e6f0e6" /></linearGradient></defs>
    <ellipse cx="220" cy="436" rx="107" ry="9" fill="#22302a22" />
    <rect x="125" y="132" width="190" height="300" rx="34" fill={`url(#${id})`} stroke="#c8dacb" strokeWidth="3" />
    <path d="M128 324 H312 V398 C312 416 298 430 280 430 H160 C142 430 128 416 128 398 Z" fill="#b98f63" />
    <ellipse cx="220" cy="324" rx="92" ry="7" fill="#c9a077" />
    <rect x="138" y="154" width="9" height="92" rx="4.5" fill="white" opacity=".95" />
  </g>;
}
