import { Composition } from "remotion";
import { PassportRanking, TOTAL_FRAMES } from "./longform/passportRanking/PassportRanking";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PassportRanking"
        component={PassportRanking}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
