export default function FrequencyAnalysisInformation() {
    return (
        <div>
          <p>
            Frequency Analysis is a widget that displays the
            frequency of each character in the input text. It
            supports n-gram analysis between 1-10-gram size.
            Evaluates based on either sliding window or blocks.
          </p>
          <ul className="list-disc list-outside mt-4 ml-4">
            <li className="mb-2">
              Frequency Analysis can be used to identify patterns in the
              text, such as the frequency of characters in English text,
              or to identify the most common n-grams in the text.
            </li>
          </ul>
        </div>
    );
}