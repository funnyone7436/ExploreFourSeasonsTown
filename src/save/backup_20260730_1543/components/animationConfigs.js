export const bookStoreConfig = {
  'Petal_01_Sakura_Cleft':          { limit: 60, speed: 6, amplitude: 0.5, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Sakura' },
  'Flower_Round_02_Red':            { limit: 20, speed: 6, amplitude: 0.1, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Rounded' },
  'Flower_Round_02_Red_Vein_04':    { limit: 60, speed: 8, amplitude: 0.6, arcHeight: 1.4, swing: 0.7, type: 'petal', key: 'Rounded1' },
  'Petal_03_Wide':                  { limit: 80, speed: 6, amplitude: 0.6, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Wide' },
  'Petal_04_Elongated':             { limit: 10, speed: 2, amplitude: 0.2, arcHeight: 1.2, swing: 0.6, type: 'petal', key: 'Elongated' },
  'Flower_Round_01_Pink_Vein_02':   { limit: 50, speed: 1, amplitude: 0.5, arcHeight: 1.2, swing: 0.6, type: 'flower', key: 'Flower1' },
  'Flower_Round_02_Red_Vein_04_FL': { limit: 60, speed: 1, amplitude: 0.5, arcHeight: 1.4, swing: 0.7, type: 'flower', key: 'Flower2' },
  'Flower_Round_03_Yellow_Vein_02': { limit: 20, speed: 1, amplitude: 0.5, arcHeight: 1.1, swing: 0.8, type: 'flower', key: 'Flower3' },
  'Flower_Round_04_Blue_Vein_02':   { limit: 50, speed: 1, amplitude: 0.5, arcHeight: 1.3, swing: 1.0, type: 'flower', key: 'Flower4' }
};


const defaultLimit = 80;
const higherLimit = 120;

export const bigTreeConfig = {
  'Leaf_DarkGreen_Bent':       { limit: defaultLimit, speed: 0.5, amplitude: 0.45, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'DGB' },
  'Leaf_DarkGreen_Long':       { limit: higherLimit,  speed: 6.0, amplitude: 0.02, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'DGL' },
  'Leaf_DarkGreen_Standard':   { limit: defaultLimit, speed: 0.1, amplitude: 0.38, arcHeight: 0.1, swing: 0.2, type: 'flower', key: 'DGS' },
  'Leaf_DarkGreen_Wide':       { limit: defaultLimit, speed: 0.4, amplitude: 0.61, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'DGW' },
  'Leaf_LightGreen_Bent':      { limit: defaultLimit, speed: 0.8, amplitude: 0.55, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'LGB' },
  'Leaf_LightGreen_Long':      { limit: higherLimit,  speed: 0.5, amplitude: 0.29, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'LGL' },
  'Leaf_LightGreen_Standard':  { limit: defaultLimit, speed: 8.0, amplitude: 0.02, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'LGS' },
  'Leaf_LightGreen_Wide':      { limit: defaultLimit, speed: 0.7, amplitude: 0.88, arcHeight: 0.01, swing: 0.1, type: 'petal', key: 'LGW' },
  'Leaf_MidGreen_Bent':        { limit: defaultLimit, speed: 0.6, amplitude: 0.06, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGB' },
  'Leaf_MidGreen_Long':        { limit: higherLimit,  speed: 0.9, amplitude: 0.31, arcHeight: 0.1, swing: 0.2, type: 'flower', key: 'MGL' },
  'Leaf_MidGreen_Standard':    { limit: defaultLimit, speed: 0.3, amplitude: 0.09, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGS' },
  'Leaf_MidGreen_Wide':        { limit: defaultLimit, speed: 7.0, amplitude: 0.24, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'MGW' },
  'Leaf_YellowGreen_Bent':     { limit: higherLimit,  speed: 0.8, amplitude: 0.86, arcHeight: 0.01, swing: 0.1, type: 'flower', key: 'YGB' },
  'Leaf_YellowGreen_Long':     { limit: defaultLimit, speed: 0.5, amplitude: 0.48, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGL' },
  'Leaf_YellowGreen_Standard': { limit: defaultLimit, speed: 0.9, amplitude: 0.35, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGS' },
  'Leaf_YellowGreen_Wide':     { limit: defaultLimit, speed: 0.1, amplitude: 0.69, arcHeight: 0.2, swing: 0.2, type: 'petal', key: 'YGW' }
};

export const fallHouseTreeConfig = {
  'Leaf_DarkGreen_Bent':       { limit: defaultLimit, speed: 1.5, amplitude: 0.45, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'DGB' },
  'Leaf_DarkGreen_Long':       { limit: higherLimit,  speed: 3.7, amplitude: 0.72, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'DGL' },
  'Leaf_DarkGreen_Standard':   { limit: defaultLimit, speed: 7.1, amplitude: 0.38, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'DGS' },
  'Leaf_DarkGreen_Wide':       { limit: defaultLimit, speed: 4.4, amplitude: 0.61, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'DGW' },
  'Leaf_LightGreen_Bent':      { limit: defaultLimit, speed: 2.8, amplitude: 0.55, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGB' },
  'Leaf_LightGreen_Long':      { limit: higherLimit,  speed: 6.5, amplitude: 0.29, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGL' },
  'Leaf_LightGreen_Standard':  { limit: defaultLimit, speed: 5.9, amplitude: 0.78, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'LGS' },
  'Leaf_LightGreen_Wide':      { limit: defaultLimit, speed: 3.1, amplitude: 0.42, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'LGW' },
  'Leaf_MidGreen_Bent':        { limit: defaultLimit, speed: 7.6, amplitude: 0.66, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'MGB' },
  'Leaf_MidGreen_Long':        { limit: higherLimit,  speed: 4.9, amplitude: 0.31, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGL' },
  'Leaf_MidGreen_Standard':    { limit: defaultLimit, speed: 2.3, amplitude: 0.59, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGS' },
  'Leaf_MidGreen_Wide':        { limit: defaultLimit, speed: 6.2, amplitude: 0.24, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'MGW' },
  'Leaf_YellowGreen_Bent':     { limit: higherLimit,  speed: 3.8, amplitude: 0.75, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGB' },
  'Leaf_YellowGreen_Long':     { limit: defaultLimit, speed: 5.5, amplitude: 0.48, arcHeight: 1.2, swing: 0.8, type: 'flower', key: 'YGL' },
  'Leaf_YellowGreen_Standard': { limit: defaultLimit, speed: 7.9, amplitude: 0.35, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGS' },
  'Leaf_YellowGreen_Wide':     { limit: defaultLimit, speed: 4.1, amplitude: 0.69, arcHeight: 1.2, swing: 0.8, type: 'petal', key: 'YGW' }
};