import type {
	ChangeCategory,
	ChangedFile,
	DiffViewMode,
} from "../../../shared/changes-types";
import { createStore, produce } from "solid-js/store";
import { createEffect, createSignal, onMount } from "solid-js";
import { getWindowId } from "../../contexts/WindowContext";

type FileListViewMode = "grouped" | "tree";

interface SelectedFileState {
	file: ChangedFile;
	category: ChangeCategory;
	commitHash: string | null;
}

interface ChangesState {
	selectedFiles: Record<string, SelectedFileState | null>;
	viewMode: DiffViewMode;
	fileListViewMode: FileListViewMode;
	expandedSections: Record<ChangeCategory, boolean>;
	baseBranch: string | null;
	showRenderedMarkdown: Record<string, boolean>;
}

const STORAGE_KEY = () => `${getWindowId()}:changes-store`;
const LEGACY_KEY = "changes-store";

const initialState: ChangesState = {
	selectedFiles: {},
	viewMode: "side-by-side",
	fileListViewMode: "grouped",
	expandedSections: {
		"against-base": true,
		committed: true,
		staged: true,
		unstaged: true,
	},
	baseBranch: null,
	showRenderedMarkdown: {},
};

// Load initial state from localStorage with migrations
function loadPersistedState(): ChangesState {
	if (typeof window === "undefined") return initialState;

	try {
		const windowKey = STORAGE_KEY();
		let stored = localStorage.getItem(windowKey);

		// Migration 1: Check for old numeric window ID keys
		if (!stored && windowKey.startsWith("main:")) {
			for (let i = 0; i < localStorage.length; i++) {
				const storageKey = localStorage.key(i);
				if (!storageKey) continue;

				const match = storageKey.match(/^(\d+):changes-store$/);
				if (match) {
					const numericData = localStorage.getItem(storageKey);
					if (numericData) {
						localStorage.setItem(windowKey, numericData);
						stored = numericData;
						console.log(`[ChangesStore] Migrated from numeric ID: ${storageKey} to ${windowKey}`);
						break;
					}
				}
			}
		}

		// Migration 2: Check legacy key
		if (!stored && localStorage.getItem(LEGACY_KEY)) {
			const legacyData = localStorage.getItem(LEGACY_KEY);
			if (legacyData) {
				localStorage.setItem(windowKey, legacyData);
				stored = legacyData;
				console.log(`[ChangesStore] Migrated ${LEGACY_KEY} to ${windowKey}`);
			}
		}

		if (stored) {
			const parsed = JSON.parse(stored);
			return { ...initialState, ...parsed };
		}
	} catch {
		// Ignore parse errors
	}

	return initialState;
}

const [store, setStore] = createStore<ChangesState>(loadPersistedState());

// Persist to localStorage on changes
function persistState() {
	if (typeof window === "undefined") return;
	const toPersist = {
		selectedFiles: store.selectedFiles,
		viewMode: store.viewMode,
		fileListViewMode: store.fileListViewMode,
		expandedSections: store.expandedSections,
		baseBranch: store.baseBranch,
		showRenderedMarkdown: store.showRenderedMarkdown,
	};
	localStorage.setItem(STORAGE_KEY(), JSON.stringify(toPersist));
}

// Actions
const actions = {
	selectFile: (
		worktreePath: string,
		file: ChangedFile | null,
		category?: ChangeCategory,
		commitHash?: string | null,
	) => {
		setStore("selectedFiles", worktreePath, file
			? {
					file,
					category: category ?? "against-base",
					commitHash: commitHash ?? null,
				}
			: null,
		);
		persistState();
	},

	getSelectedFile: (worktreePath: string): SelectedFileState | null => {
		return store.selectedFiles[worktreePath] ?? null;
	},

	setViewMode: (mode: DiffViewMode) => {
		setStore("viewMode", mode);
		persistState();
	},

	setFileListViewMode: (mode: FileListViewMode) => {
		setStore("fileListViewMode", mode);
		persistState();
	},

	toggleSection: (section: ChangeCategory) => {
		setStore("expandedSections", section, (prev) => !prev);
		persistState();
	},

	setSectionExpanded: (section: ChangeCategory, expanded: boolean) => {
		setStore("expandedSections", section, expanded);
		persistState();
	},

	setBaseBranch: (branch: string | null) => {
		setStore("baseBranch", branch);
		persistState();
	},

	toggleRenderedMarkdown: (worktreePath: string) => {
		setStore("showRenderedMarkdown", worktreePath, (prev) => !prev);
		persistState();
	},

	getShowRenderedMarkdown: (worktreePath: string): boolean => {
		return store.showRenderedMarkdown[worktreePath] ?? false;
	},

	reset: (worktreePath: string) => {
		setStore("selectedFiles", worktreePath, null);
		persistState();
	},
};

export function useChangesStore() {
	return {
		get selectedFiles() { return store.selectedFiles; },
		get viewMode() { return store.viewMode; },
		get fileListViewMode() { return store.fileListViewMode; },
		get expandedSections() { return store.expandedSections; },
		get baseBranch() { return store.baseBranch; },
		get showRenderedMarkdown() { return store.showRenderedMarkdown; },
		...actions,
	};
}

// For direct store access
export function getChangesState() {
	return store;
}
