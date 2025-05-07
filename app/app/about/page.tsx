import { title } from "@/components/primitives";

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
    </div>
  );
}
