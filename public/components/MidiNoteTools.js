class MidiNoteTools {
    static MIDI_TO_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    static NAME_TO_MIDI = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}


    /**
     * Retourne le nom de la note correspondant au code midi de celle-ci.
     * @param   {number}    midiNote Code midi de la note
     * @returns {string} Nom de la note
     */
    static getName(midiNote)
    {
        return MidiNoteTools.MIDI_TO_NAME[midiNote % 12];
    }


    /**
     * @param {string} completeNoteName Note name + octave (ex: A5)
     */
    static getMidiNote(completeNoteName) {
        let [, noteName, octave] = /^([a-gA-G]#?)(\d)$/.exec(completeNoteName) || [];
        return MidiNoteTools.NAME_TO_MIDI[noteName.toUpperCase()] + octave * 12;
    }


    /**
     * Retourne le numréro de l'octage correspondant au code midi de la note.
     * @param   {number} midiNote Code midi de la note
     * @returns {number} Numéro de l'octave de la note
     */
    static getOctave(midiNote)
    {
        return Math.floor(midiNote / 12);
    }


    /**
     * @param {number} midiNote
     * @returns {number}
     */
    static getFrequency(midiNote) {
        return Math.pow(2, ((midiNote - 69) / 12)) * 440;
    }


  /**
   * @param   {string} name
   * @param   {number} fromMidiNote
   * @returns {number}
   */
    static getPreviousMidiNoteByName(name, fromMidiNote) {
      let noteIndex = fromMidiNote;

      do {
        noteIndex--;
      } while(MidiNoteTools.getName(noteIndex) !== name);

      return noteIndex;
    }


  /**
   * @param   {string} name
   * @param   {number} fromMidiNote
   * @returns {number}
   */
  static getNextMidiNoteByName(name, fromMidiNote) {
    let noteIndex = fromMidiNote;

    do {
      noteIndex++;
    } while(MidiNoteTools.getName(noteIndex) !== name);

    return noteIndex;
  }
}