import { colors } from '../../util/util.js';

const { reset, fg_white } = colors;

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

const pallets = [
    //[colors.fg_cyan, colors.fg_blue],
    [colors.fg_blue, fg_white],
    //[colors.fg_cyan, fg_white],
    //[colors.fg_green, fg_white],
    //[colors.fg_yellow, fg_white],
    //[colors.fg_red, fg_white]
];

export function generate_logo() {
    // choose a random palette each time
    const pallet = pallets[Math.floor(Math.random() * pallets.length)];

    let logo = '';

    for(let char of LOGO) {
        if(char === '$') {
            logo += pallet[0] + char;
        } else {
            logo += pallet[1] + char;
        }
    }
    
    return logo + reset;
}

export const logo_height = LOGO.split('\n').length;
export const logo_width = LOGO.split('\n')[5].length;