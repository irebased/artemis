# Welcome to Artemis

Artemis is an open source tool which enables cryptanalysts to create sharable dashboards of cryptanalysis datapoints for ciphers.

This tool is useful for analyzing ciphers to deduce how they were created, comparing them to other ciphers. It is also useful for
testing how strong a cipher of your creation is.

## Features

- Create a dashboard that compares up to 5 ciphertexts at once.
- Resize and reorder widgets that snap to a grid system for easy organization.
- Each text can be configured to ignore whitespace, punctuation, and spacing separately.
- Dashboard locking: lock your dashboard for a viewing experience that does not experience any interference from the resizing and reordering system.
- Dark mode and light mode supported
- The ciphertexts, their configuration (encoding, ignore options, etc.), the locked/unlocked status of the dashboard, as well as the layout, sizing, and configuration of each widget, are all preserved in the URL via query parameters, so you can save your link and come back later. You can also share it with your peers so they can view it too. Precaution: for larger dashboards that compare large amounts of data, links will become too long to send over platforms like Discord. I recommend using a site like [tinyurl](https://tinyurl.com/) to create a shortened link before sharing.

### Widgets

The following widgets are available for evaluating ciphertext:

- **Frequency Analysis**: Performs frequency analysis on your string without decoding it.
- **ASCII Distribution**: Decodes your string based on the configured encoding, then plots the data on an ASCII number line.
- **Frequency Standard Deviation**: Calculates the standard deviation of character frequency for your encoded string.
- **Index of Coincidence**: Calculates the IC of your text without decoding it. Based on your encoding, an English text baseline IC and a random text baseline IC will also be displayed in the table for reference. These are English and random texts that are encoded in your text's encodings for accurate comparison. Also supports period-based calculations to view the IC over specific chunks of the text.
- **Shannon Entropy**: Calculates the Shannon Entropy of your text without decoding it. Based on your encoding, an English text baseline entropy and a random text baseline entropy will also be displayed in the table for reference. These are English and random texts that are encoded in your text's encodings for accurate comparison. Also supports a sliding window chart which charts the entropy over window sizes of either 16, 32, 64, 128, or 256 character chunks.

## Feature requests and bugs

For any feature requests including new widgets or new forms of analysis in general, or to report any bugs, please create an [issue](https://github.com/irebased/artemis/issues) describing in detail what you would like to see come to the dashboard or what issue you've encountered.