import { Composition, Folder } from "remotion";
import { PassportRanking, TOTAL_FRAMES as PASSPORT_FRAMES } from "./longform/passportRanking/PassportRanking";
import { HeadToHead, TOTAL_FRAMES as HEAD_TO_HEAD_FRAMES } from "./longform/headToHead/HeadToHead";
import { ChartRace, TOTAL_FRAMES as CHART_RACE_FRAMES } from "./longform/chartRace/ChartRace";
import { ProfileImage } from "./brand/ProfileImage";
import { CoverImage } from "./brand/CoverImage";

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

      {/* Brand stills — grouped under a "brand" folder in the Studio sidebar.
          Single-frame compositions exported via `npm run export:brand` to
          brand/profile.png and brand/cover.png. */}
      <Folder name="brand">
        <Composition
          id="ProfileImage"
          component={ProfileImage}
          durationInFrames={1}
          fps={30}
          width={800}
          height={800}
        />
        <Composition
          id="CoverImage"
          component={CoverImage}
          durationInFrames={1}
          fps={30}
          width={2560}
          height={1440}
        />
      </Folder>
    </>
  );
};
