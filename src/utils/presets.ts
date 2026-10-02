import { AppNode, NodeConnection, DrawingNodeData } from '../types/nodes';
import { hexToRgb } from './palettes';

// Helper to fill a 16x16 frame pixel buffer from an ASCII art string
// '.' = transparent, letters = color map
export function asciiToPixels(
  asciiLines: string[],
  colorMap: Record<string, string>,
  size = 16
): number[] {
  const pixels = new Array(size * size * 4).fill(0);

  for (let y = 0; y < size; y++) {
    const line = asciiLines[y] || '';
    for (let x = 0; x < size; x++) {
      const ch = line[x] || '.';
      if (ch !== '.' && colorMap[ch]) {
        const [r, g, b] = hexToRgb(colorMap[ch]);
        const idx = (y * size + x) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
    }
  }

  return pixels;
}

// Slime Color Palette:
const SLIME_COLORS = {
  'G': '#10b981', // Emerald main body
  'D': '#047857', // Dark shade outline
  'L': '#6ee7b7', // Light highlight
  'W': '#ffffff', // Eye white / glint
  'B': '#064e3b', // Eye pupil / dark
  'C': '#a7f3d0'  // Gloss reflection
};

// Resting Slime (Frame 1)
const SLIME_REST = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '......DDDD......',
  '....DGLLLLGD....',
  '...DGLCCCCLLD...',
  '..DGLLLLLLLLGD..',
  '..DG.WB.WBLLGD..',
  '.DGLL..B..LLGGD.',
  '.DGLLLLLLLLGGGD.',
  '.DGGGGGGGGGGGGD.',
  '..DDDDDDDDDDDD..',
  '................',
  '................'
];

// Stretched / Jump Slime (Frame 2)
const SLIME_JUMP = [
  '................',
  '................',
  '......DDDD......',
  '....DGLLLLGD....',
  '...DGLCCCCLLD...',
  '...DGLLLLLLGD...',
  '...DG.WB.WBGD...',
  '...DGL.B.LGGD...',
  '...DGGLLLLGGD...',
  '...DGGGGGGGGD...',
  '...DGGGGGGGGD...',
  '....DDDDDDDD....',
  '................',
  '................',
  '................',
  '................'
];

// Squashed / Land Slime (Frame 3)
const SLIME_SQUASH = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '....DDDDDDDD....',
  '..DGLLCCCCLLGD..',
  '.DGLLLLLLLLLLGD.',
  'DGL.B...B..LLGGD',
  'DGGLLLLLLLLGGGGD',
  'DGGGGGGGGGGGGGGD',
  '.DDDDDDDDDDDDDD.',
  '................',
  '................'
];

// Adventurer Palette:
const ADV_COLORS = {
  'H': '#dc2626', // Red cap/hat
  'S': '#fcd34d', // Skin tone
  'B': '#1e3a8a', // Blue tunic
  'L': '#3b82f6', // Light blue
  'P': '#172554', // Dark blue pants
  'W': '#ffffff', // Eye white
  'K': '#0f172a', // Black eye / outline
  'O': '#78350f'  // Brown boots
};

// Adventurer Walk Cycle 1: Contact
const ADV_WALK_1 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHHHHHH.....',
  '....SSSSSS......',
  '....SKWSKW......',
  '....SSSSSS......',
  '.....BBBB.......',
  '....LBBBBB......',
  '...LLBBBBB......',
  '...L.BBBBB......',
  '.....PP.PP......',
  '....PP...PP.....',
  '...OO.....OO....',
  '...OO...........',
  '................',
  '................'
];

// Adventurer Walk Cycle 2: Passing
const ADV_WALK_2 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHHHHHH.....',
  '....SSSSSS......',
  '....SKWSKW......',
  '....SSSSSS......',
  '.....BBBB.......',
  '....LBBBBB......',
  '....LLBBBB......',
  '.....BBBBB......',
  '......PPPP......',
  '.....PP..PP.....',
  '.....OO..OO.....',
  '................',
  '................',
  '................'
];

// Adventurer Walk Cycle 3: Opposite Contact
const ADV_WALK_3 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHHHHHH.....',
  '....SSSSSS......',
  '....SKWSKW......',
  '....SSSSSS......',
  '.....BBBB.......',
  '....LBBBBB......',
  '....LBBBBBLL....',
  '....BBBBB..L....',
  '.....PP.PP......',
  '....PP...PP.....',
  '...OO.....OO....',
  '..........OO....',
  '................',
  '................'
];

// Adventurer Walk Cycle 4: Passing 2
const ADV_WALK_4 = [
  '.....HHHHH......',
  '....HHHHHHH.....',
  '....HHHHHHH.....',
  '....SSSSSS......',
  '....SKWSKW......',
  '....SSSSSS......',
  '.....BBBB.......',
  '....LBBBBB......',
  '....LLBBBB......',
  '.....BBBBB......',
  '......PPPP......',
  '.....PP..PP.....',
  '.....OO..OO.....',
  '................',
  '................',
  '................'
];

// Coin / Gem Palettes:
const COIN_COLORS = {
  'Y': '#facc15', // Gold
  'D': '#b45309', // Dark gold
  'L': '#fef08a', // Light gold
  'W': '#ffffff', // Sparkle white
  'S': '#78350f'  // Shadow
};

const COIN_1 = [
  '................',
  '.....DDDDDD.....',
  '...DDYYYYYYDD...',
  '..DYYYLLLLYYYD..',
  '.DYYLLWWLLLYYYD.',
  '.DYYLW..LYYYYSD.',
  'DYYLL....YYYYYSD',
  'DYYLL....YYYYYSD',
  'DYYYY....YYYYYSD',
  'DYYYY....YYYYYSD',
  '.DYYY....YYYYSD.',
  '.DYYYYYYYYYYYSD.',
  '..DYYYYYYYYYSD..',
  '...DDSSSSSSDD...',
  '.....DDDDDD.....',
  '................'
];

const COIN_2 = [
  '................',
  '......DDDD......',
  '....DDYYYYDD....',
  '...DYYLLLLYYD...',
  '..DYYLWWLLYYYD..',
  '..DYYL..LYYYSD..',
  '.DYYLL..YYYYYSD.',
  '.DYYLL..YYYYYSD.',
  '.DYYYY..YYYYYSD.',
  '.DYYYY..YYYYYSD.',
  '..DYYY..YYYYSD..',
  '..DYYYYYYYYYSD..',
  '...DYYYYYYYYSD..',
  '....DDSSSSDD....',
  '......DDDD......',
  '................'
];

const COIN_3 = [
  '................',
  '.......DD.......',
  '.....DDYYDD.....',
  '....DYYLLYYD....',
  '....DYLWLYYD....',
  '....DYL.LYSD....',
  '...DYYL.YYYSD...',
  '...DYYL.YYYSD...',
  '...DYY..YYYSD...',
  '...DYY..YYYSD...',
  '....DYY.YYSD....',
  '....DYYYYYSD....',
  '....DYYYYYSD....',
  '.....DDSSDD.....',
  '.......DD.......',
  '................'
];

const COIN_4 = [
  '................',
  '........DD......',
  '.......DYYD.....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '......DYYYYD....',
  '.......DYYD.....',
  '........DD......',
  '................'
];

// --- 4. Flying Bat Colors & ASCII Frames ---
const BAT_COLORS = {
  'D': '#18181b', // Dark body & wing bones
  'M': '#3f3f46', // Wing membrane
  'L': '#71717a', // Highlight
  'R': '#ef4444', // Red glowing eyes
  'W': '#ffffff'  // Fangs
};

const BAT_WINGS_UP = [
  '................',
  '...D........D...',
  '..DMD......DMD..',
  '..DMML....LMMD..',
  '..DMMMD..DMMMD..',
  '..DMMMDDDMMMMD..',
  '...DMMMDDMMMD...',
  '...DDMMDDMMDD...',
  '....DDR..RDD....',
  '....DD....DD....',
  '.....DMWWMD.....',
  '.....DDMMDD.....',
  '......DDDD......',
  '.......DD.......',
  '................',
  '................'
];

const BAT_WINGS_MID = [
  '................',
  '................',
  '.DD..........DD.',
  '.DMD........DMD.',
  '.DMMD......DMMD.',
  '..DMMDDDDDDMMD..',
  '...DMMDDDDMMD...',
  '...DDDMMMMDDD...',
  '....DDR..RDD....',
  '...DD.D..D.DD...',
  '..DD..DMWWMD.DD.',
  '......DDMMDD....',
  '.......DDDD.....',
  '........DD......',
  '................',
  '................'
];

const BAT_WINGS_DOWN = [
  '................',
  '................',
  '................',
  '.....DDDDDD.....',
  '...DDMMDDMMDD...',
  '..DDMMMDDMMMDD..',
  '..DMMMDDDMMMDD..',
  '.DMMMD....DMMMD.',
  '.DMMD..DD..DMMD.',
  '.DMD..DDRD..DMD.',
  '.DD...DWWMD..DD.',
  '......DDMMD.....',
  '.......DDDD.....',
  '........DD......',
  '................',
  '................'
];

// --- 5. Cozy Crackling Campfire Colors & ASCII Frames ---
const FIRE_COLORS = {
  'Y': '#fde047', // Yellow core heat
  'O': '#f97316', // Orange flame
  'R': '#ef4444', // Red flame edge
  'W': '#ffffff', // White hot center
  'B': '#78350f', // Wood log brown
  'D': '#451a03', // Dark wood bark
  'S': '#fbbf24'  // Sparks & embers
};

