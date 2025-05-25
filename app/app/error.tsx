"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>Please report this issue to the&nbsp;
        <a href="https://github.com/irebased/artemis/issues" className="text-blue-500 underline">issue tracker</a>.</p>
      <br/><br/>
      <button
        onClick={
          () => reset()
        }
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Take me back to the dashboard
      </button>
    </div>
  );
}
