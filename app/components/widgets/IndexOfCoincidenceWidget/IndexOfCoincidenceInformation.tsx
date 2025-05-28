export default function IndexOfCoincidenceInformation() {
    return (
        <div>
            <p>
                The index of coincidence is a statistical measure that calculates the
                likelihood of two randomly selected characters in the text being the same. In
                this widget, you can also calculate the index of coincidence for bigrams and trigrams, and
                view the index of coincidence over a period.
            </p>
            <ul className="list-disc list-outside mt-4 ml-4">
                <li className="mb-2">
                    Index of Coincidence can be used to analyze the randomness of a set of symbols.
                </li>
                <li className="mb-2">
                    A higher IOC indicates a less random distribution of symbols, while a lower IOC indicates a more random distribution.
                </li>
            </ul>
        </div>
    );
}