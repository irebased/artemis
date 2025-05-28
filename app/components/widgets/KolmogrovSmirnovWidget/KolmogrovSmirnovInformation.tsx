export default function KolmogrovSmirnovInformation() {
    return (
        <div>
            <p>
                The Kolmogorov-Smirnov test is a non-parametric test that tests the hypothesis that two samples are drawn from the same distribution.
            </p>
            <ul className="list-disc list-outside mt-4 ml-4">
                <li className="mb-2">
                    In this widget, you can test the hypothesis that the distribution of the input text is the same as the distribution of the English language (Theoretical distribution).
                </li>
                <li className="mb-2">
                    Your input text is compared to a reference English text, which is 500 words long and encoded in the same encoding as your input text.
                </li>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 mt-4">
                    <thead className="text-sm text-left rtl:text-right text-black dark:text-white bg-gray-100 dark:bg-gray-800">
                        <tr>
                            <th>KT Statistic</th>
                            <th>P-Value</th>
                            <th>Conclusion</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td>{"Low (< 0.05)"}</td>
                            <td>{"High (> 0.05)"}</td>
                            <td>Indicates that the input text does not align with the theoretical distribution of English.</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td>{"Moderate (0.05 - 0.15)"}</td>
                            <td>{"Moderate (0.01-0.05)"}</td>
                            <td>There may be some alignment between the input text and the theoretical distribution of English.</td>
                        </tr>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td>{"High (> 0.15)"}</td>
                            <td>{"Low (< 0.01)"}</td>
                            <td>There is a strong alignment between the input text and the theoretical distribution of English.</td>
                        </tr>
                    </tbody>
                </table>
            </ul>
        </div>
    );
}