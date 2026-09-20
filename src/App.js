import WorkspaceCanvas from './WorkspaceCanvas.js';
import ThreePreview from './ThreePreview.js';
import { downloadPrintPdf, downloadPrintPng, downloadProjectJson, downloadUsageWorkbook } from './exporters.js';
import { imageFileToBeads } from './imageToBeads.js';
import { basicPalette, colorDistance, completePalette, getColor, nearestPaletteColor } from './palette.js';
import { composeVisibleCells, createLayer, createProject, loadDraft, normalizeProject, saveDraft, withCells, withLayers } from './project.js';
import { findIsolatedBeads, summarizeUsage } from './usage.js';
const { useEffect, useMemo, useRef, useState } = React;
const languageKey = 'perler-beads-generator:language';
const ui = {
    zh: {
        appName: '为爱拼豆',
        board: '拼豆板',
        apply: '应用',
        commonSizes: '常用尺寸',
        rightClick: '右键',
        rightClickHint: '右键平移用于拖动画布；右键擦除只清除落点格子，不受橡皮大小影响。',
        pan: '平移',
        erase: '擦除',
        new: '新建',
        clear: '清空',
        undo: '撤销',
        redo: '重做',
        exportPatternFull: '导出图纸',
        exportUsageFull: '导出用量',
        exportRecordFull: '导出编辑',
        importRecordFull: '导入编辑',
        exportPatternTitle: '导出图纸',
        exportUsageTitle: '导出用量清单 Excel',
        exportRecordTitle: '导出编辑记录 JSON',
        importRecordTitle: '导入历史记录 JSON',
        usageExported: '用量清单 Excel 已导出。',
        recordExported: '编辑记录 JSON 已导出。',
        recordImported: '编辑记录已导入，可继续编辑。',
        invalidRecord: '这个文件不是有效的拼豆编辑记录。',
        unreadableRecord: '无法读取这个编辑记录 JSON。',
        printExportSettings: '图纸设置',
        showColorCodes: '显示色号',
        showGuideLines: '辅助线',
        projectNickname: '作品昵称',
        authorNickname: '作者昵称',
        exportFormat: '导出格式',
        exportBounds: '导出范围',
        exportPatternBounds: '图案尺寸',
        exportCanvasBounds: '画布尺寸',
        optional: '可选',
        exportNow: '导出',
        preview3d: '3D 预览',
        liveBoard: '实时画板视图',
        previewEmpty: '暂无 3D 预览',
        imageToPattern: '公益图片生成',
        referenceImage: '参考图',
        uploadReferenceImage: '上传参考图',
        showReferenceImage: '显示参考图',
        referenceOpacity: '透明度',
        referenceAdjust: '拖动/缩放',
        referenceAdjustHint: '正在拖动/缩放参考图',
        resetReferenceTransform: '重置位置',
        referencePlacement: '显示位置',
        referenceBelow: '拼豆下方',
        referenceAbove: '拼豆上方',
        referenceHint: '作为临摹底稿',
        ready: '已选择',
        noImage: '未选择图片',
        uploadImage: '上传公益图片',
        width: '宽度',
        colors: '色数上限',
        colorsHint: '生成时使用的拼豆颜色数量上限；数值越低越简洁，越高越细腻。',
        generationStyle: '生成风格',
        generationStyleCartoon: '卡通',
        generationStyleRealistic: '写实',
        tolerance: '容差',
        toleranceHint: '容差越大，越多接近背景色的像素会被去除；容差越小，边缘保留越多。',
        background: '背景',
        keepBackground: '保留背景',
        removeWhite: '去除背景',
        preparingPattern: '正在生成图案',
        autoGenerateHint: '调整参数后会自动更新画布。',
        palette: '调色盘',
        adjustments: '调整',
        adjustmentTitle: '当前图层调整',
        brightness: '亮度',
        contrast: '对比度',
        saturation: '饱和度',
        temperature: '色温',
        hue: '色相',
        resetAdjustments: '重置调整',
        adjustmentHint: '滑动会直接调整当前图层，可用撤销恢复。',
        adjustmentLocked: '当前图层已锁定，无法应用调整。',
        colorCleanup: '颜色整理',
        colorCleanupHint: '合并相近色，减少碎色。',
        applyColorCleanup: '整理相近颜色',
        colorLimit: '色数上限',
        colorLimitHint: '限制当前图层颜色数。',
        applyColorLimit: '应用色数上限',
        layerColorsCleaned: (count) => (count > 0 ? `已整理 ${count} 颗拼豆。` : '当前图层没有需要整理的相近颜色。'),
        layerColorsLimited: (count, limit) => (count > 0 ? `已将当前图层限制到最多 ${limit} 色。` : `当前图层已经不超过 ${limit} 色。`),
        effects: '效果',
        invertEffect: '反色',
        grayscaleEffect: '灰阶',
        blackWhiteEffect: '黑白',
        effectApplied: (name, count) => `已应用${name}，影响 ${count} 颗拼豆。`,
        mardBasic: 'MARD 基础版（221色）',
        mardComplete: 'MARD 完整版（291色）',
        recentColors: '最近使用',
        layers: '图层',
        addLayer: '新建图层',
        deleteLayer: '删除',
        duplicateLayer: '复制图层',
        renameLayer: '重命名图层',
        reorderLayer: '拖动调整图层顺序',
        activeLayer: '当前图层',
        hiddenLayer: '已隐藏',
        lockedLayer: '已锁定',
        layerBeadCount: (count) => `${count} 颗`,
        usage: '用量',
        totalBeadsLabel: '总颗数',
        colorTypes: '颜色数',
        estimatedPacks: '预计包数',
        beadsPerPack: '每包数量',
        perPackUnit: '颗/包',
        countedLayerTitle: '计入图层',
        countAllLayers: '全部图层',
        countCurrentLayer: '当前图层',
        packUnit: '包',
        noUsage: '暂无用量',
        brandCodes: '色号品牌',
        view: '视图',
        beadShape: '豆子形状',
        roundBeads: '圆形',
        squareBeads: '方形',
        layerOverlap: '重叠格子',
        showActiveLayerOnly: '只看当前图层',
        grid: '网格',
        coordinates: '坐标',
        countLayer: '计入用量',
        eye: '显示',
        lock: '锁定',
        unlock: '解锁',
        lockHint: '锁定后无法在这一层绘制或擦除',
        unlockHint: '解锁后可以继续编辑这一层',
        lockedCanvasHint: '当前图层已锁定',
        manyColors: '颜色较多，可以降低颜色数量。',
        countedLayers: (count) => `已计入 ${count} 个图层`,
        noCountedLayers: '没有图层计入用量。',
        cell: '格子',
        hoverBoard: '移动到画布上',
        empty: '空',
        language: '语言',
        fit: '适配',
        close: '关闭',
        expandPreview: '放大 3D 预览',
        workspaceReady: '创作工作室已就绪。',
        heightFromRatio: '高度将按图片比例计算。',
        status: (width, height, beads, colors) => `${width} * ${height} - ${beads} 颗 - ${colors} 色`,
        panelStatus: (width, height, colors, beads, boards) => `${width} * ${height} - ${colors} 色 - ${beads} 颗 - ${boards} 块板`,
        isolatedBeads: (count) => (count > 0 ? `${count} 颗拼豆无相邻，熨烫时留意。` : '没有无相邻拼豆。'),
        showIsolatedBeads: '显示无相邻拼豆',
        hideIsolatedBeads: '隐藏无相邻拼豆',
        eraserSize: '橡皮大小',
        removeScope: '消除范围',
        removeSameConnected: '同色连续',
        removeAllSameColor: '所有同色',
        removeConnected: '连续块',
        moveScope: '选中范围',
        moveLayer: '全图层',
        movePartial: '局部',
        panToolHint: '提示：使用其他工具时，右键默认用于拖动画布',
        mirrorDirection: '镜像方向',
        mirrorHorizontal: '左右',
        mirrorVertical: '上下',
        shapeType: '形状',
        shapeStyle: '样式',
        shapeOutline: '空心',
        shapeFilled: '实心',
        shapeLine: '直线',
        shapeRectangle: '矩形',
        shapeSquare: '正方',
        shapeEllipse: '椭圆',
        shapeCircle: '正圆',
        shapeTriangle: '三角',
        shapeArrow: '箭头',
        arrowStyle: '箭头',
        arrowSingle: '单向',
        arrowDouble: '双向',
        arrowBlock: '粗箭头',
        textContent: '文字内容',
        textDirection: '排列方向',
        textHorizontal: '横排',
        textVertical: '竖排',
        textSize: '文字高度',
        textSpacing: '文字间距',
        textPlaceholder: '文字 / 数字 / 字母 / 符号',
        clipboardPreview: '剪贴预览',
        clipboardEmpty: React.createElement(React.Fragment, null,
            "\u5148\u7528\u590D\u5236\u5DE5\u5177\u9009\u62E9",
            React.createElement("br", null),
            "\u590D\u5236\u8303\u56F4"),
        clipboardSize: (width, height, beads) => `${width} * ${height} - ${beads} 颗`,
        resetClipboard: '重置剪贴预览',
        copyScope: '复制范围',
        copyConnected: '连续块',
        copySelection: '多选拼豆',
        copySelectionHint: '左键选择或取消要复制的拼豆',
        copiedPattern: (width, height, beads) => `已复制 ${width} * ${height} 图案，${beads} 颗。`,
        copySelectionUpdated: (beads) => `已选择 ${beads} 颗拼豆。`,
        clipboardReset: '剪贴预览已重置。',
        pastedPattern: '已粘贴图案。',
        recoloredBeads: (count) => `已替换 ${count} 颗同色拼豆。`,
        brushCells: (count) => `${formatBrushSize(count)} 格`,
        tools: {
            pencil: { title: '画笔', hint: '绘制拼豆' },
            eraser: { title: '橡皮', hint: '清除格子' },
            fill: { title: '填充', hint: '填充区域' },
            remove: { title: '消除', hint: '清除连续区域' },
            recolor: { title: '换色', hint: '替换同色拼豆' },
            eyedropper: { title: '吸管', hint: '拾取颜色' },
            move: { title: '移动', hint: '移动当前图层图案' },
            copy: { title: '复制', hint: '复制连续图案' },
            paste: { title: '粘贴', hint: '粘贴已复制图案' },
            mirror: { title: '镜像', hint: '翻转当前图层图案' },
            shape: { title: '形状', hint: '绘制基础几何图形' },
            text: { title: '文字', hint: '插入点阵文字' },
            pan: { title: '拖动', hint: '拖动画布' },
        },
    },
    en: {
        appName: 'Beads for Good',
        board: 'Pegboard',
        apply: 'Apply',
        commonSizes: 'Common sizes',
        rightClick: 'Right click',
        rightClickHint: 'Right-click pan drags the canvas; right-click erase clears only the pointed cell and ignores eraser size.',
        pan: 'Pan',
        erase: 'Erase',
        new: 'New',
        clear: 'Clear',
        undo: 'Undo',
        redo: 'Redo',
        exportPatternFull: 'Export pattern',
        exportUsageFull: 'Export usage',
        exportRecordFull: 'Export edit',
        importRecordFull: 'Import edit',
        exportPatternTitle: 'Export pattern',
        exportUsageTitle: 'Export usage workbook',
        exportRecordTitle: 'Export edit record JSON',
        importRecordTitle: 'Import edit history JSON',
        usageExported: 'Usage workbook exported.',
        recordExported: 'Edit record JSON exported.',
        recordImported: 'Edit record imported. You can keep editing.',
        invalidRecord: 'This file is not a valid edit record.',
        unreadableRecord: 'Could not read this edit record JSON.',
        printExportSettings: 'Pattern settings',
        showColorCodes: 'Color codes',
        showGuideLines: 'Guide lines',
        projectNickname: 'Pattern name',
        authorNickname: 'Author name',
        exportFormat: 'Export format',
        exportBounds: 'Export bounds',
        exportPatternBounds: 'Pattern size',
        exportCanvasBounds: 'Canvas size',
        optional: 'Optional',
        exportNow: 'Export',
        preview3d: '3D Preview',
        liveBoard: 'Live board view',
        previewEmpty: 'No 3D preview yet',
        imageToPattern: 'Import Image',
        referenceImage: 'Reference Image',
        uploadReferenceImage: 'Upload reference',
        showReferenceImage: 'Show reference',
        referenceOpacity: 'Opacity',
        referenceAdjust: 'Move/scale',
        referenceAdjustHint: 'Moving/scaling reference image',
        resetReferenceTransform: 'Reset position',
        referencePlacement: 'Display position',
        referenceBelow: 'Below beads',
        referenceAbove: 'Above beads',
        referenceHint: 'Tracing guide',
        ready: 'Ready',
        noImage: 'No image',
        uploadImage: 'Upload image',
        width: 'Width',
        colors: 'Color limit',
        colorsHint: 'Maximum bead colors used in generation; lower is simpler, higher keeps more detail.',
        generationStyle: 'Style',
        generationStyleCartoon: 'Cartoon',
        generationStyleRealistic: 'Realistic',
        tolerance: 'Tolerance',
        toleranceHint: 'Higher tolerance removes more pixels close to the background color; lower tolerance keeps more edge detail.',
        background: 'Background',
        keepBackground: 'Keep background',
        removeWhite: 'Remove background',
        preparingPattern: 'Generating pattern',
        autoGenerateHint: 'Changes update the canvas automatically.',
        palette: 'Palette',
        adjustments: 'Adjust',
        adjustmentTitle: 'Active layer adjustment',
        brightness: 'Brightness',
        contrast: 'Contrast',
        saturation: 'Saturation',
        temperature: 'Temperature',
        hue: 'Hue',
        resetAdjustments: 'Reset adjustments',
        adjustmentHint: 'Sliders adjust the active layer directly; Undo can restore it.',
        adjustmentLocked: 'The active layer is locked.',
        colorCleanup: 'Color cleanup',
        colorCleanupHint: 'Merge close colors and reduce speckles.',
        applyColorCleanup: 'Merge close colors',
        colorLimit: 'Color limit',
        colorLimitHint: 'Limit colors in the active layer.',
        applyColorLimit: 'Apply color limit',
        layerColorsCleaned: (count) => (count > 0 ? `${count} beads cleaned up.` : 'No close colors need cleanup in the active layer.'),
        layerColorsLimited: (count, limit) => (count > 0 ? `Active layer limited to ${limit} colors.` : `Active layer already has ${limit} colors or fewer.`),
        effects: 'Effects',
        invertEffect: 'Invert',
        grayscaleEffect: 'Grayscale',
        blackWhiteEffect: 'B/W',
        effectApplied: (name, count) => `${name} applied to ${count} beads.`,
        mardBasic: 'MARD Basic (221 colors)',
        mardComplete: 'MARD Complete (291 colors)',
        recentColors: 'Recent',
        layers: 'Layers',
        addLayer: 'New layer',
        deleteLayer: 'Delete',
        duplicateLayer: 'Duplicate layer',
        renameLayer: 'Rename layer',
        reorderLayer: 'Drag to reorder layer',
        activeLayer: 'Active layer',
        hiddenLayer: 'Hidden',
        lockedLayer: 'Locked',
        layerBeadCount: (count) => `${count} beads`,
        usage: 'Usage',
        totalBeadsLabel: 'Total beads',
        colorTypes: 'Colors',
        estimatedPacks: 'Est. packs',
        beadsPerPack: 'Beads per pack',
        perPackUnit: 'beads/pack',
        countedLayerTitle: 'Counted layers',
        countAllLayers: 'All layers',
        countCurrentLayer: 'Current layer',
        packUnit: 'packs',
        noUsage: 'No usage yet',
        brandCodes: 'Brand codes',
        view: 'View',
        beadShape: 'Bead shape',
        roundBeads: 'Round',
        squareBeads: 'Square',
        layerOverlap: 'Overlap cells',
        showActiveLayerOnly: 'Current layer only',
        grid: 'Grid',
        coordinates: 'Coordinates',
        countLayer: 'Count this layer in usage',
        eye: 'Eye',
        lock: 'Lock',
        unlock: 'Unlock',
        lockHint: 'Lock this layer to prevent drawing or erasing on it',
        unlockHint: 'Unlock this layer to edit it again',
        lockedCanvasHint: 'Current layer is locked',
        manyColors: 'Many colors; consider lowering max colors.',
        countedLayers: (count) => `${count} layers counted`,
        noCountedLayers: 'No layers counted in usage.',
        cell: 'Cell',
        hoverBoard: 'Hover the board',
        empty: 'empty',
        language: 'Language',
        fit: 'Fit',
        close: 'Close',
        expandPreview: 'Expand 3D preview',
        workspaceReady: 'Workspace ready.',
        heightFromRatio: 'Height is calculated from the image ratio.',
        status: (width, height, beads, colors) => `${width} * ${height} - ${beads} beads - ${colors} colors`,
        panelStatus: (width, height, colors, beads, boards) => `${width} * ${height} - ${colors} colors - ${beads} beads - ${boards} boards`,
        isolatedBeads: (count) => (count > 0 ? `${count} beads have no neighbors; watch when fusing.` : 'No beads without neighbors.'),
        showIsolatedBeads: 'Show beads without neighbors',
        hideIsolatedBeads: 'Hide beads without neighbors',
        eraserSize: 'Eraser size',
        removeScope: 'Clear range',
        removeSameConnected: 'Same area',
        removeAllSameColor: 'All same',
        removeConnected: 'Connected',
        moveScope: 'Selection',
        moveLayer: 'Layer',
        movePartial: 'Partial',
        panToolHint: 'Tip: when using other tools, right-click drags the canvas by default.',
        mirrorDirection: 'Mirror',
        mirrorHorizontal: 'Left-right',
        mirrorVertical: 'Up-down',
        shapeType: 'Shape',
        shapeStyle: 'Style',
        shapeOutline: 'Outline',
        shapeFilled: 'Filled',
        shapeLine: 'Line',
        shapeRectangle: 'Rect',
        shapeSquare: 'Square',
        shapeEllipse: 'Oval',
        shapeCircle: 'Circle',
        shapeTriangle: 'Triangle',
        shapeArrow: 'Arrow',
        arrowStyle: 'Arrow',
        arrowSingle: 'Single',
        arrowDouble: 'Double',
        arrowBlock: 'Block',
        textContent: 'Text',
        textDirection: 'Direction',
        textHorizontal: 'Horizontal',
        textVertical: 'Vertical',
        textSize: 'Text height',
        textSpacing: 'Spacing',
        textPlaceholder: 'Text / numbers / letters / symbols',
        clipboardPreview: 'Clipboard',
        clipboardEmpty: 'Copy a pattern first',
        clipboardSize: (width, height, beads) => `${width} * ${height} - ${beads} beads`,
        resetClipboard: 'Reset clipboard preview',
        copyScope: 'Copy range',
        copyConnected: 'Connected',
        copySelection: 'Select beads',
        copySelectionHint: 'Left-click to select or deselect individual beads.',
        copiedPattern: (width, height, beads) => `Copied ${width} x ${height}, ${beads} beads.`,
        copySelectionUpdated: (beads) => `${beads} beads selected.`,
        clipboardReset: 'Clipboard preview reset.',
        pastedPattern: 'Pattern pasted.',
        recoloredBeads: (count) => `${count} matching beads recolored.`,
        brushCells: (count) => `${formatBrushSize(count)} cells`,
        tools: {
            pencil: { title: 'Pencil', hint: 'Paint beads' },
            eraser: { title: 'Eraser', hint: 'Clear cells' },
            fill: { title: 'Fill', hint: 'Fill an area' },
            remove: { title: 'Clear', hint: 'Clear connected area' },
            recolor: { title: 'Recolor', hint: 'Replace matching beads' },
            eyedropper: { title: 'Dropper', hint: 'Pick color' },
            move: { title: 'Move', hint: 'Move active layer artwork' },
            copy: { title: 'Copy', hint: 'Copy connected pattern' },
            paste: { title: 'Paste', hint: 'Paste copied pattern' },
            mirror: { title: 'Mirror', hint: 'Flip active layer artwork' },
            shape: { title: 'Shape', hint: 'Draw basic geometry' },
            text: { title: 'Text', hint: 'Insert dot text' },
            pan: { title: 'Drag', hint: 'Drag canvas' },
        },
    },
};
const tools = [
    { id: 'pencil' },
    { id: 'eraser' },
    { id: 'fill' },
    { id: 'remove' },
    { id: 'recolor' },
    { id: 'eyedropper' },
    { id: 'move' },
    { id: 'copy' },
    { id: 'paste' },
    { id: 'mirror' },
    { id: 'shape' },
    { id: 'text' },
    { id: 'pan' },
];
const primaryToolIds = ['pencil', 'eraser', 'fill', 'eyedropper', 'move', 'text'];
const advancedToolIds = ['remove', 'recolor', 'copy', 'paste', 'mirror', 'shape', 'pan'];
function formatBrushSize(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
function addOneCellOutline(cells, width, height, colorId) {
    const outlined = cells.slice();
    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            const index = y * width + x;
            if (cells[index])
                continue;
            let touchesPattern = false;
            for (let dy = -1; dy <= 1 && !touchesPattern; dy += 1) {
                for (let dx = -1; dx <= 1; dx += 1) {
                    if (dx === 0 && dy === 0)
                        continue;
                    const neighborX = x + dx;
                    const neighborY = y + dy;
                    if (neighborX < 0 || neighborY < 0 || neighborX >= width || neighborY >= height)
                        continue;
                    if (cells[neighborY * width + neighborX]) {
                        touchesPattern = true;
                        break;
                    }
                }
            }
            if (touchesPattern)
                outlined[index] = colorId;
        }
    }
    return outlined;
}
const sizePresets = [
    { label: '52 * 52', width: 52, height: 52 },
    { label: '78 * 78', width: 78, height: 78 },
    { label: '104 * 104', width: 104, height: 104 },
    { label: '156 * 156', width: 156, height: 156 },
];
const defaultImportSettings = {
    width: 52,
    maxColors: 24,
    generationStyle: 'cartoon',
    backgroundMode: 'remove-white',
    tolerance: 32,
    speckleReduction: 1,
};
const defaultColorId = 'mard-h7';
const defaultRecentColorIds = ['mard-h7', 'mard-h2'];
const defaultAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    hue: 0,
};
const importSettingsKey = 'wei-ai-pindou:import-settings';
function loadImportSettings() {
    const fallback = {
        maxColors: defaultImportSettings.maxColors,
        generationStyle: defaultImportSettings.generationStyle,
        backgroundMode: defaultImportSettings.backgroundMode,
        tolerance: defaultImportSettings.tolerance,
        paletteMode: 'basic',
    };
    try {
        const stored = JSON.parse(localStorage.getItem(importSettingsKey) ?? '{}');
        return {
            maxColors: [12, 18, 24, 32, 48].includes(Number(stored.maxColors))
                ? Number(stored.maxColors)
                : fallback.maxColors,
            generationStyle: stored.generationStyle === 'realistic' ? 'realistic' : fallback.generationStyle,
            backgroundMode: stored.backgroundMode === 'keep' ? 'keep' : fallback.backgroundMode,
            tolerance: Number.isFinite(stored.tolerance)
                ? Math.min(120, Math.max(0, Math.round(Number(stored.tolerance))))
                : fallback.tolerance,
            paletteMode: stored.paletteMode === 'complete' ? 'complete' : fallback.paletteMode,
        };
    }
    catch {
        return fallback;
    }
}
export default function App() {
    const fileInputRef = useRef(null);
    const referenceInputRef = useRef(null);
    const jsonInputRef = useRef(null);
    const autoGenerateShouldCommitRef = useRef(false);
    const generationRequestRef = useRef(0);
    const adjustmentSessionRef = useRef({ layerId: null, baseCells: [] });
    const soloVisibilitySnapshotRef = useRef(null);
    const [language, setLanguage] = useState(() => (localStorage.getItem(languageKey) === 'en' ? 'en' : 'zh'));
    const text = ui[language];
    const [project, setProject] = useState(() => loadDraft() ?? createProject());
    const [initialImportSettings] = useState(loadImportSettings);
    const [selectedColorId, setSelectedColorId] = useState(defaultColorId);
    const [recentColorIds, setRecentColorIds] = useState(defaultRecentColorIds);
    const [tool, setTool] = useState('pencil');
    const [eraserSize, setEraserSize] = useState(0);
    const [removeMode, setRemoveMode] = useState('same-connected');
    const [moveMode, setMoveMode] = useState('layer');
    const [mirrorMode, setMirrorMode] = useState('layer');
    const [mirrorDirection, setMirrorDirection] = useState('horizontal');
    const [shapeKind, setShapeKind] = useState('line');
    const [shapeFillMode, setShapeFillMode] = useState('outline');
    const [arrowKind, setArrowKind] = useState('single');
    const [textToolValue, setTextToolValue] = useState('ABC');
    const [textToolDirection, setTextToolDirection] = useState('horizontal');
    const [textToolSize, setTextToolSize] = useState(17);
    const [textToolSpacing, setTextToolSpacing] = useState(1);
    const [showPrintExportPanel, setShowPrintExportPanel] = useState(false);
    const [printExportOptions, setPrintExportOptions] = useState({
        format: 'png',
        exportBounds: 'pattern',
        showColorCodes: true,
        showGuideLines: true,
        projectName: '',
        authorName: '',
    });
    const [showPencilOptions, setShowPencilOptions] = useState(false);
    const [showEraserOptions, setShowEraserOptions] = useState(false);
    const [showRemoveOptions, setShowRemoveOptions] = useState(false);
    const [showMoveOptions, setShowMoveOptions] = useState(false);
    const [showMirrorOptions, setShowMirrorOptions] = useState(false);
    const [showShapeOptions, setShowShapeOptions] = useState(false);
    const [showTextOptions, setShowTextOptions] = useState(false);
    const [showClipboardOptions, setShowClipboardOptions] = useState(false);
    const [showPanOptions, setShowPanOptions] = useState(false);
    const [showMoreTools, setShowMoreTools] = useState(false);
    const [clipboardPattern, setClipboardPattern] = useState(null);
    const [copyMode, setCopyMode] = useState('connected');
    const [copySelectionIndices, setCopySelectionIndices] = useState([]);
    const [pendingFile, setPendingFile] = useState(null);
    const [pendingImageUrl, setPendingImageUrl] = useState(null);
    const [referenceFile, setReferenceFile] = useState(null);
    const [referenceImageUrl, setReferenceImageUrl] = useState(null);
    const [referenceVisible, setReferenceVisible] = useState(false);
    const [referenceOpacity, setReferenceOpacity] = useState(0.55);
    const [referenceScale, setReferenceScale] = useState(1);
    const [referenceOffset, setReferenceOffset] = useState({ x: 0, y: 0 });
    const [referenceAdjusting, setReferenceAdjusting] = useState(false);
    const [referencePlacement, setReferencePlacement] = useState('below');
    const [canvasWidth, setCanvasWidth] = useState(project.width);
    const [canvasHeight, setCanvasHeight] = useState(project.height);
    const [convertWidth, setConvertWidth] = useState(project.width);
    const [maxColors, setMaxColors] = useState(initialImportSettings.maxColors);
    const [generationStyle, setGenerationStyle] = useState(initialImportSettings.generationStyle);
    const [backgroundMode, setBackgroundMode] = useState(initialImportSettings.backgroundMode);
    const [tolerance, setTolerance] = useState(initialImportSettings.tolerance);
    const [isGenerating, setIsGenerating] = useState(false);
    const [notice, setNotice] = useState(text.workspaceReady);
    const [noticeVisible, setNoticeVisible] = useState(false);
    const [floatingHelp, setFloatingHelp] = useState(null);
    const [hoverCell, setHoverCell] = useState(null);
    const [highlightedColorId, setHighlightedColorId] = useState(null);
    const [showIsolatedBeads, setShowIsolatedBeads] = useState(false);
    const [showThreePreview, setShowThreePreview] = useState(false);
    const [rightTab, setRightTab] = useState('generator');
    const [editingLayerId, setEditingLayerId] = useState(null);
    const [editingLayerName, setEditingLayerName] = useState('');
    const [draggingLayerId, setDraggingLayerId] = useState(null);
    const [dragTarget, setDragTarget] = useState(null);
    const [paletteMode, setPaletteMode] = useState(initialImportSettings.paletteMode);
    const [paletteGroup, setPaletteGroup] = useState('all');
    const [adjustments, setAdjustments] = useState(defaultAdjustments);
    const [colorCleanupStrength, setColorCleanupStrength] = useState(2);
    const [layerColorLimit, setLayerColorLimit] = useState(16);
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);
    const usage = useMemo(() => summarizeUsage(project), [project]);
    const totalBeads = usage.reduce((sum, row) => sum + row.count, 0);
    const totalPacks = usage.reduce((sum, row) => sum + row.packs, 0);
    const boardCount = Math.ceil(project.width / project.boardSettings.boardWidth) *
        Math.ceil(project.height / project.boardSettings.boardHeight);
    const isolatedBeadRefs = useMemo(() => findIsolatedBeads(project), [project]);
    const isolatedBeads = isolatedBeadRefs.length;
    const isolatedCellIndices = useMemo(() => (showIsolatedBeads ? [...new Set(isolatedBeadRefs.map((item) => item.index))] : []), [isolatedBeadRefs, showIsolatedBeads]);
    const selectedColor = getColor(selectedColorId);
    const activePalette = paletteMode === 'basic' ? basicPalette : completePalette;
    const recentColors = recentColorIds.flatMap((id) => {
        const color = activePalette.find((item) => item.id === id);
        return color ? [color] : [];
    });
    const paletteGroups = useMemo(() => [
        { id: 'all', label: 'All' },
        ...[...new Set(activePalette.map((color) => color.group))].map((group) => ({ id: group, label: group })),
    ], [activePalette]);
    const visiblePalette = useMemo(() => (paletteGroup === 'all' ? activePalette : activePalette.filter((color) => color.group === paletteGroup)), [activePalette, paletteGroup]);
    const compactPalette = useMemo(() => {
        const seen = new Set();
        const preferredIds = [
            'mard-f8', 'mard-f5', 'mard-f2', 'mard-f3', 'mard-f12', 'mard-f14', 'mard-f19',
            'mard-a10', 'mard-a6', 'mard-a26', 'mard-b26', 'mard-g8', 'mard-h9', 'mard-h3',
            'mard-g16', 'mard-h2', 'mard-g20', 'mard-h16', 'mard-g4', 'mard-f17', 'mard-f24',
        ];
        const preferred = preferredIds.flatMap((id) => {
            const color = activePalette.find((item) => item.id === id);
            return color ? [color] : [];
        });
        return [...preferred, ...usage.map((row) => row.color), ...activePalette]
            .filter((color) => {
            if (seen.has(color.id))
                return false;
            seen.add(color.id);
            return true;
        })
            .slice(0, 21);
    }, [activePalette, usage]);
    function displayCode(color) {
        return color.primaryCode;
    }
    function displayName(color) {
        if (language !== 'zh')
            return color.name;
        const colorNames = {
            A26: '浅黄色',
            F5: '大红色',
            F11: '深褐色',
            F24: '浅粉色',
            H2: '白色',
            H6: '黑色',
            H7: '黑色',
            H16: '深褐色',
            H17: '象牙白',
        };
        return colorNames[color.primaryCode] ?? color.name;
    }
    function showFloatingHelp(anchor, tooltip) {
        const rect = anchor.getBoundingClientRect();
        const tooltipWidth = 172;
        const left = Math.min(rect.right + 8, window.innerWidth - tooltipWidth - 10);
        setFloatingHelp({
            text: tooltip,
            left,
            top: rect.top + rect.height / 2,
        });
    }
    function imageHelpProps(tooltip) {
        return {
            'data-tooltip': tooltip,
            'aria-label': tooltip,
            tabIndex: 0,
            onMouseEnter: (event) => showFloatingHelp(event.currentTarget, tooltip),
            onMouseLeave: () => setFloatingHelp(null),
            onFocus: (event) => showFloatingHelp(event.currentTarget, tooltip),
            onBlur: () => setFloatingHelp(null),
        };
    }
    function displayCodeById(colorId) {
        const color = getColor(colorId);
        return color ? displayCode(color) : '';
    }
    function layerDisplayName(layer, index) {
        if (layer.customName)
            return layer.name;
        const match = layer.name.match(/^(?:Layer|图层)\s+(\d+)$/);
        if (match)
            return language === 'zh' ? `图层 ${match[1]}` : `Layer ${match[1]}`;
        if (layer.id === 'base' || layer.name === 'Pattern' || layer.name === 'Base bead layer' || layer.name === '基础珠子层') {
            return systemLayerName(index);
        }
        if (!layer.name.trim())
            return language === 'zh' ? `图层 ${index + 1}` : `Layer ${index + 1}`;
        return layer.name;
    }
    function systemLayerName(index) {
        return language === 'zh' ? `图层 ${index + 1}` : `Layer ${index + 1}`;
    }
    function startEditingLayer(layer, index) {
        setEditingLayerId(layer.id);
        setEditingLayerName(layerDisplayName(layer, index));
    }
    function saveEditingLayer(layer, index) {
        const nextName = editingLayerName.trim();
        setEditingLayerId(null);
        if (!nextName)
            return;
        const isSystemName = nextName === `图层 ${index + 1}` || nextName === `Layer ${index + 1}`;
        if (isSystemName && !layer.customName)
            return;
        if (nextName === layer.name && layer.customName)
            return;
        updateLayer(layer.id, { name: nextName, customName: !isSystemName });
    }
    function layerMetaText(isActive, isVisible, isLocked, beadCount) {
        const countText = text.layerBeadCount(beadCount);
        const states = [];
        if (isActive)
            states.push(text.activeLayer);
        if (!isVisible)
            states.push(text.hiddenLayer);
        if (isLocked)
            states.push(text.lockedLayer);
        states.push(countText);
        return states.join(' - ');
    }
    useEffect(() => {
        saveDraft(project);
    }, [project]);
    useEffect(() => {
        localStorage.setItem(languageKey, language);
    }, [language]);
    useEffect(() => {
        localStorage.setItem(importSettingsKey, JSON.stringify({
            maxColors,
            generationStyle,
            backgroundMode,
            tolerance,
            paletteMode,
        }));
    }, [backgroundMode, generationStyle, maxColors, paletteMode, tolerance]);
    useEffect(() => {
        setShowPencilOptions(false);
        setShowEraserOptions(false);
        setShowRemoveOptions(false);
        setShowMoveOptions(false);
        setShowMirrorOptions(false);
        setShowShapeOptions(false);
        setShowTextOptions(false);
        setShowClipboardOptions(false);
        setShowPanOptions(false);
        setShowMoreTools(false);
    }, [rightTab]);
    useEffect(() => {
        return () => {
            if (pendingImageUrl)
                URL.revokeObjectURL(pendingImageUrl);
        };
    }, [pendingImageUrl]);
    useEffect(() => {
        return () => {
            if (referenceImageUrl)
                URL.revokeObjectURL(referenceImageUrl);
        };
    }, [referenceImageUrl]);
    useEffect(() => {
        setCanvasWidth(project.width);
        setCanvasHeight(project.height);
    }, [project.width, project.height]);
    useEffect(() => {
        if (!pendingFile)
            setConvertWidth(project.width);
    }, [pendingFile, project.width]);
    useEffect(() => {
        setNotice((current) => {
            if (current === ui.zh.workspaceReady || current === ui.en.workspaceReady)
                return text.workspaceReady;
            const zhGenerated = current.match(/^(\d+) 色 - (\d+) 颗 - 可编辑图案已生成。$/);
            if (zhGenerated)
                return `${zhGenerated[1]} colors - ${zhGenerated[2]} beads - editable pattern ready.`;
            const enGenerated = current.match(/^(\d+) colors - (\d+) beads - editable pattern ready\.$/);
            if (enGenerated)
                return `${enGenerated[1]} 色 - ${enGenerated[2]} 颗 - 可编辑图案已生成。`;
            return current;
        });
    }, [language, text.workspaceReady]);
    useEffect(() => {
        if (notice === text.workspaceReady)
            return;
        setNoticeVisible(true);
        const timer = window.setTimeout(() => setNoticeVisible(false), 3200);
        return () => window.clearTimeout(timer);
    }, [notice, text.workspaceReady]);
    useEffect(() => {
        if (!activePalette.some((color) => color.id === selectedColorId)) {
            setSelectedColorId(activePalette[0].id);
        }
        if (!paletteGroups.some((group) => group.id === paletteGroup)) {
            setPaletteGroup('all');
        }
    }, [activePalette, paletteGroups, paletteGroup, selectedColorId]);
    useEffect(() => {
        function onPaste(event) {
            const file = [...(event.clipboardData?.files ?? [])].find((item) => item.type.startsWith('image/'));
            if (file)
                handleImageFile(file);
        }
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, []);
    useEffect(() => {
        if (!pendingFile)
            return;
        const timer = window.setTimeout(() => {
            const shouldCommit = autoGenerateShouldCommitRef.current;
            autoGenerateShouldCommitRef.current = false;
            void generateFromImage({ recordHistory: shouldCommit, automatic: true });
        }, 420);
        return () => window.clearTimeout(timer);
    }, [pendingFile, convertWidth, maxColors, generationStyle, backgroundMode, tolerance, paletteMode]);
    function commitHistory() {
        setPast((items) => [...items.slice(-39), project]);
        setFuture([]);
    }
    function updateProject(next) {
        setProject({ ...next, updatedAt: new Date().toISOString() });
    }
    function selectColor(colorId, options = {}) {
        setSelectedColorId(colorId);
        if (options.updateRecent === false)
            return;
        setRecentColorIds((current) => [colorId, ...current.filter((id) => id !== colorId)].slice(0, 7));
    }
    function activateTool(nextTool) {
        const closingTextOptions = nextTool === 'text' && tool === 'text' && showTextOptions;
        setTool(nextTool);
        setShowPencilOptions(nextTool === 'pencil');
        setShowEraserOptions(nextTool === 'eraser');
        setShowRemoveOptions(nextTool === 'remove');
        setShowMoveOptions(nextTool === 'move');
        setShowMirrorOptions(nextTool === 'mirror');
        setShowShapeOptions(nextTool === 'shape');
        setShowTextOptions(nextTool === 'text' && !closingTextOptions);
        setShowClipboardOptions(nextTool === 'copy' || nextTool === 'paste');
        setShowPanOptions(nextTool === 'pan');
        setShowMoreTools(false);
    }
    function updateCells(cells) {
        updateProject(withCells(project, cells));
    }
    function resetImportSettings(width = project.width) {
        setConvertWidth(width);
        setMaxColors(defaultImportSettings.maxColors);
        setGenerationStyle(defaultImportSettings.generationStyle);
        setBackgroundMode(defaultImportSettings.backgroundMode);
        setTolerance(defaultImportSettings.tolerance);
    }
    function resetReferenceTransform() {
        setReferenceScale(1);
        setReferenceOffset({ x: 0, y: 0 });
        setReferenceAdjusting(false);
    }
    function resetAdjustments() {
        const session = adjustmentSessionRef.current;
        if (session.layerId === activeLayer.id && session.baseCells.length === activeLayer.cells.length) {
            updateProject(withLayers(project, layers.map((layer) => (layer.id === activeLayer.id ? { ...layer, cells: session.baseCells.slice() } : layer))));
        }
        setAdjustments(defaultAdjustments);
        adjustmentSessionRef.current = { layerId: null, baseCells: [] };
    }
    function updateAdjustment(key, value) {
        if (activeLayer.locked) {
            setNotice(text.adjustmentLocked);
            return;
        }
        const nextAdjustments = { ...adjustments, [key]: value };
        if (adjustmentSessionRef.current.layerId !== activeLayer.id) {
            adjustmentSessionRef.current = { layerId: activeLayer.id, baseCells: activeLayer.cells.slice() };
            commitHistory();
        }
        const baseCells = adjustmentSessionRef.current.baseCells.length > 0 ? adjustmentSessionRef.current.baseCells : activeLayer.cells;
        const adjustedCells = adjustLayerCells(baseCells, nextAdjustments, activePalette);
        setAdjustments(nextAdjustments);
        updateProject(withLayers(project, layers.map((layer) => (layer.id === activeLayer.id ? { ...layer, cells: adjustedCells } : layer))));
    }
    function applyColorCleanup() {
        if (activeLayer.locked) {
            setNotice(text.adjustmentLocked);
            return;
        }
        const { cells, changed } = mergeCloseLayerColors(activeLayer.cells, activePalette, colorCleanupStrength);
        if (changed > 0) {
            commitHistory();
            updateProject(withLayers(project, layers.map((layer) => (layer.id === activeLayer.id ? { ...layer, cells } : layer))));
        }
        setNotice(text.layerColorsCleaned(changed));
    }
    function applyLayerColorLimit() {
        if (activeLayer.locked) {
            setNotice(text.adjustmentLocked);
            return;
        }
        const { cells, changed } = limitLayerColors(activeLayer.cells, activePalette, layerColorLimit);
        if (changed > 0) {
            commitHistory();
            updateProject(withLayers(project, layers.map((layer) => (layer.id === activeLayer.id ? { ...layer, cells } : layer))));
        }
        setNotice(text.layerColorsLimited(changed, layerColorLimit));
    }
    function applyLayerEffect(effect, label) {
        if (activeLayer.locked) {
            setNotice(text.adjustmentLocked);
            return;
        }
        const { cells, changed } = applyEffectToLayer(activeLayer.cells, activePalette, effect);
        if (changed > 0) {
            commitHistory();
            updateProject(withLayers(project, layers.map((layer) => (layer.id === activeLayer.id ? { ...layer, cells } : layer))));
        }
        setNotice(text.effectApplied(label, changed));
    }
    function replaceColor(sourceColorId) {
        if (!sourceColorId || sourceColorId === selectedColorId)
            return;
        let changed = 0;
        const visibleLayerIds = new Set(displayProject.layers.filter((layer) => layer.visible).map((layer) => layer.id));
        const nextLayers = layers.map((layer) => {
            if (layer.locked || !visibleLayerIds.has(layer.id))
                return layer;
            let layerChanged = false;
            const cells = layer.cells.map((cell) => {
                if (cell !== sourceColorId)
                    return cell;
                changed += 1;
                layerChanged = true;
                return selectedColorId;
            });
            return layerChanged ? { ...layer, cells } : layer;
        });
        if (changed === 0)
            return;
        commitHistory();
        updateProject(withLayers(project, nextLayers, project.activeLayerId));
        setNotice(text.recoloredBeads(changed));
    }
    function undo() {
        const previous = past[past.length - 1];
        if (!previous)
            return;
        setPast((items) => items.slice(0, -1));
        setFuture((items) => [...items, project]);
        updateProject(previous);
    }
    function redo() {
        const next = future[future.length - 1];
        if (!next)
            return;
        setFuture((items) => items.slice(0, -1));
        setPast((items) => [...items, project]);
        updateProject(next);
    }
    function startBlank(width = 52, height = 52) {
        soloVisibilitySnapshotRef.current = null;
        setProject(createProject(width, height));
        setPast([]);
        setFuture([]);
        setClipboardPattern(null);
        setCopySelectionIndices([]);
        resetAdjustments();
        resetImportSettings(width);
        setSelectedColorId(defaultColorId);
        setRecentColorIds(defaultRecentColorIds);
        setPaletteMode('basic');
        setPaletteGroup('all');
        setPendingFile(null);
        setPendingImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return null;
        });
        setReferenceFile(null);
        setReferenceImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return null;
        });
        setReferenceVisible(false);
        setReferenceOpacity(0.55);
        resetReferenceTransform();
        setNotice(language === 'zh' ? `已创建 ${width} * ${height} 空白画布。` : `Blank ${width} x ${height} canvas created.`);
    }
    function clearCanvas() {
        if (activeLayer.locked)
            return;
        if (activeLayer.cells.every((cell) => cell === null))
            return;
        commitHistory();
        updateProject(withCells(project, Array.from({ length: project.width * project.height }, () => null)));
        setNotice(language === 'zh' ? '画布已清空。' : 'Canvas cleared.');
    }
    function resizeCanvas() {
        const width = clampInteger(canvasWidth, 8, 180);
        const height = clampInteger(canvasHeight, 8, 180);
        if (width === project.width && height === project.height)
            return;
        setConvertWidth(width);
        commitHistory();
        const nextLayers = layers.map((layer) => ({
            ...layer,
            cells: resizeCells(layer.cells, project.width, project.height, width, height),
        }));
        updateProject({
            ...project,
            width,
            height,
            layers: nextLayers,
            cells: composeVisibleCells(nextLayers, width, height),
        });
        setNotice(language === 'zh' ? `画布已调整为 ${width} * ${height}。` : `Canvas resized to ${width} x ${height}.`);
    }
    function applyPreset(value) {
        const preset = sizePresets.find((item) => item.label === value);
        if (!preset)
            return;
        setCanvasWidth(preset.width);
        setCanvasHeight(preset.height);
        setConvertWidth(preset.width);
        if (preset.width === project.width && preset.height === project.height)
            return;
        commitHistory();
        const nextLayers = layers.map((layer) => ({
            ...layer,
            cells: resizeCells(layer.cells, project.width, project.height, preset.width, preset.height),
        }));
        updateProject({
            ...project,
            width: preset.width,
            height: preset.height,
            layers: nextLayers,
            cells: composeVisibleCells(nextLayers, preset.width, preset.height),
        });
        setNotice(language === 'zh' ? `画布已调整为 ${preset.width} * ${preset.height}。` : `Canvas resized to ${preset.width} x ${preset.height}.`);
    }
    function handleImageFile(file) {
        if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
            setNotice(language === 'zh' ? '请使用 PNG、JPG、JPEG 或 WebP 图片。' : 'Use a PNG, JPG, JPEG, or WebP image.');
            return;
        }
        setPendingFile(file);
        setPendingImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return URL.createObjectURL(file);
        });
        setReferenceFile(file);
        setReferenceImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return URL.createObjectURL(file);
        });
        resetReferenceTransform();
        autoGenerateShouldCommitRef.current = true;
        setNotice(language === 'zh' ? `正在生成 ${file.name}...` : `Generating ${file.name}...`);
    }
    async function loadLoveFlowerExample() {
        try {
            const response = await fetch('./assets/ip/person-1.png');
            if (!response.ok)
                throw new Error('Example image unavailable');
            const blob = await response.blob();
            const bitmap = await createImageBitmap(blob);
            const side = Math.max(bitmap.width, bitmap.height);
            const canvas = document.createElement('canvas');
            canvas.width = side;
            canvas.height = side;
            const context = canvas.getContext('2d');
            if (!context)
                throw new Error('Example image unavailable');
            const imageX = Math.round((side - bitmap.width) / 2);
            const imageY = Math.round((side - bitmap.height) / 2);
            const silhouette = document.createElement('canvas');
            silhouette.width = side;
            silhouette.height = side;
            const silhouetteContext = silhouette.getContext('2d');
            if (!silhouetteContext)
                throw new Error('Example image unavailable');
            silhouetteContext.drawImage(bitmap, imageX, imageY);
            silhouetteContext.globalCompositeOperation = 'source-in';
            silhouetteContext.fillStyle = '#342827';
            silhouetteContext.fillRect(0, 0, side, side);
            const outline = Math.max(5, Math.round(side * 0.035));
            for (const [offsetX, offsetY] of [[-outline, 0], [outline, 0], [0, -outline], [0, outline], [-outline, -outline], [outline, -outline], [-outline, outline], [outline, outline]]) {
                context.drawImage(silhouette, offsetX, offsetY);
            }
            context.drawImage(bitmap, imageX, imageY);
            bitmap.close();
            const squareBlob = await new Promise((resolve, reject) => {
                canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('Example image unavailable'))), 'image/png');
            });
            const file = new File([squareBlob], language === 'zh' ? '小红花公益示例.png' : 'Little Flower example.png', { type: 'image/png' });
            startBlank(52, 52);
            handleImageFile(file);
            const sourceFile = new File([blob], language === 'zh' ? '小红花公益示例.png' : 'Little Flower example.png', { type: 'image/png' });
            setReferenceFile(sourceFile);
            setReferenceImageUrl((current) => {
                if (current)
                    URL.revokeObjectURL(current);
                return URL.createObjectURL(sourceFile);
            });
            setRightTab('generator');
        }
        catch {
            setNotice(language === 'zh' ? '暂时无法载入公益示例，请直接上传图片。' : 'Could not load the example. Upload an image instead.');
        }
    }
    function handleReferenceImageFile(file) {
        if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
            setNotice(language === 'zh' ? '请使用 PNG、JPG、JPEG 或 WebP 图片。' : 'Use a PNG, JPG, JPEG, or WebP image.');
            return;
        }
        setReferenceFile(file);
        setReferenceImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return URL.createObjectURL(file);
        });
        resetReferenceTransform();
        setReferenceVisible(true);
        setNotice(language === 'zh' ? `${file.name} 已设为参考图。` : `${file.name} set as reference image.`);
    }
    async function generateFromImage(options = {}) {
        if (!pendingFile)
            return;
        if (activeLayer.locked) {
            setNotice(text.lockedCanvasHint);
            return;
        }
        const requestId = generationRequestRef.current + 1;
        generationRequestRef.current = requestId;
        const targetLayerId = activeLayer.id;
        const sourceProject = project;
        const sourceLayers = layers;
        setIsGenerating(true);
        setNotice(language === 'zh' ? '正在本地更新拼豆图案...' : 'Updating bead pattern locally...');
        try {
            const result = await imageFileToBeads(pendingFile, {
                width: convertWidth,
                maxColors,
                palette: activePalette,
                generationStyle,
                backgroundMode,
                backgroundColor: [255, 255, 255],
                tolerance,
                speckleReduction: defaultImportSettings.speckleReduction,
            });
            if (requestId !== generationRequestRef.current)
                return;
            const isLoveFlowerExample = pendingFile.name.includes('小红花公益示例') || pendingFile.name.includes('Little Flower example');
            const outlineColorId = nearestPaletteColor([52, 40, 39], activePalette).id;
            const convertedCells = isLoveFlowerExample ? addOneCellOutline(result.cells, result.width, result.height, outlineColorId) : result.cells;
            const convertedTotalBeads = convertedCells.filter(Boolean).length;
            const convertedColorsUsed = new Set(convertedCells.filter(Boolean)).size;
            if (options.recordHistory)
                commitHistory();
            const nextWidth = result.width;
            const nextHeight = result.height;
            const nextLayers = sourceLayers.map((layer) => {
                if (layer.id === targetLayerId) {
                    return {
                        ...layer,
                        cells: convertedCells.slice(),
                    };
                }
                return {
                    ...layer,
                    cells: resizeCells(layer.cells, sourceProject.width, sourceProject.height, nextWidth, nextHeight),
                };
            });
            const nextProject = {
                ...sourceProject,
                width: nextWidth,
                height: nextHeight,
                activeLayerId: targetLayerId,
                layers: nextLayers,
                cells: composeVisibleCells(nextLayers, nextWidth, nextHeight),
            };
            updateProject(nextProject);
            setNotice(language === 'zh'
                ? `${convertedColorsUsed} 色 - ${convertedTotalBeads} 颗 - 可编辑图案已生成。`
                : `${convertedColorsUsed} colors - ${convertedTotalBeads} beads - editable pattern ready.`);
        }
        catch (error) {
            if (requestId !== generationRequestRef.current)
                return;
            setNotice(error instanceof Error ? error.message : 'Could not generate this image.');
        }
        finally {
            if (requestId === generationRequestRef.current)
                setIsGenerating(false);
        }
    }
    async function importJson(file) {
        let imported;
        try {
            const text = await file.text();
            imported = JSON.parse(text);
        }
        catch {
            throw new Error(text.unreadableRecord);
        }
        if (!imported.width || !imported.height || !Array.isArray(imported.cells)) {
            throw new Error(text.invalidRecord);
        }
        soloVisibilitySnapshotRef.current = null;
        const normalizedProject = normalizeProject(imported);
        setProject(normalizedProject);
        setConvertWidth(normalizedProject.width);
        setPast([]);
        setFuture([]);
        setPendingFile(null);
        setPendingImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return null;
        });
        setReferenceFile(null);
        setReferenceImageUrl((current) => {
            if (current)
                URL.revokeObjectURL(current);
            return null;
        });
        setReferenceVisible(false);
        resetReferenceTransform();
        setNotice(text.recordImported);
    }
    function exportUsageList() {
        downloadUsageWorkbook(project);
        setNotice(text.usageExported);
    }
    function exportEditRecord() {
        downloadProjectJson(project);
        setNotice(text.recordExported);
    }
    function resetClipboard() {
        setClipboardPattern(null);
        setCopySelectionIndices([]);
        setNotice(text.clipboardReset);
    }
    function addLayer() {
        commitHistory();
        const nextLayer = createLayer(project.width, project.height, `${text.layers} ${layers.length + 1}`);
        updateProject(withLayers(project, [...layers, nextLayer], nextLayer.id));
    }
    function duplicateLayer(layerId) {
        const sourceIndex = layers.findIndex((layer) => layer.id === layerId);
        const source = layers[sourceIndex];
        if (!source)
            return;
        commitHistory();
        const displayName = layerDisplayName(source, sourceIndex);
        const nextLayer = {
            ...source,
            id: `layer-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: uniqueDuplicateLayerName(displayName),
            customName: true,
            locked: false,
            cells: source.cells.slice(),
        };
        const nextLayers = layers.slice();
        nextLayers.splice(sourceIndex + 1, 0, nextLayer);
        updateProject(withLayers(project, nextLayers, nextLayer.id));
    }
    function uniqueDuplicateLayerName(baseName) {
        const suffix = language === 'zh' ? '复制' : 'copy ';
        const existingNames = new Set(layers.map((layer, index) => layerDisplayName(layer, index)));
        for (let index = 1; index < 1000; index += 1) {
            const candidate = language === 'zh' ? `${baseName}-${suffix}${index}` : `${baseName}-${suffix}${index}`;
            if (!existingNames.has(candidate))
                return candidate;
        }
        return language === 'zh' ? `${baseName}-${suffix}${Date.now()}` : `${baseName}-${suffix}${Date.now()}`;
    }
    function updateLayer(layerId, changes) {
        commitHistory();
        updateProject(withLayers(project, layers.map((layer) => (layer.id === layerId ? { ...layer, ...changes } : layer))));
    }
    function updateUsageLayerSelection(includedLayerIds) {
        const nextLayers = layers.map((layer) => ({
            ...layer,
            includeInUsage: includedLayerIds.has(layer.id),
        }));
        const changed = nextLayers.some((layer, index) => layer.includeInUsage !== layers[index].includeInUsage);
        if (!changed)
            return;
        commitHistory();
        updateProject(withLayers(project, nextLayers, project.activeLayerId));
    }
    function toggleUsageLayer(layerId) {
        const includedLayerIds = new Set(countedLayers.map((layer) => layer.id));
        if (includedLayerIds.has(layerId)) {
            includedLayerIds.delete(layerId);
        }
        else {
            includedLayerIds.add(layerId);
        }
        updateUsageLayerSelection(includedLayerIds);
    }
    function toggleActiveLayerOnly() {
        const shouldEnable = !project.settings.showActiveLayerOnly;
        if (shouldEnable) {
            soloVisibilitySnapshotRef.current = Object.fromEntries(layers.map((layer) => [layer.id, layer.visible]));
            const soloLayers = layers.map((layer) => ({
                ...layer,
                visible: layer.id === activeLayer.id,
            }));
            updateProject({
                ...project,
                settings: { ...project.settings, showActiveLayerOnly: true },
                layers: soloLayers,
                cells: composeVisibleCells(soloLayers, project.width, project.height),
            });
            return;
        }
        const snapshot = soloVisibilitySnapshotRef.current;
        soloVisibilitySnapshotRef.current = null;
        const restoredLayers = layers.map((layer) => ({
            ...layer,
            visible: snapshot?.[layer.id] ?? layer.visible,
        }));
        updateProject({
            ...project,
            settings: { ...project.settings, showActiveLayerOnly: false },
            layers: restoredLayers,
            cells: composeVisibleCells(restoredLayers, project.width, project.height),
        });
    }
    function deleteLayer(layerId) {
        if (layers.length <= 1)
            return;
        commitHistory();
        updateProject(withLayers(project, layers.filter((layer) => layer.id !== layerId)));
    }
    function moveLayer(sourceId, target) {
        if (sourceId === target.id)
            return;
        const originalDisplayLayers = [...layers].reverse();
        const nextDisplayLayers = originalDisplayLayers.slice();
        const sourceIndex = nextDisplayLayers.findIndex((layer) => layer.id === sourceId);
        if (sourceIndex < 0)
            return;
        const [movedLayer] = nextDisplayLayers.splice(sourceIndex, 1);
        const targetIndex = nextDisplayLayers.findIndex((layer) => layer.id === target.id);
        if (targetIndex < 0)
            return;
        const insertIndex = target.edge === 'after' ? targetIndex + 1 : targetIndex;
        nextDisplayLayers.splice(insertIndex, 0, movedLayer);
        const originalOrder = originalDisplayLayers.map((layer) => layer.id).join('|');
        const nextOrder = nextDisplayLayers.map((layer) => layer.id).join('|');
        if (originalOrder === nextOrder)
            return;
        commitHistory();
        updateProject(withLayers(project, nextDisplayLayers.reverse(), project.activeLayerId));
    }
    function dragTargetFromEvent(event, layerId) {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
            id: layerId,
            edge: event.clientY < rect.top + rect.height / 2 ? 'before' : 'after',
        };
    }
    function selectLayer(layerId) {
        if (!project.settings.showActiveLayerOnly) {
            updateProject({ ...project, activeLayerId: layerId });
            return;
        }
        const soloLayers = layers.map((layer) => ({
            ...layer,
            visible: layer.id === layerId,
        }));
        updateProject({
            ...project,
            activeLayerId: layerId,
            layers: soloLayers,
            cells: composeVisibleCells(soloLayers, project.width, project.height),
        });
    }
    function setBeadsPerPack(value) {
        updateProject({
            ...project,
            settings: {
                ...project.settings,
                beadsPerPack: clampInteger(value, 1, 10000),
            },
        });
    }
    function stepBeadsPerPack(direction) {
        const current = project.settings.beadsPerPack;
        const step = 500;
        const next = direction > 0
            ? current % step === 0
                ? current + step
                : Math.ceil(current / step) * step
            : current % step === 0
                ? current - step
                : Math.floor(current / step) * step;
        setBeadsPerPack(Math.max(step, next));
    }
    const layers = project.layers?.length ? project.layers : createProject(project.width, project.height).layers;
    const activeLayer = layers.find((layer) => layer.id === project.activeLayerId) ?? layers[0];
    const countedLayers = layers.filter((layer) => layer.includeInUsage);
    useEffect(() => {
        setCopySelectionIndices([]);
        setAdjustments(defaultAdjustments);
        adjustmentSessionRef.current = { layerId: null, baseCells: [] };
    }, [activeLayer.id, project.width, project.height]);
    const displayProject = useMemo(() => {
        if (!project.settings.showActiveLayerOnly) {
            return project;
        }
        const displayLayers = layers.map((layer) => ({
            ...layer,
            visible: layer.id === activeLayer.id,
        }));
        return {
            ...project,
            layers: displayLayers,
            cells: composeVisibleCells(displayLayers, project.width, project.height),
        };
    }, [activeLayer.id, layers, project]);
    const shapeLabel = {
        line: text.shapeLine,
        rectangle: text.shapeRectangle,
        square: text.shapeSquare,
        ellipse: text.shapeEllipse,
        circle: text.shapeCircle,
        triangle: text.shapeTriangle,
        arrow: text.shapeArrow,
    };
    const arrowLabel = {
        single: text.arrowSingle,
        double: text.arrowDouble,
        block: text.arrowBlock,
    };
    const selectedSizePreset = sizePresets.find((item) => item.width === canvasWidth && item.height === canvasHeight)?.label ?? '';
    const defaultPrintNickname = useMemo(() => {
        const date = new Date();
        const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`;
        return language === 'zh' ? `拼豆图纸_${stamp}` : `Perler_Beads_${stamp}`;
    }, [language]);
    function exportPrintPattern() {
        const exportOptions = {
            ...printExportOptions,
            projectName: printExportOptions.projectName?.trim() || defaultPrintNickname,
            layerLabelPrefix: language === 'en' ? 'Layer' : '图层',
        };
        if (printExportOptions.format === 'pdf') {
            downloadPrintPdf(project, exportOptions);
        }
        else {
            downloadPrintPng(project, exportOptions);
        }
        setShowPrintExportPanel(false);
    }
    return (React.createElement("main", { className: "app-shell", onDragOver: (event) => event.preventDefault(), onDrop: (event) => {
            event.preventDefault();
            const file = [...event.dataTransfer.files].find((item) => item.type.startsWith('image/'));
            if (file)
                handleImageFile(file);
        } },
        React.createElement("input", { ref: fileInputRef, className: "hidden-input", type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (event) => {
                const file = event.currentTarget.files?.[0];
                if (file)
                    handleImageFile(file);
                event.currentTarget.value = '';
            } }),
        React.createElement("input", { ref: referenceInputRef, className: "hidden-input", type: "file", accept: "image/png,image/jpeg,image/webp", onChange: (event) => {
                const file = event.currentTarget.files?.[0];
                if (file)
                    handleReferenceImageFile(file);
                event.currentTarget.value = '';
            } }),
        React.createElement("input", { ref: jsonInputRef, className: "hidden-input", type: "file", accept: "application/json,.json", onChange: (event) => {
                const file = event.currentTarget.files?.[0];
                if (file)
                    importJson(file).catch((error) => setNotice(error.message));
                event.currentTarget.value = '';
            } }),
        React.createElement("header", { className: "topbar" },
            React.createElement("div", { className: "brand-lockup", "aria-label": text.appName },
                React.createElement("img", { className: "brand-flower", src: "./assets/ip/person-head.png", alt: "" }),
                React.createElement("div", null,
                    React.createElement("strong", null, text.appName),
                    React.createElement("small", null, language === 'zh' ? '把公益故事拼成一朵花' : 'Turn stories of good into something you can make'))),
            React.createElement("div", { className: "topbar-workspace" },
                React.createElement("div", { className: "project-meta" },
                    React.createElement("strong", null, language === 'zh' ? '用拼豆讲好公益故事' : 'Tell public-good stories with beads'),
                    React.createElement("span", null, language === 'zh' ? '已自动保存' : 'Autosaved')),
                React.createElement("div", { className: "topbar-params canvas-params", "aria-label": "Canvas controls" },
                    React.createElement("span", { className: "topbar-control-label" }, language === 'zh' ? '尺寸：' : 'Size:'),
                    React.createElement("div", { className: "topbar-dimension-group" },
                        React.createElement("input", { "aria-label": "Canvas width", type: "number", min: 8, max: 180, value: canvasWidth, onChange: (event) => setCanvasWidth(Number(event.target.value)) }),
                        React.createElement("span", { className: "size-times" }, "\u00D7"),
                        React.createElement("input", { "aria-label": "Canvas height", type: "number", min: 8, max: 180, value: canvasHeight, onChange: (event) => setCanvasHeight(Number(event.target.value)) })),
                    React.createElement("select", { className: "canvas-preset-select", "aria-label": "Canvas preset", value: selectedSizePreset || '', onChange: (event) => applyPreset(event.target.value) },
                        React.createElement("option", { value: "", disabled: true, hidden: true }, text.commonSizes),
                        sizePresets.map((preset) => (React.createElement("option", { key: preset.label, value: preset.label }, preset.label)))),
                    React.createElement("button", { className: "canvas-apply-button", onClick: resizeCanvas }, text.apply),
                    React.createElement("span", { className: "canvas-grid-label" }, language === 'zh' ? '网格：' : 'Grid:'),
                    React.createElement("select", { className: "canvas-grid-select", "aria-label": text.grid, value: project.settings.showGrid ? 'on' : 'off', onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showGrid: event.target.value === 'on' } }) },
                        React.createElement("option", { value: "on" }, language === 'zh' ? '开' : 'On'),
                        React.createElement("option", { value: "off" }, language === 'zh' ? '关' : 'Off'))),
                React.createElement("div", { className: "topbar-command-zone" },
                    React.createElement("div", { className: "topbar-actions project-actions" },
                        React.createElement("button", { className: "project-action-button primary-action", onClick: () => startBlank(52, 52) }, text.new),
                        React.createElement("button", { className: "project-action-button clear-action", onClick: clearCanvas }, text.clear),
                        React.createElement("span", { className: "project-action-divider", "aria-hidden": "true" }),
                        React.createElement("button", { className: "project-action-button history-action", onClick: undo, disabled: past.length === 0 }, text.undo),
                        React.createElement("button", { className: "project-action-button history-action", onClick: redo, disabled: future.length === 0 }, text.redo),
                        React.createElement("span", { className: "project-action-divider preview-divider", "aria-hidden": "true" }),
                        React.createElement("button", { className: showThreePreview ? 'project-action-button preview-action active' : 'project-action-button preview-action', onClick: () => setShowThreePreview((current) => !current), "aria-pressed": showThreePreview },
                            React.createElement(EyeIcon, { visible: true }),
                            React.createElement("span", null, language === 'zh' ? '预览' : 'Preview'))),
                    React.createElement("div", { className: "topbar-actions export-actions" },
                        React.createElement("div", { className: "print-export-menu" },
                            React.createElement("button", { className: "export-action-button primary-action print-export-button", title: `${text.exportPatternTitle} PNG`, "aria-expanded": showPrintExportPanel, onClick: () => setShowPrintExportPanel((value) => !value) },
                                React.createElement(ExportIcon, null),
                                React.createElement("span", null, text.exportPatternFull)),
                            showPrintExportPanel && (React.createElement("div", { className: "print-export-popover" },
                                React.createElement("div", { className: "print-export-popover-header" },
                                    React.createElement("strong", null, text.printExportSettings),
                                    React.createElement("button", { className: "print-export-close", type: "button", "aria-label": text.close, title: text.close, onClick: () => setShowPrintExportPanel(false) },
                                        React.createElement(CloseIcon, null))),
                                React.createElement("label", { className: "export-text-field" },
                                    React.createElement("span", null, text.exportFormat),
                                    React.createElement("select", { className: "export-format-select", value: printExportOptions.format ?? 'png', onChange: (event) => setPrintExportOptions((current) => ({ ...current, format: event.target.value })) },
                                        React.createElement("option", { value: "png" }, "PNG"),
                                        React.createElement("option", { value: "pdf" }, "PDF"))),
                                React.createElement("label", { className: "export-text-field" },
                                    React.createElement("span", null, text.exportBounds),
                                    React.createElement("select", { className: "export-format-select", value: printExportOptions.exportBounds ?? 'pattern', onChange: (event) => setPrintExportOptions((current) => ({ ...current, exportBounds: event.target.value })) },
                                        React.createElement("option", { value: "pattern" }, text.exportPatternBounds),
                                        React.createElement("option", { value: "canvas" }, text.exportCanvasBounds))),
                                React.createElement("label", { className: "export-text-field" },
                                    React.createElement("span", null, text.projectNickname),
                                    React.createElement("input", { value: printExportOptions.projectName ?? '', placeholder: defaultPrintNickname, onChange: (event) => setPrintExportOptions((current) => ({ ...current, projectName: event.target.value })) })),
                                React.createElement("label", { className: "export-text-field" },
                                    React.createElement("span", null, text.authorNickname),
                                    React.createElement("input", { value: printExportOptions.authorName ?? '', placeholder: text.optional, onChange: (event) => setPrintExportOptions((current) => ({ ...current, authorName: event.target.value })) })),
                                React.createElement("label", { className: "switch-row" },
                                    React.createElement("span", null, text.showColorCodes),
                                    React.createElement("input", { type: "checkbox", checked: printExportOptions.showColorCodes, onChange: (event) => setPrintExportOptions((current) => ({ ...current, showColorCodes: event.target.checked })) })),
                                React.createElement("label", { className: "switch-row" },
                                    React.createElement("span", null, text.showGuideLines),
                                    React.createElement("input", { type: "checkbox", checked: printExportOptions.showGuideLines, onChange: (event) => setPrintExportOptions((current) => ({ ...current, showGuideLines: event.target.checked })) })),
                                React.createElement("button", { className: "export-submit-button", onClick: exportPrintPattern },
                                    text.exportNow,
                                    " ",
                                    (printExportOptions.format ?? 'png').toUpperCase()),
                                React.createElement("div", { className: "export-secondary-grid", "aria-label": language === 'zh' ? '其他交付文件' : 'Other deliverables' },
                                    React.createElement("button", { type: "button", onClick: exportUsageList },
                                        text.exportUsageFull,
                                        " Excel"),
                                    React.createElement("button", { type: "button", onClick: exportEditRecord },
                                        text.exportRecordFull,
                                        " JSON"),
                                    React.createElement("button", { type: "button", onClick: () => jsonInputRef.current?.click() },
                                        text.importRecordFull,
                                        " JSON"))))),
                        React.createElement("button", { className: "export-action-button", title: text.exportUsageTitle, onClick: exportUsageList }, text.exportUsageFull),
                        React.createElement("button", { className: "export-action-button", title: text.exportRecordTitle, onClick: exportEditRecord }, text.exportRecordFull),
                        React.createElement("button", { className: "export-action-button", title: text.importRecordTitle, onClick: () => jsonInputRef.current?.click() }, text.importRecordFull)))),
            React.createElement("div", { className: "topbar-right" },
                React.createElement("a", { className: "github-link", href: "https://github.com/Jett-Wu/Perler_Beads_Generator", target: "_blank", rel: "noreferrer", "aria-label": language === 'zh' ? '开源说明' : 'Open source', title: language === 'zh' ? '开源说明' : 'Open source' },
                    React.createElement(GitHubIcon, null),
                    React.createElement("span", null, language === 'zh' ? '开源说明' : 'Open source')),
                React.createElement("div", { className: "language-toggle", "aria-label": text.language },
                    React.createElement("button", { className: language === 'zh' ? 'active' : '', onClick: () => setLanguage('zh') }, "\u4E2D"),
                    React.createElement("button", { className: language === 'en' ? 'active' : '', onClick: () => setLanguage('en') }, "EN")))),
        React.createElement("aside", { className: "left-panel" },
            showThreePreview && React.createElement("section", { className: "left-card preview-card" },
                React.createElement("div", { className: "left-card-header" },
                    React.createElement("div", null,
                        React.createElement("strong", null, text.preview3d),
                        React.createElement("span", null, text.liveBoard)),
                    React.createElement("button", { className: "preview-inline-close", type: "button", onClick: () => setShowThreePreview(false) }, text.close)),
                React.createElement(ThreePreview, { project: displayProject, title: text.preview3d, emptyLabel: text.previewEmpty, closeLabel: text.close, expandLabel: text.expandPreview })),
            React.createElement("section", { className: "left-card image-card legacy-image-card" },
                React.createElement("div", { className: "left-card-header" },
                    React.createElement("div", null,
                        React.createElement("strong", { className: "field-label-with-help" },
                            text.imageToPattern,
                            React.createElement("span", { className: "help-dot image-help-dot", ...imageHelpProps(text.autoGenerateHint) }, "?"))),
                    React.createElement("small", null, pendingFile ? text.ready : text.noImage)),
                React.createElement("button", { className: pendingImageUrl ? `upload-zone has-image${isGenerating ? ' is-generating' : ''}` : `upload-zone${isGenerating ? ' is-generating' : ''}`, onClick: () => fileInputRef.current?.click() },
                    pendingImageUrl && React.createElement("img", { src: pendingImageUrl, alt: "" }),
                    React.createElement("span", { className: "upload-zone-text" },
                        React.createElement("strong", null, isGenerating ? text.preparingPattern : pendingFile ? pendingFile.name : text.uploadImage),
                        React.createElement("span", null, isGenerating ? pendingFile?.name : pendingFile ? 'PNG / JPG / WebP' : 'PNG, JPG, WebP'))),
                React.createElement("div", { className: "image-field-grid" },
                    React.createElement("label", { className: "image-number-field" },
                        React.createElement("span", { className: "field-label-with-help" },
                            text.width,
                            React.createElement("span", { className: "help-dot image-help-dot", ...imageHelpProps(text.heightFromRatio) }, "?")),
                        React.createElement("input", { "aria-label": "Output width", type: "number", min: 8, max: 180, value: convertWidth, onChange: (event) => setConvertWidth(Number(event.target.value)) })),
                    React.createElement("label", { className: "image-range-field" },
                        React.createElement("span", null,
                            React.createElement("span", { className: "field-label-with-help" },
                                text.colors,
                                React.createElement("span", { className: "help-dot image-help-dot", ...imageHelpProps(text.colorsHint) }, "?")),
                            React.createElement("strong", null, maxColors)),
                        React.createElement("input", { "aria-label": "Color limit", type: "range", min: 6, max: 48, step: 1, value: maxColors, onChange: (event) => setMaxColors(Number(event.target.value)) })),
                    React.createElement("label", { className: "image-range-field" },
                        React.createElement("span", null,
                            React.createElement("span", { className: "field-label-with-help" },
                                text.tolerance,
                                React.createElement("span", { className: "help-dot image-help-dot", ...imageHelpProps(text.toleranceHint) }, "?")),
                            React.createElement("strong", null, tolerance)),
                        React.createElement("input", { "aria-label": "Background tolerance", type: "range", min: 0, max: 120, step: 1, value: tolerance, onChange: (event) => setTolerance(Number(event.target.value)) }))),
                React.createElement("label", { className: "stacked-field image-style-field" },
                    React.createElement("span", null, text.generationStyle),
                    React.createElement("select", { "aria-label": "Generation style", value: generationStyle, onChange: (event) => setGenerationStyle(event.target.value) },
                        React.createElement("option", { value: "cartoon" }, text.generationStyleCartoon),
                        React.createElement("option", { value: "realistic" }, text.generationStyleRealistic))),
                React.createElement("label", { className: "stacked-field image-background-field" },
                    React.createElement("span", null, text.background),
                    React.createElement("select", { "aria-label": "Background handling", value: backgroundMode, onChange: (event) => setBackgroundMode(event.target.value) },
                        React.createElement("option", { value: "keep" }, text.keepBackground),
                        React.createElement("option", { value: "remove-white" }, text.removeWhite)))),
            React.createElement("section", { className: "left-card reference-card" },
                React.createElement("div", { className: "left-card-header" },
                    React.createElement("div", null,
                        React.createElement("strong", null, text.referenceImage)),
                    React.createElement("button", { className: "reference-change-button", type: "button", title: language === 'zh' ? '导入图片并重新生成图纸' : 'Import an image and regenerate the pattern', onClick: () => fileInputRef.current?.click() }, referenceImageUrl
                        ? language === 'zh' ? '更换' : 'Replace'
                        : language === 'zh' ? '上传' : 'Upload')),
                React.createElement("button", { className: referenceImageUrl ? 'upload-zone reference-upload-zone has-image' : 'upload-zone reference-upload-zone is-empty', type: "button", "aria-label": language === 'zh' ? '导入图片并重新生成图纸' : 'Import an image and regenerate the pattern', onClick: () => fileInputRef.current?.click() },
                    React.createElement("img", { className: referenceImageUrl ? '' : 'reference-empty-icon', src: referenceImageUrl ?? './assets/ip/person-head.png', alt: "" }),
                    React.createElement("span", { className: "upload-zone-text" },
                        React.createElement("strong", null, referenceFile ? referenceFile.name : language === 'zh' ? '原图未保存' : 'Source image not saved'),
                        React.createElement("span", null, referenceFile
                            ? 'PNG / JPG / WebP'
                            : language === 'zh' ? '已恢复拼豆草稿，请重新上传原图' : 'The bead draft was restored. Upload the source image again.'))),
                React.createElement("label", { className: "switch-row reference-switch" },
                    React.createElement("span", null, text.showReferenceImage),
                    React.createElement("input", { type: "checkbox", checked: referenceVisible, disabled: !referenceImageUrl, onChange: (event) => setReferenceVisible(event.target.checked) })),
                React.createElement("label", { className: "image-range-field reference-opacity-field" },
                    React.createElement("span", null,
                        React.createElement("span", null, text.referenceOpacity),
                        React.createElement("strong", null, referenceImageUrl ? `${Math.round((1 - referenceOpacity) * 100)}%` : '--')),
                    React.createElement("input", { "aria-label": "Reference opacity", type: "range", min: 0.1, max: 0.95, step: 0.05, value: 1 - referenceOpacity, disabled: !referenceImageUrl, onChange: (event) => setReferenceOpacity(1 - Number(event.target.value)) })),
                React.createElement("div", { className: "reference-adjust-row" },
                    React.createElement("label", { className: "switch-row reference-switch" },
                        React.createElement("span", null, text.referenceAdjust),
                        React.createElement("input", { type: "checkbox", checked: referenceAdjusting, disabled: !referenceImageUrl || !referenceVisible, onChange: (event) => setReferenceAdjusting(event.target.checked) })),
                    React.createElement("button", { type: "button", className: "reference-reset-button", disabled: !referenceImageUrl, onClick: resetReferenceTransform }, text.resetReferenceTransform)),
                React.createElement("div", { className: "reference-control-grid" },
                    React.createElement("label", { className: "stacked-field reference-placement-field" },
                        React.createElement("span", null, text.referencePlacement),
                        React.createElement("div", { className: "reference-placement-toggle", "aria-label": text.referencePlacement },
                            React.createElement("button", { type: "button", className: referencePlacement === 'below' ? 'active' : '', disabled: !referenceImageUrl, "aria-pressed": referencePlacement === 'below', onClick: () => setReferencePlacement('below') }, text.referenceBelow),
                            React.createElement("button", { type: "button", className: referencePlacement === 'above' ? 'active' : '', disabled: !referenceImageUrl, "aria-pressed": referencePlacement === 'above', onClick: () => setReferencePlacement('above') }, text.referenceAbove)))))),
        React.createElement("aside", { className: "tool-rail" },
            React.createElement("nav", { className: "mode-switcher", "aria-label": language === 'zh' ? '工作流程' : 'Workflow' },
                React.createElement("button", { className: rightTab === 'generator' ? 'active' : '', onClick: () => setRightTab('generator') },
                    React.createElement(DuplicateIcon, null),
                    React.createElement("span", null, "01"),
                    language === 'zh' ? '素材' : 'Source'),
                React.createElement("button", { className: rightTab === 'palette' || rightTab === 'layers' || rightTab === 'adjustments' ? 'active' : '', onClick: () => setRightTab('palette') },
                    React.createElement(PencilIcon, null),
                    React.createElement("span", null, "02"),
                    language === 'zh' ? '创作' : 'Create')),
            React.createElement("div", { className: "tool-rail-heading" }, language === 'zh' ? '创作工具' : 'Create tools'),
            tools.filter((item) => primaryToolIds.includes(item.id)).map((item) => (React.createElement("button", { key: item.id, className: tool === item.id ? 'tool-button active' : 'tool-button', "aria-label": text.tools[item.id].title, "aria-pressed": tool === item.id, type: "button", onPointerDown: (event) => {
                    if (event.pointerType === 'mouse')
                        return;
                    event.preventDefault();
                    activateTool(item.id);
                }, onClick: () => activateTool(item.id) },
                React.createElement(ToolIcon, { tool: item.id }),
                React.createElement("span", null, text.tools[item.id].title)))),
            React.createElement("button", { className: advancedToolIds.includes(tool) ? 'tool-button more-tools-button active' : 'tool-button more-tools-button', type: "button", "aria-label": language === 'zh' ? '更多工具' : 'More tools', "aria-expanded": showMoreTools, onClick: () => setShowMoreTools((current) => !current) },
                React.createElement(ToolIcon, { tool: "shape" }),
                React.createElement("span", null, language === 'zh' ? '更多' : 'More')),
            showMoreTools && (React.createElement("div", { className: "tool-options advanced-tools-options" },
                React.createElement("div", { className: "tool-options-header" },
                    React.createElement("strong", null, language === 'zh' ? '更多工具' : 'More tools'),
                    React.createElement("button", { className: "tool-options-close", type: "button", "aria-label": text.close, onClick: () => setShowMoreTools(false) },
                        React.createElement(CloseIcon, null))),
                React.createElement("div", { className: "advanced-tool-grid" }, tools.filter((item) => advancedToolIds.includes(item.id)).map((item) => (React.createElement("button", { key: item.id, type: "button", className: tool === item.id ? 'advanced-tool-button active' : 'advanced-tool-button', "aria-pressed": tool === item.id, onClick: () => activateTool(item.id) },
                    React.createElement(ToolIcon, { tool: item.id }),
                    React.createElement("span", null, text.tools[item.id].title))))))),
            React.createElement("button", { className: rightTab === 'layers' ? 'tool-button layer-nav-button active' : 'tool-button layer-nav-button', type: "button", "aria-label": text.layers, onClick: () => setRightTab('layers') },
                React.createElement(DuplicateIcon, null),
                React.createElement("span", null, text.layers)),
            React.createElement("button", { className: rightTab === 'usage' ? 'workflow-deliver-button active' : 'workflow-deliver-button', type: "button", onClick: () => setRightTab('usage') },
                React.createElement(ExportIcon, null),
                React.createElement("span", null, "03"),
                language === 'zh' ? '交付' : 'Deliver'),
            tool === 'pencil' && showPencilOptions && (React.createElement("div", { className: "tool-options pencil-options", onMouseLeave: () => setShowPencilOptions(false) },
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.rightClick },
                    React.createElement("span", { className: "field-label-with-help" },
                        text.rightClick,
                        React.createElement("span", { className: "help-dot mini", "data-tooltip": text.rightClickHint, "aria-label": text.rightClickHint, tabIndex: 0 }, "?")),
                    React.createElement("div", null, ['pan', 'erase'].map((action) => (React.createElement("button", { key: action, className: project.settings.rightClickAction === action ? 'active' : '', type: "button", "aria-pressed": project.settings.rightClickAction === action, onClick: () => updateProject({
                            ...project,
                            settings: { ...project.settings, rightClickAction: action },
                        }) }, action === 'pan' ? text.pan : text.erase))))))),
            tool === 'eraser' && showEraserOptions && (React.createElement("div", { className: "tool-options eraser-options", onMouseLeave: () => setShowEraserOptions(false) },
                React.createElement("div", { className: "tool-options-header" },
                    React.createElement("span", null, text.eraserSize),
                    React.createElement("strong", null, text.brushCells(eraserSize))),
                React.createElement("div", { className: "brush-preview", "aria-hidden": "true" }, eraserSize > 0 ? (React.createElement("span", { style: { width: `${10 + eraserSize * 3}px`, height: `${10 + eraserSize * 3}px` } })) : (React.createElement("span", { className: "brush-preview-dot" }))),
                React.createElement("input", { "aria-label": text.eraserSize, type: "range", min: 0, max: 9, step: 0.5, value: eraserSize, onChange: (event) => setEraserSize(Number(event.target.value)) }))),
            tool === 'remove' && showRemoveOptions && (React.createElement("div", { className: "tool-options remove-options", onMouseLeave: () => setShowRemoveOptions(false) },
                React.createElement("div", { className: "right-click-toggle compact remove-scope-toggle", "aria-label": text.removeScope },
                    React.createElement("span", null, text.removeScope),
                    React.createElement("div", null, ['same-connected', 'all-same-color', 'connected'].map((mode) => (React.createElement("button", { key: mode, className: removeMode === mode ? 'active' : '', type: "button", "aria-pressed": removeMode === mode, onClick: () => setRemoveMode(mode) }, mode === 'same-connected'
                        ? text.removeSameConnected
                        : mode === 'all-same-color'
                            ? text.removeAllSameColor
                            : text.removeConnected))))))),
            tool === 'move' && showMoveOptions && (React.createElement("div", { className: "tool-options move-options", onMouseLeave: () => setShowMoveOptions(false) },
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.moveScope },
                    React.createElement("span", null, text.moveScope),
                    React.createElement("div", null, ['layer', 'partial'].map((mode) => (React.createElement("button", { key: mode, className: moveMode === mode ? 'active' : '', type: "button", "aria-pressed": moveMode === mode, onClick: () => setMoveMode(mode) }, mode === 'layer' ? text.moveLayer : text.movePartial))))))),
            (tool === 'copy' || tool === 'paste') && showClipboardOptions && (React.createElement("div", { className: `tool-options clipboard-options ${tool === 'copy' ? 'copy-options' : 'paste-options'}`, onMouseLeave: () => setShowClipboardOptions(false) },
                tool === 'copy' && (React.createElement("div", { className: "right-click-toggle compact clipboard-mode-toggle", "aria-label": text.copyScope },
                    React.createElement("span", null, text.copyScope),
                    React.createElement("div", null, ['connected', 'selection'].map((mode) => (React.createElement("button", { key: mode, className: copyMode === mode ? 'active' : '', type: "button", "aria-pressed": copyMode === mode, onClick: () => {
                            setCopyMode(mode);
                            setCopySelectionIndices([]);
                        } }, mode === 'connected' ? text.copyConnected : text.copySelection)))),
                    copyMode === 'selection' && React.createElement("p", { className: "tool-hint compact-hint" }, text.copySelectionHint))),
                React.createElement("div", { className: "clipboard-tool-header" },
                    React.createElement("div", null,
                        React.createElement("strong", null, text.clipboardPreview),
                        clipboardPattern && (React.createElement("span", null, text.clipboardSize(clipboardPattern.width, clipboardPattern.height, clipboardPattern.cells.filter(Boolean).length)))),
                    React.createElement("button", { className: "clipboard-reset-button", type: "button", "aria-label": text.resetClipboard, title: text.resetClipboard, disabled: !clipboardPattern && copySelectionIndices.length === 0, onClick: resetClipboard },
                        React.createElement(ResetIcon, null))),
                clipboardPattern ? (React.createElement(ClipboardPreview, { pattern: clipboardPattern })) : (React.createElement("div", { className: "clipboard-empty" }, text.clipboardEmpty)))),
            tool === 'mirror' && showMirrorOptions && (React.createElement("div", { className: "tool-options mirror-options", onMouseLeave: () => setShowMirrorOptions(false) },
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.moveScope },
                    React.createElement("span", null, text.moveScope),
                    React.createElement("div", null, ['layer', 'partial'].map((mode) => (React.createElement("button", { key: mode, className: mirrorMode === mode ? 'active' : '', type: "button", "aria-pressed": mirrorMode === mode, onClick: () => setMirrorMode(mode) }, mode === 'layer' ? text.moveLayer : text.movePartial))))),
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.mirrorDirection },
                    React.createElement("span", null, text.mirrorDirection),
                    React.createElement("div", null, ['horizontal', 'vertical'].map((direction) => (React.createElement("button", { key: direction, className: mirrorDirection === direction ? 'active' : '', type: "button", "aria-pressed": mirrorDirection === direction, onClick: () => setMirrorDirection(direction) }, direction === 'horizontal' ? text.mirrorHorizontal : text.mirrorVertical))))))),
            tool === 'shape' && showShapeOptions && (React.createElement("div", { className: "tool-options shape-options", onMouseLeave: () => setShowShapeOptions(false) },
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.shapeStyle },
                    React.createElement("span", null, text.shapeStyle),
                    React.createElement("div", null, ['outline', 'filled'].map((mode) => (React.createElement("button", { key: mode, className: shapeFillMode === mode ? 'active' : '', type: "button", "aria-pressed": shapeFillMode === mode, disabled: shapeKind === 'line' || shapeKind === 'arrow', onClick: () => setShapeFillMode(mode) }, mode === 'outline' ? text.shapeOutline : text.shapeFilled))))),
                React.createElement("div", { className: "shape-picker", "aria-label": text.shapeType },
                    React.createElement("span", null, text.shapeType),
                    React.createElement("div", null, ['line', 'rectangle', 'square', 'ellipse', 'circle', 'triangle', 'arrow'].map((kind) => (React.createElement("button", { key: kind, className: shapeKind === kind ? 'active' : '', type: "button", "aria-pressed": shapeKind === kind, onClick: () => setShapeKind(kind) },
                        React.createElement(ShapeOptionIcon, { shape: kind }),
                        React.createElement("span", null, shapeLabel[kind])))))),
                shapeKind === 'arrow' && (React.createElement("div", { className: "shape-picker arrow-picker", "aria-label": text.arrowStyle },
                    React.createElement("span", null, text.arrowStyle),
                    React.createElement("div", null, ['single', 'double', 'block'].map((kind) => (React.createElement("button", { key: kind, className: arrowKind === kind ? 'active' : '', type: "button", "aria-pressed": arrowKind === kind, onClick: () => setArrowKind(kind) },
                        React.createElement(ArrowOptionIcon, { arrow: kind }),
                        React.createElement("span", null, arrowLabel[kind]))))))))),
            tool === 'text' && showTextOptions && (React.createElement("div", { className: "tool-options text-options" },
                React.createElement("label", { className: "text-tool-field" },
                    React.createElement("span", { className: "text-field-title" },
                        text.textContent,
                        React.createElement("button", { className: "tool-options-close", type: "button", "aria-label": text.close, title: text.close, onClick: () => setShowTextOptions(false) },
                            React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
                                React.createElement("path", { d: "M7 7l10 10" }),
                                React.createElement("path", { d: "M17 7L7 17" })))),
                    React.createElement("input", { type: "text", maxLength: 32, value: textToolValue, placeholder: text.textPlaceholder, onChange: (event) => setTextToolValue(event.target.value) })),
                React.createElement("div", { className: "right-click-toggle compact", "aria-label": text.textDirection },
                    React.createElement("span", null, text.textDirection),
                    React.createElement("div", null, ['horizontal', 'vertical'].map((direction) => (React.createElement("button", { key: direction, className: textToolDirection === direction ? 'active' : '', type: "button", "aria-pressed": textToolDirection === direction, onClick: () => setTextToolDirection(direction) }, direction === 'horizontal' ? text.textHorizontal : text.textVertical))))),
                React.createElement("div", { className: "tool-options-header" },
                    React.createElement("span", null, text.textSize),
                    React.createElement("label", { className: "tool-number-field", "aria-label": text.textSize },
                        React.createElement("input", { type: "number", min: 5, max: 72, step: 1, value: textToolSize, onChange: (event) => setTextToolSize(Math.min(72, Math.max(5, Number(event.target.value) || 5))) }),
                        React.createElement("span", null, language === 'zh' ? '格' : 'cells'))),
                React.createElement("input", { "aria-label": text.textSize, type: "range", min: 5, max: 72, step: 1, value: textToolSize, onChange: (event) => setTextToolSize(Number(event.target.value)) }),
                React.createElement("div", { className: "tool-options-header" },
                    React.createElement("span", null, text.textSpacing),
                    React.createElement("label", { className: "tool-number-field", "aria-label": text.textSpacing },
                        React.createElement("input", { type: "number", min: 0, max: 24, step: 1, value: textToolSpacing, onChange: (event) => setTextToolSpacing(Math.min(24, Math.max(0, Number(event.target.value) || 0))) }),
                        React.createElement("span", null, language === 'zh' ? '格' : 'cells'))),
                React.createElement("input", { "aria-label": text.textSpacing, type: "range", min: 0, max: 24, step: 1, value: textToolSpacing, onChange: (event) => setTextToolSpacing(Number(event.target.value)) }))),
            tool === 'pan' && showPanOptions && (React.createElement("div", { className: "tool-options pan-options", onMouseLeave: () => setShowPanOptions(false) },
                React.createElement("div", { className: "tool-options-header" },
                    React.createElement("strong", null, text.tools.pan.title)),
                React.createElement("p", { className: "tool-hint" }, text.panToolHint))),
            React.createElement("section", { className: "love-companion", "aria-label": language === 'zh' ? '小花陪伴' : 'Little Flower companion' },
                React.createElement("img", { src: "./assets/ip/person-1.png", alt: "" }),
                React.createElement("div", null,
                    React.createElement("strong", null, language === 'zh' ? '小红花陪你一起创作' : 'Little Flower creates with you'),
                    React.createElement("span", null, language === 'zh' ? '让爱被更多孩子看见。' : 'Let more children see the love.')))),
        React.createElement(WorkspaceCanvas, { project: displayProject, selectedColorId: selectedColorId, highlightedColorId: highlightedColorId, highlightedCellIndices: isolatedCellIndices, formatColorCode: displayCodeById, tool: tool, eraserSize: eraserSize, moveMode: moveMode, removeMode: removeMode, mirrorMode: mirrorMode, mirrorDirection: mirrorDirection, shapeKind: shapeKind, shapeFillMode: shapeFillMode, arrowKind: arrowKind, textToolValue: textToolValue, textToolDirection: textToolDirection, textToolSize: textToolSize, textToolSpacing: textToolSpacing, onTextToolSizeChange: setTextToolSize, referenceImageUrl: referenceImageUrl, referenceImageVisible: referenceVisible && !isGenerating, referenceImageOpacity: referenceOpacity, referenceImageScale: referenceScale, referenceImageOffset: referenceOffset, referenceImageAdjusting: referenceAdjusting && referenceVisible && !isGenerating, referenceImagePlacement: referencePlacement, referenceAdjustHint: text.referenceAdjustHint, onReferenceOffsetChange: setReferenceOffset, onReferenceScaleChange: setReferenceScale, onCommitStart: () => {
                setShowPencilOptions(false);
                setShowEraserOptions(false);
                setShowRemoveOptions(false);
                setShowMoveOptions(false);
                setShowMirrorOptions(false);
                setShowShapeOptions(false);
                setShowTextOptions(tool === 'text');
                setShowClipboardOptions(false);
                setShowPanOptions(false);
                commitHistory();
            }, onCellsChange: updateCells, onReplaceColor: replaceColor, clipboardPattern: clipboardPattern, copyMode: copyMode, copySelectionIndices: copySelectionIndices, onCopyPattern: (pattern, switchToPaste = true) => {
                const beads = pattern.cells.filter(Boolean).length;
                setClipboardPattern(pattern);
                if (switchToPaste)
                    setTool('paste');
                setShowPencilOptions(false);
                setShowEraserOptions(false);
                setShowRemoveOptions(false);
                setShowMoveOptions(false);
                setShowMirrorOptions(false);
                setShowShapeOptions(false);
                setShowTextOptions(false);
                setShowClipboardOptions(false);
                setShowPanOptions(false);
                setNotice(text.copiedPattern(pattern.width, pattern.height, beads));
            }, onCopySelectionChange: (indices, pattern) => {
                setCopySelectionIndices(indices);
                setClipboardPattern(pattern);
                setNotice(pattern ? text.copySelectionUpdated(pattern.cells.filter(Boolean).length) : text.clipboardReset);
            }, onPastePattern: () => setNotice(text.pastedPattern), onPickColor: (colorId) => {
                selectColor(colorId);
                setTool('pencil');
                setShowPencilOptions(false);
                setShowEraserOptions(false);
                setShowRemoveOptions(false);
                setShowMoveOptions(false);
                setShowMirrorOptions(false);
                setShowShapeOptions(false);
                setShowTextOptions(false);
                setShowClipboardOptions(false);
                setShowPanOptions(false);
                setNotice(language === 'zh' ? '已从画布拾取颜色。' : 'Color picked from canvas.');
            }, onHover: setHoverCell, fitLabel: text.fit, canEdit: !activeLayer.locked, lockedHint: text.lockedCanvasHint }),
        React.createElement("div", { className: "workspace-bottom-controls", "aria-label": language === 'zh' ? '画布显示设置' : 'Canvas display settings' },
            React.createElement("span", null, language === 'zh' ? '显示' : 'Display'),
            React.createElement("label", null,
                React.createElement("input", { type: "checkbox", checked: project.settings.showGrid, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showGrid: event.target.checked } }) }),
                text.grid),
            React.createElement("label", null,
                React.createElement("input", { type: "checkbox", checked: project.settings.showCoordinates, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showCoordinates: event.target.checked } }) }),
                text.coordinates),
            React.createElement("label", null,
                React.createElement("input", { type: "checkbox", checked: referenceVisible, disabled: !referenceImageUrl, onChange: (event) => setReferenceVisible(event.target.checked) }),
                text.referenceImage)),
        React.createElement("aside", { className: "right-panel" },
            React.createElement("div", { className: "right-tabs", role: "tablist", "aria-label": "Right panel" },
                React.createElement("button", { className: rightTab === 'generator' ? 'active' : '', role: "tab", "aria-selected": rightTab === 'generator', onClick: () => setRightTab('generator') }, language === 'zh' ? '生成' : 'Generate'),
                React.createElement("button", { className: rightTab === 'palette' ? 'active' : '', role: "tab", "aria-selected": rightTab === 'palette', onClick: () => setRightTab('palette') }, text.palette),
                React.createElement("button", { className: rightTab === 'layers' ? 'active' : '', role: "tab", "aria-selected": rightTab === 'layers', onClick: () => setRightTab('layers') }, text.layers),
                React.createElement("button", { className: rightTab === 'usage' ? 'active' : '', role: "tab", "aria-selected": rightTab === 'usage', onClick: () => setRightTab('usage') }, text.usage),
                React.createElement("button", { className: rightTab === 'adjustments' ? 'active' : '', role: "tab", "aria-selected": rightTab === 'adjustments', onClick: () => setRightTab('adjustments') }, text.adjustments)),
            React.createElement("section", { className: "panel-section status-section" },
                React.createElement("div", null,
                    React.createElement("strong", null, notice),
                    React.createElement("span", null, text.panelStatus(project.width, project.height, usage.length, totalBeads, boardCount))),
                React.createElement("span", { className: "status-pill" }, text.tools[tool].title)),
            rightTab === 'generator' && (React.createElement("section", { className: "panel-section panel-tab-body generator-section" },
                React.createElement("div", { className: "generator-heading" },
                    React.createElement("div", null,
                        React.createElement("span", null, language === 'zh' ? '公益项目素材' : 'Public-good project image'),
                        React.createElement("h2", null, language === 'zh' ? '从一张图片开始' : 'Start with an image')),
                    React.createElement("span", { className: "local-processing-badge" }, language === 'zh' ? '本地处理' : 'Local')),
                React.createElement("button", { className: pendingImageUrl ? `generator-upload has-image${isGenerating ? ' is-generating' : ''}` : `generator-upload${isGenerating ? ' is-generating' : ''}`, onClick: () => fileInputRef.current?.click() },
                    pendingImageUrl ? React.createElement("img", { src: pendingImageUrl, alt: "" }) : React.createElement("img", { className: "generator-upload-ip", src: "./assets/ip/person-head.png", alt: "" }),
                    React.createElement("span", null,
                        React.createElement("strong", null, isGenerating ? text.preparingPattern : pendingFile ? pendingFile.name : text.uploadImage),
                        React.createElement("small", null, language === 'zh' ? 'PNG、JPG、WebP · 图片不会离开浏览器' : 'PNG, JPG, WebP · your image stays in the browser'))),
                React.createElement("button", { className: "example-button", type: "button", onClick: () => void loadLoveFlowerExample() },
                    React.createElement("img", { src: "./assets/ip/flower-flat.png", alt: "" }),
                    React.createElement("span", null,
                        React.createElement("strong", null, language === 'zh' ? '使用小红花公益示例' : 'Use the Little Flower example'),
                        React.createElement("small", null, language === 'zh' ? '一键体验完整生成流程' : 'Try the full generation flow'))),
                React.createElement("div", { className: "generator-fields" },
                    React.createElement("label", { className: "generator-field" },
                        React.createElement("span", null, language === 'zh' ? '图纸尺寸' : 'Pattern size'),
                        React.createElement("div", { className: "generator-size-input" },
                            React.createElement("input", { "aria-label": "Output width", type: "number", min: 8, max: 180, value: convertWidth, onChange: (event) => setConvertWidth(Number(event.target.value)) }),
                            React.createElement("span", null,
                                "\u00D7 ",
                                convertWidth))),
                    React.createElement("label", { className: "generator-field" },
                        React.createElement("span", null, text.generationStyle),
                        React.createElement("select", { "aria-label": "Generation style", value: generationStyle, onChange: (event) => setGenerationStyle(event.target.value) },
                            React.createElement("option", { value: "cartoon" }, text.generationStyleCartoon),
                            React.createElement("option", { value: "realistic" }, text.generationStyleRealistic))),
                    React.createElement("label", { className: "generator-field" },
                        React.createElement("span", null, text.colors),
                        React.createElement("select", { "aria-label": "Color limit", value: maxColors, onChange: (event) => setMaxColors(Number(event.target.value)) }, [12, 18, 24, 32, 48].map((value) => React.createElement("option", { key: value, value: value },
                            value,
                            " ",
                            language === 'zh' ? '色' : 'colors')))),
                    React.createElement("label", { className: "generator-field" },
                        React.createElement("span", null, text.background),
                        React.createElement("select", { "aria-label": "Background handling", value: backgroundMode, onChange: (event) => setBackgroundMode(event.target.value) },
                            React.createElement("option", { value: "keep" }, text.keepBackground),
                            React.createElement("option", { value: "remove-white" }, text.removeWhite)))),
                React.createElement("label", { className: "generator-slider" },
                    React.createElement("span", null,
                        React.createElement("span", null, text.tolerance),
                        React.createElement("strong", null, tolerance)),
                    React.createElement("input", { "aria-label": "Background tolerance", type: "range", min: 0, max: 120, step: 1, value: tolerance, onChange: (event) => setTolerance(Number(event.target.value)) })),
                React.createElement("button", { className: "regenerate-button", type: "button", disabled: isGenerating, onClick: () => pendingFile ? void generateFromImage({ recordHistory: true }) : fileInputRef.current?.click() }, isGenerating
                    ? (language === 'zh' ? '正在生成图纸…' : 'Generating…')
                    : pendingFile
                        ? (language === 'zh' ? '重新生成' : 'Regenerate')
                        : (language === 'zh' ? '导入图片生成' : 'Import and generate')),
                React.createElement("p", { className: "generator-note" }, language === 'zh' ? '生成后可在画布上进行精细调整' : 'Fine-tune the result directly on the canvas.'),
                React.createElement("section", { className: "compact-palette-block", "aria-label": text.palette },
                    React.createElement("div", { className: "compact-section-heading" },
                        React.createElement("h3", null,
                            text.palette,
                            "\uFF08",
                            maxColors,
                            " ",
                            language === 'zh' ? '色' : 'colors',
                            "\uFF09"),
                        React.createElement("button", { type: "button", onClick: () => setRightTab('palette') }, language === 'zh' ? '编辑' : 'Edit')),
                    React.createElement("div", { className: "compact-palette-grid" }, compactPalette.map((color) => (React.createElement("button", { key: color.id, type: "button", className: selectedColorId === color.id ? 'active' : '', title: `${displayCode(color)} ${displayName(color)}`, "aria-label": `${displayCode(color)} ${displayName(color)}`, style: { backgroundColor: color.hex }, onClick: () => selectColor(color.id) }))))),
                React.createElement("section", { className: "compact-usage-block", "aria-label": text.usage },
                    React.createElement("div", { className: "compact-section-heading compact-usage-heading" },
                        React.createElement("h3", null, language === 'zh' ? '用量统计' : 'Usage'),
                        React.createElement("span", null,
                            language === 'zh' ? '预计拼豆总数' : 'Estimated total',
                            " ",
                            React.createElement("strong", null, totalBeads),
                            " ",
                            language === 'zh' ? '颗' : 'beads')),
                    React.createElement("div", { className: "compact-usage-list" },
                        usage.map((row) => (React.createElement("button", { key: row.color.id, type: "button", onMouseEnter: () => setHighlightedColorId(row.color.id), onMouseLeave: () => setHighlightedColorId(null), onFocus: () => setHighlightedColorId(row.color.id), onBlur: () => setHighlightedColorId(null) },
                            React.createElement("span", { className: "compact-usage-chip", style: { backgroundColor: row.color.hex } }),
                            React.createElement("span", { className: "compact-usage-name" },
                                displayCode(row.color),
                                " ",
                                displayName(row.color)),
                            React.createElement("strong", null, row.count)))),
                        usage.length === 0 && React.createElement("div", { className: "usage-empty" }, text.noUsage)),
                    React.createElement("button", { className: "usage-detail-button", type: "button", onClick: () => setRightTab('usage') }, language === 'zh' ? '查看用量明细' : 'View usage details')))),
            rightTab === 'palette' && (React.createElement("section", { className: "panel-section panel-tab-body palette-section" },
                React.createElement("h2", null, text.palette),
                React.createElement("div", { className: "palette-selected-card" },
                    React.createElement("span", { style: { backgroundColor: selectedColor?.hex } }),
                    React.createElement("div", { className: "palette-selected-main" },
                        React.createElement("strong", null, selectedColor ? displayCode(selectedColor) : ''),
                        React.createElement("small", null, selectedColor ? displayName(selectedColor) : '')),
                    React.createElement("div", { className: "palette-selected-hex" },
                        React.createElement("small", null, selectedColor?.hex))),
                React.createElement("div", { className: "recent-colors-field" },
                    React.createElement("span", null, text.recentColors),
                    React.createElement("div", { className: "recent-color-row" }, recentColors.map((color) => (React.createElement("button", { key: color.id, type: "button", className: selectedColorId === color.id ? 'active' : '', title: `${displayCode(color)} ${displayName(color)}`, "aria-label": `${text.recentColors} ${displayCode(color)}`, onClick: () => selectColor(color.id, { updateRecent: false }) },
                        React.createElement("span", { style: { backgroundColor: color.hex } }),
                        React.createElement("small", null, displayCode(color))))))),
                React.createElement("div", { className: "readonly-brand-field" },
                    text.brandCodes,
                    React.createElement("select", { value: paletteMode, onChange: (event) => setPaletteMode(event.target.value) },
                        React.createElement("option", { value: "basic" }, text.mardBasic),
                        React.createElement("option", { value: "complete" }, text.mardComplete))),
                React.createElement("div", { className: "palette-filter", "aria-label": "Palette groups" }, paletteGroups.map((group) => (React.createElement("button", { key: group.id, className: paletteGroup === group.id ? 'active' : '', onClick: () => setPaletteGroup(group.id) }, group.label)))),
                React.createElement("div", { className: "palette-grid" }, visiblePalette.map((color) => (React.createElement("button", { key: color.id, className: selectedColorId === color.id ? 'swatch active' : 'swatch', title: `${displayCode(color)} ${displayName(color)}`, onClick: () => {
                        selectColor(color.id);
                    } },
                    React.createElement("span", { style: { backgroundColor: color.hex } }),
                    React.createElement("small", null, displayCode(color)))))))),
            rightTab === 'layers' && (React.createElement("section", { className: "panel-section panel-tab-body layers-section" },
                React.createElement("div", { className: "layers-header" },
                    React.createElement("h2", null, text.layers),
                    React.createElement("button", { onClick: addLayer }, text.addLayer)),
                React.createElement("button", { className: project.settings.showActiveLayerOnly ? 'layer-solo-toggle active' : 'layer-solo-toggle', type: "button", "aria-pressed": project.settings.showActiveLayerOnly, onClick: toggleActiveLayerOnly },
                    React.createElement(EyeIcon, { visible: project.settings.showActiveLayerOnly }),
                    React.createElement("span", null, text.showActiveLayerOnly)),
                React.createElement("div", { className: "layer-list", onDragLeave: (event) => {
                        if (!event.currentTarget.contains(event.relatedTarget))
                            setDragTarget(null);
                    } }, [...layers].reverse().map((layer) => {
                    const layerIndex = layers.findIndex((item) => item.id === layer.id);
                    const isActive = layer.id === activeLayer.id;
                    const beadCount = layer.cells.filter(Boolean).length;
                    const displayName = layerDisplayName(layer, layerIndex);
                    const rowClassName = [
                        'layer-row',
                        isActive ? 'active' : '',
                        draggingLayerId === layer.id ? 'dragging' : '',
                        dragTarget?.id === layer.id && draggingLayerId !== layer.id ? `drag-over-${dragTarget.edge}` : '',
                    ].filter(Boolean).join(' ');
                    return (React.createElement("div", { key: layer.id, className: rowClassName, onDragOver: (event) => {
                            if (!draggingLayerId || draggingLayerId === layer.id)
                                return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            const nextTarget = dragTargetFromEvent(event, layer.id);
                            setDragTarget((current) => current?.id === nextTarget.id && current.edge === nextTarget.edge ? current : nextTarget);
                        }, onDrop: (event) => {
                            event.preventDefault();
                            const sourceId = event.dataTransfer.getData('text/plain') || draggingLayerId;
                            const nextTarget = dragTargetFromEvent(event, layer.id);
                            setDraggingLayerId(null);
                            setDragTarget(null);
                            if (sourceId)
                                moveLayer(sourceId, nextTarget);
                        } },
                        React.createElement("button", { className: "layer-drag-handle", draggable: true, title: text.reorderLayer, "aria-label": text.reorderLayer, onDragStart: (event) => {
                                event.dataTransfer.effectAllowed = 'move';
                                event.dataTransfer.setData('text/plain', layer.id);
                                const dragImage = document.createElement('canvas');
                                dragImage.width = 1;
                                dragImage.height = 1;
                                event.dataTransfer.setDragImage(dragImage, 0, 0);
                                setDraggingLayerId(layer.id);
                            }, onDragEnd: () => {
                                setDraggingLayerId(null);
                                setDragTarget(null);
                            } },
                            React.createElement(DragHandleIcon, null)),
                        React.createElement("button", { className: layer.visible ? 'mini-icon-toggle visibility-toggle active' : 'mini-icon-toggle visibility-toggle', title: layer.visible ? text.eye : text.hiddenLayer, "aria-label": layer.visible ? text.eye : text.hiddenLayer, onClick: (event) => {
                                event.stopPropagation();
                                updateLayer(layer.id, { visible: !layer.visible });
                            } },
                            React.createElement(EyeIcon, { visible: layer.visible })),
                        editingLayerId === layer.id ? (React.createElement("form", { className: "layer-main layer-name-editor", onSubmit: (event) => {
                                event.preventDefault();
                                saveEditingLayer(layer, layerIndex);
                            } },
                            React.createElement("input", { value: editingLayerName, "aria-label": text.renameLayer, autoFocus: true, onChange: (event) => setEditingLayerName(event.target.value), onBlur: () => saveEditingLayer(layer, layerIndex), onFocus: (event) => event.currentTarget.select(), onKeyDown: (event) => {
                                    if (event.key === 'Escape') {
                                        event.preventDefault();
                                        setEditingLayerId(null);
                                    }
                                } }),
                            React.createElement("span", { className: "layer-meta" }, layerMetaText(isActive, layer.visible, layer.locked, beadCount)),
                            React.createElement("label", { className: "checkline layer-count" },
                                React.createElement("input", { type: "checkbox", checked: layer.includeInUsage, onChange: (event) => updateLayer(layer.id, { includeInUsage: event.target.checked }) }),
                                text.countLayer))) : (React.createElement("div", { className: "layer-main layer-main-static", onClick: () => selectLayer(layer.id) },
                            React.createElement("div", { className: "layer-title-row" },
                                React.createElement("strong", null,
                                    React.createElement("span", null, displayName),
                                    React.createElement("button", { className: "layer-rename-button", type: "button", title: text.renameLayer, "aria-label": text.renameLayer, onClick: (event) => {
                                            event.stopPropagation();
                                            startEditingLayer(layer, layerIndex);
                                        } },
                                        React.createElement(PencilIcon, null)))),
                            React.createElement("span", { className: "layer-meta" }, layerMetaText(isActive, layer.visible, layer.locked, beadCount)),
                            React.createElement("label", { className: "checkline layer-count" },
                                React.createElement("input", { type: "checkbox", checked: layer.includeInUsage, onChange: (event) => updateLayer(layer.id, { includeInUsage: event.target.checked }) }),
                                text.countLayer))),
                        React.createElement("div", { className: "layer-actions" },
                            React.createElement("button", { className: layer.locked ? 'mini-icon-toggle active' : 'mini-icon-toggle', "aria-label": layer.locked ? text.unlock : text.lock, title: layer.locked ? text.unlockHint : text.lockHint, onClick: () => updateLayer(layer.id, { locked: !layer.locked }) },
                                React.createElement(LockIcon, { locked: layer.locked })),
                            React.createElement("button", { className: "mini-icon-toggle", "aria-label": text.duplicateLayer, title: text.duplicateLayer, onClick: () => duplicateLayer(layer.id) },
                                React.createElement(DuplicateIcon, null)),
                            React.createElement("button", { className: "mini-icon-toggle danger", disabled: layers.length <= 1, "aria-label": text.deleteLayer, title: text.deleteLayer, onClick: () => deleteLayer(layer.id) },
                                React.createElement(TrashIcon, null)))));
                })))),
            rightTab === 'usage' && (React.createElement("section", { className: "panel-section panel-tab-body usage-section" },
                React.createElement("h2", null, text.usage),
                React.createElement("div", { className: "usage-overview" },
                    React.createElement("div", null,
                        React.createElement("span", null, text.totalBeadsLabel),
                        React.createElement("strong", null, totalBeads)),
                    React.createElement("div", null,
                        React.createElement("span", null, text.colorTypes),
                        React.createElement("strong", null, usage.length)),
                    React.createElement("div", null,
                        React.createElement("span", null, text.estimatedPacks),
                        React.createElement("strong", null, totalPacks))),
                React.createElement("label", { className: "usage-pack-setting" },
                    React.createElement("span", null, text.beadsPerPack),
                    React.createElement("div", { className: "usage-pack-control" },
                        React.createElement("div", { className: "usage-pack-stepper" },
                            React.createElement("button", { type: "button", onClick: () => stepBeadsPerPack(-1) }, "-"),
                            React.createElement("input", { type: "number", min: 1, max: 10000, step: 500, value: project.settings.beadsPerPack, onChange: (event) => setBeadsPerPack(Number(event.target.value)) }),
                            React.createElement("button", { type: "button", onClick: () => stepBeadsPerPack(1) }, "+")),
                        React.createElement("small", null, text.perPackUnit))),
                React.createElement("div", { className: "usage-summary-card" },
                    React.createElement("div", { className: "usage-summary-head" },
                        React.createElement("strong", null, text.countedLayerTitle),
                        React.createElement("span", null, text.countedLayers(countedLayers.length))),
                    React.createElement("div", { className: "usage-layer-actions" },
                        React.createElement("button", { type: "button", className: countedLayers.length === layers.length ? 'active' : '', onClick: () => updateUsageLayerSelection(new Set(layers.map((layer) => layer.id))) }, text.countAllLayers),
                        React.createElement("button", { type: "button", className: countedLayers.length === 1 && countedLayers[0]?.id === activeLayer.id ? 'active' : '', onClick: () => updateUsageLayerSelection(new Set([activeLayer.id])) }, text.countCurrentLayer)),
                    React.createElement("div", { className: "usage-layer-chips" }, layers.map((layer) => {
                        const isIncluded = layer.includeInUsage;
                        return (React.createElement("button", { key: layer.id, type: "button", className: isIncluded ? 'active' : '', "aria-pressed": isIncluded, onClick: () => toggleUsageLayer(layer.id) }, layerDisplayName(layer, layers.findIndex((item) => item.id === layer.id))));
                    })),
                    countedLayers.length === 0 && React.createElement("div", { className: "usage-no-layers" }, text.noCountedLayers),
                    (usage.length > 32 || isolatedBeads > 0) && (React.createElement("div", { className: "usage-notes" },
                        usage.length > 32 && React.createElement("span", null, text.manyColors),
                        isolatedBeads > 0 && (React.createElement("span", { className: "usage-note-line" },
                            React.createElement("span", null, text.isolatedBeads(isolatedBeads)),
                            React.createElement("button", { className: showIsolatedBeads ? 'usage-note-eye active' : 'usage-note-eye', type: "button", title: showIsolatedBeads ? text.hideIsolatedBeads : text.showIsolatedBeads, "aria-label": showIsolatedBeads ? text.hideIsolatedBeads : text.showIsolatedBeads, "aria-pressed": showIsolatedBeads, onClick: () => setShowIsolatedBeads((current) => !current) },
                                React.createElement(EyeIcon, { visible: showIsolatedBeads }))))))),
                React.createElement("div", { className: "usage-list" },
                    usage.map((row) => (React.createElement("button", { key: row.color.id, onMouseEnter: () => setHighlightedColorId(row.color.id), onMouseLeave: () => setHighlightedColorId(null) },
                        React.createElement("span", { className: "usage-chip", style: { backgroundColor: row.color.hex } }),
                        React.createElement("span", { className: "usage-color-info" },
                            React.createElement("strong", null, displayCode(row.color)),
                            React.createElement("small", null, displayName(row.color))),
                        React.createElement("span", { className: "usage-count" },
                            React.createElement("strong", null, row.count),
                            React.createElement("small", null,
                                row.packs,
                                " ",
                                text.packUnit))))),
                    usage.length === 0 && React.createElement("div", { className: "usage-empty" }, text.noUsage)))),
            rightTab === 'adjustments' && (React.createElement("section", { className: "panel-section panel-tab-body adjustment-section" },
                React.createElement("div", { className: "adjustment-header" },
                    React.createElement("h2", null, text.adjustmentTitle),
                    React.createElement("span", null, layerDisplayName(activeLayer, layers.findIndex((item) => item.id === activeLayer.id)))),
                React.createElement("div", { className: "adjustment-help" }, text.adjustmentHint),
                [
                    ['brightness', text.brightness, -50, 50, '%'],
                    ['contrast', text.contrast, -50, 50, '%'],
                    ['saturation', text.saturation, -50, 50, '%'],
                    ['temperature', text.temperature, -50, 50, '%'],
                    ['hue', text.hue, -180, 180, 'deg'],
                ].map(([key, label, min, max, unit]) => (React.createElement("label", { className: "adjustment-range", key: key },
                    React.createElement("span", null,
                        React.createElement("span", null, label),
                        React.createElement("strong", null,
                            adjustments[key],
                            unit)),
                    React.createElement("input", { type: "range", min: min, max: max, step: key === 'hue' ? 5 : 1, value: adjustments[key], onChange: (event) => updateAdjustment(key, Number(event.target.value)) })))),
                React.createElement("div", { className: "adjustment-actions" },
                    React.createElement("button", { type: "button", onClick: resetAdjustments, disabled: !hasAdjustments(adjustments) }, text.resetAdjustments)),
                React.createElement("div", { className: "adjustment-effect-card" },
                    React.createElement("strong", null, text.effects),
                    React.createElement("div", { className: "adjustment-effect-grid" },
                        React.createElement("button", { type: "button", onClick: () => applyLayerEffect('invert', text.invertEffect), disabled: activeLayer.locked }, text.invertEffect),
                        React.createElement("button", { type: "button", onClick: () => applyLayerEffect('grayscale', text.grayscaleEffect), disabled: activeLayer.locked }, text.grayscaleEffect),
                        React.createElement("button", { type: "button", onClick: () => applyLayerEffect('blackWhite', text.blackWhiteEffect), disabled: activeLayer.locked }, text.blackWhiteEffect))),
                React.createElement("div", { className: "adjustment-tool-card" },
                    React.createElement("div", { className: "adjustment-tool-heading" },
                        React.createElement("strong", null, text.colorCleanup),
                        React.createElement("b", null, colorCleanupStrength)),
                    React.createElement("span", null, text.colorCleanupHint),
                    React.createElement("input", { "aria-label": "Color cleanup strength", type: "range", min: 1, max: 4, step: 1, value: colorCleanupStrength, onChange: (event) => setColorCleanupStrength(Number(event.target.value)) }),
                    React.createElement("button", { type: "button", onClick: applyColorCleanup, disabled: activeLayer.locked }, text.applyColorCleanup)),
                React.createElement("div", { className: "adjustment-tool-card" },
                    React.createElement("div", { className: "adjustment-tool-heading" },
                        React.createElement("strong", null, text.colorLimit),
                        React.createElement("b", null, layerColorLimit)),
                    React.createElement("span", null, text.colorLimitHint),
                    React.createElement("input", { "aria-label": "Layer color limit", type: "range", min: 2, max: 48, step: 1, value: layerColorLimit, onChange: (event) => setLayerColorLimit(Number(event.target.value)) }),
                    React.createElement("button", { type: "button", onClick: applyLayerColorLimit, disabled: activeLayer.locked }, text.applyColorLimit)))),
            rightTab === 'palette' && (React.createElement(React.Fragment, null,
                React.createElement("section", { className: "panel-section view-section" },
                    React.createElement("h2", null, text.view),
                    React.createElement("div", { className: "view-toggle-grid" },
                        React.createElement("div", { className: "view-shape-toggle", "aria-label": text.beadShape },
                            React.createElement("span", null, text.beadShape),
                            React.createElement("div", null,
                                React.createElement("button", { type: "button", className: project.settings.beadDisplayMode === 'bead' ? 'active' : '', "aria-pressed": project.settings.beadDisplayMode === 'bead', onClick: () => updateProject({ ...project, settings: { ...project.settings, beadDisplayMode: 'bead' } }) },
                                    React.createElement("span", { className: "shape-choice-icon shape-choice-icon-round", "aria-hidden": "true" }),
                                    React.createElement("span", null, text.roundBeads)),
                                React.createElement("button", { type: "button", className: project.settings.beadDisplayMode === 'pixel' ? 'active' : '', "aria-pressed": project.settings.beadDisplayMode === 'pixel', onClick: () => updateProject({ ...project, settings: { ...project.settings, beadDisplayMode: 'pixel' } }) },
                                    React.createElement("span", { className: "shape-choice-icon shape-choice-icon-square", "aria-hidden": "true" }),
                                    React.createElement("span", null, text.squareBeads)))),
                        React.createElement("div", { className: "view-row" },
                            React.createElement("label", { className: "checkline" },
                                React.createElement("input", { type: "checkbox", checked: project.settings.showGrid, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showGrid: event.target.checked } }) }),
                                text.grid),
                            React.createElement("label", { className: "checkline" },
                                React.createElement("input", { type: "checkbox", checked: project.settings.showCoordinates, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showCoordinates: event.target.checked } }) }),
                                text.coordinates)),
                        React.createElement("div", { className: "view-row" },
                            React.createElement("label", { className: "checkline" },
                                React.createElement("input", { type: "checkbox", checked: project.settings.showColorCodes, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showColorCodes: event.target.checked } }) }),
                                text.showColorCodes),
                            React.createElement("label", { className: "checkline" },
                                React.createElement("input", { type: "checkbox", checked: project.settings.showLayerOverlap, onChange: (event) => updateProject({ ...project, settings: { ...project.settings, showLayerOverlap: event.target.checked } }) }),
                                text.layerOverlap)))),
                React.createElement("section", { className: "panel-section hover-section" },
                    React.createElement("h2", null, text.cell),
                    hoverCell ? (React.createElement("span", null,
                        "R",
                        hoverCell.y + 1,
                        " C",
                        hoverCell.x + 1,
                        " - ",
                        getColor(hoverCell.colorId)?.primaryCode ?? text.empty)) : (React.createElement("span", null, text.hoverBoard)))))),
        floatingHelp && (React.createElement("div", { className: "floating-help-tooltip", style: { left: floatingHelp.left, top: floatingHelp.top } }, floatingHelp.text)),
        noticeVisible && (React.createElement("div", { className: "app-notice", role: "status", "aria-live": "polite" }, notice))));
}
function hasAdjustments(adjustments) {
    return (adjustments.brightness !== 0 ||
        adjustments.contrast !== 0 ||
        adjustments.saturation !== 0 ||
        adjustments.temperature !== 0 ||
        adjustments.hue !== 0);
}
function adjustLayerCells(cells, adjustments, activePalette) {
    if (!hasAdjustments(adjustments))
        return cells;
    const cache = new Map();
    return cells.map((colorId) => {
        if (!colorId)
            return null;
        const cached = cache.get(colorId);
        if (cached)
            return cached;
        const color = getColor(colorId);
        if (!color)
            return colorId;
        const adjustedRgb = adjustRgb(color.rgb, adjustments);
        const mapped = nearestPaletteColor(adjustedRgb, activePalette);
        cache.set(colorId, mapped.id);
        return mapped.id;
    });
}
function adjustRgb(rgb, adjustments) {
    const contrastValue = adjustments.contrast * 2.55;
    const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
    const warmed = [
        clampByte(rgb[0] + adjustments.temperature * 1.35),
        clampByte(rgb[1] + adjustments.temperature * 0.28),
        clampByte(rgb[2] - adjustments.temperature * 1.35),
    ];
    const contrasted = warmed.map((channel) => clampByte(contrastFactor * (channel - 128) + 128 + adjustments.brightness * 2.55));
    const hsl = rgbToHsl(contrasted);
    hsl.h = (hsl.h + adjustments.hue + 360) % 360;
    hsl.s = Math.max(0, Math.min(1, hsl.s * (1 + adjustments.saturation / 100)));
    return hslToRgb(hsl.h, hsl.s, hsl.l);
}
function mergeCloseLayerColors(cells, activePalette, strength) {
    const stats = collectLayerColorStats(cells, activePalette);
    if (stats.length < 2)
        return { cells, changed: 0 };
    const level = Math.max(1, Math.min(4, Math.round(strength)));
    const replacements = new Map();
    const sorted = [...stats].sort((a, b) => a.count - b.count);
    sorted.forEach((source) => {
        const target = stats
            .filter((candidate) => candidate.id !== source.id && candidate.count >= source.count)
            .map((candidate) => ({
            candidate,
            distance: colorDistance(source.color.rgb, candidate.color.rgb),
        }))
            .filter((item) => areLayerColorsClose(source.color, item.candidate.color, level))
            .sort((a, b) => {
            const aScore = a.distance - Math.min(18, Math.log2(a.candidate.count + 1) * 2.2);
            const bScore = b.distance - Math.min(18, Math.log2(b.candidate.count + 1) * 2.2);
            return aScore - bScore;
        })[0]?.candidate;
        if (target)
            replacements.set(source.id, replacements.get(target.id) ?? target.id);
    });
    if (replacements.size === 0)
        return { cells, changed: 0 };
    let changed = 0;
    const next = cells.map((colorId) => {
        if (!colorId)
            return null;
        const replacement = replacements.get(colorId);
        if (!replacement || replacement === colorId)
            return colorId;
        changed += 1;
        return replacement;
    });
    return { cells: next, changed };
}
function areLayerColorsClose(from, to, strength) {
    const level = Math.max(1, Math.min(4, Math.round(strength)));
    const fromChroma = rgbChroma(from.rgb);
    const toChroma = rgbChroma(to.rgb);
    const fromLum = rgbLuminance(from.rgb);
    const toLum = rgbLuminance(to.rgb);
    const fromHsl = rgbToHsl(from.rgb);
    const toHsl = rgbToHsl(to.rgb);
    const neutral = fromChroma < 34 && toChroma < 34;
    const vivid = fromChroma > 72 || toChroma > 72;
    const luminanceGap = Math.abs(fromLum - toLum);
    const chromaGap = Math.abs(fromChroma - toChroma);
    const hueGap = Math.min(Math.abs(fromHsl.h - toHsl.h), 360 - Math.abs(fromHsl.h - toHsl.h));
    const distance = colorDistance(from.rgb, to.rgb);
    if (neutral) {
        return distance <= [0, 48, 68, 88, 108][level] && luminanceGap <= [0, 30, 44, 60, 76][level];
    }
    if (vivid && hueGap > [0, 12, 18, 28, 38][level])
        return false;
    if (chromaGap > [0, 30, 44, 60, 76][level])
        return false;
    if (luminanceGap > [0, 34, 50, 68, 84][level])
        return false;
    const distanceLimit = vivid ? [0, 34, 50, 66, 82][level] : [0, 44, 64, 84, 104][level];
    if (distance <= distanceLimit)
        return true;
    return hueGap <= [0, 14, 24, 36, 48][level] && distance <= distanceLimit * 1.18;
}
function limitLayerColors(cells, activePalette, limit) {
    const targetLimit = Math.max(2, Math.min(48, Math.round(limit)));
    const stats = collectLayerColorStats(cells, activePalette);
    if (stats.length <= targetLimit)
        return { cells, changed: 0 };
    const kept = selectLayerColorRepresentatives(stats, targetLimit);
    const keptIds = new Set(kept.map((row) => row.id));
    const keptColors = kept.map((row) => row.color);
    let changed = 0;
    const next = cells.map((colorId) => {
        if (!colorId || keptIds.has(colorId))
            return colorId;
        const color = getColor(colorId);
        if (!color)
            return colorId;
        const replacement = nearestPaletteColor(color.rgb, keptColors).id;
        if (replacement !== colorId)
            changed += 1;
        return replacement;
    });
    return { cells: next, changed };
}
function applyEffectToLayer(cells, activePalette, effect) {
    const cache = new Map();
    let changed = 0;
    const next = cells.map((colorId) => {
        if (!colorId)
            return null;
        const cached = cache.get(colorId);
        if (cached) {
            if (cached !== colorId)
                changed += 1;
            return cached;
        }
        const color = getColor(colorId);
        if (!color)
            return colorId;
        const mapped = nearestPaletteColor(effectRgb(color.rgb, effect), activePalette).id;
        cache.set(colorId, mapped);
        if (mapped !== colorId)
            changed += 1;
        return mapped;
    });
    return { cells: next, changed };
}
function effectRgb(rgb, effect) {
    const luminance = clampByte(rgbLuminance(rgb));
    if (effect === 'invert')
        return [255 - rgb[0], 255 - rgb[1], 255 - rgb[2]];
    if (effect === 'blackWhite') {
        const value = luminance >= 150 ? 255 : 0;
        return [value, value, value];
    }
    return [luminance, luminance, luminance];
}
function collectLayerColorStats(cells, activePalette) {
    const paletteIds = new Set(activePalette.map((color) => color.id));
    const counts = new Map();
    cells.forEach((colorId) => {
        if (!colorId)
            return;
        counts.set(colorId, (counts.get(colorId) ?? 0) + 1);
    });
    return [...counts.entries()]
        .flatMap(([id, count]) => {
        const color = getColor(id);
        if (!color)
            return [];
        const normalized = paletteIds.has(id) ? color : nearestPaletteColor(color.rgb, activePalette);
        return [{ id, color: normalized, count }];
    })
        .sort((a, b) => b.count - a.count);
}
function selectLayerColorRepresentatives(stats, limit) {
    const kept = [stats[0]];
    const keptIds = new Set([stats[0].id]);
    while (kept.length < limit) {
        const next = stats
            .filter((row) => !keptIds.has(row.id))
            .map((row) => {
            const nearestDistance = Math.min(...kept.map((item) => colorDistance(row.color.rgb, item.color.rgb)));
            const chroma = rgbChroma(row.color.rgb);
            const luminance = rgbLuminance(row.color.rgb);
            const accentBoost = chroma > 70 || luminance < 42 ? 1.8 : chroma > 45 ? 1.25 : 1;
            const score = Math.sqrt(row.count) * Math.max(0.4, nearestDistance / 18) * accentBoost;
            return { row, score };
        })
            .sort((a, b) => b.score - a.score)[0]?.row;
        if (!next)
            break;
        kept.push(next);
        keptIds.add(next.id);
    }
    return kept;
}
function rgbChroma(rgb) {
    return Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]);
}
function rgbLuminance(rgb) {
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}
function rgbToHsl([r, g, b]) {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    if (max === min)
        return { h: 0, s: 0, l: lightness };
    const delta = max - min;
    const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    let hue = 0;
    if (max === red)
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
    else if (max === green)
        hue = (blue - red) / delta + 2;
    else
        hue = (red - green) / delta + 4;
    return { h: hue * 60, s: saturation, l: lightness };
}
function hslToRgb(hue, saturation, lightness) {
    if (saturation === 0) {
        const value = clampByte(lightness * 255);
        return [value, value, value];
    }
    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;
    const hk = hue / 360;
    const convert = (t) => {
        let value = t;
        if (value < 0)
            value += 1;
        if (value > 1)
            value -= 1;
        if (value < 1 / 6)
            return p + (q - p) * 6 * value;
        if (value < 1 / 2)
            return q;
        if (value < 2 / 3)
            return p + (q - p) * (2 / 3 - value) * 6;
        return p;
    };
    return [clampByte(convert(hk + 1 / 3) * 255), clampByte(convert(hk) * 255), clampByte(convert(hk - 1 / 3) * 255)];
}
function clampInteger(value, min, max) {
    if (Number.isNaN(value))
        return min;
    return Math.min(max, Math.max(min, Math.round(value)));
}
function ExportIcon() {
    return (React.createElement("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" },
        React.createElement("path", { d: "M10 3v9" }),
        React.createElement("path", { d: "m6.8 8.8 3.2 3.2 3.2-3.2" }),
        React.createElement("path", { d: "M4 13.2v2.6c0 .7.5 1.2 1.2 1.2h9.6c.7 0 1.2-.5 1.2-1.2v-2.6" })));
}
function GitHubIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M12 2.5a9.5 9.5 0 0 0-3 18.5c.48.08.66-.2.66-.46v-1.7c-2.68.58-3.25-1.14-3.25-1.14-.44-1.1-1.07-1.4-1.07-1.4-.88-.6.07-.58.07-.58.97.07 1.48 1 1.48 1 .86 1.47 2.25 1.04 2.8.8.09-.62.34-1.04.61-1.28-2.14-.24-4.39-1.07-4.39-4.76 0-1.05.38-1.91 1-2.58-.1-.25-.43-1.24.1-2.55 0 0 .81-.26 2.66.99a9.16 9.16 0 0 1 4.84 0c1.85-1.25 2.66-.99 2.66-.99.53 1.31.2 2.3.1 2.55.62.67 1 1.53 1 2.58 0 3.7-2.26 4.51-4.4 4.75.35.3.66.9.66 1.81v2.5c0 .26.17.55.67.46A9.5 9.5 0 0 0 12 2.5z" })));
}
function CloseIcon() {
    return (React.createElement("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" },
        React.createElement("path", { d: "M6 6l8 8" }),
        React.createElement("path", { d: "M14 6l-8 8" })));
}
function resizeCells(cells, oldWidth, oldHeight, newWidth, newHeight) {
    const next = Array.from({ length: newWidth * newHeight }, () => null);
    const copyWidth = Math.min(oldWidth, newWidth);
    const copyHeight = Math.min(oldHeight, newHeight);
    for (let y = 0; y < copyHeight; y += 1) {
        for (let x = 0; x < copyWidth; x += 1) {
            next[y * newWidth + x] = cells[y * oldWidth + x] ?? null;
        }
    }
    return next;
}
function LockIcon({ locked }) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("rect", { x: "5.5", y: "10", width: "13", height: "10", rx: "2" }),
        React.createElement("path", { d: locked ? 'M8.5 10V7.7a3.5 3.5 0 017 0V10' : 'M8.5 10V7.7a3.5 3.5 0 016.4-2' })));
}
function PencilIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M4 20l4.6-1 9.8-9.8-3.6-3.6L5 15.4 4 20z" }),
        React.createElement("path", { d: "M13.8 4.6l1.5-1.5c.7-.7 1.8-.7 2.5 0l1.1 1.1c.7.7.7 1.8 0 2.5l-1.5 1.5" })));
}
function DuplicateIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("rect", { x: "8", y: "8", width: "11", height: "11", rx: "2" }),
        React.createElement("path", { d: "M5 16V6.8C5 5.8 5.8 5 6.8 5H16" })));
}
function DragHandleIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M9 5h.1M15 5h.1M9 12h.1M15 12h.1M9 19h.1M15 19h.1" })));
}
function EyeIcon({ visible }) {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M2.8 12s3.3-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.3 5.5-9.2 5.5S2.8 12 2.8 12z" }),
        React.createElement("circle", { cx: "12", cy: "12", r: "2.5" }),
        !visible && React.createElement("path", { d: "M4 4l16 16" })));
}
function TrashIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M4 7h16" }),
        React.createElement("path", { d: "M9 7V4.8h6V7" }),
        React.createElement("path", { d: "M7 7l.8 13h8.4L17 7" }),
        React.createElement("path", { d: "M10 11v5M14 11v5" })));
}
function ResetIcon() {
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M4.5 11a7.5 7.5 0 1 1 2.2 5.3" }),
        React.createElement("path", { d: "M4.5 5.5V11h5.5" })));
}
function ClipboardPreview({ pattern }) {
    const maxSide = Math.max(pattern.width, pattern.height, 1);
    const beadSize = Math.max(3, Math.min(10, Math.floor(76 / maxSide)));
    return (React.createElement("div", { className: "clipboard-preview", style: {
            gridTemplateColumns: `repeat(${pattern.width}, ${beadSize}px)`,
            gridAutoRows: `${beadSize}px`,
        }, "aria-hidden": "true" }, pattern.cells.map((colorId, index) => {
        const color = colorId ? getColor(colorId) : null;
        return React.createElement("span", { key: index, style: { background: color?.hex ?? 'transparent' } });
    })));
}
function ToolIcon({ tool }) {
    if (tool === 'pencil') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M4 20l4.7-1 9.8-9.8-3.7-3.7L5 15.3 4 20z" }),
            React.createElement("path", { d: "M13.8 4.5l1.7-1.7c.7-.7 1.8-.7 2.5 0l1.2 1.2c.7.7.7 1.8 0 2.5l-1.7 1.7" })));
    }
    if (tool === 'eraser') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M4.3 14.6l7.9-7.9c.8-.8 2-.8 2.8 0l4.3 4.3c.8.8.8 2 0 2.8l-5.9 5.9H8.6l-4.3-4.3c-.2-.2-.2-.6 0-.8z" }),
            React.createElement("path", { d: "M9.8 19.7h10" })));
    }
    if (tool === 'fill') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 12.5l6.5-6.5 7 7-6 6c-.8.8-2 .8-2.8 0L5 14.3c-.5-.5-.5-1.3 0-1.8z" }),
            React.createElement("path", { d: "M8.5 8.5l-2-2" }),
            React.createElement("path", { d: "M17.5 17.2c.8 1.1 1.2 1.9 1.2 2.4 0 1-.7 1.6-1.6 1.6s-1.6-.6-1.6-1.6c0-.5.4-1.3 1.2-2.4.2-.3.6-.3.8 0z" })));
    }
    if (tool === 'remove') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 12.5l6.5-6.5 7 7-6 6c-.8.8-2 .8-2.8 0L5 14.3c-.5-.5-.5-1.3 0-1.8z" }),
            React.createElement("path", { d: "M8.5 8.5l-2-2" }),
            React.createElement("path", { d: "M15.5 17.5l4 4M19.5 17.5l-4 4" })));
    }
    if (tool === 'recolor') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M6 7.5h7.2c2.2 0 4 1.8 4 4v.3" }),
            React.createElement("path", { d: "M9 4.5 6 7.5l3 3" }),
            React.createElement("path", { d: "M18 16.5h-7.2c-2.2 0-4-1.8-4-4v-.3" }),
            React.createElement("path", { d: "M15 19.5l3-3-3-3" }),
            React.createElement("path", { d: "M8 16.2c.9 1.2 1.3 2 1.3 2.6 0 1-.7 1.7-1.7 1.7S6 19.8 6 18.8c0-.6.4-1.4 1.3-2.6.2-.3.5-.3.7 0z" })));
    }
    if (tool === 'eyedropper') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M14.8 4.3l4.9 4.9-3.1 3.1-1.5-1.5-7.9 7.9H4.8v-2.4l7.9-7.9-1.1-1.1 3.2-3z" }),
            React.createElement("path", { d: "M5 20h6" })));
    }
    if (tool === 'move') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M12 3v18" }),
            React.createElement("path", { d: "M8.5 6.5 12 3l3.5 3.5" }),
            React.createElement("path", { d: "M8.5 17.5 12 21l3.5-3.5" }),
            React.createElement("path", { d: "M3 12h18" }),
            React.createElement("path", { d: "M6.5 8.5 3 12l3.5 3.5" }),
            React.createElement("path", { d: "M17.5 8.5 21 12l-3.5 3.5" })));
    }
    if (tool === 'copy') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("rect", { x: "8", y: "8", width: "11", height: "11", rx: "2" }),
            React.createElement("path", { d: "M5 16V6.8C5 5.8 5.8 5 6.8 5H16" }),
            React.createElement("path", { d: "M11 12h5M13.5 9.5v5" })));
    }
    if (tool === 'paste') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M9 5h6l1 2h2.2c.9 0 1.8.8 1.8 1.8v9.4c0 1-.8 1.8-1.8 1.8H5.8c-1 0-1.8-.8-1.8-1.8V8.8C4 7.8 4.8 7 5.8 7H8z" }),
            React.createElement("path", { d: "M9 5c0-1.1.8-2 2-2h2c1.2 0 2 .9 2 2" }),
            React.createElement("path", { d: "M8 12h8M8 16h5" })));
    }
    if (tool === 'mirror') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M12 4v16" }),
            React.createElement("path", { d: "M5 7.5h4v9H5z" }),
            React.createElement("path", { d: "M19 7.5h-4v9h4z" }),
            React.createElement("path", { d: "M9 12h6" }),
            React.createElement("path", { d: "M7 5.5 5 7.5l2 2" }),
            React.createElement("path", { d: "M17 5.5l2 2-2 2" })));
    }
    if (tool === 'shape') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M4.5 16.5 9 8.5l4 7.5z" }),
            React.createElement("path", { d: "M13.8 5.2h5v5h-5z" }),
            React.createElement("path", { d: "M14.8 17.4a2.8 2.8 0 1 0 5.6 0 2.8 2.8 0 0 0-5.6 0z" })));
    }
    if (tool === 'text') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 6h14" }),
            React.createElement("path", { d: "M12 6v12" }),
            React.createElement("path", { d: "M8.5 18h7" })));
    }
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M8.5 11.5V6.8a2 2 0 0 1 4 0v4.5" }),
        React.createElement("path", { d: "M12.5 11V5.5a2 2 0 0 1 4 0V12" }),
        React.createElement("path", { d: "M16.5 12V8.2a2 2 0 0 1 4 0v6.3c0 3.8-2.7 6.5-6.7 6.5h-1.5c-2.1 0-3.6-.8-4.9-2.4L4.6 15c-.6-.8-.4-1.9.4-2.4.6-.4 1.4-.3 1.9.2l1.6 1.7v-3z" })));
}
function ShapeOptionIcon({ shape }) {
    if (shape === 'line') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 19 19 5" })));
    }
    if (shape === 'rectangle') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 7h14v10H5z" })));
    }
    if (shape === 'square') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M6.5 6.5h11v11h-11z" })));
    }
    if (shape === 'ellipse') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M4.5 12a7.5 5.2 0 1 0 15 0 7.5 5.2 0 0 0-15 0z" })));
    }
    if (shape === 'circle') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5.5 12a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z" })));
    }
    if (shape === 'triangle') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M12 5 19 18H5z" })));
    }
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M5 12h12" }),
        React.createElement("path", { d: "M13 8l4 4-4 4" })));
}
function ArrowOptionIcon({ arrow }) {
    if (arrow === 'double') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M6 12h12" }),
            React.createElement("path", { d: "M10 8 6 12l4 4" }),
            React.createElement("path", { d: "M14 8l4 4-4 4" })));
    }
    if (arrow === 'block') {
        return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
            React.createElement("path", { d: "M5 9h8V6l6 6-6 6v-3H5z" })));
    }
    return (React.createElement("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" },
        React.createElement("path", { d: "M5 12h12" }),
        React.createElement("path", { d: "M13 8l4 4-4 4" })));
}
//# sourceMappingURL=App.js.map