// ============================================================
//  TILE TYPES
// ============================================================
const T_GRASS = 0, T_TREE = 1, T_WATER = 2, T_STONE = 3, T_SAND = 4;
const T_DF = 5, T_DW = 6, T_DOOR = 7, T_ENTRANCE = 8, T_EXIT = 9;
const T_HOUSE_WALL = 10, T_HOUSE_DOOR = 11;
const SOLID = new Set([T_TREE, T_WATER, T_DW, T_HOUSE_WALL]);
