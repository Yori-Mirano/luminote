/**
 * @group MIDI
 * @module MidiNoteTools
 */
export class MidiNoteTools {

  static readonly MIDI_TO_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static readonly NAME_TO_MIDI: {[key: string] : number} = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


  /**
   * Retourne le nom de la note correspondant au code midi de celle-ci.
   * @param   midiNote - Code midi de la note
   * @returns Nom de la note
   */
  static getName(midiNote: number): string
  {
    return MidiNoteTools.MIDI_TO_NAME[midiNote % 12];
  }


  /**
   * @param completeNoteName - Note name + octave (ex: A5)
   */
  static getMidiNote(completeNoteName: string) {
    let [, noteName, octave] = /^([a-gA-G]#?)(\d)$/.exec(completeNoteName) || [];
    return MidiNoteTools.NAME_TO_MIDI[noteName.toUpperCase()] + Number(octave) * 12;
  }


  /**
   * Retourne le numréro de l'octage correspondant au code midi de la note.
   * @param   midiNote - Code midi de la note
   * @returns Numéro de l'octave de la note
   */
  static getOctave(midiNote: number): number
  {
    return Math.floor(midiNote / 12);
  }


  /**
   * @param midiNote
   */
  static getFrequency(midiNote: number): number {
    return Math.pow(2, ((midiNote - 69) / 12)) * 440;
  }

  /**
   *
   * @param name
   * @param fromMidiNote
   */
  static getPreviousMidiNoteByName(name: string, fromMidiNote: number): number {
    let noteIndex = fromMidiNote;

    do {
      noteIndex--;
    } while(MidiNoteTools.getName(noteIndex) !== name);

    return noteIndex;
  }

  /**
   *
   * @param name
   * @param fromMidiNote
   */
  static getNextMidiNoteByName(name: string, fromMidiNote: number): number {
    let noteIndex = fromMidiNote;

    do {
      noteIndex++;
    } while(MidiNoteTools.getName(noteIndex) !== name);

    return noteIndex;
  }

}
