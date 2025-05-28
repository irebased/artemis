export default function ShannonEntropyInformation() {
    return (
        <div>
            <p>
                Shannon Entropy is a measure of the uncertainty of a random variable.
                It is a measure of the amount of information in the text.
            </p>
            <ul className="list-disc list-outside mt-4 ml-4">
                <li className="mb-2">
                The higher the entropy, the more random the text is.
                </li>
                <li className="mb-2">
                The lower the entropy, the more predictable the text is.
                </li>
            </ul>
        </div>
    );
}