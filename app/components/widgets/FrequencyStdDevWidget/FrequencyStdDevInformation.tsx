export default function FrequencyStdDevInformation() {
    return (
        <div>
            <p>
                Frequency StdDev is a widget that displays the standard deviation of the frequency of
                each character in the input text.
            </p>
            <ul className="list-disc list-outside mt-4 ml-4">
                <li className="mb-2">
                    Frequency StdDev can be used to identify how uniform or skewed the character distribution is.
                </li>
                <li className="mb-2">
                    A low FSD indicates a uniform distribution (randomness), while a high FSD indicates a skewed distribution (non-randomness).
                </li>
            </ul>
        </div>
    );
}