const FIRE_1 = [
  '................',
  '.......S........',
  '......RR........',
  '.....ROOR.......',
  '.....ROOYR......',
  '....ROOYYOR..S..',
  '....ROYYWYO.....',
  '...ROOYYWYYOR...',
  '...ROYYYYYYOR...',
  '..ROOYYYYYYOOR..',
  '..ROOYYYYYYOOR..',
  '.ROOOOOOOOOOOOR.',
  '...DDDDDDDDDD...',
  '..DBBDBBBBBDD...',
  '.DBBBBBDBBBBDD..',
  '..DDDDDDDDDDD...'
];

const FIRE_2 = [
  '................',
  '....S...........',
  '.....RR.........',
  '....ROOYR.......',
  '...ROOYYOR......',
  '...ROYYWYOR.....',
  '...ROYYWWYO..S..',
  '..ROOYYWYYOOR...',
  '..ROOYYYYYYOR...',
  '..ROYYYYYYYOOR..',
  '.ROOOOOYYYYOOR..',
  '.ROOOOOOOOOOOR..',
  '...DDDDDDDDDD...',
  '..DBBDBBBBBDD...',
  '.DBBBBBDBBBBDD..',
  '..DDDDDDDDDDD...'
];

const FIRE_3 = [
  '................',
  '..........S.....',
  '......RR........',
  '.....ROOYOR.....',
  '....ROOYYOR.....',
  '....ROYYYYOR.S..',
  '...ROOYYWWYOR...',
  '...ROYYWYYOOR...',
  '...ROYYYYYYOOR..',
  '..ROOYYYYYYYOOR.',
  '.ROOOOYYYYYYOOR.',
  '.ROOOOOOOOOOOR..',
  '...DDDDDDDDDD...',
  '..DBBDBBBBBDD...',
  '.DBBBBBDBBBBDD..',
  '..DDDDDDDDDDD...'
];

const FIRE_4 = [
  '................',
  '.......S........',
  '.....S.RR.......',
  '......ROOR......',
  '....RROYYOR.....',
  '...ROOYYWYOR....',
  '...ROYYWWYYOR...',
  '...ROOYYWYYOOR..',
  '...ROYYYYYYYOOR.',
  '..ROOOYYYYYYOOR.',
  '..ROOOOOYYYYOOR.',
  '.ROOOOOOOOOOOOR.',
  '...DDDDDDDDDD...',
  '..DBBDBBBBBDD...',
  '.DBBBBBDBBBBDD..',
  '..DDDDDDDDDDD...'
];

// --- 6. 8-Bit Pulsing RPG Heart Colors & ASCII Frames ---
const HEART_COLORS = {
  'R': '#ef4444', // Ruby red
  'D': '#991b1b', // Dark red shadow
  'L': '#f87171', // Light red
  'W': '#ffffff', // White shine
  'K': '#450a0a'  // Dark outline
};

const HEART_BEAT_1 = [
  '................',
  '..KKKK....KKKK..',
  '.KRRRRK..KRRRRK.',
  'KRLWWRRK.KRRRRRK',
  'KRWWWWRLKRRRRRRK',
  'KRLWWRLRRRRRRRRK',
  'KRRLLRRRRRRRRRRK',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '..KRRRRRRRRRRK..',
  '...KRRRRRRRRK...',
  '....KRRRRRRK....',
  '.....KRRRRK.....',
  '......KRRK......',
  '.......KK.......',
  '................'
];

const HEART_BEAT_2 = [
  '................',
  '................',
  '...KKK....KKK...',
  '..KRRRK..KRRRK..',
  '.KRLWRRK.KRRRRK.',
  '.KRWWWRLKRRRRRK.',
  '.KRLWWLRRRRRRRK.',
  '..KRRRRRRRRRRK..',
  '..KRRRRRRRRRRK..',
  '...KRRRRRRRRK...',
  '....KRRRRRRK....',
  '.....KRRRRK.....',
  '......KRRK......',
  '.......KK.......',
  '................',
  '................'
];

const HEART_BEAT_3 = [
  '................',
  '................',
  '..KKKK....KKKK..',
  '.KRRRRK..KRRRRK.',
  'KRLLWRRK.KRRRRRK',
  'KRWWLLRRKRRRRRRK',
  'KRRRRRRRRRRRRRRK',
  '.KRRRRRRRRRRRRK.',
  '..KRRRRRRRRRRK..',
  '...KRRRRRRRRK...',
  '....KRRRRRRK....',
  '.....KRRRRK.....',
  '......KRRK......',
  '.......KK.......',
  '................',
  '................'
];

// --- 7. Retro Space Raider Colors & ASCII Frames ---
const SHIP_COLORS = {
  'S': '#94a3b8', // Hull steel
  'D': '#334155', // Dark hull
  'C': '#06b6d4', // Cyan cockpit canopy
  'W': '#ffffff', // Cockpit shine / laser tip
  'F': '#f97316', // Orange engine fire
  'Y': '#fde047', // Yellow engine fire
  'R': '#ef4444'  // Red wingtip lights
};

const SHIP_1 = [
  '................',
  '.......DD.......',
  '......DSSD......',
  '......DSWD......',
  '.....DCCSSD.....',
  '.....DCCSSD.....',
  '....DSSSSSSD....',
  '...DDSSSSSSDD...',
  '..RDSSSSSSSSDR..',
  '..RDSSSSSSSSDR..',
  '.RDDDSSSSDDDDDR.',
  '.DD..DFFFFD..DD.',
  '.....DYYYYD.....',
  '......DYYD......',
  '.......DD.......',
  '................'
];

const SHIP_2 = [
  '................',
  '.......DD.......',
  '......DSSD......',
  '......DSWD......',
  '.....DCCSSD.....',
  '.....DCCSSD.....',
  '....DSSSSSSD....',
  '...DDSSSSSSDD...',
  '..RDSSSSSSSSDR..',
  '..RDSSSSSSSSDR..',
  '.RDDDSSSSDDDDDR.',
  '.DD..DFFFFD..DD.',
  '.....DYYYYD.....',
  '.....DYYYYD.....',
  '......DYYD......',
  '.......DD.......'
];

const SHIP_3 = [
  '................',
  '.......WW.......',
  '......DSSD......',
  '......DSWD......',
  '.....DCCSSD.....',
  '.....DCCSSD.....',
  '....DSSSSSSD....',
  '...DDSSSSSSDD...',
  '..WDSSSSSSSSDW..',
  '..RDSSSSSSSSDR..',
  '.RDDDSSSSDDDDDR.',
  '.DD..DFFFFD..DD.',
  '.....DFFFFD.....',
  '.....DYYYYD.....',
  '......DYYD......',
  '.......DD.......'
];

// --- 8. Dungeon Treasure Chest Colors & ASCII Frames ---
const CHEST_COLORS = {
  'B': '#92400e', // Wood body
  'D': '#451a03', // Dark wood border
  'G': '#facc15', // Gold trim / lock
  'W': '#ffffff', // Sparkle / gem shine
  'R': '#ef4444', // Ruby gem
  'E': '#10b981', // Emerald gem
  'K': '#1c1917'  // Interior shadow
};

const CHEST_1 = [
  '................',
  '................',
  '................',
  '.....DDDDDD.....',
  '...DDBBBBBDD...',
  '..DBBBBBBBBBDD..',
  '..DGGGGGGGGGGDD.',
  '..DGBBBGGGBBGD..',
  '..DGBBBDGDBBGD..',
  '..DGGGGGGGGGGDD.',
  '..DBBBBBBBBBDD..',
  '..DBBBBBBBBBDD..',
  '..DDDDDDDDDDDD..',
  '................',
  '................',
  '................'
];

const CHEST_2 = [
  '................',
  '................',
  '....W.DDDDDD....',
  '...DDBBBBBDD...',
  '..DBBBGGGBBBDD..',
  '..DGGGGGGGGGGDD.',
  '...DGBBDGDBBGD..',
  '...DGGGGGGGGGD..',
  '..DKKKKKKKKKKDD.',
  '..DBBBBBBBBBDD..',
  '..DBBBBBBBBBDD..',
  '..DDDDDDDDDDDD..',
  '................',
  '................',
  '................',
  '................'
];

const CHEST_3 = [
  '.....DDDDDD.....',
  '...DDBBBBBDD...',
  '..DBBGGGGGBBDD..',
  '.DGGGGGGGGGGDD..',
  '.D.............D',
  '.DKKW.R.E.W.KKD.',
  '.DKKGGGGGGGGKKD.',
  '.DKKGGWRGEGGKKD.',
  '.DGGGGGGGGGGGGDD',
  '.DBBBBBBBBBBBBDD',
  '.DBBBBBBBBBBBBDD',
  '.DDDDDDDDDDDDDD.',
  '................',
  '................',
  '................',
  '................'
];

// Presets data structure
export interface PresetGraph {
  id: string;
  name: string;
  category: string;
  description: string;
  fps: number;
  canvasResolution: number;
  nodes: AppNode[];
  connections: NodeConnection[];
}

