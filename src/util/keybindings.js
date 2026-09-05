import { screen } from "../index.js";

export function init_important_keybindings() {
    screen.key(['C-c'], () => process.exit(0));
}

export function init_keybindings() {
    


}



    // // debug function
    // screen.key(['r'], () => {
    //     if(!DEBUG) return;

    //     init_ui();

    //     logger.info('ui reloaded by hotkey');
    //     show_message('Player reloaded!', 1);
    // });

    // // debug function
    // screen.key(['a'], () => {
    //     if(!DEBUG) return;

    //     reset_audio_system();

    //     logger.info('audio system reloaded by hotkey');
    //     show_message('Audio system reloaded!', 1);
    // })