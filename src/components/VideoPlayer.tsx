import { useRef } from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({
  src,
  width,
  height,
}: {
  src: string;
  width: string;
  height: string;
}) {
  const playerRef = useRef(null);

  return (
    <ReactPlayer
      src={src}
      width={width}
      height={height}
      controls={true}
      ref={playerRef}
    />
  );
}
