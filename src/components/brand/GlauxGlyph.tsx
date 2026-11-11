import { useArtId } from "./artId";
import { OwlGradients, OwlHead } from "./owlArt";

/**
 * The Glaux owl on its own, for header, footer and icon sizes.
 *
 * The same artwork as the full mark with the astrolabe ring left off and the
 * frame cropped to the owl, so at 32px the owl is half as large again as it
 * would be inside its ring. The square frame keeps 6 units of air on the
 * sides; the owl is a little wider than it is tall.
 */
export default function GlauxGlyph({
  size = 32,
  className,
  detail = "compact",
}: {
  size?: number | string;
  className?: string;
  /** "full" restores the sensor ticks and fine rings; worth it from ~96px up. */
  detail?: "full" | "compact";
}) {
  const id = useArtId();

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="170 178 660 660"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <OwlGradients id={id} />
      <OwlHead id={id} detail={detail} />
    </svg>
  );
}
