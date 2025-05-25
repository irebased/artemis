export default function AsciiDistributionInformation() {
    return (
        <div>
            <p>
                Ascii Distribution is a widget that displays the distribution of
                ASCII characters in the input text. For text that is provided with a
                non-ASCII encoding, the widget will first decode the text from its provided
                encoding, and then display the distribution of ASCII characters in the decoded text.
            </p>
            <ul className="list-disc list-outside mt-4 ml-4">
                <li className="mb-2">
                    Ascii Distribution can be used to observe how the text is distributed across the ASCII and extended ASCII ranges.
                </li>
                <li className="mb-2">
                    Distribuutions that are flatter across the entire table are indicative of a more complex encryption technique,
                    while distributions that are skewed to a specific range are indicative of a shift.
                </li>
            </ul>
        </div>
    );
}