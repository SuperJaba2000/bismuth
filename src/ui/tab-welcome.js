import blessed from 'reblessed';
import { join } from 'path';
import { screen } from '../index.js';
import { ui_options } from '../ui.js';

const LOGO = `


$$$$$$$\\  $$\\                                     $$\\     $$\\       
$$  __$$\\ \\__|                                    $$ |    $$ |      
$$ |  $$ |$$\\  $$$$$$$\\ $$$$$$\\$$$$\\  $$\\   $$\\ $$$$$$\\   $$$$$$$\\  
$$$$$$$\\ |$$ |$$  _____|$$  _$$  _$$\\ $$ |  $$ |\\_$$  _|  $$  __$$\\ 
$$  __$$\\ $$ |\\$$$$$$\\  $$ / $$ / $$ |$$ |  $$ |  $$ |    $$ |  $$ |
$$ |  $$ |$$ | \\____$$\\ $$ | $$ | $$ |$$ |  $$ |  $$ |$$\\ $$ |  $$ |
$$$$$$$  |$$ |$$$$$$$  |$$ | $$ | $$ |\\$$$$$$  |  \\$$$$  |$$ |  $$ |
  \\_______/ \\__|\\_______/ \\__| \\__| \\__| \\______/    \\____/ \\__|  \\__|  
     
`;

let tab_welcome_logo;
let tab_welcome_separator;



function generate_logo() {
    let logo = '';

    for(let char of LOGO) {
        if(char === '$') {
            logo += BLUE_CODE + char;
        } else {
            logo += WHITE_CODE + char;
        }
    }
    
    return logo + RESET_CODE;
}

export function init_tab_welcome() {
    tab_welcome_logo = blessed.box({
        ...ui_options['tab_welcome_logo'],
        content: generate_logo()
    });
    tab_welcome_separator = blessed.box(ui_options['tab_welcome_separator']);
    tab_welcome_separator.top = LOGO.split('\n').length-1;

    screen.append(tab_welcome_logo);
    screen.append(tab_welcome_separator);
    screen.render();
}

export function show_tab_welcome() {
    tab_welcome_logo.show();
    tab_welcome_separator.show();
    screen.render();
}

export function hide_tab_welcome() {
    tab_welcome_logo.hide();
    tab_welcome_separator.hide();
    screen.render();
}