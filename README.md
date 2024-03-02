# <img src="./logo-luminote.svg" alt="Lumitote" width="240"/>

> Luminote is a visualization tool developed to enhance the experience of playing a digital piano. Connected via MIDI, Luminote displays the notes as they are played. It also highlights sustained notes in blue, allowing musicians to distinctly see their sustain usage.
> 
> In addition to this, Luminote can communicate with a WS2812 LED strip via an ESP32 over Wi-Fi, offering a visual representation of notes and sustains on the LED strip.

## Features

1. **MIDI Connectivity:** Luminote can connect to your digital piano via MIDI.
2. **Sustain Visualization:** Any notes held by the sustain pedal are distinctly displayed in blue.
3. **LED strip integration:** Luminote can send light configurations to a WS2812 LED strip connected through an ESP32 over Wi-Fi.

For ESP32 program, go to my [websocket-esp32-remote-led-strip repository](https://github.com/Yori-Mirano/websocket-esp32-remote-led-strip).

## Getting Started

### Demo
Experience Luminote for yourself here: [Demo Link](https://yori-mirano.github.io/luminote/luminote.html)

### Preview
#### Slide up mode
![Slide up mode](preview-1.jpg)

#### Skylines mode
![Skylines mode](preview%202.jpg)

### Usage
To use Luminote, open `dist/luminote.html` in a browser.

## For Developers

### Requirements
- Node.js v18

### Watching changes
Start the development server using `npm start`, then open `http://localhost:8080/luminote.html` in your browser.

### Building the Project
Use `npm run build` to generate the `dist/luminote.html` file and the API documentation in the `dist/docs` directory.

### Documentation
Find the detailed documentation [here](https://yori-mirano.github.io/luminote/docs/modules.html).
