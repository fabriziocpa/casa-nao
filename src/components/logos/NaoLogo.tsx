import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type Props = Omit<SVGProps<SVGSVGElement>, "fill"> & {
  title?: string;
};

export function NaoLogo({ className, title = "CASA NAO", ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 121 45"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      fill="currentColor"
      className={cn("select-none pointer-events-none [-webkit-user-drag:none]", className)}
      {...rest}
    >
      <title>{title}</title>
      <path d="M33.728 44.8L2.112 12.8V44.8H0V0L31.68 32V0H33.728V44.8ZM67.548 44.8L53.66 12.544L40.156 44.8H37.852L56.732 0L76.188 44.8H67.548ZM75.577 22.464C75.577 10.112 85.561 0 97.913 0C110.329 0 120.377 10.112 120.377 22.464C120.377 34.816 110.329 44.8 97.913 44.8C85.561 44.8 75.577 34.816 75.577 22.464ZM92.281 4.736C88.889 4.736 85.817 5.824 83.577 8.128C77.817 13.76 79.801 24.768 87.673 32.704C92.473 37.44 98.489 40.128 103.609 40.128C107.001 40.128 110.009 39.04 112.313 36.8C118.009 31.04 116.153 20.096 108.217 12.16C103.417 7.424 97.401 4.736 92.281 4.736Z" />
    </svg>
  );
}
