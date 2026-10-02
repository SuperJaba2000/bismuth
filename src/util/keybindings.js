import { screen, ui } from "../app.js";

export function initKeybindings() {
    screen.key(['tab'], () => {
        ui.nextTab();
    });
}