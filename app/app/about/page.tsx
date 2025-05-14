'use client'
import { subtitle, title } from "@/components/primitives";

export default function AboutPage() {
  return (
    <div>
      <h1 className={title()}>About Artemis</h1>
      <p className="my-4">
        Artemis is a simple tool I created which allows you to share a dashboard of visualizations using a link. This should
        help with cryptanalysis. We built this tool while trying to solve some ciphers made by a guy named Jason Blundell.
      </p>
      <p className="my-4">
        As of May 6, 2025, we have not solved them.
      </p>
      <p className="my-4">
        But there is still hope that one day we will. Who knows. I sure don't. In the meantime, hit me up on discord <strong className="text-blue-800">@rebase</strong> if
        you have any feature requests.
      </p>
      <h3 className={subtitle()}>FAQ</h3>
      <h4 style={{paddingBottom: 8}}><strong>How do you calculate the IC and entropy of different bases for English text?</strong></h4>
      <p>
        I take a 500-word English text, convert it to the expected base, and calculate the entropy, IC, or other
        calculation. So you can test the functionality independently, here is the sample text that I use:
      </p>
      <br/>
      <details>
        <summary style={{userSelect: "none"}}>Sample English Text</summary>
        <i className="text-gray-400">In the quiet town of Maple Hollow, time seemed to move differently. The mornings began
        not with the blaring noise of alarms but with the gentle chirping of birds and the soft
        golden light that streamed through the leaves of ancient oak trees.At the heart of the
        town stood a small, brick library, its worn steps and creaky doors offering a welcome
        to all who sought refuge in the world of words. Every morning, Ms. Penelope Hart, the
        town’s beloved librarian, would unlock the doors precisely at nine o’clock, carrying
        with her a small basket filled with fresh scones she baked herself. Children would often
        race down the cobbled streets, their laughter echoing between the stone buildings, eager
        to claim their favorite reading nooks before they were taken. The library wasn’t just a
        place to read; it was the beating heart of the community, a place where ideas blossomed
        and friendships were born. Old Mr. Whitaker, a retired sailor, spent hours telling tales
        of the sea to wide-eyed listeners, while young Emily Langston scribbled furiously in her
        notebook, dreaming of one day writing stories of her own. Outside, the seasons painted the
        town in vivid colors: spring’s delicate pink blossoms, summer’s rich green canopy, autumn’s
        fiery reds and oranges, and winter’s quiet, snowy hush. Festivals marked each change, with
        townsfolk gathering in the square to share food, music, and laughter under strings of twinkling
        lights. Life in Maple Hollow moved at a pace set by the rhythm of nature rather than the ticking
        of a clock, and few wished it any other way. Even the occasional visitor who stumbled upon the
        town often found themselves enchanted by its charm, lingering longer than they had planned.
        Some said it was the scent of fresh bread from the bakery on Main Street; others believed it
        was the warmth of the people, their sincere smiles and unwavering hospitality. Perhaps it was
        the way the stars shone so brightly at night, unpolluted by the harsh lights of the city,
        offering a breathtaking canopy to anyone who cared to look up. Whatever the reason, those who
        found their way to Maple Hollow rarely wanted to leave, and many who did left a piece of their
        heart behind. In a world that often seemed too fast, too loud, and too complicated, Maple Hollow
        remained a sanctuary of simplicity and connection, a gentle reminder that happiness often grows
        in the places we least expect it, nurtured by the small, everyday kindnesses of ordinary people
        living extraordinary lives. The clock tower that rose above the town square chimed every hour,
        its clear, resonant tones carrying on the breeze, not as a warning of time slipping away, but as
        an invitation to savor each passing moment. And so the days rolled on, one after another, a tapestry
        of memories woven with laughter, love, and an unspoken promise that here, in this little hollow
        sheltered by hills and hope, life would always be just a little sweeter, and dreams would always
        find a place to take root.</i>
      </details>
    </div>
  );
}