export const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'bouncing_slime',
    name: 'Bouncing Slime',
    category: 'Character / Creature',
    description: 'Squash, stretch, and bounce cycle with game boy palette',
    fps: 8,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_slime_1',
        type: 'DRAWING',
        title: 'Resting Slime',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SLIME_REST, SLIME_COLORS),
          currentColor: '#10b981',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_slime_2',
        type: 'DRAWING',
        title: 'Jump Stretched',
        x: 60,
        y: 340,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SLIME_JUMP, SLIME_COLORS),
          currentColor: '#10b981',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_slime_3',
        type: 'DRAWING',
        title: 'Squash Landing',
        x: 60,
        y: 600,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SLIME_SQUASH, SLIME_COLORS),
          currentColor: '#10b981',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_seq',
        type: 'SEQUENCER',
        title: 'Slime Sequencer',
        x: 380,
        y: 220,
        inputs: [
          { id: 'f_rest', name: 'Frame 1 (Rest)', type: 'frame', direction: 'input' },
          { id: 'f_jump', name: 'Frame 2 (Jump)', type: 'frame', direction: 'input' },
          { id: 'f_squash', name: 'Frame 3 (Squash)', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['f_rest', 'f_jump', 'f_rest', 'f_squash'],
          holdCounts: { f_rest: 2, f_jump: 2, f_squash: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_palette',
        type: 'PALETTE',
        title: 'Retro Palette',
        x: 700,
        y: 220,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Palette Stream', type: 'stream', direction: 'output' }],
        data: {
          palette: 'pico8',
          preserveBlackAndWhite: false
        }
      },
      {
        id: 'node_fx',
        type: 'TRANSFORM',
        title: 'Outline & Drop',
        x: 980,
        y: 220,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Out Stream', type: 'stream', direction: 'output' }],
        data: {
          shiftX: 0,
          shiftY: 0,
          wrapShift: false,
          flipH: false,
          flipV: false,
          rotate: 0,
          invertColors: false,
          addOutline: true,
          outlineColor: '#000000',
          glitchAmount: 0
        }
      },
      {
        id: 'node_out',
        type: 'OUTPUT',
        title: 'Output Screen',
        x: 1260,
        y: 220,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Slime Animation',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'c1', fromNodeId: 'node_slime_1', fromPortId: 'out_frame', toNodeId: 'node_seq', toPortId: 'f_rest' },
      { id: 'c2', fromNodeId: 'node_slime_2', fromPortId: 'out_frame', toNodeId: 'node_seq', toPortId: 'f_jump' },
      { id: 'c3', fromNodeId: 'node_slime_3', fromPortId: 'out_frame', toNodeId: 'node_seq', toPortId: 'f_squash' },
      { id: 'c4', fromNodeId: 'node_seq', fromPortId: 'out_stream', toNodeId: 'node_palette', toPortId: 'in_stream' },
      { id: 'c5', fromNodeId: 'node_palette', fromPortId: 'out_stream', toNodeId: 'node_fx', toPortId: 'in_stream' },
      { id: 'c6', fromNodeId: 'node_fx', fromPortId: 'out_stream', toNodeId: 'node_out', toPortId: 'in_stream' }
    ]
  },

  {
    id: 'walking_character',
    name: 'Walking Character',
    category: 'Character Walk',
    description: '4-frame retro adventurer walk cycle with fluid stride',
    fps: 10,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_adv_1',
        type: 'DRAWING',
        title: 'Contact Step L',
        x: 60,
        y: 40,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(ADV_WALK_1, ADV_COLORS),
          currentColor: '#dc2626',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_adv_2',
        type: 'DRAWING',
        title: 'Passing Step 1',
        x: 60,
        y: 280,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(ADV_WALK_2, ADV_COLORS),
          currentColor: '#dc2626',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_adv_3',
        type: 'DRAWING',
        title: 'Contact Step R',
        x: 60,
        y: 520,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(ADV_WALK_3, ADV_COLORS),
          currentColor: '#dc2626',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_adv_4',
        type: 'DRAWING',
        title: 'Passing Step 2',
        x: 60,
        y: 760,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(ADV_WALK_4, ADV_COLORS),
          currentColor: '#dc2626',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_adv_seq',
        type: 'SEQUENCER',
        title: 'Walk Sequencer',
        x: 400,
        y: 320,
        inputs: [
          { id: 'f_walk1', name: 'Step L', type: 'frame', direction: 'input' },
          { id: 'f_walk2', name: 'Pass 1', type: 'frame', direction: 'input' },
          { id: 'f_walk3', name: 'Step R', type: 'frame', direction: 'input' },
          { id: 'f_walk4', name: 'Pass 2', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['f_walk1', 'f_walk2', 'f_walk3', 'f_walk4'],
          holdCounts: { f_walk1: 1, f_walk2: 1, f_walk3: 1, f_walk4: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_adv_fx',
        type: 'TRANSFORM',
        title: 'Bobbing FX',
        x: 740,
        y: 320,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Out Stream', type: 'stream', direction: 'output' }],
        data: {
          shiftX: 0,
          shiftY: 0,
          wrapShift: false,
          flipH: false,
          flipV: false,
          rotate: 0,
          invertColors: false,
          addOutline: true,
          outlineColor: '#0f172a',
          glitchAmount: 0
        }
      },
      {
        id: 'node_adv_out',
        type: 'OUTPUT',
        title: 'Terminal Render',
        x: 1040,
        y: 320,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Walk Cycle',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'ac1', fromNodeId: 'node_adv_1', fromPortId: 'out_frame', toNodeId: 'node_adv_seq', toPortId: 'f_walk1' },
      { id: 'ac2', fromNodeId: 'node_adv_2', fromPortId: 'out_frame', toNodeId: 'node_adv_seq', toPortId: 'f_walk2' },
      { id: 'ac3', fromNodeId: 'node_adv_3', fromPortId: 'out_frame', toNodeId: 'node_adv_seq', toPortId: 'f_walk3' },
      { id: 'ac4', fromNodeId: 'node_adv_4', fromPortId: 'out_frame', toNodeId: 'node_adv_seq', toPortId: 'f_walk4' },
      { id: 'ac5', fromNodeId: 'node_adv_seq', fromPortId: 'out_stream', toNodeId: 'node_adv_fx', toPortId: 'in_stream' },
      { id: 'ac6', fromNodeId: 'node_adv_fx', fromPortId: 'out_stream', toNodeId: 'node_adv_out', toPortId: 'in_stream' }
    ]
  },

  {
    id: 'spinning_coin',
    name: 'Rotating Gold Coin',
    category: 'Item / Collectible',
    description: '360° shiny arcade spinning coin with Cyberpunk Neon palette',
    fps: 12,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_c1',
        type: 'DRAWING',
        title: 'Coin Front',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(COIN_1, COIN_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_c2',
        type: 'DRAWING',
        title: 'Coin 3/4 Turn',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(COIN_2, COIN_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_c3',
        type: 'DRAWING',
        title: 'Coin 1/2 Angle',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(COIN_3, COIN_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_c4',
        type: 'DRAWING',
        title: 'Coin Edge',
        x: 60,
        y: 780,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(COIN_4, COIN_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_coin_seq',
        type: 'SEQUENCER',
        title: 'Rotation Sequence',
        x: 390,
        y: 330,
        inputs: [
          { id: 'c_p1', name: 'Angle 0°', type: 'frame', direction: 'input' },
          { id: 'c_p2', name: 'Angle 45°', type: 'frame', direction: 'input' },
          { id: 'c_p3', name: 'Angle 70°', type: 'frame', direction: 'input' },
          { id: 'c_p4', name: 'Angle 90°', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['c_p1', 'c_p2', 'c_p3', 'c_p4', 'c_p3', 'c_p2'],
          holdCounts: { c_p1: 1, c_p2: 1, c_p3: 1, c_p4: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_coin_pal',
        type: 'PALETTE',
        title: 'Cyberpunk Shimmer',
        x: 720,
        y: 330,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Palette Stream', type: 'stream', direction: 'output' }],
        data: {
          palette: 'cyberpunk',
          preserveBlackAndWhite: false
        }
      },
      {
        id: 'node_coin_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 1020,
        y: 330,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Spinning Coin',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'cc1', fromNodeId: 'node_c1', fromPortId: 'out_frame', toNodeId: 'node_coin_seq', toPortId: 'c_p1' },
      { id: 'cc2', fromNodeId: 'node_c2', fromPortId: 'out_frame', toNodeId: 'node_coin_seq', toPortId: 'c_p2' },
      { id: 'cc3', fromNodeId: 'node_c3', fromPortId: 'out_frame', toNodeId: 'node_coin_seq', toPortId: 'c_p3' },
      { id: 'cc4', fromNodeId: 'node_c4', fromPortId: 'out_frame', toNodeId: 'node_coin_seq', toPortId: 'c_p4' },
      { id: 'cc5', fromNodeId: 'node_coin_seq', fromPortId: 'out_stream', toNodeId: 'node_coin_pal', toPortId: 'in_stream' },
      { id: 'cc6', fromNodeId: 'node_coin_pal', fromPortId: 'out_stream', toNodeId: 'node_coin_out', toPortId: 'in_stream' }
    ]
  },

  // -------------------------------------------------------------
  // PRESET 4: Flapping Dungeon Bat (Creature / Fly Cycle)
  // -------------------------------------------------------------
  {
    id: 'flying_bat',
    name: 'Flatternde Fledermaus',
    category: 'Creature / Monster',
    description: 'Flatternde Dungeon-Fledermaus mit 3-Phasen-Flügelschlag und schwebendem Rhythmus',
    fps: 10,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_bat_1',
        type: 'DRAWING',
        title: 'Flügel Oben',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(BAT_WINGS_UP, BAT_COLORS),
          currentColor: '#3f3f46',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_bat_2',
        type: 'DRAWING',
        title: 'Flügel Mitte',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(BAT_WINGS_MID, BAT_COLORS),
          currentColor: '#3f3f46',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_bat_3',
        type: 'DRAWING',
        title: 'Flügel Unten',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(BAT_WINGS_DOWN, BAT_COLORS),
          currentColor: '#3f3f46',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_bat_seq',
        type: 'SEQUENCER',
        title: 'Flug-Sequenz',
        x: 390,
        y: 280,
        inputs: [
          { id: 'b_f1', name: 'Flügel Hoch', type: 'frame', direction: 'input' },
          { id: 'b_f2', name: 'Flügel Mid', type: 'frame', direction: 'input' },
          { id: 'b_f3', name: 'Flügel Tief', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['b_f1', 'b_f2', 'b_f3', 'b_f2'],
          holdCounts: { b_f1: 1, b_f2: 1, b_f3: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_bat_fx',
        type: 'TRANSFORM',
        title: 'Schwebende Kontur',
        x: 720,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Out Stream', type: 'stream', direction: 'output' }],
        data: {
          shiftX: 0,
          shiftY: 0,
          wrapShift: false,
          flipH: false,
          flipV: false,
          rotate: 0,
          invertColors: false,
          addOutline: true,
          outlineColor: '#09090b',
          glitchAmount: 0
        }
      },
      {
        id: 'node_bat_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 1020,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Flying Bat',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'bc1', fromNodeId: 'node_bat_1', fromPortId: 'out_frame', toNodeId: 'node_bat_seq', toPortId: 'b_f1' },
      { id: 'bc2', fromNodeId: 'node_bat_2', fromPortId: 'out_frame', toNodeId: 'node_bat_seq', toPortId: 'b_f2' },
      { id: 'bc3', fromNodeId: 'node_bat_3', fromPortId: 'out_frame', toNodeId: 'node_bat_seq', toPortId: 'b_f3' },
      { id: 'bc4', fromNodeId: 'node_bat_seq', fromPortId: 'out_stream', toNodeId: 'node_bat_fx', toPortId: 'in_stream' },
      { id: 'bc5', fromNodeId: 'node_bat_fx', fromPortId: 'out_stream', toNodeId: 'node_bat_out', toPortId: 'in_stream' }
    ]
  },

  // -------------------------------------------------------------
  // PRESET 5: Cozy Crackling Campfire (Environment / FX)
  // -------------------------------------------------------------
  {
    id: 'crackling_fire',
    name: 'Flackerndes Lagerfeuer',
    category: 'Environment / FX',
    description: 'Lebendiges 4-Frame-Lagerfeuer mit glühenden Holzscheiten, Glut und Funkenflug',
    fps: 8,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_f1',
        type: 'DRAWING',
        title: 'Flamme Phase 1',
        x: 60,
        y: 40,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(FIRE_1, FIRE_COLORS),
          currentColor: '#f97316',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_f2',
        type: 'DRAWING',
        title: 'Flamme Phase 2',
        x: 60,
        y: 280,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(FIRE_2, FIRE_COLORS),
          currentColor: '#f97316',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_f3',
        type: 'DRAWING',
        title: 'Flamme Phase 3',
        x: 60,
        y: 520,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(FIRE_3, FIRE_COLORS),
          currentColor: '#f97316',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_f4',
        type: 'DRAWING',
        title: 'Flamme Phase 4',
        x: 60,
        y: 760,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(FIRE_4, FIRE_COLORS),
          currentColor: '#f97316',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_fire_seq',
        type: 'SEQUENCER',
        title: 'Glut-Sequenzer',
        x: 400,
        y: 350,
        inputs: [
          { id: 'f_p1', name: 'Phase 1', type: 'frame', direction: 'input' },
          { id: 'f_p2', name: 'Phase 2', type: 'frame', direction: 'input' },
          { id: 'f_p3', name: 'Phase 3', type: 'frame', direction: 'input' },
          { id: 'f_p4', name: 'Phase 4', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['f_p1', 'f_p2', 'f_p3', 'f_p4'],
          holdCounts: { f_p1: 1, f_p2: 1, f_p3: 1, f_p4: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_fire_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 760,
        y: 350,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Campfire',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'fc1', fromNodeId: 'node_f1', fromPortId: 'out_frame', toNodeId: 'node_fire_seq', toPortId: 'f_p1' },
      { id: 'fc2', fromNodeId: 'node_f2', fromPortId: 'out_frame', toNodeId: 'node_fire_seq', toPortId: 'f_p2' },
      { id: 'fc3', fromNodeId: 'node_f3', fromPortId: 'out_frame', toNodeId: 'node_fire_seq', toPortId: 'f_p3' },
      { id: 'fc4', fromNodeId: 'node_f4', fromPortId: 'out_frame', toNodeId: 'node_fire_seq', toPortId: 'f_p4' },
      { id: 'fc5', fromNodeId: 'node_fire_seq', fromPortId: 'out_stream', toNodeId: 'node_fire_out', toPortId: 'in_stream' }
    ]
  },

  // -------------------------------------------------------------
  // PRESET 6: 8-Bit Beating Pixel Heart (UI / Item)
  // -------------------------------------------------------------
  {
    id: 'pulsing_heart',
    name: 'Pulsierendes 8-Bit-Herz',
    category: 'UI / Health',
    description: 'Lebensenergie-Herz im klassischen Retro-RPG-Stil mit Glanzlicht und Herzschlag-Rhythmus',
    fps: 8,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_h1',
        type: 'DRAWING',
        title: 'Herz Schlag',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(HEART_BEAT_1, HEART_COLORS),
          currentColor: '#ef4444',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_h2',
        type: 'DRAWING',
        title: 'Herz Pause',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(HEART_BEAT_2, HEART_COLORS),
          currentColor: '#ef4444',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_h3',
        type: 'DRAWING',
        title: 'Herz Nachschlag',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(HEART_BEAT_3, HEART_COLORS),
          currentColor: '#ef4444',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_heart_seq',
        type: 'SEQUENCER',
        title: 'Herzschlag-Takt',
        x: 390,
        y: 280,
        inputs: [
          { id: 'h_p1', name: 'Schlag 1', type: 'frame', direction: 'input' },
          { id: 'h_p2', name: 'Kontraktion', type: 'frame', direction: 'input' },
          { id: 'h_p3', name: 'Schlag 2', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['h_p1', 'h_p2', 'h_p3', 'h_p2', 'h_p2'],
          holdCounts: { h_p1: 1, h_p2: 2, h_p3: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_heart_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 740,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Beating Heart',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'hc1', fromNodeId: 'node_h1', fromPortId: 'out_frame', toNodeId: 'node_heart_seq', toPortId: 'h_p1' },
      { id: 'hc2', fromNodeId: 'node_h2', fromPortId: 'out_frame', toNodeId: 'node_heart_seq', toPortId: 'h_p2' },
      { id: 'hc3', fromNodeId: 'node_h3', fromPortId: 'out_frame', toNodeId: 'node_heart_seq', toPortId: 'h_p3' },
      { id: 'hc4', fromNodeId: 'node_heart_seq', fromPortId: 'out_stream', toNodeId: 'node_heart_out', toPortId: 'in_stream' }
    ]
  },

  // -------------------------------------------------------------
  // PRESET 7: Retro Arcade Space Raider (Vehicle / Sci-Fi)
  // -------------------------------------------------------------
  {
    id: 'space_raider',
    name: 'Raumschiff Raider',
    category: 'Vehicle / Sci-Fi',
    description: 'Retro-Arcade-Raumschiff mit pulsierendem Triebwerksschweif und PICO-8-Palette',
    fps: 10,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_s1',
        type: 'DRAWING',
        title: 'Triebwerk Normal',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SHIP_1, SHIP_COLORS),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_s2',
        type: 'DRAWING',
        title: 'Triebwerk Schub',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SHIP_2, SHIP_COLORS),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_s3',
        type: 'DRAWING',
        title: 'Triebwerk Burst',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(SHIP_3, SHIP_COLORS),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ship_seq',
        type: 'SEQUENCER',
        title: 'Triebwerk-Loop',
        x: 390,
        y: 280,
        inputs: [
          { id: 's_p1', name: 'Normal', type: 'frame', direction: 'input' },
          { id: 's_p2', name: 'Schub', type: 'frame', direction: 'input' },
          { id: 's_p3', name: 'Burst', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['s_p1', 's_p2', 's_p3', 's_p2'],
          holdCounts: { s_p1: 1, s_p2: 1, s_p3: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_ship_pal',
        type: 'PALETTE',
        title: 'PICO-8 Farbtreue',
        x: 720,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'In Stream', type: 'stream', direction: 'input' }],
        outputs: [{ id: 'out_stream', name: 'Palette Stream', type: 'stream', direction: 'output' }],
        data: {
          palette: 'pico8',
          preserveBlackAndWhite: false
        }
      },
      {
        id: 'node_ship_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 1020,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Space Raider',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'sc1', fromNodeId: 'node_s1', fromPortId: 'out_frame', toNodeId: 'node_ship_seq', toPortId: 's_p1' },
      { id: 'sc2', fromNodeId: 'node_s2', fromPortId: 'out_frame', toNodeId: 'node_ship_seq', toPortId: 's_p2' },
      { id: 'sc3', fromNodeId: 'node_s3', fromPortId: 'out_frame', toNodeId: 'node_ship_seq', toPortId: 's_p3' },
      { id: 'sc4', fromNodeId: 'node_ship_seq', fromPortId: 'out_stream', toNodeId: 'node_ship_pal', toPortId: 'in_stream' },
      { id: 'sc5', fromNodeId: 'node_ship_pal', fromPortId: 'out_stream', toNodeId: 'node_ship_out', toPortId: 'in_stream' }
    ]
  },

  // -------------------------------------------------------------
  // PRESET 8: Dungeon Treasure Chest Loot (Object / Sub-Graph Demo)
  // -------------------------------------------------------------
  {
    id: 'treasure_chest',
    name: 'Schatztruhe Öffnung',
    category: 'Object / Loot',
    description: 'Goldverzierte Dungeontruhe öffnet sich mit funkelnden Edelsteinen und Glanzeffekt',
    fps: 6,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_ch1',
        type: 'DRAWING',
        title: 'Truhe Geschlossen',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(CHEST_1, CHEST_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ch2',
        type: 'DRAWING',
        title: 'Schloss Ruckeln',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(CHEST_2, CHEST_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ch3',
        type: 'DRAWING',
        title: 'Offen & Juwelen',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels(CHEST_3, CHEST_COLORS),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_chest_seq',
        type: 'SEQUENCER',
        title: 'Öffnungs-Ablauf',
        x: 390,
        y: 280,
        inputs: [
          { id: 'ch_p1', name: 'Zu', type: 'frame', direction: 'input' },
          { id: 'ch_p2', name: 'Rütteln', type: 'frame', direction: 'input' },
          { id: 'ch_p3', name: 'Offen', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['ch_p1', 'ch_p1', 'ch_p2', 'ch_p2', 'ch_p3', 'ch_p3', 'ch_p3'],
          holdCounts: { ch_p1: 2, ch_p2: 1, ch_p3: 3 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_chest_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 740,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Treasure Chest',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'chc1', fromNodeId: 'node_ch1', fromPortId: 'out_frame', toNodeId: 'node_chest_seq', toPortId: 'ch_p1' },
      { id: 'chc2', fromNodeId: 'node_ch2', fromPortId: 'out_frame', toNodeId: 'node_chest_seq', toPortId: 'ch_p2' },
      { id: 'chc3', fromNodeId: 'node_ch3', fromPortId: 'out_frame', toNodeId: 'node_chest_seq', toPortId: 'ch_p3' },
      { id: 'chc4', fromNodeId: 'node_chest_seq', fromPortId: 'out_stream', toNodeId: 'node_chest_out', toPortId: 'in_stream' }
    ]
  },

  // ---------------------------------------------------------------------------
  // PRESET 9: Magischer Zaubertrank (Bubbling Magic Potion)
  // ---------------------------------------------------------------------------
  {
    id: 'preset_magic_potion',
    name: 'Magischer Zaubertrank',
    category: 'Items & Magic',
    description: 'Blubbernder Alchemie-Flakon mit aufsteigenden Magie-Blasen und Schaumkrone.',
    fps: 6,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_pot1',
        type: 'DRAWING',
        title: 'Trank Ruhe',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '......CCCC......',
            '......CCCC......',
            '.....GGGGGG.....',
            '.....G....G.....',
            '.....G....G.....',
            '....GG....GG....',
            '...G.H....PPG...',
            '..G.H.PPPPPPPG..',
            '..G.H.PDDDPPPG..',
            '.G.H..PDDDPPPPG.',
            '.G.H..PPBPPPPPG.',
            '.G.H..PPPPPPPPG.',
            '.G....PDDDDDDPG.',
            '..G..PDDDDDDPG..',
            '...GGGGGGGGGG...',
            '................'
          ], {
            'C': '#b45309',
            'G': '#475569',
            'H': '#e2e8f0',
            'P': '#a855f7',
            'D': '#6b21a8',
            'B': '#06b6d4',
            'W': '#ffffff'
          }),
          currentColor: '#a855f7',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_pot2',
        type: 'DRAWING',
        title: 'Trank Blase',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '......CCCC......',
            '......CCCC......',
            '.....GGGGGG.....',
            '.....G....G.....',
            '.....G....G.....',
            '....GG.LL.GG....',
            '...G.H.LL.PPG...',
            '..G.H.PPPBPPPG..',
            '..G.H.PDDDPPPG..',
            '.G.H..PDDDPPPPG.',
            '.G.H..PPPPBPPPG.',
            '.G.H..PPPPPPPPG.',
            '.G....PDDDDDDPG.',
            '..G..PDDDDDDPG..',
            '...GGGGGGGGGG...',
            '................'
          ], {
            'C': '#b45309',
            'G': '#475569',
            'H': '#e2e8f0',
            'P': '#a855f7',
            'D': '#6b21a8',
            'B': '#22d3ee',
            'L': '#f0abfc'
          }),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_pot3',
        type: 'DRAWING',
        title: 'Trank Schaum & Funken',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '......CCCC......',
            '....W.CCCC.W....',
            '.....GGGGGG.....',
            '.....G.B..G.....',
            '.....G....G.....',
            '....GGLLLLGG....',
            '...G.HLLLLPPG...',
            '..G.H.PPPPPPPG..',
            '..G.H.PDDDPPPG..',
            '.G.H..PDDDPPPPG.',
            '.G.H..PPPPPPPPG.',
            '.G.H..PPPBPPPG..',
            '.G....PDDDDDDPG.',
            '..G..PDDDDDDPG..',
            '...GGGGGGGGGG...',
            '................'
          ], {
            'C': '#b45309',
            'G': '#475569',
            'H': '#e2e8f0',
            'P': '#a855f7',
            'D': '#6b21a8',
            'B': '#38bdf8',
            'L': '#f5d0fe',
            'W': '#ffffff'
          }),
          currentColor: '#f5d0fe',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_pot_seq',
        type: 'SEQUENCER',
        title: 'Siedevorgang',
        x: 390,
        y: 280,
        inputs: [
          { id: 'pot_p1', name: 'Phase 1', type: 'frame', direction: 'input' },
          { id: 'pot_p2', name: 'Phase 2', type: 'frame', direction: 'input' },
          { id: 'pot_p3', name: 'Phase 3', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['pot_p1', 'pot_p1', 'pot_p2', 'pot_p2', 'pot_p3', 'pot_p2'],
          holdCounts: { pot_p1: 2, pot_p2: 2, pot_p3: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_pot_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 740,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Magic Potion',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'potc1', fromNodeId: 'node_pot1', fromPortId: 'out_frame', toNodeId: 'node_pot_seq', toPortId: 'pot_p1' },
      { id: 'potc2', fromNodeId: 'node_pot2', fromPortId: 'out_frame', toNodeId: 'node_pot_seq', toPortId: 'pot_p2' },
      { id: 'potc3', fromNodeId: 'node_pot3', fromPortId: 'out_frame', toNodeId: 'node_pot_seq', toPortId: 'pot_p3' },
      { id: 'potc4', fromNodeId: 'node_pot_seq', fromPortId: 'out_stream', toNodeId: 'node_pot_out', toPortId: 'in_stream' }
    ]
  },

  // ---------------------------------------------------------------------------
  // PRESET 10: Cyberpunk Robo-Katze (Mecha Cat)
  // ---------------------------------------------------------------------------
  {
    id: 'preset_mecha_cat',
    name: 'Cyberpunk Robo-Katze',
    category: 'Characters & Cyberpunk',
    description: 'Animierte Roboter-Katze im Neon-Stil mit blinkendem Visier und Schwanz-Animation.',
    fps: 5,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_cat1',
        type: 'DRAWING',
        title: 'Visier Blau',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '...MM......MM...',
            '..MPPM....MPPM..',
            '..MPPM....MPPM..',
            '..MMMMMMMMMMMM..',
            '.MMMMMMMMMMMMMM.',
            '.MMCCCCCCCCCCMM.',
            '.MMCCCCCCCCCCMM.',
            '.MMMMMMMMMMMMMM.',
            '..MMMM.PP.MMMM..',
            '...MMMMMMMMMM.M.',
            '..MMMMMMMMMM.MM.',
            '..MMMMMMMMMM.MM.',
            '..MM.MMMM.MM.MM.',
            '..MM.MMMM.MM.M..',
            '.PPPP....PPPP...',
            '................'
          ], {
            'M': '#334155',
            'P': '#ff007f',
            'C': '#00f0ff'
          }),
          currentColor: '#00f0ff',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cat2',
        type: 'DRAWING',
        title: 'Visier Blink & Schwanz',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '...MM......MM...',
            '..MPPM....MPPM..',
            '..MPPM....MPPM..',
            '..MMMMMMMMMMMM..',
            '.MMMMMMMMMMMMMM.',
            '.MM..........MM.',
            '.MMPPPPPPPPPMMM.',
            '.MMMMMMMMMMMMMM.',
            '..MMMM.PP.MMMM..',
            '...MMMMMMMMMM...',
            '..MMMMMMMMMM.MM.',
            '..MMMMMMMMMM..M.',
            '..MM.MMMM.MM..M.',
            '..MM.MMMM.MM.M..',
            '.PPPP....PPPP...',
            '................'
          ], {
            'M': '#334155',
            'P': '#ff007f',
            'C': '#00f0ff'
          }),
          currentColor: '#ff007f',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cat3',
        type: 'DRAWING',
        title: 'Schnurren & Schwanz Hoch',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '...MM......MM...',
            '..MPPM....MPPM..',
            '..MPPM....MPPM..',
            '..MMMMMMMMMMMM..',
            '.MMMMMMMMMMMMMM.',
            '.MMCCCCCCCCCCMM.',
            '.MMCCCCCCCCCCMM.',
            '.MMMMMMMMMMMMMM.',
            '..MMMM.PP.MMMM.M',
            '...MMMMMMMMMM..M',
            '..MMMMMMMMMM..M.',
            '..MMMMMMMMMM.M..',
            '..MM.MMMM.MM.M..',
            '..MM.MMMM.MM....',
            '.PPPP....PPPP...',
            '................'
          ], {
            'M': '#334155',
            'P': '#ff007f',
            'C': '#00f0ff'
          }),
          currentColor: '#00f0ff',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cat_seq',
        type: 'SEQUENCER',
        title: 'Katzen-Zyklus',
        x: 390,
        y: 280,
        inputs: [
          { id: 'cat_p1', name: 'Offen', type: 'frame', direction: 'input' },
          { id: 'cat_p2', name: 'Zwinkern', type: 'frame', direction: 'input' },
          { id: 'cat_p3', name: 'Wackeln', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['cat_p1', 'cat_p1', 'cat_p2', 'cat_p3', 'cat_p3', 'cat_p1'],
          holdCounts: { cat_p1: 2, cat_p2: 1, cat_p3: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_cat_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 740,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Mecha Cat',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'catc1', fromNodeId: 'node_cat1', fromPortId: 'out_frame', toNodeId: 'node_cat_seq', toPortId: 'cat_p1' },
      { id: 'catc2', fromNodeId: 'node_cat2', fromPortId: 'out_frame', toNodeId: 'node_cat_seq', toPortId: 'cat_p2' },
      { id: 'catc3', fromNodeId: 'node_cat3', fromPortId: 'out_frame', toNodeId: 'node_cat_seq', toPortId: 'cat_p3' },
      { id: 'catc4', fromNodeId: 'node_cat_seq', fromPortId: 'out_stream', toNodeId: 'node_cat_out', toPortId: 'in_stream' }
    ]
  },

  // ---------------------------------------------------------------------------
  // PRESET 11: Kosmische Supernova (Pulsing Cosmic Star)
  // ---------------------------------------------------------------------------
  {
    id: 'preset_cosmic_star',
    name: 'Kosmische Supernova',
    category: 'VFX & Cosmic',
    description: 'Pulsierender goldener Stern mit diamantenförmigen Lichtstrahlen und kosmischen Partikeln.',
    fps: 7,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_star1',
        type: 'DRAWING',
        title: 'Stern Kompakt',
        x: 60,
        y: 60,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '................',
            '.......YY.......',
            '......YYYY......',
            '.....YYYYYY.....',
            '.....YYWWYY.....',
            '..YYYYWWWWYYYY..',
            '..YYWWWWWWWWYY..',
            '..YYWWWWWWWWYY..',
            '..YYYYWWWWYYYY..',
            '.....YYWWYY.....',
            '.....YYYYYY.....',
            '......YYYY......',
            '.......YY.......',
            '................',
            '................'
          ], {
            'Y': '#facc15',
            'W': '#ffffff',
            'C': '#38bdf8'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_star2',
        type: 'DRAWING',
        title: 'Stern Puls & Strahlen',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '.......WW.......',
            '.......YY.......',
            '..C...YYYY...C..',
            '.....YYYYYY.....',
            '....YYWWWWYY....',
            '...YYWWWWWWYY...',
            'WYYYYWWWWWWYYYYW',
            'WYYWWWWWWWWYYW..',
            '..YYWWWWWWWWYY..',
            'WYYYYWWWWWWYYYYW',
            '...YYWWWWWWYY...',
            '....YYWWWWYY....',
            '.....YYYYYY.....',
            '..C...YYYY...C..',
            '.......YY.......',
            '.......WW.......'
          ], {
            'Y': '#facc15',
            'W': '#ffffff',
            'C': '#38bdf8'
          }),
          currentColor: '#ffffff',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_star3',
        type: 'DRAWING',
        title: 'Supernova Explosion',
        x: 60,
        y: 540,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            'C......WW......C',
            '.......WW.......',
            '..W...YYYY...W..',
            '...C.YYYYYY.C...',
            '....YYWWWWYY....',
            'W..YYWWWWWWYY..W',
            'WWYYWWWWWWWWYYWW',
            'WWWWWWWWWWWWWWWW',
            'WWWWWWWWWWWWWWWW',
            'WWYYWWWWWWWWYYWW',
            'W..YYWWWWWWYY..W',
            '....YYWWWWYY....',
            '...C.YYYYYY.C...',
            '..W...YYYY...W..',
            '.......WW.......',
            'C......WW......C'
          ], {
            'Y': '#fbbf24',
            'W': '#ffffff',
            'C': '#00f0ff'
          }),
          currentColor: '#00f0ff',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_star_seq',
        type: 'SEQUENCER',
        title: 'Puls-Sequenz',
        x: 390,
        y: 280,
        inputs: [
          { id: 'star_p1', name: 'Kern', type: 'frame', direction: 'input' },
          { id: 'star_p2', name: 'Aura', type: 'frame', direction: 'input' },
          { id: 'star_p3', name: 'Eruption', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['star_p1', 'star_p2', 'star_p3', 'star_p2', 'star_p1'],
          holdCounts: { star_p1: 1, star_p2: 1, star_p3: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_star_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 740,
        y: 280,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Cosmic Star',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'starc1', fromNodeId: 'node_star1', fromPortId: 'out_frame', toNodeId: 'node_star_seq', toPortId: 'star_p1' },
      { id: 'starc2', fromNodeId: 'node_star2', fromPortId: 'out_frame', toNodeId: 'node_star_seq', toPortId: 'star_p2' },
      { id: 'starc3', fromNodeId: 'node_star3', fromPortId: 'out_frame', toNodeId: 'node_star_seq', toPortId: 'star_p3' },
      { id: 'starc4', fromNodeId: 'node_star_seq', fromPortId: 'out_stream', toNodeId: 'node_star_out', toPortId: 'in_stream' }
    ]
  },
  // 12. Cyber Katana / Neon Energy Blade
  {
    id: 'preset_cyber_katana',
    name: 'Cyber Katana',
    category: 'Sci-Fi / Weapons',
    description: 'High-tech plasma blade charging up with electric arcs and spark flares',
    fps: 8,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_ck1',
        type: 'DRAWING',
        title: 'Katana Bereit',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '...............C',
            '..............CB',
            '.............CBW',
            '............CBW.',
            '...........CBW..',
            '..........CBW...',
            '.........CBW....',
            '........CBW.....',
            '.......CBW......',
            '......GGGG......',
            '.....KKKK.......',
            '....KHKK........',
            '....KKHK........',
            '...KHKK.........',
            '..KK............',
            '................'
          ], {
            'K': '#0f172a',
            'H': '#334155',
            'G': '#cbd5e1',
            'C': '#06b6d4',
            'B': '#3b82f6',
            'W': '#ffffff'
          }),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ck2',
        type: 'DRAWING',
        title: 'Plasma-Ladevorgang',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '..............WC',
            '.............WBC',
            '............WBC.',
            '...........WBCM.',
            '..M.......WBC...',
            '.........WBC....',
            '........WBC.....',
            '.......WBC.M....',
            '......GGGG......',
            '.....KKKK.......',
            '....KHKK........',
            '....KKHK........',
            '...KHKK.........',
            '..KK............',
            '................',
            '................'
          ], {
            'K': '#0f172a',
            'H': '#334155',
            'G': '#cbd5e1',
            'C': '#06b6d4',
            'B': '#3b82f6',
            'W': '#ffffff',
            'M': '#ec4899'
          }),
          currentColor: '#ec4899',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ck3',
        type: 'DRAWING',
        title: 'Overcharge Impuls',
        x: 60,
        y: 520,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '.............MWW',
            '............WWCC',
            '...........WBCY.',
            '..Y.......WBC...',
            '.........WBCM...',
            '..M.....WBC.....',
            '.......WBC......',
            '..Y...GGGG...Y..',
            '.....KKKK.......',
            '....KHKK........',
            '....KKHK........',
            '...KHKK.........',
            '..KK............',
            '................',
            '................',
            '................'
          ], {
            'K': '#0f172a',
            'H': '#334155',
            'G': '#cbd5e1',
            'C': '#06b6d4',
            'B': '#3b82f6',
            'W': '#ffffff',
            'M': '#ec4899',
            'Y': '#facc15'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ck4',
        type: 'DRAWING',
        title: 'Funken-Entladung',
        x: 60,
        y: 740,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '...............C',
            '..............CB',
            '.............CBW',
            '....M.......CBW.',
            '...........CBW..',
            '...Y......CBW...',
            '.........CBW....',
            '........CBW.M...',
            '.......CBW......',
            '......GGGG......',
            '.....KKKK.......',
            '....KHKK........',
            '....KKHK........',
            '...KHKK.........',
            '..KK............',
            '................'
          ], {
            'K': '#0f172a',
            'H': '#334155',
            'G': '#cbd5e1',
            'C': '#06b6d4',
            'B': '#3b82f6',
            'W': '#ffffff',
            'M': '#ec4899',
            'Y': '#facc15'
          }),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_ck_seq',
        type: 'SEQUENCER',
        title: 'Klingen-Sequenz',
        x: 400,
        y: 380,
        inputs: [
          { id: 'ck_p1', name: 'Bereit', type: 'frame', direction: 'input' },
          { id: 'ck_p2', name: 'Laden', type: 'frame', direction: 'input' },
          { id: 'ck_p3', name: 'Impuls', type: 'frame', direction: 'input' },
          { id: 'ck_p4', name: 'Entladen', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['ck_p1', 'ck_p2', 'ck_p3', 'ck_p4', 'ck_p1'],
          holdCounts: { ck_p1: 2, ck_p2: 1, ck_p3: 2, ck_p4: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_ck_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 750,
        y: 380,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Cyber Katana',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'ckc1', fromNodeId: 'node_ck1', fromPortId: 'out_frame', toNodeId: 'node_ck_seq', toPortId: 'ck_p1' },
      { id: 'ckc2', fromNodeId: 'node_ck2', fromPortId: 'out_frame', toNodeId: 'node_ck_seq', toPortId: 'ck_p2' },
      { id: 'ckc3', fromNodeId: 'node_ck3', fromPortId: 'out_frame', toNodeId: 'node_ck_seq', toPortId: 'ck_p3' },
      { id: 'ckc4', fromNodeId: 'node_ck4', fromPortId: 'out_frame', toNodeId: 'node_ck_seq', toPortId: 'ck_p4' },
      { id: 'ckc5', fromNodeId: 'node_ck_seq', fromPortId: 'out_stream', toNodeId: 'node_ck_out', toPortId: 'in_stream' }
    ]
  },
  // 13. Retro Ghost / Phantom Drift
  {
    id: 'preset_retro_ghost',
    name: 'Retro Ghost',
    category: 'Arcade / Monster',
    description: 'Classic arcade ghost with drifting wavy hem and animated glancing eyes',
    fps: 6,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_rg1',
        type: 'DRAWING',
        title: 'Blick Links',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....TTTTTT.....',
            '....TLLBBBBDT...',
            '...TLWWLLWWBBDT.',
            '..TLWWPLLWWPBBDT',
            '..TLWPPLLWPPCBBD',
            '..TLLBBBLLBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..T.T..D..T..D.T',
            '..T.T..D..T..D.T',
            '..T.T..D..T..D.T',
            '................'
          ], {
            'B': '#38bdf8',
            'D': '#0284c7',
            'L': '#bae6fd',
            'W': '#ffffff',
            'P': '#1e3a8a',
            'T': '#0369a1',
            'C': '#0284c7'
          }),
          currentColor: '#38bdf8',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_rg2',
        type: 'DRAWING',
        title: 'Blick Mitte (Schwebend)',
        x: 60,
        y: 320,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....TTTTTT.....',
            '....TLLBBBBDT...',
            '...TLBWWLLWWBDT.',
            '..TLBWPPLLWPPBDT',
            '..TLBWPPLLWPPBDT',
            '..TLBBBBLLBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..T.T..D..T..D.T',
            '..T.T..D..T..D.T',
            '....T.....T.....',
            '................',
            '................'
          ], {
            'B': '#38bdf8',
            'D': '#0284c7',
            'L': '#bae6fd',
            'W': '#ffffff',
            'P': '#1e3a8a',
            'T': '#0369a1'
          }),
          currentColor: '#38bdf8',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_rg3',
        type: 'DRAWING',
        title: 'Blick Rechts',
        x: 60,
        y: 560,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....TTTTTT.....',
            '....TLLBBBBDT...',
            '...TLBBWWLLWWDT.',
            '..TLBBWWPLWWPBDT',
            '..TLBBWPPLLWPBDT',
            '..TLBBBBLLBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TLBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '..TDBBBBBBBBBBBD',
            '...T..D..T..D.T.',
            '...T..D..T..D.T.',
            '...T..D..T..D.T.',
            '................'
          ], {
            'B': '#38bdf8',
            'D': '#0284c7',
            'L': '#bae6fd',
            'W': '#ffffff',
            'P': '#1e3a8a',
            'T': '#0369a1'
          }),
          currentColor: '#38bdf8',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_rg_seq',
        type: 'SEQUENCER',
        title: 'Geist-Schwebung',
        x: 400,
        y: 300,
        inputs: [
          { id: 'rg_p1', name: 'Links', type: 'frame', direction: 'input' },
          { id: 'rg_p2', name: 'Mitte', type: 'frame', direction: 'input' },
          { id: 'rg_p3', name: 'Rechts', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['rg_p1', 'rg_p2', 'rg_p3', 'rg_p2'],
          holdCounts: { rg_p1: 2, rg_p2: 2, rg_p3: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_rg_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 750,
        y: 300,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Retro Ghost',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'rgc1', fromNodeId: 'node_rg1', fromPortId: 'out_frame', toNodeId: 'node_rg_seq', toPortId: 'rg_p1' },
      { id: 'rgc2', fromNodeId: 'node_rg2', fromPortId: 'out_frame', toNodeId: 'node_rg_seq', toPortId: 'rg_p2' },
      { id: 'rgc3', fromNodeId: 'node_rg3', fromPortId: 'out_frame', toNodeId: 'node_rg_seq', toPortId: 'rg_p3' },
      { id: 'rgc4', fromNodeId: 'node_rg_seq', fromPortId: 'out_stream', toNodeId: 'node_rg_out', toPortId: 'in_stream' }
    ]
  },
  // 14. Cosmic Warp Portal
  {
    id: 'preset_cosmic_portal',
    name: 'Cosmic Warp Portal',
    category: 'Effects / FX',
    description: 'Swirling interdimensional portal with spinning singularity nodes and energy flare',
    fps: 8,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_cp1',
        type: 'DRAWING',
        title: 'Singularitäts-Kern',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '......PPPP......',
            '....PPVVVVPP....',
            '..PPVVCCCCVVPP..',
            '.PVVCCLLLLCCVVP.',
            '.PVCCLLWWLLCCVP.',
            'PVCCLWWWWWWLCCVP',
            'PVCLWWWWWWWWLCVP',
            'PVCLWWWWWWWWLCVP',
            'PVCLWWWWWWWWLCVP',
            'PVCCLWWWWWWLCCVP',
            '.PVCCLLWWLLCCVP.',
            '.PVVCCLLLLCCVVP.',
            '..PPVVCCCCVVPP..',
            '....PPVVVVPP....',
            '......PPPP......',
            '................'
          ], {
            'V': '#581c87',
            'P': '#a855f7',
            'C': '#06b6d4',
            'L': '#67e8f9',
            'W': '#ffffff'
          }),
          currentColor: '#06b6d4',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cp2',
        type: 'DRAWING',
        title: 'Wirbel & Sternenstaub',
        x: 60,
        y: 320,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '....Y.PPPP......',
            '..P.PPVVVVPP....',
            '.PPPVVCCCCVVPP..',
            'PPVVCCLLLLCCVVPP',
            'PVCCLLWWWWLLCCVP',
            'PVCLWWLLLLWWLCVP',
            'PVCLWLWWWWLWLCVP',
            'PVCLWLWWWWLWLCVP',
            'PVCLWWLLLLWWLCVP',
            'PVCCLLWWWWLLCCVP',
            'PPVVCCLLLLCCVVPP',
            '..PPVVCCCCVVPP.P',
            '....PPVVVVPP.Y..',
            '......PPPP......',
            '................',
            '................'
          ], {
            'V': '#581c87',
            'P': '#a855f7',
            'C': '#06b6d4',
            'L': '#67e8f9',
            'W': '#ffffff',
            'Y': '#facc15'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cp3',
        type: 'DRAWING',
        title: 'Ereignishorizont Nova',
        x: 60,
        y: 560,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '......PPPP...Y..',
            '....PPVVVVPP....',
            '..PPVVCCCCVVPP..',
            '..VVCCLLLLCCVV..',
            'YCLLWWWWWWWWLLCY',
            '.CLLWWWWWWWWLLC.',
            'WLLWWWWWWWWWWLLW',
            'WLLWWWWWWWWWWLLW',
            '.CLLWWWWWWWWLLC.',
            'YCLLWWWWWWWWLLCY',
            '..VVCCLLLLCCVV..',
            '..PPVVCCCCVVPP..',
            '....PPVVVVPP....',
            '..Y...PPPP......',
            '................',
            '................'
          ], {
            'V': '#581c87',
            'P': '#a855f7',
            'C': '#06b6d4',
            'L': '#67e8f9',
            'W': '#ffffff',
            'Y': '#facc15'
          }),
          currentColor: '#a855f7',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_cp_seq',
        type: 'SEQUENCER',
        title: 'Portal-Zyklus',
        x: 400,
        y: 300,
        inputs: [
          { id: 'cp_p1', name: 'Kern', type: 'frame', direction: 'input' },
          { id: 'cp_p2', name: 'Wirbel', type: 'frame', direction: 'input' },
          { id: 'cp_p3', name: 'Nova', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['cp_p1', 'cp_p2', 'cp_p3', 'cp_p2'],
          holdCounts: { cp_p1: 1, cp_p2: 1, cp_p3: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_cp_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 750,
        y: 300,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Cosmic Warp Portal',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'cpc1', fromNodeId: 'node_cp1', fromPortId: 'out_frame', toNodeId: 'node_cp_seq', toPortId: 'cp_p1' },
      { id: 'cpc2', fromNodeId: 'node_cp2', fromPortId: 'out_frame', toNodeId: 'node_cp_seq', toPortId: 'cp_p2' },
      { id: 'cpc3', fromNodeId: 'node_cp3', fromPortId: 'out_frame', toNodeId: 'node_cp_seq', toPortId: 'cp_p3' },
      { id: 'cpc4', fromNodeId: 'node_cp_seq', fromPortId: 'out_stream', toNodeId: 'node_cp_out', toPortId: 'in_stream' }
    ]
  },
  // 15. Storm Cloud & Lightning
  {
    id: 'preset_storm_cloud',
    name: 'Storm Cloud & Lightning',
    category: 'Nature / Weather',
    description: 'Dark thundercloud with falling rain drops and sudden energetic lightning strike',
    fps: 7,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_sc1',
        type: 'DRAWING',
        title: 'Wolke & Niesel',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....LLLL.......',
            '....LGGGGLL.....',
            '..LLGGDDDDGLL...',
            '.LGGDDDDDDDDGL..',
            '.LGDDDDDDDDDDG..',
            '.LDDDDDDDDDDDD..',
            '..DDDDDDDDDDDD..',
            '................',
            '....B...........',
            '..........B.....',
            '................',
            '......B.........',
            '................',
            '..........B.....',
            '................'
          ], {
            'D': '#334155',
            'G': '#64748b',
            'L': '#94a3b8',
            'B': '#38bdf8'
          }),
          currentColor: '#38bdf8',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_sc2',
        type: 'DRAWING',
        title: 'Elektrische Ladung',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....LLLL.......',
            '....LGGGGLL.....',
            '..LLGGDDDDGLL...',
            '.LGGDDYYYYDDGL..',
            '.LGDDYYYYYYDDG..',
            '.LDDDDDYYDDDDD..',
            '..DDDDDDDDDDDD..',
            '........Y.......',
            '................',
            '....B.....B.....',
            '................',
            '..........B.....',
            '...B............',
            '................',
            '......B.........'
          ], {
            'D': '#334155',
            'G': '#64748b',
            'L': '#94a3b8',
            'Y': '#facc15',
            'B': '#38bdf8'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_sc3',
        type: 'DRAWING',
        title: 'Blitzschlag',
        x: 60,
        y: 520,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....WWWW.......',
            '....WGGGGWW.....',
            '..WWGGYYYYGWW...',
            '.WGGYYYYYYYYGW..',
            '.WGDDWWWWWWDDG..',
            '.LDDDDWWWDDDDD..',
            '..DDDDDWWDDDDD..',
            '......YYW.......',
            '......YW........',
            '.....YY.........',
            '.....YWYY.......',
            '.......YW.......',
            '.......YY.......',
            '.......W........',
            '................'
          ], {
            'D': '#334155',
            'G': '#64748b',
            'L': '#94a3b8',
            'Y': '#facc15',
            'W': '#ffffff'
          }),
          currentColor: '#ffffff',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_sc4',
        type: 'DRAWING',
        title: 'Regenguss',
        x: 60,
        y: 740,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '.....LLLL.......',
            '....LGGGGLL.....',
            '..LLGGDDDDGLL...',
            '.LGGDDDDDDDDGL..',
            '.LGDDDDDDDDDDG..',
            '.LDDDDDDDDDDDD..',
            '..DDDDDDDDDDDD..',
            '................',
            '..B.......B.....',
            '......B.........',
            '..B.......B.....',
            '...B............',
            '......B...B.....',
            '..B.............',
            '................'
          ], {
            'D': '#334155',
            'G': '#64748b',
            'L': '#94a3b8',
            'B': '#38bdf8'
          }),
          currentColor: '#38bdf8',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_sc_seq',
        type: 'SEQUENCER',
        title: 'Wetter-Ablauf',
        x: 400,
        y: 380,
        inputs: [
          { id: 'sc_p1', name: 'Niesel', type: 'frame', direction: 'input' },
          { id: 'sc_p2', name: 'Ladung', type: 'frame', direction: 'input' },
          { id: 'sc_p3', name: 'Blitz', type: 'frame', direction: 'input' },
          { id: 'sc_p4', name: 'Guss', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['sc_p1', 'sc_p2', 'sc_p3', 'sc_p4', 'sc_p1', 'sc_p4'],
          holdCounts: { sc_p1: 2, sc_p2: 1, sc_p3: 1, sc_p4: 2 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_sc_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 750,
        y: 380,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Storm Cloud',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'scc1', fromNodeId: 'node_sc1', fromPortId: 'out_frame', toNodeId: 'node_sc_seq', toPortId: 'sc_p1' },
      { id: 'scc2', fromNodeId: 'node_sc2', fromPortId: 'out_frame', toNodeId: 'node_sc_seq', toPortId: 'sc_p2' },
      { id: 'scc3', fromNodeId: 'node_sc3', fromPortId: 'out_frame', toNodeId: 'node_sc_seq', toPortId: 'sc_p3' },
      { id: 'scc4', fromNodeId: 'node_sc4', fromPortId: 'out_frame', toNodeId: 'node_sc_seq', toPortId: 'sc_p4' },
      { id: 'scc5', fromNodeId: 'node_sc_seq', fromPortId: 'out_stream', toNodeId: 'node_sc_out', toPortId: 'in_stream' }
    ]
  },
  // 16. Retro Magic Mushroom
  {
    id: 'preset_magic_mushroom',
    name: 'Power Mushroom',
    category: 'Retro / Items',
    description: 'Classic 8-bit power-up mushroom with buoyant bounce and golden magic sparkles',
    fps: 6,
    canvasResolution: 16,
    nodes: [
      {
        id: 'node_mm1',
        type: 'DRAWING',
        title: 'Mushroom Bereit',
        x: 60,
        y: 80,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '.....BBBBBB.....',
            '...BBRRRRRRBB...',
            '..BRRRWWWRRRRD..',
            '.BRRWWWWWWWRRRD.',
            '.BRWWWWWWWWWRRD.',
            'BRRRWWWWWWWRRRRD',
            'BRRRRRWWWRRRRRRD',
            'BRDDRRRRRRRRDDDB',
            '.BBBBBBBBBBBBBB.',
            '...BSSSSSSSSB...',
            '...BSWBSSBWSB...',
            '...BSWBSSBWSB...',
            '...BSSSSSSSSB...',
            '...BSSSTTSSSB...',
            '...BBBBBBBBBB...',
            '................'
          ], {
            'R': '#ef4444',
            'D': '#b91c1c',
            'W': '#ffffff',
            'S': '#fed7aa',
            'T': '#ea580c',
            'B': '#0f172a'
          }),
          currentColor: '#ef4444',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_mm2',
        type: 'DRAWING',
        title: 'Sprung & Glitzern',
        x: 60,
        y: 300,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '..Y.............',
            '.....BBBBBB...Y.',
            '...BBRRRRRRBB...',
            '..BRRRWWWRRRRD..',
            '.BRRWWWWWWWRRRD.',
            '.BRWWWWWWWWWRRD.',
            'BRRRWWWWWWWRRRRD',
            'BRRRRRWWWRRRRRRD',
            'BRDDRRRRRRRRDDDB',
            '.BBBBBBBBBBBBBB.',
            '...BSSSSSSSSB...',
            '...BSWBSSBWSB...',
            '...BSSSSSSSSB...',
            '...BBBBBBBBBB...',
            '................',
            '....Y........Y..'
          ], {
            'R': '#ef4444',
            'D': '#b91c1c',
            'W': '#ffffff',
            'S': '#fed7aa',
            'B': '#0f172a',
            'Y': '#facc15'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_mm3',
        type: 'DRAWING',
        title: 'Schweben & Stern',
        x: 60,
        y: 520,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '....Y........Y..',
            '.....BBBBBB.....',
            '...BBRRRRRRBB...',
            '..BRRRWWWRRRRD..',
            '.BRRWWWWWWWRRRD.',
            '.BRWWWWWWWWWRRD.',
            'BRRRWWWWWWWRRRRD',
            'BRRRRRWWWRRRRRRD',
            'BRDDRRRRRRRRDDDB',
            '.BBBBBBBBBBBBBB.',
            '...BSSSSSSSSB...',
            '...BSWBSSBWSB...',
            '...BBBBBBBBBB...',
            '................',
            '..Y..........Y..',
            '................'
          ], {
            'R': '#ef4444',
            'D': '#b91c1c',
            'W': '#ffffff',
            'S': '#fed7aa',
            'B': '#0f172a',
            'Y': '#facc15'
          }),
          currentColor: '#facc15',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_mm4',
        type: 'DRAWING',
        title: 'Squash-Landung',
        x: 60,
        y: 740,
        inputs: [],
        outputs: [{ id: 'out_frame', name: 'Frame Data', type: 'frame', direction: 'output' }],
        data: {
          canvasSize: 16,
          pixels: asciiToPixels([
            '................',
            '................',
            '................',
            '....BBBBBBBB....',
            '..BBRRRRRRRRBB..',
            '.BRRRWWWWWRRRRD.',
            'BRRWWWWWWWWWRRRD',
            'BRRRWWWWWWWRRRRD',
            'BRRRRRWWWRRRRRRD',
            '.BBBBBBBBBBBBBB.',
            '..BSSSSSSSSSSB..',
            '..BSWBSSSSBWSB..',
            '..BSSSSSSSSSSB..',
            '..BBBBBBBBBBBB..',
            '................',
            '................'
          ], {
            'R': '#ef4444',
            'D': '#b91c1c',
            'W': '#ffffff',
            'S': '#fed7aa',
            'B': '#0f172a'
          }),
          currentColor: '#ef4444',
          currentTool: 'pencil'
        } as DrawingNodeData
      },
      {
        id: 'node_mm_seq',
        type: 'SEQUENCER',
        title: 'Mushroom-Zyklus',
        x: 400,
        y: 380,
        inputs: [
          { id: 'mm_p1', name: 'Bereit', type: 'frame', direction: 'input' },
          { id: 'mm_p2', name: 'Sprung', type: 'frame', direction: 'input' },
          { id: 'mm_p3', name: 'Schweben', type: 'frame', direction: 'input' },
          { id: 'mm_p4', name: 'Landung', type: 'frame', direction: 'input' }
        ],
        outputs: [{ id: 'out_stream', name: 'Animation Stream', type: 'stream', direction: 'output' }],
        data: {
          frameOrder: ['mm_p1', 'mm_p2', 'mm_p3', 'mm_p4', 'mm_p1'],
          holdCounts: { mm_p1: 2, mm_p2: 1, mm_p3: 2, mm_p4: 1 },
          playbackMode: 'loop',
          pingPong: false
        }
      },
      {
        id: 'node_mm_out',
        type: 'OUTPUT',
        title: 'Render Output',
        x: 750,
        y: 380,
        inputs: [{ id: 'in_stream', name: 'Final Stream', type: 'stream', direction: 'input' }],
        outputs: [],
        data: {
          name: 'Power Mushroom',
          resolution: 16
        }
      }
    ],
    connections: [
      { id: 'mmc1', fromNodeId: 'node_mm1', fromPortId: 'out_frame', toNodeId: 'node_mm_seq', toPortId: 'mm_p1' },
      { id: 'mmc2', fromNodeId: 'node_mm2', fromPortId: 'out_frame', toNodeId: 'node_mm_seq', toPortId: 'mm_p2' },
      { id: 'mmc3', fromNodeId: 'node_mm3', fromPortId: 'out_frame', toNodeId: 'node_mm_seq', toPortId: 'mm_p3' },
      { id: 'mmc4', fromNodeId: 'node_mm4', fromPortId: 'out_frame', toNodeId: 'node_mm_seq', toPortId: 'mm_p4' },
      { id: 'mmc5', fromNodeId: 'node_mm_seq', fromPortId: 'out_stream', toNodeId: 'node_mm_out', toPortId: 'in_stream' }
    ]
  }
];
