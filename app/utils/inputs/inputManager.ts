import { Ciphertext } from '@/types/ciphertext';
import { INPUT_COLORS } from '@/types/dashboard/dashboardTypes';

/**
 * Add a new input to the inputs array
 * @param inputs Current inputs array
 * @param setInputs Function to update inputs state
 * @returns void
 */
export function addInput(
  inputs: Ciphertext[],
  setInputs: (updater: (prev: Ciphertext[]) => Ciphertext[]) => void
): void {
  if (inputs.length < 5) {
    setInputs(prev => [...prev, {
      id: prev.length + 1,
      text: '',
      encoding: 'ascii',
      ignorePunctuation: false,
      ignoreWhitespace: false,
      ignoreCasing: false,
      color: INPUT_COLORS[prev.length]
    }]);
  }
}

/**
 * Remove an input by ID from the inputs array
 * @param id ID of the input to remove
 * @param setInputs Function to update inputs state
 * @returns void
 */
export function removeInput(
  id: number,
  setInputs: (updater: (prev: Ciphertext[]) => Ciphertext[]) => void
): void {
  setInputs(prev => prev.filter(input => input.id !== id));
}

/**
 * Update the text of a specific input by ID
 * @param id ID of the input to update
 * @param text New text value
 * @param setInputs Function to update inputs state
 * @returns void
 */
export function updateInputText(
  id: number,
  text: string,
  setInputs: (updater: (prev: Ciphertext[]) => Ciphertext[]) => void
): void {
  setInputs(prev => prev.map(input =>
    input.id === id ? { ...input, text } : input
  ));
}

/**
 * Create a new input with default values
 * @param id ID for the new input
 * @param colorIndex Index for color selection
 * @returns New Ciphertext object
 */
export function createNewInput(id: number, colorIndex: number): Ciphertext {
  return {
    id,
    text: '',
    encoding: 'ascii',
    ignorePunctuation: false,
    ignoreWhitespace: false,
    ignoreCasing: false,
    color: INPUT_COLORS[colorIndex]
  };
}

/**
 * Check if an input can be added (max 5 inputs)
 * @param inputs Current inputs array
 * @returns boolean indicating if input can be added
 */
export function canAddInput(inputs: Ciphertext[]): boolean {
  return inputs.length < 5;
}

/**
 * Get the next available input ID
 * @param inputs Current inputs array
 * @returns Next available ID
 */
export function getNextInputId(inputs: Ciphertext[]): number {
  return inputs.length + 1;
}