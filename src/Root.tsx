import { Composition } from "remotion";
import { PassportRanking, TOTAL_FRAMES as PASSPORT_FRAMES } from "./longform/passportRanking/PassportRanking";
import { HeadToHead, TOTAL_FRAMES as HEAD_TO_HEAD_FRAMES } from "./longform/headToHead/HeadToHead";
import { ChartRace, TOTAL_FRAMES as CHART_RACE_FRAMES } from "./longform/chartRace/ChartRace";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="PassportRanking"
        component={PassportRanking}
        durationInFrames={PASSPORT_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeadToHead"
        component={HeadToHead}
        durationInFrames={HEAD_TO_HEAD_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ChartRace"
        component={ChartRace}
        durationInFrames={CHART_RACE_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
